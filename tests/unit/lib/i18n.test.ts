/**
 * Guards the i18n core under the D-W1 topology: English canonical at `/`,
 * Spanish at `/es`, everything derived from the LANGUAGES registry.
 */
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LANGUAGE,
  getAlternateUrls,
  getDefaultLanguage,
  getLangFromUrl,
  getLanguageConfig,
  getLocalizedUrl,
  getSupportedLanguages,
  getUrlPrefix,
  isDefaultLanguage,
  isValidLanguage,
  LANGUAGE_CODES,
  LANGUAGES,
  stripLangPrefix,
  tr,
} from '@/lib/i18n';

describe('the registry invariants', () => {
  it('English is the default and lives at the root', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(getDefaultLanguage()).toBe('en');
    expect(getUrlPrefix('en')).toBe('');
  });

  it('every non-default language has a non-empty /{code} prefix', () => {
    for (const lang of getSupportedLanguages()) {
      if (lang === DEFAULT_LANGUAGE) continue;
      expect(getUrlPrefix(lang)).toBe(`/${lang}`);
    }
  });

  it('exactly one language has the empty prefix', () => {
    const empty = getSupportedLanguages().filter((l) => getUrlPrefix(l) === '');
    expect(empty).toEqual([DEFAULT_LANGUAGE]);
  });

  it('the registry and the code list agree', () => {
    expect(getSupportedLanguages().sort()).toEqual([...LANGUAGE_CODES].sort());
    expect(Object.keys(LANGUAGES).sort()).toEqual([...LANGUAGE_CODES].sort());
  });

  it('language configs are complete', () => {
    for (const lang of getSupportedLanguages()) {
      const config = getLanguageConfig(lang);
      expect(config.code).toBe(lang);
      expect(config.name).toBeTruthy();
      expect(config.nativeName).toBeTruthy();
      expect(config.dateLocale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(config.ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });
});

describe('validation helpers', () => {
  it('isValidLanguage accepts registered codes and rejects others', () => {
    expect(isValidLanguage('en')).toBe(true);
    expect(isValidLanguage('es')).toBe(true);
    expect(isValidLanguage('fr')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
    expect(isValidLanguage('EN')).toBe(false);
  });

  it('isDefaultLanguage matches the default only', () => {
    expect(isDefaultLanguage('en')).toBe(true);
    expect(isDefaultLanguage('es')).toBe(false);
  });
});

describe('URL construction', () => {
  it('localizes paths per language', () => {
    expect(getLocalizedUrl('/', 'en')).toBe('/');
    expect(getLocalizedUrl('/', 'es')).toBe('/es/');
    expect(getLocalizedUrl('/developers', 'en')).toBe('/developers');
    expect(getLocalizedUrl('/developers', 'es')).toBe('/es/developers');
    expect(getLocalizedUrl('developers', 'es')).toBe('/es/developers');
  });

  it('strips the language prefix back off', () => {
    expect(stripLangPrefix('/es/developers')).toBe('/developers');
    expect(stripLangPrefix('/es')).toBe('/');
    expect(stripLangPrefix('/developers')).toBe('/developers');
    expect(stripLangPrefix('/')).toBe('/');
  });

  it('round-trips localize → strip for every language', () => {
    for (const lang of getSupportedLanguages()) {
      expect(stripLangPrefix(getLocalizedUrl('/x/y', lang))).toBe('/x/y');
    }
  });

  it('does not mistake lookalike paths for prefixes', () => {
    expect(stripLangPrefix('/estonia')).toBe('/estonia');
    expect(getLangFromUrl('/estonia')).toBe('en');
  });
});

describe('language detection from URLs', () => {
  it('detects prefixed languages and defaults everything else', () => {
    expect(getLangFromUrl('/es/')).toBe('es');
    expect(getLangFromUrl('/es/developers')).toBe('es');
    expect(getLangFromUrl('/es')).toBe('es');
    expect(getLangFromUrl('/')).toBe('en');
    expect(getLangFromUrl('/developers')).toBe('en');
  });
});

describe('alternate URLs (hreflang source)', () => {
  it('produces one alternate per language, same base path', () => {
    const alts = getAlternateUrls('/es/developers');
    expect(alts).toHaveLength(getSupportedLanguages().length);
    expect(alts.find((a) => a.lang === 'en')?.url).toBe('/developers');
    expect(alts.find((a) => a.lang === 'es')?.url).toBe('/es/developers');
  });

  it('handles the home page', () => {
    const alts = getAlternateUrls('/');
    expect(alts.find((a) => a.lang === 'en')?.url).toBe('/');
    expect(alts.find((a) => a.lang === 'es')?.url).toBe('/es/');
  });
});

describe('tr (localized value resolution)', () => {
  it('passes strings through and resolves objects with fallback', () => {
    expect(tr('plain', 'es')).toBe('plain');
    expect(tr({ en: 'hello', es: 'hola' }, 'es')).toBe('hola');
    expect(tr({ en: 'hello' }, 'es')).toBe('hello');
    expect(tr({ es: 'hola' }, 'en')).toBe('hola');
    expect(tr(undefined, 'en')).toBe('');
    expect(tr(null, 'es')).toBe('');
  });
});
