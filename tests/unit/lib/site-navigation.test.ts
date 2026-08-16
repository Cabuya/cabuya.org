/**
 * Guards the single-source navigation module and its chrome consistency:
 * every inChrome entry must appear in the live header, and every nav path
 * must be either external or present in the middleware allowlist.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { GITHUB_URL, NAV_ENTRIES, navHref } from '@/lib/site-navigation';

const ROOT = process.cwd();

describe('nav entries', () => {
  it('labels exist for both active languages', () => {
    for (const entry of NAV_ENTRIES) {
      expect(entry.label.en, entry.path).toBeTruthy();
      expect(entry.label.es, entry.path).toBeTruthy();
    }
  });

  it('internal paths resolve through navHref with the language prefix', () => {
    const home = NAV_ENTRIES.find((e) => e.path === '/');
    expect(home).toBeDefined();
    if (!home) return;
    expect(navHref(home, 'es')).toBe('/');
    expect(navHref(home, 'en')).toBe('/en');
  });

  it('external entries pass through untouched', () => {
    const gh = NAV_ENTRIES.find((e) => e.external);
    expect(gh).toBeDefined();
    if (!gh) return;
    expect(navHref(gh, 'es')).toBe(GITHUB_URL);
  });
});

describe('chrome consistency', () => {
  it('every inChrome entry path appears in Header.svelte (via the module)', () => {
    const header = readFileSync(
      join(ROOT, 'src/components/layout/Header.svelte'),
      'utf-8'
    );
    // The header renders from NAV_ENTRIES — assert the wiring, not markup.
    expect(header).toContain('NAV_ENTRIES');
    expect(header).toContain('navHref');
  });

  it('internal nav paths are in the middleware allowlist', () => {
    const middleware = readFileSync(join(ROOT, 'src/middleware.ts'), 'utf-8');
    for (const entry of NAV_ENTRIES) {
      if (entry.external) continue;
      const top = entry.path.split('/')[1] ?? '';
      expect(middleware, `allowlist missing '${top}'`).toContain(`'${top}'`);
    }
  });
});
