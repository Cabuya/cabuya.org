#!/usr/bin/env node

/**
 * Corag homepage app-screenshot pipeline
 *
 * Captures the manifest's views of the live application (ayuda.cabuya.org) with
 * Playwright, applies the blueprint's crops, and emits responsive WebP sets to
 * `public/images/home/app/` with provenance in CAPTURES.json — so every
 * shipped screenshot is reproducible and auditable, never a one-off download.
 *
 * Personal-data gate (hard rule): a human MUST open every raw frame in
 * `tmp/app-captures/` at full size and check for real names, phone numbers,
 * exact addresses or identifiable faces before the assets ship. The map view
 * is cropped to its aggregate-cluster region because the request-list panel
 * shows individual situations and is never allowed to ship. After the review,
 * run with `--attest` to record the check in CAPTURES.json.
 *
 * Usage:
 *   node scripts/capture-app-screens.mjs            capture + process (checks "pending")
 *   node scripts/capture-app-screens.mjs --attest   record the human personal-data review
 *   node scripts/capture-app-screens.mjs --help     this text
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const RAW_DIR = resolve(ROOT, 'tmp/app-captures');
const OUT_DIR = resolve(ROOT, 'public/images/home/app');
const HOME_DIR = resolve(ROOT, 'public/images/home');
/** Institutional-page screenshots live beside the home's, one level over. */
const PAGES_DIR = resolve(ROOT, 'public/images/pages/app');
const PROVENANCE = resolve(OUT_DIR, 'CAPTURES.json');

const APP_BASE = 'https://ayuda.cabuya.org';
const SCALE = 2; // deviceScaleFactor — crisp on retina renders
const WEBP_QUALITY = 78;

/**
 * The blueprint's asset manifest (HOME_DESIGN_BLUEPRINT.md §5). Crops are in
 * CSS pixels of the capture viewport; the script scales them by SCALE.
 *
 * The map URL is emergency-specific and will go stale when the emergency
 * closes — on re-capture, update it to a current public map view and re-run
 * the personal-data review.
 */
