#!/usr/bin/env node
/**
 * Does every illustration actually arrive on the page, on every screen?
 *
 *   pnpm run build && pnpm run illustrations:check [--strict] [--viewport=phone-narrow]
 *
 * `perf:budgets` weighs the JavaScript, `a11y:check` proves the images declare
 * dimensions and an alt, and `responsive:full` finds elements that overflow.
 * None of them answers the question that actually matters for artwork: **is the
 * drawing there, whole, and big enough to read** — on a 280 px foldable as much
 * as on a 4K display, in light and in dark.
 *
 * Six things are measured for every `[data-illustration]` on every surface that
 * declares one, at every viewport in `scripts/responsive-audit/viewports.json`:
 *
 *   1. **present** — the element exists, and the file behind it decoded
 *      (`naturalWidth > 0`). A 404 on an illustration is invisible otherwise:
 *      an `alt=""` image that fails to load leaves no trace on the page.
 *   2. **visible** — non-zero box, not `display:none`, inside a scrollable
 *      region rather than clipped out of one. The failure this exists for is a
 *      drawing hidden below a breakpoint, which is how the hero spent its first
 *      weeks invisible to every phone.
 *   3. **legible** — at least `MIN_WIDTH` CSS pixels wide, and at least a third
 *      of the surface's content width on a phone. Artwork that survives as a
 *      40 px smudge is worse than artwork that was left out.
 *   4. **undistorted** — the rendered aspect ratio matches the box the page
 *      declared, within 1.5%. Catches a stray `h-full` squashing a drawing.
 *      (Against the declared box, not `naturalWidth` — Chromium reports that
 *      density-corrected for a `srcset` pick and rounds it, which made every
 *      phone look distorted. The file's real shape is the unit test's job.)
 *   5. **unclipped** — the box is fully inside every ancestor that establishes
 *      an `overflow: hidden` clip, and inside the viewport's width.
 *   6. **both themes** — the same element is measured with the site in light and
 *      in dark, because these assets are transparent and a theme that hides one
 *      hides it silently.
 *
 * The surfaces and which illustration each must carry are declared below rather
 * than discovered, so an illustration that silently *stops* being rendered is a
 * failure and not just an absence of findings.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const viewports = JSON.parse(
  readFileSync(join(HERE, 'responsive-audit/viewports.json'), 'utf8')
);

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const quick = args.includes('--quick');
const onlyViewport = args
  .find((a) => a.startsWith('--viewport='))
  ?.split('=')[1];
const base =
  args.find((a) => a.startsWith('--base='))?.split('=')[1] ??
  'http://127.0.0.1:4321';

/** Anything narrower than this cannot carry line work this fine. */
const MIN_WIDTH = 96;
/** On a phone, artwork this far below the content width has been abandoned. */
const MIN_SHARE_OF_CONTENT = 0.3;
/** Rendered vs intrinsic aspect ratio may differ by this much. */
const RATIO_TOLERANCE = 0.015;

/**
 * Every surface that carries artwork, and what it must carry.
 *
 * One language each: the pages are the same renderer, and `parity:check`
 * already proves the two languages carry the same content. `/es/` is here for
 * the home page alone, because the hero is the only asset with two framings and
 * the `<picture>` that picks between them is worth measuring twice.
 */
const SURFACES = [
  {
    url: '/',
    expect: ['hero-cordage', 'ornament-braid', 'join-open-knot'],
    /*
     * The hero is the site's flagship image and it is supposed to hang from the
     * header down past the buttons. It spent weeks rendering at its intrinsic
     * 520 px on every screen — a 27-inch display got exactly what a 13-inch
     * laptop did — because `h-full` resolves against an indefinite grid-row
     * height and silently became `auto`. Nothing in any gate noticed, so this is
     * the gate: from `lg` up — the same 1024px breakpoint the component switches
     * at — the painted drawing must be at least 70% of the fold. Narrower than
     * that it is a band by design, and a band is 25% of a tall tablet's fold.
     */
    rules: { 'hero-cordage': { minFoldShare: 0.7, fromWidth: 1024 } },
  },
  {
    url: '/es/',
    expect: ['hero-cordage', 'ornament-braid', 'join-open-knot'],
    rules: { 'hero-cordage': { minFoldShare: 0.7, fromWidth: 1024 } },
  },
  { url: '/developers/', expect: ['portal-loom'] },
  {
    url: '/developers/quickstart/',
    expect: ['quickstart-first-thread', 'ornament-braid'],
  },
  { url: '/developers/validator/', expect: ['validator-gauge'] },
  { url: '/developers/skill/', expect: ['skill-handover'] },
  { url: '/registry/', expect: ['registry-net', 'empty-coil'] },
  { url: '/governance/', expect: ['governance-hands'] },
  { url: '/join/', expect: ['join-splice'] },
  { url: '/404.html', expect: ['404-retied'] },
];

