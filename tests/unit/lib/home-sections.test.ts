/**
 * The landing page's Rule-0 constraints, as tests.
 *
 * `docs/MESSAGING.md` attaches a constraint to every section of this page —
 * no adoption counts, nobody named without opt-in, ambition labelled as
 * ambition. Those are the claims a landing page drifts on first, because
 * copy edits feel small and each one is defensible on its own.
 *
 * So the constraints are assertions here, over the shipped translation
 * objects, and they fail on the edit rather than on the launch.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { homeSections } from '@/lib/home-markdown';
import { LANGUAGE_CODES } from '@/lib/language-codes';
import { allPublishers, displayHost } from '@/lib/registry-loader';
import { getTranslations } from '@/lib/translations';

const ROOT = process.cwd();
const HOME = join(ROOT, 'src', 'components', 'home');
const read = (file: string) => readFileSync(join(HOME, file), 'utf-8');

describe.each(LANGUAGE_CODES)('landing copy (%s)', (lang) => {
  const t = getTranslations(lang);

  it('carries every messaging beat', () => {
    // One section per beat. A missing beat is a page that stopped making one
    // of the arguments it was designed around.
    expect(t.home.hero.title.length).toBeGreaterThan(10);
    /*
     * The founding phrase is printed on this page in both languages, but the
     * reader's own language leads: `principle` is English on `/` and Spanish on
     * `/es`, with the other line beneath it. What must never happen is the phrase
     * disappearing from the section altogether, so the pair is checked rather
     * than one field.
     */
    expect(`${t.home.thesis.principle} ${t.home.thesis.gloss}`).toContain(
      'Crecemos juntos'
    );
    expect(t.home.howItWorks.steps).toHaveLength(4);
    expect(t.home.ladder.respectNote.length).toBeGreaterThan(40);
    expect(t.home.network.proposedExplainer.length).toBeGreaterThan(40);
    expect(t.home.horizon.stages).toHaveLength(3);
    expect(t.home.finalCta.title.length).toBeGreaterThan(10);
  });

  it('states no adoption count anywhere', () => {
    /*
     * The constraint from the section table: no count until the registry can
     * prove it per app, with a timestamp. A number in this copy would be a
     * traction claim, and it would be stale the week after it was written.
     */
    const copy = JSON.stringify(t.home);
    const numerals = copy.match(/\b\d+\b/g) ?? [];
    // Only ordinals the layout generates are acceptable, and those are not in
    // the copy at all — so any bare numeral here is a finding.
    expect(numerals, `numerals found in ${lang} landing copy`).toEqual([]);
    for (const word of [
      'apps are',
      'applications are',
      'aplicaciones ya',
      'apps ya',
    ]) {
      expect(copy.toLowerCase()).not.toContain(word);
    }
  });

  it('labels the horizon as ambition rather than as a plan', () => {
    const label = t.home.horizon.ambitionLabel.toLowerCase();
    expect(label).toMatch(/ambition|ambición/);
    /*
     * The stages themselves must promise nothing. The label is excluded from
     * this scan on purpose — it is allowed to say "not a roadmap", which is
     * the disclaimer, while the stages may not read like one.
     */
    const stages = JSON.stringify(t.home.horizon.stages).toLowerCase();
    expect(stages).not.toMatch(
      /roadmap|hoja de ruta|q[1-4] 20|by 20\d\d|en 20\d\d/
    );
  });

  it('states the thesis as intent, not as an achieved outcome', () => {
    expect(t.home.thesis.intentNote.length).toBeGreaterThan(30);
    const body =
      `${t.home.thesis.body} ${t.home.thesis.bodySecond}`.toLowerCase();
    for (const claim of [
      'already interoperate',
      'ya interoperan',
      'the network works',
      'la red funciona',
    ]) {
      expect(body).not.toContain(claim);
    }
  });

  it('uses none of the banned vocabulary', () => {
    // docs/BRAND_GUIDE.md §5. These are the words with which aid-tech
    // marketing spends other people's credibility.
    const copy = JSON.stringify(t.home).toLowerCase();
    for (const word of [
      'revolucionario',
      'revolutionary',
      'disruptiv',
      'certificad',
      'certified',
      'garantizad',
      'guaranteed',
      'powered by',
      'game-changer',
      'cutting-edge',
      'world-class',
      'seamless',
      'el mejor',
      'the best',
    ]) {
      expect(copy, `banned word "${word}"`).not.toContain(word);
    }
  });
});

