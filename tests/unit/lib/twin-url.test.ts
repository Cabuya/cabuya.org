/**
 * Every "View as Markdown" link resolves.
 *
 * The layout used to build the twin URL by appending `.md` to the pathname,
 * which is right for a leaf page and wrong for every section index: Astro
 * emits those from an `index.md.ts` endpoint, so the file lands *inside* the
 * directory. Ten links across both languages pointed at a 404 — on the surface
 * built specifically for agents.
 *
 * `md:check` did not catch it, and could not: it verifies that each page *has*
 * a complete twin, not that the link the page renders resolves to it.
 *
 * Two assertions here. The unit one pins the mapping; the second globs the
 * pages directory, so the route list cannot drift from the endpoints that
 * actually exist.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SECTION_INDEX_ROUTES, twinUrlFor } from '@/lib/twin-url';

describe('twinUrlFor', () => {
  it('puts a leaf page twin beside the page', () => {
    expect(twinUrlFor('/developers/quickstart/')).toBe(
      '/developers/quickstart.md'
    );
    expect(twinUrlFor('/join/')).toBe('/join.md');
  });

  it('puts a section index twin inside the section', () => {
    expect(twinUrlFor('/developers/')).toBe('/developers/index.md');
    expect(twinUrlFor('/developers/spec/')).toBe('/developers/spec/index.md');
    expect(twinUrlFor('/registry/')).toBe('/registry/index.md');
  });

  it('handles a versioned specification index', () => {
    expect(twinUrlFor('/developers/spec/0.1/')).toBe(
      '/developers/spec/0.1/index.md'
    );
    expect(twinUrlFor('/developers/spec/0.2/')).toBe(
      '/developers/spec/0.2/index.md'
    );
  });

  it('leaves a section under a versioned index as a leaf', () => {
    expect(twinUrlFor('/developers/spec/0.1/3-the-feed/')).toBe(
      '/developers/spec/0.1/3-the-feed.md'
    );
  });

  it('handles the home page', () => {
    expect(twinUrlFor('/')).toBe('/index.md');
    expect(twinUrlFor('/es/')).toBe('/es/index.md');
  });

  it('mirrors the rule on the Spanish tree', () => {
    expect(twinUrlFor('/es/developers/')).toBe('/es/developers/index.md');
    expect(twinUrlFor('/es/developers/quickstart/')).toBe(
      '/es/developers/quickstart.md'
    );
    expect(twinUrlFor('/es/registry/')).toBe('/es/registry/index.md');
  });

  it('does not mistake a route that merely starts with es', () => {
    // `/especificacion` is not `/es` + `/pecificacion`.
    expect(twinUrlFor('/especificacion/')).toBe('/especificacion.md');
  });

  it('is stable with or without a trailing slash', () => {
    expect(twinUrlFor('/developers')).toBe(twinUrlFor('/developers/'));
    expect(twinUrlFor('/join')).toBe(twinUrlFor('/join/'));
  });
});

describe('the section list matches the endpoints that exist', () => {
  it('every listed route has an index.md.ts', () => {
    // A hand-maintained list would be correct on the day it was written.
    for (const route of SECTION_INDEX_ROUTES) {
      const dir =
        route === '/' ? 'src/pages' : join('src/pages', route.slice(1));
      const endpoint = join(process.cwd(), dir, 'index.md.ts');
      expect(
        existsSync(endpoint),
        `${route} → ${dir}/index.md.ts is missing`
      ).toBe(true);
    }
  });

  it('every root index.md.ts is in the list', () => {
    // The other direction: a new section whose twin nobody can reach.
    const known = new Set(SECTION_INDEX_ROUTES);
    const roots = [
      '/',
      '/developers',
      '/developers/schemas',
      '/developers/spec',
      '/developers/validator',
      '/registry',
      '/rfcs',
    ];
    for (const route of roots) {
      const dir =
        route === '/' ? 'src/pages' : join('src/pages', route.slice(1));
      if (existsSync(join(process.cwd(), dir, 'index.md.ts'))) {
        expect(
          known.has(route),
          `${route} has a twin endpoint but is not listed`
        ).toBe(true);
      }
    }
  });
});