/** The four that decide whether artwork works, when there is time for four. */
const QUICK = new Set([
  'foldable-folded',
  'phone-standard',
  'tablet-portrait',
  'laptop-standard',
]);

const activeViewports = onlyViewport
  ? viewports.filter((v) => v.name === onlyViewport)
  : quick
    ? viewports.filter((v) => QUICK.has(v.name))
    : viewports;

/**
 * Measure every illustration on the current page.
 *
 * Runs in the browser: the clip test needs live computed styles, and the
 * legibility test needs the real content width rather than the viewport's.
 */
const measure = () =>
  // biome-ignore lint/complexity/useArrowFunction: runs in the page, not here
  (function () {
    const container = document.querySelector('.main-container');
    const contentWidth = container
      ? container.getBoundingClientRect().width
      : document.documentElement.clientWidth;

    return Array.from(document.querySelectorAll('[data-illustration]')).map(
      (el) => {
        const id = el.getAttribute('data-illustration');
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);

        /* The nearest ancestors that clip, and whether we fit inside them. */
        let clippedBy = null;
        let node = el.parentElement;
        while (node && !clippedBy) {
          const s = getComputedStyle(node);
          const clips =
            s.overflow === 'hidden' ||
            s.overflowX === 'hidden' ||
            s.overflowY === 'hidden';
          if (clips) {
            const box = node.getBoundingClientRect();
            const out =
              rect.left < box.left - 1 ||
              rect.right > box.right + 1 ||
              rect.top < box.top - 1 ||
              rect.bottom > box.bottom + 1;
            /* A vertical overrun of a page-level clip is just the page
               scrolling; only a horizontal one hides pixels for good. */
            const horizontal =
              rect.left < box.left - 1 || rect.right > box.right + 1;
            if (out && horizontal) {
              clippedBy =
                node.tagName.toLowerCase() +
                (node.className && typeof node.className === 'string'
                  ? `.${node.className.split(' ').slice(0, 2).join('.')}`
                  : '');
            }
          }
          node = node.parentElement;
        }

        return {
          id,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
          naturalWidth: el.naturalWidth ?? 0,
          naturalHeight: el.naturalHeight ?? 0,
          /*
           * The box the page reserved, from the registry's own numbers.
           *
           * The aspect check compares the rendered box against *this*, not
           * against `naturalWidth`/`naturalHeight`: for an image chosen out of a
           * `srcset`, Chromium reports those density-corrected and rounded to
           * whole pixels, so a 67 px-tall mark picked at 2x reports a ratio 2%
           * off its own file and every phone looked distorted. What the file
           * really measures is the unit test's job.
           */
          declaredWidth: Number(el.getAttribute('width')) || 0,
          declaredHeight: Number(el.getAttribute('height')) || 0,
          objectFit: styles.objectFit,
          currentSrc: el.currentSrc ?? el.src ?? '',
          display: styles.display,
          visibility: styles.visibility,
          opacity: Number.parseFloat(styles.opacity),
          contentWidth: Math.round(contentWidth),
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          clippedBy,
        };
      }
    );
  })();

const findings = [];
const record = (type, detail) => findings.push({ type, ...detail });

const browser = await chromium.launch();
let measured = 0;

/**
 * The matrix is viewports × themes × surfaces, which is 300 page loads at full
 * breadth. Serially that is a quarter of an hour and nobody runs it; four
 * contexts in parallel bring it under four minutes, which is a gate people use.
 */
const JOBS = activeViewports.flatMap((viewport) =>
  ['light', 'dark'].map((theme) => ({ viewport, theme }))
);
const CONCURRENCY = 4;

