/**
 * Centralized i18n configuration module — the single source of truth for
 * language configuration.
 *
 * Routing (decision D-W1, docs/DECISIONS.md): English is canonical and
 * served at the site root with no prefix; every other language lives under
 * `/{code}` and is served by the single `src/pages/[lang]/` dynamic tree.
 * Every URL prefix derives from the LANGUAGES registry below — never
 * hardcode `'/es'` in a component; use `getUrlPrefix(lang)`.
 *
 * To add a new language (the whole procedure — no routing edits):
 *   1. Add the code in `./language-codes.ts` and its entry to LANGUAGES below
 *   2. Create `./translations/{code}.ts` (the exhaustive type forces
 *      completeness)
 *   3. Create its content folders (`src/content/docs/{code}/`, …)
 * The `[lang]` tree, the switcher, hreflang and the sitemap all derive from
 * the registry.
 */
import { LANGUAGE_CODES } from './language-codes';

export { LANGUAGE_CODES };

/** Supported language codes (source: `./language-codes.ts`). */
export type Language = (typeof LANGUAGE_CODES)[number];

/**
 * Default language — served at the site root with no prefix (D-W1: the
 * normative payload is English by policy; standards live in English at the
 * root). The default language MUST be the one whose `urlPrefix` is `''`.
 * Spanish stays first-class at `/es` — and the PROTOCOL's feed-string
 * baseline stays `es` regardless of site topology (different decisions).
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/** Metadata for a supported language */
export interface LanguageConfig {
  /** ISO language code */
  code: Language;
  /** English name */
  name: string;
  /** Native name (displayed in language selector) */
  nativeName: string;
  /** BCP 47 locale for date formatting (e.g. 'en-US') */
  dateLocale: string;
  /** OpenGraph locale (e.g. 'en_US') */
  ogLocale: string;
  /** Flag emoji for UI display */
  flag: string;
  /** URL path prefix (empty string for default language) */
  urlPrefix: string;
}

/**
 * Language registry — add new languages here.
 * The default language MUST have an empty urlPrefix.
 */
export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dateLocale: 'en-US',
    ogLocale: 'en_US',
    flag: '\u{1F1EC}\u{1F1E7}',
    urlPrefix: '',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Espa\u00F1ol',
    dateLocale: 'es-CO',
    ogLocale: 'es_CO',
    flag: '\u{1F1E8}\u{1F1F4}',
    urlPrefix: '/es',
  },
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/** Get all supported language codes */
export function getSupportedLanguages(): Language[] {
  return Object.keys(LANGUAGES) as Language[];
}

/** Get metadata for a specific language */
export function getLanguageConfig(lang: Language): LanguageConfig {
  return LANGUAGES[lang];
}

/** Get the default language */
export function getDefaultLanguage(): Language {
  return DEFAULT_LANGUAGE;
}

/** Check if a string is a valid language code */
export function isValidLanguage(value: string): value is Language {
  return value in LANGUAGES;
}

/** Check if a language is the default language */
export function isDefaultLanguage(lang: Language): boolean {
  return lang === DEFAULT_LANGUAGE;
}

/** Get URL prefix for a language (empty string for default) */
export function getUrlPrefix(lang: Language): string {
  return LANGUAGES[lang].urlPrefix;
}

/** Get BCP 47 date locale string */
export function getDateLocale(lang: Language): string {
  return LANGUAGES[lang].dateLocale;
}

/** Get OpenGraph locale string */
export function getOGLocale(lang: Language): string {
  return LANGUAGES[lang].ogLocale;
}

/** Get flag emoji for a language */
export function getFlag(lang: Language): string {
  return LANGUAGES[lang].flag;
}

/** Build a localized URL path */
export function getLocalizedUrl(path: string, lang: Language): string {
  const prefix = getUrlPrefix(lang);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${cleanPath}`;
}

/** Strip language prefix from a URL path to get the base path */
export function stripLangPrefix(path: string): string {
  for (const lang of getSupportedLanguages()) {
    const prefix = getUrlPrefix(lang);
    if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) {
      return path.slice(prefix.length) || '/';
    }
  }
  return path;
}

/** Detect language from a URL path */
export function getLangFromUrl(pathname: string): Language {
  for (const lang of getSupportedLanguages()) {
    const prefix = getUrlPrefix(lang);
    if (
      prefix &&
      (pathname === prefix ||
        pathname === `${prefix}/` ||
        pathname.startsWith(`${prefix}/`))
    ) {
      return lang;
    }
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Get alternate language URLs for the current path (for hreflang tags and
 * language selector links).
 */
export function getAlternateUrls(
  currentPath: string
): { lang: Language; url: string }[] {
  const basePath = stripLangPrefix(currentPath);
  return getSupportedLanguages().map((lang) => ({
    lang,
    url: getLocalizedUrl(basePath, lang),
  }));
}

/**
 * Localized value used by collections that carry Spanish and English copy
 * verticals, sponsors, etc.) — accepts either a plain string (language-
 * neutral, rendered as-is) or a `{ en, es }` object.
 */
export type I18nValue =
  | string
  | { en?: string; es?: string }
  | undefined
  | null;

/**
 * Resolve an `i18nString` field for a target language, returning a single
 * string. Falls back across languages so callers always get a renderable
 * string when at least one language has content.
 */
export function tr(value: I18nValue, lang: Language): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? value.en ?? value.es ?? '';
}
