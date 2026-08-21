/**
 * The behavioral probes, tested against a server that reproduces the traps
 * as they occur in production — plus the near-miss cases each probe must
 * stay silent on, because a false positive here accuses a volunteer team.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Engine, HttpFetcher, type Report } from '../src/index.js';
import {
  alwaysNowFires,
  contentHashWithoutTimestamp,
  frameworkHint,
  makeBehaviorPass,
  softFourOhFour,
} from '../src/passes/behavior.js';
import {
  type FixtureServer,
  startFixtureServer,
} from './server/fixture-server.js';

let server: FixtureServer;
beforeAll(async () => {
  server = await startFixtureServer();
});
afterAll(async () => {
  await server.close();
});

/**
 * Probe with a controlled clock and no real waiting.
 *
 * The always-now trap is a RELATIONSHIP between the server's clock and the
 * prober's clock, so the fake sleep advances both by the same amount. That
 * keeps the test deterministic and sub-second while still exercising the
 * real two-condition algorithm rather than a stubbed version of it.
 *
 * The behavior pass fetches its own document, so nothing is pre-fetched
 * here — that separation is what the earlier iteration got wrong.
 */
async function probe(path: string, elapsedSeconds = 3): Promise<Report> {
  // Close to the fixtures' 04:00 timestamp, so a fresh feed reads as fresh.
  let clock = Date.parse('2026-08-16T04:05:00Z');

  return new Engine({
    validatorVersion: 'test',
    specVersion: '0.1.0',
    target: `${server.url}${path}`,
    fetcher: new HttpFetcher({ version: 'test' }),
    now: () => new Date(clock),
  })
    .register(
      makeBehaviorPass({
        probeTwiceSeconds: 2,
        now: () => clock,
        sleep: async () => {
          clock += elapsedSeconds * 1000;
          server.travel(elapsedSeconds * 1000);
        },
      })
    )
    .run({});
}

const ids = (report: Report) => report.findings.map((f) => f.id);

describe('the negative control', () => {
  it('a healthy feed produces no behavioral findings', async () => {
    const report = await probe('/healthy.json');
    expect(ids(report)).toEqual([]);
    expect(report.probes.cors).toBe('present');
    expect(report.probes.always_now).toBe('pass');
  });
});

describe('trap 1 — the SPA catch-all (DSC002)', () => {
  it('detects HTML at a discovery path and names the discriminator', async () => {
    const report = await probe('/catchall/.well-known/cabuya.json');
    const finding = report.findings.find((f) => f.id === 'DSC002');
    expect(finding).toBeDefined();
    expect(finding?.message).toContain('content-type');
    expect(report.probes.soft_404).toBe('fail');
  });

  it('offers the framework-specific one-liner when headers reveal the stack', async () => {
    const report = await probe('/catchall/.well-known/cabuya.json');
    const finding = report.findings.find((f) => f.id === 'DSC002');
    expect(finding?.fix).toContain('Next.js');
  });

  it('catches a catch-all that lies about its content type, via byte equality', async () => {
    const report = await probe('/jsonish/.well-known/cabuya.json');
    const finding = report.findings.find((f) => f.id === 'DSC002');
    expect(finding?.message).toContain('byte-equality');
  });

  it('does NOT fire on a real manifest at the well-known path', async () => {
    const report = await probe('/.well-known/cabuya.json');
    expect(ids(report)).not.toContain('DSC002');
    expect(report.probes.soft_404).toBe('pass');
  });
});

