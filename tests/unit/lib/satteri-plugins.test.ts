/**
 * The two Sätteri HAST plugins that replace dependencies Astro 7 no longer runs.
 *
 * Sätteri does not execute remark/rehype plugins, so `rehype-external-links`
 * and the in-repo image-defaults transform were ported here. That port is
 * silent when it breaks: a plugin that stops matching leaves the markdown
 * rendering perfectly, only without `rel="noopener"` on outbound links or
 * without lazy-loading on in-body images. Nothing fails, nothing warns.
 *
 * These tests pin the visitor behaviour directly, without a build.
 */
import { describe, expect, it } from 'vitest';

import {
  type HastElement,
  type HastVisitorContext,
  satteriExternalLinks,
  satteriImageDefaults,
} from '@/lib/satteri-plugins';

/** Records what a plugin sets, the way Sätteri mirrors mutations back. */
function harness() {
  const applied: Record<string, unknown> = {};
  const ctx: HastVisitorContext = {
    setProperty(node, key, value) {
      applied[key] = value;
      node.properties = { ...node.properties, [key]: value };
    },
  };
  return { applied, ctx };
}

const el = (
  tagName: string,
  properties: Record<string, unknown> = {}
): HastElement => ({ type: 'element', tagName, properties, children: [] });

describe('satteriExternalLinks', () => {
  const plugin = satteriExternalLinks();

  it('registers under the name and filter Sätteri dispatches on', () => {
    expect(plugin.name).toBe('external-links');
    expect(plugin.element.filter).toEqual(['a']);
  });

  it.each([
    'https://ayuda.cabuya.org',
    'http://example.org/page',
    'HTTPS://SHOUTING.EXAMPLE',
  ])('hardens the external link %s', (href) => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('a', { href }), ctx);
    expect(applied.target).toBe('_blank');
    expect(applied.rel).toEqual(['noopener', 'noreferrer']);
  });

  it.each([
    ['/blog/how-to-donate-safely-in-colombia', 'a root-relative path'],
    ['#section', 'a fragment'],
    ['mailto:someone@example.org', 'a mailto'],
    ['./relative', 'a relative path'],
  ])('leaves %s alone (%s)', (href) => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('a', { href }), ctx);
    expect(applied).toEqual({});
  });

  it('leaves an anchor with no href alone', () => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('a'), ctx);
    expect(applied).toEqual({});
  });

  it('ignores a non-string href instead of throwing', () => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('a', { href: 42 }), ctx);
    expect(applied).toEqual({});
  });
});

describe('satteriImageDefaults', () => {
  const plugin = satteriImageDefaults();

  it('registers under the name and filter Sätteri dispatches on', () => {
    expect(plugin.name).toBe('image-defaults');
    expect(plugin.element.filter).toEqual(['img']);
  });

  it('adds lazy loading and async decoding to a bare image', () => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('img', { src: '/images/blog/x.webp' }), ctx);
    expect(applied).toEqual({ loading: 'lazy', decoding: 'async' });
  });

  it('never overrides an explicit eager hero', () => {
    // The reason the guard exists: an above-the-fold hero sets loading="eager"
    // with fetchpriority="high", and forcing it lazy would delay the LCP image.
    const { applied, ctx } = harness();
    plugin.element.visit(
      el('img', { src: '/hero.webp', loading: 'eager', fetchpriority: 'high' }),
      ctx
    );
    expect(applied.loading).toBeUndefined();
    expect(applied.decoding).toBe('async');
  });

  it('never overrides an explicit decoding', () => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('img', { decoding: 'sync' }), ctx);
    expect(applied.decoding).toBeUndefined();
    expect(applied.loading).toBe('lazy');
  });

  it('treats an author-set empty string as intentional, not as absent', () => {
    const { applied, ctx } = harness();
    plugin.element.visit(el('img', { loading: '', decoding: '' }), ctx);
    expect(applied).toEqual({});
  });
});
