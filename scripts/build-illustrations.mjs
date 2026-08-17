#!/usr/bin/env node
/**
 * Turn the illustration masters into the site's WebP assets.
 *
 *   node scripts/build-illustrations.mjs --masters <dir> [--only <id>] [--dry-run]
 *
 * The masters are the founder's generated PNGs (1000–2500 px, alpha), which do
 * not live in this repository: `docs/visuals/README.md` says the pack is the
 * brief and the artwork is generated from it. Point `--masters` at the
 * directory holding them — the file names are declared per entry below, so the
 * only thing this script needs from the outside is where they are.
 *
 * ## What it does, and why it is not just a resize
 *
 * Every entry in the pack demands a clear margin of at least 8% of the canvas
 * with no ink in it, and generators keep missing it — `HP-02` ran both cords
 * off the canvas, `DV-01` left 1% at the top, `DV-02` 1.4% on the left. A
 * near-zero margin reads as a cut edge the moment the asset is scaled, and the
 * only honest repairs are a regeneration or a re-frame.
 *
 * So this re-frames: **trim to the drawing's own bounding box, then pad with
 * transparency until the ink occupies at most 84% of each axis.** Nothing is
 * cropped away — the composition is untouched and the aspect ratio comes out of
 * the drawing rather than being imposed on it. Two consequences worth stating:
 *
 *   1. Every shipped asset satisfies the edges rule, including the three that
 *      were accepted with an edges defect.
 *   2. The drawing is *bigger* inside its box than a naive resize of a master
 *      with 20% of dead space, which is what makes these read on a phone.
 *
 * `HP-01` is the documented exception: its rope is meant to bleed off the top
 * edge so it reads as descending out of the site header, so it is padded on
 * three sides and its `mobile` variant — which is *not* under the header — is
 * padded on all four.
 *
 * ## Weight
 *
 * Alpha plus dense hatching is the most expensive thing this house style can
 * produce, and `docs/visuals/INTEGRATION_GUIDE.md` sets the budgets (80 KB for
 * a section illustration, 15 KB for a mark). Quality is therefore searched, not
 * chosen: the encoder walks down a ladder until the file fits its budget, and
 * the result is printed so the number in `src/lib/illustrations.ts` can be
 * checked against reality — `tests/unit/lib/illustrations.test.ts` does exactly
 * that on every run.
 */

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_ROOT = join(ROOT, 'public/images/visuals');

/** Alpha above this counts as ink. Below it is the encoder's edge feathering. */
const INK = 12;
/** The edges rule: ink may occupy at most this share of each axis. */
const MAX_INK_SHARE = 0.84;

/**
 * Every asset the site ships, and what it is made from.
 *
 * `width` is the 1x width in CSS pixels — chosen from the widest box the slot
 * ever renders, not from the entry's nominal "displayed" figure, which was
 * written before the layouts existed. `budget` is the 1x ceiling in KB; the 2x
 * file gets 2.4× that, the ratio the existing home-page pair lands at.
 */
