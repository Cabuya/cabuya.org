/**
 * The Function's controls, exercised directly.
 *
 * The SSRF guard has its own matrix in `ssrf-guard.test.ts`. This covers the
 * behaviours around it, which are the ones a reviewer cannot verify by reading:
 * that a redirect hop is re-guarded, that the rate counters are what they claim
 * to be, and that the user agent the probe page documents is the one the code
 * actually sends.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertAllowedUrl } from '../../../functions/lib/ssrf-guard';

const ROOT = process.cwd();
const source = readFileSync(join(ROOT, 'functions/api/validate.ts'), 'utf-8');

describe('validate function — redirects are re-guarded', () => {
  it('follows redirects manually', () => {
    /*
     * `redirect: 'manual'` is the entire mechanism. With automatic following,
     * a 302 to a metadata address is followed inside `fetch` and the guard
     * never sees it — the check on the initial URL becomes decorative.
     */
    expect(source).toContain("redirect: 'manual'");
  });

  it('runs the guard again on the destination of every hop', () => {
    const hop = source.slice(
      source.indexOf('A redirect: re-guard'),
      source.indexOf('Read with a hard byte cap')
    );
    expect(hop).toContain('assertAllowedUrl(next)');
    expect(hop).toContain('new URL(location, target.href)');
  });

  it('the guard would in fact reject the classic redirect target', () => {
    // Belt and braces: the hop calls the guard, and the guard says no.
    expect(assertAllowedUrl('https://169.254.169.254/latest/').allowed).toBe(
      false
    );
  });

  it('caps the number of hops', () => {
    expect(source).toContain('maxRedirects: 3');
  });
});

describe('validate function — the limits are the documented ones', () => {
  it('matches the control table', () => {
    expect(source).toContain('requestTimeoutMs: 8_000');
    expect(source).toContain('runBudgetMs: 25_000');
    expect(source).toContain('maxBytes: 5 * 1024 * 1024');
    expect(source).toContain('perIpPerMinute: 10');
    expect(source).toContain('perHostPerHour: 60');
  });

  it('aborts the stream rather than buffering an oversized body', () => {
    const read = source.slice(source.indexOf('Read with a hard byte cap'));
    expect(read).toContain('reader.cancel()');
    expect(read).toContain('bytes > LIMITS.maxBytes');
  });

  it('answers 429 with a Retry-After', () => {
    expect(source).toContain("'Retry-After'");
    expect(source).toContain('429');
  });

  it('limits the probed host across all callers, not per caller', () => {
    // A hundred people checking one feed is still a hundred requests to that
    // feed. A per-caller host limit would not protect the publisher at all.
    const host = source.slice(source.indexOf("'host',"));
    expect(host).toContain('guard.url.hostname');
  });
});

describe('validate function — politeness', () => {
  it('sends a user agent that names the project and links to an explanation', () => {
    expect(source).toContain(
      "'CabuyaValidator/0.1 (+https://cabuya.org/developers/validator/probe)'"
    );
  });

  it('sends the same string the probe page documents', () => {
    // The page exists because the UA points at it. If the two drift, a
    // publisher reading their logs follows a URL that describes a different
    // agent.
    const page = readFileSync(
      join(ROOT, 'src/components/pages/ProbePage.astro'),
      'utf-8'
    );
    const ua = source.match(/'(CabuyaValidator\/[^']+)'/)?.[1];
    expect(ua).toBeTruthy();
    expect(page).toContain(ua as string);
  });

  it('sends no Referer', () => {
    expect(source).toContain('No Referer');
    expect(source).not.toMatch(/Referer:\s*['"`]/);
  });
});

describe('validate function — retention and CORS', () => {
  it('sets no-store on every response', () => {
    expect(source).toContain("'Cache-Control': 'no-store'");
  });

  it('sends no Access-Control-Allow-Origin, and says why', () => {
    /*
     * The protocol requires *feeds* to send ACAO: *. This endpoint is the
     * opposite case — an open policy would make it a free SSRF proxy for any
     * site that wanted one. The two rules point opposite ways because they
     * protect different things, and the file has to say so.
     */
    expect(source).not.toMatch(/'Access-Control-Allow-Origin':\s*'\*'/);
    expect(source).toContain('free SSRF proxy');
  });

  it('never logs', () => {
    const code = source
      .split('\n')
      .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
      .join('\n');
    expect(code).not.toMatch(/console\.\w+\(/);
  });
});

describe('validate function — honest failure kinds', () => {
  it('distinguishes a refused URL, a transport failure and a bad document', () => {
    // The CLI's exit-code distinction, carried into the response. An agent
    // that cannot tell these apart will rewrite correct records after a DNS
    // blip.
    // Matched on the argument rather than the call text: the formatter wraps
    // these across lines and back again as the messages change length.
    for (const kind of ['rejected', 'transport', 'parse', 'rate-limited']) {
      expect(source, kind).toMatch(new RegExp(`'${kind}',`));
    }
  });

  it('returns 502 for a transport failure, not 200 with an empty report', () => {
    const transport = source.slice(source.indexOf("'transport',"));
    expect(transport.slice(0, 400)).toContain('502');
  });

  it('says a transport failure is not a verdict on the data', () => {
    expect(source).toContain('says nothing about your data');
  });
});
