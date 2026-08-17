/**
 * Guards the translation layer: both languages implement the exhaustive
 * contract, and the Spanish is actually Spanish (orthography spot checks).
 */
import { describe, expect, it } from 'vitest';

import { en } from '@/lib/translations/en';
import { es } from '@/lib/translations/es';

const flatten = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );

describe('structural completeness', () => {
  it('both languages expose the identical key set', () => {
    expect(flatten(en).sort()).toEqual(flatten(es).sort());
  });

  it('no value is empty in either language', () => {
    const empties = (o: object, lang: string): string[] =>
      flatten(o)
        .filter((key) => {
          const value = key
            .split('.')
            .reduce<unknown>(
              (acc, part) => (acc as Record<string, unknown>)?.[part],
              o
            );
          return typeof value !== 'string' || value.trim() === '';
        })
        .map((k) => `${lang}:${k}`);
    expect([...empties(en, 'en'), ...empties(es, 'es')]).toEqual([]);
  });
});

describe('language integrity', () => {
  it('the Spanish carries Spanish orthography where expected', () => {
    // Spot checks on strings that must carry accents (the elevator pitch is
    // verbatim from the brand book and legitimately has none).
    expect(es.home.hero.ctaSecondary).toMatch(/ó|í|é|á|ú|ñ/);
    expect(es.home.network.proposedExplainer).toMatch(/ó|í|é|á|ú|ñ/);
    expect(es.home.horizon.stages[0].body).toMatch(/ó|í|é|á|ú|ñ/);
    expect(es.nav.openMenu).toMatch(/ú/); // «menú»
    // The hero's own copy is short and accent-free by construction, so the
    // longest prose block on the landing carries the check for that page.
    expect(es.home.thesis.body).toMatch(/ó|í|é|á|ú|ñ/);
    expect(es.notFoundPage.title).toMatch(/á|é|í|ó|ú|ñ/);
    // The bare-word failures the orthography gate greps for:
    for (const banned of ['pagina', 'codigo', 'version ', 'analisis']) {
      expect(JSON.stringify(es).toLowerCase()).not.toContain(` ${banned}`);
    }
  });

  it('English strings do not leak Spanish scaffolding (switcher label excepted)', () => {
    const { nav, ...rest } = en;
    expect(JSON.stringify(rest)).not.toMatch(/¿|¡/);
    // The switcher label is intentionally in the target language:
    expect(nav.switchToLanguage).toContain('español');
    expect(es.nav.switchToLanguage).toContain('English');
  });

  it('the founding principle appears verbatim in both footers', () => {
    const principle = '«Crecemos juntos: no competimos, nos alimentamos.»';
    expect(en.footer.principle).toBe(principle);
    expect(es.footer.principle).toBe(principle);
  });
});
