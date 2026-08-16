import { type CollectionEntry, getCollection } from 'astro:content';

import {
  ECOSYSTEM_CATEGORIES,
  type EcosystemCategory,
  sortEcosystemApps,
} from '@/lib/ecosystem-apps';
import {
  type EcosystemAppView,
  formatEcosystemDisplayUrl,
  pickEcosystemI18n,
} from '@/lib/ecosystem-view';
import type { Language } from '@/lib/i18n';

export type {
  EcosystemAppView,
  EcosystemAvailability,
} from '@/lib/ecosystem-view';
export {
  formatEcosystemDisplayUrl,
  resolveEcosystemDevelopersUrl,
} from '@/lib/ecosystem-view';

export type EcosystemApp = CollectionEntry<'ecosystemApps'>;

/** Flatten a collection entry for the hydrated explorer. */
export function toEcosystemAppView(
  entry: EcosystemApp,
  lang: Language
): EcosystemAppView {
  const d = entry.data;
  const integrations = d.integrations ?? {};
  const apiDocsUrl = integrations.apiDocsUrl ?? d.apiDocsUrl;

  return {
    id: entry.id,
    name: d.name,
    url: d.url,
    displayUrl: formatEcosystemDisplayUrl(d.url),
    category: d.category,
    featured: d.featured === true,
    logo: d.logo,
    logoAuthorization: d.logoAuthorization,
    monogram: d.monogram,
    tagline: d.tagline[lang],
    what: d.what[lang],
    how: d.how[lang],
    overview: pickEcosystemI18n(d.overview, lang) ?? d.what[lang],
    features: (d.features ?? []).map((f) => f[lang]),
    tools: (d.tools ?? []).map((t) => t[lang]),
    audience: pickEcosystemI18n(d.audience, lang),
    coverage: pickEcosystemI18n(d.coverage, lang),
    limits: pickEcosystemI18n(d.limits, lang),
    integrations: {
      publicApi: integrations.publicApi ?? 'unknown',
      publicMcp: integrations.publicMcp ?? 'unknown',
      apiDocsUrl,
      openApiUrl: integrations.openApiUrl,
      mcpUrl: integrations.mcpUrl,
      developersUrl: integrations.developersUrl,
      notes: pickEcosystemI18n(integrations.notes, lang),
    },
  };
}

/** Active apps, featured first, then order, then name. */
export async function getEcosystemApps(): Promise<EcosystemApp[]> {
  const all = await getCollection('ecosystemApps');
  const active = all.filter((e) => e.data.active !== false);
  const byName = new Map(active.map((e) => [e.data.name, e]));
  const sortedMeta = sortEcosystemApps(
    active.map((entry) => ({
      name: entry.data.name,
      url: entry.data.url,
      category: entry.data.category,
      featured: entry.data.featured,
      order: entry.data.order,
      active: entry.data.active,
    }))
  );
  return sortedMeta.map((m) => byName.get(m.name)!);
}

export async function loadEcosystemDirectory(): Promise<{
  featured: EcosystemApp | undefined;
  groups: Record<EcosystemCategory, EcosystemApp[]>;
}> {
  const apps = await getEcosystemApps();
  const featured = apps.find((e) => e.data.featured === true);
  const groups = Object.fromEntries(
    ECOSYSTEM_CATEGORIES.map((c) => [c, [] as EcosystemApp[]])
  ) as Record<EcosystemCategory, EcosystemApp[]>;
  for (const app of apps) {
    if (app.data.featured) continue;
    groups[app.data.category].push(app);
  }
  return { featured, groups };
}

export async function loadEcosystemDirectoryViews(lang: Language): Promise<{
  featured: EcosystemAppView | undefined;
  groups: Record<EcosystemCategory, EcosystemAppView[]>;
  all: EcosystemAppView[];
}> {
  const { featured, groups } = await loadEcosystemDirectory();
  const groupViews = Object.fromEntries(
    ECOSYSTEM_CATEGORIES.map((c) => [
      c,
      groups[c].map((e) => toEcosystemAppView(e, lang)),
    ])
  ) as Record<EcosystemCategory, EcosystemAppView[]>;
  const featuredView = featured
    ? toEcosystemAppView(featured, lang)
    : undefined;
  const all = [
    ...(featuredView ? [featuredView] : []),
    ...ECOSYSTEM_CATEGORIES.flatMap((c) => groupViews[c]),
  ];
  return { featured: featuredView, groups: groupViews, all };
}

/** Labels needed to serialize an app block for `.md` twins. */
export interface EcosystemMarkdownLabels {
  whatLabel: string;
  howLabel: string;
  overview: string;
  features: string;
  tools: string;
  publicApi: string;
  publicMcp: string;
  limits: string;
}

/** Rich markdown block for one ecosystem app (agent twin). */
export function formatEcosystemAppMarkdown(
  entry: EcosystemApp,
  lang: Language,
  labels: EcosystemMarkdownLabels
): string {
  const d = entry.data;
  const integrations = d.integrations ?? {};
  const apiUrl = integrations.apiDocsUrl ?? d.apiDocsUrl;
  const api = apiUrl ? ` · API: ${apiUrl}` : '';
  const mcp = integrations.mcpUrl ? ` · MCP: ${integrations.mcpUrl}` : '';
  const lines = [
    `- **${d.name}** — ${d.url}${api}${mcp}`,
    `  - ${labels.whatLabel} ${d.what[lang]}`,
    `  - ${labels.howLabel} ${d.how[lang]}`,
  ];
  if (d.overview?.[lang]) {
    lines.push(`  - ${labels.overview}: ${d.overview[lang]}`);
  }
  if ((d.features ?? []).length > 0) {
    lines.push(
      `  - ${labels.features}: ${d.features.map((f) => f[lang]).join('; ')}`
    );
  }
  if ((d.tools ?? []).length > 0) {
    lines.push(
      `  - ${labels.tools}: ${d.tools.map((x) => x[lang]).join('; ')}`
    );
  }
  lines.push(
    `  - ${labels.publicApi}: ${integrations.publicApi ?? 'unknown'} · ${labels.publicMcp}: ${integrations.publicMcp ?? 'unknown'}`
  );
  if (d.limits?.[lang]) {
    lines.push(`  - ${labels.limits}: ${d.limits[lang]}`);
  }
  return lines.join('\n');
}
