#!/usr/bin/env node

/**
 * `prose:check` — the reading surface must use the palette.
 *
 * Every Markdown-rendered page on this site is styled by the typography
 * plugin through its `--tw-prose-*` variables, and `src/styles/global.css`
 * points each of them at a Cabuya token so prose inherits the palette,
 * including the dark-mode flip.
 *
 * ## Why this exists
 *
 * That mapping lived inside `@layer components` and silently did nothing.
 * Tailwind 4 registers `.prose` as a utility, utilities come after components,
 * and so every declaration lost to the plugin's own defaults. The result was
 * `oklch(37.3%)` body text on a `#082a24` background in dark mode — roughly
 * 1.5:1, unreadable — on the specification, the quickstart and every portal
 * prose page.
 *
 * It survived review because in light mode the plugin's defaults look about
 * right: a dark grey on a near-white page reads fine, and nobody compares it
 * to the token it was supposed to be. That is precisely the kind of failure a
 * gate is for — one that is invisible in the mode developers work in and
 * catastrophic in the one they do not.
 *
 * So this reads the **compiled** stylesheet, not the source: the question is
 * not what we wrote, it is which declaration wins. For each prose variable it
 * finds the last one to be declared and asserts that it references a
 * `--color-cabuya-*` token.
 *
 * Usage: node scripts/check-prose-tokens.mjs [--strict]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const strict = process.argv.includes('--strict');

/**
 * The variables that carry text and border colour.
 *
 * `pre-bg` and `pre-code` are included: a code block whose background stops
 * following the palette is the same defect in a smaller area.
 */
const GUARDED = [
  'body',
  'headings',
  'lead',
  'links',
  'bold',
  'counters',
  'bullets',
  'hr',
  'quotes',
  'quote-borders',
  'captions',
  'code',
  'pre-code',
  'pre-bg',
  'th-borders',
  'td-borders',
];

console.log('🔍 prose:check — the reading surface uses the palette\n');

const cssDir = join(ROOT, 'dist/_astro');
if (!existsSync(cssDir)) {
  console.error('  ✗ dist/_astro not found — run `pnpm run build` first');
  process.exit(strict ? 1 : 0);
}

const sheets = readdirSync(cssDir).filter((file) => file.endsWith('.css'));
if (sheets.length === 0) {
  console.error('  ✗ no compiled stylesheet in dist/_astro');
  process.exit(strict ? 1 : 0);
}

const css = sheets
  .map((file) => readFileSync(join(cssDir, file), 'utf-8'))
  .join('\n');

const findings = [];

for (const name of GUARDED) {
  for (const prefix of ['--tw-prose-', '--tw-prose-invert-']) {
    const variable = `${prefix}${name}`;
    /*
     * Every declaration of this variable, in source order. The last one is the
     * one that wins for rules of equal specificity — and since ours is
     * unlayered and the plugin's is not, ours must also be the last.
     */
    const pattern = new RegExp(`${variable}\\s*:\\s*([^;}]+)`, 'g');
    const values = [...css.matchAll(pattern)].map((match) => match[1].trim());

    if (values.length === 0) {
      findings.push(`${variable}: never declared`);
      continue;
    }

    const winner = values[values.length - 1];
    if (!winner.includes('--color-cabuya-')) {
      findings.push(
        `${variable}: last declaration is "${winner}", not a Cabuya token`
      );
    }
  }
}

/*
 * The mapping must also be unlayered. A future edit that moves it back inside
 * `@layer components` would restore the original bug, and the check above
 * would not necessarily catch it — source order and layer order are different
 * questions, and the layer is the one that decided this last time.
 */
const source = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf-8');
const mappingIndex = source.indexOf('--tw-prose-body:');
if (mappingIndex === -1) {
  findings.push('global.css: the prose token mapping is gone');
} else {
  const before = source.slice(0, mappingIndex);
  const opens = (before.match(/@layer\s+\w+\s*\{/g) ?? []).length;
  // Count braces to see whether we are still inside any layer at that point.
  let depth = 0;
  let insideLayer = false;
  const layerStarts = [...before.matchAll(/@layer\s+\w+\s*\{/g)].map(
    (match) => match.index ?? 0
  );
  for (const start of layerStarts) {
    depth = 0;
    for (let i = start; i < mappingIndex; i += 1) {
      if (before[i] === '{') depth += 1;
      else if (before[i] === '}') depth -= 1;
      if (depth === 0 && i > start) break;
    }
    if (depth > 0) insideLayer = true;
  }
  if (insideLayer) {
    findings.push(
      `global.css: the prose token mapping is inside a @layer (${opens} layer(s) opened before it) — utilities win over layers, which is the bug this gate exists for`
    );
  }
}

if (findings.length === 0) {
  console.log(
    `  ✓ ${GUARDED.length * 2} prose variables resolve to Cabuya tokens, unlayered`
  );
  console.log('\n✅ prose:check clean');
  process.exit(0);
}

for (const finding of findings) console.error(`  ✗ ${finding}`);
console.error(`\n❌ prose:check found ${findings.length} problem(s)`);
process.exit(strict ? 1 : 0);
