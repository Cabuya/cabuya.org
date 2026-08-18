/**
 * Astro middleware to serve custom 404 page for unknown routes.
 * Rewrites requests for non-existent paths to /404 so the custom 404 page is displayed
 * instead of the browser's "invalid response" error in dev mode.
 *
 * ⚠️  CRITICAL — READ BEFORE ADDING NEW TOP-LEVEL ROUTES ⚠️
 *
 * This middleware uses a HARDCODED ALLOWLIST (`KNOWN_PATHS`). Single-segment paths NOT in the allowlist are rewritten
 * to /404 — even if the corresponding `src/pages/<name>/index.astro` exists.
 *
 * Symptoms when forgotten:
 *   - `/<your-route>` returns 404 in dev AND prod
 *   - `/<your-route>/<sub>` works fine (multi-segment paths bypass the rule)
 *   - `/<your-route>/index.html` works (paths containing "." bypass the rule)
 *   - Dev server logs show: `[404] (rewrite) /<your-route>` — the
 *     "(rewrite)" is the smoking gun: it's THIS middleware, not Astro routing
 *
 * When adding a new top-level page (e.g. `src/pages/foo.astro` or
 * `src/pages/foo/index.astro`):
 *   1. Add `'foo'` to KNOWN_PATHS below
 *   2. Language-prefixed URLs (`/es/foo`) validate the same set — nothing
 *      extra to add
 *
 * Do NOT debug Astro routing, file-system caches, or `[...slug]` vs `[slug]`
 * before checking this allowlist first.
 *
 * Cabuya migration note (Task 7):
 *   Every retired route (blog, ecosystem, channels, contact, the seven
 *   institutional pages, movement, …) 301s in `public/_redirects` to its
 *   closest surviving surface. Route slugs stay English in both languages;
 *   the EN-at-root [lang] topology (Task 8) validates language-prefixed
 *   URLs against the same KNOWN_PATHS set.
 */
import { defineMiddleware } from 'astro:middleware';

import { isValidLanguage } from '@/lib/i18n';

/**
 * Top-level route allowlist (English, unprefixed — D-W1). Language-prefixed
 * URLs (`/es/...`) validate the SAME set: slugs are English in every
 * language, so one list serves all languages.
 *
 * Cabuya routes are added here as their tasks land:
 *   'developers' landed with Task 23; 'registry' with Task 28; 'governance',
 *   'trademark', 'join', 'changelog' and 'rfcs' with Task 30.
 */
const KNOWN_PATHS = new Set([
  '',
  'internal',
  '404',
  'about',
  'developers',
  'registry',
  'governance',
  'trademark',
  'join',
  'changelog',
  'rfcs',
]);

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;

  // Skip Vite/Astro internal paths (HMR, assets, etc.)
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/__vite') ||
    pathname.startsWith('/@') ||
    pathname.includes('.')
  ) {
    return next();
  }

  const segments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);

  // A leading valid language code shifts the check to the next segment
  // (`/es` → home, `/es/foo` → validate `foo`). The default language has no
  // prefix, so bare segments validate directly.
  const [first, second] = segments;
  const isLangPrefixed = first !== undefined && isValidLanguage(first);

  if (segments.length === 1) {
    if (isLangPrefixed || KNOWN_PATHS.has(first)) return next();
    return context.rewrite(new URL('/404', context.url));
  }

  if (segments.length === 2 && isLangPrefixed && !KNOWN_PATHS.has(second)) {
    return context.rewrite(new URL('/404', context.url));
  }

  return next();
});
