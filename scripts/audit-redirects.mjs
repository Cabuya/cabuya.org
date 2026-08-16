/**
 * Redirect integrity audit.
 *
 * `public/_redirects` is the one file whose defects are invisible everywhere
 * else: it does not compile, no test imports it, and the site builds perfectly
 * with a rule that breaks a live page in production.
 *
 * Two invariants, both only checkable against the build:
 *
 *   dead-destination — a rule points at a page that does not exist, so the
 *                      redirect lands on a 404. Three rules did, pointing at
 *                      blog posts deleted with the previous site.
 *
 *   shadowed-page    — a *live page* appears as a redirect source. Cloudflare
 *                      matches the rule before serving the file, so the page
 *                      301s away from itself. `/about`, `/channels` and
 *                      `/contributors` each did this, and each would have
 *                      returned a 404 in production while working in dev.
 *
 * Both are reported as failures. A third check is informational: a destination
 * that is itself a redirect source chains, and Cloudflare does not follow
 * chains — the browser gets the intermediate hop.
 *
 * Usage:
 *   node scripts/audit-redirects.mjs            # report
 *   node scripts/audit-redirects.mjs --strict   # exit 1 on any failure
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DIST_DIR, findHtmlPages } from './lib/dist-pages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REDIRECTS = join(ROOT, 'public', '_redirects');

const STRICT = process.argv.slice(2).includes('--strict');

/** Normalize a path for comparison: no trailing slash, `/` stays `/`. */
const norm = (p) => p.replace(/\/+$/, '') || '/';

/** A destination we cannot resolve locally and should not judge. */
const isExternal = (target) =>
  /^https?:\/\//i.test(target) || target.startsWith('//');

/** Splat and placeholder rules resolve at request time, not here. */
const isDynamic = (value) => value.includes('*') || value.includes(':');

function parseRules(source) {
  const rules = [];
  source.split('\n').forEach((line, index) => {
    const text = line.trim();
    if (!text || text.startsWith('#')) return;
    const [from, to, status] = text.split(/\s+/);
    if (!from || !to) return;
    rules.push({ from, to, status: status ?? '', line: index + 1 });
  });
  return rules;
}

function main() {
  console.log('↪️  Redirect Integrity Audit\n');

  if (!existsSync(REDIRECTS)) {
    console.log('   No public/_redirects — nothing to audit.');
    return;
  }
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ not found. Run `pnpm run build` first.');
    process.exit(1);
  }

  /*
   * `findHtmlPages` returns every emitted page, including the ones the
   * completeness gate excludes — pagination, `/404`, the API endpoints. A
   * redirect pointing at any of those is still valid, so this audit wants the
   * unfiltered set rather than `collectPages`.
   */
  const live = new Set(findHtmlPages(DIST_DIR).map((page) => norm(`/${page}`)));
  live.add('/');

  const rules = parseRules(readFileSync(REDIRECTS, 'utf-8'));
  const sources = new Set(
    rules.filter((r) => !isDynamic(r.from)).map((r) => norm(r.from))
  );

  const dead = [];
  const shadowed = [];
  const chained = [];

  for (const rule of rules) {
    if (!isDynamic(rule.from) && live.has(norm(rule.from))) {
      shadowed.push(rule);
    }
    if (isExternal(rule.to) || isDynamic(rule.to)) continue;
    if (!live.has(norm(rule.to))) {
      dead.push(rule);
    } else if (sources.has(norm(rule.to))) {
      chained.push(rule);
    }
  }

  const report = (title, entries, arrow) => {
    if (entries.length === 0) return;
    console.log(`   ${title} (${entries.length}):\n`);
    for (const rule of entries) {
      console.log(
        `     _redirects:${rule.line}  ${rule.from} ${arrow} ${rule.to}`
      );
    }
    console.log('');
  };

  report('❌ Destinations that do not resolve', dead, '→');
  report('❌ Live pages shadowed by a redirect source', shadowed, '→');
  report(
    '⚠️  Chained redirects (Cloudflare does not follow chains)',
    chained,
    '→'
  );

  console.log(`   Rules parsed:       ${rules.length}`);
  console.log(`   Pages in the build: ${live.size}`);
  console.log(`   ❌ dead:            ${dead.length}`);
  console.log(`   ❌ shadowed:        ${shadowed.length}`);
  console.log(`   ⚠️  chained:         ${chained.length}`);
  console.log('━'.repeat(41));

  const failures = dead.length + shadowed.length;
  if (failures === 0) {
    console.log('\n✅ Every redirect resolves, and no live page is shadowed.');
  }
  if (STRICT && failures > 0) process.exit(1);
}

main();
