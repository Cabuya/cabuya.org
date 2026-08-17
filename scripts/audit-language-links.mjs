/**
 * Cross-language link correspondence audit.
 *
 * Four gates already guard the bilingual surface, and none of them asks this
 * question:
 *
 *   `lang:check`    — each page renders the language its URL promises
 *   `parity:check`  — both languages carry the same authored content
 *   `md:check`      — each page has a complete `.md` twin
 *   `seo:check`     — each page's own head tags are well formed
 *
 * A reader can still get stranded. The switcher on `/es/developers/spec/` can
 * point at a URL that does not exist; `/es/registry/` can link onward to
 * `/developers/` and drop a Spanish reader into English mid-journey; the
 * `hreflang` pair can name a partner that does not name it back. Every one of
 * those leaves all four gates green.
 *
 * That is the shape of the S2 finding in the Task 50 security review — twelve
 * links resolving to nothing, on the surface built for agents, with nothing
 * able to catch them because each gate was correct about its own concern.
 *
 * Usage:
 *   node scripts/audit-language-links.mjs
 *   node scripts/audit-language-links.mjs --json
 *   node scripts/audit-language-links.mjs --strict   # exit 1 on any defect
 *
 * Page discovery is shared with the other three audits (./lib/dist-pages.mjs)
 * so they cannot disagree about which pages exist.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  collectPages,
  DIST_DIR,
  htmlPathFor,
  shouldExclude,
} from './lib/dist-pages.mjs';

const STRICT = process.argv.includes('--strict');
const JSON_OUT = process.argv.includes('--json');

/**
 * Routes served once for both languages, so a `/es` counterpart is correct to
 * be absent. `llms.txt` is a single agent-facing index at the root; the 404 is
 * served by the platform for any unmatched path.
 *
 * Kept in step with `LANGUAGE_NEUTRAL_ROUTES` in the switcher by
 * `tests/unit/content/language-links.test.ts`.
 */
const LANGUAGE_NEUTRAL = new Set([
  '/llms.txt',
  '/llms-full.txt',
  '/404',
  '/robots.txt',
  '/sitemap-index.xml',
  '/openapi.json',
]);

// ── URL helpers ───────────────────────────────────────────

/** `index` → `/`; `es/registry` → `/es/registry/`. */
const toUrl = (pagePath) =>
  pagePath === 'index' ? '/' : `/${pagePath.replace(/\/$/, '')}/`;

const isSpanish = (url) => url === '/es/' || url.startsWith('/es/');

/** The counterpart URL in the other language. Pure string work — D-W1 makes
 *  the two trees mirror images, so the mapping is a prefix, not a lookup. */
function counterpartOf(url) {
  if (isSpanish(url)) {
    const bare = url.replace(/^\/es/, '');
    return bare === '' || bare === '/' ? '/' : bare;
  }
  return url === '/' ? '/es/' : `/es${url}`;
}

/**
 * A URL that names a file rather than a directory, so no trailing slash
 * belongs on it. Tested against the last segment: `0.1` is a version segment
 * in `/developers/spec/0.1/`, not an extension, and a bare `includes('.')`
 * reported 26 correct switcher links as defects.
 */
const namesAFile = (url) => /\.[a-z0-9]{2,5}$/i.test(url);

/** Trailing-slash form, unless the URL names a file. */
const normalizeUrl = (url) =>
  url.endsWith('/') || namesAFile(url) ? url : `${url}/`;

/** Does this URL resolve to something in the build? */
function resolves(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (clean === '/') return existsSync(join(DIST_DIR, 'index.html'));
  const rel = clean.replace(/^\//, '').replace(/\/$/, '');
  return (
    existsSync(join(DIST_DIR, rel)) ||
    existsSync(join(DIST_DIR, `${rel}.html`)) ||
    existsSync(join(DIST_DIR, rel, 'index.html'))
  );
}

// ── HTML extraction ───────────────────────────────────────

const attr = (tag, name) =>
  tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1] ?? null;

function hreflangsOf(html) {
  const out = [];
  for (const tag of html.match(/<link[^>]+hreflang=[^>]*>/gi) ?? []) {
    const lang = attr(tag, 'hreflang');
    const href = attr(tag, 'href');
    if (lang && href) out.push({ lang, href });
  }
  return out;
}

/** Internal hrefs rendered inside `<main>`, chrome excluded.
 *
 *  The header, footer and language switcher are deliberately skipped: the
 *  switcher's whole job is to cross languages, and the footer carries
 *  language-neutral links. Flagging those would bury the finding that matters
 *  — a body link that strands the reader. */
function bodyLinksOf(html) {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/i)?.[1] ?? '';
  const body = main
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ');
  const out = new Set();
  for (const tag of body.match(/<a[^>]+href=[^>]*>/gi) ?? []) {
    const href = attr(tag, 'href');
    if (!href) continue;
    if (!href.startsWith('/')) continue; // external, anchor, or mailto
    out.add(href.split('#')[0].split('?')[0]);
  }
  return [...out];
}

/** The `href` the language switcher offers. Marked in the markup so this audit
 *  does not have to guess which of the header's links is the switcher. */
