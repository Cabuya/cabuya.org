/**
 * The portal's prose pages, as content rather than as components.
 *
 * These five pages are Markdown, which means the usual protections do not
 * apply: TypeScript cannot check a link, and a reviewer reading a diff cannot
 * see that the English page grew a section the Spanish one did not. So the
 * invariants that matter are asserted here — bilingual completeness, working
 * spec anchors, and the honesty rules the pages are subject to like any other
 * surface.
 *
 * The FAQ extractor gets its own coverage because it is the one piece of this
 * that generates something a person will not read: structured data, which is
 * consumed by search engines and proofread by nobody.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { faqEntries, faqJsonLd } from '@/lib/faq-jsonld';
import { specSections, specVersions } from '@/lib/spec-loader';

const ROOT = process.cwd();
const DOCS = join(ROOT, 'src/content/docs');

const slugs = readdirSync(join(DOCS, 'en'))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

const read = (lang: 'en' | 'es', slug: string): string =>
  readFileSync(join(DOCS, lang, `${slug}.md`), 'utf-8');

describe('the docs collection', () => {
  it('carries the five prose pages this task shipped', () => {
    for (const slug of ['consume', 'profiles', 'mcp', 'faq', 'skill']) {
      expect(slugs).toContain(slug);
    }
  });

  it('has every page in both languages — a missing translation is a missing file', () => {
    for (const slug of slugs) {
      expect(
        existsSync(join(DOCS, 'es', `${slug}.md`)),
        `src/content/docs/es/${slug}.md`
      ).toBe(true);
    }
  });

  it('gives every page a frontmatter block with the required fields', () => {
    for (const lang of ['en', 'es'] as const) {
      for (const slug of slugs) {
        const body = read(lang, slug);
        expect(body.startsWith('---\n'), `${lang}/${slug}`).toBe(true);
        for (const field of ['title:', 'description:', 'section:', 'order:']) {
          expect(body, `${lang}/${slug} ${field}`).toContain(field);
        }
      }
    }
  });
});

describe('links out of the prose', () => {
  /** Every `/developers/spec/{version}/{section}#{anchor}` reference. */
  const specLinks: Array<{ page: string; href: string }> = [];
  for (const lang of ['en', 'es'] as const) {
    for (const slug of slugs) {
      for (const match of read(lang, slug).matchAll(
        /\]\((\/(?:es\/)?developers\/spec\/[^)]+)\)/g
      )) {
        specLinks.push({ page: `${lang}/${slug}`, href: match[1] });
      }
    }
  }

  it('links to spec sections that exist', () => {
    const version = specVersions()[0];
    const known = new Set(specSections(version).map((section) => section.slug));

    for (const { page, href } of specLinks) {
      const [path] = href.split('#');
      const parts = path
        .replace(/^\/(es\/)?developers\/spec\/?/, '')
        .split('/');
      // `/developers/spec` alone is the index; anything longer names a section.
      if (parts.length < 2 || parts[1] === '') continue;
      expect(known, `${page} → ${href}`).toContain(parts[1]);
    }
  });

  it('uses anchors the spec actually renders', () => {
    const version = specVersions()[0];
    const sections = specSections(version);

    for (const { page, href } of specLinks) {
      const [path, anchor] = href.split('#');
      if (!anchor) continue;
      const slug = path
        .replace(/^\/(es\/)?developers\/spec\/?/, '')
        .split('/')[1];
      const section = sections.find((entry) => entry.slug === slug);
      if (!section) continue;

      /*
       * `satteriSpecAnchors` derives an id from the §-number in the heading:
       * `## §4.3 …` becomes `4-3`. Reconstructing the same ids here rather
       * than reading the built HTML keeps this a unit test — and the anchor
       * rule is asserted directly in `satteri-plugins.test.ts`.
       */
      const ids = new Set(
        [...section.body.matchAll(/^##+\s+§([\d.]+)/gm)].map((match) =>
          match[1].replace(/\./g, '-')
        )
      );
      ids.add(section.number);
      expect(ids, `${page} → ${href}`).toContain(anchor);
    }
  });

  it('keeps Spanish pages pointing at Spanish routes', () => {
    for (const slug of slugs) {
      const body = read('es', slug);
      for (const match of body.matchAll(/\]\((\/[^)]+)\)/g)) {
        const href = match[1];
        // Absolute internal links on a Spanish page carry the prefix. Anchors
        // and external URLs are not matched by this pattern at all.
        expect(href.startsWith('/es/'), `es/${slug} → ${href}`).toBe(true);
      }
    }
  });

  it('keeps English pages off the Spanish tree', () => {
    for (const slug of slugs) {
      for (const match of read('en', slug).matchAll(/\]\((\/[^)]+)\)/g)) {
        expect(match[1].startsWith('/es/'), `en/${slug} → ${match[1]}`).toBe(
          false
        );
      }
    }
  });
});

