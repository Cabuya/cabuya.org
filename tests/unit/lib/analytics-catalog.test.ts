import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { EVENTS } from '@/lib/analytics';

/**
 * The catalog is only useful if it matches what actually fires.
 *
 * Two ways it silently rots:
 *
 * 1. An event is declared and nothing ever sends it, so `docs/ANALYTICS.md`
 *    promises a metric that never appears in a dashboard.
 * 2. The edge middleware sends an event name as a string literal — it cannot
 *    import from `src/`, Cloudflare Functions build separately — and someone
 *    renames the constant here without touching the middleware, or vice versa.
 *    Nothing breaks; the data just splits across two names.
 */

const ROOT = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

/** Names the edge middleware sends directly, bypassing `trackEvent`. */
const EDGE_EVENTS = [
  EVENTS.AI_BOT_VISIT,
  EVENTS.UNKNOWN_BOT_VISIT,
  EVENTS.MARKDOWN_REQUEST,
] as const;

describe('analytics catalog', () => {
  const sources = ['src/components', 'src/layouts', 'src/pages', 'src/lib'].map(
    (dir) => dir
  );

  // Cheap recursive read: the tree is small and this keeps the test dependency-free.
  const collect = (dir: string): string => {
    const { readdirSync, statSync } =
      require('node:fs') as typeof import('node:fs');
    let out = '';
    for (const entry of readdirSync(resolve(ROOT, dir))) {
      const full = `${dir}/${entry}`;
      if (statSync(resolve(ROOT, full)).isDirectory()) out += collect(full);
      else if (/\.(astro|svelte|ts)$/.test(entry)) out += read(full);
    }
    return out;
  };

  const clientSource = sources.map(collect).join('\n');
  const middlewareSource = read('functions/_middleware.ts');

  it('every catalog entry is actually fired somewhere', () => {
    const unused: string[] = [];

    for (const [key, value] of Object.entries(EVENTS)) {
      const firedFromClient =
        clientSource.includes(`EVENTS.${key}`) ||
        clientSource.includes(`data-umami-event="${value}"`);
      const firedFromEdge = middlewareSource.includes(`'${value}'`);

      if (!firedFromClient && !firedFromEdge) unused.push(`${key} (${value})`);
    }

    expect(
      unused,
      `Declared but never fired — wire them or remove them:\n  ${unused.join('\n  ')}`
    ).toEqual([]);
  });

  it('edge event names match the middleware string literals', () => {
    // The middleware cannot import this file, so the two have to be compared
    // rather than shared. A rename on either side fails here.
    for (const name of EDGE_EVENTS) {
      expect(
        middlewareSource,
        `functions/_middleware.ts no longer sends "${name}"`
      ).toContain(`'${name}'`);
    }
  });

  it('the conversion CTA event is wired on the pages that carry it', () => {
    // Every CTA into the application is the site's conversion; losing the
    // instrumentation makes the funnel unmeasurable without anything failing.
    for (const page of [
      'src/components/pages/HomePage.astro',
      'src/components/pages/InstitutionalPage.astro',
    ]) {
      expect(read(page), `${page} lost its app CTA tracking`).toContain(
        EVENTS.APP_CTA_CLICK
      );
    }
  });
});