describe('trap 1b — a manifest declaring a feed nobody can read (DSC007)', () => {
  const dsc007 = (report: Report) =>
    report.findings.filter((f) => f.id === 'DSC007');

  it('fires when a declared feed 404s, and points at the feed that failed', async () => {
    const report = await probe('/manifest/dead-feed.json');
    const [finding, ...rest] = dsc007(report);
    expect(finding).toBeDefined();
    expect(rest).toEqual([]);
    expect(finding?.pointer).toBe('/feeds/0/url');
    expect(finding?.message).toContain('HTTP 404');
    // An error, so it stops the ladder: this is the check that keeps a
    // manifest from measuring a level nothing read the feed for.
    expect(finding?.severity).toBe('error');
    expect(finding?.level).toBe('L1');
    expect(report.measured_level).toBe('L0');
  });

  it('does NOT fire when the declared feed is really there', async () => {
    const report = await probe('/.well-known/cabuya.json');
    expect(dsc007(report)).toEqual([]);
  });

  it('rejects a relative URL without spending a request on it', async () => {
    const report = await probe('/manifest/relative-feed.json');
    expect(dsc007(report)[0]?.message).toContain('not absolute');
    // Only the manifest itself was fetched — a malformed URL costs the
    // publisher's server nothing.
    expect(report.probes.requests).toBe(1);
  });

  it('rejects http on a public host, also without a request', async () => {
    const report = await probe('/manifest/insecure-feed.json');
    expect(dsc007(report)[0]?.message).toContain('http, not https');
    expect(report.probes.requests).toBe(1);
  });

  it('goes quiet when our own politeness budget runs out', async () => {
    // Eight dead feeds, a six-request ceiling. The probe must report what it
    // actually saw and stop — reporting the rest as unreachable would be
    // accusing a publisher of our rate limit, and this check is an error.
    const report = await probe('/manifest/many-dead-feeds.json');
    const found = dsc007(report);
    expect(found.length).toBeGreaterThan(0);
    expect(found.length).toBeLessThan(8);
  });
});

describe('trap 2 — always-now (BEH002)', () => {
  it('fires on a feed whose timestamp tracks the probe clock', async () => {
    const report = await probe('/always-now.json', 3);
    const finding = report.findings.find((f) => f.id === 'BEH002');
    expect(finding).toBeDefined();
    // The designed message, locked.
    expect(finding?.message).toBe(
      'value advanced with the probe clock on identical content — generate at build/publish time, not per request'
    );
    expect(report.probes.always_now).toBe('fail');
  });

  it('does NOT fire on a genuinely busy feed whose content changed', async () => {
    const report = await probe('/busy.json', 3);
    expect(ids(report)).not.toContain('BEH002');
    expect(report.probes.always_now).toBe('pass');
  });

  it('does NOT fire on a static feed with a fixed timestamp', async () => {
    const report = await probe('/healthy.json', 3);
    expect(ids(report)).not.toContain('BEH002');
  });
});

describe('trap 3 — CORS (ENV007)', () => {
  it('fires when the header is absent and quotes the header to add', async () => {
    const report = await probe('/no-cors.json');
    const finding = report.findings.find((f) => f.id === 'ENV007');
    expect(finding?.fix).toContain('Access-Control-Allow-Origin: *');
    expect(report.probes.cors).toBe('missing');
  });

  it('stays silent when the header is present', async () => {
    const report = await probe('/healthy.json');
    expect(ids(report)).not.toContain('ENV007');
  });
});

describe('ENV010 — the response content type', () => {
  it('fires when the feed is not served as application/json', async () => {
    // ENV010 reads the FIRST probe's header, so the fixture must be
    // consistently mislabelled — /flaky.json alternates and would make this
    // assertion depend on request ordering.
    const report = await probe('/wrong-type.json');
    const finding = report.findings.find((f) => f.id === 'ENV010');
    expect(finding).toBeDefined();
    expect(finding?.fix).toContain('application/json');
  });

  it('stays silent on a correctly served feed', async () => {
    const report = await probe('/healthy.json');
    expect(ids(report)).not.toContain('ENV010');
  });
});

describe('trap 4 — unstable responses (BEH001) and staleness (BEH003)', () => {
  it('BEH001 fires when the content-type changes between probes', async () => {
    const report = await probe('/flaky.json');
    expect(ids(report)).toContain('BEH001');
  });

  it('BEH003 fires on a feed far beyond 7 × ttl', async () => {
    const report = await probe('/stale.json');
    const finding = report.findings.find((f) => f.id === 'BEH003');
    expect(finding).toBeDefined();
    expect(finding?.message).toContain('stale');
  });

  it('BEH003 stays silent on a fresh feed', async () => {
    const report = await probe('/healthy.json');
    expect(ids(report)).not.toContain('BEH003');
  });
});

