/**
 * Where a page's Markdown twin lives.
 *
 * Two shapes, decided by how Astro emits the endpoint:
 *
 *   a leaf page      `developers/quickstart.md.ts`      → `/developers/quickstart.md`
 *   a section index  `developers/spec/index.md.ts`      → `/developers/spec/index.md`
 *
 * The layout used to assume the first shape for everything —
 * `` `${pathname.replace(/\/$/, '')}.md` `` — which is right for a leaf and
 * wrong for every section index. `/developers/` linked to `/developers.md`,
 * which is not a file. Ten "View as Markdown" links across both languages
 * pointed at a 404, on the surface built specifically for agents, and nothing
 * caught it: `md:check` verifies that each page *has* a complete twin, not
 * that the link the page renders resolves to it.
 *
 * Found in the Task 50 review by walking every internal href in `dist/`.
 */

/**
 * Route prefixes served by an `index.md.ts` endpoint.
 *
 * Language-agnostic — the `[lang]` tree mirrors the root tree exactly, so a
 * `/es` prefix is stripped before matching rather than doubling this list.
 *
 * Kept in step with `src/pages/**\/index.md.ts` by
 * `tests/unit/lib/twin-url.test.ts`, which globs the pages directory and fails
 * when the two disagree. A hand-maintained list would be correct on the day it
 * was written.
 */
export const SECTION_INDEX_ROUTES: readonly string[] = [
  '/',
  '/developers',
  '/developers/schemas',
  '/developers/spec',
  '/developers/validator',
  '/registry',
  '/rfcs',
];

/** `/developers/spec/0.1/` is a section index too, for any version. */
const VERSIONED_SECTION = /^\/developers\/spec\/\d+\.\d+$/;

/**
 * The URL of this page's Markdown twin.
 *
 * @param pathname the page's own path, with or without a trailing slash
 */
export function twinUrlFor(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  const bare = path.replace(/^\/es(?=\/|$)/, '') || '/';
  const prefix = path.startsWith('/es') ? '/es' : '';

  if (bare === '/') return `${prefix}/index.md`;

  if (SECTION_INDEX_ROUTES.includes(bare) || VERSIONED_SECTION.test(bare)) {
    return `${path}/index.md`;
  }

  return `${path}.md`;
}
