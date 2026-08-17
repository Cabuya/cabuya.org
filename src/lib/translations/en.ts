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

  markdown: {
    siteNavigation: 'Site Navigation',
    languageNote: 'This page is also available in Spanish.',
  },
};
