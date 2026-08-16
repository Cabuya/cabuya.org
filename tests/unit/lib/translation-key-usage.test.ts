/**
 * Every `t.<path>` a template reads must exist in both locales.
 *
 * This exists because of a real bug: the header's dropdown button rendered
 * `{t.nav.community}` after that key had been removed from the namespace. The
 * key resolved to `undefined`, Svelte rendered nothing, and the chevron was left
 * floating with no label next to it.
 *
 * `astro check` did not catch it — it type-checks `.astro` frontmatter and `.ts`,
 * but not the expressions inside Svelte templates. So a missing key there is a
 * silent, user-visible blank rather than a build failure. This test closes that
 * gap by resolving every usage against the real translation objects.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getTranslations } from '@/lib/translations';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/** Roots that are looked up dynamically and cannot be resolved statically. */
const DYNAMIC = new Set([
  'tagNames',
  'tagDescriptions',
  'seriesNames',
  'seriesDescriptions',
  'successNextSteps',
  'prefillSubjects',
]);

/** Trailing segments that are JS operations on the resolved value, not keys. */
const METHODS = new Set([
  'map',
  'filter',
  'find',
  'join',
  'length',
  'slice',
  'includes',
  'some',
  'every',
  'forEach',
  'replace',
  'split',
  'trim',
  'toString',
  'at',
  'flatMap',
  'sort',
  'reduce',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (['.astro', '.svelte', '.ts'].includes(extname(entry)))
      out.push(full);
  }
  return out;
}

/**
 * Where `t` is rooted in this file, or `null` when `t` is not the translations
 * object at all.
 *
 * Three real bindings exist in the codebase:
 *   `const t = getTranslations(lang);`             → root is the whole object
 *   `const t = getTranslations(lang).contactPage;` → root is that namespace
 *   `$: t = getTranslations(lang);`                → Svelte reactive declaration
 *
 * ⚠️ The Svelte form matters most. An earlier version of this matcher only
 * accepted `const`, which silently skipped every `.svelte` file — precisely the
 * files this test exists to protect, since `astro check` does not type them
 * either. The test passed vacuously. Keep all three forms.
 *
 * Files with none are skipped, because there `t` is something else entirely —
 * usually a lambda parameter such as `textSizes.map((t) => t.size)`.
 */
function rootFor(source: string): string | null {
  const m = source.match(
    /(?:\bconst|\blet|\$:)\s+t\s*=\s*getTranslations\([^)]*\)((?:\.[A-Za-z_$][\w$]*)*)\s*;/
  );
  if (!m) return null;
  return m[1].replace(/^\./, '');
}

/**
 * Collect `t.a.b.c` paths, dropping a trailing JS method so `t.quickLinks.map`
 * is checked as `quickLinks`.
 */
function usagesIn(source: string): string[] {
  const found = new Set<string>();
  for (const m of source.matchAll(
    /\bt\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/g
  )) {
    const parts = m[1].split('.');
    while (parts.length > 1 && METHODS.has(parts[parts.length - 1]))
      parts.pop();
    found.add(parts.join('.'));
  }
  return [...found];
}

function resolve(obj: unknown, path: string): { ok: boolean; value: unknown } {
  let current: unknown = obj;
  if (path === '') return { ok: true, value: current };
  for (const segment of path.split('.')) {
    if (current === null || typeof current !== 'object')
      return { ok: false, value: undefined };
    if (!(segment in (current as Record<string, unknown>)))
      return { ok: false, value: undefined };
    current = (current as Record<string, unknown>)[segment];
  }
  return { ok: true, value: current };
}

const FILES = walk(SRC);

describe('translation key usage', () => {
  for (const lang of ['es', 'en'] as const) {
    it(`every t.<path> used in a template exists in ${lang}`, () => {
      const t = getTranslations(lang);
      const missing: string[] = [];

      for (const file of FILES) {
        const source = readFileSync(file, 'utf-8');
        const root = rootFor(source);
        if (root === null) continue;
        const base = resolve(t, root).value;
        for (const path of usagesIn(source)) {
          const head = path.split('.')[0];
          // Dynamic record lookups: only the root has to exist.
          const probe = DYNAMIC.has(head) ? head : path;
          const { ok, value } = resolve(base, probe);
          if (!ok || value === undefined) {
            missing.push(`${file.replace(ROOT, '')} → t.${path}`);
          }
        }
      }

      expect(missing).toEqual([]);
    });
  }

  it('resolves no key to an empty string, which renders as a blank label', () => {
    const blanks: string[] = [];
    for (const lang of ['es', 'en'] as const) {
      const t = getTranslations(lang);
      for (const file of FILES) {
        const source = readFileSync(file, 'utf-8');
        const root = rootFor(source);
        if (root === null) continue;
        const base = resolve(t, root).value;
        for (const path of usagesIn(source)) {
          if (DYNAMIC.has(path.split('.')[0])) continue;
          const { ok, value } = resolve(base, path);
          if (ok && typeof value === 'string' && value.trim() === '') {
            blanks.push(`${lang}: t.${path}`);
          }
        }
      }
    }
    expect(blanks).toEqual([]);
  });
});
