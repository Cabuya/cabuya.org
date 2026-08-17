/**
 * The shared serializer every `.md` twin ends in.
 *
 * Two things it must get right, both easy to break and neither visible in a
 * browser: the canonical block that tells a reader where a copied document
 * came from, and the `alternateUrl` that points at the other language — where
 * one stray slash produces a 404 that only appears in the twin.
 */
import { describe, expect, it } from 'vitest';

import type { Language } from '@/lib/i18n';
import {
  alternateUrl,
  serializeGenericToMarkdown,
  siteNavigationBlock,
} from '@/lib/markdown-for-agents';

const LANGUAGES: Language[] = ['en', 'es'];

describe('alternateUrl', () => {
  it('points an English route at its Spanish twin', () => {
    expect(alternateUrl('en', '/developers')).toBe(
      'https://cabuya.org/es/developers/'
    );
  });

  it('points a Spanish route at its English twin', () => {
    expect(alternateUrl('es', '/developers')).toBe(
      'https://cabuya.org/developers/'
    );
  });

  it('handles the root without doubling the slash', () => {
    // The case that produces `https://cabuya.org//` — a URL that works in a
    // browser and fails a link checker.
    expect(alternateUrl('en', '/')).toBe('https://cabuya.org/es/');
    expect(alternateUrl('es', '/')).toBe('https://cabuya.org/');
  });

  it('never emits a doubled slash in the path, for any route', () => {
    for (const route of [
      '/',
      '/developers',
      '/developers/quickstart',
      '/registry',
    ]) {
      for (const lang of LANGUAGES) {
        const url = alternateUrl(lang, route);
        expect(url.replace('https://', ''), `${lang} ${route}`).not.toContain(
          '//'
        );
      }
    }
  });

  it('always ends in a trailing slash', () => {
    // The site serves directory-style URLs; a twin linking to the unslashed
    // form takes a redirect on every hop.
    for (const route of ['/', '/developers', '/registry']) {
      for (const lang of LANGUAGES) {
        expect(alternateUrl(lang, route), `${lang} ${route}`).toMatch(/\/$/);
      }
    }
  });
});

describe('siteNavigationBlock', () => {
  it.each(LANGUAGES)('renders a navigation block in %s', (lang) => {
    const lines = siteNavigationBlock(lang);
    expect(lines.length).toBeGreaterThan(2);
    expect(lines[0]).toMatch(/^## /);

    const body = lines.join('\n');
    expect(body).not.toContain('undefined');
    expect(body).toContain('https://cabuya.org');
  });

  it('gives every entry a label and a link', () => {
    for (const lang of LANGUAGES) {
      for (const line of siteNavigationBlock(lang).filter((l) =>
        l.startsWith('- ')
      )) {
        expect(line, `${lang}: ${line}`).toMatch(/^- \[.+\]\(https?:\/\/.+\)$/);
      }
    }
  });

  it('links home with the right prefix per language', () => {
    // Kept from the original suite: the home link is the one entry whose href
    // is built differently per language, so it is the one that breaks.
    expect(siteNavigationBlock('en').join('\n')).toContain(
      '(https://cabuya.org/)'
    );
    expect(siteNavigationBlock('es').join('\n')).toContain(
      '(https://cabuya.org/es)'
    );
  });

  it('differs between languages', () => {
    expect(siteNavigationBlock('es').join('\n')).not.toBe(
      siteNavigationBlock('en').join('\n')
    );
  });
});

describe('serializeGenericToMarkdown', () => {
  const base = {
    title: 'A page',
    description: 'What it is about.',
    lang: 'en' as Language,
    canonical: 'https://cabuya.org/a-page/',
  };

  it('opens with the title, description, canonical and language', () => {
    const markdown = serializeGenericToMarkdown(base);
    expect(markdown.startsWith('# A page')).toBe(true);
    expect(markdown).toContain('What it is about.');
    // The line that tells a reader where a copied document came from.
    expect(markdown).toContain('Canonical: https://cabuya.org/a-page/');
    expect(markdown).toContain('Language: en');
  });

  it('includes the body when there is one', () => {
    const markdown = serializeGenericToMarkdown({
      ...base,
      body: 'The body text.',
    });
    expect(markdown).toContain('The body text.');
  });

  it('omits the body block entirely when it is empty or whitespace', () => {
    // A blank body should leave no gap that reads as a missing section.
    for (const body of [undefined, '', '   \n  ']) {
      const markdown = serializeGenericToMarkdown({ ...base, body });
      expect(markdown, JSON.stringify(body)).not.toMatch(/\n\n\n\n/);
    }
  });

  it('renders extra sections as headings with their lines', () => {
    const markdown = serializeGenericToMarkdown({
      ...base,
      sections: [
        { heading: 'First', lines: ['one', 'two'] },
        { heading: 'Second', lines: ['three'] },
      ],
    });
    expect(markdown).toContain('## First');
    expect(markdown).toContain('one');
    expect(markdown).toContain('## Second');
    expect(markdown).toContain('three');
  });

  it('renders body and sections in order', () => {
    // Kept from the original suite. Order is the part a reader depends on and
    // no other assertion here covers.
    const markdown = serializeGenericToMarkdown({
      ...base,
      body: 'Body text.',
      sections: [{ heading: 'Extra', lines: ['- one', '- two'] }],
    });
    expect(markdown.indexOf('Body text.')).toBeLessThan(
      markdown.indexOf('## Extra')
    );
    expect(markdown).toContain('- one');
  });

  it('handles no sections at all', () => {
    const markdown = serializeGenericToMarkdown({ ...base, sections: [] });
    expect(markdown).toBeTruthy();
    expect(markdown).not.toContain('undefined');
  });

  it('handles a section with no lines', () => {
    const markdown = serializeGenericToMarkdown({
      ...base,
      sections: [{ heading: 'Empty', lines: [] }],
    });
    expect(markdown).toContain('## Empty');
  });

  it('always ends with the site navigation block', () => {
    // Every twin carries it, so an agent that landed on one page can reach the
    // rest without going back to HTML.
    for (const lang of LANGUAGES) {
      const markdown = serializeGenericToMarkdown({ ...base, lang });
      const nav = siteNavigationBlock(lang)[0];
      expect(markdown, lang).toContain(nav);
      expect(markdown.indexOf(nav), lang).toBeGreaterThan(
        markdown.indexOf('Language:')
      );
    }
  });

  it('records the language it was asked for', () => {
    expect(serializeGenericToMarkdown({ ...base, lang: 'es' })).toContain(
      'Language: es'
    );
  });
});
