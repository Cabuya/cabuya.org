import { describe, expect, it } from 'vitest';

import { localizeInternalLinks } from '@/lib/localize-links';

const es = (html: string) => localizeInternalLinks(html, 'es');

describe('localizeInternalLinks', () => {
  it('leaves English untouched — its prefix is empty', () => {
    const html = '<a href="/developers/spec/0.1/1-architecture">§1</a>';
    expect(localizeInternalLinks(html, 'en')).toBe(html);
  });

  it('prefixes a root-relative internal link', () => {
    expect(es('<a href="/developers/spec/0.1/1-architecture">§1</a>')).toBe(
      '<a href="/es/developers/spec/0.1/1-architecture">§1</a>'
    );
  });

  it('keeps the fragment and query attached to the prefixed path', () => {
    expect(es('<a href="/developers/spec/0.1/3-the-feed#3-1">§3.1</a>')).toBe(
      '<a href="/es/developers/spec/0.1/3-the-feed#3-1">§3.1</a>'
    );
  });

  it('is idempotent — a fragment may pass through more than one layout', () => {
    const once = es('<a href="/registry">Registry</a>');
    expect(es(once)).toBe(once);
    expect(once).toBe('<a href="/es/registry">Registry</a>');
  });

  it('leaves absolute, protocol-relative, anchor and mailto links alone', () => {
    for (const href of [
      'https://cabuya.org/registry',
      '//cdn.example.org/x',
      '#3-1',
      'mailto:reportes@cabuya.org',
    ]) {
      const html = `<a href="${href}">x</a>`;
      expect(es(html), href).toBe(html);
    }
  });

  it('never prefixes the routes that exist once for the whole site', () => {
    for (const href of ['/404', '/llms.txt', '/robots.txt', '/openapi.json']) {
      const html = `<a href="${href}">x</a>`;
      expect(es(html), href).toBe(html);
    }
  });

  it('never prefixes assets or endpoints', () => {
    for (const href of ['/images/a.webp', '/api/validate', '/badge/corag']) {
      const html = `<a href="${href}">x</a>`;
      expect(es(html), href).toBe(html);
    }
  });

  it('rewrites every link in a fragment, not just the first', () => {
    const out = es(
      '<a href="/developers/spec">Spec</a> and <a href="/rfcs">RFCs</a>'
    );
    expect(out).toContain('href="/es/developers/spec"');
    expect(out).toContain('href="/es/rfcs"');
  });

  it('leaves attributes other than href untouched', () => {
    const out = es('<a class="x" href="/registry" data-y="/registry">R</a>');
    expect(out).toBe(
      '<a class="x" href="/es/registry" data-y="/registry">R</a>'
    );
  });
});
