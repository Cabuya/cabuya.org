import { describe, expect, it } from 'vitest';

import { renderInlineMarkdown } from '@/lib/inline-markdown';

describe('renderInlineMarkdown', () => {
  it('renders inline code', () => {
    const html = renderInlineMarkdown('usa `source` y `externalId`');
    expect(html).toContain('<code');
    expect(html).toContain('>source</code>');
    expect(html).toContain('>externalId</code>');
    expect(html).not.toContain('`');
  });

  it('renders bold', () => {
    const html = renderInlineMarkdown('**Obligatorio:** algo');
    expect(html).toContain('<strong');
    expect(html).toContain('>Obligatorio:</strong>');
    expect(html).not.toContain('**');
  });

  it('renders code nested inside bold', () => {
    const html = renderInlineMarkdown('**`category`** es una de: `otro`.');
    expect(html).toContain('<strong');
    expect(html).toContain('<code');
    expect(html).not.toMatch(/[`*]/);
  });

  it('escapes HTML before formatting, so copy can never inject markup', () => {
    const html = renderInlineMarkdown('<script>alert(1)</script> & "x"');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;');
  });

  it('escapes HTML inside code spans too', () => {
    const html = renderInlineMarkdown('`<img onerror=x>`');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('lets long endpoint URLs wrap instead of overflowing', () => {
    const html = renderInlineMarkdown(
      '`GET https://ayuda.cabuya.org/api/public/v1/help`'
    );
    expect(html).toContain('break-words');
  });

  it('leaves plain text untouched', () => {
    expect(renderInlineMarkdown('texto sin formato')).toBe('texto sin formato');
  });
});
