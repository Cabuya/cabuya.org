import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CONDUCT_FORM,
  CONDUCT_FORM_UUID,
  CONTACT_FORM,
  CONTACT_FORM_UUID,
} from '../../../functions/api/_dailybot';
import { onRequestPost } from '../../../functions/api/contact';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const CONTACT_Q = CONTACT_FORM.q;
const CONDUCT_Q = CONDUCT_FORM.q;

const CONFIGURED_ENV = {
  DAILYBOT_API_KEY: 'test-key',
  // The rate-limit store is module scoped and shared across cases in this file.
  CONTACT_RATE_LIMIT: '1000',
};

function createContext(
  body: unknown,
  env: Record<string, string | undefined> = CONFIGURED_ENV
) {
  const request = new Request('https://cabuya.org/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://cabuya.org',
    },
    body: JSON.stringify(body),
  });
  return {
    request,
    env,
    waitUntil: vi.fn((p: Promise<unknown>) => {
      p.catch(() => {});
    }),
  };
}

describe('POST /api/contact → Dailybot', () => {
  it('returns 503 when DAILYBOT_API_KEY is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(
      createContext(
        {
          _form: 'contact',
          name: 'Ada',
          email: 'ada@example.com',
          topic: 'general',
          subject: 'Hello',
          message: 'A question about how deliveries get verified.',
          lang: 'es',
          website: '',
        },
        {}
      )
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('backend_not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps contact payload and posts automation content', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ uuid: 'resp-1' }), { status: 201 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(
      createContext({
        _form: 'contact',
        name: 'Ada',
        email: 'ada@example.com',
        topic: 'general',
        subject: 'Hello',
        message: 'A question about how deliveries get verified.',
        lang: 'en',
        page_path: '/en/contact',
        website: '',
      })
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      recordUuid: string;
      formType: string;
    };
    expect(json).toMatchObject({
      ok: true,
      recordUuid: 'resp-1',
      formType: 'contact',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(CONTACT_FORM_UUID);
    const body = JSON.parse(init.body as string) as {
      automation: boolean;
      content: Record<string, string>;
    };
    expect(body.automation).toBe(true);
    expect(body.content[CONTACT_Q.TOPIC]).toBe('General');
    expect(body.content[CONTACT_Q.LANG]).toBe('English');
    expect(body.content[CONTACT_Q.PAGE_PATH]).toBe('/en/contact');
  });

  it('maps the Corag intake topics to their DailyBot labels', async () => {
    for (const [sent, expected] of [
      ['organization', 'Organization'],
      ['ally', 'Ally'],
      ['report', 'Report'],
      ['press', 'Press'],
      ['conduct', 'Conduct'],
    ] as const) {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ uuid: 'resp' }), { status: 201 })
        );
      vi.stubGlobal('fetch', fetchMock);

      const res = await onRequestPost(
        createContext({
          _form: 'contact',
          name: 'Ada',
          email: 'ada@example.com',
          topic: sent,
          subject: 'Hello',
          message: 'We can move supplies from the warehouse this week.',
          lang: 'es',
          website: '',
        })
      );

      expect(res.status).toBe(200);
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(init.body as string) as {
        content: Record<string, string>;
      };
      expect(body.content[CONTACT_Q.TOPIC]).toBe(expected);
    }
  });

  it('routes a conduct report even when only `reason` is sent', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ uuid: 'resp-coc' }), { status: 201 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(
      createContext({
        reason: 'coc',
        name: 'Grace',
        email: 'grace@example.com',
        message: 'Enough detail for the team to review what happened.',
        lang: 'es',
        website: '',
      })
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { formType: string };
    expect(json.formType).toBe('conduct');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(CONDUCT_FORM_UUID);
  });

  it('silently accepts honeypot spam', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(
      createContext({
        _form: 'contact',
        name: 'Ada',
        email: 'ada@example.com',
        topic: 'general',
        subject: 'Hello',
        message: 'Hello there',
        website: 'http://spam.example',
        lang: 'es',
      })
    );

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps anonymous conduct reports without identity', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ uuid: 'resp-coc' }), { status: 201 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const ctx = createContext({
      _form: 'conduct',
      anonymous: true,
      incidentDescription:
        'Enough detail about a confidential incident for the team to review.',
      incidentDate: 'Last week',
      peopleInvolved: '',
      name: 'ShouldClear',
      // Sneaked email must not reach Dailybot or trigger Resend ack.
      email: 'sneak@example.com',
      lang: 'es',
      website: '',
    });

    const res = await onRequestPost(ctx);

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(CONDUCT_FORM_UUID);
    const body = JSON.parse(init.body as string) as {
      content: Record<string, string | boolean>;
    };
    expect(body.content[CONDUCT_Q.ANONYMOUS]).toBe(true);
    expect(body.content[CONDUCT_Q.REPORTER_NAME]).toBe('');
    expect(body.content[CONDUCT_Q.REPORTER_EMAIL]).toBe('');
    expect(body.content[CONDUCT_Q.INCIDENT]).toContain('confidential incident');
    expect(ctx.waitUntil).not.toHaveBeenCalled();
  });

  it('returns 502-style client error when Dailybot rejects', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: 'unauthorized' }), {
        status: 401,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await onRequestPost(
      createContext({
        _form: 'contact',
        name: 'Ada',
        email: 'ada@example.com',
        topic: 'general',
        subject: 'Hello',
        message: 'A question about how deliveries get verified.',
        lang: 'es',
        website: '',
      })
    );

    // A 401 from Dailybot is our misconfiguration, not the caller's: the
    // client gets a 502 and a message that does not leak the upstream status.
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('backend_not_configured');
  });
});
