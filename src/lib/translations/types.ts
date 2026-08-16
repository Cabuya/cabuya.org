/**
 * Translation type definitions
 *
 * Defines the shape of all translation objects.
 * Each locale file (en.ts, es.ts) must satisfy the SiteTranslations interface.
 */

export type PassionIcon = 'users' | 'heart' | 'shield' | 'sparkles' | 'eye';

export interface PagePassion {
  title: string;
  description: string;
  icon: PassionIcon;
  link: string;
}

/**
 * One block inside an institutional page. The shape is deliberately small:
 * these pages explain a model, and a model is prose, an ordered sequence, a
 * set of parallel facts, or a warning. Anything else belongs on its own page.
 */
/**
 * An image inside an institutional page.
 *
 * `srcBase` + `widths` name a responsive set produced by the asset pipeline
 * (`{srcBase}-{width}.webp`), so the renderer derives `src` and `srcset`
 * instead of every page hand-writing them.
 *
 * A screenshot of the application MUST carry a `caption` declaring that the
 * data shown is live application data — this site never states a figure of its
 * own (AGENTS.md rule 0).
 */
export interface InstitutionalFigure {
  srcBase: string;
  widths: number[];
  alt: string;
  /** Intrinsic dimensions of the largest variant, for layout stability. */
  width: number;
  height: number;
  caption?: string;
  /**
   * CSS-drawn frame. `plain` is a bordered card; `none` is bare, which is what
   * a transparent illustration needs — a card around it would draw a box the
   * artwork does not have.
   */
  frame?: 'browser' | 'phone' | 'plain' | 'none';
}

export interface InstitutionalStat {
  label: string;
  body: string;
}

