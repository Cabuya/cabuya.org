import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  formatEcosystemAppMarkdown,
  loadEcosystemDirectory,
} from '@/lib/ecosystem';
import { ECOSYSTEM_CATEGORIES } from '@/lib/ecosystem-apps';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export const GET: APIRoute = async () => {
  const lang = 'es';
  const t = getTranslations(lang).ecosystemPage;
  const { featured, groups } = await loadEcosystemDirectory();
  const mdLabels = {
    whatLabel: t.whatLabel,
    howLabel: t.howLabel,
    overview: t.overview,
    features: t.features,
    tools: t.tools,
    publicApi: t.publicApi,
    publicMcp: t.publicMcp,
    limits: t.limits,
  };

  const sections = [
    {
      heading: t.featuredEyebrow,
      lines: featured
        ? [formatEcosystemAppMarkdown(featured, lang, mdLabels)]
        : [],
    },
    ...ECOSYSTEM_CATEGORIES.map((category) => ({
      heading: t.categories[category],
      lines: groups[category].map((app) =>
        formatEcosystemAppMarkdown(app, lang, mdLabels)
      ),
    })),
    {
      heading: t.joinTitle,
      lines: [t.joinLead, t.disclosure],
    },
  ];

  const markdown = serializeGenericToMarkdown({
    title: `${t.title} — Corag`,
    description: t.description,
    lang,
    canonical: `${SITE_URL}/ecosystem`,
    body: `${t.headline}\n\n${t.lead}`,
    sections,
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
