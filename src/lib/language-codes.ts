/**
 * The dependency-free language-code registry.
 *
 * Kept separate from `i18n.ts` so build-level code (Astro config, gate
 * scripts) can import the list without pulling the full i18n module. Adding a
 * language starts here — see docs/I18N_GUIDE.md §4 for the whole (three-step)
 * procedure. The exhaustive translation type makes an incomplete language a
 * compile error, so this list can never outrun the translations.
 */
export const LANGUAGE_CODES = ['en', 'es'] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];
