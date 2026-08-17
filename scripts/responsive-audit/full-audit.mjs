/**
 * The full responsive audit.
 *
 *   node scripts/responsive-audit/full-audit.mjs              # every route × viewport
 *   node scripts/responsive-audit/full-audit.mjs --quick      # 4 viewports
 *   node scripts/responsive-audit/full-audit.mjs --route /es/ # one route
 *
 * The existing suite checks two things: whether the *document* scrolls
 * horizontally, and whether the homepage header's buttons are big enough. Both
 * are real, and both miss most of what actually breaks a page on a phone.
 *
 * This measures, on every route at every viewport:
 *
 *   1. horizontal overflow — and **which element causes it**, because
 *      "the document is 8px too wide" is not actionable
 *   2. every interactive element's tap size, not just the chrome
 *   3. tap targets closer together than a fingertip
 *   4. text below the size a phone can render legibly
 *   5. images with no intrinsic dimensions (layout shift)
 *   6. tables, `<pre>` and code that overflow with no scroll container
 *   7. content clipped by an `overflow: hidden` ancestor
 *   8. fixed or sticky chrome eating a short viewport
 *   9. line lengths outside the readable band
 *  10. anything that scrolls sideways inside the page
 *
 * Every finding carries a selector, a measurement and the viewport it happened
 * at, so it can be fixed without re-deriving it.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

const viewports = JSON.parse(
  readFileSync(join(HERE, 'viewports.json'), 'utf8')
);
const { baseUrl, routes } = JSON.parse(
  readFileSync(join(HERE, 'urls.json'), 'utf8')
);

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const onlyRoute = args.find((a) => a.startsWith('--route='))?.split('=')[1];
const base =
  args.find((a) => a.startsWith('--base='))?.split('=')[1] ?? baseUrl;

/** The four that matter most when you only have time for four. */
const QUICK = new Set([
  'phone-narrow',
  'phone-standard',
  'tablet-portrait',
  'laptop-standard',
]);

const activeViewports = quick
  ? viewports.filter((v) => QUICK.has(v.name))
  : viewports;
const activeRoutes = onlyRoute
  ? routes.filter((r) => r.url === onlyRoute)
  : routes;

/** Apple and Google both say 44; 40 tolerates DPR-2 sub-pixel rounding. */
const MIN_TAP = 40;
/** Below this a phone renders text people zoom to read. */
const MIN_FONT = 12;
/** Sub-pixel rounding at DPR 2 and 3 costs a few px legitimately. */
const OVERFLOW_TOLERANCE = 6;

/**
 * Everything measured in one pass inside the page.
 *
 * One evaluate rather than ten: each round trip costs more than the work, and
 * 240 page loads × 10 round trips is the difference between a minute and ten.
 */
