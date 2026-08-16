#!/usr/bin/env node

/**
 * Corag illustration pipeline
 *
 * Turns the commissioned illustrations in `tmp/ilustrations/` into shipped,
 * theme-safe responsive WebP sets.
 *
 * Three things have to happen, in this order:
 *
 * 1. **Key out the painted background.** The generator returns a flat
 *    off-white ground (~#FBF8F5). Left in, it would show as a bright rectangle
 *    in dark mode. The key is a flood fill from the image border rather than a
 *    global colour threshold: the art itself contains near-white pinks (the
 *    house interiors, the clipboard), and a global threshold would punch holes
 *    through them. Only background-coloured pixels *connected to the edge* are
 *    removed.
 *
 * 2. **Feather the edge.** Pixels bordering the keyed region get partial alpha
 *    proportional to how close they are to the background colour, so the
 *    anti-aliased outlines do not turn into a hard, jagged cut.
 *
 * 3. **Trim and resize.** Trimming the now-transparent padding is what makes
 *    the art fill its column instead of floating in dead space — these
 *    illustrations arrive with 25–35% empty margin.
 *
 * Usage:
 *   node scripts/prepare-illustrations.mjs
 *   node scripts/prepare-illustrations.mjs --debug   # also write a checkerboard proof
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const SRC_DIR = resolve(ROOT, 'tmp/ilustrations');
const OUT_DIR = resolve(ROOT, 'public/images/pages/illustrations');
const PROVENANCE = resolve(OUT_DIR, 'CREDITS.json');
const DEBUG = process.argv.includes('--debug');

const WIDTHS = [480, 768, 1024];
const WEBP_QUALITY = 82;

/** Distance below which a pixel is certainly background. */
const SOLID_BG = 14;
/** Distance above which a pixel is certainly art. Between the two: feathered. */
const SOLID_ART = 54;

const ILLUSTRATIONS = [
  {
    key: 'illustration-partners',
    source: 'ilustracion-aliados.png',
    page: '/partners',
  },
  {
    key: 'illustration-leaders',
    source: 'ilustracion-lideres.png',
    page: '/leaders',
  },
  {
    key: 'illustration-about',
    source: 'ilustracion-sobre-corag.png',
    page: '/about',
  },
  {
    key: 'illustration-movement',
    source: 'ilustracion-movimiento.png',
    page: '/movement',
  },
];

const distance = (data, i, bg) =>
  Math.abs(data[i] - bg[0]) +
  Math.abs(data[i + 1] - bg[1]) +
  Math.abs(data[i + 2] - bg[2]);

/**
 * Remove the background that touches the border, feathering the frontier.
 * Returns RGBA raw pixels.
 */
function keyBackground(data, width, height, channels, bg) {
  const total = width * height;
  const isBackground = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const consider = (index) => {
    if (isBackground[index]) return;
    if (distance(data, index * channels, bg) > SOLID_BG) return;
    isBackground[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x++) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    consider(y * width);
    consider(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) consider(index - 1);
    if (x < width - 1) consider(index + 1);
    if (y > 0) consider(index - width);
    if (y < height - 1) consider(index + width);
  }

  const out = Buffer.alloc(total * 4);
  for (let index = 0; index < total; index++) {
    const src = index * channels;
    const dst = index * 4;
    out[dst] = data[src];
    out[dst + 1] = data[src + 1];
    out[dst + 2] = data[src + 2];

    if (isBackground[index]) {
      out[dst + 3] = 0;
      continue;
    }

    // Feather only where the pixel actually borders the keyed region;
    // interior near-white art must stay fully opaque.
    const x = index % width;
    const y = (index - x) / width;
    const touchesBackground =
      (x > 0 && isBackground[index - 1]) ||
      (x < width - 1 && isBackground[index + 1]) ||
      (y > 0 && isBackground[index - width]) ||
      (y < height - 1 && isBackground[index + width]);

    if (!touchesBackground) {
      out[dst + 3] = 255;
      continue;
    }

    const d = distance(data, src, bg);
    const ratio = (d - SOLID_BG) / (SOLID_ART - SOLID_BG);
    out[dst + 3] = Math.max(0, Math.min(255, Math.round(ratio * 255)));
  }

  return out;
}

