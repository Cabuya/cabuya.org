/**
 * Guards the navigation surface.
 *
 * The header, the footer and the agent-Markdown twins all read
 * `src/lib/site-navigation.ts`. Three ways that goes wrong, all of which have
 * happened on this codebase or its predecessor:
 *
 *   1. An entry marked `live` points at a page nobody built — a 404 in the
 *      header, and a Rule-0 violation (no CTA to something that does not
 *      exist).
 *   2. A page ships and its entry stays `planned`, so the route exists but is
 *      unreachable from the chrome.
 *   3. The IA document grows a route and the nav never hears about it.
 *
 * The first two are mechanical, so they are checked mechanically. The third is
 * checked against `docs/INFORMATION_ARCHITECTURE.md` itself, which is the
 * document the nav is supposed to implement.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  agentNavEntries,
  allEntries,
  FOOTER_COLUMNS,
  liveFooterColumns,
  liveGroups,
  NAV_GROUPS,
  navHref,
  switchLanguagePath,
} from '@/lib/site-navigation';

const ROOT = process.cwd();
const PAGES = join(ROOT, 'src', 'pages');

/**
 * Does a route resolve to something in the build?
 *
 * `/foo` can be served by `src/pages/foo.astro`, `src/pages/foo/index.astro`,
 * a static file in `public/`, or — for the portal's prose — a pair of Markdown
 * files rendered by `developers/[page].astro`. All four count.
 *
 * The prose case requires **both** languages, which is stricter than checking
 * for a route file: a chrome entry pointing at a page that exists in English
 * and 404s on `/es` is exactly the defect this test is for.
 */
/**
 * Does an `#anchor` in a nav path point at something that exists?
 *
 * Greps the components for the id rather than the built HTML, so this stays a
 * unit test. A chrome link to `/join#contact` that lands at the top of the page
 * because the section was renamed is a small bug with a large tell: it means
 * nobody clicked it.
 */
function anchorExists(fragment: string): boolean {
  const roots = [join(ROOT, 'src', 'components'), join(ROOT, 'src', 'pages')];
  const stack = [...roots];
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.(astro|svelte)$/.test(entry.name)) {
        if (readFileSync(full, 'utf-8').includes(`id="${fragment}"`)) {
          return true;
        }
      }
    }
  }
  return false;
}

