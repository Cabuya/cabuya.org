/**
 * Language-prefixing for links inside rendered Markdown bodies.
 *
 * The normative specification is one set of files, rendered under both language
 * trees — English prose either way, with a notice saying so. Its cross-
 * references are written the only way a *standalone, extractable* document can
 * write them: root-relative and canonical, `/developers/spec/0.1/1-architecture`.
 *
 * That is correct in the bounded spec directory, which is CC0 and must stay
 * copyable without a build step. It is wrong once rendered under `/es`, where
 * every §-reference in the introduction's table of contents silently drops a
 * Spanish reader out of `/es` and into the English tree — while the previous/
 * next nav at the foot of the same page, built from `getUrlPrefix`, keeps them
 * in it. The page disagreed with itself.
 *
 * Found by `scripts/audit-language-links.mjs`: eleven links on
 * `/es/developers/spec/0.1/0-introduction/` alone. `lang:check` was green
 * throughout — the page *is* in the language its URL promises; it is the
 * destinations that were not.
 *
 * Rewriting at render time rather than in the source keeps the boundary intact
 * (B2): the spec directory is still read-only to the site, and an extracted
 * copy still carries canonical links.
 */

import { getUrlPrefix, type Language } from './i18n';

/**
 * Routes served once for the whole site, which must never be prefixed.
 *
 * `/404` is emitted as a single `404.html` the host serves for any unmatched
 * path; the agent indexes and the machine-readable descriptors are single
 * documents by design.
 */
const LANGUAGE_NEUTRAL = [
  '/404',
  '/llms.txt',
  '/llms-full.txt',
  '/robots.txt',
  '/openapi.json',
  '/sitemap-index.xml',
];

/** Assets and endpoints that exist once, whatever the reader's language. */
const NEVER_PREFIXED = [/^\/images\//, /^\/api\//, /^\/badge\//, /^\/_astro\//];

/** Should this root-relative href gain the language prefix? */
function shouldPrefix(href: string): boolean {
  const path = href.split('#')[0].split('?')[0] || '/';
  if (LANGUAGE_NEUTRAL.includes(path.replace(/\/$/, ''))) return false;
  if (NEVER_PREFIXED.some((pattern) => pattern.test(path))) return false;
  return true;
}

/**
 * Prefix every site-internal link in a rendered HTML fragment with the
 * language's URL prefix.
 *
 * A no-op for English, whose prefix is empty. Absolute URLs, anchors,
 * `mailto:`, protocol-relative links and hrefs already under `/es` are left
 * alone — the last so the function is idempotent, which matters because a
 * fragment can pass through more than one layout.
 */
export function localizeInternalLinks(html: string, lang: Language): string {
  const prefix = getUrlPrefix(lang);
  if (!prefix) return html;

  return html.replace(
    /(<a\b[^>]*?\shref=")(\/[^"]*)(")/gi,
    (match, open: string, href: string, close: string) => {
      if (href.startsWith('//')) return match; // protocol-relative
      if (href === prefix || href.startsWith(`${prefix}/`)) return match;
      if (!shouldPrefix(href)) return match;
      return `${open}${prefix}${href}${close}`;
    }
  );
}
