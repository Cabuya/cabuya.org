import type { SiteTranslations } from './types';

/** English strings — written natively, not translated from Spanish. */
export const en: SiteTranslations = {
  siteTitle: 'Cabuya',
  siteTitleFull: 'Cabuya — the open aid interoperability protocol',
  siteDescription:
    'Cabuya is an open format that lets aid apps publish and read the same data: collection points, needs, capacities and deliveries. Any team can implement it in an afternoon, and nobody has to ask anyone for permission.',
  siteDescriptionShort:
    'An open format so aid apps publish and read the same data. Conformance is measured, never declared.',

  nav: {
    home: 'Home',
    foundingRecord: 'Founding record',
    github: 'GitHub',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToLanguage: 'Cambiar a español',
    skipToContent: 'Skip to content',
  },

  specBanner: {
    label: 'Draft',
    text: 'Specification 0.1 is a draft under review. Anchors and field names may still change.',
    linkLabel: 'How the protocol changes',
  },

  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
  },

  home: {
    metaTitle: 'Cabuya — the open aid interoperability protocol',
    metaDescription:
      'An open format so aid apps publish and read the same data. One schema, four transports; conformance measured by a public validator, never declared.',

    hero: {
      eyebrow: 'An open protocol for aid apps',
      title: 'Each app is a thread. The protocol is the rope.',
      pitch:
        'Cabuya is an open format that lets aid apps publish and read the same data: collection points, needs, capacities and deliveries.',
      pitchSecond:
        'Any team can implement it in an afternoon, and nobody has to ask anyone for permission. Conformance is measured by a published validator — never self-declared.',
      ctaPrimary: 'Publish a feed',
      ctaSecondary: 'See who publishes',
      ctaPending:
        'The quickstart and the registry are being written now. Until they are up, the specification and the validator are already in the repository.',
    },

    thesis: {
      kicker: 'The thesis',
      principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
      gloss: 'We grow together: we don’t compete, we feed each other.',
      body: 'Cabuya is the fibre you tie things with. A single thread holds nothing; twisted together, they carry anything. That is not a metaphor about collaboration in general — it is a description of what happens when two applications can read each other’s data.',
      bodySecond:
        'Every app that joins keeps its own product, its own users and its own decisions. What it gains is that its records stop being trapped inside it, and that it can read everyone else’s without asking.',
      intentNote:
        'That is what the protocol is for. Whether it happens depends on the teams who adopt it, and none of it is achieved yet.',
    },

    howItWorks: {
      kicker: 'How it works',
      title: 'Four steps, and none of them need us',
      lead: 'Nothing here requires an account, an approval, or a conversation with anyone. The protocol is a document; the validator is a program you can run yourself.',
      steps: [
        {
          title: 'Publish a manifest',
          body: 'One JSON file at a known path that says who you are, what you publish, and under which licence.',
        },
        {
          title: 'Export a feed',
          body: 'Your places, in the shared schema. A static file at a stable URL is enough — no API required.',
        },
        {
          title: 'Run the validator',
          body: 'It fetches what you published and reports what it found. Every finding locates the problem and states the fix.',
        },
        {
          title: 'Open a registry entry',
          body: 'A pull request. The measurement happens on our side and is visible to anyone who looks.',
        },
      ],
    },

    ladder: {
      kicker: 'Conformance',
      title: 'A ladder, not a gate',
      lead: 'Every level is a membership class. You are in the network at L0, and each rung up makes more of it useful to you — but stopping is a position, not a failure.',
      respectNote:
        'Two classes never climb past L1: apps whose records are irreducibly personal, and apps that simply choose not to publish. Both are listed, and both are respected members.',
    },

    network: {
      kicker: 'The network',
      title: 'Who is in the registry',
      lead: 'The registry lists applications, records what was measured, and does nothing else. It is not a directory of partners and it does not rank anyone.',
      tableHead: {
        publisher: 'Application',
        domains: 'Publishes',
        state: 'Entry state',
      },
      proposedLabel: 'Proposed',
      proposedExplainer:
        'These entries were opened on each team’s behalf from the public analysis, and are waiting for that team to confirm them. Nobody here has claimed conformance, and none of these are endorsements.',
      measuredNote:
        'Measured conformance states appear here when the validator starts running against live feeds on a schedule.',
    },

    horizon: {
      kicker: 'The long horizon',
      title: 'Where this could go',
      ambitionLabel: 'Ambition, not roadmap',
      stages: [
        {
          title: 'An emergency network',
          body: 'Apps built during one emergency can read each other, so the next one starts with infrastructure instead of a spreadsheet.',
        },
        {
          title: 'An interoperability standard',
          body: 'The schema outlives the emergency that produced it, and becomes the ordinary way aid data is published.',
        },
        {
          title: 'A regional ecosystem',
          body: 'Another city, another country, adopts the same document without asking anyone — because it is CC0 and there is nobody to ask.',
        },
      ],
    },

    finalCta: {
      title: 'The specification is public. So is everything behind it.',
      body: 'The normative text, the schemas, the validator and the decisions that produced them are all in the repository, under an open licence, today.',
      developers: 'Read the specification',
      join: 'Contribute',
      github: 'The repository',
    },
  },

  footer: {
    principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
    principleGloss: 'We grow together: we don’t compete, we feed each other.',
    license: 'Apache-2.0 code · CC0 spec & registry',
    sourceCode: 'Source code',
    foundingRecord: 'Founding record',
    languages: 'Languages',
    specStatus: 'Specification 0.1 — draft under review',
  },

  notFoundPage: {
    metaTitle: 'Page not found — Cabuya',
    title: 'This page does not exist',
    description:
      'The thread you followed leads nowhere — the page may have moved during the migration, or the address has a typo.',
    backHome: 'Back to the home page',
    otherExitLabel: 'Read the founding record',
  },

  docs: {
    portal: 'Developers',
    sidebar: 'Documentation',
    breadcrumb: 'Breadcrumb',
    pagination: 'Page navigation',
    previous: 'Previous',
    next: 'Next',
    onThisPage: 'On this page',
    openNav: 'Browse the documentation',
    closeNav: 'Close',
    updated: 'Updated',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Select and copy',
    copyAsMarkdown: 'Copy as Markdown',
    viewMarkdown: 'View the Markdown',
    field: 'Field',
    type: 'Type',
    required: 'Required',
    description: 'Description',
    yes: 'Yes',
    no: 'No',
    specifiedNotMeasured: 'Specified, but not measured by version 0.1.',
  },

  portal: {
    metaTitle: 'Developers — Cabuya',
    metaDescription:
      'Publish and read aid data with one shared schema. The specification, the schemas and the validator, with a quickstart that takes an afternoon.',
    eyebrow: 'Developers',
    title: 'Everything you need to publish, and nothing you need to ask for',
    lead: 'Cabuya is a document and a validator. There is no account to create, no key to request, and nobody to negotiate with — including us.',
    promiseTitle: 'The five-minute version',
    promiseBody:
      'Put a JSON file describing your places at a stable URL, and a small manifest at a known path saying who you are. Run the validator against them and fix what it reports. That is conformance at L2, and for a small application it is an afternoon.',
    transportsTitle: 'One schema, four transports',
    transportsLead:
      'The same place record moves four ways. Which one you serve is an operations decision; the record does not change, so a consumer written against one works against the others.',
    pathsTitle: 'Three ways in',
    pathsLead:
      'Most teams arrive wanting one of these. They are independent — publishing does not require consuming, and neither requires the agent skill.',
    paths: [
      {
        title: 'Publish',
        body: 'Export what you already have in the shared schema, and let anyone read it.',
        forWhom:
          'You run an application with places, needs or capacities in it',
      },
      {
        title: 'Consume',
        body: 'Read other publishers’ feeds under the consumption rules, with attribution intact.',
        forWhom: 'You want more coverage than your own data gives you',
      },
      {
        title: 'Teach an agent',
        body: 'Install the skill and your coding agent knows the protocol, offline, with the spec vendored.',
        forWhom: 'You would rather have an agent do the integration',
      },
    ],
    startTitle: 'Where to start',
    startBody:
      'The specification and the validator are in the repository today. The quickstart, the rendered spec and the live validator are being written now — until they are up, the repository is the complete source.',
  },

  quickstart: {
    metaTitle: 'Quickstart — Cabuya',
    metaDescription:
      'Publish your first Cabuya feed. Two files, one validator run, and a registry entry. Copy-paste in five minutes; a real mapping is an afternoon.',
    title: 'Publish your first feed',
    lead: 'Two files and a validator run. Everything below is copy-paste ready and conforms to the specification it teaches — the blocks on this page are checked by the test suite against the real validator.',

    agentPathTitle: 'If you have a coding agent',
    agentPathBody:
      'Install the skill and tell it to publish a Cabuya feed. The skill vendors the specification, so it works without network access and without guessing at field names.',
    handPathTitle: 'If you are doing it by hand',
    handPathBody:
      'Five steps, below. Step 3 is the one that catches people — read it even if you are skimming.',

    fileFirstTitle: 'Save this first',
    fileFirstBody:
      'This is a complete, conforming manifest. Change the two URLs and the publisher id to yours, and you have finished step 1.',

    steps: [
      {
        title: 'Write the manifest',
        body: 'It says who you are, what you publish and under which licence. Twelve lines is a real one, not a stub.',
      },
      {
        title: 'Put it at /.well-known/cabuya.json',
        body: 'The path is fixed. Consumers look there and nowhere else, so there is no discovery step to implement.',
      },
      {
        title: 'Exclude that path from your catch-all',
        body: 'Not optional. If your framework serves index.html for unknown paths, your manifest returns 200 with HTML, and every consumer treats it as absent.',
      },
      {
        title: 'Serialize your places into the envelope',
        body: 'The envelope carries five fields and an array. Map what you already have; publish null for anything nobody has actually confirmed.',
      },
      {
        title:
          'Run the validator until it is green, then open a registry entry',
        body: 'Every finding names the field and states the fix. When the run is clean, one pull request adds you to the registry.',
      },
    ],

    spaTitle: 'Step 3, per stack',
    spaLead:
      'Find yours, apply the one line, then request the URL and check that what comes back is JSON.',
    spaWhy:
      'Four of the twenty applications in the founding analysis failed here, and all four believed they had published. The manifest was reachable, returned 200, and contained their homepage.',

    piiTitle: 'Before you publish: the one decision that is yours',
    piiLead:
      'Cabuya carries places, not people. Look at the fields you are about to map and confirm that none of them holds a person’s name, a personal phone or email, an individual case, or a moderation verdict about somebody.',
    piiKeysLabel: 'Field names the validator rejects outright',
    piiPatternsLabel: 'Value shapes it flags wherever they appear',
    piiConfirm:
      'A human makes this call once, when the mapping is written. The validator checks it on every run afterwards, and it reports the field, never the value it found.',

    validatorTitle: 'Run it',
    validatorLead:
      'Point the validator at your manifest URL. It follows the feeds it declares, and reports what it found.',
    validatorOpen: 'Open the validator',
    validatorPending:
      'The paste mode runs the same engine in your browser, with nothing uploaded. URL checking — which also measures the transport behaviour — needs a server, and that part is still being built. The command line does both today:',

    honestyTitle: 'How long this actually takes',
    honestyBody:
      'Five minutes is the honest number for the path above: two static files, copied, edited and uploaded. It is a real conformance level — L2 — and it is genuinely useful to consumers.',
    honestyAfternoon:
      'Mapping a live database into the schema is an afternoon, sometimes two: your statuses have to be reconciled with the shared vocabulary, and somebody has to decide what your data actually means. That work is not avoidable and we would rather say so here than have you discover it at step 4.',
  },

  spec: {
    indexTitle: 'Specification',
    indexDescription:
      'The Cabuya protocol specification. Versioned, with stable section anchors, rendered from the same files the validator and the agent skill read.',
    indexLead:
      'Every version keeps its own URL forever. This page lists them; the text itself lives one level down.',
    versionLabel: 'Version',
    statusLabels: {
      draft: 'Draft — under review',
      rc: 'Release candidate',
      normative: 'Normative',
      superseded: 'Superseded',
    },
    permanenceTitle: 'Versioned URLs are permanent',
    permanenceBody:
      'A specification URL points at one version and keeps pointing at it. There is no "latest" alias, because a normative document that changes under its own address is a document nobody can cite.',
    rcRuleTitle: 'What a release candidate means',
    rcRuleBody:
      'A release candidate is frozen except for defects. If it changes for any other reason, it becomes a new candidate rather than a quietly amended one.',
    sectionsTitle: 'Sections',
    sectionsCountLabel: 'sections',
    normativeLanguageNotice:
      'The normative text is published in English. This page shows it unchanged; the navigation around it is in Spanish. A translation, when one exists, will be informative — the English remains the text that governs.',
    schemasTitle: 'Schemas',
    schemasDescription:
      'The JSON Schemas the validator enforces. Every field with its type, constraints, an example value, and the check ids that fire on it — generated from the schema files themselves.',
    schemasLead:
      'Generated from the schema files themselves, so this page cannot describe a field the validator does not enforce.',
    schemaIdLabel: 'Schema id',
    fieldsTitle: 'Fields',
    checksColumn: 'Checks',
    profileColumn: 'Profile',
    exampleColumn: 'Example',
    coreLabel: 'Core',
    extendedLabel: 'Extended',
    examplesTitle: 'Examples',
    examplesLead:
      'Two that conform and three that do not. The invalid ones state, in their own file, what they are demonstrating — and the validator’s tests assert against those exact strings.',
    validLabel: 'Conforms',
    invalidLabel: 'Does not conform',
    teachingNote: 'What this example demonstrates',
  },

  validator: {
    metaTitle: 'Validator — Cabuya',
    metaDescription:
      'Check a feed or manifest against the Cabuya specification. Paste a document to validate it in your browser, or point the validator at a live URL.',
    title: 'Validator',
    lead: 'The same engine the command line runs, and the same check ids. Every finding names the field, states the rule, and tells you what to change.',
    urlModeTitle: 'Check a live URL',
    urlModeLead:
      'Point it at your manifest or a feed. The validator fetches what is published and reports what it found, including the transport behaviour a file on disk cannot show.',
    urlLabel: 'Manifest or feed URL',
    urlPlaceholder: 'https://example.org/.well-known/cabuya.json',
    run: 'Run the validator',
    running: 'Running…',
    pasteModeTitle: 'Check a document you have not published yet',
    pasteModeLead:
      'Paste a feed or manifest. Useful before anything is deployed, and for a document you would rather not send anywhere.',
    pastePrivacy:
      'This runs entirely in your browser. The document is not uploaded, not logged, and never leaves this page.',
    pasteLabel: 'The document',
    pastePlaceholder: '{ "last_updated": "…", "ttl": 900, … }',
    kindLabel: 'What is this?',
    kindFeed: 'A place feed',
    kindManifest: 'A manifest',
    resultTitle: 'Result',
    blockersTitle: 'Blocking the next level',
    errorsTitle: 'Errors',
    warningsTitle: 'Warnings',
    notesTitle: 'Notes',
    noFindings: 'Nothing to report.',
    copyReport: 'Copy the report as Markdown',
    copied: 'Copied',
    fixLabel: 'Fix',
    ruleLabel: 'Rule',
    specLabel: 'Specification',
    checkLabel: 'About this check',
    unavailableTitle: 'URL checking is not deployed yet',
    unavailableBody:
      'The service that fetches a URL is still being built. In the meantime the command line does the same job — and the paste mode below runs the identical engine in your browser.',
    transportTitle: 'Could not reach it',
    transportBody:
      'This says nothing about your data. The request failed — DNS, TLS, a timeout, or the host refusing us — and the validator stops rather than guessing. Nothing here means your feed is wrong.',
    parseErrorTitle: 'That is not valid JSON',
    parseErrorBody:
      'The document could not be parsed, so no checks ran. Fix the syntax and try again.',
    degradedNote:
      'Schema-valid; conformance unmeasured. Running without network means the transport checks did not run, so no level can be measured — that is different from passing them.',
  },

  probe: {
    metaTitle: 'Our probe — Cabuya validator',
    metaDescription:
      'What the CabuyaValidator user agent is, exactly which requests it makes and how often, what it keeps — nothing at all — and how to stop it fetching your site.',
    title: 'Our probe',
    lead: 'If you found this page in your server logs, something asked the Cabuya validator to check a feed on your domain. Here is precisely what that means.',
    uaTitle: 'The user agent',
    uaBody:
      'Every request the validator makes identifies itself and links back to this page, so a log line is never a mystery. It is the only user agent we send, and we do not vary it.',
    whatTitle: 'What it requests',
    whatItems: [
      'A GET of the URL somebody supplied — usually /.well-known/cabuya.json.',
      'A GET of each feed that manifest declares, to check the documents themselves.',
      'Occasionally a second GET of the same URL a few seconds later. That is the always-now check: it compares two responses to see whether a timestamp is following the clock rather than the content.',
      'Nothing else. No crawl, no link following beyond the declared feeds, no attempt at any other path.',
    ],
    politenessTitle: 'How it behaves',
    politenessItems: [
      'At most 60 requests an hour to any one host, across every caller.',
      'One attempt per request. It never retries a failure.',
      'An eight-second timeout, then it gives up.',
      'It stops reading at 5 MB rather than pulling whatever arrives.',
      'It sends no Referer, so it never reveals who asked.',
      'It follows at most three redirects, checking each destination before going there.',
    ],
    retentionTitle: 'What it keeps',
    retentionBody:
      'Nothing. The document is fetched, checked, and discarded with the request. No feed body is stored, no URL is logged by us, and no analytics event carries anything a publisher submitted. The only thing written anywhere is an anonymous counter used to enforce the limits above.',
    optOutTitle: 'How to stop it',
    optOutBody:
      'Disallow the user agent in your robots.txt and it will not fetch you. We would rather you told us what went wrong first — a validator that has become a nuisance is a bug on our side — but the decision is yours and it does not need our agreement.',
  },

  checks: {
    metaTitle: 'Checks — Cabuya validator',
    metaDescription:
      'Every check the Cabuya validator runs: its id, severity, level, the rule it enforces, and how to fix a document that fails it. Anchors are stable forever.',
    title: 'Checks',
    lead: 'Every check the validator can report, with a stable anchor. Error messages link here, so these URLs do not move.',
    stableNote:
      'A check id is permanent. Renaming one would break the fix loop of every agent that cached the old id, so retired checks keep their id and are marked rather than removed.',
    implementedLabel: 'Implemented',
    implementedCountLabel: 'implemented',
    plannedLabel: 'Catalogued, not yet implemented',
    severityLabel: 'Severity',
    levelLabel: 'Level',
    familyLabels: {
      discovery: 'Discovery',
      envelope: 'Envelope',
      record: 'Record',
      pii: 'Person-level data',
      behavior: 'Behaviour',
      api: 'Read API',
      write: 'Write API',
      license: 'Licensing',
    },
    ruleLabel: 'Rule',
    fixLabel: 'Fix',
    specLabel: 'Specification',
    countSummary: 'checks catalogued',
    untranslatedNote:
      'Checks that are catalogued but not yet implemented are shown in English. Their rules are translated when the check ships, so a Spanish reader is never shown a translation of something that does not run yet.',
  },

  changelog: {
    metaTitle: 'Changelog — Cabuya Protocol',
    metaDescription:
      'Every notable change to the Cabuya specification, in one timeline, parsed from the repository so the page cannot drift from the release it describes.',
    title: 'Changelog',
    lead: 'Every notable change to the specification, newest first. Parsed from the repository rather than transcribed, so this page and the release it describes cannot disagree.',
    scopeTitle: 'What this covers',
    scopeBody:
      'The specification: its sections, schemas, examples, profiles and vocabulary. Versioning follows SemVer with one extra rule — a release candidate becomes normative only after at least one publisher has shipped it publicly. The specification never outruns its implementers.',
    unreleased: 'Unreleased',
    nothingYet: 'Nothing recorded under this version yet.',
    otherTracksTitle: 'The validator and the skill',
    otherTracksBody:
      'They will appear on this timeline as they cut releases. They are not listed as empty tracks in the meantime: a timeline with blank rows reads as a project that stopped rather than one that has not started.',
    quotedNotice:
      'Release entries are quoted from the repository, unchanged. The changelog itself is written in English like the rest of the repository, and a translated quotation would not be the record a reader checking a release needs.',
    groupLabels: {
      added: 'Added',
      changed: 'Changed',
      deprecated: 'Deprecated',
      removed: 'Removed',
      fixed: 'Fixed',
      security: 'Security',
    },
  },

  rfcs: {
    metaTitle: 'RFCs — Cabuya Protocol',
    metaDescription:
      'Normative changes to the Cabuya Protocol land only through the RFC process. The index, the status of each proposal, and how to open one yourself.',
    title: 'RFCs',
    lead: 'A normative change reaches the specification only through an RFC. This is every one that has been opened, with its status and its decision.',
    processTitle: 'What needs one',
    processBody:
      'Any change to a schema field, cardinality, enum, required or optional status, conformance level, or the meaning of a defined term. Plus governance and licensing. Everything else — typos, examples, documentation, tests, website copy — takes the fast path and needs one approval.',
    whoTitle: 'Who may open one',
    whoBody:
      'Anyone. You do not have to be a maintainer and you do not have to have written any code. The person who has hit a wall implementing the specification is often the person best placed to describe what is wrong with it.',
    privacyTitle: 'The section that can decline an RFC on its own',
    privacyBody:
      'Every RFC states what person-level data its change could make reachable, directly or by joining with another source. An RFC that cannot answer that does not proceed, however useful the field would be. It is the only mandatory section that is not about the change itself.',
    columnRfc: 'RFC',
    columnTitle: 'Title',
    columnTier: 'Tier',
    columnStatus: 'Status',
    columnOpened: 'Opened',
    columnDecided: 'Decided',
    quotedNotice:
      'An RFC is rendered exactly as its authors wrote it, in whatever language or languages they used. RFC-0001 is bilingual by design: it is a document people sign, and both halves have to be signable.',
    statusLabels: {
      draft: 'Draft',
      open: 'Open for comment',
      accepted: 'Accepted',
      declined: 'Declined',
      withdrawn: 'Withdrawn',
      superseded: 'Superseded',
    },
    tierLabels: {
      governance: 'Governance',
      normative: 'Normative',
      breaking: 'Breaking',
    },
    emptyIndex: 'No RFC has been opened yet.',
    templateLink: 'The template',
    backToIndex: 'All RFCs',
    openedLabel: 'Opened',
    decidedLabel: 'Decided',
    notDecided: 'Not decided',
    sourceLabel: 'The source file',
  },

  rootDocs: {
    sourceLinkSuffix: 'on GitHub — the file this page renders',
    sourceNote:
      'This page renders a file in the repository. The file is the source: it is what a fork carries, what a pull request changes, and what governs if the two ever disagree.',
  },

  registry: {
    metaTitle: 'Registry — Cabuya Protocol',
    metaDescription:
      'Applications that publish Cabuya feeds, with the measured result of the last validation run and the date it was made. Listing is not endorsement.',
    title: 'Registry',
    lead: 'Applications that publish a Cabuya feed, and what the validator last found when it read one. Every state on this page was measured; none of it was declared.',
    notEndorsementTitle: 'Inclusion is not endorsement',
    notEndorsement:
      'Listing an application here says that it publishes a feed and that we measured it. It says nothing about whether the information in that feed is accurate, whether the organisation behind it is one you should work with, or whether the aid it points to is available today. A directory lists. A registry measures. Neither one recommends.',
    everyEntryMeasured:
      'Every entry shows when it was last validated and what the run found. A state with no timestamp is a state nobody has measured yet, and it is labelled as one.',
    columnPublisher: 'Publisher',
    columnState: 'Measured state',
    columnLevel: 'Level',
    columnDomains: 'Domains',
    columnChecked: 'Last validated',
    filterTitle: 'Filter',
    filterAll: 'All',
    filterState: 'State',
    filterDomain: 'Domain',
    filterReview: 'Review',
    filterSearch: 'Search',
    filterSearchPlaceholder: 'publisher or domain',
    filterEmpty: 'No entry matches those filters.',
    filterShowing: 'showing',
    reviewProposed: 'Proposed',
    reviewReviewed: 'Reviewed',
    reviewTitle: 'Proposed and reviewed',
    reviewBody:
      'A proposed entry was added on a team\u2019s behalf from public information and is waiting for them to confirm it. It is shown because hiding it would make the registry look emptier than the network is — and it is labelled because a team that has not answered has not agreed to anything.',
    officialSourcesTitle: 'Official sources',
    officialSourcesBody:
      'These are not publishers and they have not adopted anything. They are the institutions that person-level questions converge to, listed here so that an application implementing the protocol knows where to send someone the protocol deliberately cannot help. Nobody on this list has been asked to join, and their presence implies no relationship.',
    officialAuthorityLabel: 'Authority',
    licenceTitle: 'The registry itself',
    licenceBody:
      'The entries below live in this repository as CC0 JSON, one file per publisher, and can be read without this page. Measured state does not live there — it is written to a key-value store by the validation cron, because a conformance level in a file is a conformance level somebody can edit in a pull request.',
    joinTitle: 'Getting listed',
    joinBody:
      'Publish a feed, run the validator against it, and open a pull request adding your entry. Nobody is added by a form and nobody is added by us deciding you belong; the entry is yours and so is the correction if it is wrong.',
    measuredTitle: 'Measured',
    measuredBody:
      'What the validator found. Produced by a run against the live feed, at the timestamp shown, with no input from the publisher.',
    declaredTitle: 'Declared',
    declaredBody:
      'What the entry says about itself. Reviewed by a human before merge, but not verified by a machine — this block is a claim, and it is separated from the block above for exactly that reason.',
    stateLabel: 'State',
    levelLabel: 'Level',
    checkedLabel: 'Last validated',
    neverMeasured: 'Not yet measured',
    failingChecksTitle: 'Failing checks',
    failingChecksBody:
      'Each id links to the check that produced it, where the rule and the fix are written out.',
    historyTitle: 'History',
    historyBody:
      'One point per day, appended by the validation cron. A registry that only showed today would let a feed that breaks every other week look reliable.',
    historyEmpty:
      'No history yet. The first point appears after the first run.',
    feedsTitle: 'Feed',
    canonicalLabel: 'Canonical URL',
    domainsLabel: 'Entity domains',
    eventsLabel: 'Events',
    addedLabel: 'Added',
    confirmedLabel: 'Confirmed by the team',
    unconfirmedNote:
      'This entry was created from public information and has not been confirmed by the team that runs the application. If that is you, the entry is a file in a public repository and the pull request that corrects it is welcome.',
    notesLabel: 'Notes',
    embedTitle: 'Embed the badge',
    embedBody:
      'The badge reads the same measurement this page does, and links back here so anyone can check it. It refuses to say more than the validator measured, and it never says certified.',
    embedMarkdown: 'Markdown',
    embedHtml: 'HTML',
    backToIndex: 'All entries',
    publisherMetaDescription:
      'Cabuya registry entry for {id} ({host}): {state} Entity domains: {domains}. Measured by the validator, never self-declared.',
    buildTimeOnlyNote:
      'This page was built without a connection to the measurement store, so every entry shows as not yet measured. That is a property of this build, not of the publishers.',
    domainLabels: {
      place: 'Places',
      need: 'Needs',
      alert: 'Alerts',
      missing_persons: 'Missing persons',
    },
  },

  markdown: {
    siteNavigation: 'Site Navigation',
    languageNote: 'This page is also available in Spanish.',
  },
};
