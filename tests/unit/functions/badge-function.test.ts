/**
 * The badge endpoint, invoked directly with a fake KV.
 *
 * The Function is a pure function of a URL and a KV read, so it can be called
 * rather than described — which is the difference between asserting that the
 * cache header exists in the source and asserting that a response carries it.
 *
 * What is tested here is mostly what the endpoint refuses to do: invent a
 * state, serve an id nobody registered, or crash on a malformed record and take
 * every README that embeds it down with it.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPEC_VERSION } from '@cabuya/validator';
import { describe, expect, it } from 'vitest';
import { allPublishers } from '@/lib/registry-loader';
import { onRequestGet } from '../../../functions/badge/[publisher]';
import { REGISTRY_IDS } from '../../../functions/lib/registry-ids';
import { onRequestGet as statusJson } from '../../../functions/registry/status.json';

/** A KV namespace backed by a Map, read side only — which is all it has. */
const kv = (entries: Record<string, string> = {}) => ({
  get: async (key: string) => entries[key] ?? null,
});

const call = (
  path: string,
  publisher: string,
  namespace?: { get: (key: string) => Promise<string | null> }
) =>
  onRequestGet({
    request: new Request(`https://cabuya.org${path}`),
    env: { REGISTRY_STATUS: namespace },
    params: { publisher },
  });

const CONFORMING = JSON.stringify({
  publisher_id: 'corag',
  state: 'conforming',
  level: 'L2',
  checked_at: '2026-08-17T00:00:00.000Z',
  version: '0.1',
});

describe('the id namespace matches the registry', () => {
  it('holds exactly the ids in the tree', () => {
    expect([...REGISTRY_IDS].sort()).toEqual(
      allPublishers()
        .map((entry) => entry.publisher_id)
        .sort()
    );
  });
});

describe('serving a badge', () => {
  it('answers with an SVG and the decided cache policy', async () => {
    const response = await call('/badge/corag.svg', 'corag.svg', kv());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'image/svg+xml; charset=utf-8'
    );
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=900, stale-while-revalidate=3600'
    );
  });

  it('is embeddable cross-origin, and says so deliberately', async () => {
    const response = await call('/badge/corag.svg', 'corag.svg', kv());
    // The badge exists to live in other people's documents.
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('X-Frame-Options')).toBeNull();
    // But it may not be sniffed into something other than an image.
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('serves what KV says, not what it would prefer', async () => {
    const response = await call(
      '/badge/corag.svg',
      'corag.svg',
      kv({
        'status:corag': CONFORMING,
      })
    );
    const svg = await response.text();
    expect(svg).toContain('compatible');
    expect(svg).toContain('Cabuya 0.1');
  });

  it('says not yet measured when KV has nothing', async () => {
    const svg = await (
      await call('/badge/corag.svg', 'corag.svg', kv())
    ).text();
    expect(svg).toContain('not yet measured');
  });

  it('says not yet measured when there is no KV binding at all', async () => {
    const svg = await (await call('/badge/corag.svg', 'corag.svg')).text();
    expect(svg).toContain('not yet measured');
  });

  it('treats a malformed record as absent rather than throwing', async () => {
    const svg = await (
      await call(
        '/badge/corag.svg',
        'corag.svg',
        kv({ 'status:corag': '{oops' })
      )
    ).text();
    expect(svg).toContain('not yet measured');
  });

  it('refuses a state it does not have a label for', async () => {
    const svg = await (
      await call(
        '/badge/corag.svg',
        'corag.svg',
        kv({ 'status:corag': JSON.stringify({ state: 'excellent' }) })
      )
    ).text();
    expect(svg).toContain('not yet measured');
    expect(svg).not.toContain('excellent');
  });

  it('honours ?lang=es', async () => {
    const response = await call(
      '/badge/corag.svg?lang=es',
      'corag.svg',
      kv({
        'status:corag': CONFORMING,
      })
    );
    const svg = await response.text();
    expect(svg).toContain('compatible con Cabuya 0.1');
  });

  it('honours ?style=flat', async () => {
    const svg = await (
      await call('/badge/corag.svg?style=flat', 'corag.svg', kv())
    ).text();
    expect(svg).not.toContain('linearGradient');
  });

  it('works without the extension, for anyone who omits it', async () => {
    expect((await call('/badge/corag', 'corag', kv())).status).toBe(200);
  });
});

describe('an id nobody registered', () => {
  it('404s rather than minting a plausible badge', async () => {
    const response = await call('/badge/acme.svg', 'acme.svg', kv());
    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).not.toContain('<svg');
    expect(body.toLowerCase()).not.toContain('cabuya');
  });

  it('404s even when KV somehow holds a record for it', async () => {
    const response = await call(
      '/badge/acme.svg',
      'acme.svg',
      kv({ 'status:acme': CONFORMING })
    );
    expect(response.status).toBe(404);
  });
});

describe('the version the badge names', () => {
  it('is the major.minor of the validator’s spec version', () => {
    const source = readFileSync(
      join(process.cwd(), 'functions/badge/[publisher].ts'),
      'utf-8'
    );
    const fallback = source.match(/FALLBACK_VERSION = '([^']+)'/)?.[1];
    expect(fallback).toBeTruthy();
    expect(SPEC_VERSION.startsWith(`${fallback}.`)).toBe(true);
  });
});

describe('the status endpoint the pages refresh from', () => {
  const callStatus = (namespace?: {
    get: (key: string) => Promise<string | null>;
  }) =>
    statusJson({
      request: new Request('https://cabuya.org/registry/status.json'),
      env: { REGISTRY_STATUS: namespace },
      params: {},
    });

  it('agrees with the badge on freshness, so the two cannot contradict', async () => {
    const response = await callStatus(kv());
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=900, stale-while-revalidate=3600'
    );
  });

  it('returns an empty map rather than failing when nothing is measured', async () => {
    const body = await (await callStatus(kv())).json();
    expect(body).toEqual({ statuses: {} });
  });

  it('returns what KV holds, keyed by publisher', async () => {
    const body = (await (
      await callStatus(kv({ 'status:corag': CONFORMING }))
    ).json()) as { statuses: Record<string, { state: string }> };
    expect(body.statuses.corag.state).toBe('conforming');
    expect(Object.keys(body.statuses)).toEqual(['corag']);
  });

  it('drops a malformed record instead of blanking the whole document', async () => {
    const reporteCo = JSON.stringify({
      publisher_id: 'reporte-co',
      state: 'failing',
      level: 'L1',
      checked_at: '2026-08-17T00:00:00.000Z',
    });
    const body = (await (
      await callStatus(
        kv({ 'status:corag': '{oops', 'status:reporte-co': reporteCo })
      )
    ).json()) as { statuses: Record<string, { state: string }> };
    expect(Object.keys(body.statuses)).toEqual(['reporte-co']);
    expect(body.statuses['reporte-co'].state).toBe('failing');
  });

  it('drops a record stored under the wrong key', async () => {
    // `status:reporte-co` holding a record that says it is about corag is a bad
    // write; trusting either half of it would attach a measurement to a
    // publisher it was never made against.
    const body = (await (
      await callStatus(kv({ 'status:reporte-co': CONFORMING }))
    ).json()) as { statuses: Record<string, unknown> };
    expect(body.statuses).toEqual({});
  });
});
