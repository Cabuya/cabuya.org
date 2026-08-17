#!/usr/bin/env node
/**
 * Install the real share cards over the generated fallback.
 *
 *   node scripts/build-og-cards.mjs --masters <dir>
 *
 * `<dir>` holds `en.png` and `es.png` — the designed cards, one per language.
 * They are resized to exactly 1200 × 630 and encoded as JPEG under 300 KB at
 * `public/images/og-default-en.jpg` and `public/images/og-default.jpg`, which is
 * where `getDefaultOgImage(lang)` already looks.
 *
 * ## Why JPEG, and why exactly 1200 × 630
 *
 * Several platforms still fetch `og:image` with crawlers that do not negotiate
 * WebP, and a card that fails to render is worse than a larger file. 1200 × 630
 * is the size every platform downscales *from*; an oversized card is silently
 * re-encoded by whoever is displaying it, and the re-encode is always worse than
 * ours. `OG_CARDS` in `src/lib/og-image.ts` declares that pair to the meta tags,
 * so a card of another size would advertise dimensions it does not have.
 *
 * ## The fallback guard, from the other direction
 *
 * `scripts/generate-og-fallback.mjs` runs on every build and refuses to
 * overwrite a card that does not carry its EXIF marker. This script is the
 * reason that guard exists, so it checks the same marker before writing: if a
 * master somehow carried it, the next build would treat the real artwork as
 * disposable.
 */

import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { FALLBACK_MARKER } from './generate-og-fallback.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/images');

const WIDTH = 1200;
const HEIGHT = 630;
const BUDGET_KB = 300;

/** Master file → the path `getDefaultOgImage` resolves for that language. */
const CARDS = [
  { master: 'en.png', out: 'og-default-en.jpg', lang: 'en' },
  { master: 'es.png', out: 'og-default.jpg', lang: 'es' },
];

const mastersDir = process.argv
  .find((a) => a.startsWith('--masters='))
  ?.split('=')[1];

if (!mastersDir) {
  console.error(
    '\n❌ --masters=<dir> is required (holding en.png and es.png)\n'
  );
  process.exit(1);
}

console.log('\n🖼  build-og-cards\n');

for (const card of CARDS) {
  const master = join(mastersDir, card.master);
  if (!existsSync(master)) {
    console.error(`  ❌ ${card.lang}: no master at ${master}`);
    process.exitCode = 1;
    continue;
  }

  const meta = await sharp(master).metadata();
  const description = meta.exif ? meta.exif.toString('latin1') : '';
  if (description.includes(FALLBACK_MARKER)) {
    console.error(
      `  ❌ ${card.lang}: master carries the fallback marker — the next build would overwrite it`
    );
    process.exitCode = 1;
    continue;
  }

  const target = join(OUT, card.out);
  let written = null;
  for (const quality of [92, 88, 84, 80, 76, 72]) {
    const buffer = await sharp(master)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
      .flatten({ background: '#FAF9F6' })
      .jpeg({ quality, progressive: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
    written = { buffer, quality };
    if (buffer.length / 1024 <= BUDGET_KB) break;
  }

  await sharp(written.buffer).toFile(target);
  const kb = statSync(target).size / 1024;
  const flag = kb <= BUDGET_KB ? '✓' : '⚠️ ';
  console.log(
    `  ${flag} ${card.lang}  ${card.out.padEnd(20)} ${WIDTH}×${HEIGHT}  ${kb.toFixed(0)} KB  q${written.quality}  ` +
      `(from ${meta.width}×${meta.height})`
  );
}

console.log('');
