/**
 * Astro middleware to serve custom 404 page for unknown routes.
 * Rewrites requests for non-existent paths to /404 so the custom 404 page is displayed
 * instead of the browser's "invalid response" error in dev mode.
 *
 * ⚠️  CRITICAL — READ BEFORE ADDING NEW TOP-LEVEL ROUTES ⚠️
 *
 * This middleware uses a HARDCODED ALLOWLIST (`KNOWN_ROOT_PATHS` and
 * `KNOWN_EN_PATHS`). Single-segment paths NOT in the allowlist are rewritten
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
 *   1. Add `'foo'` to KNOWN_ROOT_PATHS below
 *   2. If the page also has an English version at `src/pages/en/foo*`,
 *      add `'foo'` to KNOWN_EN_PATHS too
 *
 * Do NOT debug Astro routing, file-system caches, or `[...slug]` vs `[slug]`
 * before checking this allowlist first.
 *
 * Cabuya migration note (Task 7):
 *   Every retired Corag route (blog, ecosystem, channels, contact, the seven
 *   institutional pages, movement, …) 301s in `public/_redirects` to its
 *   closest surviving surface. Route slugs stay English in both languages;
 *   the EN-at-root [lang] topology arrives in Task 8 and replaces the
 *   KNOWN_EN_PATHS mechanism.
 */
import { defineMiddleware } from 'astro:middleware';

const KNOWN_ROOT_PATHS = new Set([
  '',
  'en',
  'internal',
  '404',
  // Cabuya routes are added here as their tasks land:
  // 'developers' (Task 23) · 'registry' (Task 28) · 'rfcs', 'changelog',
  // 'governance', 'trademark', 'join' (Task 30). Task 8 replaces the /en
  // handling with the [lang] topology.
]);

const KNOWN_EN_PATHS = new Set(['']);

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

  // Single-segment paths at root (e.g. /sdfsd) that don't match known routes
  if (segments.length === 1 && !KNOWN_ROOT_PATHS.has(segments[0])) {
    return context.rewrite(new URL('/404', context.url));
  }

  // /en/xxx when xxx is not a known English route
  if (
    segments.length === 2 &&
    segments[0] === 'en' &&
    !KNOWN_EN_PATHS.has(segments[1])
  ) {
    return context.rewrite(new URL('/404', context.url));
  }

  return next();
});