export type InstitutionalBlock =
  | { kind: 'prose'; paragraphs: string[] }
  | {
      kind: 'steps';
      steps: { title: string; body: string; figure?: InstitutionalFigure }[];
    }
  | { kind: 'cards'; cards: { title: string; body: string }[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'callout'; tone: 'info' | 'warning'; title: string; body: string }
  /** A standalone captioned image. */
  | { kind: 'figure'; figure: InstitutionalFigure }
  /** Copy beside an image; `reverse` puts the image first at desktop. */
  | {
      kind: 'split';
      paragraphs: string[];
      figure: InstitutionalFigure;
      reverse?: boolean;
    }
  /** Two things that are deliberately not the same thing. */
  | {
      kind: 'statPair';
      items: [InstitutionalStat, InstitutionalStat];
      /** Glyph shown between the pair, e.g. the not-equal sign. */
      relation?: string;
    };

export interface InstitutionalSection {
  heading: string;
  intro?: string;
  blocks: InstitutionalBlock[];
}

export interface InstitutionalLink {
  label: string;
  href: string;
  external?: boolean;
}

/**
 * An institutional page: what Corag is, how it works, what it promises and
 * where the limits are. One shape, rendered by `InstitutionalPage.astro`, so
 * the seven of them cannot drift into seven layouts.
 */
export interface InstitutionalPageCopy {
  title: string;
  /** 130-160 characters — the SEO gate enforces the band. */
  description: string;
  eyebrow: string;
  lead: string;
  /** Fills the hero's second column. Without it the hero draws the brand motif. */
  heroFigure?: InstitutionalFigure;
  /**
   * Heading for the in-page section index. Present only on long,
   * imagery-free policy pages, where navigability is the real need.
   */
  sectionIndexLabel?: string;
  sections: InstitutionalSection[];
  cta: {
    title: string;
    body: string;
    primary: InstitutionalLink;
    secondary?: InstitutionalLink;
  };
}

export interface HomePillar {
  title: string;
  body: string;
}

export interface HomeStep {
  title: string;
  body: string;
}

/**
 * Home page copy, structured around the six-beat argument in docs/MESSAGING.md:
 *   1 la intención existe → 2 la conexión falla → 3 Corag es el puente →
 *   4 el puente se sostiene con evidencia → 5 Ayuda Directa → 6 únete al movimiento
 *
 * The home page is the only surface that runs all six beats.
 */
export interface HomeCopy {
  // Beat 3 + the coraje statement
  eyebrow: string;
  title: string;
  lead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  /** Three verb-phrase chips under the hero CTAs, drawn from the howSteps vocabulary. */
  heroChips: string[];
  /** Alt text for the phone-framed app screenshot overlapping the hero photo. */
  heroAppCardAlt: string;

  // Beats 1 + 2 — the intent exists, the connection fails
  problemEyebrow: string;
  problemTitle: string;
  problemBody: string;
  problemFragments: string[];

  // Beat 3 expanded — how the bridge works
  howEyebrow: string;
  howTitle: string;
  howBody: string;
  howSteps: HomeStep[];
  howCta: string;
  /** Accessible label for the five-step pipeline list. */
  howStepsAria: string;

  // Beat 4 — evidence
  trustEyebrow: string;
  trustTitle: string;
  trustBody: string;
  pillars: HomePillar[];
  /** Beat-4 honesty line: the real numbers live in the application. Never contains digits. */
  trustHonestyLine: string;
  trustCta: string;

  // Beat 5 — the flagship product
  productEyebrow: string;
  productTitle: string;
  productBody: string;
  productCta: string;
  productPhotoAlt: string;
  /** Rule-0 framing under the device composition: real app views, live data. */
  productUiCaption: string;
  productScreenshotDesktopAlt: string;
  productScreenshotMobileAlt: string;

  // Interoperability — the developer thesis
  devEyebrow: string;
  devTitle: string;
  devBody: string;
  devCta: string;
  /** Endpoint label on the code panel — literal in both locales. */
  devCodeTitle: string;
  /** Lead-in for the API category chips (values come from HELP_CATEGORIES). */
  devCategoriesLabel: string;

  // Beat 6 — the invitation
  closingTitle: string;
  closingBody: string;
  closingCtaApp: string;
  closingCtaTeam: string;
  /** Lead-in for the official-channels strip in the closing act. */
  closingChannelsTitle: string;
  /** Label for the application pill in the channels strip. */
  closingChannelApp: string;
}

export interface SiteTranslations {
  home: HomeCopy;
  // Site metadata
  siteTitle: string;
  siteTitleFull: string;
  siteDescription: string;

  // Navigation
  nav: {
    /**
     * The application CTA in the chrome. Phrased as the act, not the
     * destination — see the `appCta` copy rule below.
     */
    app: string;
    home: string;
    /** Trigger label for the "How Corag works" dropdown. */
    howCoragWorks: string;
    howItWorks: string;
    transparency: string;
    emergencies: string;
    leaders: string;
    partners: string;
    ecosystem: string;
    developers: string;
    blog: string;
    about: string;
    contact: string;
    /** Label for the header dropdown holding community + policy links. */
    community: string;
    movement: string;
    channels: string;
    contributing: string;
    governance: string;
    conduct: string;
    privacy: string;
    menu: string;
    closeMenu: string;
    openMenu: string;
  };

  /**
   * Every route into the application. This site explains the model; the
   * application is where a need gets published, help gets offered and evidence
   * gets uploaded — so these strings carry the only conversion the site has.
   *
   * Two copy rules, and the second outranks the first:
   *
   * 1. Verb + concrete benefit. "Go to the app" names a destination; "I want
   *    to help" names an act.
   * 2. **Never address only the giver.** The application serves the person who
   *    needs help just as much as the person offering it, so the persistent
   *    chrome must read as a door for both. Only inside the invite block, where
   *    there is room for two buttons, does the copy split by intent.
   */
  appCta: {
    /**
     * Mobile header pill. Short enough not to displace the wordmark, and a
     * noun rather than a verb so it reads both ways.
     */
    short: string;
    /** Accessible name for the pill, which shows an abbreviated label. */
    shortAria: string;
    /** The floating invitation — one line, so it carries the differentiator. */
    floating: {
      lead: string;
      action: string;
      dismiss: string;
    };
    /** The in-content invitation block, which has room to explain. */
    invite: {
      eyebrow: string;
      title: string;
      body: string;
      /** For the person offering help. */
      primary: string;
      /** For the person who needs it. */
      secondary: string;
      /** The evidence — quieter, because it backs the other two. */
      tertiary: string;
    };
  };

  // Footer
  footer: {
    copyright: string;
    allRightsReserved: string;
    tagline: string;
    /** Reminder that transactional actions live in the application. */
    appNote: string;
  };

  // Homepage sections
  homeSections: {
    latestArticles: string;
    viewAllPosts: string;
  };

  // Contact section (homepage)
  contact: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendButton: string;
  };

  // About page
  aboutPage: {
    title: string;
    subtitle: string;
    description: string;
    heroDescription: string;
    bioTitle: string;
    /** Alt text for the origin-story illustration beside the bio. */
    bioIllustrationAlt: string;
    bioText: string;
    passionsTitle: string;
    passions: PagePassion[];
    quickFactsTitle: string;
    quickFacts: string[];
    ctaTitle: string;
    ctaDescription: string;
    ctaApp: string;
    ctaContact: string;
  };

  // Contact page
  contactPage: {
    title: string;
    subtitle: string;
    description: string;
    heroDescription: string;
    /**
     * The panel shown ABOVE the form. Requesting or offering aid happens in the
     * application; a form here that quietly swallowed an emergency need would be
     * a real harm, not a UX flaw.
     */
    appNoticeTitle: string;
    appNoticeBody: string;
    appNoticeCta: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    reasonLabel: string;
    reasonOptions: { value: string; label: string }[];
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendButton: string;
    sendingButton: string;
    successTitle: string;
    successMessage: string;
    successNextSteps: Record<string, string>;
    sendAnotherButton: string;
    requiredField: string;
    invalidEmail: string;
    submitError: string;
    fallbackMessage: string;
    formNote: string;
    quickLinksTitle: string;
    quickLinks: { label: string; href: string; description: string }[];
  };

  conductForm: {
    formEyebrow: string;
    formSectionTitle: string;
    privacyNote: string;
    incidentLabel: string;
    incidentPlaceholder: string;
    whenLabel: string;
    whenPlaceholder: string;
    peopleLabel: string;
    peoplePlaceholder: string;
    anonymousLabel: string;
    anonymousHint: string;
    nameLabel: string;
    emailLabel: string;
    followupLabel: string;
    followupPlaceholder: string;
    submitButton: string;
    successTitle: string;
    successMessage: string;
  };

  /**
   * `/movement` — what Corag is as a collective, and why this page carries no
   * roster.
   *
   * It replaced a directory of named people and allied organizations. That was
   * a deliberate product decision, not a data gap: a movement that presents
   * itself through representatives asks you to trust the representatives. The
   * copy has to make the absence read as a position, or it reads as an
   * unfinished page.
   *
   * Two rules for anything added here:
   * - **No names.** No people, no partner organizations, no communities.
   * - **No counts.** A roster of zero is honest; "hundreds of volunteers" is a
   *   figure we would have to keep true, and rule 0 applies to this page as
   *   much as to any other.
   */
  movementPage: {
    title: string;
    description: string;
    eyebrow: string;
    /** Describes what the crowd forms — the image carries the argument too. */
    illustrationAlt: string;
    lead: string;
    /** Three short statements. Deliberately not cards — this page is spare. */
    beats: ReadonlyArray<{ title: string; body: string }>;
    /** Answers the question the missing roster provokes. */
    closingTitle: string;
    closingBody: string;
    /** Link out to the channels, the one place people actually gather. */
    channelsLabel: string;
  };

  // Homepage Let's Connect section
  contactSection: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };

  // Search input
  searchPlaceholder: string;
  searchHint: string;
  clearSearch: string;
  resultsFound: (count: number) => string;

  // Loading states
  loadingIndex: string;
  searching: string;

  // Results
  noResults: (query: string) => string;
  noResultsSuggestion: string;
  noPostsAvailable: string;

  // Pagination
  previous: string;
  next: string;
  pageOf: (current: number, total: number) => string;

  // Blog header
  blogTitle: string;
  blogHeading: string;
  blogDescription: string;
  allPosts: string;
  showingArticles: (showing: number, total: number) => string;
  articlesAvailable: (total: number) => string;
  lastUpdatedOn: string;
  readingTime: (minutes: number) => string;
  relatedArticles: string;
  relatedArticlesDescription: string;

  // Series navigation
  seriesPartOf: string;
  seriesChapter: (n: number) => string;
  seriesPrevious: string;
  seriesNext: string;
  seriesToC: string;
  seriesChapterOf: (current: number, total: number) => string;

  // Series pages
  seriesPage: {
    title: string;
    breadcrumb: string;
    chapters: string;
    chapter: string;
    progress: (current: number, total: number) => string;
    readChapter: string;
    emptyState: string;
    backToSeries: string;
    backToBlog: string;
    startReading: string;
    continueReading: string;
  };
  seriesListingPage: {
    title: string;
    description: string;
    heading: string;
    postsCount: (count: number) => string;
    exploreSeries: string;
    emptyState: string;
  };

  // Scheduled posts (dev-only indicators)
  scheduledBadge: string;
  scheduledBannerTitle: string;
  scheduledBannerMessage: (date: string) => string;

  // Draft posts (dev + preview indicators)
  draftBadge: string;
  draftBannerTitle: string;
  draftBannerMessage: string;

  // Tags (unified — covers primary, secondary, and subtopic tiers)
  postsTagged: (tag: string) => string;
  allTags: string;
  tagNames: Record<string, string>;
  tagDescriptions: Record<string, string>;

  // Series names and descriptions (keyed by series slug)
  seriesNames: Record<string, string>;
  seriesDescriptions: Record<string, string>;

  // Date formatting
  dateLocale: string;

  // Read more
  readMore: string;

  // Scroll to timeline
  scrollToTimeline: string;
  viewLabel: (label: string) => string;

  // 404 page
  notFoundPage: {
    title: string;
    description: string;
    heading: string;
    message: string;
    eyebrow: string;
    backHome: string;
    searchBlog: string;
    /** Into the application — the most useful place to send someone who is lost. */
    appCta: string;
  };

  // Blog post engagement
  engagement: {
    // Share buttons
    shareTitle: string;
    shareSeriesTitle: string;
    shareOnTwitter: string;
    shareOnLinkedIn: string;
    shareOnWhatsApp: string;
    copyLink: string;
    linkCopied: string;

    // Newsletter
    newsletterTitle: string;
    newsletterDescription: string;
    newsletterPlaceholder: string;
    newsletterButton: string;
    newsletterSubmitting: string;
    newsletterSuccessTitle: string;
    newsletterSuccessMessage: string;
    newsletterInvalidEmail: string;
    newsletterAlreadySubscribed: string;
    newsletterResubscribe: string;
    newsletterPrivacy: string;

    // End-of-post CTA
    ctaTitle: string;
    ctaDescription: string;
  };

  // Slides / deck pages
  slides: {
    exitToCatalog: string;
    printPdf: string;
    languageSwitch: string;
    external: {
      openCta: string;
      backToCatalog: string;
    };
    languageNotice: string;
    typeBadge: {
      native: string;
      external: string;
    };
    toolbar: {
      backToCatalog: string;
      switchLang: string;
      themeToLight: string;
      themeToDark: string;
      enterFullscreen: string;
      exitFullscreen: string;
    };
  };

  // Blog engagement (author + share)
  blogEngagement: {
    aboutAuthor: string;
    writtenBy: string;
  };

  // Institutional pages (how it works, transparency, emergencies, leaders,
  // partners, developers, privacy)
  howItWorksPage: InstitutionalPageCopy;
  transparencyPage: InstitutionalPageCopy;
  emergenciesPage: InstitutionalPageCopy;
  leadersPage: InstitutionalPageCopy;
  partnersPage: InstitutionalPageCopy;
  developersPage: InstitutionalPageCopy;
  privacyPage: InstitutionalPageCopy;

  /** Complementary apps network directory + join form. */
  ecosystemPage: {
    title: string;
    description: string;
    eyebrow: string;
    headline: string;
    lead: string;
    ctaApp: string;
    ctaDirectory: string;
    ctaHow: string;
    featuredEyebrow: string;
    featuredImageAlt: string;
    directoryEyebrow: string;
    directoryTitle: string;
    directoryLead: string;
    categories: {
      matching: string;
      damage: string;
      logistics: string;
      pets: string;
      people: string;
    };
    categoryLeads: {
      matching: string;
      damage: string;
      logistics: string;
      pets: string;
      people: string;
    };
    whatLabel: string;
    howLabel: string;
    visit: string;
    apiDocs: string;
    moreInfo: string;
    close: string;
    overview: string;
    features: string;
    tools: string;
    audience: string;
    coverage: string;
    limits: string;
    integrations: string;
    publicApi: string;
    publicMcp: string;
    availabilityYes: string;
    availabilityNo: string;
    availabilityUnknown: string;
    openApi: string;
    mcpEndpoint: string;
    developers: string;
    badgeApi: string;
    badgeMcp: string;
    disclosure: string;
    joinEyebrow: string;
    joinTitle: string;
    joinLead: string;
    joinForm: {
      disclaimer: string;
      appName: string;
      appUrl: string;
      what: string;
      how: string;
      category: string;
      categoryPlaceholder: string;
      catMatching: string;
      catDamage: string;
      catLogistics: string;
      catPets: string;
      catPeople: string;
      catOther: string;
      contactName: string;
      contactEmail: string;
      notes: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      errRequired: string;
      errEmail: string;
      errUrl: string;
      errCategory: string;
      errSubmit: string;
    };
  };

  // Errors
  searchError: string;
  loadError: string;
  retry: string;
}
