/**
 * What this site records, asserted rather than promised.
 *
 * The footer carries one sentence: cookieless, aggregate, nothing about who you
 * are. A project whose central argument is that an unverifiable claim is worth
 * nothing cannot make an unverifiable claim about itself — so the sentence has
 * tests, and they are the kind that fail when somebody adds a tracker rather
 * than the kind that restate the intention.
 *
 * Umami Cloud is the provider. It is cookieless and sets no identifier that
 * survives a page load, which is why there is no consent banner — but "no
 * banner needed" is itself a claim, so it is asserted here rather than
 * believed.
 *
 * Umami *does* have an event API, unlike the provider it replaced. That makes
 * the absence assertions below the important ones: no event exists in the
 * shipped code today, and if one is added it must be added deliberately, not
 * arrive with a copied snippet. 299 lines of dormant tracking code were deleted
 * once already, because dead tracking code is a privacy claim nobody can verify
 * by reading the page.
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

describe('the provider is loaded in exactly one place', () => {
  it('names the script host only where the policy expects it', () => {
    /*
     * Two files may mention `cloud.umami.is`: the constant that holds the URL
     * and the head that injects it. A third would be a second loader — the way
     * a site ends up counting every page view twice.
     */
    const offenders = SOURCES.filter((file) =>
      /cloud\.umami\.is/.test(readFileSync(file, 'utf-8'))
    ).map((f) => f.slice(ROOT.length + 1));
    expect(offenders.sort()).toEqual([
      'src/components/BaseHead.astro',
      'src/lib/constances.ts',
    ]);
  });

  it('has no ad-hoc tracking module', () => {
    /*
     * Events, when they come, belong in a typed catalogue that this test can
     * read. A loose `analytics.ts` with a bare `track()` is how event names get
     * misspelled and silently stop existing.
     */
    expect(existsSync(join(ROOT, 'src/lib/analytics.ts'))).toBe(false);
  });

  it('emits no custom event yet', () => {
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

  it('allows only the two analytics origins, and names them', () => {
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
    expect(origins.sort()).toEqual([
      'https://cloud.umami.is',
      'https://static.cloudflareinsights.com',
    ]);

    /*
     * `connect-src` allows Umami and nothing else off-origin. It has to: the
     * script loads from that host and posts page views back to `/api/send` on
     * it, so a policy that allowed only the load would produce a script that
     * runs and reports nothing — analytics that look configured and are not.
     *
     * Everything the site does itself — the validator, the badge, the status
     * endpoint, the form — stays same-origin.
     */
    const connectSrc = (csp as string)
      .split(';')
      .find((part) => part.trim().startsWith('connect-src'));
    expect(connectSrc?.trim()).toBe(
      "connect-src 'self' https://cloud.umami.is"
    );
  });
});
