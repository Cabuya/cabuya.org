/**
 * The institutional-page contract.
 *
 * Seven pages share one renderer and one copy object, and the `.md` twin is
 * serialized from that same object. That is what makes the twin unable to fall
 * behind the page — but only as long as two things hold:
 *
 *   1. The serializer emits every block kind. A kind it silently drops would
 *      produce a twin that passes `md:check` on coverage while losing a whole
 *      section's worth of meaning.
 *   2. Every copy object in both locales is complete and well-formed. A missing
 *      CTA or an out-of-band description does not fail the type checker, but it
 *      does fail the SEO gate — after a full build, in CI, far from the edit.
 *
 * These assert both directly against the shipped copy, so a new institutional
 * page is caught at `pnpm run test` rather than at `pnpm run seo:check`.
 */
import { describe, expect, it } from 'vitest';

import { serializeInstitutionalPageToMarkdown } from '@/lib/markdown-for-agents';
import { en } from '@/lib/translations/en';
import { es } from '@/lib/translations/es';

import type {
  InstitutionalPageCopy,
  SiteTranslations,
} from '@/lib/translations/types';

const PAGE_KEYS = [
  'howItWorksPage',
  'transparencyPage',
  'emergenciesPage',
  'leadersPage',
  'partnersPage',
  'developersPage',
  'privacyPage',
] as const satisfies ReadonlyArray<keyof SiteTranslations>;

const LOCALES = { es, en } as const;

const pages = (
  locale: keyof typeof LOCALES
): [string, InstitutionalPageCopy][] =>
  PAGE_KEYS.map((key) => [
    `${locale}.${key}`,
    LOCALES[locale][key] as InstitutionalPageCopy,
  ]);

const ALL_PAGES = [...pages('es'), ...pages('en')];

/** The band `scripts/audit-seo.mjs` enforces, restated so this fails first. */
const DESCRIPTION_MIN = 130;
const DESCRIPTION_MAX = 160;

