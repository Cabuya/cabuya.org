/**
 * Which JSON-LD types each kind of page must emit — the gate's copy.
 *
 * A mirror of `JSONLD_MATRIX` in `src/lib/structured-data.ts`, for the same
 * reason other gate helpers mirror their modules: the gate runs under plain
 * Node against `dist/`, and the site's copy is TypeScript that imports Astro's
 * environment. A test asserts the two agree, which is what makes duplicating
 * them safe rather than merely convenient.
 *
 * ## Why the assertion is worth having at all
 *
 * Structured data is invisible. Nothing in a browser shows it, no page looks
 * wrong without it, and a reviewer reading a diff that removes an emitter sees
 * a deleted line rather than a lost rich result. It is exactly the kind of
 * thing that decays silently — which is what happened to the version of this
 * list that shipped with the site: it still described `meetups`, `speakers` and
 * `blog` routes from the Corag era, so it matched nothing and asserted nothing.
 */

export const JSONLD_MATRIX = [
  {
    kind: 'specification section',
    pattern: /^developers\/spec\/[\d.]+\/[^/]+$/,
    required: ['TechArticle', 'BreadcrumbList'],
  },
  {
    kind: 'schema reference',
    pattern: /^developers\/schemas\/[\d.]+\/[^/]+$/,
    required: ['SoftwareSourceCode', 'BreadcrumbList'],
  },
  {
    kind: 'RFC',
    pattern: /^rfcs\/\d+$/,
    required: ['TechArticle', 'BreadcrumbList'],
  },
  {
    kind: 'FAQ',
    pattern: /^developers\/faq$/,
    required: ['FAQPage', 'BreadcrumbList'],
  },
  {
    kind: 'registry index',
    pattern: /^registry$/,
    required: ['Dataset'],
  },
  {
    kind: 'registry publisher',
    pattern: /^registry\/[^/]+$/,
    required: ['BreadcrumbList'],
  },
  {
    kind: 'portal page',
    pattern: /^developers\/[^/]+$/,
    required: ['BreadcrumbList'],
  },
];

/**
 * Types required on every page, whatever it is.
 *
 * `WebSite` and `Organization` come from the shared head. They are listed here
 * rather than assumed so that a change to the head that drops one is a gate
 * failure and not a discovery six months later.
 */
export const SITEWIDE_TYPES = ['WebSite', 'Organization'];

/** Strip the language prefix, so one rule covers every language. */
export function normalizeRoute(pagePath) {
  const bare = pagePath.replace(/^(es|en)(?=\/|$)\/?/, '');
  return bare.replace(/\/$/, '');
}

/** What this route must emit, beyond the sitewide pair. */
export function requiredTypesFor(pagePath) {
  const path = normalizeRoute(pagePath);
  const entry = JSONLD_MATRIX.find(({ pattern }) => pattern.test(path));
  return entry ?? null;
}