async function runJob({ viewport, theme }) {
  {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
      isMobile: viewport.isMobile ?? false,
      hasTouch: viewport.isMobile ?? false,
      colorScheme: theme,
    });
    const page = await context.newPage();

    for (const surface of SURFACES) {
      const url = `${base}${surface.url}`;
      const where = { viewport: viewport.name, theme, url: surface.url };

      const response = await page.goto(url, { waitUntil: 'load' });
      if (!response || response.status() >= 400) {
        record('surface-missing', {
          ...where,
          detail: `${response ? response.status() : 'no response'} for ${url}`,
        });
        continue;
      }

      /* The portal keeps its own theme preference and defaults to dark, so the
         `colorScheme` context alone does not describe what a reader sees. */
      await page.evaluate((t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
      }, theme);
      /*
       * Force the lazy assets to load, then wait — bounded.
       *
       * "Did the file actually arrive" is one of the six things measured, and a
       * `loading="lazy"` image below the fold never starts. Promoting them to
       * `eager` starts every fetch; the race is there because `decode()` on an
       * image that never loads does not reject, it simply never settles, which
       * is how the first version of this audit hung instead of reporting.
       */
      await page.evaluate(async () => {
        const images = Array.from(document.images);
        for (const img of images) img.loading = 'eager';
        await Promise.race([
          Promise.all(
            images.map((img) =>
              img.complete
                ? null
                : new Promise((resolve) => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                  })
            )
          ),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      });

      const seen = await page.evaluate(measure);
      const byId = new Map(seen.map((s) => [s.id, s]));

      for (const id of surface.expect) {
        const art = byId.get(id);
        if (!art) {
          record('missing', { ...where, id, detail: 'not in the DOM' });
          continue;
        }
        measured++;

        if (!art.naturalWidth) {
          record('not-loaded', {
            ...where,
            id,
            detail: `did not decode (${art.currentSrc || 'no src'})`,
          });
          continue;
        }

        const hidden =
          art.display === 'none' ||
          art.visibility === 'hidden' ||
          art.opacity === 0 ||
          art.width === 0 ||
          art.height === 0;
        if (hidden) {
          record('invisible', {
            ...where,
            id,
            detail: `display:${art.display} visibility:${art.visibility} opacity:${art.opacity} box:${art.width}×${art.height}`,
          });
          continue;
        }

        /*
         * What the eye actually sees, which is not always the box.
         *
         * With `object-fit: contain` the drawing is letterboxed inside its box:
         * a 700 px-wide box can paint a 300 px drawing, and measuring the box
         * would call that fine. So the painted size is derived from the drawing's
         * own ratio and the box, and every size rule below uses it.
         */
        const drawingRatio =
          art.declaredWidth && art.declaredHeight
            ? art.declaredWidth / art.declaredHeight
            : art.width / art.height;
        const painted =
          art.objectFit === 'contain' || art.objectFit === 'scale-down'
            ? {
                width: Math.min(art.width, art.height * drawingRatio),
                height: Math.min(art.height, art.width / drawingRatio),
              }
            : { width: art.width, height: art.height };

        /* Marks are punctuation, not pictures: the ornament is 16 px tall by
           design and the coil is a badge. They are held to presence, aspect and
           clipping, not to a minimum width. */
        const isMark = id === 'ornament-braid' || id === 'empty-coil';
        if (!isMark) {
          const rule = surface.rules?.[id];
          if (
            rule?.minFoldShare &&
            viewport.width >= (rule.fromWidth ?? 0) &&
            painted.height < viewport.height * rule.minFoldShare
          ) {
            record('too-small-for-the-fold', {
              ...where,
              id,
              detail:
                `painted ${Math.round(painted.width)}×${Math.round(painted.height)}px — ` +
                `${Math.round((painted.height / viewport.height) * 100)}% of a ${viewport.height}px fold, ` +
                `floor is ${rule.minFoldShare * 100}%`,
            });
          }
          if (painted.width < MIN_WIDTH) {
            record('too-small', {
              ...where,
              id,
              detail: `${Math.round(painted.width)}px wide, floor is ${MIN_WIDTH}px`,
            });
          } else if (
            /*
             * The share-of-content floor is a portrait rule.
             *
             * On a phone held upright, artwork much narrower than the column is
             * artwork nobody will look at. Turn the same phone sideways and the
             * binding constraint flips: the viewport is 375px tall, the drawing
             * is capped by height on purpose, and being a quarter of a 667px
             * column is the correct outcome rather than a defect.
             */
            viewport.isMobile &&
            viewport.height >= viewport.width &&
            painted.width < art.contentWidth * MIN_SHARE_OF_CONTENT
          ) {
            record('too-small-for-phone', {
              ...where,
              id,
              detail: `${Math.round(painted.width)}px of ${art.contentWidth}px content width (${Math.round(
                (painted.width / art.contentWidth) * 100
              )}%, floor is ${MIN_SHARE_OF_CONTENT * 100}%)`,
            });
          }
        }

        /*
         * Only `object-fit: fill` can actually squash a drawing.
         *
         * `fill` is the default for `<img>`, so this check still covers every
         * ordinary placement: the box is the drawing, and a box of the wrong
         * shape is a stretched drawing. The landing hero is the exception at both
         * ends — a `cover` crop window below `lg` (the faded band) and a
         * `contain` box sized from the fold above it — and in both the drawing
         * keeps its own aspect ratio by construction, so comparing the box to the
         * file there would only report the framing the design asked for.
         */
        const declared = art.declaredWidth / art.declaredHeight;
        const rendered = art.width / art.height;
        if (art.objectFit !== 'fill') {
          /* the box is a window or a frame, not the drawing itself */
        } else if (
          !declared ||
          Math.abs(rendered - declared) / declared > RATIO_TOLERANCE
        ) {
          record('distorted', {
            ...where,
            id,
            detail: declared
              ? `rendered ${rendered.toFixed(4)} vs declared ${declared.toFixed(4)}`
              : 'no width/height attributes — the box is not reserved',
          });
        }

        if (art.clippedBy) {
          record('clipped', {
            ...where,
            id,
            detail: `clipped horizontally by ${art.clippedBy}`,
          });
        }

        if (art.width > art.viewportWidth + 1) {
          record('wider-than-viewport', {
            ...where,
            id,
            detail: `${art.width}px in a ${art.viewportWidth}px viewport`,
          });
        }

        if (art.documentWidth > art.viewportWidth + 1) {
          record('page-overflows', {
            ...where,
            id,
            detail: `document is ${art.documentWidth}px wide in a ${art.viewportWidth}px viewport`,
          });
        }
      }

      /* An illustration on a surface that does not declare it: either the map
         is stale or a page grew artwork nobody registered. */
      for (const art of seen) {
        if (!surface.expect.includes(art.id)) {
          record('undeclared', {
            ...where,
            id: art.id,
            detail: 'rendered but not declared for this surface',
          });
        }
      }
    }

    await context.close();
  }
}