const ASSETS = [
  {
    id: 'hero-cordage',
    master: '01-hp-01-hero-cordage.png',
    area: 'home',
    slug: 'hero-cordage',
    /*
     * 600, not 520: from `lg` the hero is height-driven and fills the fold, so
     * on a tall 27-inch screen the drawing renders around 790 CSS px wide. A 520
     * `1x` meant the 1040 `2x` was the only usable candidate there and it was
     * already below 1:1 on a retina laptop — visible as softness in exactly the
     * fine filaments this drawing is made of.
     */
    width: 600,
    budget: 128,
    /** The rope descends out of the header: no margin at the top. */
    bleed: 'top',
  },
  {
    id: 'hero-cordage-mobile',
    master: '01-hp-01-hero-cordage.png',
    area: 'home',
    slug: 'hero-cordage-mobile',
    width: 480,
    budget: 96,
    /*
     * Flush at the bottom, because below `lg` the hero shows the fan and fades
     * the rest.
     *
     * The narrow layout crops in CSS — a full-width band with
     * `object-fit: cover` anchored to the bottom, masked into the ground above
     * it — so what this file needs is fibre tips at its bottom edge rather than
     * a margin under them. The 8% bottom padding the desktop framing carries
     * would show up as a gap between the frayed ends and the edge of the band.
     *
     * Served through one `<picture>` with a `media` source, so exactly one file
     * is fetched on the site's LCP surface. The two framings are free to
     * disagree on aspect ratio: the narrow one's box is set by CSS (full width,
     * fixed height), so the declared `width`/`height` never describes it.
     */
    bleed: 'bottom',
  },
  {
    id: 'join-open-knot',
    master: '01-hp-02-join-open-knot.png',
    area: 'home',
    slug: 'join-open-knot',
    width: 520,
    budget: 80,
  },
  {
    id: 'portal-loom',
    master: '02-dv-01-portal-loom.png',
    area: 'developers',
    slug: 'portal-loom',
    width: 420,
    budget: 80,
  },
  {
    id: 'quickstart-first-thread',
    master: '02-dv-02-quickstart-first-thread.png',
    area: 'developers',
    slug: 'quickstart-first-thread',
    width: 420,
    budget: 60,
  },
  {
    id: 'validator-gauge',
    master: '02-dv-03-validator-gauge.png',
    area: 'developers',
    slug: 'validator-gauge',
    width: 260,
    budget: 60,
  },
  {
    id: 'skill-handover',
    master: '02-dv-04-skill-handover.png',
    area: 'developers',
    slug: 'skill-handover',
    width: 420,
    budget: 80,
  },
  {
    id: 'registry-net',
    master: '03-rg-01-registry-net.png',
    area: 'registry',
    slug: 'registry-net',
    width: 460,
    budget: 80,
  },
  {
    id: 'governance-hands',
    master: '03-rg-02-governance-hands.png',
    area: 'governance',
    slug: 'governance-hands',
    width: 460,
    budget: 80,
  },
  {
    id: 'join-splice',
    master: '03-rg-03-join-splice.png',
    area: 'governance',
    slug: 'join-splice',
    width: 460,
    budget: 80,
  },
  {
    id: '404-retied',
    master: '05-mk-01-404-retied.png',
    area: 'marks',
    slug: '404-retied',
    width: 320,
    budget: 24,
  },
  {
    id: 'empty-coil',
    master: '05-mk-02-empty-coil.png',
    area: 'marks',
    slug: 'empty-coil',
    width: 128,
    budget: 15,
  },
  {
    id: 'ornament-braid',
    master: '05-mk-03-ornament-braid.png',
    area: 'marks',
    slug: 'ornament-braid',
    width: 240,
    budget: 15,
  },
];

const args = process.argv.slice(2);
const mastersDir = args.find((a) => a.startsWith('--masters='))?.split('=')[1];
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];
const dryRun = args.includes('--dry-run');

if (!mastersDir) {
  console.error(
    '\n❌ --masters=<dir> is required: the generated PNGs are not in this repo.\n'
  );
  process.exit(1);
}

