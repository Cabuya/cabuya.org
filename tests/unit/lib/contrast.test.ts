/**
 * The contrast maths the design-token gate runs on.
 *
 * This module is why `design-tokens.test.ts` can *re-compute* WCAG ratios
 * rather than trusting a table somebody typed once — so it has to be right in
 * the small, and especially at the boundaries. A `measure()` that rounded 4.49
 * up to "AA" would quietly bless the exact pairs the project has already had to
 * fix twice: body text at 1.5:1 in dark mode, and a syntax comment at 3.19:1 on
 * the code ground.
 *
 * The reference values below are the standard WCAG examples, computed from the
 * published formula, not from this implementation.
 */
import { describe, expect, it } from 'vitest';

import {
  AA_THRESHOLD,
  contrastRatio,
  formatRatio,
  measure,
  relativeLuminance,
} from '@/lib/contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('accepts a hex with or without the hash, in either case', () => {
    const canonical = relativeLuminance('#C79A4A');
    expect(relativeLuminance('C79A4A')).toBeCloseTo(canonical, 10);
    expect(relativeLuminance('#c79a4a')).toBeCloseTo(canonical, 10);
  });

  it('applies the sRGB transfer curve, not a linear average', () => {
    // Mid grey is ~0.216 relative luminance, not 0.5. A linear implementation
    // returns 0.5 and every ratio it computes is wrong in the safe-looking
    // direction.
    expect(relativeLuminance('#808080')).toBeCloseTo(0.2159, 3);
  });

  it('weights the channels per the spec', () => {
    // Green contributes most, blue least.
    expect(relativeLuminance('#00FF00')).toBeGreaterThan(
      relativeLuminance('#FF0000')
    );
    expect(relativeLuminance('#FF0000')).toBeGreaterThan(
      relativeLuminance('#0000FF')
    );
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 4);
  });

  it('is 1 for a colour on itself', () => {
    expect(contrastRatio('#C79A4A', '#C79A4A')).toBeCloseTo(1, 6);
  });

  it('is symmetric', () => {
    // Order must not matter: a caller that passed background-first would
    // otherwise get a different verdict for the same pair.
    expect(contrastRatio('#0B3D32', '#FAF9F6')).toBeCloseTo(
      contrastRatio('#FAF9F6', '#0B3D32'),
      10
    );
  });

  it('agrees with a pair the project has already measured', () => {
    // `fique-strong` on the light ground, recorded in the plan as 4.92:1.
    expect(contrastRatio('#8A672C', '#FAF9F6')).toBeCloseTo(4.92, 1);
  });

  it('reports the fique failure the palette rules exist for', () => {
    // Fique on light is below 4.5 — which is why `-strong` exists and why
    // `text-cabuya-accent` on light is banned.
    expect(contrastRatio('#C79A4A', '#FAF9F6')).toBeLessThan(AA_THRESHOLD.body);
  });
});

describe('formatRatio', () => {
  it('renders two decimals and the colon', () => {
    expect(formatRatio(4.5)).toBe('4.50:1');
    expect(formatRatio(21)).toBe('21.00:1');
  });

  it('does not round a near-miss up into a pass', () => {
    // 4.499 must not read as 4.50. The number in a report is what somebody
    // decides with.
    expect(formatRatio(4.499)).not.toBe('4.50:1');
  });
});

describe('measure', () => {
  it('calls black on white AAA', () => {
    const verdict = measure('#000000', '#FFFFFF');
    expect(verdict.verdict).toBe('AAA');
    expect(verdict.aaa).toBe(true);
    expect(verdict.body).toBe(true);
    expect(verdict.large).toBe(true);
  });

  it('calls a colour on itself a failure', () => {
    const verdict = measure('#0B3D32', '#0B3D32');
    expect(verdict.verdict).toBe('fails AA');
    expect(verdict.body).toBe(false);
    expect(verdict.large).toBe(false);
  });

  it('distinguishes "AA large only" from "AA"', () => {
    // The tier that exists so a UI border is not held to body-text contrast —
    // and the tier most easily misreported as a pass.
    const largeOnly = measure('#767676', '#FFFFFF');
    expect(largeOnly.ratio).toBeGreaterThanOrEqual(AA_THRESHOLD.large);
    expect(largeOnly.ratio).toBeLessThan(AA_THRESHOLD.body + 0.5);
  });

  it('reports the tightest use the pair is cleared for, and no more', () => {
    for (const [fg, bg] of [
      ['#000000', '#FFFFFF'],
      ['#8A672C', '#FAF9F6'],
      ['#C79A4A', '#FAF9F6'],
      ['#0B3D32', '#0B3D32'],
    ] as const) {
      const verdict = measure(fg, bg);
      const expected = verdict.aaa
        ? 'AAA'
        : verdict.body
          ? 'AA'
          : verdict.large
            ? 'AA large only'
            : 'fails AA';
      expect(verdict.verdict, `${fg} on ${bg}`).toBe(expected);
    }
  });

  it('carries a label that matches its ratio', () => {
    const verdict = measure('#8A672C', '#FAF9F6');
    expect(verdict.label).toBe(formatRatio(verdict.ratio));
  });

  it('exposes the thresholds it judges by', () => {
    expect(AA_THRESHOLD.body).toBe(4.5);
    expect(AA_THRESHOLD.large).toBe(3);
    expect(AA_THRESHOLD.ui).toBe(3);
  });
});
