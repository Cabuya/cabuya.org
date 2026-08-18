/**
 * Every colour in every built code block, measured.
 *
 * Syntax highlighting is the one place on this site where colour arrives as an
 * inline style rather than as a token: Shiki writes `style="color:#…"` from its
 * theme, so none of the design rules reach it and none of the token tests see
 * it.
 *
 * `github-dark`'s comment colour measured **3.19:1** on our ground. That is a
 * WCAG AA failure on every code block with a comment — which is most of the
 * ones that teach anything — and it went unnoticed until Lighthouse ran on the
 * quickstart, because nobody reads a comment colour and asks what its ratio is.
 *
 * So this measures all of them, against both grounds a code block can sit on.
 * A theme change that introduces a second failing token fails here rather than
 * in an audit somebody runs quarterly.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/lib/contrast';

const DIST = join(process.cwd(), 'dist');
/** Where the build writes its stylesheets. */
const BUILT_CSS = join(DIST, '_astro');

/**
 * The two backgrounds a code block sits on.
 *
 * `bg-dark` is ours — the figure provides it and Shiki's own background is
 * made transparent. The theme's `#24292E` is measured too, because a change
 * that stopped overriding the background would land there and must also pass.
 */
const GROUNDS = { 'cabuya bg-dark': '#082A24', 'github-dark': '#24292E' };

function htmlFiles(dir = DIST, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

/**
 * Colours the stylesheet redirects, as a map from theme value to replacement.
 *
 * A rule like `.astro-code span[style*=#6A737D]{color:var(--token)!important}`
 * means the browser never paints `#6A737D`. Measuring the theme's value and
 * calling it a failure would report a defect that has been fixed; measuring
 * the replacement is measuring what somebody actually sees.
 *
 * Read from the built output rather than from the source, because the question
 * is what shipped — and Astro inlines a component's `is:global` block into the
 * pages that use it rather than into the shared bundle, which is where an
 * earlier version of this test looked and found nothing.
 */
function overrides(tokens: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(BUILT_CSS)) return map;
  const sources = [
    ...htmlFiles().map((file) => readFileSync(file, 'utf-8')),
    ...readdirSync(BUILT_CSS)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(BUILT_CSS, file), 'utf-8')),
  ];

  for (const source of sources) {
    for (const rule of source.matchAll(
      /astro-code span\[style\*=\\?"?#([0-9a-fA-F]{6})"?\][^{]*\{[^}]*color:\s*var\((--[\w-]+)\)/g
    )) {
      const replacement = tokens[rule[2]];
      // The capture excludes the '#', which the colour scan includes.
      if (replacement) {
        map.set(`#${rule[1].toUpperCase()}`, replacement.toUpperCase());
      }
    }
  }
  return map;
}

/** `--color-cabuya-*` values as the build declared them. */
function builtTokens(): Record<string, string> {
  if (!existsSync(BUILT_CSS)) return {};
  const css = readdirSync(BUILT_CSS)
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(BUILT_CSS, file), 'utf-8'))
    .join('\n');

  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(
    /(--color-cabuya-[\w-]+):\s*(#[0-9a-fA-F]{3,8})/g
  )) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

/** Every `color:#rrggbb` inside a `<pre class="astro-code">`, with a sample. */
function codeColours(): Map<string, string> {
  const found = new Map<string, string>();
  for (const file of htmlFiles()) {
    const html = readFileSync(file, 'utf-8');
    for (const block of html.matchAll(
      /<pre class="astro-code[\s\S]*?<\/pre>/g
    )) {
      // The `<pre>` carries the block background in its own style attribute;
      // only the spans inside carry text colour.
      for (const span of block[0].matchAll(
        /<span style="color:(#[0-9a-fA-F]{6})"/g
      )) {
        const hex = span[1].toUpperCase();
        if (!found.has(hex)) {
          found.set(hex, file.slice(DIST.length + 1));
        }
      }
    }
  }
  return found;
}

/*
 * Guarded on `dist/_astro`, not on `dist`, because that is the directory
 * `builtTokens` reads — and guarded twice.
 *
 * `describe.skipIf` marks the registered tests as skipped; it does not stop
 * the callback body from running during collection. `builtTokens()` is called
 * there, so an absent directory threw `ENOENT` before a single test was
 * evaluated, and the whole file failed rather than skipping. CI runs the unit
 * tests before the build, so that was every CI run.
 */
describe.skipIf(!existsSync(BUILT_CSS))('syntax highlighting contrast', () => {
  const colours = codeColours();
  const tokens = builtTokens();
  const redirected = overrides(tokens);

  /** What a browser paints for a theme colour: the override, or the colour. */
  const painted = (hex: string): string => redirected.get(hex) ?? hex;

  it('finds code blocks to measure at all', () => {
    // A guard on the guard: if the markup changes and this scan matches
    // nothing, the suite would pass by measuring an empty set.
    expect(colours.size).toBeGreaterThan(3);
  });

  it('every token colour passes AA on every ground it can sit on', () => {
    const failures: string[] = [];

    for (const [hex, example] of colours) {
      const actual = painted(hex);
      for (const [name, ground] of Object.entries(GROUNDS)) {
        const ratio = contrastRatio(actual, ground);
        if (ratio < 4.5) {
          failures.push(
            `${hex}${actual === hex ? '' : ` → ${actual}`} on ${name}: ${ratio.toFixed(2)}:1 (first seen in ${example})`
          );
        }
      }
    }

    expect(failures, 'code-block colours below WCAG AA').toEqual([]);
  });

  it('has replaced the theme comment colour rather than shipping it', () => {
    // The specific one Lighthouse caught. Asserted by name so a future edit
    // that removes the override is a failure with an explanation attached.
    expect([...colours.keys()]).toContain('#6A737D');
    expect(contrastRatio('#6A737D', GROUNDS['cabuya bg-dark'])).toBeLessThan(
      4.5
    );

    // …and that the shipped stylesheet redirects it to something that passes.
    expect(redirected.get('#6A737D')).toBeTruthy();
    expect(
      contrastRatio(painted('#6A737D'), GROUNDS['cabuya bg-dark'])
    ).toBeGreaterThanOrEqual(4.5);
    expect(tokens['--color-cabuya-code-comment']).toBeTruthy();
  });
});
