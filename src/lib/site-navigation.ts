/**
 * The site's navigation surface, in one place.
 *
 * The header, the footer and the agent-Markdown "Site navigation" block all
 * derive from this module — one source, no drift.
 *
 * ⚠️ Every path here must resolve to a page that exists, and every new
 * top-level route needs its `src/middleware.ts` allowlist entry too — without
 * it the page works in dev and 404s in production.
 *
 * Migration note (Task 7): the surface is intentionally minimal while the
 * Cabuya pages are built. Entries return as their routes ship:
 * /developers (Task 23), /registry (Task 28), /governance + /join (Task 30).
 */
import { getUrlPrefix, isValidLanguage, type Language } from '@/lib/i18n';

export const GITHUB_URL = 'https://github.com/Cabuya/cabuya.org';

export interface NavEntry {
  label: Record<string, string>;
  /** Site-root-relative path, or an absolute URL when `external`. */
  path: string;
  external?: boolean;
  /** True when the live header exposes this entry. */
  inChrome?: boolean;
}

export const NAV_ENTRIES: NavEntry[] = [
  {
    label: { en: 'Home', es: 'Inicio' },
    path: '/',
    inChrome: true,
  },
  {
    label: { en: 'GitHub', es: 'GitHub' },
    path: GITHUB_URL,
    external: true,
    inChrome: true,
  },
];

/** Prefix a site-relative path for a language (external URLs pass through). */
export function navHref(entry: NavEntry, lang: Language): string {
  if (entry.external) return entry.path;
  const language = isValidLanguage(lang) ? lang : 'es';
  const prefix = getUrlPrefix(language);
  if (entry.path === '/') return prefix || '/';
  return `${prefix}${entry.path}`;
}
