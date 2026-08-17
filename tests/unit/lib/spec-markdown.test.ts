/**
 * The specification's Markdown twins.
 *
 * These render the normative text and the schema reference into the documents
 * an agent reads. They are worth testing for one reason above the others: an
 * agent that fetches `…/spec/0.1/3-the-feed.md` and gets a *draft* document
 * with no indication that it is a draft will implement it as settled. Every
 * generator here is checked for the version, the status and a canonical link,
 * in both languages.
 *
 * The generators are fed real vendored data — the same loader the site uses —
 * rather than fixtures, so a change to the specification that breaks a twin
 * fails here rather than at build.
 */
import { describe, expect, it } from 'vitest';

import type { Language } from '@/lib/i18n';
import { specSchemas, specSections, specVersions } from '@/lib/spec-loader';
import {
  schemaIndexMarkdown,
  schemaMarkdown,
  specIndexMarkdown,
  specSectionMarkdown,
  specVersionMarkdown,
} from '@/lib/spec-markdown';
import { getTranslations } from '@/lib/translations';

const LANGUAGES: Language[] = ['en', 'es'];
const VERSION = '0.1';

describe('specSectionMarkdown', () => {
  const sections = specSections(VERSION);

  it('has sections to render at all', () => {
    // If the loader returns nothing, every assertion below passes vacuously.
    expect(sections.length).toBeGreaterThan(0);
  });

  it.each(LANGUAGES)('renders every section in %s', (lang) => {
    for (const section of sections) {
      const markdown = specSectionMarkdown(section, lang);
      const where = `${section.slug}/${lang}`;

      expect(markdown, where).toBeTruthy();
      expect(markdown, where).toContain(section.title);
      // The canonical URL, so a document that has been copied somewhere else
      // still says where it came from.
      expect(markdown, where).toContain(
        `/developers/spec/${VERSION}/${section.slug}`
      );
      expect(markdown, where).not.toContain('undefined');
      expect(markdown, where).not.toContain('[object Object]');
    }
  });

  it('carries the Spanish URL prefix on the Spanish twin', () => {
    const markdown = specSectionMarkdown(sections[0], 'es');
    expect(markdown).toContain('/es/developers/spec/');
  });

  it('does not carry the Spanish prefix on the English twin', () => {
    const markdown = specSectionMarkdown(sections[0], 'en');
    expect(markdown).not.toContain('/es/developers/spec/');
  });

  it('states the version status, in both languages', () => {
    /*
     * This used to assert the word "draft". It was the right assertion while
     * 0.1 was one, and the wrong shape: an agent needs to know *which* status
     * the version carries, not that it carries one particular status. Reading
     * the label from the translations keeps the guarantee — the twin never
     * leaves an agent guessing whether a requirement is settled — through
     * every status the version will have.
     */
    for (const lang of LANGUAGES) {
      const markdown = specSectionMarkdown(sections[0], lang);
      const label = getTranslations(lang).spec.statusLabels[sections[0].status];
      expect(label, `no label for status "${sections[0].status}"`).toBeTruthy();
      expect(markdown, lang).toContain(label);
    }
  });
});

describe('schemaMarkdown', () => {
  const schemas = specSchemas(VERSION);

  it('has schemas to render', () => {
    expect(schemas.length).toBeGreaterThan(0);
  });

  it.each(LANGUAGES)('renders each schema in %s', (lang) => {
    for (const schema of schemas) {
      const markdown = schemaMarkdown(schema, lang);
      const where = `${schema.name}/${lang}`;

      expect(markdown, where).toBeTruthy();
      expect(markdown, where).toContain(schema.name);
      expect(markdown, where).not.toContain('undefined');
      expect(markdown, where).not.toContain('[object Object]');
    }
  });

  it('names the required fields, which is what a reader came for', () => {
    const feed = specSchemas(VERSION).find((s) =>
      s.name.includes('place-feed')
    );
    expect(feed, 'no place-feed schema found').toBeDefined();
    const markdown = schemaMarkdown(feed!, 'en');
    for (const field of ['last_updated', 'ttl', 'publisher_id', 'license']) {
      expect(markdown, field).toContain(field);
    }
  });

  it('reaches a different result in each language', () => {
    const schema = schemas[0];
    expect(schemaMarkdown(schema, 'es')).not.toBe(schemaMarkdown(schema, 'en'));
  });
});

describe('the index twins', () => {
  const versions = specVersions();

  it.each(LANGUAGES)('specIndexMarkdown lists every version in %s', (lang) => {
    const entries = versions.map((version) => ({
      version,
      status: 'draft',
      sections: specSections(version).length,
    }));
    const markdown = specIndexMarkdown(lang, entries);

    expect(markdown).toBeTruthy();
    for (const version of versions) {
      expect(markdown, version).toContain(version);
    }
    expect(markdown).not.toContain('undefined');
  });

  it.each(LANGUAGES)(
    'specVersionMarkdown lists every section in %s',
    (lang) => {
      const sections = specSections(VERSION);
      const markdown = specVersionMarkdown(lang, VERSION, 'draft', sections);

      expect(markdown).toContain(VERSION);
      for (const section of sections) {
        expect(markdown, section.slug).toContain(section.title);
      }
    }
  );

  it.each(LANGUAGES)('schemaIndexMarkdown lists every schema in %s', (lang) => {
    const entries = specVersions().map((version) => ({
      version,
      schemas: specSchemas(version),
    }));
    const markdown = schemaIndexMarkdown(lang, entries);

    expect(markdown).toBeTruthy();
    for (const entry of entries) {
      for (const schema of entry.schemas) {
        expect(markdown, schema.name).toContain(schema.name);
      }
    }
  });

  it('handles an empty version list without throwing', () => {
    // The shape a fork sees before it vendors anything.
    expect(() => specIndexMarkdown('en', [])).not.toThrow();
    expect(() => schemaIndexMarkdown('en', [])).not.toThrow();
    expect(() => specVersionMarkdown('en', '0.1', 'draft', [])).not.toThrow();
  });
});
