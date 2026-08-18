/**
 * The illustration registry, measured against the files it describes.
 *
 * `src/lib/illustrations.ts` declares an intrinsic `width` and `height` for
 * every asset, and the pages reserve exactly that box before the image loads.
 * A regenerated drawing that came back a different shape would therefore turn
 * into a layout shift — silently, because the page still looks fine once the
 * image arrives. So every number in that module is checked against the actual
 * bytes here:
 *
 *   - the 1x file exists, and its real dimensions are the declared ones;
 *   - the 2x file exists, at exactly twice the size, same aspect ratio;
 *   - both carry an alpha channel, since one transparent file serves both
 *     themes and a flattened ground would leave a rectangle in one of them;
 *   - no `-dark` variant exists anywhere — the matched-pair strategy is retired,
 *     and a stray dark file is an invitation to write the `<picture>` the
 *     integration guide forbids;
 *   - the weights are inside the budgets in `docs/visuals/INTEGRATION_GUIDE.md`;
 *   - the `srcset` names the files it claims to.
 *
 * `scripts/audit-illustrations.mjs` covers the other half — whether each of
 * them actually reaches the page at every viewport.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  ILLUSTRATION_IDS,
  ILLUSTRATIONS,
  type IllustrationId,
} from '@/lib/illustrations';

const PUBLIC = join(process.cwd(), 'public');
const VISUALS = join(PUBLIC, 'images/visuals');

/**
 * 1x ceilings in KB. Marks are punctuation and get a tenth of the budget.
 *
 * The hero's is the one raised ceiling and it buys sharpness where the drawing
 * is largest: from `lg` the art is height-driven and fills the fold, so a 27-inch
 * display paints it around 790 px wide and a retina laptop asks for ~1400 device
 * pixels. It is also desktop-only weight — a phone fetches the narrow framing
 * (`hero-cordage-mobile`, well inside 96 KB) through the `<picture>`'s `media`
 * source, so the landing's mobile LCP does not pay for it.
 */
const BUDGET_KB: Record<string, number> = {
  'hero-cordage': 128,
  'join-open-knot': 80,
  'portal-loom': 80,
  'quickstart-first-thread': 60,
  'validator-gauge': 60,
  'skill-handover': 80,
  'registry-net': 80,
  'governance-hands': 80,
  'join-splice': 80,
  'about-fique-plant': 96,
  'about-leaf-to-fibre': 96,
  'about-splice-no-centre': 80,
  'about-the-bight': 96,
  '404-retied': 24,
  'empty-coil': 15,
  'ornament-braid': 15,
};

