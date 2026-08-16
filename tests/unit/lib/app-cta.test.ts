import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_PATHS, APP_URL, appUrl } from '@/lib/constances';
import { appInviteSection } from '@/lib/markdown-for-agents';
import { en } from '@/lib/translations/en';
import { es } from '@/lib/translations/es';

const SRC = join(process.cwd(), 'src');
const read = (relative: string) => readFileSync(join(SRC, relative), 'utf-8');

/**
 * The chrome components. These are the only surfaces present on every page, so
 * they are where a missing route to the application costs the most: measured
 * before this layer existed, the header CTA was invisible below 1024px and the
 * one inside the mobile menu sat below the fold.
 */
const CHROME = [
  'components/layout/Header.svelte',
  'components/layout/MobileMenu.svelte',
];

describe('the application is reachable from the chrome', () => {
  it('gives the mobile header its own CTA, outside the desktop-only nav', () => {
    const header = read(CHROME[0]);
    // The desktop nav is `hidden lg:flex`; the pill must live outside it.
    const pill = header.slice(header.indexOf('lg:hidden'));
    expect(pill).toContain('appUrl(APP_PATHS.home)');
    expect(pill).toContain('t.appCta.short');
  });

  it('puts the menu CTA before the navigation groups, not after', () => {
    const menu = read(CHROME[1]);
    const cta = menu.indexOf('data-umami-event-surface="mobile-menu"');
    const firstGroup = menu.indexOf('t.nav.howCoragWorks');
    expect(cta).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(firstGroup);
  });

  it('tracks every chrome CTA with a distinct surface', () => {
    const surfaces = CHROME.flatMap((file) => [
      ...read(file).matchAll(/data-umami-event-surface="([^"]+)"/g),
    ]).map((m) => m[1]);
    expect(surfaces.length).toBeGreaterThanOrEqual(3);
    expect(new Set(surfaces).size).toBe(surfaces.length);
  });
});

describe('the persistent CTA addresses both sides of the audience', () => {
  /**
   * The application serves the person who needs help as much as the person
   * offering it. Copy that only says "I want to help" turns the always-visible
   * CTA into a door with one name on it.
   */
  const GIVER_ONLY_ES = [/^quiero ayudar$/i, /^ayudar$/i, /^donar$/i];
  const GIVER_ONLY_EN = [/^i want to help$/i, /^donate$/i];

  it('keeps the chrome label neutral in Spanish', () => {
    for (const pattern of GIVER_ONLY_ES) {
      expect(es.nav.app).not.toMatch(pattern);
      expect(es.appCta.short).not.toMatch(pattern);
    }
  });

  it('keeps the chrome label neutral in English', () => {
    for (const pattern of GIVER_ONLY_EN) {
      expect(en.nav.app).not.toMatch(pattern);
      expect(en.appCta.short).not.toMatch(pattern);
    }
  });

  it('offers a distinct route for each intent in the invite block', () => {
    for (const t of [es, en]) {
      const { primary, secondary, tertiary } = t.appCta.invite;
      expect(new Set([primary, secondary, tertiary]).size).toBe(3);
    }
  });

  it('sends the always-visible CTA to the dual door, not the contribute flow', () => {
    for (const file of CHROME) {
      const source = read(file);
      const persistent = [
        ...source.matchAll(/href=\{appUrl\(APP_PATHS\.(\w+)\)\}/g),
      ].map((m) => m[1]);
      expect(persistent).not.toContain('contribute');
    }
  });
});

describe('app links point only at verified paths', () => {
  /**
   * Advertising a path the application does not serve is the same failure as a
   * DNS record that 404s — the visitor follows our invitation and lands
   * nowhere. Each of these answered 200 before it was written down.
   */
  const VERIFIED = ['/', '/aportar', '/avances', '/seguimiento'];

  it('declares nothing beyond the verified set', () => {
    expect(Object.values(APP_PATHS).every((p) => VERIFIED.includes(p))).toBe(
      true
    );
  });

  it('never deep-links a single emergency slug', () => {
    for (const path of Object.values(APP_PATHS)) {
      expect(path).not.toMatch(/^\/emergencias\//);
    }
  });

  it('builds absolute URLs on the application host', () => {
    expect(appUrl(APP_PATHS.home)).toBe(`${APP_URL}/`);
    expect(appUrl(APP_PATHS.contribute)).toBe(`${APP_URL}/aportar`);
  });
});

describe('the Markdown twin says what the page says', () => {
  it('carries all three routes in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      const section = appInviteSection(lang);
      const body = section.lines.join('\n');
      expect(body).toContain(appUrl(APP_PATHS.contribute));
      expect(body).toContain(appUrl(APP_PATHS.home));
      expect(body).toContain(appUrl(APP_PATHS.evidence));
    }
  });

  it('uses the language it was asked for', () => {
    expect(appInviteSection('es').heading).toBe(es.appCta.invite.title);
    expect(appInviteSection('en').heading).toBe(en.appCta.invite.title);
  });
});
