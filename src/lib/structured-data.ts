/**
 * Structured data: the builders, and the inventory that says where each goes.
 *
 * Two things live here and the second is the point.
 *
 * The **builders** compose the JSON-LD graphs. Nothing surprising — they exist
 * so a shape is written once rather than inline on each page, and so a change
 * to how the project describes itself is one edit.
 *
 * The **inventory** is a declaration of which types each kind of page must
 * emit, and it is read by two consumers: nothing at render time, and
 * `seo:check` at build time. That asymmetry is deliberate. A page cannot be
 * made to emit the right graph by a table — somebody has to write the emitter —
 * but a page that *stops* emitting it can be caught, and that is the failure
 * that actually happens: structured data is invisible in every browser, so a
 * regression in it is invisible in review.
 *
 * ## What is deliberately not claimed
 *
 * No `Review`, no `AggregateRating`, no `Offer`. The registry lists
 * applications and measures feeds; it does not rate anybody, and emitting a
 * rating type would be the machine-readable version of the endorsement the
 * registry page spends two paragraphs refusing to make.
 *
 * `Dataset` on the registry is the one type that makes a strong claim, and it
 * is the one the page can back: the registry *is* a dataset, it is CC0, and the
 * distribution URL it names serves the actual data.
 */
import type { Language } from './i18n';

export interface BreadcrumbStep {
  name: string;
  /** Absolute URL. The last step may omit it — it is the current page. */
  url?: string;
}

/**
 * `BreadcrumbList` from the trail a page already renders.
 *
 * Built from the same array the visual breadcrumb uses, never from a second
 * one. A structured trail that disagrees with the visible one is worse than no
 * structured trail: search results would show a path a reader cannot follow.
 */
export function breadcrumbList(
  steps: BreadcrumbStep[]
): Record<string, unknown> | null {
  // A single step is the page itself. A one-item breadcrumb is not a trail and
  // Google ignores it, so emitting one is noise.
  if (steps.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: steps.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      ...(step.url ? { item: step.url } : {}),
    })),
  };
}

export interface RegistryDatasetInput {
  siteUrl: string;
  lang: Language;
  name: string;
  description: string;
  /** How many publisher entries the registry holds today. */
  publisherCount: number;
  /** The repository, which is where the data actually lives. */
  repositoryUrl: string;
}

/**
 * `Dataset` for the registry.
 *
 * The registry is a dataset in the ordinary sense — a set of records, with a
 * licence, at a stable location — and describing it as one is what lets a data
 * catalogue index it. Three fields carry the weight:
 *
 * - **`license`** is the CC0 deed URL, not a name. A licence a machine cannot
 *   resolve is a licence a machine must treat as absent.
 * - **`distribution`** points at the repository and at the live status
 *   endpoint, because those are where the data is. The HTML page is a view.
 * - **`isAccessibleForFree`** is stated because the alternative is a consumer
 *   assuming otherwise, and the whole point of the registry is that reading it
 *   costs nothing and needs nobody's permission.
 */
export function registryDataset(
  input: RegistryDatasetInput
): Record<string, unknown> {
  const { siteUrl, lang, name, description, publisherCount, repositoryUrl } =
    input;
  const prefix = lang === 'es' ? '/es' : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: `${siteUrl}${prefix}/registry`,
    inLanguage: lang,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'Cabuya',
      url: siteUrl,
    },
    /*
     * Keywords a catalogue would index this under, in English because that is
     * what a catalogue's vocabulary is. The Spanish page carries the same list:
     * they are index terms, not prose.
     */
    keywords: [
      'humanitarian aid',
      'interoperability',
      'open standard',
      'emergency response',
      'Colombia',
      'conformance',
    ],
    variableMeasured: `${publisherCount} publisher entries with measured conformance state`,
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Registry entries (CC0 JSON, one file per publisher)',
        contentUrl: `${repositoryUrl}/tree/main/registry`,
        encodingFormat: 'application/json',
      },
      {
        '@type': 'DataDownload',
        name: 'Measured conformance state, live',
        contentUrl: `${siteUrl}/registry/status.json`,
        encodingFormat: 'application/json',
      },
    ],
  };
}

/**
 * Which JSON-LD types each kind of page must emit.
 *
 * Read by `seo:check`, which classifies every built page by its URL and fails
 * when a required type is missing. `WebSite` and `Organization` are sitewide
 * and asserted separately.
 *
 * Order matters only for readability. The patterns are tried in order and the
 * first match wins, so the more specific ones come first.
 */
export const JSONLD_MATRIX: Array<{
  /** A human name, used in the gate's output. */
  kind: string;
  /** Matched against the route with any language prefix removed. */
  pattern: RegExp;
  required: string[];
}> = [
  {
    kind: 'specification section',
    pattern: /^\/developers\/spec\/[\d.]+\/[^/]+$/,
    required: ['TechArticle', 'BreadcrumbList'],
  },
  {
    kind: 'schema reference',
    pattern: /^\/developers\/schemas\/[\d.]+\/[^/]+$/,
    required: ['SoftwareSourceCode', 'BreadcrumbList'],
  },
  {
    kind: 'RFC',
    pattern: /^\/rfcs\/\d+$/,
    required: ['TechArticle', 'BreadcrumbList'],
  },
  {
    kind: 'FAQ',
    pattern: /^\/developers\/faq$/,
    required: ['FAQPage', 'BreadcrumbList'],
  },
  {
    kind: 'general FAQ',
    pattern: /^\/faq$/,
    required: ['FAQPage', 'BreadcrumbList'],
  },
  {
    kind: 'registry index',
    pattern: /^\/registry$/,
    required: ['Dataset'],
  },
  {
    kind: 'registry publisher',
    pattern: /^\/registry\/[^/]+$/,
    required: ['BreadcrumbList'],
  },
  {
    kind: 'portal page',
    pattern: /^\/developers\/[^/]+$/,
    required: ['BreadcrumbList'],
  },
];

/** Strip the language prefix and the trailing slash, so one rule covers both. */
export function normalizeRoute(route: string): string {
  const bare = route.replace(/^\/(es)(?=\/|$)/, '') || '/';
  return bare === '/' ? '/' : bare.replace(/\/$/, '');
}

/** The types a route must emit, or an empty list when nothing is required. */
export function requiredTypesFor(route: string): {
  kind: string;
  required: string[];
} | null {
  const path = normalizeRoute(route);
  const entry = JSONLD_MATRIX.find(({ pattern }) => pattern.test(path));
  return entry ? { kind: entry.kind, required: entry.required } : null;
}