const fileFor = (src: string): string => join(PUBLIC, src.replace(/^\//, ''));
const kb = (path: string): number => statSync(path).size / 1024;

describe('the illustration registry describes the files that exist', () => {
  it.each(ILLUSTRATION_IDS)('%s — 1x matches its declaration', async (id) => {
    const art = ILLUSTRATIONS[id];
    const path = fileFor(art.src);
    expect(existsSync(path), `${art.src} is missing`).toBe(true);

    const meta = await sharp(path).metadata();
    expect(meta.width, `${id} width`).toBe(art.width);
    expect(meta.height, `${id} height`).toBe(art.height);
    expect(meta.format).toBe('webp');
    expect(meta.hasAlpha, `${id} must be transparent`).toBe(true);
  });

  it.each(ILLUSTRATION_IDS)('%s — the 2x file is exactly 2x', async (id) => {
    const art = ILLUSTRATIONS[id];
    const two = fileFor(art.src.replace(/\.webp$/, '-2x.webp'));
    expect(existsSync(two), `${two} is missing`).toBe(true);

    const meta = await sharp(two).metadata();
    expect(meta.width).toBe(art.width * 2);
    /* Rounded, because an odd 1x height doubles to an odd number. */
    expect(Math.abs((meta.height ?? 0) - art.height * 2)).toBeLessThanOrEqual(
      1
    );
    expect(meta.hasAlpha).toBe(true);
  });

  it.each(ILLUSTRATION_IDS)('%s — the srcset names both files', (id) => {
    const art = ILLUSTRATIONS[id];
    expect(art.srcset).toContain(`${art.src} ${art.width}w`);
    expect(art.srcset).toContain(
      `${art.src.replace(/\.webp$/, '-2x.webp')} ${art.width * 2}w`
    );
  });

  it.each(ILLUSTRATION_IDS)('%s — is inside its weight budget', (id) => {
    const art = ILLUSTRATIONS[id];
    const budget = BUDGET_KB[id];
    expect(budget, `no budget declared for ${id}`).toBeDefined();
    expect(kb(fileFor(art.src))).toBeLessThanOrEqual(budget);
    /* The 2x file is allowed 2.4× the 1x budget, the ratio the pack lands at. */
    expect(
      kb(fileFor(art.src.replace(/\.webp$/, '-2x.webp')))
    ).toBeLessThanOrEqual(budget * 2.4);
  });

  /**
   * The hero is the only entry with a width variant, and the two framings must
   * agree on aspect ratio: one `<picture>`, one `width`/`height` pair, so a
   * mismatch would be a layout shift on whichever viewport got the other file.
   */
  it('the hero variant is the same drawing, anchored to the other edge', async () => {
    const art = ILLUSTRATIONS['hero-cordage'];
    const variantSrc = art.mobile?.src;
    expect(variantSrc, 'the hero needs its narrow-viewport framing').toBeTypeOf(
      'string'
    );
    const mobile = await sharp(fileFor(variantSrc ?? '')).metadata();

    /* Same aspect ratio: both framings are the ink box plus one margin, so the
       declared box stays honest whichever the `<picture>` picks. */
    const desktop = art.width / art.height;
    const variant = (mobile.width ?? 0) / (mobile.height ?? 1);
    expect(Math.abs(variant - desktop) / desktop).toBeLessThan(0.02);

    /*
     * And the anchoring is the point: the desktop framing bleeds off the top so
     * the rope descends out of the site header, the narrow one is flush at the
     * bottom so the frayed ends meet the edge of the band the phone crops it to.
     * Measured on the alpha channel — a margin under the fibres is exactly the
     * gap this framing exists to remove.
     */
    const inkRows = async (src: string) => {
      const { data, info } = await sharp(fileFor(src))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const alphaAt = (x: number, y: number) =>
        data[(y * info.width + x) * info.channels + 3];
      const rowHasInk = (y: number) => {
        for (let x = 0; x < info.width; x++)
          if (alphaAt(x, y) > 12) return true;
        return false;
      };
      return { top: rowHasInk(0), bottom: rowHasInk(info.height - 1) };
    };

    expect(await inkRows(art.src)).toEqual({ top: true, bottom: false });
    expect(await inkRows(variantSrc ?? '')).toEqual({
      top: false,
      bottom: true,
    });
  });

  it('no entry carries a mobile variant it did not build', async () => {
    for (const id of ILLUSTRATION_IDS) {
      const art = ILLUSTRATIONS[id as IllustrationId];
      if (!art.mobile) continue;
      expect(existsSync(fileFor(art.mobile.src)), art.mobile.src).toBe(true);
      expect(
        existsSync(fileFor(art.mobile.src.replace(/\.webp$/, '-2x.webp')))
      ).toBe(true);
    }
  });
});

describe('the retired matched-pair strategy stays retired', () => {
  it('ships no -dark illustration', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? walk(join(dir, entry.name))
          : [join(dir, entry.name)]
      );
    const dark = walk(VISUALS).filter((f) => /-dark\.webp$/.test(f));
    expect(
      dark,
      'every asset is transparent; there is no dark variant'
    ).toEqual([]);
  });

  it('every file under visuals/ belongs to a registered asset', () => {
    const registered = new Set<string>();
    for (const id of ILLUSTRATION_IDS) {
      const art = ILLUSTRATIONS[id as IllustrationId];
      for (const src of [art.src, art.mobile?.src].filter(
        Boolean
      ) as string[]) {
        registered.add(fileFor(src));
        registered.add(fileFor(src.replace(/\.webp$/, '-2x.webp')));
      }
    }
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? walk(join(dir, entry.name))
          : [join(dir, entry.name)]
      );
    const orphans = walk(VISUALS).filter((f) => !registered.has(f));
    expect(
      orphans,
      'an unregistered asset is dead weight in the deploy'
    ).toEqual([]);
  });
});

describe('the share cards', () => {
  it.each([
    ['/images/og-default.jpg', 'es'],
    ['/images/og-default-en.jpg', 'en'],
  ])('%s is exactly 1200×630 JPEG under 300 KB', async (src) => {
    const path = fileFor(src);
    expect(existsSync(path), `${src} is missing`).toBe(true);
    const meta = await sharp(path).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
    expect(meta.format).toBe('jpeg');
    expect(kb(path)).toBeLessThanOrEqual(300);
  });
});