/** The drawing's bounding box, ignoring the encoder's feathered edge. */
async function inkBox(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const alpha = (x, y) => data[(y * width + x) * channels + 3];

  let left = null;
  let right = null;
  let top = null;
  let bottom = null;
  for (let x = 0; x < width && left === null; x++)
    for (let y = 0; y < height; y++)
      if (alpha(x, y) > INK) {
        left = x;
        break;
      }
  for (let x = width - 1; x >= 0 && right === null; x--)
    for (let y = 0; y < height; y++)
      if (alpha(x, y) > INK) {
        right = x;
        break;
      }
  for (let y = 0; y < height && top === null; y++)
    for (let x = 0; x < width; x++)
      if (alpha(x, y) > INK) {
        top = y;
        break;
      }
  for (let y = height - 1; y >= 0 && bottom === null; y--)
    for (let x = 0; x < width; x++)
      if (alpha(x, y) > INK) {
        bottom = y;
        break;
      }

  if (left === null) throw new Error(`${file} has no ink at all`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/**
 * The re-framed master: ink trimmed to its box, then padded back out to the
 * 8% margin.
 *
 * `bleed` names the edge that stays flush, and only the hero uses it: `'top'`
 * for the framing that sits under the site header, where the rope is meant to
 * continue out of the chrome, and `'bottom'` for the narrow framing, which is
 * cropped from the bottom in CSS and must not carry a margin under the fibres.
 */
async function reframe(file, bleed) {
  const box = await inkBox(file);
  const trimmed = await sharp(file).extract(box).toBuffer();

  const padX = Math.round((box.width / MAX_INK_SHARE - box.width) / 2);
  const padY = Math.round((box.height / MAX_INK_SHARE - box.height) / 2);

  return sharp(trimmed)
    .extend({
      top: bleed === 'top' ? 0 : padY,
      bottom: bleed === 'bottom' ? 0 : padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
}

/** Encode at the highest quality that fits the budget. */
async function encode(buffer, width, height, budgetKb) {
  const LADDER = [
    [86, 90],
    [80, 80],
    [74, 70],
    [68, 62],
    [62, 55],
    [56, 50],
    [50, 45],
  ];
  let last = null;
  for (const [quality, alphaQuality] of LADDER) {
    const out = await sharp(buffer)
      .resize(width, height, { fit: 'fill' })
      .webp({ quality, alphaQuality, effort: 6, smartSubsample: true })
      .toBuffer();
    last = { out, quality, alphaQuality };
    if (out.length / 1024 <= budgetKb) break;
  }
  return last;
}

const results = [];
/** Delivered aspect ratio per id, so `matchRatio` can point at one. */
const ratios = new Map();

for (const asset of ASSETS) {
  if (only && asset.id !== only) continue;
  const master = join(mastersDir, asset.master);
  if (!existsSync(master)) {
    console.error(`❌ ${asset.id}: master not found at ${master}`);
    process.exitCode = 1;
    continue;
  }

  let framed = await reframe(master, asset.bleed);
  let meta = await sharp(framed).metadata();

  if (asset.matchRatio) {
    const target = ratios.get(asset.matchRatio);
    if (!target) {
      throw new Error(
        `${asset.id}: matchRatio "${asset.matchRatio}" has not been built yet — order matters`
      );
    }
    const current = meta.width / meta.height;
    const extra =
      current < target
        ? { axis: 'x', px: Math.round(meta.height * target - meta.width) }
        : { axis: 'y', px: Math.round(meta.width / target - meta.height) };
    const half = Math.round(extra.px / 2);
    framed = await sharp(framed)
      .extend({
        top: extra.axis === 'y' ? extra.px - half : 0,
        bottom: extra.axis === 'y' ? half : 0,
        left: extra.axis === 'x' ? extra.px - half : 0,
        right: extra.axis === 'x' ? half : 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    meta = await sharp(framed).metadata();
  }

  const ratio = meta.width / meta.height;
  ratios.set(asset.id, ratio);

  const dir = join(OUT_ROOT, asset.area);
  if (!dryRun) mkdirSync(dir, { recursive: true });

  const row = { id: asset.id, ratio };
  for (const scale of [1, 2]) {
    const width = asset.width * scale;
    const height = Math.round(width / ratio);
    const budget = asset.budget * (scale === 1 ? 1 : 2.4);
    const { out, quality, alphaQuality } = await encode(
      framed,
      width,
      height,
      budget
    );
    const name = scale === 1 ? `${asset.slug}.webp` : `${asset.slug}-2x.webp`;
    const path = join(dir, name);
    if (!dryRun) await sharp(out).toFile(path);
    const kb = (dryRun ? out.length : statSync(path).size) / 1024;
    row[scale === 1 ? 'one' : 'two'] = {
      name,
      width,
      height,
      kb,
      quality,
      alphaQuality,
      overBudget: kb > budget,
    };
  }
  results.push(row);
}

console.log(`\n🎨 build-illustrations${dryRun ? ' (dry run)' : ''}\n`);
for (const row of results) {
  const { one, two } = row;
  const flag = one.overBudget || two.overBudget ? '⚠️ ' : '✓ ';
  console.log(
    `  ${flag}${row.id.padEnd(24)} ${one.width}×${one.height} ${one.kb.toFixed(0).padStart(3)} KB  ` +
      `· 2x ${two.width}×${two.height} ${two.kb.toFixed(0).padStart(3)} KB  ` +
      `· q${one.quality}/a${one.alphaQuality}  ratio ${row.ratio.toFixed(4)}`
  );
}
const over = results.filter((r) => r.one.overBudget || r.two.overBudget);
console.log(
  over.length
    ? `\n⚠️  ${over.length} asset(s) could not reach their budget at the lowest quality on the ladder.\n`
    : '\n✅ every asset inside its weight budget.\n'
);
