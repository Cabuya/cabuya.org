import { describe, expect, it } from 'vitest';

import { en } from '@/lib/translations/en';
import { es } from '@/lib/translations/es';

/**
 * Structure tests for the home copy contract.
 *
 * The evidence act argues that unverified numbers are the problem — so its
 * own copy must never contain one. The no-amounts rule below is the guard
 * against somebody later "filling in" the two-numbers component with
 * plausible-looking figures (AGENTS.md rule 0).
 */

const locales = { es: es.home, en: en.home } as const;

describe('home copy — evidence act (beat 4)', () => {
  for (const [lang, home] of Object.entries(locales)) {
    describe(lang, () => {
      it('carries exactly three pillars', () => {
        expect(home.pillars).toHaveLength(3);
      });

      it('contains no digits or currency in the evidence copy', () => {
        const evidenceCopy = [
          home.trustEyebrow,
          home.trustTitle,
          home.trustBody,
          home.trustHonestyLine,
          ...home.pillars.flatMap((p) => [p.title, p.body]),
        ].join(' ');
        expect(evidenceCopy).not.toMatch(/[\d$€£]/);
      });

      it('has a non-empty honesty line', () => {
        expect(home.trustHonestyLine.length).toBeGreaterThan(20);
      });
    });
  }

  it('keeps the pillar structure parallel across locales', () => {
    expect(locales.es.pillars.length).toBe(locales.en.pillars.length);
  });

  it('agrees with the canonical transparency wording', () => {
    expect(locales.es.pillars[1]?.title).toBe('Utilizado con evidencia');
    expect(locales.en.pillars[1]?.title).toBe('Used with evidence');
  });
});

describe('home copy — full contract', () => {
  for (const [lang, home] of Object.entries(locales)) {
    it(`${lang}: every field is non-empty, recursively`, () => {
      const walk = (value: unknown, path: string): void => {
        if (typeof value === 'string') {
          expect(
            value.trim().length,
            `${path} must not be empty`
          ).toBeGreaterThan(0);
        } else if (Array.isArray(value)) {
          expect(
            value.length,
            `${path} must not be an empty array`
          ).toBeGreaterThan(0);
          value.forEach((item, i) => {
            walk(item, `${path}[${i}]`);
          });
        } else if (value && typeof value === 'object') {
          for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
        }
      };
      walk(home, `home(${lang})`);
    });
  }

  it('keeps array structure parallel across locales', () => {
    expect(locales.es.heroChips.length).toBe(locales.en.heroChips.length);
    expect(locales.es.problemFragments.length).toBe(
      locales.en.problemFragments.length
    );
    expect(locales.es.howSteps.length).toBe(locales.en.howSteps.length);
  });

  it('carries three hero chips and the canonical five pipeline steps', () => {
    expect(locales.es.heroChips).toHaveLength(3);
    expect(locales.es.howSteps).toHaveLength(5);
  });
});
