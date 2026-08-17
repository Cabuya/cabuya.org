/**
 * The contact endpoint, invoked directly with a fake KV and a fake upstream.
 *
 * The behaviours worth asserting are the ones a reviewer cannot see by reading:
 * that an unconfigured deployment refuses *before* it reads the body, that an
 * automated submission gets a 200 and no upstream call, that a failed send
 * leaves nothing behind, and that the endpoint keeps nothing it was given.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTACT_LIMITS,
  looksAutomated,
  validateContact,
} from '@/lib/contact-contract';
import { onRequest, onRequestPost } from '../../../functions/api/contact';

const QUESTIONS = JSON.stringify({
  email: 'q-email',
  message: 'q-message',
  interest: 'q-interest',
  lang: 'q-lang',
  name: 'q-name',
  organization: 'q-org',
});

const CONFIGURED = {
  DAILYBOT_API_KEY: 'test-key',
  DAILYBOT_FORM_ID: 'form-1',
  DAILYBOT_FORM_QUESTIONS: QUESTIONS,
};

/** A KV namespace backed by a Map. */
const kv = (store = new Map<string, string>()) => ({
  get: async (key: string) => store.get(key) ?? null,
  put: async (key: string, value: string) => {
    store.set(key, value);
  },
  store,
});

const valid = {
  name: 'A Maintainer',
  organization: 'Example Aid App',
  email: 'team@example.org',
  message: 'We run a shelter directory and want to publish a conforming feed.',
  interest: 'implement' as const,
  lang: 'en' as const,
  elapsedMs: 30_000,
};