function switcherTargetOf(html) {
  const tag = html.match(/<a[^>]*data-language-switch[^>]*>/i)?.[0];
  return tag ? attr(tag, 'href') : null;
}

// ── The audit ─────────────────────────────────────────────

const pages = collectPages().checkable.map((path) => ({
  path,
  url: toUrl(path),
}));

/*
 * An audit that measured nothing must not report success. `dist/` was emptied
 * mid-run once during this work and this script printed its green summary over
 * zero pages — the one failure mode that makes a gate worse than no gate.
 */
if (pages.length === 0) {
  console.error(
    '\n❌ No pages found in dist/. Run `pnpm run build` first.\n' +
      '   A green result over zero pages would be a false pass.\n'
  );
  process.exit(1);
}

const built = new Set(pages.map((p) => p.url));
const findings = [];
const record = (type, url, detail) => findings.push({ type, url, detail });

for (const page of pages) {
  const html = readFileSync(htmlPathFor(page.path), 'utf-8');
  const { url } = page;
  const counterpart = counterpartOf(url);
  const neutral = LANGUAGE_NEUTRAL.has(url.replace(/\/$/, '')) || url === '/';

  // 1. The counterpart exists at all.
  if (!neutral && !built.has(counterpart)) {
    record(
      'missing-counterpart',
      url,
      `no ${isSpanish(url) ? 'English' : 'Spanish'} version at ${counterpart}`
    );
  }

  // 2. The switcher points at it, and the target resolves.
  const target = switcherTargetOf(html);
  if (target === null) {
    record('no-switcher', url, 'no element carries data-language-switch');
  } else {
    const normalized = normalizeUrl(target);
    if (!resolves(normalized)) {
      record(
        'switcher-404',
        url,
        `switcher points at ${target}, which is not built`
      );
    } else if (!neutral && normalized !== counterpart) {
      record(
        'switcher-wrong-target',
        url,
        `switcher points at ${normalized}, expected ${counterpart}`
      );
    }
  }

  // 3. hreflang: self-referential, reciprocal, and pointing at built pages.
  const hreflangs = hreflangsOf(html);
  const langs = new Set(hreflangs.map((h) => h.lang));
  if (!neutral) {
    for (const required of ['en', 'es', 'x-default']) {
      if (!langs.has(required)) {
        record('hreflang-missing', url, `no hreflang="${required}"`);
      }
    }
  }
  for (const { lang, href } of hreflangs) {
    const path = href.replace(/^https?:\/\/[^/]+/, '') || '/';
    if (!resolves(path)) {
      record(
        'hreflang-404',
        url,
        `hreflang="${lang}" points at ${path}, not built`
      );
      continue;
    }
    // Reciprocity: the page it names must name this page back.
    if (lang === 'x-default') continue;
    const partner = pages.find((p) => p.url === path);
    if (!partner) continue;
    const partnerHtml = readFileSync(htmlPathFor(partner.path), 'utf-8');
    const back = hreflangsOf(partnerHtml).some(
      (h) => (h.href.replace(/^https?:\/\/[^/]+/, '') || '/') === url
    );
    if (!back) {
      record(
        'hreflang-not-reciprocal',
        url,
        `${path} does not link back to ${url}`
      );
    }
  }

  // 4. Body links must not strand the reader. A Spanish page linking to an
  //    English URL that HAS a Spanish version is the defect; linking to one
  //    that genuinely has no counterpart is not.
  for (const href of bodyLinksOf(html)) {
    if (shouldExclude(href.replace(/^\//, '').replace(/\/$/, ''))) continue;
    const normalized = normalizeUrl(href);
    if (!resolves(normalized)) {
      record('body-link-404', url, `links to ${href}, which is not built`);
      continue;
    }
    if (LANGUAGE_NEUTRAL.has(normalized.replace(/\/$/, ''))) continue;
    if (isSpanish(url) !== isSpanish(normalized)) {
      const sibling = counterpartOf(normalized);
      if (built.has(sibling)) {
        record(
          'cross-language-link',
          url,
          `links to ${normalized} but ${sibling} exists in this page's language`
        );
      }
    }
  }
}

// ── Report ────────────────────────────────────────────────

const byType = new Map();
for (const f of findings) {
  if (!byType.has(f.type)) byType.set(f.type, []);
  byType.get(f.type).push(f);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ pages: pages.length, findings }, null, 2));
} else {
  console.log('\n🔗 Cross-language link correspondence\n');
  console.log(`   ${pages.length} pages walked\n`);
  if (findings.length === 0) {
    console.log('✅ Every counterpart exists, every switcher resolves, every');
    console.log(
      '   hreflang pair is reciprocal, and no body link strands a reader.\n'
    );
  } else {
    for (const [type, list] of [...byType].sort(
      (a, b) => b[1].length - a[1].length
    )) {
      console.log(`\n### ${type}  (${list.length})\n`);
      for (const f of list.slice(0, 12))
        console.log(`   ${f.url}\n      ${f.detail}`);
      if (list.length > 12) console.log(`   … and ${list.length - 12} more`);
    }
    console.log(
      `\n❌ ${findings.length} finding(s) across ${byType.size} class(es)\n`
    );
  }
}

process.exit(STRICT && findings.length > 0 ? 1 : 0);
