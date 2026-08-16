#!/usr/bin/env node

/**
 * Corag brand asset builder
 *
 * Derives every shipped brand asset in `public/` from the official masters in
 * `assets/brand/`, so the pipeline is reproducible and auditable rather than a
 * pile of hand-edited binaries.
 *
 * Source of truth: `Manual de Identidad Visual` (assets/brand/), summarised in
 * the plan's OFFICIAL_BRAND_REVIEW.md. Official palette and typography:
 *
 *   #78020E  wine     (primary)      C31 M100 Y93 K45
 *   #BC727C  wine 50% (secondary)    C12 M50  Y24 K1
 *   #FFC7D5  rosa                    C0  M31  Y6  K0
 *   #FFE2E9  rosa claro
 *   #F0E3E4  blanco roto (observed on the logo grounds, not on the palette page)
 *
 *   Outfit  — logo / display
 *   Poppins — body
 *
 * The masters are raster only (no vector was supplied), so everything here is
 * derived from the highest-resolution transparent PNGs available. See the
 * "Gaps" section of OFFICIAL_BRAND_REVIEW.md.
 *
 * Usage:
 *   node scripts/build-brand-assets.mjs
 *   node scripts/build-brand-assets.mjs --dry-run
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'assets/brand');
const PUB = resolve(ROOT, 'public');
const DRY = process.argv.includes('--dry-run');

/** Official palette — the single place these literals live in the build. */
export const BRAND = {
  wine: '#78020E',
  wineSoft: '#BC727C',
  rosa: '#FFC7D5',
  rosaClaro: '#FFE2E9',
  blancoRoto: '#F0E3E4',
};

/** Official masters (all transparent unless noted). */
const MASTER = {
  wordmarkWine: 'Rojo_Vnuevo.png', //          526x154  wine on transparent
  wordmarkLight: 'blanco_1nuevo.png', //       526x154  blanco roto on transparent
  wordmarkRosa: 'Rosa_2nuevo.png', //          526x154  rosa on transparent
  wordmarkRosaClaro: 'RosaNrosaN.png', //      775x226  rosa claro on transparent
  lockupWine: 'nuevorojo.png', //             1081x1081 rosa claro on wine (solid)
  /** Curated bilingual Open Graph banners (source photography + UI mockups). */
  ogDefaultEs: 'og-default-es.jpg',
  ogDefaultEn: 'og-default-en.jpg',
};

/**
 * The "co" ligature — the `c` plus the `o` whose counter forms a heart. It is
 * the only part of the wordmark that stays legible at favicon sizes, so it is
 * the icon mark. Column bounds measured from the alpha profile of the 526x154
 * master: the ligature occupies x 0..195 before the `r` begins at x 204.
 */
const MONOGRAM_CROP = { left: 0, top: 0, width: 196, height: 154 };

const written = [];
async function emit(relPath, buffer) {
  const out = resolve(PUB, relPath);
  written.push({ path: relPath, bytes: buffer.length });
  if (DRY) return;
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buffer);
}

const master = (key) => sharp(resolve(SRC, MASTER[key]));

/** Trim transparent padding, then centre on a square canvas with a margin. */
async function squareMark(pipeline, { size, background, marginRatio = 0.16 }) {
  const trimmed = await pipeline
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  const inner = Math.round(size * (1 - marginRatio * 2));
  const mark = await sharp(trimmed.data)
    .resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' })
    .toBuffer({ resolveWithObject: true });

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: mark.data,
        left: Math.round((size - mark.info.width) / 2),
        top: Math.round((size - mark.info.height) / 2),
      },
    ])
    .png();
}

/**
 * Open Graph card, 1200×630 — resize a curated bilingual master.
 *
 * Masters live in `assets/brand/og-default-{es,en}.jpg` (community + app
 * mockups). Do not regenerate these from wordmark/SVG; replace the master
 * files when the card art changes.
 */
