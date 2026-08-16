import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { en } from '@/lib/translations/en';
import { es } from '@/lib/translations/es';

const ROOT = process.cwd();
const read = (relative: string) => readFileSync(join(ROOT, relative), 'utf-8');

/**
 * `/movement` replaced a directory of named people, allied communities and
 * allied companies. Corag presents itself as a movement rather than through
 * representatives, so the roster is not coming back by accident: these tests
 * fail if a name, an organization or a headcount reappears in the copy.
 */
const LOCALES = [
  ['es', es.movementPage],
  ['en', en.movementPage],
] as const;

const allCopy = (page: (typeof LOCALES)[number][1]): string =>
  [
    page.title,
    page.description,
    page.eyebrow,
    page.lead,
    page.closingTitle,
    page.closingBody,
    page.channelsLabel,
    ...page.beats.flatMap((b) => [b.title, b.body]),
  ].join(' ');

describe('the movement page names nobody', () => {
  /** The people who were listed, and the organizations alongside them. */
  const REMOVED = [
    'Sergio',
    'Melisa',
    'Sebastián',
    'Sebastian',
    'Alejandro',
    'Juliana',
    'Andrés',
    'Andres',
    'Estrella',
    'Florez',
    'Agudelo',
    'Escobar',
    'DailyBot',
    'Dailybot',
    'Pereira Tech Talks',
    'Asaulia',
    'Meteor',
  ];

  for (const [lang, page] of LOCALES) {
    it(`carries no personal or organization name in ${lang}`, () => {
      const copy = allCopy(page);
      const found = REMOVED.filter((name) => copy.includes(name));
      expect(found).toEqual([]);
    });

    it(`quotes no headcount in ${lang}`, () => {
      // "42 personas", "hundreds of volunteers" — a figure we would have to
      // keep true. Rule 0 applies here as much as anywhere.
      const copy = allCopy(page);
      expect(copy).not.toMatch(
        /\b\d+\s+(personas|people|voluntarios|volunteers)/i
      );
      expect(copy).not.toMatch(/\b(cientos|miles|hundreds|thousands)\b/i);
    });
  }

  it('renders no contributor or ally card', () => {
    const page = read('src/components/pages/MovementPage.astro');
    expect(page).not.toContain('ContributorCard');
    expect(page).not.toContain('AllyCard');
    expect(page).not.toContain('getPublishedCollaborators');
    expect(page).not.toContain('getAlliesByKind');
  });
});

describe('the old route still resolves', () => {
  const redirects = read('public/_redirects');

  it('sends /contributors to /movement in both languages', () => {
    expect(redirects).toMatch(/^\/contributors\s+\/movement\/\s+301$/m);
    expect(redirects).toMatch(/^\/en\/contributors\s+\/en\/movement\/\s+301$/m);
  });

  it('leaves nothing pointing at the retired path', () => {
    // Cloudflare does not chain redirects, so a rule still aimed at
    // /contributors/ would land the visitor on a 301 that never fires.
    const destinations = [
      ...redirects.matchAll(/^\S+\s+(\S+)\s+30[12]$/gm),
    ].map((m) => m[1]);
    expect(destinations.filter((d) => d.includes('/contributors'))).toEqual([]);
  });
});

describe('the chrome points at the new route', () => {
  for (const file of [
    'src/components/layout/Header.svelte',
    'src/components/layout/MobileMenu.svelte',
  ]) {
    it(`links /movement and not /contributors in ${file.split('/').pop()}`, () => {
      const source = read(file);
      expect(source).toContain('{prefix}/movement');
      expect(source).not.toContain('{prefix}/contributors');
    });
  }

  it('labels the entry with the motto in both languages', () => {
    expect(es.nav.movement).toBe('Servir requiere coraje');
    expect(en.nav.movement).toBe('Serving takes courage');
  });
});

describe('no founder name survives in the blog structured data', () => {
  it('credits Corag as an Organization, not a Person', () => {
    const source = read('src/components/pages/blog/BlogPostPage.astro');
    expect(source).not.toContain('Sergio Alexander');
    expect(source).not.toContain("'@type': 'Person'");
  });
});
