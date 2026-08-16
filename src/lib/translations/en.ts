import type { SiteTranslations } from './types';

/** English strings — written natively, not translated from Spanish. */
export const en: SiteTranslations = {
  siteTitle: 'Cabuya',
  siteTitleFull: 'Cabuya — the open aid interoperability protocol',
  siteDescription:
    'Cabuya is an open format that lets aid apps publish and read the same data: collection points, needs, capacities and deliveries. Any team can implement it in an afternoon, and nobody has to ask anyone for permission.',

  nav: {
    home: 'Home',
    foundingRecord: 'Founding record',
    github: 'GitHub',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToLanguage: 'Cambiar a español',
  },

  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
  },

  home: {
    metaTitle: 'Cabuya — the open aid interoperability protocol',
    metaDescription:
      'An open protocol so aid apps publish and read the same data. One schema, four transports; conformance measured by a public validator, never declared.',
    eyebrow: 'An open protocol for aid apps',
    title: 'Each app is a thread. The protocol is the rope.',
    pitch:
      'Cabuya is an open format that lets aid apps publish and read the same data: collection points, needs, capacities and deliveries.',
    pitchSecond:
      'Any team can implement it in an afternoon, and nobody has to ask anyone for permission. Conformance is measured by a published validator — never self-declared.',
    principleGloss: 'We grow together: we don’t compete, we feed each other.',
    statusNote:
      'The protocol specification (0.1) is a draft under review, and this site is being built in the open. The founding record — decisions, protocol design, evidence — is already public in the repository.',
  },

  footer: {
    principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
    principleGloss: 'We grow together: we don’t compete, we feed each other.',
    license: 'Apache-2.0 code · CC0 spec & registry',
    sourceCode: 'Source code',
    foundingRecord: 'Founding record',
  },

  notFoundPage: {
    metaTitle: 'Page not found — Cabuya',
    title: 'This page does not exist',
    description:
      'The thread you followed leads nowhere — the page may have moved during the migration, or the address has a typo.',
    backHome: 'Back to the home page',
  },

  markdown: {
    siteNavigation: 'Site Navigation',
    languageNote: 'This page is also available in Spanish.',
  },
};
