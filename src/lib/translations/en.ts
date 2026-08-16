/**
 * English translations
 */

import { APP_URL } from '@/lib/constances';

import type { SiteTranslations } from './types';

export const en: SiteTranslations = {
  // Site metadata
  home: {
    eyebrow: 'The social impact ecosystem',
    title: 'We have the courage to serve and transform lives',
    lead: 'We connect people who want to help with those who need it most, so aid is transparent, measurable and consistent. Every delivery leaves evidence behind.',
    ctaPrimary: 'I want to help',
    ctaSecondary: 'How it works',
    heroChips: ['It is published', 'It is delivered', 'The evidence stays'],
    heroAppCardAlt:
      'Ayuda Directa application screen on a phone, showing the highest-priority emergency',

    problemEyebrow: 'The problem',
    problemTitle: 'The intent is there. The connection is what fails.',
    problemBody:
      'Plenty of people want to give or get involved, but cannot find a way to do it that feels trustworthy, close and meaningful. Generosity is not the scarce resource — connection is. Aid ends up scattered across places that never talk to each other.',
    problemFragments: [
      'WhatsApp threads',
      'One-off forms',
      'Spreadsheets',
      'Phone calls',
      'Posts that get buried',
      'Lists nobody updates',
    ],

    howEyebrow: 'How it works',
    howTitle: 'A bridge between the person who needs and the person who can',
    howBody:
      'A need is published, located and categorized. Someone who can help finds it. It gets coordinated, delivered, and what happened is on the record.',
    howSteps: [
      {
        title: 'It is published',
        body: 'A person or community records what they need, where, and how urgently. It stays visible to the network, not buried in a chat.',
      },
      {
        title: 'A responsable takes it on',
        body: 'Someone with a name, a validated identity and a verified connection to the area owns the delivery.',
      },
      {
        title: 'Someone contributes',
        body: 'The contribution goes by direct transfer to the responsable’s verified account, with no intermediaries.',
      },
      {
        title: 'It is delivered',
        body: 'The responsable buys, transports and delivers — and records what was delivered, to how many people, and when.',
      },
      {
        title: 'The evidence stays',
        body: 'Photos and receipts go through review, and only then get published. Until then the contribution counts as received, not as used.',
      },
    ],
    howCta: 'See the whole path',
    howStepsAria: 'The five steps of an aid’s journey',

    trustEyebrow: 'Transparency',
    trustTitle:
      'Saying you are transparent is easy. Publishing the receipt takes courage.',
    trustBody:
      'That is why every contribution has a named person behind it and every peso has a destination you can check. We publish two separate numbers, and both are public.',
    pillars: [
      {
        title: 'Received',
        body: 'How much came in. It is the easy number to show, and on its own it says nothing.',
      },
      {
        title: 'Used with evidence',
        body: 'How much was spent with verified proof: receipts, photos, results. This is the number that matters.',
      },
      {
        title: 'Direct transfer',
        body: 'Money goes to verified leaders’ accounts, not to a central treasury. Every contribution is attributable.',
      },
    ],
    trustHonestyLine:
      'The real numbers live in the application, always current. Every contribution is attributable to a responsable and to its evidence.',
    trustCta: 'How traceability works',

    productEyebrow: 'Flagship product',
    productTitle: 'Ayuda Directa',
    productBody:
      'Publishing a need, offering help, contributing and tracking your contribution all happen in the application. That is where the map, the operational fronts, the responsables and the evidence live.',
    productCta: 'Join the movement',
    productPhotoAlt:
      'Two volunteers hand a parcel of groceries to a man in a rural settlement',
    productUiCaption:
      'Real views of the application. What you see is live application data at capture time.',
    productScreenshotDesktopAlt:
      'Ayuda Directa home screen on desktop, with the priority emergency and the live global progress',
    productScreenshotMobileAlt:
      'Ayuda Directa "How do you want to help?" flow on a phone',

    devEyebrow: 'Interoperability',
    devTitle: 'Many interfaces, one network of data',
    devBody:
      'During an emergency several applications appear at once, each with its own database of needs. The result is more fragmentation, not less. That is why we publish an open API: so a new application becomes a client of the same network rather than another silo.',
    devCta: 'Developer documentation',
    devCodeTitle: 'POST /api/public/v1/help',
    devCategoriesLabel: 'Real API categories',

    closingTitle: 'Will you join?',
    closingBody:
      'If you want to help, contribute or publish a need, that happens in the application. If you build software, want to become an ally, or want to join the team, start here.',
    closingCtaApp: 'Go to the app',
    closingCtaTeam: 'I want to contribute',
    closingChannelsTitle: 'Official channels',
    closingChannelApp: 'Ayuda Directa',
  },
  siteTitle: 'Corag',
  siteTitleFull: 'Corag — The social impact ecosystem',
  siteDescription:
    'We connect people who want to help with those who need it most, so aid is transparent, measurable and consistent. Every delivery leaves evidence behind.',

  // Navigation
  nav: {
    app: 'Give or get help',
    home: 'Home',
    howCoragWorks: 'How it works',
    howItWorks: 'How it works',
    transparency: 'Transparency',
    emergencies: 'Emergencies',
    leaders: 'Leaders',
    partners: 'Partners',
    ecosystem: 'Ecosystem',
    developers: 'Developers',
    blog: 'Blog',
    about: 'About Corag',
    contact: 'Contact',
    community: 'Community',
    movement: 'Serving takes courage',
    channels: 'Channels',
    contributing: 'Contributing',
    governance: 'Governance',
    conduct: 'Code of Conduct',
    privacy: 'Privacy',
    menu: 'Menu',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
  },

  appCta: {
    short: 'Help',
    shortAria: 'Go to the application: offer help or ask for the help you need',
    floating: {
      lead: 'Every delivery leaves public evidence',
      action: 'Give or get help',
      dismiss: 'Hide this invitation',
    },
    invite: {
      eyebrow: 'The application',
      title: 'Do you need help, or want to give it?',
      body: 'Publishing a need, offering help, contributing and following where each delivery landed all happen in the application. The model is explained here; it is acted on there.',
      primary: 'I want to help',
      secondary: 'I need help',
      tertiary: 'See the published evidence',
    },
  },

  // Footer
  footer: {
    copyright: 'Corag',
    allRightsReserved: 'All rights reserved.',
    tagline: 'The social impact ecosystem.',
    appNote:
      'Publishing a need, offering help, contributing and tracking your contribution all happen in the application.',
  },

  // Homepage sections
  homeSections: {
    latestArticles: 'From the blog',
    viewAllPosts: 'View all articles',
  },

  // Contact section (homepage)
  contact: {
    title: 'Contact',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    messageLabel: 'Message',
    messagePlaceholder: 'Write your message...',
    sendButton: 'Send message',
  },

  // About page

  aboutPage: {
    title: 'About Corag',
    subtitle: 'The social impact ecosystem',
    description:
      'What Corag is, where the name comes from, how the model of named responsables and moderated evidence works, and why we publish the receipt.',
    heroDescription:
      'We started as a group of young people who cared about social service. Out of that came the purpose of building a digital bridge between those who want to help and those who need it most.',
    bioTitle: 'We have the courage to serve and transform lives',
    bioIllustrationAlt:
      'Illustration: a group of people on one side of a gap and a house with a family on the other, joined by an arched bridge whose keystone is a heart; the far half of the bridge is still forming',
    bioText:
      'The name comes from <strong>coraje</strong> — courage. The heart replacing the <em>o</em> carries <strong>love</strong>. Our mark is built to transmit courage, innovation and love.<br /><br />Courage here is not bravado. It is showing up when it is inconvenient, putting your name on a delivery, and publishing the account afterwards. That last part is what connects the idea to the product: named responsables, direct transfer and moderated evidence are courage turned into a mechanism. Saying you are transparent is easy; publishing the receipt takes courage.<br /><br />Corag exists because of a simple reality: plenty of people want to give or get involved, but cannot find a way to do it that feels trustworthy, close and meaningful. Generosity is not the scarce resource — connection is.',
    passionsTitle: 'Our values',
    passions: [
      {
        title: 'Collaboration',
        description:
          'We bring governments, organizations, companies and individuals into one network instead of multiplying isolated systems.',
        icon: 'users',
        link: '/how-it-works',
      },
      {
        title: 'Empathy',
        description:
          "Someone receiving aid is a neighbour, not the backdrop for somebody else's virtue.",
        icon: 'heart',
        link: '/how-it-works',
      },
      {
        title: 'Trust',
        description:
          'Every contribution has a named person behind it and a destination you can check.',
        icon: 'shield',
        link: '/transparency',
      },
      {
        title: 'Love',
        description:
          'It is in the heart at the centre of the mark, and in the reason any of this exists.',
        icon: 'heart',
        link: '/about',
      },
      {
        title: 'Social innovation',
        description:
          'A public API, an OpenAPI specification and an MCP server, so others can build on the same network.',
        icon: 'sparkles',
        link: '/developers',
      },
      {
        title: 'Transparency',
        description:
          'We publish how much came in and how much was used with evidence. Two separate numbers, both public.',
        icon: 'eye',
        link: '/transparency',
      },
    ],
    quickFactsTitle: 'In short',
    quickFacts: [
      'Corag is the ecosystem; Ayuda Directa is the flagship product',
      'Coordination, contributions and evidence all happen in the application',
      'Money moves by direct transfer to verified responsables',
      'Evidence is moderated before it is published',
      'A public API, OpenAPI 3.1 and an MCP server are open to any integrator',
    ],
    ctaTitle: 'Want to be part of it?',
    ctaDescription:
      'Publishing a need, offering help or contributing all happen in the application. If you represent an organization, write to us.',
    ctaApp: 'Go to the app',
    ctaContact: 'Write to us',
  },

  // Slides / deck pages
  slides: {
    exitToCatalog: 'Back to Slides',
    printPdf: 'Print to PDF',
    languageSwitch: 'Ver en español',
    external: {
      openCta: 'Open on {provider}',
      backToCatalog: 'Back to catalog',
    },
    languageNotice: 'Original deck is in {lang}',
    typeBadge: {
      native: 'Native',
      external: 'External',
    },
    toolbar: {
      backToCatalog: 'Back to catalog',
      switchLang: 'Switch to {lang}',
      themeToLight: 'Switch to light mode',
      themeToDark: 'Switch to dark mode',
      enterFullscreen: 'Enter fullscreen',
      exitFullscreen: 'Exit fullscreen',
    },
  },

  // Contact page
  contactPage: {
    title: 'Contact',
    subtitle: 'Let us talk',
    description:
      'Write to us if you represent an organization, want to become an ally, are press, or need to report something. Asking for help happens in the app.',
    heroDescription:
      'This channel is for institutional conversations. If you need help or want to contribute, that happens in the application.',
    appNoticeTitle: 'Do you need help, or want to contribute?',
    appNoticeBody:
      'Publishing a need, offering help, contributing and tracking your contribution all happen in Ayuda Directa. This form does not reach anyone who can respond to an emergency.',
    appNoticeCta: 'Go to the app',
    formTitle: 'Write to us',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    emailLabel: 'Email',
    emailPlaceholder: 'you@email.com',
    reasonLabel: 'Topic',
    reasonOptions: [
      { value: '', label: '— Select a topic —' },
      { value: 'general', label: 'General enquiry' },
      {
        value: 'organization',
        label: 'We are an organization and want to help',
      },
      { value: 'ally', label: 'Institutional partnership' },
      { value: 'press', label: 'Press' },
      { value: 'report', label: 'Report a problem with the information' },
    ],
    subjectLabel: 'Subject',
    subjectPlaceholder: 'What is it about?',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us with as much detail as you can.',
    sendButton: 'Send',
    sendingButton: 'Sending…',
    successTitle: 'Message sent',
    successMessage: 'Thank you for writing to us.',
    successNextSteps: {
      general: 'We reply within a few working days.',
      organization:
        'We will get in touch to understand what your organization can offer and how to coordinate it.',
      ally: 'We will write to discuss the partnership and next steps.',
      press: 'The team replies as soon as possible.',
      report:
        'We will review what you reported. If it is urgent and affects someone, please also report it in the application.',
    },
    sendAnotherButton: 'Send another message',
    requiredField: 'This field is required',
    invalidEmail: 'Enter a valid email address',
    submitError: 'We could not send the message. Please try again.',
    fallbackMessage:
      'If the form does not work, reach us through the public channels.',
    formNote:
      'We only use these details to reply to you. We do not publish or share them.',
    quickLinksTitle: 'You might be looking for',
    quickLinks: [
      {
        label: 'How it works',
        href: '/how-it-works',
        description: 'The whole path, from a need to the evidence.',
      },
      {
        label: 'Transparency',
        href: '/transparency',
        description: 'How much came in and how much was used with evidence.',
      },
      {
        label: 'Developers',
        href: '/developers',
        description: 'Public API, OpenAPI and MCP to integrate.',
      },
    ],
  },

  movementPage: {
    title: 'Serving takes courage',
    description:
      'Corag is a social movement that mobilises people and aid. The name comes from coraje — the courage we all have when we love, care and serve.',
    eyebrow: 'Social movement',
    illustrationAlt:
      'Illustration: around a hundred and fifty faceless human silhouettes, all the same size, whose arrangement forms the outline of a heart; some hold hands, some carry boxes, and the lighter ones along the outer edge are still joining',
    lead: 'Corag comes from <strong>coraje</strong>, the Spanish word for courage. Not the courage of great feats: the kind we all have when we love, when we want to care for someone, when we decide to serve. That is the movement, and it does not rest on anyone’s name. It rests on someone showing up.',
    beats: [
      {
        title: 'We mobilise people, not an audience',
        body: 'A movement is not measured in followers. It is measured in how much help arrived, and how many hands moved it.',
      },
      {
        title: 'Nobody has to be appointed',
        body: 'No one needs permission to serve. You join by helping: a delivery, an hour, a tool, a need made public.',
      },
      {
        title: 'Courage is proven afterwards',
        body: 'Promising is not the hard part. Publishing the account once it is done — that is. Every delivery leaves evidence, so the movement can be checked rather than merely believed.',
      },
    ],
    closingTitle: 'Who makes Corag?',
    closingBody:
      'Whoever shows up. The people who coordinate a delivery, who write code, who lend a warehouse or a truck, who review a piece of evidence at eleven at night. And tomorrow, whoever decides to join. Corag is not a group you get into: it is what happens every time someone decides yes.',
    channelsLabel: 'Where we gather',
  },

  conductForm: {
    formEyebrow: 'Confidential report',
    formSectionTitle: 'Report a Code of Conduct concern',
    privacyNote:
      'Reports go to organizers only. They are not listed publicly and are not posted to community Slack channels. You may submit anonymously.',
    incidentLabel: 'What happened?',
    incidentPlaceholder:
      'Describe the incident with as much context as you are comfortable sharing…',
    whenLabel: 'When did it happen? (optional)',
    whenPlaceholder: 'Date, time, or event name…',
    peopleLabel: 'People involved (optional)',
    peoplePlaceholder: 'Names or roles, if known…',
    anonymousLabel: 'Submit anonymously',
    anonymousHint:
      'If you choose anonymity, we will not store a reporter name or email with this report.',
    nameLabel: 'Your name (optional if anonymous)',
    emailLabel: 'Your email (required unless anonymous)',
    followupLabel: 'Preferred follow-up (optional)',
    followupPlaceholder: 'Email, call, or “no follow-up needed”…',
    submitButton: 'Submit confidential report',
    successTitle: 'Report received',
    successMessage:
      'Thank you. Organizers will review this confidentially and act as quickly and fairly as possible.',
  },

  contactSection: {
    title: 'Do you represent an organization?',
    description:
      'Foundations, companies, municipalities and community organizations can join the network. Write to us and we will coordinate.',
    ctaText: 'Write to us',
    ctaLink: '/contact',
  },

  // Search input
  searchPlaceholder: 'Search articles...',
  searchHint: 'Tip: press Esc to clear the search.',
  clearSearch: 'Clear',
  resultsFound: (count) => `${count} result${count !== 1 ? 's' : ''} found`,

  // Loading states
  loadingIndex: 'Loading search index...',
  searching: 'Searching articles...',

  // Results
  noResults: (query) => `No articles found matching "${query}"`,
  noResultsSuggestion: 'Try a broader keyword or browse all posts.',
  noPostsAvailable: 'No posts available yet.',

  // Pagination
  previous: 'Previous',
  next: 'Next',
  pageOf: (current, total) => `Page ${current} of ${total}`,

  // Blog header
  blogTitle: 'Blog',
  blogHeading: 'Articles & Stories',
  blogDescription:
    'Articles on humanitarian coordination, donation transparency and civic technology, and how you build an aid network that anyone can actually verify.',
  allPosts: 'All Posts',
  showingArticles: (showing, total) =>
    `Showing ${showing} of ${total} articles`,
  articlesAvailable: (total) =>
    `${total} article${total !== 1 ? 's' : ''} available`,
  lastUpdatedOn: 'Updated',
  readingTime: (minutes) => `${minutes} min read`,
  relatedArticles: 'Related Articles',
  relatedArticlesDescription: 'You might also enjoy these posts',

  // Series navigation
  seriesPartOf: 'Part of the series',
  seriesChapter: (n) => `Chapter ${n}`,
  seriesPrevious: 'Previous chapter',
  seriesNext: 'Next chapter',
  seriesToC: 'All chapters',
  seriesChapterOf: (current, total) => `Chapter ${current} of ${total}`,

  // Series pages
  seriesPage: {
    title: 'Series',
    breadcrumb: 'Series',
    chapters: 'chapters',
    chapter: 'Chapter',
    progress: (current, total) => `${current} of ${total} chapters`,
    readChapter: 'Read chapter',
    emptyState: 'No posts in this series yet.',
    backToSeries: 'All Series',
    backToBlog: 'Back to Blog',
    startReading: 'Start reading',
    continueReading: 'Continue reading',
  },
  seriesListingPage: {
    title: 'Blog Series',
    description:
      'Multi-chapter article collections: long reads on the aid model, the work in the field, and the technology that holds the whole network together.',
    heading: 'Series',
    postsCount: (count) => `${count} ${count === 1 ? 'chapter' : 'chapters'}`,
    exploreSeries: 'Explore series',
    emptyState: 'No series published yet.',
  },

  // Scheduled posts (dev-only indicators)
  scheduledBadge: 'Scheduled',
  scheduledBannerTitle: 'Scheduled post',
  scheduledBannerMessage: (date) =>
    `This post will be published on ${date}. It is only visible in development mode.`,

  // Draft posts (dev + preview indicators)
  draftBadge: 'Draft',
  draftBannerTitle: 'Draft post',
  draftBannerMessage:
    'This post is a work in progress. It is visible here because you are on the dev server or a preview branch — it will not ship to production until the draft flag is removed.',

  // Tags
  postsTagged: (tag) => `Posts tagged "${tag}"`,
  allTags: 'All Tags',
  tagNames: {
    // Primary tags
    volunteering: 'Volunteering',
    donations: 'Donations',
    foundations: 'Foundations & NGOs',
    'social-impact': 'Social impact',
    community: 'Community',
    // Secondary tags
    colombia: 'Colombia',
    'getting-started': 'Getting started',
    verification: 'Verification',
    organizations: 'Organizations',
    measurement: 'Measurement',
    // Subtopic tags
    technology: 'Technology',
    pereira: 'Pereira',
    youth: 'Children & youth',
  },
  tagDescriptions: {
    // Primary tags
    volunteering:
      'Giving time: how to start with no experience, where to look near you, and what the first few weeks in the field are actually like.',
    donations:
      'Giving money or goods without it getting lost on the way: what actually helps, how to verify before transferring, how to get the receipt.',
    foundations:
      'How foundations and NGOs work on the inside, how they differ from each other, and how to confirm one is real before supporting it.',
    'social-impact':
      'What social impact is, how it gets created, and how to measure it honestly: the uncomfortable gap between activity and transformation.',
    community:
      'The groups, field days and projects where people organise to help, and how to join one that will still be there two years from now.',
    // Secondary tags
    colombia:
      'The Colombian context: legal framework, active organizations, and the local realities that shape how aid gets coordinated on the ground.',
    'getting-started':
      'Guides for anyone who wants to help and does not yet know where to begin. No prerequisites, no experience, and no money required at all.',
    verification:
      'How to confirm that an organization, an account or a delivery is real, before committing your time, your goods or your money to it.',
    organizations:
      'Companies, public bodies and NGOs joining social work, and which models of contribution actually hold up beyond just writing a cheque.',
    measurement:
      'Indicators, baselines and evidence: how you demonstrate that something actually changed, rather than assuming it from good anecdotes.',
    // Subtopic tags
    technology:
      'Platforms, data and interoperability applied to humanitarian aid, with the three risks of digitalisation that almost nobody mentions.',
    pereira:
      'Organizations, events and opportunities to help in Pereira and in the Eje Cafetero, where Corag has active operations on the ground.',
    youth:
      'Programmes for children at risk, and for young people who want to start contributing without waiting to finish a degree beforehand.',
  },

  // Series names and descriptions (keyed by series slug). Empty during the v3.0.0 transition.
  seriesNames: {},
  seriesDescriptions: {},

  // Date formatting
  dateLocale: 'en-US',

  // Read more
  readMore: 'Read more',

  // Scroll to timeline
  scrollToTimeline: 'View Timeline',
  viewLabel: (label: string) => `View ${label}`,

  // 404 page
  notFoundPage: {
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has moved.',
    heading: 'This page does not exist',
    message:
      'The link may be broken, or the page may have moved. From here you can go back home, search the blog, or go straight to the application.',
    eyebrow: 'Error 404',
    backHome: 'Back home',
    searchBlog: 'Search the blog',
    appCta: 'Go to the app',
  },

  // Blog post engagement
  engagement: {
    // Share buttons
    shareTitle: 'Share this post',
    shareSeriesTitle: 'Share this series',
    shareOnTwitter: 'Share on X',
    shareOnLinkedIn: 'Share on LinkedIn',
    shareOnWhatsApp: 'Share on WhatsApp',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',

    // Newsletter
    newsletterTitle: 'Stay in the loop',
    newsletterDescription:
      'Get notified when the community publishes new articles, recaps, and event announcements. No spam, unsubscribe anytime.',
    newsletterPlaceholder: 'your@email.com',
    newsletterButton: 'Subscribe',
    newsletterSubmitting: 'Subscribing...',
    newsletterSuccessTitle: 'You\u2019re subscribed!',
    newsletterSuccessMessage:
      'Thanks for subscribing. You\u2019ll hear from us when something new is published.',
    newsletterInvalidEmail: 'Please enter a valid email address.',
    newsletterAlreadySubscribed:
      'You\u2019re already subscribed. Thanks for being here!',
    newsletterResubscribe: 'Subscribe with a different email',
    newsletterPrivacy: 'No spam. Unsubscribe anytime.',

    // End-of-post CTA
    ctaTitle: 'Enjoyed this post?',
    ctaDescription:
      'Share it with your network or subscribe to get the latest community articles in your inbox.',
  },

  // Blog engagement (author + share)
  blogEngagement: {
    aboutAuthor: 'About the author',
    writtenBy: 'Written by',
  },

  // Institutional pages
  howItWorksPage: {
    title: 'How it works',
    description:
      'The full path of one delivery in Corag: who publishes the need, who takes it on, how the money moves, and how what was delivered gets proven.',
    eyebrow: 'The model',
    lead: 'Corag holds nobody’s money. It connects the person who needs with the person who can, puts a named responsable in between, and publishes the account afterwards. Here is the path, step by step.',
    heroFigure: {
      srcBase: '/images/home/app/app-home-desktop-en',
      widths: [640, 960, 1280, 1920],
      alt: 'Ayuda Directa home screen on desktop, with the priority emergency and the global progress',
      width: 1280,
      height: 800,
      frame: 'browser',
      caption:
        'A real view of the application. The data shown is live application data at capture time.',
    },
    sections: [
      {
        heading: 'The path of one delivery',
        intro:
          'Five steps. None of them happens on this site: they all happen in the application.',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'Someone publishes a need',
                body: 'A family, a community leader or an organization records what is missing and where. The request becomes visible to the network instead of being buried in a chat thread.',
                figure: {
                  srcBase: '/images/pages/app/app-solicitar-mobile-en',
                  widths: [390, 780],
                  alt: 'Ayuda Directa "request help" form on a phone, with empty fields',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
              {
                title: 'A responsable takes it on',
                body: 'Whoever coordinates in that territory owns the delivery. They have a name, a validated identity, and a verified connection to the area or the organization.',
                figure: {
                  srcBase: '/images/pages/app/app-registro-lider-desktop-en',
                  widths: [640, 1280],
                  alt: 'Ayuda Directa leader application screen, with the form empty',
                  width: 1280,
                  height: 800,
                  frame: 'browser',
                },
              },
              {
                title: 'Someone contributes',
                body: 'The contribution goes by direct transfer to the responsable’s verified account. Corag is not an intermediary for the money and takes no cut for moving it.',
                figure: {
                  srcBase: '/images/home/app/app-aportar-mobile-en',
                  widths: [390, 780],
                  alt: 'Ayuda Directa "how do you want to help?" flow on a phone, with the contribution options',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
              {
                title: 'The delivery happens',
                body: 'The responsable buys, transports and delivers. They record what was delivered, to how many people, and when.',
              },
              {
                title: 'The evidence gets published',
                body: 'Photos, receipts and figures are uploaded within the window, go through administrative review, and only then get published. Until that moment the contribution counts as received, not as used.',
                figure: {
                  srcBase: '/images/pages/app/app-seguimiento-mobile-en',
                  widths: [390, 780],
                  alt: 'Ayuda Directa private contribution follow-up screen, with the search empty',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
            ],
          },
        ],
      },
      {
        heading: 'Why the money does not pass through us',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'A platform that collects and then distributes becomes both the bottleneck and the single point of failure. If it goes down, freezes or gets something wrong, the aid stops with it.',
              'Direct transfer removes that risk, but it moves the trust somewhere else: onto the responsable. That is why validating responsables is the critical dependency for everything else, and why evidence is not optional.',
            ],
          },
        ],
      },
      {
        heading: 'The three roles',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'Person',
                body: 'Publishes a need, offers help, or contributes. Nobody’s permission is required to start.',
              },
              {
                title: 'Responsable',
                body: 'Coordinates and executes. Receives contributions in their own name and answers for them with evidence, within the window.',
              },
              {
                title: 'Administration',
                body: 'Validates identities, moderates evidence before it is published, and reviews reports about the use of resources.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What happens when something goes wrong',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Failing to provide evidence is the most serious lapse, because it breaks exactly what makes Corag verifiable. The response is staged: a reminder, then suspension of the ability to receive contributions, then removal from the role.',
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Saw something that does not add up?',
            body: 'A contribution with no evidence, a delivery that did not happen, a suspicious account: report it. A report about resources is always reviewed, even when it arrives anonymously.',
          },
        ],
      },
    ],
    cta: {
      title: 'All of this happens in the application',
      body: 'Publishing a need, offering help, contributing and checking the evidence are Ayuda Directa actions. This site only explains them.',
      primary: { label: 'Go to the app', href: APP_URL, external: true },
      secondary: { label: 'See the transparency', href: '/transparency' },
    },
  },

  transparencyPage: {
    title: 'Transparency',
    description:
      'What we publish, what each number means, how evidence is reviewed before it goes out, and which things we still cannot prove. No decoration.',
    eyebrow: 'The accounts',
    lead: 'Saying you are transparent is easy. Publishing the receipt takes courage. Here is what we publish, what it means exactly, and where the limits are.',
    heroFigure: {
      srcBase: '/images/pages/app/app-avances-desktop-en',
      widths: [640, 960, 1240],
      alt: 'Ayuda Directa progress band: the total received beside the total donated with evidence',
      width: 1240,
      height: 345,
      frame: 'browser',
      caption:
        'A real view of the application. Both numbers are live data: they move with every contribution and every approved piece of evidence.',
    },
    sections: [
      {
        heading: 'The two numbers',
        intro:
          'They are not the same number, and the gap between them is the entire point.',
        blocks: [
          {
            kind: 'statPair',
            relation: '≠',
            items: [
              {
                label: 'Received',
                body: 'What the network contributed. It is recorded at the moment of the transfer and depends on nobody else.',
              },
              {
                label: 'Used with evidence',
                body: 'What has already been delivered, documented and passed administrative review. It is the number worth looking at.',
              },
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'The distance between the two is the outstanding work. A platform that only publishes how much it raised is reporting the easy half.',
            ],
          },
        ],
      },
      {
        heading: 'How evidence gets reviewed',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'It is uploaded',
                body: 'The responsable uploads photos, purchase receipts and the delivery figures, within the defined window.',
              },
              {
                title: 'It is reviewed',
                body: 'Administration checks what was uploaded against what was promised. An incomplete upload is sent back, not published.',
              },
              {
                title: 'It is published',
                body: 'Only after approval does the amount start counting as used with evidence, visible to whoever contributed and to anyone else.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What we protect even at the cost of clarity',
        blocks: [
          {
            kind: 'list',
            items: [
              'We do not publish the exact location of someone in a vulnerable situation beyond what the coordination needs.',
              'We do not publish contact details without the explicit authorization of the person who gave them.',
              'Anyone contributing may appear as “Persona solidaria” rather than by name, with no explanation owed.',
              'Evidence involving minors is published only with permission and without identifiable features.',
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'These rules reduce the public detail. That is deliberate: the dignity of the person receiving aid is not traded for a more convincing photograph.',
            ],
          },
        ],
      },
      {
        heading: 'What is not settled yet',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Saying so is part of the transparency. The formal evidence windows, the appeals process when a role is removed, and the maximum resources a responsable may administer without an additional review are still being defined. Once settled, they are published in Governance.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Check the figures yourself',
      body: 'The numbers and the approved evidence live in the application, by emergency and by delivery.',
      primary: { label: 'Open the application', href: APP_URL, external: true },
      secondary: { label: 'How it is governed', href: '/governance' },
    },
  },

  emergenciesPage: {
    title: 'Emergencies',
    description:
      'What Corag does when an emergency happens, how a front opens, how to ask for help, and what we are not: this is not an emergency service.',
    eyebrow: 'Response',
    lead: 'In an emergency the problem is rarely a shortage of generosity. It is that nobody knows what is needed, where, or who is already covering it.',
    heroFigure: {
      srcBase: '/images/home/app/app-map-desktop',
      widths: [640, 1280],
      alt: 'Ayuda Directa map with clusters of requests and offers over the Eje Cafetero region',
      width: 1280,
      height: 1050,
      frame: 'browser',
      caption:
        'A real view of the application map. The clusters shown are live data at capture time.',
    },
    sections: [
      {
        heading: 'First of all',
        blocks: [
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Corag is not an emergency service',
            body: 'If anyone’s life or safety is in immediate danger, call your country’s emergency lines first. Corag coordinates material aid; it does not replace fire, ambulance or police services.',
          },
        ],
      },
      {
        heading: 'What a front is',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'When an emergency happens, a front opens: a space with its own map of needs, its own responsables and its own figures. Everything about that emergency stays inside the front instead of scattering across chat groups nobody can audit afterwards.',
              'Three things live inside a front: what is needed, what is being offered, and what has already been delivered with evidence. That third column is what stops twenty people carrying water to the same block while another goes without.',
            ],
          },
        ],
      },
      {
        heading: 'How to take part',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'If you need help',
                body: 'Publish the need in the relevant front. Be concrete: what, how much, where, and for how many people. A vague need takes longer to reach.',
              },
              {
                title: 'If you can help',
                body: 'Check the open needs before deciding what to bring. Offering what is already abundant delays what is missing.',
              },
              {
                title: 'If you can coordinate',
                body: 'Apply as a responsable. It requires identity validation and a verified connection to the territory, and it commits you to accounting with evidence.',
              },
            ],
          },
        ],
      },
      {
        heading: 'When a front closes',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'A front does not vanish when the urgency passes. It stays as a record: what was needed, who responded, how much moved, and what evidence backs it. That memory is what lets the next emergency start with something more than goodwill.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Active fronts live in the application',
      body: 'There you can see what is needed right now, what is already covered, and what evidence exists for what was delivered.',
      primary: { label: 'See active fronts', href: APP_URL, external: true },
      secondary: { label: 'How it works', href: '/how-it-works' },
    },
  },

  leadersPage: {
    title: 'Leaders',
    description:
      'What coordinating aid in Corag actually commits you to, how you get validated, what the evidence obligation is, and what happens if you miss it.',
    eyebrow: 'Responsables',
    lead: 'The responsable system is the critical trust dependency of the whole platform. If that validation fails, nothing else matters.',
    heroFigure: {
      srcBase: '/images/pages/illustrations/illustration-leaders',
      widths: [480, 768, 1024],
      alt: 'Illustration: a coordinator holding a checklist beside a verification badge, standing between a house with a family on the left and hands offering a package, a coin and a heart on the right',
      width: 1378,
      height: 659,
      frame: 'none',
    },
    sections: [
      {
        heading: 'What a responsable does',
        blocks: [
          {
            kind: 'list',
            items: [
              'Coordinates aid within a front or a specific delivery.',
              'Receives contributions in a verified account in their own name.',
              'Buys, transports and delivers what the need called for.',
              'Records what was delivered and uploads the evidence within the window.',
              'Keeps the status of the requests they took on current.',
            ],
          },
        ],
      },
      {
        heading: 'How you become one',
        blocks: [
          {
            kind: 'figure',
            figure: {
              srcBase: '/images/pages/app/app-registro-lider-desktop-en',
              widths: [640, 1280],
              alt: 'Ayuda Directa leader application screen, with the form empty',
              width: 1280,
              height: 800,
              frame: 'browser',
              caption:
                'A real view of the application: the application happens there, not on this site.',
            },
          },
          {
            kind: 'steps',
            steps: [
              {
                title: 'Application',
                body: 'Made from the application, and private. Neither who applied nor who was turned down is published.',
              },
              {
                title: 'Validation',
                body: 'Identity is checked, along with the real connection to the territory or to the organization being represented.',
              },
              {
                title: 'Approval',
                body: 'Enables the role, and with it the ability to receive contributions directly.',
              },
            ],
          },
        ],
      },
      {
        heading: 'The obligations that come with the role',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Coordinating resources is a responsibility, not a privilege. Taking the role means accounting with evidence within the window, never directing resources toward your own interests without declaring them first, and handing the coordination over cleanly if you step away.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Evidence is not paperwork',
            body: 'Not providing it is the most serious lapse: it breaks exactly what makes Corag verifiable. The response is staged — a reminder, suspension of the ability to receive contributions, and if it persists, removal from the role.',
          },
        ],
      },
      {
        heading: 'Conflicts of interest',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Someone coordinating must not direct resources toward an organization, company or person they have a financial or family interest in without declaring it first. Declaring it does not disqualify anyone; hiding it does.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Do you coordinate aid where you live?',
      body: 'Applications are made from the application. They are private and take a few minutes.',
      primary: {
        label: 'Apply as a responsable',
        href: APP_URL,
        external: true,
      },
      secondary: { label: 'Read the governance', href: '/governance' },
    },
  },

  partnersPage: {
    title: 'Partners',
    description:
      'How a foundation, a company, a municipality or a community organization joins: contribute capacity, integrate systems, or back the operation.',
    eyebrow: 'Organizations',
    lead: 'An organization already working in the field does not need another platform. It needs its own to stop being isolated from everyone else’s.',
    heroFigure: {
      srcBase: '/images/pages/illustrations/illustration-partners',
      widths: [480, 768, 1024],
      alt: 'Illustration: a warehouse, a truck, a clinic and a community hall, each on its own platform, joined by continuous lines that pass through a heart at the centre',
      width: 1269,
      height: 706,
      frame: 'none',
    },
    sections: [
      {
        heading: 'Three ways in',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'Contribute capacity',
                body: 'Transport, storage, staff, supplies, coverage in areas nobody else reaches. Installed capacity is often worth more than money.',
              },
              {
                title: 'Integrate systems',
                body: 'If you already keep a record of beneficiaries or deliveries, it gets connected instead of duplicated. A need registered twice is a need served badly.',
              },
              {
                title: 'Back the operation',
                body: 'With resources or with reach. A call that lands with local community boards moves more than a paid ad.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What we ask in return',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'The same rules as everyone else: a named responsable on every delivery, evidence within the window, and respect for the data of the people receiving aid. A partnership does not buy exceptions.',
              'We publish no organization’s logo without express authorization, and we never use a partnership as an endorsement of anything the organization has not said itself.',
            ],
          },
        ],
      },
      {
        heading: 'For municipalities and public bodies',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'The value of Corag to a public body is not the donation: it is the map. Knowing in real time what is being asked for, who is already covering it, and what was documented lets you direct your own resources where the gap actually is, instead of duplicating what the community already solved.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Let us talk',
      body: 'Tell us what your organization can contribute and we will coordinate the next steps.',
      primary: { label: 'Write to us', href: '/contact?topic=ally' },
      secondary: { label: 'See the technical docs', href: '/developers' },
    },
  },

  developersPage: {
    title: 'Developers',
    description:
      "Corag's public API: no authentication, idempotent by design, with an MCP server. What is worth building on it, and how to publish your first request.",
    eyebrow: 'Integrations',
    lead: 'Many interfaces, one network of data. The highest-impact path is not building another aid application: it is making the one you build talk to the one that already exists.',
    heroFigure: {
      srcBase: '/images/home/app/app-home-desktop-en',
      widths: [640, 960, 1280, 1920],
      alt: 'Ayuda Directa home screen, one of the clients of the public API',
      width: 1280,
      height: 800,
      frame: 'browser',
      caption:
        'Ayuda Directa is a client of the same open API documented here. The data shown is live.',
    },
    sections: [
      {
        heading: 'The problem an open API solves',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'During an emergency several teams start building at once, each with its own database of needs. The result is more fragmentation, not less: five incompatible lists of the same thing, none of them complete.',
              'That is why the network is published. A new application does not have to start from zero or ask people to register all over again — it becomes one more client of the same network of data.',
            ],
          },
        ],
      },
      {
        heading: 'The API in three facts',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'No authentication',
                body: 'No keys, no registration. Publishing a request or an offer is a direct POST, because in an emergency the paperwork is the enemy.',
              },
              {
                title: 'Idempotent by design',
                body: 'The source + externalId pair identifies each record. Retrying the same publication creates no duplicate, so an integration on an unreliable connection is safe.',
              },
              {
                title: 'Contact requires consent',
                body: 'The phone number is published, which is why publishContact must be explicit. There is no way to upload a contact without declaring that the person agreed to it being shown.',
              },
            ],
          },
        ],
      },
      {
        heading: 'The three endpoints',
        blocks: [
          {
            kind: 'list',
            items: [
              '`GET https://ayuda.cabuya.org/api/public/v1/help` — discovers the API and returns the active emergencies with their `slug`. Start here.',
              '`POST https://ayuda.cabuya.org/api/public/v1/help` — publishes a request (`type: "request"`) or an offer (`type: "offer"`).',
              '`POST https://ayuda.cabuya.org/mcp` — remote MCP server, exposing `listar_emergencias`, `publicar_solicitud` and `publicar_ofrecimiento`.',
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'The full OpenAPI 3.1 specification lives at `https://ayuda.cabuya.org/api/public/openapi.json`.',
            ],
          },
        ],
      },
      {
        heading: 'What a publication carries',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Required in both cases:** `source`, `externalId`, `title`, `category`, `contactName`, `contactWhatsapp` and `publishContact`.',
              '**`category`** is one of: `alimentos`, `salud`, `refugio`, `transporte`, `acopio`, `rescate`, `otro`.',
              '**A request** additionally requires `address`, `latitude` and `longitude`, plus `urgency` (`urgent` · `needed` · `stable`) and `neededPeople`.',
              '**An offer** only requires `type`; location is optional and it may declare `collectionCenterStatus` (`full` · `needs_volunteers` · `needs_resources`).',
              '**`emergencySlug`** becomes required when more than one emergency is active. Which is why the `GET` comes first.',
            ],
          },
        ],
      },
      {
        heading: 'What is worth building on top',
        blocks: [
          {
            kind: 'list',
            items: [
              'A WhatsApp or Telegram bot that publishes and queries requests.',
              'An offline-capable PWA, for areas with poor signal.',
              'A spreadsheet importer, for organizations that already work that way.',
              'A dashboard for a municipality or an NGO over its own fronts.',
              'Accessibility interfaces: large text, screen reading, low bandwidth.',
              'Duplicate detection and data-quality checks.',
            ],
          },
        ],
      },
      {
        heading: 'This site is open too',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Every page on cabuya.org has a Markdown twin at the same path with a `.md` extension, meant for agents and automated reading. The full catalogue is at `/llms.txt`.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Building something?',
      body: 'The API needs no permission to start. Write to us if you want to tell us what you are making, or need context on the model.',
      primary: {
        label: 'Read the specification',
        href: 'https://ayuda.cabuya.org/api/public/openapi.json',
        external: true,
      },
      secondary: { label: 'Write to us', href: '/contact?topic=general' },
    },
  },
  privacyPage: {
    title: 'Privacy',
    description:
      'What data Corag handles, where it lives, what gets published and what never does, how to ask for a correction, and what this site collects.',
    eyebrow: 'Your data',
    lead: 'Corag coordinates aid between people who are usually having a bad time. How we treat their data is part of the service, not a footnote.',
    sectionIndexLabel: 'On this page',
    sections: [
      {
        heading: 'Two surfaces, two treatments',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'cabuya.org — this site',
                body: 'A static site. No accounts, no stored profiles, no tracking cookies. It collects data only when you type into a form.',
              },
              {
                title: 'ayuda.cabuya.org — the application',
                body: 'Accounts, requests and evidence live there. That is where information about real people’s needs is handled, under the rules below.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What this site collects',
        blocks: [
          {
            kind: 'list',
            items: [
              'What you type into the contact form: name, email, topic and message. Used to reply to you and nothing else.',
              'What you type into a conduct report, which may be sent anonymously. If you choose anonymity we store neither your name nor your email, even if the browser sends them.',
              'Aggregate, cookieless usage metrics: which pages are visited and from which country. They identify nobody and follow nobody between sites.',
              'Your language and theme preference, stored in your own browser. They never leave your device.',
            ],
          },
        ],
      },
      {
        heading: 'What we never do',
        blocks: [
          {
            kind: 'list',
            items: [
              'Sell, rent or hand personal data to third parties.',
              'Publish phone numbers, addresses or exact locations without the person’s explicit authorization.',
              'Use form data to send you marketing you did not ask for.',
              'Publish evidence showing identifiable features of minors.',
            ],
          },
        ],
      },
      {
        heading: 'How long it is kept',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Contact messages are kept while the conversation is open and for a reasonable period afterwards, so a thread can be picked up again. Conduct reports are kept as long as needed to resolve them and document the decision.',
              'Published evidence of a delivery stays: it is the record that makes the aid verifiable. What does not stay is the personal data of whoever received it, which is not part of that publication.',
            ],
          },
        ],
      },
      {
        heading: 'Your rights',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'You can ask for access to the data we hold about you, for its correction or its deletion, and you can withdraw an authorization you gave earlier. Write to us through the contact form saying what you need.',
              'If something published affects you and you believe it should not be there, say so. It is always reviewed, and it can be unpublished while the review happens.',
            ],
          },
        ],
      },
      {
        heading: 'Third-party services',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'This site is hosted on Cloudflare Pages, forms are processed through Dailybot, and automatic replies are sent with Resend. Each receives only what it needs to do its job, and none of them receives the data to use on its own account.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Something to correct or take down?',
      body: 'Write to us and we will look at it. You do not have to know whether it “qualifies”: if something bothers you, that is reason enough.',
      primary: { label: 'Write to us', href: '/contact?topic=report' },
      secondary: { label: 'Code of Conduct', href: '/conduct' },
    },
  },

  ecosystemPage: {
    title: 'Aid apps ecosystem',
    description:
      'A network of complementary emergency apps — maps, collection points, people, pets and direct aid. Corag is one node. We feed each other.',
    eyebrow: 'The network',
    headline: 'We don’t compete. We feed each other.',
    lead: 'Many mature apps already help after the emergency. Each solves a piece in its own way. This page lists them together — and features Corag Ayuda Directa as one node in the same network.',
    ctaApp: 'Open Ayuda Directa',
    ctaDirectory: 'See the apps',
    ctaHow: 'How Corag works',
    featuredEyebrow: 'Our node',
    featuredImageAlt: 'Ayuda Directa home screen',
    directoryEyebrow: 'Complementary tools',
    directoryTitle: 'The apps in the network',
    directoryLead:
      'Descriptions come from what each public site says about itself. Listing is not a ranking and not an endorsement.',
    categories: {
      matching: 'Direct aid matching',
      damage: 'Damage & reports',
      logistics: 'Collection & logistics',
      pets: 'Pets',
      people: 'People reunification',
    },
    categoryLeads: {
      matching: 'Connect people who need help with people who can give it.',
      damage: 'Map infrastructure damage, cracks, and field reports.',
      logistics:
        'Collection centers, shelters, hospitals and supply coordination.',
      pets: 'Help reunite lost animals with their families.',
      people:
        'Missing persons and reunification tools for responders and families.',
    },
    whatLabel: 'What it does:',
    howLabel: 'How it works:',
    visit: 'Visit',
    apiDocs: 'Public API',
    moreInfo: 'More information',
    close: 'Close',
    overview: 'What it offers',
    features: 'Features',
    tools: 'Tools and surfaces',
    audience: 'Who it is for',
    coverage: 'Coverage',
    limits: 'Honest limits',
    integrations: 'Integrations',
    publicApi: 'Public API',
    publicMcp: 'Public MCP',
    availabilityYes: 'Yes, documented',
    availabilityNo: 'Not announced',
    availabilityUnknown: 'Unconfirmed',
    openApi: 'OpenAPI specification',
    mcpEndpoint: 'MCP endpoint',
    developers: 'Developer documentation',
    badgeApi: 'API',
    badgeMcp: 'MCP',
    disclosure:
      'This directory describes complementary public tools from what each site says about itself. Listing is not an endorsement of any organization. To request removal or inclusion, use the form below or write to us.',
    joinEyebrow: 'Grow the network',
    joinTitle: 'Building another app?',
    joinLead:
      'Tell us what you built. A human reviews every request — this is not automatic listing.',
    joinForm: {
      disclaimer:
        'Submitting this form requests review to appear in the directory. It does not publish your app automatically.',
      appName: 'App name',
      appUrl: 'App URL (https)',
      what: 'What does it do?',
      how: 'How does it work?',
      category: 'Category',
      categoryPlaceholder: 'Choose one',
      catMatching: 'Direct aid matching',
      catDamage: 'Damage and reports',
      catLogistics: 'Collection and logistics',
      catPets: 'Pets',
      catPeople: 'People reunification',
      catOther: 'Other',
      contactName: 'Your name',
      contactEmail: 'Your email',
      notes: 'Notes (logo rights, API, anything else)',
      submit: 'Request listing',
      submitting: 'Sending…',
      successTitle: 'Request received',
      successBody:
        'Thank you. We will review your app and write back if we need anything else.',
      errRequired: 'This field is required.',
      errEmail: 'Enter a valid email.',
      errUrl: 'Enter a valid https URL.',
      errCategory: 'Choose a category.',
      errSubmit: 'Something went wrong. Try again in a moment.',
    },
  },

  // Errors
  searchError: 'An error occurred while searching. Please try again.',
  loadError: 'Failed to load search index. Please refresh the page.',
  retry: 'Try again',
};