describe('the signatories section', () => {
  const source = read('Signatories.astro');

  it('is empty, and therefore renders nothing', () => {
    expect(source).toMatch(/const SIGNATORIES: Signatory\[\] = \[\];/);
    expect(source).toContain('SIGNATORIES.length > 0 &&');
  });

  it('cannot hold an entry without a written opt-in reference', () => {
    // Not a convention — a required field. An entry with no reference to the
    // written permission does not type-check.
    expect(source).toMatch(/optInReference: string;/);
    expect(source).toMatch(/optInDate: string;/);
    expect(source).not.toMatch(/optInReference\?:/);
  });

  it('states the activation rule where the next editor will read it', () => {
    expect(source.toLowerCase()).toContain('written opt-in');
  });
});

describe('the network section', () => {
  const source = read('Network.astro');

  it('renders only entries that exist, through the loader', () => {
    // B2: `registry/` is read through its loader and nowhere else.
    expect(source).toContain("from '@/lib/registry-loader'");
    expect(source).not.toMatch(/readFileSync|readdirSync/);
  });

  it("shows every entry's real review state, in words", () => {
    expect(source).toContain('proposedLabel');
    expect(source).toContain('proposedExplainer');
  });

  it('states no count', () => {
    expect(source).not.toMatch(/publishers\.length\s*}/);
    expect(source).not.toContain('publisherCount');
  });

  it('every registry entry it would render is still `proposed`', () => {
    /*
     * The section's copy says every entry is awaiting its team's confirmation.
     * The day one is confirmed, that sentence becomes false — this test fails
     * then, on purpose, so the copy is updated in the same change.
     */
    const entries = allPublishers();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter((entry) => entry.status !== 'proposed')).toEqual([]);
  });

  it('links out to each publisher by host, not by a name we invented', () => {
    for (const entry of allPublishers()) {
      expect(displayHost(entry)).not.toContain('/');
      expect(displayHost(entry).length).toBeGreaterThan(3);
    }
  });
});

describe('the Markdown twin', () => {
  it.each(LANGUAGE_CODES)('carries every section (%s)', (lang) => {
    const sections = homeSections(lang);
    expect(sections).toHaveLength(7);
    for (const section of sections) {
      expect(section.heading.length).toBeGreaterThan(0);
      expect(section.lines.join('\n').trim().length).toBeGreaterThan(20);
    }
  });

  it.each(LANGUAGE_CODES)(
    'lists the same publishers the page does (%s)',
    (lang) => {
      const network = homeSections(lang).find((section) =>
        section.heading.includes(getTranslations(lang).home.network.title)
      );
      expect(network).toBeDefined();
      for (const entry of allPublishers()) {
        expect(network?.lines.join('\n')).toContain(displayHost(entry));
      }
    }
  );
});

