/**
 * The portal sidebar, and the pieces that must agree with it.
 *
 * Same contract as the site navigation: a `live` entry with no page is a 404
 * in the sidebar, and a page whose entry is still `planned` is a page nobody
 * can reach. Both are checked, in both directions.
 *
 * The last describe here is less obvious and more valuable: the Markdown twin
 * quotes a diagram's `aria-label` as the diagram's stand-in, and a copied
 * string is a string that drifts. So the copy is compared against the
 * component's own source.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { DIAGRAM_COPY } from '@/lib/diagram-copy';
import { LANGUAGE_CODES } from '@/lib/language-codes';
import { portalSections } from '@/lib/portal-markdown';
import {
  allPortalEntries,
  barePortalPath,
  isPortalActive,
  livePortalSections,
  PORTAL_SECTIONS,
  portalHref,
  portalNeighbours,
  portalOrder,
} from '@/lib/portal-nav';
import { buildToc, slugify } from '@/lib/toc';

const ROOT = process.cwd();
const PAGES = join(ROOT, 'src', 'pages');

const DOCS = join(ROOT, 'src', 'content', 'docs');

/**
 * Does a route in the sidebar have something behind it?
 *
 * Two ways for a portal route to exist, and both count. A bespoke component
 * (`quickstart.astro`, the spec reader) is a file under `src/pages`. A prose
 * page is a pair of Markdown files rendered by `developers/[page].astro`.
 *
 * The prose case requires **both** languages, which is stricter than checking
 * for a route file. A sidebar entry pointing at a page that exists in English
 * and 404s on `/es` is exactly the defect this test is for, and a single-file
 * check would have called it live.
 */
function routeExists(path: string): boolean {
  const bare = path.replace(/^\//, '');
  if (
    existsSync(join(PAGES, `${bare}.astro`)) ||
    existsSync(join(PAGES, bare, 'index.astro'))
  ) {
    return true;
  }

  const slug = bare.replace(/^developers\//, '');
  return (
    existsSync(join(PAGES, 'developers', '[page].astro')) &&
    existsSync(join(DOCS, 'en', `${slug}.md`)) &&
    existsSync(join(DOCS, 'es', `${slug}.md`))
  );
}

describe('portal nav — live entries resolve', () => {
  it('every live entry has a page', () => {
    const broken = allPortalEntries()
      .filter((entry) => entry.status === 'live')
      .map((entry) => entry.path)
      .filter((path) => !routeExists(path));
    expect(broken, 'sidebar entries with no page behind them').toEqual([]);
  });

  it('no planned entry is already built', () => {
    const shipped = allPortalEntries()
      .filter((entry) => entry.status === 'planned')
      .map((entry) => entry.path)
      .filter((path) => routeExists(path));
    expect(
      shipped,
      'built pages still marked planned — flip them to live'
    ).toEqual([]);
  });

  it('every planned entry names its task', () => {
    const unplanned = allPortalEntries()
      .filter((entry) => entry.status === 'planned' && !entry.ships)
      .map((entry) => entry.path);
    expect(unplanned).toEqual([]);
  });

  it('every entry is under /developers', () => {
    // The portal sidebar is the portal's. A link out of it belongs in the
    // header, where a reader expects to leave.
    for (const entry of allPortalEntries()) {
      expect(entry.path.startsWith('/developers')).toBe(true);
    }
  });

  it('carries both languages on every label', () => {
    for (const section of PORTAL_SECTIONS) {
      for (const code of LANGUAGE_CODES) {
        expect(section.label[code], `${section.id} label`).toBeTruthy();
        for (const entry of section.entries) {
          expect(entry.label[code], `${entry.path} label`).toBeTruthy();
        }
      }
    }
  });
});

describe('portal nav — active state and neighbours', () => {
  it('matches the same route in either language', () => {
    const overview = portalOrder()[0];
    expect(isPortalActive(overview, '/developers')).toBe(true);
    expect(isPortalActive(overview, '/es/developers')).toBe(true);
    expect(isPortalActive(overview, '/developers/quickstart')).toBe(false);
  });

  it('strips the language prefix without eating a lookalike route', () => {
    expect(barePortalPath('/es/developers')).toBe('/developers');
    expect(barePortalPath('/developers/')).toBe('/developers');
    expect(barePortalPath('/estimates')).toBe('/estimates');
  });

  it('prefixes hrefs per language', () => {
    const overview = portalOrder()[0];
    expect(portalHref(overview, 'en')).toBe('/developers');
    expect(portalHref(overview, 'es')).toBe('/es/developers');
  });

  it('returns no neighbours for a path outside the portal', () => {
    expect(portalNeighbours('/registry')).toEqual({
      previous: null,
      next: null,
    });
  });

  it('walks the sidebar order, not the declaration order', () => {
    const order = portalOrder();
    const live = livePortalSections().flatMap((section) => section.entries);
    expect(order).toEqual(live);
  });
});

describe('portal twin — the diagram travels with the page', () => {
  /*
   * This used to compare a hand-copied paragraph in `portal-markdown.ts`
   * against the component's `ariaLabel`, because a copied string rots. There is
   * no copy now: both the page and the twin read `DIAGRAM_COPY`, so the test
   * asserts the twin actually carries it rather than that two strings still
   * agree.
   */
  it.each(LANGUAGE_CODES)(
    'quotes the %s aria-label from the shared copy',
    (lang) => {
      const copy = DIAGRAM_COPY.oneSchemaFourTransports[lang];
      const lines = portalSections(lang).flatMap((entry) => entry.lines);
      expect(lines.some((line) => line.includes(copy.ariaLabel))).toBe(true);
      expect(lines.some((line) => line.includes(copy.caption))).toBe(true);
    }
  );

  it('is the only place the diagram copy is written', () => {
    const source = readFileSync(
      join(
        ROOT,
        'src/components/diagrams/protocol/OneSchemaFourTransports.astro'
      ),
      'utf-8'
    );
    expect(
      source.includes('ariaLabel:'),
      'the component declares its own aria-label again — the twin and the page can now drift'
    ).toBe(false);
  });
});

describe('table of contents', () => {
  it('keeps h2 and h3 and drops the rest', () => {
    const toc = buildToc([
      { depth: 1, text: 'Title' },
      { depth: 2, text: 'Section' },
      { depth: 3, text: 'Subsection' },
      { depth: 4, text: 'Too deep' },
    ]);
    expect(toc.map((entry) => entry.text)).toEqual(['Section', 'Subsection']);
  });

  it('makes duplicate headings unique', () => {
    // "Example" twice is normal in a specification, and a duplicate id
    // silently breaks every link to the second one.
    const toc = buildToc([
      { depth: 2, text: 'Example' },
      { depth: 2, text: 'Example' },
      { depth: 2, text: 'Example' },
    ]);
    expect(toc.map((entry) => entry.slug)).toEqual([
      'example',
      'example-1',
      'example-2',
    ]);
  });

  it('folds diacritics so the anchor is ASCII', () => {
    // The heading keeps its accents; the anchor does not, because a
    // percent-encoded fragment survives one paste and not the next.
    expect(slugify('Configuración del feed')).toBe('configuracion-del-feed');
    expect(slugify('¿Qué mide el validador?')).toBe('que-mide-el-validador');
  });

  it('respects a slug supplied by the renderer', () => {
    const toc = buildToc([{ depth: 2, text: 'Anything', slug: '3-1' }]);
    expect(toc[0].slug).toBe('3-1');
  });
});