describe('serializeInstitutionalPageToMarkdown', () => {
  const copy: InstitutionalPageCopy = {
    title: 'How it works',
    description: 'x'.repeat(140),
    eyebrow: 'The model',
    lead: 'The lead paragraph.',
    sections: [
      {
        heading: 'Prose section',
        intro: 'An intro line.',
        blocks: [
          { kind: 'prose', paragraphs: ['First para.', 'Second para.'] },
        ],
      },
      {
        heading: 'Steps section',
        blocks: [
          {
            kind: 'steps',
            steps: [
              { title: 'Publish', body: 'Someone publishes a need.' },
              { title: 'Deliver', body: 'A responsable delivers it.' },
            ],
          },
        ],
      },
      {
        heading: 'Cards section',
        blocks: [
          {
            kind: 'cards',
            cards: [
              { title: 'Received', body: 'What the network contributed.' },
            ],
          },
        ],
      },
      {
        heading: 'List section',
        blocks: [{ kind: 'list', items: ['One item', 'Another item'] }],
      },
      {
        heading: 'Callout section',
        blocks: [
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Not an emergency service',
            body: 'Call your local emergency lines first.',
          },
        ],
      },
      {
        heading: 'Figure section',
        blocks: [
          {
            kind: 'figure',
            figure: {
              srcBase: '/images/pages/app/app-avances-desktop',
              widths: [640, 1240],
              alt: 'The application progress band',
              width: 1240,
              height: 345,
              caption: 'A real view of the application; the data is live.',
              frame: 'browser',
            },
          },
        ],
      },
      {
        heading: 'Split section',
        blocks: [
          {
            kind: 'split',
            paragraphs: ['Copy beside an image.'],
            figure: {
              srcBase: '/images/pages/app/app-seguimiento-mobile',
              widths: [390, 780],
              alt: 'The private follow-up search',
              width: 390,
              height: 844,
              frame: 'phone',
            },
          },
        ],
      },
      {
        heading: 'Stat pair section',
        blocks: [
          {
            kind: 'statPair',
            relation: '≠',
            items: [
              { label: 'Received', body: 'What came in.' },
              { label: 'Used with evidence', body: 'What was proven.' },
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Go to the app',
      body: 'Everything transactional happens there.',
      primary: {
        label: 'Open the app',
        href: 'https://ayuda.cabuya.org',
        external: true,
      },
      secondary: { label: 'Transparency', href: '/transparency' },
    },
  };

  const md = serializeInstitutionalPageToMarkdown(copy, {
    lang: 'en',
    canonical: 'https://cabuya.org/en/how-it-works',
  });

  it('carries the front block the completeness gate requires', () => {
    expect(md).toContain('# How it works');
    expect(md).toContain('Language: en');
    expect(md).toContain('Canonical: https://cabuya.org/en/how-it-works');
  });

  it('renders the lead as the body, above the sections', () => {
    expect(md.indexOf('The lead paragraph.')).toBeLessThan(
      md.indexOf('## Prose section')
    );
  });

  it('emits every section heading', () => {
    for (const section of copy.sections) {
      expect(md).toContain(`## ${section.heading}`);
    }
  });

  it('emits an intro line when a section has one', () => {
    expect(md).toContain('An intro line.');
  });

  it('numbers steps and keeps their titles', () => {
    expect(md).toContain('1. **Publish** — Someone publishes a need.');
    expect(md).toContain('2. **Deliver** — A responsable delivers it.');
  });

  it('renders cards and list items as bullets', () => {
    expect(md).toContain('- **Received** — What the network contributed.');
    expect(md).toContain('- One item');
    expect(md).toContain('- Another item');
  });

  it('renders a callout as a blockquote so the warning survives', () => {
    expect(md).toContain(
      '> **Not an emergency service** — Call your local emergency lines first.'
    );
  });

  it('turns the CTA into its own section with both links', () => {
    expect(md).toContain('## Go to the app');
    expect(md).toContain('- [Open the app](https://ayuda.cabuya.org)');
    expect(md).toContain('- [Transparency](/transparency)');
  });

  it('FIXTURE: drops nothing — every block kind reaches the output', () => {
    // The failure this guards is silent: an unhandled kind produces a twin that
    // still passes the front-block and navigation checks.
    const kinds = copy.sections.flatMap((s) => s.blocks.map((b) => b.kind));
    expect(new Set(kinds).size).toBe(8);
    for (const marker of [
      'First para.',
      '**Publish**',
      '**Received**',
      '- One item',
      '**Not an emergency service**',
      '![The application progress band]',
      'Copy beside an image.',
      '![The private follow-up search]',
      '**Used with evidence**',
    ]) {
      expect(md).toContain(marker);
    }
  });

  it('carries a figure caption into the twin, not just the image', () => {
    // An agent reading the twin must learn what a reader of the page learns —
    // including the rule-0 declaration that a screenshot shows live app data.
    expect(md).toContain('_A real view of the application; the data is live._');
  });

  it('resolves a figure to its largest responsive variant', () => {
    expect(md).toContain('/images/pages/app/app-avances-desktop-1240.webp');
  });

  it('refuses to serialize an unknown block kind instead of guessing', () => {
    // Regression guard for the old `else` catch-all, which silently rendered
    // any new kind as a callout and desynced the twin from the page.
    const rogue = {
      ...copy,
      sections: [
        {
          heading: 'Rogue',
          blocks: [{ kind: 'not-a-real-kind' } as never],
        },
      ],
    };
    expect(() =>
      serializeInstitutionalPageToMarkdown(rogue, {
        lang: 'en',
        canonical: 'https://cabuya.org/en/x',
      })
    ).toThrow(/Unserialized institutional block kind/);
  });

  it('omits the secondary CTA link when there is none', () => {
    const { secondary: _dropped, ...primaryOnly } = copy.cta;
    const out = serializeInstitutionalPageToMarkdown(
      { ...copy, cta: primaryOnly },
      { lang: 'en', canonical: 'https://cabuya.org/en/how-it-works' }
    );
    expect(out).toContain('- [Open the app](https://ayuda.cabuya.org)');
    expect(out).not.toContain('- [Transparency](/transparency)');
  });

  it('ends with exactly one Site Navigation block', () => {
    expect(md.split('## Site Navigation').length - 1).toBe(1);
  });
});

describe('shipped institutional copy', () => {
  it('covers all seven pages in both languages', () => {
    expect(ALL_PAGES).toHaveLength(14);
  });

  it.each(ALL_PAGES)('%s is structurally complete', (_id, copy) => {
    expect(copy.title.trim()).not.toBe('');
    expect(copy.eyebrow.trim()).not.toBe('');
    expect(copy.lead.trim()).not.toBe('');
    expect(copy.sections.length).toBeGreaterThan(0);
    expect(copy.cta.title.trim()).not.toBe('');
    expect(copy.cta.body.trim()).not.toBe('');
    expect(copy.cta.primary.label.trim()).not.toBe('');
    expect(copy.cta.primary.href.trim()).not.toBe('');
  });

  it.each(ALL_PAGES)('%s description lands in the SEO band', (_id, copy) => {
    // `scripts/audit-seo.mjs` enforces this after a full build. Failing here
    // costs seconds instead of a build.
    expect(copy.description.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(copy.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it.each(ALL_PAGES)('%s has no empty section or block', (_id, copy) => {
    for (const section of copy.sections) {
      expect(section.heading.trim()).not.toBe('');
      expect(section.blocks.length).toBeGreaterThan(0);
      for (const block of section.blocks) {
        if (block.kind === 'prose')
          expect(block.paragraphs.length).toBeGreaterThan(0);
        if (block.kind === 'steps')
          expect(block.steps.length).toBeGreaterThan(0);
        if (block.kind === 'cards')
          expect(block.cards.length).toBeGreaterThan(0);
        if (block.kind === 'list')
          expect(block.items.length).toBeGreaterThan(0);
        if (block.kind === 'callout') expect(block.body.trim()).not.toBe('');
      }
    }
  });

  it.each(ALL_PAGES)('%s uses unprefixed internal hrefs', (_id, copy) => {
    // `InstitutionalPage.astro` adds the language prefix. A copy object that
    // hardcodes `/en` produces `/en/en/...` in English and a wrong-language
    // link in Spanish.
    for (const link of [copy.cta.primary, copy.cta.secondary]) {
      if (!link || link.external) continue;
      expect(link.href.startsWith('/')).toBe(true);
      expect(link.href.startsWith('/en/')).toBe(false);
      expect(link.href.startsWith('/es/')).toBe(false);
    }
  });

  it('keeps the two languages structurally parallel', () => {
    // Not a translation check — a shape check. A section added to one language
    // and not the other is exactly what `parity:check` exists to catch, and
    // catching it here names the page instead of a diff.
    for (const key of PAGE_KEYS) {
      const esPage = es[key] as InstitutionalPageCopy;
      const enPage = en[key] as InstitutionalPageCopy;
      expect(`${key}: ${enPage.sections.length}`).toBe(
        `${key}: ${esPage.sections.length}`
      );
      esPage.sections.forEach((section, index) => {
        const counterpart = enPage.sections[index];
        expect(
          `${key}[${index}]: ${counterpart.blocks.map((b) => b.kind).join(',')}`
        ).toBe(
          `${key}[${index}]: ${section.blocks.map((b) => b.kind).join(',')}`
        );
      });
      expect(`${key}: ${Boolean(enPage.cta.secondary)}`).toBe(
        `${key}: ${Boolean(esPage.cta.secondary)}`
      );
    }
  });
});
