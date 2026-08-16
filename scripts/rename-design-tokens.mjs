#!/usr/bin/env node

/**
 * One-shot codemod: `ptt-*` design tokens -> `corag-*`.
 *
 * Kept in the repo as the record of how the rename was performed, and because
 * it is re-runnable and dry-runnable if the migration ever needs auditing.
 *
 * ORDER MATTERS. The rules run most-specific first:
 *
 *  1. The solid-fill button pair. `--color-corag-primary` flips wine -> rosa in
 *     dark mode, so `bg-ptt-primary` + `text-white` (55 occurrences) would ship
 *     white-on-rosa at ~1.5:1. Those pairs move to the non-flipping fill tokens
 *     instead. A blind rename here would ship an accessibility regression.
 *  2. `ptt-` -> `corag-`, which subsumes `--color-ptt-`, `--ptt-` and
 *     `data-ptt-` because each contains the `ptt-` substring.
 *  3. The short aliases (`text-ptt` with no trailing hyphen) — these need a
 *     negative lookahead so `text-ptt-secondary` is not corrupted by rule 3
 *     after rule 2 has already handled it.
 *  4. Identifiers and prose.
 *
 * Usage:
 *   node scripts/rename-design-tokens.mjs --dry-run
 *   node scripts/rename-design-tokens.mjs
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOTS = [
  'src',
  'tests',
  'docs',
  'scripts',
  'functions',
  '.agents',
  '.review',
  'public',
];
/** Root-level files that carry token references but are not inside a ROOT dir. */
const EXTRA_FILES = ['AGENTS.md', 'CLAUDE.md', 'README.md'];
const EXTS = new Set([
  '.astro',
  '.svelte',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.md',
  '.mdx',
  '.json',
  '.yaml',
  '.yml',
  '.html',
]);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.dwp',
  // Vendored third-party skills are upstream packages — never rewrite them.
  'deepworkplan',
  'ai-diff-reviewer',
  'dailybot',
]);

const DRY = process.argv.includes('--dry-run');
const SELF = 'rename-design-tokens.mjs';

/** Rule 1 — the fill pair, applied only inside strings that carry both halves. */
function fixFillPairs(text) {
  let hits = 0;
  const lines = text.split('\n').map((line) => {
    const hasFill = /\bbg-ptt-primary(?![-\w])/.test(line);
    const hasWhite = /\btext-white\b/.test(line);
    if (!hasFill || !hasWhite) return line;
    hits++;
    return line
      .replace(
        /\bhover:bg-ptt-primary-strong(?![-\w])/g,
        'hover:bg-corag-fill-strong'
      )
      .replace(/\bbg-ptt-primary-strong(?![-\w])/g, 'bg-corag-fill-strong')
      .replace(/\bhover:bg-ptt-primary(?![-\w])/g, 'hover:bg-corag-fill')
      .replace(/\bbg-ptt-primary(?![-\w])/g, 'bg-corag-fill')
      .replace(/\bhover:text-white\b/g, 'hover:text-corag-on-fill')
      .replace(/\btext-white\b/g, 'text-corag-on-fill');
  });
  return { text: lines.join('\n'), hits };
}

/** Rules 2–4 — straight patterns, longest first. */
const RULES = [
  /*
   * Rule 2a: three PTT token names have no 1:1 Corag counterpart, so they are
   * mapped explicitly BEFORE the generic rename. Without these, the codemod
   * would emit `corag-primary-dark` / `corag-accent-dark`, which are not
   * tokens — the utilities would silently resolve to nothing.
   *   primary-dark : "the dark-mode primary, always available" -> primary-light
   *   accent-dark  : the dark-mode accent -> `accent` already passes AA in dark
   */
  [/\bptt-primary-dark(?![-\w])/g, 'corag-primary-light'],
  [/\bptt-accent-dark(?![-\w])/g, 'corag-accent'],
  // Rule 2: covers ptt- utilities, --color-ptt-*, --ptt-*, data-ptt-*.
  [/ptt-/g, 'corag-'],
  // Rule 3: the short aliases, protected by a negative lookahead.
  [/\btext-ptt(?![-\w])/g, 'text-corag'],
  [/\bbg-ptt(?![-\w])/g, 'bg-corag'],
  [/\bborder-ptt(?![-\w])/g, 'border-corag'],
  [/--color-ptt(?![-\w])/g, '--color-corag'],
  // Rule 4: identifiers and prose.
  [/\bPTT_/g, 'CORAG_'],
  [/\bptt:/g, 'corag:'],
  [/\bPTT\b/g, 'Corag'],
  [/\bptt\b/g, 'corag'],
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

const files = [
  ...ROOTS.flatMap((r) => {
    try {
      return walk(resolve(r));
    } catch {
      return [];
    }
  }),
  ...EXTRA_FILES.map((f) => resolve(f)).filter((f) => {
    try {
      return statSync(f).isFile();
    } catch {
      return false;
    }
  }),
];

let changedFiles = 0;
const counts = { fillPairs: 0 };
for (const [re] of RULES) counts[re.source] = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  if (!/ptt|PTT/.test(original)) continue;

  const fill = fixFillPairs(original);
  counts.fillPairs += fill.hits;
  let text = fill.text;

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
console.log(
  `  fill-pair rewrites (bg-ptt-primary + text-white)  ${counts.fillPairs}`
);
for (const [re] of RULES) {
  console.log(`  ${re.source.padEnd(42)} ${counts[re.source]}`);
}