describe('hero call-to-action honesty', () => {
  const source = read('Hero.astro');

  it('does not link to a route that does not exist', () => {
    /*
     * The two doors: start now, or understand it first. Both targets are
     * real — `/start` ships with the guided-adoption work, and the secondary
     * is the landing's own how-it-works anchor (whose `id` is asserted
     * below). They carry the language prefix: hardcoding the bare path sent
     * a Spanish reader from `/es/` into the English quickstart once. A
     * target may also be `null`, which renders the label as text rather
     * than a dead link — Rule 0 holds either way.
     */
    expect(source).toContain('CTA_TARGETS');
    const targets = source.match(/const CTA_TARGETS[\s\S]*?};/)?.[0] ?? '';
    for (const [path, marker] of [
      ['/start', 'primary'],
      ['/#how-it-works', 'secondary'],
    ]) {
      const live = new RegExp(
        `${marker}:\\s*\`\\$\\{getUrlPrefix\\(lang\\)\\}${path}\``
      ).test(targets);
      const commented = new RegExp(`${marker}:\\s*null`).test(targets);
      expect(
        live || commented,
        `${marker} CTA must be a language-prefixed real route or explicitly null`
      ).toBe(true);
    }
  });

  it('the secondary CTA lands on an anchor that exists', () => {
    const howItWorks = read('HowItWorks.astro');
    expect(howItWorks).toContain('id="how-it-works"');
  });

  it('keeps the illustration slot layout-safe while the art is absent', () => {
    // The placeholder policy: no grey box, no reserved min-height for a file
    // that does not exist. The slot renders only when the asset does.
    expect(source).toContain('HERO_ART.present && (');
    // The dimensions moved into `Illustration.astro`, which reads them from
    // `src/lib/illustrations.ts` — one declaration per asset, measured against
    // the real file by `illustrations.test.ts`. What matters here is that the
    // hero still goes through that component and still asks for priority: it is
    // the LCP image on the site's most-visited surface.
    expect(source).toContain('<Illustration');
    expect(source).toContain('id="hero-cordage"');
    expect(source).toContain('loading="eager"');
    expect(source).toContain('priority');
  });

  it('renders the hero art on a phone, not only from lg', () => {
    /*
     * The regression this exists for: `hidden lg:flex`, which meant the site's
     * flagship drawing did not exist for most readers. The wrapper must be
     * visible by default and only *change* at `lg`.
     */
    const wrapper = source.match(/class="([^"]*lg:self-stretch[^"]*)"/);
    expect(wrapper, 'the art column wrapper').not.toBeNull();
    expect(wrapper?.[1]).not.toContain('hidden');
  });

  it('keeps the narrow hero a faded band, not a shrunken drawing', () => {
    /*
     * Below `lg` the art is a full-bleed band cropped to the fan of fibres, with
     * everything above it masked into the ground. Three pieces make that work and
     * all three are easy to drop by accident: the crop, the bottom anchor, and
     * the fade — and the fade must come off at `lg`, where the art is the whole
     * drawing hanging from the header.
     */
    expect(source).toContain('object-cover object-bottom');
    expect(source).toContain('lg:object-contain lg:object-top');
    /*
     * `:global(img)` is not cosmetic. Astro scopes `.hero-art img` to
     * `.hero-art[data-astro-cid-…] img[data-astro-cid-…]`, and the `<img>` comes
     * from `Illustration.astro` — it carries that component's id, never this
     * one's, so the rule matched nothing and the fade silently did not exist for
     * two passes at this component. Asserting the selector shape is the only way
     * a source-level test catches that class of failure.
     */
    expect(source).toMatch(
      /\.hero-art :global\(img\)\s*\{[\s\S]*mask-image: linear-gradient/
    );
    expect(source).toMatch(
      /@media \(min-width: 1024px\)[\s\S]*\.hero-art :global\(img\)\s*\{[\s\S]*mask-image: none/
    );
  });

  it('sizes the desktop art from the fold, not from a percentage height', () => {
    /*
     * `lg:h-full` resolved against an indefinite grid-row height and fell back to
     * `auto`, so the drawing rendered at its intrinsic width on every screen and a
     * 27-inch display got what a 13-inch laptop did. The height has to come from
     * the same `dvh` expression the section's `min-h` uses, and from `xl` the
     * column has to be allowed past the container's own 80rem so a wide screen can
     * fill the fold. `illustrations:check` measures the outcome; this catches the
     * mechanism going back.
     */
    const artClasses = source.match(/class="([^"]*object-cover[^"]*)"/)?.[1];
    expect(artClasses, 'the illustration class list').toBeTypeOf('string');
    expect(artClasses).toContain(
      'lg:h-[calc(100dvh-var(--cabuya-chrome-height))]'
    );
    /* Only in the class list — the comment above it explains the old `h-full`. */
    expect(artClasses).not.toMatch(/\blg:h-full\b/);
    expect(artClasses).toContain('lg:max-w-none');
    expect(source).toMatch(
      /xl:-mr-\[max\(0px,calc\(\(100vw-80rem\)\/2-1\.5rem\)\)\]/
    );
  });
});
