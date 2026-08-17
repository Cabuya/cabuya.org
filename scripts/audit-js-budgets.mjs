#!/usr/bin/env node

/**
 * `perf:budgets` — how much JavaScript each route actually ships.
 *
 * Reads the built site: for every page it collects the module scripts and
 * modulepreloads the HTML declares, follows their **static** imports
 * transitively, and gzips the union. That is the bytes a browser downloads
 * before the page is interactive.
 *
 * ## Why static imports only
 *
 * A dynamic `import()` is the whole point of a lazy chunk. The validator's
 * engine is 60 KB gzipped and is fetched on the first run, not on page load;
 * counting it against the validator page's budget would report a number no
 * visitor experiences and would push somebody to "fix" it by making the page
 * worse.
 *
 * The trade is that this cannot see a chunk fetched later. That is stated here
 * rather than hidden, and the browser measurement in
 * `analysis_results/PERF_A11Y_BASELINE.md` is the check on it.
 *
 * ## Why gzip
 *
 * Because that is what crosses the network. Raw bytes overstate by roughly 3×
 * and would have this gate failing on numbers nobody pays.
 *
 * Usage: node scripts/audit-js-budgets.mjs [--strict] [--json]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const strict = process.argv.includes('--strict');
const asJson = process.argv.includes('--json');

/**
 * The budgets, in gzipped kilobytes, from `docs/PERFORMANCE.md`.
 *
 * `chrome` is not in that table and is the honest name for what the
 * documentation-page row means. The row says *0 KB unless it carries an
 * island*; every page carries the header island, which is the site's
 * navigation and is not optional. So the number a documentation page is held
 * to is "the shared chrome and nothing else", and the budget is set just above
 * what the chrome costs so that adding an island to a docs page fails here.
 */
const BUDGETS = [
  { kind: 'landing', pattern: /^\/(es\/)?$/, budgetKb: 40 },
  {
    kind: 'validator',
    pattern: /^\/(es\/)?developers\/validator\/$/,
    budgetKb: 90,
  },
  {
    kind: 'registry',
    pattern: /^\/(es\/)?registry(\/|\/[^/]+\/)$/,
    budgetKb: 60,
  },
  { kind: 'documentation', pattern: /.*/, budgetKb: 30 },
];

const budgetFor = (route) => BUDGETS.find(({ pattern }) => pattern.test(route));

// ── The chunk graph ───────────────────────────────────────

/** Static `import`/`export … from` specifiers in a built chunk. */
function staticImports(source) {
  const specifiers = [];
  const patterns = [
    /\bimport\s*(?:[\w*{},\s]+\s*from\s*)?["']([^"']+)["']/g,
    /\bexport\s*(?:[\w*{},\s]+)\s*from\s*["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
}

const chunkCache = new Map();

function chunkBytes(file) {
  if (!chunkCache.has(file)) {
    const buffer = readFileSync(file);
    chunkCache.set(file, {
      gz: gzipSync(buffer).length,
      source: buffer.toString('utf-8'),
    });
  }
  return chunkCache.get(file);
}

/** Every chunk reachable from an entry through static imports. */
function reachable(entryPath, seen = new Set()) {
  const absolute = resolve(entryPath);
  if (seen.has(absolute) || !existsSync(absolute)) return seen;
  seen.add(absolute);

  for (const specifier of staticImports(chunkBytes(absolute).source)) {
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
    const target = specifier.startsWith('/')
      ? join(DIST, specifier)
      : resolve(dirname(absolute), specifier);
    reachable(target, seen);
  }
  return seen;
}

// ── Pages ─────────────────────────────────────────────────

function htmlPages(dir = DIST, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlPages(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

/**
 * Every script the page will fetch: module entries, preloads, and islands.
 *
 * The islands are the ones that matter and the ones easiest to miss. Astro does
 * not emit a `<script src>` for a hydrated component — it emits an
 * `<astro-island>` element carrying `component-url` and `renderer-url`, and the
 * client runtime fetches those. A version of this script that only read
 * `<script type="module">` reported **1.1 KB for every route on the site**
 * while a browser measured 24, which is worse than having no gate: it would
 * have passed anything.
 */
function entryScripts(html) {
  const found = new Set();
  const patterns = [
    /<script[^>]+type="module"[^>]+src="([^"]+)"/g,
    /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g,
    /component-url="([^"]+)"/g,
    /renderer-url="([^"]+)"/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) found.add(match[1]);
  }
  return [...found].filter((src) => src.startsWith('/'));
}

console.log('📦 perf:budgets — JavaScript per route, gzipped\n');

if (!existsSync(DIST)) {
  console.error('  ✗ dist/ not found — run `pnpm run build` first');
  process.exit(strict ? 1 : 0);
}

const results = [];
for (const file of htmlPages().sort()) {
  const route = `/${file.slice(DIST.length + 1, -'index.html'.length)}`;
  const html = readFileSync(file, 'utf-8');

  const chunks = new Set();
  for (const src of entryScripts(html)) {
    for (const chunk of reachable(join(DIST, src))) chunks.add(chunk);
  }

  const bytes = [...chunks].reduce(
    (total, chunk) => total + chunkBytes(chunk).gz,
    0
  );
  const budget = budgetFor(route);
  results.push({
    route,
    kind: budget.kind,
    kb: bytes / 1024,
    budgetKb: budget.budgetKb,
    chunks: chunks.size,
  });
}

const over = results.filter((entry) => entry.kb > entry.budgetKb);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const worst = new Map();
  for (const entry of results) {
    const current = worst.get(entry.kind);
    if (!current || entry.kb > current.kb) worst.set(entry.kind, entry);
  }

  for (const [kind, entry] of worst) {
    const verdict = entry.kb > entry.budgetKb ? '✗' : '✓';
    console.log(
      `  ${verdict} ${kind.padEnd(14)} worst: ${entry.kb.toFixed(1).padStart(6)} KB / ${String(entry.budgetKb).padStart(3)} KB   ${entry.route}`
    );
  }
  console.log(`\n  ${results.length} routes measured`);
}

if (over.length === 0) {
  console.log('\n✅ every route is inside its budget');
  process.exit(0);
}

console.error('\n❌ over budget:\n');
for (const entry of over) {
  console.error(
    `  ${entry.route} — ${entry.kb.toFixed(1)} KB, budget ${entry.budgetKb} KB (${entry.kind})`
  );
}
process.exit(strict ? 1 : 0);