/** True when every pixel on the outer frame is already fully transparent. */
function isBorderTransparent(data, info) {
  const { width, height, channels } = info;
  const clear = (x, y) => data[(y * width + x) * channels + 3] <= 10;
  for (let x = 0; x < width; x++) {
    if (!clear(x, 0) || !clear(x, height - 1)) return false;
  }
  for (let y = 0; y < height; y++) {
    if (!clear(0, y) || !clear(width - 1, y)) return false;
  }
  return true;
}

/** Widen raw pixels to RGBA without touching them. */
function toRgba(data, info) {
  if (info.channels === 4) return Buffer.from(data);
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    out[o] = data[i];
    out[o + 1] = data[i + 1];
    out[o + 2] = data[i + 2];
    out[o + 3] = 255;
  }
  return out;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const assets = [];

  for (const spec of ILLUSTRATIONS) {
    const inputPath = resolve(SRC_DIR, spec.source);
    const { data, info } = await sharp(inputPath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    /*
     * A source that already carries transparency must not be keyed again.
     * Keying reads the corner pixel as the background colour, and on an
     * already-cut-out PNG that corner is (0, 0, 0, 0) — so the flood fill
     * would run against black and eat into the deep wine figures, which are
     * the darkest thing in the palette. Detect it and pass the art through.
     */
    const borderTransparent =
      info.channels === 4 && isBorderTransparent(data, info);

    const rgba = borderTransparent
      ? toRgba(data, info)
      : keyBackground(data, info.width, info.height, info.channels, [
          // The corner is background by definition of these compositions.
          data[0],
          data[1],
          data[2],
        ]);
    const bg = borderTransparent ? null : [data[0], data[1], data[2]];

    // Trim the transparent margin so the art fills its column.
    const trimmed = await sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim({ threshold: 1 })
      .toBuffer({ resolveWithObject: true });

    const files = [];
    for (const width of WIDTHS) {
      if (width > trimmed.info.width) continue;
      const name = `${spec.key}-${width}.webp`;
      const out = resolve(OUT_DIR, name);
      await sharp(trimmed.data, {
        raw: {
          width: trimmed.info.width,
          height: trimmed.info.height,
          channels: 4,
        },
      })
        .resize({ width, kernel: 'lanczos3' })
        .webp({ quality: WEBP_QUALITY, alphaQuality: 100 })
        .toFile(out);
      const bytes = (await readFile(out)).length;
      files.push({ file: name, width, bytes });
      console.log(`  wrote ${name.padEnd(34)} ${String(bytes).padStart(7)} B`);
    }

    if (DEBUG) {
      // Proof sheet: the keyed art over a dark ground, which is where a
      // leftover background would be obvious.
      await sharp(trimmed.data, {
        raw: {
          width: trimmed.info.width,
          height: trimmed.info.height,
          channels: 4,
        },
      })
        .flatten({ background: '#231518' })
        .png()
        .toFile(resolve(ROOT, `tmp/ilustrations/_proof-${spec.key}.png`));
    }

    assets.push({
      key: spec.key,
      page: spec.page,
      source: `tmp/ilustrations/${spec.source}`,
      original: { width: info.width, height: info.height },
      trimmed: { width: trimmed.info.width, height: trimmed.info.height },
      backgroundKeyed: bg
        ? `rgb(${bg.join(', ')})`
        : 'source already transparent',
      files,
    });

    console.log(
      `  ${spec.key}: ${info.width}x${info.height} -> ${trimmed.info.width}x${trimmed.info.height} (trimmed)\n`
    );
  }

  await writeFile(
    PROVENANCE,
    `${JSON.stringify(
      {
        generatedBy: 'scripts/prepare-illustrations.mjs',
        note: 'Illustrations commissioned and owned by the Corag team, generated from the briefs in tmp/prompt-ilustracion-*.md. Backgrounds keyed out so they sit correctly on both the light and the dark theme. No text, no real people, no figures.',
        assets,
      },
      null,
      2
    )}\n`
  );

  const total = assets.flatMap((a) => a.files).reduce((n, f) => n + f.bytes, 0);
  console.log(
    `${assets.length} illustrations, ${(total / 1024).toFixed(1)} KB total`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
