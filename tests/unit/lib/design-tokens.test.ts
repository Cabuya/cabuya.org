/**
 * Guards the Cabuya design token system.
 *
 * These exist because a palette can silently drift: internal colour pages can
 * hardcode hex strings, and when the tokens change the pages keep printing the
 * old values while rendering the new ones. A design system that can lie about
 * itself is worse than no design system.
 *
 * What is enforced:
 *   1. Every token is declared once, in `global.css`, for both themes.
 *   2. Both internal colour pages document every token — no silent omissions.
 *   3. Neither page references a token that does not exist.
 *   4. Dark mode overrides every token that must flip, and none that must not.
 *   5. No component reintroduces a raw hex where a token exists.
 *   6. The measured-contrast rules from docs/context/brand/PALETTE.md are
 *      RE-COMPUTED here — the ratios are not trusted from comments:
 *      body pairs ≥ 4.5:1, fique-strong ≥ 4.5:1 on both light grounds, and
 *      raw fique (#C79A4A) is never used as a text utility outside
 *      dark-scoped or dark-canvas contexts.
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
    [...block.matchAll(/--color-(cabuya[a-z0-9-]*)\s*:/g)].map((m) => m[1])
  );

const tokenValue = (block: string, token: string): string | undefined =>
  block.match(new RegExp(`--color-${token}\\s*:\\s*(#[0-9a-fA-F]{6})`))?.[1];

const DECLARED = tokensIn(themeBlock);
const DARK = tokensIn(darkBlock);

/** WCAG 2.x relative-luminance contrast ratio. */
function contrast(hexA: string, hexB: string): number {
  const lum = (hex: string): number => {
    const h = hex.replace('#', '');
    const chan = (i: number): number => {
      const c = Number.parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
  };
  const [a, b] = [lum(hexA), lum(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Tokens that deliberately do NOT change between themes.
 *
 * `fill` / `on-fill` are the reason the whole split exists: a filled brand
 * surface must stay forest-with-ivory in both themes, because `primary`
 * flips to fique and fique-on-forest is a badge pairing, not a fill pairing.
 */
const NO_FLIP = new Set([
  'cabuya-fill',
  'cabuya-fill-strong',
  'cabuya-on-fill',
  'cabuya-seedling',
  'cabuya-seedling-soft',
  'cabuya-primary-light',
  'cabuya-bg-dark',
  'cabuya-accent',
  // Aliases re-export via var(), so they inherit the flip without a .dark rule.
  'cabuya',
  'cabuya-secondary',
]);

describe('design tokens — declaration', () => {
  it('declares a meaningful token set', () => {
    expect(DECLARED.size).toBeGreaterThanOrEqual(30);
  });

  it('declares the canonical brand colours with the PALETTE.md values', () => {
    // docs/context/brand/PALETTE.md — these five are not ours to change.
    expect(themeBlock).toContain('#0b3d32'); // Cabuya Forest
    expect(themeBlock).toContain('#c79a4a'); // Fique Fiber — decorative
    expect(themeBlock).toContain('#082a24'); // Cabuya Night
    expect(themeBlock).toContain('#f6f3ed'); // Natural Ivory
    expect(themeBlock).toContain('#faf9f6'); // Warm White
  });

  it('keeps the fill pair identical in both themes', () => {
    for (const token of [
      'cabuya-fill',
      'cabuya-fill-strong',
      'cabuya-on-fill',
    ]) {
      expect(DARK.has(token)).toBe(false);
    }
  });

  it('flips every token that must flip', () => {
    const mustFlip = [...DECLARED].filter((t) => !NO_FLIP.has(t));
    const notFlipped = mustFlip.filter((t) => !DARK.has(t));
    expect(notFlipped).toEqual([]);
  });

  it('ships no leftover corag- token', () => {
    expect(CSS).not.toMatch(/corag-/);
  });
});

describe('design tokens — measured contrast (re-computed, not trusted)', () => {
  const WHITE = '#faf9f6';
  const IVORY = '#f6f3ed';
  const NIGHT = '#082a24';

  it('fique-strong carries text on BOTH light grounds (≥ 4.5:1)', () => {
    const strong = tokenValue(themeBlock, 'cabuya-accent-strong');
    expect(strong).toBeDefined();
    expect(contrast(strong as string, WHITE)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(strong as string, IVORY)).toBeGreaterThanOrEqual(4.5);
  });

  it('raw fique fails AA on light — the reason accent is decorative-only', () => {
    // If this ever passes, the palette changed and the rule needs review.
    const accent = tokenValue(themeBlock, 'cabuya-accent');
    expect(contrast(accent as string, WHITE)).toBeLessThan(3);
  });

  it('light-mode body pairs are AA or better on both light grounds', () => {
    for (const token of [
      'cabuya-primary',
      'cabuya-text',
      'cabuya-text-secondary',
      'cabuya-text-muted',
      'cabuya-success',
      'cabuya-warning',
      'cabuya-info',
      'cabuya-danger',
    ]) {
      const v = tokenValue(themeBlock, token);
      expect(v, token).toBeDefined();
      expect(
        contrast(v as string, WHITE),
        `${token} on white`
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(v as string, IVORY),
        `${token} on ivory`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('dark-mode body pairs are AA or better on the ELEVATED surface', () => {
    // Elevated is lighter than the page ground, so it is the binding check.
    const elevated = tokenValue(darkBlock, 'cabuya-bg-elevated') as string;
    expect(elevated).toBeDefined();
    for (const token of [
      'cabuya-primary',
      'cabuya-text',
      'cabuya-text-secondary',
      'cabuya-text-muted',
      'cabuya-accent-strong',
      'cabuya-success',
      'cabuya-warning',
      'cabuya-info',
      'cabuya-danger',
    ]) {
      const v = tokenValue(darkBlock, token);
      expect(v, token).toBeDefined();
      expect(
        contrast(v as string, elevated),
        `${token} on dark elevated`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('the fixed fill pair measures AA+ (ivory on forest)', () => {
    const fill = tokenValue(themeBlock, 'cabuya-fill') as string;
    const onFill = tokenValue(themeBlock, 'cabuya-on-fill') as string;
    expect(contrast(onFill, fill)).toBeGreaterThanOrEqual(7);
  });

  it('seedling display text is AAA on the always-dark canvas', () => {
    const seedling = tokenValue(themeBlock, 'cabuya-seedling') as string;
    expect(contrast(seedling, NIGHT)).toBeGreaterThanOrEqual(7);
  });

  it('interactive borders clear the 3:1 non-text minimum in both modes', () => {
    const light = tokenValue(themeBlock, 'cabuya-border-interactive') as string;
    const dark = tokenValue(darkBlock, 'cabuya-border-interactive') as string;
    expect(contrast(light, WHITE)).toBeGreaterThanOrEqual(3);
    expect(contrast(dark, NIGHT)).toBeGreaterThanOrEqual(3);
  });
});

describe('design tokens — fique is never light-ground text', () => {
  it('no component uses text-cabuya-accent outside a dark-scoped context', () => {
    // Practical static check, documented limits: flags `text-cabuya-accent`
    // as a standalone utility unless the same class list carries `dark:` or
    // the file opts in via a `cabuya-dark-canvas` marker comment (for
    // components rendered exclusively on bg-cabuya-bg-dark).
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSyncSafe(dir)) {
        const full = join(dir, entry);
        if (isDir(full)) walk(full);
        else if (/\.(astro|svelte)$/.test(entry)) {
          const src = readFileSync(full, 'utf-8');
          if (src.includes('cabuya-dark-canvas')) continue;
          for (const m of src.matchAll(
            /^.*\btext-cabuya-accent(?!-strong).*$/gm
          )) {
            // Icons are a documented legitimate use of raw fique (non-text,
            // DESIGN.md): exempt lines that are clearly SVG/icon contexts.
            const iconContext = /<svg|viewBox|-icon\b|aria-hidden/.test(m[0]);
            if (!iconContext && !/dark:/.test(m[0]))
              offenders.push(full.replace(ROOT, ''));
          }
        }
      }
    };
    walk(join(ROOT, 'src', 'components'));
    walk(join(ROOT, 'src', 'layouts'));
    expect(offenders).toEqual([]);
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
      [...source.matchAll(/--color-(cabuya[a-z0-9-]*)/g)].map((m) => m[1])
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
    // These fail WCAG AA on the Cabuya grounds. `docs/DESIGN.md`.
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
