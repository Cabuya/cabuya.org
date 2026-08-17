/**
 * Guards the dev-only hub: its navigation, and the three layers that keep it
 * out of production.
 *
 * Two failures this prevents, both of which had already happened:
 *
 *   1. The hub linked to `/internal/authors` and `/internal/certificates` for
 *      several tasks after those pages were deleted. A portal that 404s teaches
 *      contributors it is abandoned, and then they stop reading it.
 *   2. Nothing asserted that `/internal` stays out of the build. The exclusion
 *      is three independent mechanisms — a post-build deletion, a sitemap
 *      filter, and a noindex meta — and any one of them can be removed by
 *      someone who assumes the other two are enough.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { INTERNAL_PAGES, INTERNAL_SECTIONS, pagesIn } from '@/lib/internal-hub';

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, 'src', 'pages');
const INTERNAL_DIR = join(PAGES_DIR, 'internal');

/** Every `.astro` file under src/pages/internal, as a path relative to src/pages. */
function internalFiles(dir: string = INTERNAL_DIR): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...internalFiles(full));
    else if (entry.endsWith('.astro')) out.push(relative(PAGES_DIR, full));
  }
  return out.sort();
}

describe('internal hub — the registry matches the filesystem', () => {
  const onDisk = internalFiles();
  const registered = INTERNAL_PAGES.map((page) => page.file).sort();

  it('lists every page that exists', () => {
    const unlisted = onDisk.filter((file) => !registered.includes(file));
    expect(
      unlisted,
      'these pages exist but are unreachable from the hub — add them to src/lib/internal-hub.ts'
    ).toEqual([]);
  });

  it('lists no page that does not exist', () => {
    const missing = registered.filter((file) => !onDisk.includes(file));
    expect(
      missing,
      'these registry entries point at files that are not there — the hub would 404'
    ).toEqual([]);
  });

  it('derives each href from its file path', () => {
    for (const page of INTERNAL_PAGES) {
      const expected = `/${page.file.replace(/\/index\.astro$/, '').replace(/\.astro$/, '')}`;
      expect(page.href, page.file).toBe(expected);
    }
  });

  it('keeps ids unique', () => {
    const ids = INTERNAL_PAGES.map((page) => page.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('gives every page a purpose a contributor can act on', () => {
    for (const page of INTERNAL_PAGES) {
      expect(page.purpose.length, page.id).toBeGreaterThan(20);
      expect(page.title.length, page.id).toBeGreaterThan(0);
    }
  });

  it('gives every section exactly one top-level entry', () => {
    for (const section of INTERNAL_SECTIONS) {
      const tops = pagesIn(section.id).filter((page) => page.topLevel);
      expect(tops.length, `section "${section.id}"`).toBe(1);
    }
  });
});

describe('internal hub — every internal link resolves', () => {
  /**
   * The registry check above proves the *navigation* has no dead entries. This
   * one covers the links written inside page bodies, which is where
   * `/internal/authors` survived longest.
   */
  it('no page links to an /internal route that is not in the registry', () => {
    const known = new Set(INTERNAL_PAGES.map((page) => page.href));
    const broken: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (entry.endsWith('.astro')) {
          const src = readFileSync(full, 'utf-8');
          for (const match of src.matchAll(
            /href=["'](\/internal[^"'#?]*)["'#?]/g
          )) {
            const href = match[1].replace(/\/$/, '') || '/internal';
            if (!known.has(href))
              broken.push(`${relative(ROOT, full)} → ${href}`);
          }
        }
      }
    };
    walk(INTERNAL_DIR);
    walk(join(ROOT, 'src', 'layouts'));
    expect(broken).toEqual([]);
  });
});

describe('internal hub — no cross-links from public pages', () => {
  /**
   * A link from a public page into /internal is a broken link in production,
   * because the target is deleted from the build. It is also a leak of internal
   * tooling into the public information architecture.
   */
  it('no page outside /internal links to /internal', () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (full === INTERNAL_DIR) continue;
          walk(full);
        } else if (/\.(astro|svelte|ts)$/.test(entry)) {
          const src = readFileSync(full, 'utf-8');
          if (/href=["'`]\/internal/.test(src))
            offenders.push(relative(ROOT, full));
        }
      }
    };
    walk(PAGES_DIR);
    walk(join(ROOT, 'src', 'components'));
    expect(offenders).toEqual([]);
  });

  it('the layouts that render internal pages are never used by public ones', () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (full === INTERNAL_DIR) continue;
          walk(full);
        } else if (entry.endsWith('.astro')) {
          const src = readFileSync(full, 'utf-8');
          if (/(InternalLayout|ShowcaseLayout)/.test(src))
            offenders.push(relative(ROOT, full));
        }
      }
    };
    walk(PAGES_DIR);
    expect(offenders).toEqual([]);
  });
});

describe('internal hub — the three exclusion layers are all present', () => {
  it('layer 1: the build integration deletes the directory', () => {
    const integration = readFileSync(
      join(ROOT, 'src/integrations/exclude-internal.ts'),
      'utf-8'
    );
    expect(integration).toContain("'internal'");
    expect(integration).toContain('rm(');
    // The escape hatch exists for staging, and must stay opt-in.
    expect(integration).toContain('INCLUDE_INTERNAL');
    expect(integration).toContain("=== 'true'");
  });

  it('layer 1: the integration is actually wired into the config', () => {
    const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf-8');
    expect(config).toContain('excludeInternal');
    expect(config).toMatch(/excludeInternal\(\)/);
  });

  it('layer 2: the sitemap filters internal routes out', () => {
    const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf-8');
    expect(config).toContain("!page.includes('/internal/')");
    expect(config).toContain("!page.endsWith('/internal')");
  });

  it('layer 3: both internal layouts emit noindex', () => {
    for (const layout of ['InternalLayout.astro', 'ShowcaseLayout.astro']) {
      const src = readFileSync(join(ROOT, 'src/layouts', layout), 'utf-8');
      expect(src, layout).toMatch(/name="robots"\s+content="noindex/);
    }
  });

  it('every internal page goes through one of those two layouts', () => {
    const offenders = INTERNAL_PAGES.filter((page) => {
      const src = readFileSync(join(PAGES_DIR, page.file), 'utf-8');
      return !/(InternalLayout|ShowcaseLayout)/.test(src);
    }).map((page) => page.file);
    expect(offenders, 'these would render without the noindex layer').toEqual(
      []
    );
  });

  /*
   * The build output itself is checked by `scripts/check-internal-excluded.mjs`,
   * not from here. A unit test reading `dist/` cannot tell a production build
   * from a staging one made with INCLUDE_INTERNAL=true, and an assertion that
   * silently passes on the wrong input is worse than no assertion. The gate
   * runs immediately after the production build in CI, where the distinction
   * is unambiguous.
   */
});
