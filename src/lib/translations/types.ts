/**
 * The exhaustive translation contract.
 *
 * Every active language file (`en.ts`, `es.ts`, …) must export a complete
 * `SiteTranslations` object — a missing key anywhere is a TYPE ERROR, which
 * is what keeps the languages honest without a process.
 *
 * Keep this interface MINIMAL: keys exist because a live component consumes
 * them. Dead keys are deleted with their consumers (see the Task 7 log).
 */

export interface SiteTranslations {
  /** <html lang> + shared site identity */
  siteTitle: string;
  siteTitleFull: string;
  siteDescription: string;

  nav: {
    home: string;
    foundingRecord: string;
    github: string;
    openMenu: string;
    closeMenu: string;
    switchToLanguage: string; // label for the language switcher target
  };

  theme: {
    toLight: string;
    toDark: string;
  };

  home: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    pitch: string;
    pitchSecond: string;
    principleGloss: string;
    statusNote: string;
  };

  footer: {
    principle: string;
    principleGloss: string;
    license: string;
    sourceCode: string;
    foundingRecord: string;
  };

  notFoundPage: {
    metaTitle: string;
    title: string;
    description: string;
    backHome: string;
  };

  markdown: {
    /** Heading labels used by the agent-Markdown serializer */
    siteNavigation: string;
    languageNote: string;
  };
}