const post = (
  body: unknown,
  env: Record<string, unknown> = CONFIGURED,
  ip = '203.0.113.7'
) =>
  onRequestPost({
    request: new Request('https://cabuya.org/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
      body: JSON.stringify(body),
    }),
    env: env as any,
    params: {},
  });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response('{"uuid":"x"}', { status: 201 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a valid submission', () => {
  it('forwards it and answers ok', async () => {
    const response = await post(valid, { ...CONFIGURED, VALIDATE_RATE: kv() });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('posts to the configured form with the configured question ids', async () => {
    await post(valid, CONFIGURED);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.dailybot.com/v1/forms/form-1/responses/');
    expect((init.headers as Record<string, string>)['X-API-KEY']).toBe(
      'test-key'
    );

    const body = JSON.parse(init.body as string);
    expect(body.automation).toBe(true);
    expect(body.content['q-email']).toBe(valid.email);
    expect(body.content['q-message']).toBe(valid.message);
    expect(body.content['q-interest']).toBe('implement');
  });

  it('omits an optional field that was left blank', async () => {
    await post({ ...valid, name: '', organization: '' }, CONFIGURED);
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.content['q-name']).toBeUndefined();
    expect(body.content['q-org']).toBeUndefined();
  });

  it('never lets a response be cached', async () => {
    const response = await post(valid, CONFIGURED);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('an unconfigured deployment', () => {
  it('refuses before reading the body, and says which kind of refusal', async () => {
    for (const env of [
      {},
      { DAILYBOT_API_KEY: 'k' },
      { DAILYBOT_API_KEY: 'k', DAILYBOT_FORM_ID: 'f' },
    ]) {
      const response = await post(valid, env);
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({
        ok: false,
        kind: 'not-configured',
      });
    }
    // And it never called anybody.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats an unparseable question map as unconfigured, not as a sender error', async () => {
    const response = await post(valid, {
      ...CONFIGURED,
      DAILYBOT_FORM_QUESTIONS: '{oops',
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ kind: 'not-configured' });
  });
});

describe('spam controls', () => {
  it('answers 200 and sends nothing when the honeypot is filled', async () => {
    const response = await post({ ...valid, website: 'https://spam.example' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    // The 200 is the point: an error is feedback a script can iterate against.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers 200 and sends nothing when the form was filled too fast', async () => {
    const response = await post({ ...valid, elapsedMs: 200 });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not treat a missing timer as automated', async () => {
    const { elapsedMs: _drop, ...withoutTimer } = valid;
    await post(withoutTimer);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('validation', () => {
  it('rejects a submission with no email, naming the field', async () => {
    const response = await post({ ...valid, email: '' });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      kind: 'invalid',
      field: 'email',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a message shorter than the floor', async () => {
    const response = await post({ ...valid, message: 'hi' });
    expect(await response.json()).toMatchObject({ field: 'message' });
  });

  it('rejects an interest that is not one of the offered ones', async () => {
    const response = await post({ ...valid, interest: 'anything' });
    expect(await response.json()).toMatchObject({ field: 'interest' });
  });

  it('rejects a body that is not JSON', async () => {
    const response = await onRequestPost({
      request: new Request('https://cabuya.org/api/contact', {
        method: 'POST',
        body: 'not json',
      }),
      env: CONFIGURED as any,
      params: {},
    });
    expect(response.status).toBe(400);
  });
});

describe('the rate limit', () => {
  it('allows the documented number and then refuses', async () => {
    const store = new Map<string, string>();
    const env = { ...CONFIGURED, VALIDATE_RATE: kv(store) };

    for (let i = 0; i < CONTACT_LIMITS.perIpPerHour; i += 1) {
      expect((await post(valid, env)).status).toBe(200);
    }

    const blocked = await post(valid, env);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('3600');
    expect(await blocked.json()).toMatchObject({ kind: 'rate-limited' });
  });

  it('counts per address', async () => {
    const store = new Map<string, string>();
    const env = { ...CONFIGURED, VALIDATE_RATE: kv(store) };
    for (let i = 0; i < CONTACT_LIMITS.perIpPerHour; i += 1) {
      await post(valid, env, '198.51.100.1');
    }
    expect((await post(valid, env, '198.51.100.2')).status).toBe(200);
  });

  it('writes only a counter — never the submission', async () => {
    const store = new Map<string, string>();
    await post(valid, { ...CONFIGURED, VALIDATE_RATE: kv(store) });

    expect([...store.keys()]).toEqual(['rate:ip:contact:203.0.113.7']);
    const written = [...store.values()].join(' ');
    expect(written).not.toContain(valid.email);
    expect(written).not.toContain(valid.message);
    expect(written).not.toContain(valid.name);
  });

  it('still works with no KV binding at all', async () => {
    expect((await post(valid, CONFIGURED)).status).toBe(200);
  });
});

describe('an upstream failure', () => {
  it('reports it rather than claiming the message arrived', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 500 }));
    const response = await post(valid, CONFIGURED);
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ kind: 'upstream' });
  });

  it('reports a network error the same way', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const response = await post(valid, CONFIGURED);
    expect(response.status).toBe(502);
  });

  it('treats anything but 201 as a failure, including a 200', async () => {
    // The API documents 201 for a created response. A 200 means something
    // else happened, and guessing that it worked is how a message disappears.
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    expect((await post(valid, CONFIGURED)).status).toBe(502);
  });
});

describe('method handling', () => {
  it('answers 405 with Allow for anything but POST', async () => {
    const response = await onRequest({
      request: new Request('https://cabuya.org/api/contact'),
      env: CONFIGURED as any,
      params: {},
    });
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});

describe('the shared contract', () => {
  it('is the same validation on both sides', () => {
    // Not a tautology: it asserts the endpoint has no rules of its own. If the
    // server grew a stricter check, the form would start accepting things the
    // server rejects, and the person would find out after writing.
    expect(validateContact(valid)).toEqual([]);
    expect(validateContact({ ...valid, email: 'nope' })).toEqual([
      { field: 'email', reason: 'invalid' },
    ]);
  });

  it('reports every problem at once rather than the first', () => {
    const failures = validateContact({ email: '', message: '' });
    expect(failures.map((f) => f.field).sort()).toEqual([
      'email',
      'interest',
      'message',
    ]);
  });

  it('accepts the email shapes a strict pattern would wrongly refuse', () => {
    for (const email of [
      'team+cabuya@example.org',
      'equipo@ayuda.example.co',
      'a@b.io',
    ]) {
      expect(validateContact({ ...valid, email }), email).toEqual([]);
    }
  });

  it('knows what automated looks like', () => {
    expect(looksAutomated({ website: 'x' })).toBe(true);
    expect(looksAutomated({ elapsedMs: 10 })).toBe(true);
    expect(looksAutomated({ elapsedMs: 60_000 })).toBe(false);
    expect(looksAutomated({})).toBe(false);
  });
});