const CAPTURES = [
  {
    key: 'app-home-desktop',
    url: '/',
    viewport: { width: 1440, height: 900 },
    widths: [640, 960, 1280, 1920],
    personalDataPolicy:
      'Home shows aggregate counts only (solicitudes/urgentes/ofrecimientos, totals). No names or contacts may be visible.',
  },
  {
    key: 'app-home-mobile',
    url: '/',
    viewport: { width: 390, height: 844 },
    widths: [390, 780],
    personalDataPolicy:
      'Same aggregate-only home at mobile viewport. Also serves the hero mini-card (top-anchored CSS crop).',
  },
  {
    key: 'app-aportar-mobile',
    url: '/aportar',
    viewport: { width: 390, height: 844 },
    widths: [390, 780],
    personalDataPolicy:
      'Contribution wizard step 1 — generic option cards only. No user data may be visible.',
  },
  {
    key: 'app-map-desktop',
    url: '/emergencias/eje-cafetero/puntos-de-ayuda',
    viewport: { width: 1440, height: 900 },
    // Map region only: the left request-list panel shows individual
    // situations and is NEVER allowed to ship (blueprint §1). The crop also
    // drops the page chrome above the map.
    crop: { left: 600, top: 210, width: 840, height: 690 },
    widths: [640, 1280],
    personalDataPolicy:
      'Request-list panel BLOCKED (individual situations). Only the aggregate cluster-map region ships; verify no popup or tooltip with a request is open in the frame.',
  },

  // ---- Institutional pages (INSTITUTIONAL_BLUEPRINT.md §6) ---------------
  {
    key: 'app-avances-desktop',
    url: '/#avances',
    viewport: { width: 1440, height: 900 },
    // The stats row plus the "Recibido -> Donado con evidencia" band: the
    // application's own rendering of the two-numbers argument.
    crop: { left: 100, top: 90, width: 1240, height: 345 },
    widths: [640, 960, 1240],
    outDir: PAGES_DIR,
    personalDataPolicy:
      'Aggregate totals only (personas aportantes, recibido, ayudas ofrecidas, donado con evidencia). No names, no contacts. The figures are live application data and must be captioned as such wherever they ship.',
  },
  {
    key: 'app-solicitar-mobile',
    url: '/emergencias/eje-cafetero/puntos-de-ayuda?accion=solicitar',
    viewport: { width: 390, height: 844 },
    widths: [390, 780],
    outDir: PAGES_DIR,
    personalDataPolicy:
      'Empty "solicitar ayuda" form — placeholders only. Verify no autofilled value and no map pin resolving to a real address.',
  },
  {
    key: 'app-registro-lider-desktop',
    url: '/registro/lider',
    viewport: { width: 1440, height: 900 },
    widths: [640, 1280],
    outDir: PAGES_DIR,
    personalDataPolicy:
      'Empty leader application form — placeholders only. Verify no autofilled identity, phone or document value.',
  },
  {
    key: 'app-seguimiento-mobile',
    url: '/seguimiento',
    viewport: { width: 390, height: 844 },
    widths: [390, 780],
    outDir: PAGES_DIR,
    personalDataPolicy:
      'Empty private-search screen plus its privacy promise. Verify the search field is empty and no result list is rendered.',
  },
  /*
   * DELIBERATELY ABSENT: the published-evidence view
   * (`/emergencias/{slug}#evidencias`).
   *
   * Reviewed 2026-08-14 at both 1440x900 and 390x844 and dropped, for two
   * independent reasons:
   *
   * 1. Its right sidebar ("Responsables del dinero") renders real full names
   *    and bank-account fragments. A crop can exclude it today, but the card
   *    column sits ~50 CSS px from it: any app layout change would pull it
   *    into frame on the next re-capture, and this script would ship it
   *    without anyone looking. A crop that is one CSS change away from
   *    publishing someone's bank details is not a safe asset.
   * 2. The evidence photos are real purchase receipts, legible enough to read
   *    the cashier id, the transaction number and the barcode — a real
   *    financial document, and more than a marketing page needs.
   *
   * The institutional blueprint's fallback (a designed, non-photographic
   * treatment) covers the layout wherever this asset was planned. Re-open this
   * decision only if the application gains a view that publishes evidence
   * without the responsables sidebar.
   */
];

/**
 * Local derivations from already-admitted field photos (no network). The
 * caritas master is 1080x810, so the max 4:5 portrait crop is 648 wide —
 * that bounds the responsive set.
 */
const DERIVATIONS = [
  {
    key: 'hero-caritas-45',
    source: 'public/images/home/entrega-caritas.webp',
    crop: { left: 216, top: 0, width: 648, height: 810 }, // centred 4:5
    widths: [480, 648],
    outDir: HOME_DIR,
    personalDataPolicy:
      'Existing admitted field photo (delivery scene, faces masked by mascarillas); crop changes framing only.',
  },
];

const args = process.argv.slice(2);

if (args.includes('--help')) {
  const header = (await readFile(new URL(import.meta.url), 'utf8')).split(
    '*/'
  )[0];
  console.log(header.replace(/^\/\*\*?/, '').replace(/^ \* ?/gm, ''));
  process.exit(0);
}

const scaled = (crop) =>
  crop && {
    left: crop.left * SCALE,
    top: crop.top * SCALE,
    width: crop.width * SCALE,
    height: crop.height * SCALE,
  };

