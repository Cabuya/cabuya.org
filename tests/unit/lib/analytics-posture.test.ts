/**
 * What this site records, asserted rather than promised.
 *
 * The footer carries one sentence: cookieless, aggregate, nothing about who you
 * are. A project whose central argument is that an unverifiable claim is worth
 * nothing cannot make an unverifiable claim about itself — so the sentence has
 * tests, and they are the kind that fail when somebody adds a tracker rather
 * than the kind that restate the intention.
 *
 * The strongest assertion here is the absence one: **no custom analytics event
 * exists anywhere in the shipped code**. Cloudflare Web Analytics has no event
 * API, so there is nothing for an event to reach — and 299 lines of dormant
 * tracking code was deleted rather than left, because dead tracking code is a
 * privacy claim nobody can verify by reading the page.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

function sourceFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|astro|svelte|mjs|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const SOURCES = [
  ...sourceFiles(join(ROOT, 'src')),
  ...sourceFiles(join(ROOT, 'functions')),
];

describe('the previous provider is gone', () => {
  it('is referenced nowhere in the shipped source', () => {
    const offenders = SOURCES.filter((file) => {
      const text = readFileSync(file, 'utf-8');
      // The word appears in one comment explaining why the code was removed.
      // Anything that could *call* it is what this is looking for.
      return /umami\.(track|identify)|window\.umami|cloud\.umami\.is|data-umami/i.test(
        text
      );
    });
    expect(offenders.map((f) => f.slice(ROOT.length + 1))).toEqual([]);
  });

  it('leaves no analytics module to import', () => {
    expect(existsSync(join(ROOT, 'src/lib/analytics.ts'))).toBe(false);
  });

  it('has no custom-event call anywhere', () => {
    const offenders = SOURCES.filter((file) =>
      /\btrackEvent\s*\(|\btrackScrollDepth\s*\(|\bsetupOutboundTracking\s*\(/.test(
        readFileSync(file, 'utf-8')
      )
    );
    expect(offenders.map((f) => f.slice(ROOT.length + 1))).toEqual([]);
  });

  it('never mentions Google Analytics', () => {
    const offenders = SOURCES.filter((file) =>
      /gtag\(|googletagmanager|google-analytics\.com|GA_MEASUREMENT/i.test(
        readFileSync(file, 'utf-8')
      )
    );
    expect(offenders.map((f) => f.slice(ROOT.length + 1))).toEqual([]);
  });
});

describe('the beacon is env-gated', () => {
  const constances = readFileSync(join(ROOT, 'src/lib/constances.ts'), 'utf-8');

  it('loads only when a token is configured', () => {
    expect(constances).toContain('PUBLIC_CF_BEACON_TOKEN');
    // `Boolean(token) &&` is the gate: a fork with no token sends nothing.
    expect(constances).toMatch(
      /enabled:\s*\n?\s*Boolean\(cloudflareBeaconToken\)/
    );
  });

  it('is off outside production unless explicitly turned on', () => {
    expect(constances).toContain('PUBLIC_CF_BEACON_ENABLE');
    expect(constances).toContain('import.meta.env.PROD');
  });
});

describe.skipIf(!existsSync(DIST))('the built site', () => {
  const pages = ['index.html', 'es/index.html', 'registry/index.html'];
  const read = (page: string) => readFileSync(join(DIST, page), 'utf-8');

  it('ships no beacon when no token was configured', () => {
    // Which is the state of every local build and every fork's CI. A build
    // that quietly phoned home from a contributor's laptop would be the exact
    // thing the footer sentence says does not happen.
    for (const page of pages) {
      expect(read(page), page).not.toContain('cloudflareinsights.com/beacon');
      expect(read(page), page).not.toContain('data-cf-beacon');
    }
  });

  it('sets no cookie from the page', () => {
    for (const page of pages) {
      expect(read(page), page).not.toMatch(/document\.cookie\s*=/);
    }
  });

  it('allows exactly one third-party script origin, and it is the beacon', () => {
    const headers = readFileSync(join(DIST, '_headers'), 'utf-8');
    // The header line, not the first line that mentions the header. `_headers`
    // explains the policy in a comment above it, and a substring match finds
    // the prose — which then reports zero script origins and reads as though
    // the beacon had been removed.
    const csp = headers
      .split('\n')
      .find((line) => /^\s*Content-Security-Policy:/.test(line));
    expect(
      csp,
      'no Content-Security-Policy header line in dist/_headers'
    ).toBeTruthy();

    const scriptSrc = (csp as string)
      .split(';')
      .find((part) => part.trim().startsWith('script-src'));
    const origins = (scriptSrc ?? '')
      .split(/\s+/)
      .filter((token) => token.startsWith('https://'));
    expect(origins).toEqual(['https://static.cloudflareinsights.com']);

    // And nothing may be *connected* to off-origin at all: the validator, the
    // badge, the status endpoint and the form are all same-origin.
    const connectSrc = (csp as string)
      .split(';')
      .find((part) => part.trim().startsWith('connect-src'));
    expect(connectSrc?.trim()).toBe("connect-src 'self'");
  });
});
