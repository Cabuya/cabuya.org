/**
 * Guards the Corag design token system.
 *
 * These exist because the palette silently drifted once already: the internal
 * colour pages hardcoded hex strings, and when the tokens changed the pages
 * kept printing the old teal/amber values while rendering the new ones. A
 * design system that can lie about itself is worse than no design system.
 *
 * What is enforced:
 *   1. Every token is declared once, in `global.css`, for both themes.
 *   2. Both internal colour pages document every token — no silent omissions.
 *   3. Neither page references a token that does not exist.
 *   4. Dark mode overrides every token that must flip, and none that must not.
 *   5. No component reintroduces a raw hex where a token exists.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const CSS = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf-8');

const themeBlock = CSS.slice(
  CSS.indexOf('@theme {'),
  CSS.indexOf('@custom-variant')
);
const darkBlock = CSS.slice(
  CSS.indexOf('.dark {'),
  CSS.indexOf('@layer components')
);

const tokensIn = (block: string): Set<string> =>
  new Set(
    [...block.matchAll(/--color-(corag[a-z0-9-]*)\s*:/g)].map((m) => m[1])
  );

const DECLARED = tokensIn(themeBlock);
const DARK = tokensIn(darkBlock);

/**
 * Tokens that deliberately do NOT change between themes.
 *
 * `fill` / `on-fill` are the reason the whole split exists: a filled brand
 * surface must stay wine-with-rosa-claro in both themes, because `primary`
 * flips to rosa and white-on-rosa measures ~1.5:1.
 */
const NO_FLIP = new Set([
  'corag-fill',
  'corag-fill-strong',
  'corag-on-fill',
  'corag-rosa',
  'corag-rosa-soft',
  'corag-primary-light',
  'corag-bg-dark',
  'corag-accent',
  // Aliases re-export via var(), so they inherit the flip without a .dark rule.
  'corag',
  'corag-secondary',
]);

describe('design tokens — declaration', () => {
  it('declares a meaningful token set', () => {
    expect(DECLARED.size).toBeGreaterThanOrEqual(30);
  });

  it('declares the official brand colours with the manual’s values', () => {
    // Manual de Identidad Visual, p. 13. These four are not ours to change.
    expect(themeBlock).toContain('#78020e'); // vino
    expect(themeBlock).toContain('#bc727c'); // vino 50% — decorative
    expect(themeBlock).toContain('#ffc7d5'); // rosa
    expect(themeBlock).toContain('#ffe2e9'); // rosa claro
  });

  it('keeps the fill pair identical in both themes', () => {
    for (const token of ['corag-fill', 'corag-fill-strong', 'corag-on-fill']) {
      expect(DARK.has(token)).toBe(false);
    }
  });

  it('flips every token that must flip', () => {
    const mustFlip = [...DECLARED].filter((t) => !NO_FLIP.has(t));
    const notFlipped = mustFlip.filter((t) => !DARK.has(t));
    expect(notFlipped).toEqual([]);
  });

  it('ships no leftover ptt- token', () => {
    expect(CSS).not.toMatch(/ptt-/);
  });
});

describe('design tokens — the internal colour pages cannot go stale', () => {
  const PAGES = [
    'src/pages/internal/ui/colors.astro',
    'src/pages/internal/brand/colors.astro',
  ];

  for (const page of PAGES) {
    const source = readFileSync(join(ROOT, page), 'utf-8');
    const referenced = new Set(
      [...source.matchAll(/--color-(corag[a-z0-9-]*)/g)].map((m) => m[1])
    );

    it(`${page} documents every declared token`, () => {
      const missing = [...DECLARED].filter((t) => !referenced.has(t)).sort();
      expect(missing).toEqual([]);
    });

    it(`${page} references no token that does not exist`, () => {
      const bogus = [...referenced].filter((t) => !DECLARED.has(t)).sort();
      expect(bogus).toEqual([]);
    });
  }

  it('the showcase reads computed values instead of hardcoding hexes', () => {
    const source = readFileSync(
      join(ROOT, 'src/pages/internal/ui/colors.astro'),
      'utf-8'
    );
    expect(source).toContain('getComputedStyle');
    expect(source).toContain('data-swatch-value');
    // The failure mode this replaced: hex literals typed into the page.
    const hexes = source.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    expect(hexes).toEqual([]);
  });
});

describe('design tokens — no component bypasses the system', () => {
  it('banned low-contrast greys are absent from the component tree', () => {
    // These fail WCAG AA on the Corag grounds. `docs/DESIGN.md` §2.6.
    const banned = /\b(?:dark:)?text-gray-(?:400|500)\b/g;
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSyncSafe(dir)) {
        const full = join(dir, entry);
        if (isDir(full)) walk(full);
        else if (/\.(astro|svelte)$/.test(entry)) {
          const src = readFileSync(full, 'utf-8');
          // /internal is dev-only chrome and predates the token system.
          if (full.includes(`${join('pages', 'internal')}`)) continue;
          if (banned.test(src)) offenders.push(full.replace(ROOT, ''));
          banned.lastIndex = 0;
        }
      }
    };
    walk(join(ROOT, 'src', 'components'));
    expect(offenders).toEqual([]);
  });
});

// Small helpers kept local so this file has no production dependency.
import { readdirSync, statSync } from 'node:fs';

function readdirSyncSafe(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}
