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

  /** The developers portal's chrome. */
  docs: {
    portal: string;
    sidebar: string;
    breadcrumb: string;
    pagination: string;
    previous: string;
    next: string;
    onThisPage: string;
    openNav: string;
    closeNav: string;
    updated: string;
    copy: string;
    copied: string;
    copyFailed: string;
    copyAsMarkdown: string;
    viewMarkdown: string;
    field: string;
    type: string;
    required: string;
    description: string;
    yes: string;
    no: string;
    specifiedNotMeasured: string;
  };

  /** The portal home page. */
  portal: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
    promiseTitle: string;
    promiseBody: string;
    transportsTitle: string;
    transportsLead: string;
    pathsTitle: string;
    pathsLead: string;
    paths: Array<{ title: string; body: string; forWhom: string }>;
    startTitle: string;
    startBody: string;
  };

  /** The quickstart — the page the adoption case rests on. */
  quickstart: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;

    /** The two entry paths, agent first. */
    agentPathTitle: string;
    agentPathBody: string;
    handPathTitle: string;
    handPathBody: string;

    fileFirstTitle: string;
    fileFirstBody: string;

    steps: Array<{ title: string; body: string }>;

    spaTitle: string;
    spaLead: string;
    spaWhy: string;

    piiTitle: string;
    piiLead: string;
    piiKeysLabel: string;
    piiPatternsLabel: string;
    piiConfirm: string;

    validatorTitle: string;
    validatorLead: string;
    validatorPending: string;
    validatorOpen: string;

    honestyTitle: string;
    honestyBody: string;
    honestyAfternoon: string;
  };

  /** The specification reader and the schema reference. */
  spec: {
    indexTitle: string;
    indexDescription: string;
    indexLead: string;
    versionLabel: string;
    statusLabels: Record<string, string>;
    permanenceTitle: string;
    permanenceBody: string;
    rcRuleTitle: string;
    rcRuleBody: string;
    sectionsTitle: string;
    /** Mid-sentence form, e.g. "10 sections" — casing differs by language. */
    sectionsCountLabel: string;
    /** The notice on Spanish spec routes. */
    normativeLanguageNotice: string;
    schemasTitle: string;
    schemasDescription: string;
    schemasLead: string;
    schemaIdLabel: string;
    fieldsTitle: string;
    checksColumn: string;
    profileColumn: string;
    exampleColumn: string;
    coreLabel: string;
    extendedLabel: string;
    examplesTitle: string;
    examplesLead: string;
    validLabel: string;
    invalidLabel: string;
    teachingNote: string;
  };

  /** The validator surfaces. */
  validator: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    urlModeTitle: string;
    urlModeLead: string;
    urlLabel: string;
    urlPlaceholder: string;
    run: string;
    running: string;
    pasteModeTitle: string;
    pasteModeLead: string;
    pastePrivacy: string;
    pasteLabel: string;
    pastePlaceholder: string;
    kindLabel: string;
    kindFeed: string;
    kindManifest: string;
    /** Result chrome. */
    resultTitle: string;
    blockersTitle: string;
    errorsTitle: string;
    warningsTitle: string;
    notesTitle: string;
    noFindings: string;
    copyReport: string;
    copied: string;
    fixLabel: string;
    ruleLabel: string;
    specLabel: string;
    checkLabel: string;
    /** Honest failure states. */
    unavailableTitle: string;
    unavailableBody: string;
    transportTitle: string;
    transportBody: string;
    parseErrorTitle: string;
    parseErrorBody: string;
    degradedNote: string;
  };

  /** The probe explanation page — the URL our User-Agent carries. */
  probe: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    uaTitle: string;
    uaBody: string;
    whatTitle: string;
    whatItems: string[];
    politenessTitle: string;
    politenessItems: string[];
    retentionTitle: string;
    retentionBody: string;
    optOutTitle: string;
    optOutBody: string;
  };

  /** The check catalogue. */
  checks: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    stableNote: string;
    implementedLabel: string;
    /** Mid-sentence form: "42 implemented". Casing differs by language. */
    implementedCountLabel: string;
    plannedLabel: string;
    severityLabel: string;
    levelLabel: string;
    familyLabels: Record<string, string>;
    ruleLabel: string;
    fixLabel: string;
    specLabel: string;
    countSummary: string;
    /** Shown on non-English pages: which entries are still English, and why. */
    untranslatedNote: string;
  };

  /** The specification changelog, one timeline. */
  changelog: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    scopeTitle: string;
    scopeBody: string;
    unreleased: string;
    nothingYet: string;
    otherTracksTitle: string;
    otherTracksBody: string;
    /**
     * The notice the language gate requires before a page may render English
     * on a Spanish route. Without it the exemption does not apply.
     */
    quotedNotice: string;

    /** Keep a Changelog group names, lowercased as keys. */
    groupLabels: Record<string, string>;
  };

  /** The RFC index and the individual RFC pages. */
  rfcs: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    processTitle: string;
    processBody: string;
    whoTitle: string;
    whoBody: string;
    privacyTitle: string;
    privacyBody: string;
    columnRfc: string;
    columnTitle: string;
    columnTier: string;
    columnStatus: string;
    columnOpened: string;
    columnDecided: string;
    statusLabels: Record<string, string>;
    tierLabels: Record<string, string>;
    emptyIndex: string;
    templateLink: string;
    backToIndex: string;
    openedLabel: string;
    decidedLabel: string;
    notDecided: string;
    sourceLabel: string;
    /**
     * The notice the language gate requires before a page may render English
     * on a Spanish route. Without it the exemption does not apply.
     */
    quotedNotice: string;
  };

  /** Pages that render a repository-root document. */
  rootDocs: {
    /** Screen-reader suffix on the link to the source file. */
    sourceLinkSuffix: string;
    /** The standing note explaining that the file, not the page, governs. */
    sourceNote: string;
  };

  /** The public registry: the index, the publisher pages, the badge. */
  registry: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    /** The two sentences that must be printed in both languages. */
    notEndorsementTitle: string;
    notEndorsement: string;
    everyEntryMeasured: string;
    /** Column headers of the server-rendered table. */
    columnPublisher: string;
    columnState: string;
    columnLevel: string;
    columnDomains: string;
    columnChecked: string;
    /** Filter island. */
    filterTitle: string;
    filterAll: string;
    filterState: string;
    filterDomain: string;
    filterReview: string;
    filterSearch: string;
    filterSearchPlaceholder: string;
    filterEmpty: string;
    filterShowing: string;
    /** Review states from the git tree — never a measurement. */
    reviewProposed: string;
    reviewReviewed: string;
    reviewTitle: string;
    reviewBody: string;
    /** Official sources: listed, not adopting. */
    officialSourcesTitle: string;
    officialSourcesBody: string;
    officialAuthorityLabel: string;
    /** Licensing note on the index. */
    licenceTitle: string;
    licenceBody: string;
    /** How to get listed. */
    joinTitle: string;
    joinBody: string;
    /** Publisher page. */
    measuredTitle: string;
    measuredBody: string;
    declaredTitle: string;
    declaredBody: string;
    stateLabel: string;
    levelLabel: string;
    checkedLabel: string;
    neverMeasured: string;
    failingChecksTitle: string;
    failingChecksBody: string;
    historyTitle: string;
    historyBody: string;
    historyEmpty: string;
    feedsTitle: string;
    canonicalLabel: string;
    domainsLabel: string;
    eventsLabel: string;
    addedLabel: string;
    confirmedLabel: string;
    unconfirmedNote: string;
    notesLabel: string;
    embedTitle: string;
    embedBody: string;
    embedMarkdown: string;
    embedHtml: string;
    backToIndex: string;
    /**
     * Publisher-page meta description. `{id}`, `{host}`, `{state}` and
     * `{domains}` are substituted — one description per entry, because eight
     * pages sharing one is eight pages a search engine treats as one.
     */
    publisherMetaDescription: string;
    /** Staleness of the page itself, when no KV read path was available. */
    buildTimeOnlyNote: string;
    domainLabels: Record<string, string>;
  };

  markdown: {
    /** Heading labels used by the agent-Markdown serializer */
    siteNavigation: string;
    languageNote: string;
  };
}