const collect = ({ minTap, minFont, tolerance }) => {
  const findings = [];
  const add = (type, detail) => findings.push({ type, ...detail });

  /**
   * Visually-hidden-but-readable text: 1px, clipped, off-screen. That is the
   * `sr-only` pattern working, not a layout defect — and it accounted for
   * every single "content clipped" finding on the first run.
   */
  const isScreenReaderOnly = (el) => {
    if (el.closest('.sr-only')) return true;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const clipped =
      style.clip === 'rect(0px, 0px, 0px, 0px)' ||
      style.clipPath === 'inset(50%)';
    return clipped || (rect.width <= 1 && rect.height <= 1);
  };

  const describe = (el) => {
    if (!el) return '(unknown)';
    const id = el.id ? `#${el.id}` : '';
    const cls =
      typeof el.className === 'string' && el.className
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : '';
    const text = (el.textContent ?? '')
      .trim()
      .slice(0, 30)
      .replace(/\s+/g, ' ');
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ''}`;
  };

  const root = document.documentElement;
  const viewportWidth = root.clientWidth;

  // ── 1 & 2. Horizontal overflow, and what causes it ──────────────────
  const documentOverflow = root.scrollWidth - viewportWidth;
  if (documentOverflow > tolerance) {
    // Find the widest offenders rather than reporting the symptom.
    const culprits = [];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const right = rect.right;
      const left = rect.left;
      if (right > viewportWidth + tolerance || left < -tolerance) {
        const style = getComputedStyle(el);
        // An element inside a scroll container is that container's business.
        let scrollableAncestor = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (['auto', 'scroll'].includes(ps.overflowX)) {
            scrollableAncestor = true;
            break;
          }
        }
        if (scrollableAncestor) continue;
        culprits.push({
          selector: describe(el),
          left: Math.round(left),
          right: Math.round(right),
          width: Math.round(rect.width),
          overflowBy: Math.round(right - viewportWidth),
          position: style.position,
        });
      }
    }
    culprits.sort((a, b) => b.overflowBy - a.overflowBy);
    add('document-overflow', {
      overflowBy: Math.round(documentOverflow),
      viewportWidth,
      culprits: culprits.slice(0, 5),
    });
  }

  // ── 3. Tap targets ──────────────────────────────────────────────────
  const interactive = [
    ...document.querySelectorAll(
      'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], summary'
    ),
  ].filter((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (rect.width === 0 || rect.height === 0) return false;
    // A skip link is 1px until focused; a closed drawer is not tappable yet.
    if (isScreenReaderOnly(el)) return false;
    if (rect.bottom < 0 || rect.top > window.innerHeight * 4) return false;
    return true;
  });

  /**
   * The hit area, which is not always the box.
   *
   * A 24px icon button with `::after { position: absolute; inset: -10px }` has
   * a 44px tap target — the standard way to keep a control visually small and
   * physically reachable. `getBoundingClientRect()` returns 24 and reports a
   * defect that is not there. The header's theme toggle does exactly this.
   */
  const hitArea = (el) => {
    /*
     * A control wrapped in (or bound to) a label is tapped through the label.
     * A 13px radio inside `<label>…text…</label>` has the label's hit area,
     * which is how every checkbox on the web works.
     */
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
      const label =
        el.closest('label') ??
        (el.id
          ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
          : null);
      if (label) {
        // The union, not the label. A `<label>` sitting *above* an input is
        // 16px tall and clicking it focuses the field — but the field itself
        // is the target, and taking the label's box alone reported a 44px
        // input as 16px.
        const box = label.getBoundingClientRect();
        const own = el.getBoundingClientRect();
        return {
          width: Math.max(box.width, own.width),
          height: Math.max(box.height, own.height),
        };
      }
    }

    const rect = el.getBoundingClientRect();
    let { width, height } = rect;
    for (const pseudo of ['::after', '::before']) {
      const style = getComputedStyle(el, pseudo);
      if (!style.content || style.content === 'none') continue;
      if (style.position !== 'absolute') continue;
      const grow = (a, b) => {
        const va = Number.parseFloat(a);
        const vb = Number.parseFloat(b);
        return (Number.isNaN(va) ? 0 : -va) + (Number.isNaN(vb) ? 0 : -vb);
      };
      width += Math.max(0, grow(style.left, style.right));
      height += Math.max(0, grow(style.top, style.bottom));
    }
    return { width, height };
  };

  const small = [];
  for (const el of interactive) {
    const rect = hitArea(el);
    // A link inside a paragraph is text, not a control — its hit area is the
    // line box, and holding prose to 44px would double-space every sentence.
    const inProse = el.closest('p, li, td, th, figcaption, blockquote');
    if (inProse && el.tagName === 'A') continue;
    if (rect.width < minTap || rect.height < minTap) {
      small.push({
        selector: describe(el),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }
  if (small.length)
    add('small-tap-target', { count: small.length, items: small.slice(0, 8) });

  // ── 4. Tap targets crowded together ─────────────────────────────────
  //
  // Only on touch. A 4px gap between two desktop nav links is a design choice
  // a mouse has no trouble with; the same gap under a fingertip is a mis-tap.
  const crowded = [];
  const touch =
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0;
  if (touch) {
    const boxes = interactive
      .filter((el) => !el.closest('p, li, td, th, figcaption, blockquote'))
      .map((el) => ({ el, rect: el.getBoundingClientRect() }));
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i].rect;
        const b = boxes[j].rect;
        if (
          boxes[i].el.contains(boxes[j].el) ||
          boxes[j].el.contains(boxes[i].el)
        )
          continue;
        const gapX = Math.max(
          0,
          Math.max(a.left, b.left) - Math.min(a.right, b.right)
        );
        const gapY = Math.max(
          0,
          Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom)
        );
        const overlapping = gapX === 0 && gapY === 0;
        const tooClose = gapX + gapY > 0 && gapX < 8 && gapY < 8;
        if (overlapping || tooClose) {
          crowded.push({
            a: describe(boxes[i].el),
            b: describe(boxes[j].el),
            gap: Math.round(gapX + gapY),
          });
        }
      }
    }
  }
  if (crowded.length)
    add('crowded-tap-targets', {
      count: crowded.length,
      items: crowded.slice(0, 5),
    });

  // ── 5. Text too small to read ───────────────────────────────────────
  //
  // A mobile-ergonomics rule, scoped to mobile. A 10.4px annotation in a dense
  // reference table on a 1440px screen is a density choice somebody made on
  // purpose; the same size under a thumb, at arm's length, is not. Applying
  // the phone floor to desktop reported four deliberate decisions as defects.
  const tiny = [];
  if (
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth <= 640
  ) {
    for (const el of document.querySelectorAll('body *')) {
      if (!el.childNodes.length) continue;
      const hasOwnText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 3
      );
      if (!hasOwnText) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (isScreenReaderOnly(el)) continue;

      let size = Number.parseFloat(style.fontSize);
      if (!size) continue;

      /*
       * Inside an SVG, the declared font-size is in user units and scales with
       * the viewBox. A 10px label in a diagram scaled to twice its intrinsic
       * width renders at 20px, and reporting it as too small sends somebody to
       * enlarge text that is already comfortable. Measure the rendered height
       * and take the scale from it.
       */
      const svg = el.ownerSVGElement;
      if (svg) {
        const box = svg.getBoundingClientRect();
        const viewBox = svg.viewBox?.baseVal;
        if (!viewBox || viewBox.width <= 0 || box.width <= 0) continue;

        /*
         * The defect in a diagram is being scaled *down*, not the author's
         * choice of size. A 9px annotation is a deliberate decision a desktop
         * reader sees too; the same annotation rendered at 4px because the
         * figure was squeezed into a phone is a different thing entirely.
         *
         * So flag the scale, not the declared size — and say by how much.
         */
        const scale = box.width / viewBox.width;
        if (scale < 0.98) {
          tiny.push({
            selector: describe(el),
            declared: style.fontSize,
            renderedSize: `${(size * scale).toFixed(1)}px`,
            diagramScale: scale.toFixed(2),
            note: 'diagram scaled below 1:1 — text shrinks with it',
          });
        }
        continue;
      }

      if (size < minFont) {
        tiny.push({
          selector: describe(el),
          renderedSize: `${size.toFixed(1)}px`,
          declared: style.fontSize,
          text: el.textContent.trim().slice(0, 40),
        });
      }
    }
  }
  if (tiny.length)
    add('text-too-small', { count: tiny.length, items: tiny.slice(0, 6) });

  // ── 6. Images with no intrinsic size ────────────────────────────────
  const unsized = [];
  for (const img of document.querySelectorAll('img')) {
    const style = getComputedStyle(img);
    if (style.display === 'none') continue;
    const hasAttrs = img.hasAttribute('width') && img.hasAttribute('height');
    const hasAspect = style.aspectRatio && style.aspectRatio !== 'auto';
    if (!hasAttrs && !hasAspect) {
      unsized.push({
        selector: describe(img),
        src: (img.getAttribute('src') ?? '').slice(0, 60),
      });
    }
  }
  if (unsized.length)
    add('image-without-dimensions', {
      count: unsized.length,
      items: unsized.slice(0, 6),
    });

  // ── 7. Wide content with no scroll container ────────────────────────
  const uncontained = [];
  for (const el of document.querySelectorAll(
    'table, pre, iframe, video, svg'
  )) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) continue;
    if (
      el.scrollWidth <= el.clientWidth + tolerance &&
      rect.right <= viewportWidth + tolerance
    ) {
      continue;
    }
    let scrollable = ['auto', 'scroll'].includes(
      getComputedStyle(el).overflowX
    );
    for (let p = el.parentElement; p && !scrollable; p = p.parentElement) {
      if (['auto', 'scroll'].includes(getComputedStyle(p).overflowX))
        scrollable = true;
      if (p === document.body) break;
    }
    if (!scrollable) {
      uncontained.push({
        selector: describe(el),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        right: Math.round(rect.right),
      });
    }
  }
  if (uncontained.length) {
    add('wide-content-not-scrollable', {
      count: uncontained.length,
      items: uncontained.slice(0, 6),
    });
  }

  // ── 8. Fixed / sticky chrome on a short viewport ────────────────────
  let chromeHeight = 0;
  const chrome = [];
  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.position !== 'fixed' && style.position !== 'sticky') continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0 || rect.width < viewportWidth * 0.5) continue;
    if (rect.top > window.innerHeight) continue;
    chromeHeight += rect.height;
    chrome.push({
      selector: describe(el),
      height: Math.round(rect.height),
      position: style.position,
    });
  }
  if (chromeHeight > window.innerHeight * 0.25) {
    add('chrome-eats-viewport', {
      chromeHeight: Math.round(chromeHeight),
      viewportHeight: window.innerHeight,
      share: `${Math.round((chromeHeight / window.innerHeight) * 100)}%`,
      items: chrome,
    });
  }

  // ── 9. Line length outside the readable band ────────────────────────
  const badMeasure = [];
  for (const el of document.querySelectorAll('main p, article p, main li')) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || el.textContent.trim().length < 80) continue;
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    if (!size) continue;
    // ~0.5em per character is the usual approximation.
    const chars = Math.round(rect.width / (size * 0.5));
    if (chars > 115) {
      badMeasure.push({
        selector: describe(el),
        approxChars: chars,
        width: Math.round(rect.width),
      });
    }
  }
  if (badMeasure.length) {
    add('line-too-long', {
      count: badMeasure.length,
      items: badMeasure.slice(0, 4),
    });
  }

  // ── 10. Anything that scrolls sideways inside the page ──────────────
  const sideScrollers = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.scrollWidth <= el.clientWidth + tolerance) continue;
    const style = getComputedStyle(el);
    if (['auto', 'scroll'].includes(style.overflowX)) continue; // deliberate
    if (style.overflowX === 'hidden') {
      if (isScreenReaderOnly(el)) continue;
      // Hidden means content is being cut off rather than reachable.
      sideScrollers.push({
        selector: describe(el),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        clipped: el.scrollWidth - el.clientWidth,
      });
    }
  }
  if (sideScrollers.length) {
    add('content-clipped', {
      count: sideScrollers.length,
      items: sideScrollers.slice(0, 5),
    });
  }

  // ── 11. The viewport meta ───────────────────────────────────────────
  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    add('no-viewport-meta', {});
  } else {
    const content = meta.getAttribute('content') ?? '';
    if (
      /user-scalable\s*=\s*no/.test(content) ||
      /maximum-scale\s*=\s*1(?!\d)/.test(content)
    ) {
      add('zoom-disabled', { content });
    }
  }

  return findings;
};

// ── run ───────────────────────────────────────────────────────────────

const browser = await chromium.launch();
const results = [];
let checked = 0;

for (const viewport of activeViewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await context.newPage();

  for (const route of activeRoutes) {
    checked += 1;
    try {
      await page.goto(`${base}${route.url}`, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      });
      const findings = await page.evaluate(collect, {
        minTap: MIN_TAP,
        minFont: MIN_FONT,
        tolerance: OVERFLOW_TOLERANCE,
      });
      if (findings.length) {
        results.push({
          route: route.url,
          template: route.template,
          viewport: viewport.name,
          findings,
        });
      }
    } catch (error) {
      results.push({
        route: route.url,
        template: route.template,
        viewport: viewport.name,
        findings: [
          { type: 'load-error', message: String(error).slice(0, 160) },
        ],
      });
    }
  }

  await context.close();
  process.stderr.write(
    `  ${viewport.name.padEnd(20)} ${activeRoutes.length} routes\n`
  );
}

await browser.close();

// ── report ────────────────────────────────────────────────────────────

const byType = new Map();
for (const entry of results) {
  for (const finding of entry.findings) {
    const list = byType.get(finding.type) ?? [];
    list.push({ route: entry.route, viewport: entry.viewport, ...finding });
    byType.set(finding.type, list);
  }
}

console.log(`\n${'='.repeat(72)}`);
console.log(
  `Responsive audit — ${activeRoutes.length} routes × ${activeViewports.length} viewports = ${checked} page loads`
);
console.log('='.repeat(72));

if (byType.size === 0) {
  console.log('\nNo findings.\n');
} else {
  const ordered = [...byType.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );
  console.log('\nSummary\n');
  for (const [type, list] of ordered) {
    const routes = new Set(list.map((f) => f.route));
    const viewportsHit = new Set(list.map((f) => f.viewport));
    console.log(
      `  ${String(list.length).padStart(4)}  ${type.padEnd(30)} ${routes.size} route(s), ${viewportsHit.size} viewport(s)`
    );
  }

  console.log(`\n${'-'.repeat(72)}\nDetail\n`);
  for (const [type, list] of ordered) {
    console.log(`\n### ${type}  (${list.length})\n`);
    // One example per distinct route, so the output stays readable.
    const seen = new Set();
    for (const finding of list) {
      const key = `${finding.route}|${type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { route, viewport, type: _t, ...rest } = finding;
      console.log(`  ${route}  @ ${viewport}`);
      console.log(
        `  ${JSON.stringify(rest, null, 2).split('\n').join('\n  ')}\n`
      );
    }
  }
}

const outDir = join(ROOT, 'tmp', 'responsive-audit');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'full-audit.json');
writeFileSync(outFile, JSON.stringify({ checked, results }, null, 2));
console.log(`\nFull results: ${outFile.replace(`${ROOT}/`, '')}`);

process.exit(byType.size > 0 ? 1 : 0);
