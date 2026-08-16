#!/usr/bin/env node

/**
 * One-shot codemod: `corag-*` design tokens -> `cabuya-*`.
 *
 * Kept in the repo as the record of how the rename was performed, and because
 * it is re-runnable and dry-runnable if the migration ever needs auditing.
 * (This file previously recorded the `ptt-*` -> `corag-*` rename; this is the
 * same mechanism retargeted for the Cabuya migration — Task 3 of
 * PLAN_cabuya_website_and_skill.)
 *
 * ORDER MATTERS. The rules run most-specific first:
 *
 *  1. `corag-rosa(-soft)` -> `cabuya-seedling(-soft)`. Rosa was Corag's
 *     light-brand tone (used as display text on dark canvases). Cabuya's
 *     analog is the pale-green "seedling" tint — a different name because it
 *     is a different thing, and a blind `cabuya-rosa` would be a lie in the
 *     token table.
 *  2. `corag-` -> `cabuya-`, which subsumes `--color-corag-`, `--radius-corag-`,
 *     `--shadow-corag-` and every generated utility.
 *  3. The short aliases (`text-corag` with no trailing hyphen) — protected by
 *     a negative lookahead so rule 2's output is not corrupted.
 *
 * Deliberately NOT renamed (unlike the ptt run):
 *   - The word "Corag" in prose. The site's *content* is still Corag's until
 *     Task 7 decommissions it, and `docs/context/` is a historical record that
 *     must never be rewritten. Scope is therefore code surfaces only.
 *
 * Usage:
 *   node scripts/rename-design-tokens.mjs --dry-run
 *   node scripts/rename-design-tokens.mjs
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

/** Code surfaces only — docs/ and .agents/ are rewritten by Tasks 4–6. */
const ROOTS = ['src', 'tests', 'functions', 'public'];
const EXTS = new Set([
  '.astro',
  '.svelte',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
]);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.dwp']);

const DRY = process.argv.includes('--dry-run');
const SELF = 'rename-design-tokens.mjs';

/** Rules, longest / most specific first. */
const RULES = [
  // Rule 1: rosa -> seedling (semantic rename, before the generic sweep).
  [/corag-rosa-soft(?![-\w])/g, 'cabuya-seedling-soft'],
  [/corag-rosa(?![-\w])/g, 'cabuya-seedling'],
  // Rule 2: the generic sweep — utilities, --color-*, --radius-*, --shadow-*.
  [/corag-/g, 'cabuya-'],
  // Rule 3: short aliases (`text-corag`, `--color-corag`), lookahead-guarded.
  [/\btext-corag(?![-\w])/g, 'text-cabuya'],
  [/\bbg-corag(?![-\w])/g, 'bg-cabuya'],
  [/\bborder-corag(?![-\w])/g, 'border-cabuya'],
  [/--color-corag(?![-\w])/g, '--color-cabuya'],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXTS.has(extname(entry)) && !full.endsWith(SELF)) out.push(full);
  }
  return out;
}

const files = ROOTS.flatMap((r) => {
  try {
    return walk(resolve(r));
  } catch {
    return [];
  }
});

let changedFiles = 0;
const counts = {};
for (const [re] of RULES) counts[re.source] = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  if (!/corag/.test(original)) continue;

  let text = original;
  for (const [re, to] of RULES) {
    const matches = text.match(re);
    if (matches) counts[re.source] += matches.length;
    text = text.replace(re, to);
  }

  if (text !== original) {
    changedFiles++;
    if (!DRY) writeFileSync(file, text);
  }
}

console.log(
  `${DRY ? 'DRY RUN — ' : ''}${changedFiles} files ${DRY ? 'would change' : 'changed'}\n`
);
for (const [re] of RULES) {
  console.log(`  ${re.source.padEnd(42)} ${counts[re.source]}`);
}