async function emitSet({ key, rawBuffer, crop, widths, outDir = OUT_DIR }) {
  const base = crop ? sharp(rawBuffer).extract(crop) : sharp(rawBuffer);
  const cropped = await base.toBuffer();
  const meta = await sharp(cropped).metadata();
  const files = [];
  for (const width of widths) {
    if (width > meta.width) {
      throw new Error(
        `${key}: requested width ${width} exceeds source ${meta.width}px`
      );
    }
    const name = `${key}-${width}.webp`;
    const out = resolve(outDir, name);
    await sharp(cropped)
      .resize({ width, kernel: 'lanczos3' })
      .webp({ quality: WEBP_QUALITY })
      .toFile(out);
    const bytes = (await readFile(out)).length;
    files.push({ file: name, width, bytes });
    console.log(`  wrote ${name.padEnd(30)} ${String(bytes).padStart(8)} B`);
  }
  return { files, sourceSize: { width: meta.width, height: meta.height } };
}

async function attest() {
  const provenance = JSON.parse(await readFile(PROVENANCE, 'utf8'));
  const date = new Date().toISOString().slice(0, 10);
  for (const asset of provenance.assets) {
    asset.personalDataCheck = {
      status: 'passed',
      method:
        'Every raw frame opened at full size and reviewed by a human for real names, phone numbers, exact addresses and identifiable faces before shipping.',
      date,
    };
  }
  provenance.attestedAt = date;
  await writeFile(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
  console.log(
    `Recorded personal-data review for ${provenance.assets.length} assets.`
  );
}

async function capture() {
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(PAGES_DIR, { recursive: true });

  const assets = [];
  const browser = await chromium.launch();
  try {
    for (const spec of CAPTURES) {
      const page = await browser.newPage({
        viewport: spec.viewport,
        deviceScaleFactor: SCALE,
      });
      const url = `${APP_BASE}${spec.url}`;
      console.log(`capturing ${spec.key} <- ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2500); // settle lazy content (map tiles, stats)
      // Hash URLs need an explicit scroll: the anchor may not exist at load.
      if (spec.url.includes('#')) {
        await page.evaluate(() => {
          const target = document.getElementById(location.hash.slice(1));
          if (target) target.scrollIntoView();
        });
        await page.waitForTimeout(1200);
      }
      const rawPath = resolve(RAW_DIR, `${spec.key}.png`);
      const rawBuffer = await page.screenshot({ path: rawPath });
      await page.close();

      const { files } = await emitSet({
        key: spec.key,
        rawBuffer,
        crop: scaled(spec.crop),
        widths: spec.widths,
        outDir: spec.outDir ?? OUT_DIR,
      });
      assets.push({
        key: spec.key,
        source: url,
        capturedAt: new Date().toISOString(),
        viewport: spec.viewport,
        deviceScaleFactor: SCALE,
        crop: spec.crop ?? null,
        files,
        rawFrame: `tmp/app-captures/${spec.key}.png`,
        personalDataPolicy: spec.personalDataPolicy,
        personalDataCheck: { status: 'pending' },
      });
    }
  } finally {
    await browser.close();
  }

  for (const spec of DERIVATIONS) {
    console.log(`deriving ${spec.key} <- ${spec.source}`);
    const rawBuffer = await readFile(resolve(ROOT, spec.source));
    const { files } = await emitSet({
      key: spec.key,
      rawBuffer,
      crop: spec.crop,
      widths: spec.widths,
      outDir: spec.outDir,
    });
    assets.push({
      key: spec.key,
      source: spec.source,
      capturedAt: new Date().toISOString(),
      crop: spec.crop,
      files,
      personalDataPolicy: spec.personalDataPolicy,
      personalDataCheck: { status: 'pending' },
    });
  }

  const provenance = {
    generatedBy: 'scripts/capture-app-screens.mjs',
    note: 'Screenshots of the live application; the data they show is live app data at capture time. Re-run the script and the personal-data review together.',
    assets,
  };
  await writeFile(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);

  const total = assets.flatMap((a) => a.files).reduce((n, f) => n + f.bytes, 0);
  console.log(
    `\n${assets.length} assets, ${(total / 1024).toFixed(1)} KB total. Personal-data checks: PENDING — review tmp/app-captures/ then run with --attest.`
  );
}

if (args.includes('--attest')) {
  await attest();
} else {
  await capture();
}
