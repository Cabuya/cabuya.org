/**
 * The trap-reproducing fixture server.
 *
 * TEST-ONLY — Node APIs are fine here; the validator CORE stays pure.
 *
 * Every route reproduces a failure the founding analysis actually hit in
 * production, so the probes are tested against the real shape of the
 * problem rather than a hypothetical one:
 *
 *   /catchall/*        an SPA catch-all: any path answers 200 text/html
 *                      with the SAME bytes as `/` (the soft-404 trap)
 *   /jsonish/*         a catch-all that answers 200 application/json with
 *                      the same bytes as `/` (the byte-equality
 *                      discriminator's reason for existing)
 *   /always-now.json   a feed whose last_updated is regenerated per request
 *   /busy.json         the NEAR-MISS: content genuinely changes between
 *                      probes, so always-now must NOT fire
 *   /no-cors.json      a conforming feed served without the CORS header
 *   /healthy.json      a fully conforming feed (the negative control)
 *   /.well-known/cabuya.json   a conforming manifest
 *   /redirect/n        an n-hop redirect chain
 *   /oversized.json    a body past the size cap
 *   /flaky.json        alternates its content-type on every request
 *   /wrong-type.json   conforming JSON served as text/plain (ENV010)
 */

import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const ROOT_HTML =
  '<!doctype html><html><head><title>App</title></head><body><div id="root"></div></body></html>';

export interface FixtureServer {
  url: string;
  /** How many times each path was requested — the politeness assertions. */
  hits: Map<string, number>;
  /**
   * Advance the server's notion of "now" by `ms`.
   *
   * The always-now trap is a relationship between the server's clock and
   * the prober's clock, so testing it deterministically requires moving
   * both together. This is the server half; the test moves the validator's
   * injected clock by the same amount.
   */
  travel(ms: number): void;
  close(): Promise<void>;
}

function conformingFeed(lastUpdated: string, extra: object = {}): string {
  return JSON.stringify({
    last_updated: lastUpdated,
    ttl: 300,
    version: '0.1.0',
    publisher_id: 'example-app',
    license: 'CC-BY-4.0',
    permitted_use: ['display'],
    attribution: 'Example App',
    data: {
      places: [
        {
          id: 'p-001',
          publisher_id: 'example-app',
          name: 'Coliseo Municipal',
          place_kind: 'shelter',
          municipality_code: '66001',
          address_text: 'Avenida Ejemplo 12-34',
          lat: 4.8133,
          lon: -75.6961,
          lifecycle_status: 'active',
          last_confirmed_at: '2026-08-16T03:00:00Z',
          source: { source_id: 'example-app' },
          public_url: 'https://example-app.org/places/p-001',
        },
      ],
    },
    ...extra,
  });
}

const MANIFEST = JSON.stringify({
  protocol: { name: 'cabuya', spec_version: '0.1.0' },
  publisher: {
    publisher_id: 'example-app',
    canonical_url: 'https://example-app.org',
  },
  conformance_target: 'L2',
  license: 'CC-BY-4.0',
  feeds: [
    {
      name: 'places',
      url: 'https://example-app.org/feeds/places.json',
      entity: 'place',
      profile: 'core',
    },
  ],
});

export async function startFixtureServer(): Promise<FixtureServer> {
  const hits = new Map<string, number>();
  /** Counter that makes /busy.json genuinely change between probes. */
  let busyCounter = 0;
  /** Offset applied to the server's clock — see `travel()`. */
  let clockOffsetMs = 0;
  const serverNow = (): string =>
    new Date(Date.now() + clockOffsetMs).toISOString();

  const server: Server = createServer((request, response) => {
    const path = (request.url ?? '/').split('?')[0] ?? '/';
    hits.set(path, (hits.get(path) ?? 0) + 1);

    const send = (
      status: number,
      body: string,
      headers: Record<string, string> = {}
    ): void => {
      response.writeHead(status, {
        'content-length': Buffer.byteLength(body),
        ...headers,
      });
      response.end(body);
    };

    const json = (body: string, headers: Record<string, string> = {}): void =>
      send(200, body, {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        ...headers,
      });

    // The site root — the byte-equality reference for the soft-404 probe.
    if (path === '/') {
      return send(200, ROOT_HTML, {
        'content-type': 'text/html; charset=utf-8',
      });
    }

    // Trap 1: the SPA catch-all — HTML at every path.
    if (path.startsWith('/catchall/')) {
      return send(200, ROOT_HTML, {
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Next.js',
      });
    }

    // Trap 1b: a catch-all that lies about its content type — only the
    // byte-equality discriminator catches this one.
    if (path.startsWith('/jsonish/')) {
      return send(200, ROOT_HTML, {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      });
    }

    // Trap 2: always-now — the timestamp tracks the clock, content does not.
    if (path === '/always-now.json') {
      return json(conformingFeed(serverNow()));
    }

    // Near-miss for trap 2: the content genuinely changes each probe.
    if (path === '/busy.json') {
      busyCounter += 1;
      return json(
        conformingFeed(serverNow(), {
          x_example_counter: busyCounter,
        })
      );
    }

    // Trap 3: no CORS header.
    if (path === '/no-cors.json') {
      return send(200, conformingFeed('2026-08-16T04:00:00Z'), {
        'content-type': 'application/json; charset=utf-8',
      });
    }

    // Trap 4: a redirect chain.
    const redirect = /^\/redirect\/(\d+)$/.exec(path);
    if (redirect?.[1]) {
      const remaining = Number(redirect[1]);
      if (remaining > 0) {
        return send(302, '', { location: `/redirect/${remaining - 1}` });
      }
      return json(conformingFeed('2026-08-16T04:00:00Z'));
    }

    // Trap 5: an oversized body.
    if (path === '/oversized.json') {
      return json(JSON.stringify({ padding: 'x'.repeat(6 * 1024 * 1024) }));
    }

    // Trap 6: unstable content-type between probes.
    if (path === '/flaky.json') {
      // Alternates on EVERY request, so any two consecutive probes disagree.
      const seen = hits.get(path) ?? 1;
      return send(200, conformingFeed('2026-08-16T04:00:00Z'), {
        'content-type':
          seen % 2 === 1
            ? 'application/json; charset=utf-8'
            : 'text/plain; charset=utf-8',
        'access-control-allow-origin': '*',
      });
    }

    // A conforming feed served under the wrong content type (ENV010).
    if (path === '/wrong-type.json') {
      return send(200, conformingFeed('2026-08-16T04:00:00Z'), {
        'content-type': 'text/plain; charset=utf-8',
        'access-control-allow-origin': '*',
      });
    }

    // A stale-but-conforming feed (BEH003).
    if (path === '/stale.json') {
      return json(conformingFeed('2020-01-01T00:00:00Z'));
    }

    // The negative control: everything correct.
    if (path === '/healthy.json') {
      return json(conformingFeed('2026-08-16T04:00:00Z'));
    }

    if (path === '/.well-known/cabuya.json') {
      return json(MANIFEST);
    }

    if (path === '/robots.txt') {
      return send(200, 'User-agent: *\nAllow: /\n', {
        'content-type': 'text/plain; charset=utf-8',
      });
    }

    return send(404, 'not found', { 'content-type': 'text/plain' });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    hits,
    travel: (ms: number) => {
      clockOffsetMs += ms;
    },
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      ),
  };
}
