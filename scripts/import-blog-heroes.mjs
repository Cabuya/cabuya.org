/**
 * Import the migrated blog archive's hero images.
 *
 * The source posts carried Unsplash photographs served through the previous
 * site's Webflow CDN. We fetch the originals from Unsplash instead — same
 * asset, cleaner provenance, and control over the requested size — then emit
 * the responsive WebP set every blog hero uses.
 *
 * Licensing: every id in the plan was verified to resolve on
 * `images.unsplash.com`, and the Unsplash License permits commercial use
 * without permission. Provenance is recorded in `CREDITS.json` beside the
 * images so it stays checkable after the fact.
 *
 * Usage: node scripts/import-blog-heroes.mjs <migration_plan.json>
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WIDTHS = [480, 768, 1280];
const SOURCE_WIDTH = 1600;

async function fetchOriginal(id) {
  const url = `https://images.unsplash.com/${id}?w=${SOURCE_WIDTH}&q=85&fm=jpg&fit=max`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const planPath = process.argv[2];
  if (!planPath) {
    console.error('usage: node scripts/import-blog-heroes.mjs <plan.json>');
    process.exit(1);
  }
  const plan = JSON.parse(await readFile(planPath, 'utf8'));
  const credits = [];

  for (const [index, entry] of plan.entries()) {
    const dir = resolve(ROOT, 'public/images/blog/posts', entry.slug);
    await mkdir(dir, { recursive: true });

    const original = await fetchOriginal(entry.heroId);
    const base = sharp(original).rotate();
    const { width, height } = await base.metadata();

    await base
      .clone()
      .resize({ width: SOURCE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(resolve(dir, 'hero.webp'));

    for (const target of WIDTHS) {
      await base
        .clone()
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(resolve(dir, `hero-${target}.webp`));
    }

    credits.push({
      slug: entry.slug,
      source: 'Unsplash',
      photoId: entry.heroId,
      sourceUrl: `https://images.unsplash.com/${entry.heroId}`,
      license:
        'Unsplash License — free for commercial use, no permission required',
      originalSize: `${width}x${height}`,
    });
    console.log(`${index + 1}/${plan.length} ${entry.slug}`);
  }

  await writeFile(
    resolve(ROOT, 'public/images/blog/posts/CREDITS.json'),
    `${JSON.stringify(credits, null, 2)}\n`
  );
  console.log(`wrote CREDITS.json with ${credits.length} entries`);
}

await main();
