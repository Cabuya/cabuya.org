/**
 * Every illustration the site ships, declared once.
 *
 * The artwork comes from the prompt pack in `docs/visuals/`, is converted by
 * `scripts/build-illustrations.mjs`, and is placed by
 * `src/components/editorial/Illustration.astro`. This module is the third leg:
 * the facts about each file — where it is, how big it actually is, what the
 * browser should assume it renders at.
 *
 * ## Why a registry instead of the numbers at each call site
 *
 * Thirteen assets across nine surfaces is thirteen chances to declare a
 * `width`/`height` that no longer matches the file after a regeneration, and a
 * wrong pair is a layout shift that nothing in CI would have caught. Here it is
 * one place, and `tests/unit/lib/illustrations.test.ts` measures every entry
 * against the file on disk: dimensions, aspect ratio, the 2x pair, alpha, and
 * the weight budget. A regenerated asset that changed shape fails the test
 * instead of the page.
 *
 * ## The two rules this module and its component exist to enforce
 *
 * 1. **One transparent file serves both themes.** No `-dark` asset, and never a
 *    `<picture>` with a `prefers-color-scheme` source — the ink carries its own
 *    forest and ivory values, and a `<source>` aimed at a file that does not
 *    exist breaks the image in dark mode. (A `media` source on *width* is a
 *    different thing and the hero uses one; see `mobile` below.)
 * 2. **Every one of them is decorative.** `alt=""`, always. These drawings
 *    carry mood, not information: a screen-reader user who is read a paragraph
 *    about a loom has been given noise, not access. Anything that must be
 *    understood is a diagram component, not an illustration.
 */

export interface Illustration {
  /** Site-root-relative path to the 1x file. */
  src: string;
  /** The `srcset`, 1x and 2x. Both files exist for every entry. */
  srcset: string;
  /** Intrinsic size of `src` — and of the box the page reserves for it. */
  width: number;
  height: number;
  /** What the browser should assume the rendered width is. */
  sizes: string;
  /**
   * A narrow-viewport framing of the same drawing, served through a `media`
   * source so only one file is ever fetched.
   *
   * Only the hero has one. Under the site header its rope bleeds off the *top*
   * edge and reads as descending out of the chrome; below the copy on a phone
   * the hero shows the fan of fibres as a full-width band and fades the rest
   * into the ground, so that framing is flush at the *bottom* instead — a margin
   * under the frayed ends would show as a gap inside the band.
   */
  mobile?: { src: string; srcset: string; media: string };
}

const VISUALS = '/images/visuals';

/** Both files for one slug, as a `srcset`. */
const pair = (path: string, width: number): string =>
  `${path}.webp ${width}w, ${path}-2x.webp ${width * 2}w`;

export const ILLUSTRATIONS = {
  /** HP-01 — the landing hero. The one asset that is an LCP candidate. */
  'hero-cordage': {
    src: `${VISUALS}/home/hero-cordage.webp`,
    srcset: pair(`${VISUALS}/home/hero-cordage`, 600),
    width: 600,
    height: 679,
    /*
     * Below `lg` the art is a full-bleed band, so it is the viewport wide. From
     * `lg` it is height-driven and fills the fold, which on a wide screen is
     * around half the viewport once the column bleeds into the container's slack.
     */
    sizes: '(min-width: 1024px) 55vw, 100vw',
    mobile: {
      src: `${VISUALS}/home/hero-cordage-mobile.webp`,
      srcset: pair(`${VISUALS}/home/hero-cordage-mobile`, 480),
      media: '(max-width: 1023px)',
    },
  },

  /** HP-02 — the closing panel. Lands on the fill ground, not a page ground. */
  'join-open-knot': {
    src: `${VISUALS}/home/join-open-knot.webp`,
    srcset: pair(`${VISUALS}/home/join-open-knot`, 520),
    width: 520,
    height: 342,
    sizes: '(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 88vw',
  },

  /** DV-01 — the portal home, beside the intro. */
  'portal-loom': {
    src: `${VISUALS}/developers/portal-loom.webp`,
    srcset: pair(`${VISUALS}/developers/portal-loom`, 420),
    width: 420,
    height: 303,
    sizes: '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 84vw',
  },

  /** DV-02 — the quickstart, above the five steps. */
  'quickstart-first-thread': {
    src: `${VISUALS}/developers/quickstart-first-thread.webp`,
    srcset: pair(`${VISUALS}/developers/quickstart-first-thread`, 420),
    width: 420,
    height: 252,
    sizes: '(min-width: 640px) 420px, 84vw',
  },

  /** DV-03 — the validator, beside the form. */
  'validator-gauge': {
    src: `${VISUALS}/developers/validator-gauge.webp`,
    srcset: pair(`${VISUALS}/developers/validator-gauge`, 260),
    width: 260,
    height: 245,
    sizes: '(min-width: 1024px) 220px, (min-width: 640px) 30vw, 56vw',
  },

  /** DV-04 — the agent skill page. */
  'skill-handover': {
    src: `${VISUALS}/developers/skill-handover.webp`,
    srcset: pair(`${VISUALS}/developers/skill-handover`, 420),
    width: 420,
    height: 193,
    sizes: '(min-width: 640px) 420px, 84vw',
  },

  /** RG-01 — the registry header. Never on a publisher page. */
  'registry-net': {
    src: `${VISUALS}/registry/registry-net.webp`,
    srcset: pair(`${VISUALS}/registry/registry-net`, 460),
    width: 460,
    height: 321,
    sizes: '(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 78vw',
  },

  /** RG-02 — the governance header. */
  'governance-hands': {
    src: `${VISUALS}/governance/governance-hands.webp`,
    srcset: pair(`${VISUALS}/governance/governance-hands`, 460),
    width: 460,
    height: 291,
    sizes: '(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 78vw',
  },

  /** RG-03 — the join header. */
  'join-splice': {
    src: `${VISUALS}/governance/join-splice.webp`,
    srcset: pair(`${VISUALS}/governance/join-splice`, 460),
    width: 460,
    height: 262,
    sizes: '(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 78vw',
  },

  /** MK-01 — the 404, in place of the isologo. */
  '404-retied': {
    src: `${VISUALS}/marks/404-retied.webp`,
    srcset: pair(`${VISUALS}/marks/404-retied`, 320),
    width: 320,
    height: 67,
    sizes: '320px',
  },

  /** MK-02 — the empty state's mark. */
  'empty-coil': {
    src: `${VISUALS}/marks/empty-coil.webp`,
    srcset: pair(`${VISUALS}/marks/empty-coil`, 128),
    width: 128,
    height: 84,
    sizes: '128px',
  },

  /** MK-03 — the section ornament. Used sparingly, per its entry. */
  'ornament-braid': {
    src: `${VISUALS}/marks/ornament-braid.webp`,
    srcset: pair(`${VISUALS}/marks/ornament-braid`, 240),
    width: 240,
    height: 16,
    sizes: '240px',
  },
} satisfies Record<string, Illustration>;

export type IllustrationId = keyof typeof ILLUSTRATIONS;

/** Every id, for the tests and the audit. */
export const ILLUSTRATION_IDS = Object.keys(ILLUSTRATIONS) as IllustrationId[];

export const illustration = (id: IllustrationId): Illustration =>
  ILLUSTRATIONS[id];
