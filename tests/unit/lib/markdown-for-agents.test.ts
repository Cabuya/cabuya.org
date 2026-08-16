/**
 * Guards the agent-Markdown serializer: front block, sections, and the
 * shared Site navigation block, in both languages.
 */
import { describe, expect, it } from 'vitest';

import {
  serializeGenericToMarkdown,
  siteNavigationBlock,
} from '@/lib/markdown-for-agents';

describe('serializeGenericToMarkdown', () => {
  const base = {
    title: 'Test title',
    description: 'A description.',
    canonical: 'https://cabuya.org/test/',
  } as const;

  it('emits the front block with canonical and language', () => {
    const md = serializeGenericToMarkdown({ ...base, lang: 'en' });
    expect(md).toContain('# Test title');
    expect(md).toContain('A description.');
    expect(md).toContain('Canonical: https://cabuya.org/test/');
    expect(md).toContain('Language: en');
  });

  it('renders body and sections in order', () => {
    const md = serializeGenericToMarkdown({
      ...base,
      lang: 'en',
      body: 'Body text.',
      sections: [{ heading: 'Extra', lines: ['- one', '- two'] }],
    });
    expect(md.indexOf('Body text.')).toBeLessThan(md.indexOf('## Extra'));
    expect(md).toContain('- one');
  });

  it('always ends with the localized Site navigation block', () => {
    const mdEn = serializeGenericToMarkdown({ ...base, lang: 'en' });
    const mdEs = serializeGenericToMarkdown({ ...base, lang: 'es' });
    expect(mdEn).toContain('## Site Navigation');
    expect(mdEs).toContain('## Navegación del Sitio');
  });
});

describe('siteNavigationBlock', () => {
  it('links home with the right prefix per language', () => {
    expect(siteNavigationBlock('es').join('\n')).toContain(
      'https://cabuya.org/'
    );
    expect(siteNavigationBlock('en').join('\n')).toContain('/en');
  });
});
