#!/usr/bin/env node
/**
 * Layout audit across the responsive matrix.
 *
 * `capture.mjs` produces screenshots a human reviews; `find-overflow.mjs`
 * pinpoints one URL at one width. This one is the automated sweep: it walks
 * `urls.json` × `viewports.json` and reports what actually breaks on a real
 * device — horizontal overflow (with the culprit element), text clipped by its
 * own box, interactive targets below the 24px WCAG 2.2 AA minimum, text below
 * 12px, images missing dimensions or rendered at a distorted aspect ratio,
 * heading-hierarchy breaks, and overlapping interactive elements.
 *
 * Known-benign patterns are filtered so the output stays actionable: the
 * visually-hidden skip link, and the blog card's stretched-overlay-plus-chips
 * pattern (verified clickable via elementFromPoint).
 *
 * Usage:
 *   pnpm run responsive:audit
 *   node scripts/responsive-audit/audit-layout.mjs --base=http://localhost:7777
 *   node scripts/responsive-audit/audit-layout.mjs --quick     # key viewports only
 *   node scripts/responsive-audit/audit-layout.mjs --strict    # exit 1 on findings
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const ROOT = resolve(import.meta.dirname, '../..');
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const urlsConfig = JSON.parse(
  await readFile(resolve(ROOT, 'scripts/responsive-audit/urls.json'), 'utf8')
);
const allViewports = JSON.parse(
  await readFile(
    resolve(ROOT, 'scripts/responsive-audit/viewports.json'),
    'utf8'
  )
);

const BASE = args.get('base') || urlsConfig.baseUrl;
const QUICK = args.has('quick');
const STRICT = args.has('strict');

// Quick mode keeps the widths where layout actually changes.
const QUICK_NAMES = new Set([
  'foldable-folded',
  'phone-narrow',
  'phone-standard',
  'phone-landscape',
  'tablet-portrait',
  'tablet-landscape',
  'laptop-small',
  'laptop-standard',
  'desktop-fhd',
]);
const viewports = QUICK
  ? allViewports.filter((v) => QUICK_NAMES.has(v.name))
  : allViewports;

/** WCAG 2.2 AA 2.5.8 — Target Size (Minimum). */
const MIN_TARGET = 24;
/** Legibility floor for body-adjacent text. */
const MIN_FONT_PX = 12;

/**
 * Patterns that are deliberate, verified, and would otherwise flood the
 * report. Each needs a reason — an unexplained mute is how a real bug hides.
 */
const isBenign = (finding) =>
  // Visually-hidden skip link: 1x1 by design, expands on focus.
  (finding.el.includes('sr-only') &&
    (finding.type === 'touch-target' || finding.type === 'text-clipped')) ||
  // Blog/preview cards use a stretched overlay link with chips raised above
  // it; the chips receive their own clicks (verified with elementFromPoint).
  (finding.type === 'overlap' && finding.el.includes('a.absolute'));