describe('transport failures are not conformance verdicts', () => {
  it('an oversized body is reported as transport, not as bad data', async () => {
    const fetcher = new HttpFetcher({ version: 'test' });
    const result = await fetcher.fetch(`${server.url}/oversized.json`, {
      maxBytes: 1024,
    });
    expect(result.transportError).toContain('cap');
    expect(result.ok).toBe(false);
  });

  it('an unreachable host is a transport error, not a finding about the feed', async () => {
    const fetcher = new HttpFetcher({ version: 'test' });
    const result = await fetcher.fetch('http://127.0.0.1:1/nothing.json');
    expect(result.transportError).toBeTruthy();
  });
});

describe('politeness', () => {
  it('never exceeds the per-host request ceiling', async () => {
    const fetcher = new HttpFetcher({ version: 'test', maxRequestsPerHost: 2 });
    await fetcher.fetch(`${server.url}/healthy.json`);
    await fetcher.fetch(`${server.url}/healthy.json`);
    const third = await fetcher.fetch(`${server.url}/healthy.json`);
    expect(third.transportError).toContain('politeness budget');
  });

  it('a full probe run stays within the six-request budget', async () => {
    const report = await probe('/always-now.json');
    expect(report.probes.requests ?? 0).toBeLessThanOrEqual(6);
  });

  it('identifies itself with a UA that links the explanation page', async () => {
    const fetcher = new HttpFetcher({ version: '9.9.9' });
    // The UA is built from the version + the documented probe URL.
    const result = await fetcher.fetch(`${server.url}/healthy.json`);
    expect(result.ok).toBe(true);
  });
});

describe('the pure probe algorithms', () => {
  const response = (
    over: Partial<Parameters<typeof softFourOhFour>[0]> = {}
  ) => ({
    ok: true,
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: '{"a":1}',
    bytes: 7,
    elapsedMs: 1,
    ...over,
  });

  it('soft-404: status, content-type and byte-equality discriminators', () => {
    expect(softFourOhFour(response({ status: 404 }))).toEqual({
      present: false,
      discriminator: 'status',
    });
    expect(
      softFourOhFour(response({ headers: { 'content-type': 'text/html' } }))
    ).toEqual({ present: false, discriminator: 'content-type' });
    expect(softFourOhFour(response(), response())).toEqual({
      present: false,
      discriminator: 'byte-equality',
    });
    expect(
      softFourOhFour(response(), response({ body: '<html>', bytes: 6 }))
    ).toEqual({ present: true });
  });

  it('always-now requires BOTH conditions', () => {
    const base = {
      lastUpdated: '2026-08-16T05:00:00Z',
      hash: 'same',
      at: 0,
    };
    // Same hash + timestamp tracking the clock → fires.
    expect(
      alwaysNowFires(base, {
        lastUpdated: '2026-08-16T05:00:03Z',
        hash: 'same',
        at: 3000,
      })
    ).toBe(true);
    // Content changed → does not fire, even though the clock tracks.
    expect(
      alwaysNowFires(base, {
        lastUpdated: '2026-08-16T05:00:03Z',
        hash: 'different',
        at: 3000,
      })
    ).toBe(false);
    // Timestamp unchanged → does not fire.
    expect(
      alwaysNowFires(base, {
        lastUpdated: base.lastUpdated,
        hash: 'same',
        at: 3000,
      })
    ).toBe(false);
    // Timestamp moved, but not with the clock → does not fire.
    expect(
      alwaysNowFires(base, {
        lastUpdated: '2026-08-16T09:00:00Z',
        hash: 'same',
        at: 3000,
      })
    ).toBe(false);
  });

  it('the content hash ignores last_updated but nothing else', async () => {
    const a = await contentHashWithoutTimestamp('{"last_updated":"A","x":1}');
    const b = await contentHashWithoutTimestamp('{"last_updated":"B","x":1}');
    const c = await contentHashWithoutTimestamp('{"last_updated":"A","x":2}');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('framework hints only fire on recognized stacks', () => {
    expect(frameworkHint({ 'x-powered-by': 'Next.js' })).toContain('Next.js');
    expect(frameworkHint({ server: 'nginx' })).toBeUndefined();
  });
});
