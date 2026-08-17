/**
 * Source assertions over the diagram components.
 *
 * These are greps, and they are honest about it: they read the `.astro` source
 * rather than a render, so they can prove a component *declares* a Spanish key
 * and cannot prove the Spanish label fits inside its panel. The gallery at
 * `/internal/ui/diagrams` is the check for that, and it is a human one.
 *
 * What greps do catch is the whole class of defects that come from copying a
 * component and forgetting one line — a missing `es` key, a hardcoded
 * `aria-label`, a hex colour that will not follow dark mode, an omitted
 * `aspect-ratio` that shifts the paragraph below. Those are the ones that
 * actually happen.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LANGUAGE_CODES } from '@/lib/language-codes';

const ROOT = process.cwd();
const DIAGRAMS = join(ROOT, 'src', 'components', 'diagrams');

function diagramFiles(dir: string = DIAGRAMS): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...diagramFiles(full));
    else if (entry.endsWith('.astro')) out.push(full);
  }
  return out.sort();
}

const FILES = diagramFiles();
const named = (file: string) => relative(ROOT, file);

describe('diagram components — the set exists', () => {
  it('ships the eight the catalogue promises', () => {
    expect(FILES.length).toBeGreaterThanOrEqual(8);
  });

  it('every component in the catalogue table is a real file', () => {
    const doc = readFileSync(join(ROOT, 'docs/DIAGRAM_COMPONENTS.md'), 'utf-8');
    const listed = [
      ...doc.matchAll(/`((?:protocol|developers)\/\w+\.astro)`/g),
    ].map((match) => match[1]);
    expect(listed.length).toBeGreaterThanOrEqual(8);
    const onDisk = new Set(FILES.map((file) => relative(DIAGRAMS, file)));
    expect(listed.filter((entry) => !onDisk.has(entry))).toEqual([]);
  });

  it('every real file is in the catalogue table', () => {
    const doc = readFileSync(join(ROOT, 'docs/DIAGRAM_COMPONENTS.md'), 'utf-8');
    const missing = FILES.map((file) => relative(DIAGRAMS, file)).filter(
      (entry) => !doc.includes(entry)
    );
    expect(missing, 'undocumented diagrams').toEqual([]);
  });
});

describe.each(FILES.map((file) => [named(file), readFileSync(file, 'utf-8')]))(
  '%s',
  (_name, source) => {
    it('declares an i18n map with a key for every active language', () => {
      expect(source).toContain('const i18n = {');
      for (const code of LANGUAGE_CODES) {
        expect(source, `missing "${code}" key`).toMatch(
          new RegExp(`\\n\\s{2}${code}:\\s*\\{`)
        );
      }
    });

    it('falls back to English rather than rendering blank', () => {
      expect(source).toContain('?? i18n.en');
    });

    it('is a labelled image, with the label coming from the map', () => {
      expect(source).toContain('role="img"');
      expect(source).toContain('aria-label={t.ariaLabel}');
      // The label must say what the diagram argues, not name its shape.
      expect(
        source.match(/ariaLabel:\s*\n?\s*'([^']{60,})'/g)?.length
      ).toBeGreaterThan(0);
    });

    it('reserves its own space', () => {
      expect(source).toMatch(/aspect-ratio:\s*\d+\s*\/\s*\d+/);
    });

    it('hides the SVG from assistive technology', () => {
      // The figure's aria-label conveys the content; a traversable SVG would
      // read out every stray label in an order nobody chose.
      expect(source).toContain('aria-hidden="true"');
    });

    it('uses tokens, never a colour literal', () => {
      expect(source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
    });

    it('ships no JavaScript', () => {
      expect(source).not.toContain('client:load');
      expect(source).not.toContain('client:visible');
      expect(source).not.toContain('client:idle');
      expect(source).not.toContain('<script');
    });

    it('accepts a lang prop defaulting to English', () => {
      expect(source).toContain('lang?: Language');
      expect(source).toContain("lang = 'en'");
    });

    it('carries a caption', () => {
      expect(source).toContain('<figcaption>');
      expect(source).toContain('caption:');
    });
  }
);

describe('diagram components — Spanish is written, not copied', () => {
  it.each(FILES.map((file) => [named(file), readFileSync(file, 'utf-8')]))(
    '%s has a distinct Spanish aria-label',
    (_name, source) => {
      const labels = [...source.matchAll(/ariaLabel:\s*\n?\s*'([^']+)'/g)].map(
        (match) => match[1]
      );
      expect(labels.length).toBeGreaterThanOrEqual(2);
      // Identical strings mean the English was pasted into the Spanish key.
      expect(new Set(labels).size).toBe(labels.length);
    }
  );

  it.each(FILES.map((file) => [named(file), readFileSync(file, 'utf-8')]))(
    '%s carries Spanish diacritics',
    (_name, source) => {
      const spanish = source.slice(source.indexOf('\n  es: {'));
      expect(spanish).toMatch(/[áéíóúñ¿¡]/i);
    }
  );
});
