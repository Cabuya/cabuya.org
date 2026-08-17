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
  /** One line for the footer column — shorter than the meta description. */
  siteDescriptionShort: string;

  nav: {
    home: string;
    foundingRecord: string;
    github: string;
    openMenu: string;
    closeMenu: string;
    switchToLanguage: string; // label for the language switcher target
    skipToContent: string;
  };

  /** The one standing banner: the spec is a draft under review. */
  specBanner: {
    label: string;
    text: string;
    linkLabel: string;
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
    languages: string;
    specStatus: string;
  };

  notFoundPage: {
    metaTitle: string;
    title: string;
    description: string;
    backHome: string;
    /** Second exit: the portal, for someone who followed a docs link. */
    otherExitLabel: string;
  };

  markdown: {
    /** Heading labels used by the agent-Markdown serializer */
    siteNavigation: string;
    languageNote: string;
  };
}