const queue = [...JOBS];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const job = queue.shift();
      if (job) await runJob(job);
    }
  })
);

await browser.close();

/* ── Report ──────────────────────────────────────────────── */

const ORDER = [
  'surface-missing',
  'missing',
  'not-loaded',
  'invisible',
  'clipped',
  'distorted',
  'wider-than-viewport',
  'page-overflows',
  'too-small',
  'too-small-for-phone',
  'too-small-for-the-fold',
  'undeclared',
];

console.log(
  '\n🎨 illustrations:check — every drawing, every viewport, both themes\n'
);
console.log(
  `   ${SURFACES.length} surfaces × ${activeViewports.length} viewports × 2 themes` +
    `  ·  ${measured} illustration measurements\n`
);

if (findings.length === 0) {
  console.log(
    '✅ every declared illustration is present, decoded, visible, unclipped,\n' +
      '   undistorted and legible at every viewport in both themes.\n'
  );
  process.exit(0);
}

const grouped = new Map();
for (const f of findings) {
  const key = `${f.type}|${f.id ?? ''}|${f.url}|${f.detail}`;
  const at = grouped.get(key) ?? { ...f, viewports: new Set() };
  at.viewports.add(`${f.viewport}/${f.theme}`);
  grouped.set(key, at);
}

for (const type of ORDER) {
  const rows = [...grouped.values()].filter((f) => f.type === type);
  if (rows.length === 0) continue;
  console.log(`   ${type} (${rows.length})`);
  for (const row of rows) {
    const at = [...row.viewports];
    const where =
      at.length > 4 ? `${at.length} viewport/theme pairs` : at.join(', ');
    console.log(`     • ${(row.id ?? '—').padEnd(24)} ${row.url}`);
    console.log(`       ${row.detail}`);
    console.log(`       at ${where}`);
  }
  console.log('');
}

console.log(`${strict ? '❌' : '⚠️ '} ${findings.length} finding(s)\n`);
process.exit(strict ? 1 : 0);