function routeExists(path: string): boolean {
  const [routePath, fragment] = path.split('#');
  if (fragment && !anchorExists(fragment)) return false;
  const bare = routePath.replace(/^\//, '');
  if (bare === '') return existsSync(join(PAGES, 'index.astro'));
  if (
    existsSync(join(PAGES, `${bare}.astro`)) ||
    existsSync(join(PAGES, bare, 'index.astro')) ||
    existsSync(join(ROOT, 'public', bare))
  ) {
    return true;
  }

  if (!bare.startsWith('developers/')) return false;
  const slug = bare.slice('developers/'.length);
  const docs = join(ROOT, 'src', 'content', 'docs');
  return (
    existsSync(join(PAGES, 'developers', '[page].astro')) &&
    existsSync(join(docs, 'en', `${slug}.md`)) &&
    existsSync(join(docs, 'es', `${slug}.md`))
  );
}

describe('navigation — live entries point at pages that exist', () => {
  const internal = allEntries().filter(
    (entry) =>
      !('external' in entry && entry.external) && 'path' in entry && entry.path
  );

  it('every live entry resolves', () => {
    const broken = internal
      .filter((entry) => entry.status === 'live')
      .map((entry) => entry.path as string)
      .filter((path) => !routeExists(path));
    expect(
      broken,
      'these are advertised in the chrome but have no page — either build them or mark them planned'
    ).toEqual([]);
  });

  it('no planned entry is secretly already built', () => {
    const shipped = internal
      .filter((entry) => entry.status === 'planned')
      .map((entry) => entry.path as string)
      .filter((path) => routeExists(path));
    expect(
      shipped,
      'these pages exist but are unreachable from the chrome — flip their status to live'
    ).toEqual([]);
  });

  it('every planned entry names the task that ships it', () => {
    const unplanned = allEntries()
      .filter((entry) => entry.status === 'planned' && !entry.ships)
      .map((entry) => ('path' in entry ? entry.path : entry.id));
    expect(unplanned).toEqual([]);
  });
});

describe('navigation — the IA document and the nav agree', () => {
  const IA = readFileSync(
    join(ROOT, 'docs', 'INFORMATION_ARCHITECTURE.md'),
    'utf-8'
  );

  it('the header carries the five groups the IA names, in order', () => {
    // The IA's header table, read as the source of truth for the top level.
    const headerSection = IA.slice(
      IA.indexOf('### Header'),
      IA.indexOf('### Portal sidebar')
    );
    const labels = [...headerSection.matchAll(/\*\*([A-Za-z]+)\*\*/g)].map(
      (match) => match[1]
    );
    expect(labels.length).toBeGreaterThanOrEqual(5);
    expect(NAV_GROUPS.map((group) => group.label.en)).toEqual(labels);
  });

  it('every header route appears somewhere in the IA', () => {
    const paths = NAV_GROUPS.flatMap((group) => [
      group.path,
      ...(group.children ?? []).map((child) => child.path),
    ]).filter(Boolean) as string[];
    const missing = paths.filter((path) => !IA.includes(path));
    expect(missing, 'nav invents routes the IA does not describe').toEqual([]);
  });

  it('the footer has the four columns the IA names', () => {
    expect(FOOTER_COLUMNS.map((column) => column.id)).toEqual([
      'protocol',
      'developers',
      'governance',
      'meta',
    ]);
  });
});

describe('navigation — what renders today', () => {
  it('live filters prune planned entries out of the chrome', () => {
    for (const group of liveGroups()) {
      expect(group.children ?? []).toEqual(
        (group.children ?? []).filter((child) => child.status === 'live')
      );
    }
    for (const column of liveFooterColumns()) {
      expect(column.entries.every((entry) => entry.status === 'live')).toBe(
        true
      );
      expect(column.entries.length).toBeGreaterThan(0);
    }
  });

  it('the footer always has somewhere to send a reader', () => {
    // Even at the emptiest point of the migration, the external governance and
    // repository links are real. A footer with no columns is a broken page.
    expect(liveFooterColumns().length).toBeGreaterThan(0);
  });

  it('the agent nav block lists home first and only live destinations', () => {
    const entries = agentNavEntries();
    expect(entries[0].path).toBe('/');
    expect(entries.every((entry) => entry.status === 'live')).toBe(true);
  });
});

describe('navigation — hrefs and the language switcher', () => {
  it('prefixes internal paths per language and leaves external ones alone', () => {
    expect(navHref({ path: '/registry' }, 'en')).toBe('/registry');
    expect(navHref({ path: '/registry' }, 'es')).toBe('/es/registry');
    expect(navHref({ path: '/' }, 'en')).toBe('/');
    expect(navHref({ path: '/' }, 'es')).toBe('/es');
    expect(navHref({ path: 'https://example.org', external: true }, 'es')).toBe(
      'https://example.org'
    );
  });

  it('maps the current route to the same route in the other language', () => {
    expect(switchLanguagePath('/', 'es')).toBe('/es');
    expect(switchLanguagePath('/es', 'en')).toBe('/');
    expect(switchLanguagePath('/developers/spec', 'es')).toBe(
      '/es/developers/spec'
    );
    expect(switchLanguagePath('/es/developers/spec', 'en')).toBe(
      '/developers/spec'
    );
  });

  it('is idempotent and survives a trailing slash', () => {
    expect(switchLanguagePath('/es/registry/', 'es')).toBe('/es/registry');
    expect(switchLanguagePath('/registry/', 'en')).toBe('/registry');
    expect(switchLanguagePath('/es/', 'en')).toBe('/');
  });

  it('does not mistake a route that merely starts with the language code', () => {
    // `/estimates` is not Spanish. A naive `startsWith('/es')` would eat it.
    expect(switchLanguagePath('/estimates', 'es')).toBe('/es/estimates');
    expect(switchLanguagePath('/estimates', 'en')).toBe('/estimates');
  });
});