describe('the honesty rules apply to prose too', () => {
  it('never says certified', () => {
    for (const lang of ['en', 'es'] as const) {
      for (const slug of slugs) {
        expect(read(lang, slug).toLowerCase()).not.toMatch(
          /certified|certificado/
        );
      }
    }
  });

  it('carries no placeholder markers', () => {
    for (const lang of ['en', 'es'] as const) {
      for (const slug of slugs) {
        expect(read(lang, slug)).not.toMatch(/\[TODO:|\[TBD\]|\[AUTHOR:/);
      }
    }
  });

  it('says plainly that the MCP server is not deployed, in both languages', () => {
    expect(read('en', 'mcp')).toContain('not deployed');
    expect(read('es', 'mcp')).toContain('no desplegado');
  });

  it('never recommends piping a downloaded script into a shell', () => {
    for (const lang of ['en', 'es'] as const) {
      const body = read(lang, 'skill');
      // The phrase appears — as the thing the page tells you not to do — but
      // never as a runnable line inside a fenced block.
      const blocks = [...body.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]);
      for (const block of blocks) {
        expect(block).not.toMatch(/curl[^\n]*\|\s*(bash|sh)/);
      }
    }
  });
});

describe('FAQ structured data', () => {
  const body = read('en', 'faq');

  it('extracts one entry per question', () => {
    const entries = faqEntries(body);
    expect(entries.length).toBeGreaterThanOrEqual(4);
    for (const entry of entries) {
      expect(entry.question.endsWith('?')).toBe(true);
      expect(entry.answer.length).toBeGreaterThan(40);
    }
  });

  it('skips a heading that is not a question', () => {
    // The page ends with "Anything else", which is a pointer rather than a
    // question. `FAQPage` promises a search engine that every entry is one.
    const questions = faqEntries(body).map((entry) => entry.question);
    expect(questions).not.toContain('Anything else');
  });

  it('strips Markdown — a link target in a search result is noise', () => {
    for (const entry of faqEntries(body)) {
      expect(entry.answer).not.toMatch(/\]\(|\*\*|`/);
    }
  });

  it('keeps field names intact — underscores are not emphasis', () => {
    // An earlier version of the stripper removed underscores along with
    // asterisks, and turned `last_confirmed_at` into a word that appears
    // nowhere in the protocol.
    const identifiers = faqEntries(body)
      .map((entry) => entry.answer)
      .join(' ');
    for (const field of [
      'last_updated',
      'publisher_id',
      'local_id',
      'warning_text',
    ]) {
      expect(identifiers, field).toContain(field);
    }
  });

  it('caps an answer at a sentence boundary rather than mid-word', () => {
    for (const entry of faqEntries(body)) {
      expect(entry.answer.length).toBeLessThanOrEqual(901);
      if (entry.answer.endsWith('…')) {
        expect(entry.answer).not.toMatch(/\s…$/);
      }
    }
  });

  it('builds a FAQPage graph in each language', () => {
    for (const lang of ['en', 'es'] as const) {
      const graph = faqJsonLd(
        read(lang, 'faq'),
        `https://cabuya.org/${lang === 'es' ? 'es/' : ''}developers/faq`,
        lang
      ) as { '@type': string; mainEntity: unknown[] } | null;
      expect(graph?.['@type']).toBe('FAQPage');
      expect(graph?.mainEntity.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('emits nothing for a page with no questions', () => {
    expect(faqJsonLd(read('en', 'profiles'), 'https://x', 'en')).toBeNull();
  });
});