const audit = ({ minTarget, minFont }) => {
  const vw = document.documentElement.clientWidth;
  const findings = [];
  const label = (el) => {
    const cls =
      typeof el.className === 'string'
        ? el.className.trim().split(/\s+/)[0]
        : '';
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}${txt ? ` "${txt}"` : ''}`;
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0')
      return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const add = (type, el, detail) => findings.push({ type, el, detail });

  // 1. Horizontal overflow, with the culprit isolated.
  const docOverflow =
    document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (docOverflow > 0) {
    let named = false;
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const bleeds = r.right > vw + 1 || r.left < -1;
      const spills = el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0;
      if (!bleeds && !spills) continue;
      // an ancestor that clips makes decorative bleed harmless
      let clipped = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflow !== 'visible' || ps.overflowX !== 'visible') {
          clipped = true;
          break;
        }
      }
      const s = getComputedStyle(el);
      if (spills && (s.overflowX === 'auto' || s.overflowX === 'scroll'))
        continue; // deliberately scrollable (code blocks, tables)
      if (clipped && bleeds && !spills) continue;
      if (el.children.length === 0 || bleeds) {
        add(
          'overflow-x',
          label(el),
          `doc +${docOverflow}px · box L${Math.round(r.left)} R${Math.round(r.right)} vw${vw}`
        );
        named = true;
      }
    }
    if (!named)
      add(
        'overflow-x',
        '(document)',
        `+${docOverflow}px, culprit not isolated`
      );
  }

  // 2. Text truncated by its own box.
  for (const el of document.querySelectorAll(
    'p,h1,h2,h3,h4,li,a,button,span,td,th,dt,dd,figcaption,time,label'
  )) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    if (s.overflowX === 'auto' || s.overflowX === 'scroll') continue;
    if (
      el.scrollWidth > el.clientWidth + 2 &&
      el.clientWidth > 0 &&
      (s.overflow === 'hidden' || s.textOverflow === 'ellipsis')
    )
      add(
        'text-clipped',
        label(el),
        `${el.scrollWidth}px in ${el.clientWidth}px`
      );
  }

  // 3. Interactive targets under the WCAG minimum (inline prose links exempt).
  for (const el of document.querySelectorAll(
    'a,button,input,select,textarea,[role="button"]'
  )) {
    if (!visible(el)) continue;
    if (el.type === 'hidden' || el.getAttribute('tabindex') === '-1') continue;
    const s = getComputedStyle(el);
    const inlineInProse =
      el.tagName === 'A' &&
      s.display === 'inline' &&
      ['P', 'LI', 'DD', 'SPAN'].includes(el.parentElement?.tagName);
    if (inlineInProse) continue;
    const r = el.getBoundingClientRect();
    if (r.height < minTarget || r.width < minTarget)
      add(
        'touch-target',
        label(el),
        `${Math.round(r.width)}x${Math.round(r.height)} (min ${minTarget})`
      );
  }

  // 4. Text below the legibility floor.
  for (const el of document.querySelectorAll(
    'p,li,span,a,td,th,dd,dt,figcaption,time,small,label,button,h1,h2,h3'
  )) {
    if (!visible(el)) continue;
    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
    if (!hasOwnText) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < minFont) add('tiny-text', label(el), `${fs}px (min ${minFont})`);
  }

  // 5. Images: dimensions and aspect ratio.
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue;
    if (!img.getAttribute('width') || !img.getAttribute('height'))
      add('img-no-dims', label(img), img.currentSrc || img.src);
    const r = img.getBoundingClientRect();
    if (img.naturalWidth && getComputedStyle(img).objectFit === 'fill') {
      const natural = img.naturalWidth / img.naturalHeight;
      const rendered = r.width / r.height;
      if (Math.abs(natural - rendered) / natural > 0.03)
        add(
          'img-distorted',
          label(img),
          `natural ${natural.toFixed(2)} vs rendered ${rendered.toFixed(2)}`
        );
    }
  }

  // 6. Heading hierarchy.
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(visible)
    .map((h) => Number(h.tagName[1]));
  const h1s = levels.filter((n) => n === 1).length;
  if (h1s !== 1) add('h1-count', '(document)', `${h1s} h1 elements`);
  for (let i = 1; i < levels.length; i++)
    if (levels[i] - levels[i - 1] > 1)
      add('heading-skip', '(document)', `h${levels[i - 1]} -> h${levels[i]}`);

  // 7. Overlapping interactive elements (ambiguous taps).
  const interactive = [...document.querySelectorAll('a,button')].filter(
    visible
  );
  for (let i = 0; i < interactive.length; i++)
    for (let j = i + 1; j < interactive.length; j++) {
      const [a, b] = [interactive[i], interactive[j]];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ox > 4 && oy > 4)
        add(
          'overlap',
          `${label(a)} ∩ ${label(b)}`,
          `${Math.round(ox)}x${Math.round(oy)}px`
        );
    }

  return findings;
};

const browser = await chromium.launch();
const results = [];
let checks = 0;

for (const route of urlsConfig.routes) {
  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor ?? 1,
      isMobile: vp.isMobile ?? false,
      hasTouch: vp.isMobile ?? false,
    });
    try {
      await page.goto(`${BASE}${route.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      // settle lazy images and scroll reveals before measuring
      await page.evaluate(async () => {
        for (
          let y = 0;
          y < document.body.scrollHeight;
          y += window.innerHeight
        ) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 150));
      });
      const found = await page.evaluate(audit, {
        minTarget: MIN_TARGET,
        minFont: MIN_FONT_PX,
      });
      checks++;
      for (const f of found)
        if (!isBenign(f))
          results.push({
            url: route.url,
            vp: vp.name,
            size: `${vp.width}x${vp.height}`,
            ...f,
          });
    } catch (error) {
      results.push({
        url: route.url,
        vp: vp.name,
        size: `${vp.width}x${vp.height}`,
        type: 'ERROR',
        el: '-',
        detail: error.message.slice(0, 90),
      });
    }
    await page.close();
  }
  process.stderr.write(`  audited ${route.url}\n`);
}
await browser.close();

console.log('\nResponsive layout audit');
console.log('=======================');
console.log(
  `${urlsConfig.routes.length} routes x ${viewports.length} viewports = ${checks} page loads\n`
);

if (results.length === 0) {
  console.log('✅ No findings.');
  process.exit(0);
}

const byType = {};
for (const r of results) {
  byType[r.type] ??= [];
  byType[r.type].push(r);
}
for (const [type, rows] of Object.entries(byType).sort(
  (a, b) => b[1].length - a[1].length
)) {
  console.log(`\n## ${type} (${rows.length})`);
  // Element labels contain spaces, so group on a separator they cannot hold.
  const SEP = ' :: ';
  const grouped = {};
  for (const r of rows) {
    const key = `${r.el}${SEP}${r.detail}`;
    grouped[key] ??= [];
    grouped[key].push(`${r.url}@${r.size}`);
  }
  for (const [key, where] of Object.entries(grouped)) {
    const [el, detail] = key.split(SEP);
    console.log(`  • ${el}`);
    console.log(`    ${detail}`);
    console.log(
      `    ${where.length} case(s): ${where.slice(0, 4).join(', ')}${where.length > 4 ? ` +${where.length - 4}` : ''}`
    );
  }
}
console.log(`\n${results.length} findings total.`);
if (STRICT) process.exit(1);