async function ogFromMaster(key) {
  return master(key)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3',
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

async function main() {
  // ---- 1. Wordmarks -----------------------------------------------------
  for (const [key, name] of [
    ['wordmarkWine', 'corag-wordmark'],
    ['wordmarkLight', 'corag-wordmark-light'],
    ['wordmarkRosa', 'corag-wordmark-rosa'],
  ]) {
    const base = master(key).resize({ width: 1052, kernel: 'lanczos3' }); // 2x the master
    await emit(
      `images/brand/${name}.webp`,
      await base.clone().webp({ quality: 92 }).toBuffer()
    );
    await emit(
      `images/brand/${name}.png`,
      await base.clone().png({ compressionLevel: 9 }).toBuffer()
    );
  }

  // ---- 2. Monogram (the "co" heart ligature) ----------------------------
  const monoWine = () => master('wordmarkWine').extract(MONOGRAM_CROP);
  const monoLight = () => master('wordmarkLight').extract(MONOGRAM_CROP);

  await emit(
    'images/brand/corag-monogram.webp',
    await (await squareMark(monoWine(), { size: 512 }))
      .webp({ quality: 92 })
      .toBuffer()
  );
  await emit(
    'images/brand/corag-monogram-light.webp',
    await (await squareMark(monoLight(), { size: 512 }))
      .webp({ quality: 92 })
      .toBuffer()
  );

  // ---- 3. Square lockup (rosa-claro mark on wine) -----------------------
  const lockup = (size) =>
    squareMark(monoLight(), { size, background: BRAND.wine, marginRatio: 0.2 });

  await emit(
    'images/brand/corag-lockup.webp',
    await (await lockup(1024)).webp({ quality: 92 }).toBuffer()
  );

  // ---- 4. Icons ---------------------------------------------------------
  await emit(
    'icons/icon-192x192.png',
    await (await lockup(192)).png().toBuffer()
  );
  await emit(
    'icons/icon-512x512.png',
    await (await lockup(512)).png().toBuffer()
  );
  await emit(
    'icons/apple-touch-icon.png',
    await (await lockup(180)).png().toBuffer()
  );

  // Maskable icons need the mark inside the safe zone (inner 80% circle).
  await emit(
    'icons/icon-maskable-512x512.png',
    await (
      await squareMark(monoLight(), {
        size: 512,
        background: BRAND.wine,
        marginRatio: 0.29,
      })
    )
      .png()
      .toBuffer()
  );

  // favicon.ico — 48/32/16 PNG-in-ICO, built by hand (no ICO encoder in sharp).
  const icoSizes = [48, 32, 16];
  const pngs = [];
  for (const s of icoSizes) pngs.push(await (await lockup(s)).png().toBuffer());
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach((png, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], e);
    header.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], e + 1);
    header.writeUInt8(0, e + 2); // palette
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bpp
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  await emit('favicon.ico', Buffer.concat([header, ...pngs]));

  /*
   * favicon.svg — the supplied brand package contains no vector master, so this
   * wraps the 512px monogram rather than pretending to be a real trace. It is
   * crisp to 512px, which covers every browser use. Replace it the moment a
   * true SVG/AI master is available (tracked as a gap in OFFICIAL_BRAND_REVIEW.md).
   */
  const svgIcon = await (await lockup(512)).png().toBuffer();
  await emit(
    'favicon.svg',
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <title>Corag</title>
  <image href="data:image/png;base64,${svgIcon.toString('base64')}" width="512" height="512"/>
</svg>`
    )
  );

  // ---- 4b. Home heart motif ---------------------------------------------
  /*
   * Decorative outline of the brand heart (the counter of the wordmark's `o`)
   * for the homepage act backgrounds. Like favicon.svg, this is redrawn — the
   * supplied brand package has no vector master to trace — matching the
   * manual's rounded heart, tilted as in the wordmark. It renders with
   * `currentColor` so the page's token layer decides the colour, and it is
   * always decorative (aria-hidden / CSS background), never content.
   */
  await emit(
    'images/home/motif-heart-outline.svg',
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <path d="M256 434 C 150 352, 84 290, 84 210 C 84 148, 132 106, 190 106 C 226 106, 246 124, 256 142 C 266 124, 286 106, 322 106 C 380 106, 428 148, 428 210 C 428 290, 362 352, 256 434 Z"
        stroke="currentColor" stroke-width="22" stroke-linecap="round"
        stroke-linejoin="round" transform="rotate(-18 256 256)"/>
</svg>
`)
  );

  // ---- 5. Open Graph cards (curated bilingual masters) ------------------
  await emit('images/og-default.jpg', await ogFromMaster('ogDefaultEs'));
  await emit('images/og-default-en.jpg', await ogFromMaster('ogDefaultEn'));

  // ---- 6. Web app manifest ---------------------------------------------
  const manifest = {
    name: 'Corag — El ecosistema de impacto social',
    short_name: 'Corag',
    description:
      'Conectamos a fundaciones, gobiernos, empresas y personas con oportunidades reales de ayudar, con transparencia y trazabilidad.',
    start_url: '/',
    display: 'standalone',
    background_color: BRAND.rosaClaro,
    theme_color: BRAND.wine,
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  await emit(
    'site.webmanifest',
    Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)
  );

  // ---- Report -----------------------------------------------------------
  const total = written.reduce((n, w) => n + w.bytes, 0);
  for (const w of written) {
    console.log(
      `  ${DRY ? 'would write' : 'wrote'}  ${w.path.padEnd(42)} ${String(w.bytes).padStart(8)} B`
    );
  }
  console.log(
    `\n${written.length} files, ${(total / 1024).toFixed(1)} KB total`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
