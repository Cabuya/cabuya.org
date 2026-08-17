/**
 * WCAG 2.x contrast measurement.
 *
 * The brand's central claim is that its palette is *measured, not asserted*.
 * That claim only holds if the pages documenting the palette compute their own
 * numbers — a hardcoded "4.92:1" under a swatch is a comment, and comments go
 * stale the moment a hex changes.
 *
 * So: the brand pages call this at build time and print what it returns.
 *
 * `tests/unit/lib/design-tokens.test.ts` deliberately keeps its **own**
 * independent implementation of the same formula rather than importing this
 * one — a shared helper with a bug would make the guard test agree with the
 * page about a wrong number. One test cross-checks the two against known
 * reference pairs, so they can disagree loudly but not drift quietly.
 */

/** Relative luminance per WCAG 2.x, from a `#rrggbb` string. */
export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`relativeLuminance: expected #rrggbb, received "${hex}"`);
  }
  const channel = (offset: number): number => {
    const srgb = Number.parseInt(h.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Contrast ratio between two colors, 1:1 … 21:1. Order does not matter. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Rounded the way the docs quote it: two decimals, never rounded *up* into a pass. */
export function formatRatio(ratio: number): string {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

/** What a pair is allowed to be used for. */
export type ContrastUse = 'body' | 'large' | 'ui';

/** WCAG AA thresholds. Large = ≥18.66px bold or ≥24px regular. */
export const AA_THRESHOLD: Record<ContrastUse, number> = {
  body: 4.5,
  large: 3,
  ui: 3,
};

export interface ContrastVerdict {
  ratio: number;
  label: string;
  /** Passes AA for body text (4.5:1). */
  body: boolean;
  /** Passes AA for large text and non-text UI (3:1). */
  large: boolean;
  /** Passes AAA for body text (7:1). */
  aaa: boolean;
  /** Tightest use the pair is cleared for — the honest headline. */
  verdict: 'AAA' | 'AA' | 'AA large only' | 'fails AA';
}

export function measure(
  foreground: string,
  background: string
): ContrastVerdict {
  const ratio = contrastRatio(foreground, background);
  const body = ratio >= AA_THRESHOLD.body;
  const large = ratio >= AA_THRESHOLD.large;
  const aaa = ratio >= 7;
  return {
    ratio,
    label: formatRatio(ratio),
    body,
    large,
    aaa,
    verdict: aaa ? 'AAA' : body ? 'AA' : large ? 'AA large only' : 'fails AA',
  };
}

/**
 * Read the `--color-cabuya-*` declarations out of `global.css`.
 *
 * Build-time only (it takes the CSS text as input, so it stays runtime-free and
 * testable). Returns the light `@theme` values and the `.dark` overrides
 * separately, because the two themes are measured against different grounds.
 */
export function parseThemeTokens(css: string): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const slice = (start: string, end: string): string => {
    const from = css.indexOf(start);
    const to = css.indexOf(end, from + 1);
    return from === -1 ? '' : css.slice(from, to === -1 ? undefined : to);
  };
  /** Literal `#rrggbb` declarations in a block. */
  const hexes = (block: string): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const match of block.matchAll(
      /--color-(cabuya[a-z0-9-]*)\s*:\s*(#[0-9a-fA-F]{6})/g
    )) {
      out[match[1]] = match[2].toLowerCase();
    }
    return out;
  };

  /** `--color-cabuya: var(--color-cabuya-text)` declarations, as pairs. */
  const aliases = (block: string): Array<[string, string]> =>
    [
      ...block.matchAll(
        /--color-(cabuya[a-z0-9-]*)\s*:\s*var\(--color-(cabuya[a-z0-9-]*)\)/g
      ),
    ].map((match) => [match[1], match[2]]);

  const themeBlock = slice('@theme {', '@custom-variant');
  const darkBlock = slice('.dark {', '@layer components');

  /**
   * Aliases are resolved **per theme**, and that is the whole subtlety.
   *
   * `var()` is late-bound: `--color-cabuya: var(--color-cabuya-text)` is
   * declared once, in the light block, but in dark mode it evaluates to the
   * *dark* value of `--color-cabuya-text`. Resolving the alias once against the
   * light palette and letting the dark map inherit that value produces a
   * confident, wrong answer — the palette page reported the text alias as
   * failing at 1.02:1 against the dark surface, which is exactly what you would
   * see if the alias really were frozen to its light value. It is not.
   *
   * Aliases of aliases are not resolved. The palette has none, and a silent
   * partial resolution would be worse than an obvious gap.
   */
  const resolve = (
    base: Record<string, string>,
    pairs: Array<[string, string]>
  ): Record<string, string> => {
    const out = { ...base };
    for (const [name, target] of pairs) {
      if (out[target]) out[name] = out[target];
    }
    return out;
  };

  const aliasPairs = [...aliases(themeBlock), ...aliases(darkBlock)];
  const light = resolve(hexes(themeBlock), aliasPairs);
  const dark = resolve(
    { ...hexes(themeBlock), ...hexes(darkBlock) },
    aliasPairs
  );
  return { light, dark };
}
