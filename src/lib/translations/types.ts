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

    hero: {
      eyebrow: string;
      title: string;
      pitch: string;
      pitchSecond: string;
      ctaPrimary: string;
      ctaSecondary: string;
      /** Shown under the CTAs while the routes they point at do not exist. */
      ctaPending: string;
    };

    thesis: {
      kicker: string;
      principle: string;
      gloss: string;
      body: string;
      bodySecond: string;
      intentNote: string;
    };

    howItWorks: {
      kicker: string;
      title: string;
      lead: string;
      steps: Array<{ title: string; body: string }>;
    };

    ladder: {
      kicker: string;
      title: string;
      lead: string;
      respectNote: string;
    };

    network: {
      kicker: string;
      title: string;
      lead: string;
      tableHead: { publisher: string; domains: string; state: string };
      proposedLabel: string;
      proposedExplainer: string;
      measuredNote: string;
    };

    horizon: {
      kicker: string;
      title: string;
      ambitionLabel: string;
      stages: Array<{ title: string; body: string }>;
    };

    finalCta: {
      title: string;
      body: string;
      developers: string;
      join: string;
      github: string;
    };
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
