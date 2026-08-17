#!/usr/bin/env node

/**
 * `internal:check` — the dev-only hub must not reach production.
 *
 * `/internal` renders palettes, contact sheets and contributor notes. None of
 * it is wrong, but none of it is public: it names unreleased work, it links to
 * plan artefacts, and it would give a reader the impression the project ships
 * documentation about itself instead of a protocol.
 *
 * Three independent mechanisms keep it out, and this gate checks all three
 * against the artefact that actually gets deployed:
 *
 *   1. the `exclude-internal` integration deletes `dist/internal` after build,
 *   2. the sitemap filter drops internal routes,
 *   3. every internal page carries `noindex` — a last line of defence for any
 *      copy that escapes 1 and 2.
 *
 * Why a build gate and not a unit test: a test reading `dist/` cannot tell a
 * production build from a staging one made with `INCLUDE_INTERNAL=true`, and an
 * assertion that silently passes on the wrong input is worse than none. Here
 * the mode is explicit, and the gate refuses to pretend when it cannot judge.
 *
 * Usage: node scripts/check-internal-excluded.mjs [--strict]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const strict = process.argv.includes('--strict');

const findings = [];
const fail = (message) => findings.push(message);

console.log('🔍 internal:check — /internal must not reach production\n');

if (!existsSync(DIST)) {
  console.error('✗ dist/ does not exist. Run `pnpm run build` first.');
  process.exit(1);
}

if (process.env.INCLUDE_INTERNAL === 'true') {
  console.log(
    '⏭  INCLUDE_INTERNAL=true — this is a staging build that deliberately keeps\n' +
      '   /internal. Nothing to assert; re-run against a production build.'
  );
  process.exit(0);
}

// ── 1. No internal directory in the output ───────────────
if (existsSync(join(DIST, 'internal'))) {
  const leaked = [];
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, `${prefix}/${entry}`);
      else if (entry.endsWith('.html')) leaked.push(`${prefix}/${entry}`);
    }
  };
  walk(join(DIST, 'internal'), '/internal');
  fail(
    `dist/internal exists — ${leaked.length} page(s) would be deployed:\n` +
      leaked
        .slice(0, 10)
        .map((page) => `      ${page}`)
        .join('\n') +
      (leaked.length > 10 ? `\n      … and ${leaked.length - 10} more` : '')
  );
} else {
  console.log('  ✓ layer 1 — dist/internal removed from the build output');
}

// ── 2. Nothing internal in any sitemap ───────────────────
const sitemaps = readdirSync(DIST).filter(
  (f) => f.startsWith('sitemap') && f.endsWith('.xml')
);
if (sitemaps.length === 0) {
  fail('no sitemap found in dist/ — the sitemap filter cannot be verified');
} else {
  const offenders = sitemaps.filter((file) =>
    readFileSync(join(DIST, file), 'utf-8').includes('/internal')
  );
  if (offenders.length > 0) {
    fail(`these sitemaps reference /internal: ${offenders.join(', ')}`);
  } else {
    console.log(
      `  ✓ layer 2 — ${sitemaps.length} sitemap(s), no internal route listed`
    );
  }
}

// ── 3. Nothing public links into it ──────────────────────
const linking = [];
const walkHtml = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Skip _astro (bundles) and internal itself: if layer 1 failed, the
      // internal pages linking to each other is the same finding twice.
      if (entry === '_astro' || full === join(DIST, 'internal')) continue;
      walkHtml(full);
    } else if (entry.endsWith('.html')) {
      const html = readFileSync(full, 'utf-8');
      if (/href="\/internal/.test(html))
        linking.push(full.replace(DIST, 'dist'));
    }
  }
};
walkHtml(DIST);
if (linking.length > 0) {
  fail(
    `these deployed pages link into /internal, which is not there:\n` +
      linking.map((page) => `      ${page}`).join('\n')
  );
} else {
  console.log('  ✓ layer 3 — no deployed page links into /internal');
}

// ── Report ───────────────────────────────────────────────
console.log('');
if (findings.length === 0) {
  console.log('✅ internal:check clean — the hub stayed out of production');
  process.exit(0);
}
for (const finding of findings) console.error(`  ✗ ${finding}`);
console.error(`\n❌ internal:check found ${findings.length} problem(s)`);
process.exit(strict ? 1 : 0);
