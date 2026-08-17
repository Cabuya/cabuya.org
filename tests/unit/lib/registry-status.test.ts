/**
 * Measured registry state: how it is fetched, and how its age is described.
 *
 * Two things here are worth pinning.
 *
 * **The fetch never throws.** A failed KV read is a missing entry, not a failed
 * build — a network blip during a deploy should cost one publisher its measured
 * state on the page and be patched back by the client-side refresh, not take
 * the site down. That is easy to "improve" into a throw later, so it is a test.
 *
 * **The age wording is coarse on purpose.** The cron runs every six hours, so
 * "3 hours ago" and "5 hours ago" describe the same run; precision there would
 * be false precision about a measurement. Both languages, both boundaries.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMeasuredStatuses,
  measurementAge,
  STALE_AFTER_HOURS,
  statusSourceIsLive,
} from '@/lib/registry-status';

const NOW = new Date('2026-08-18T12:00:00Z');
const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3_600_000).toISOString();
const daysAgo = (n: number) => hoursAgo(n * 24);

describe('measurementAge', () => {
  it('says never when nothing has been measured', () => {
    expect(measurementAge('', NOW, 'en')).toBe('never');
    expect(measurementAge('', NOW, 'es')).toBe('nunca');
  });

  it('says unknown rather than guessing at an unparseable timestamp', () => {
    expect(measurementAge('not a date', NOW, 'en')).toBe('unknown');
    expect(measurementAge('not a date', NOW, 'es')).toBe('desconocido');
    // A KV value written by a future version of the cron must not crash a page.
    expect(measurementAge('2026-13-45T99:00:00Z', NOW, 'en')).toBe('unknown');
  });

  it('collapses everything under a day into "today"', () => {
    // The cron runs every six hours; distinguishing 3 from 5 hours would be
    // false precision about the same run.
    for (const hours of [0, 1, 6, 12, 23]) {
      expect(measurementAge(hoursAgo(hours), NOW, 'en'), `${hours}h`).toBe(
        'today'
      );
      expect(measurementAge(hoursAgo(hours), NOW, 'es'), `${hours}h`).toBe(
        'hoy'
      );
    }
  });

  it('singularises one day and one month', () => {
    expect(measurementAge(daysAgo(1), NOW, 'en')).toBe('1 day ago');
    expect(measurementAge(daysAgo(1), NOW, 'es')).toBe('hace 1 día');
    expect(measurementAge(daysAgo(30), NOW, 'en')).toBe('1 month ago');
    expect(measurementAge(daysAgo(30), NOW, 'es')).toBe('hace 1 mes');
  });

  it('counts days up to a month, then months', () => {
    expect(measurementAge(daysAgo(2), NOW, 'en')).toBe('2 days ago');
    expect(measurementAge(daysAgo(29), NOW, 'en')).toBe('29 days ago');
    expect(measurementAge(daysAgo(60), NOW, 'en')).toBe('2 months ago');
    expect(measurementAge(daysAgo(60), NOW, 'es')).toBe('hace 2 meses');
  });

  it('keeps the Spanish accent on día', () => {
    // Orthography is gate-checked across the repo; this string is generated
    // rather than translated, so it needs its own assertion.
    expect(measurementAge(daysAgo(1), NOW, 'es')).toContain('día');
  });

  it('does not produce a negative age for a clock skew', () => {
    // A KV entry written by a machine a few seconds ahead should read "today",
    // not "-1 days ago".
    const future = new Date(NOW.getTime() + 5 * 60_000).toISOString();
    expect(measurementAge(future, NOW, 'en')).toBe('today');
  });
});

describe('the staleness threshold', () => {
  it('is seven days, shared by the page and the badge', () => {
    // It lives in one place so the two agree on the word without agreeing by
    // coincidence.
    expect(STALE_AFTER_HOURS).toBe(24 * 7);
  });
});

describe('fetchMeasuredStatuses', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns an empty map when no credentials are configured', async () => {
    // Which is every local build and every fork's CI. The pages then render
    // every entry as "not yet measured", which is the honest local result.
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await fetchMeasuredStatuses(['corag', 'pereira-ayuda']);
    expect(result.size).toBe(0);
    // And it does not even try, so a build without credentials makes no
    // outbound requests at all.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports whether the live source is configured', () => {
    // Without credentials this is false, and the pages say "not yet measured"
    // rather than implying a measurement happened.
    expect(typeof statusSourceIsLive()).toBe('boolean');
  });

  it('reads one key per publisher when credentials are configured', async () => {
    vi.stubEnv('CF_ACCOUNT_ID', 'acct');
    vi.stubEnv('CF_REGISTRY_KV_ID', 'ns');
    vi.stubEnv('CF_KV_READ_TOKEN', 'token');

    const fetchSpy = vi.fn(async (url: string) => ({
      ok: true,
      text: async () =>
        JSON.stringify({
          state: url.endsWith('corag') ? 'conforming' : 'failing',
          level: 'L2',
          checked_at: '2026-08-17T06:00:00Z',
        }),
    }));
    vi.stubGlobal('fetch', fetchSpy);

    const result = await fetchMeasuredStatuses(['corag', 'pereira-ayuda']);

    expect(result.size).toBe(2);
    expect(result.get('corag')?.state).toBe('conforming');
    expect(result.get('pereira-ayuda')?.state).toBe('failing');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // The token travels as a bearer header, and the key is namespaced.
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain(
      '/accounts/acct/storage/kv/namespaces/ns/values/status:'
    );
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer token',
    });
  });

  it('treats a failed read as unmeasured rather than throwing', async () => {
    // A network blip during a deploy should cost one publisher its state on
    // the page, not take the build down.
    vi.stubEnv('CF_ACCOUNT_ID', 'acct');
    vi.stubEnv('CF_REGISTRY_KV_ID', 'ns');
    vi.stubEnv('CF_KV_READ_TOKEN', 'token');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('broken')) throw new Error('network');
        if (url.endsWith('missing')) return { ok: false, text: async () => '' };
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              state: 'conforming',
              level: 'L2',
              checked_at: '',
            }),
        };
      })
    );

    const result = await fetchMeasuredStatuses(['fine', 'broken', 'missing']);
    expect(result.size).toBe(1);
    expect(result.has('fine')).toBe(true);
    expect(result.has('broken')).toBe(false);
    expect(result.has('missing')).toBe(false);
  });

  it('ignores a value whose state is not one the site knows', async () => {
    // A future cron writing a new state must not put an unrenderable label on
    // the page. Unknown is treated as unmeasured, which is the honest fallback.
    vi.stubEnv('CF_ACCOUNT_ID', 'acct');
    vi.stubEnv('CF_REGISTRY_KV_ID', 'ns');
    vi.stubEnv('CF_KV_READ_TOKEN', 'token');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () =>
          JSON.stringify({ state: 'gloriously-fine', level: 'L9' }),
      }))
    );

    const result = await fetchMeasuredStatuses(['corag']);
    expect(result.size).toBe(0);
  });

  it('survives a value that is not JSON at all', async () => {
    vi.stubEnv('CF_ACCOUNT_ID', 'acct');
    vi.stubEnv('CF_REGISTRY_KV_ID', 'ns');
    vi.stubEnv('CF_KV_READ_TOKEN', 'token');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, text: async () => '<html>oops</html>' }))
    );

    await expect(fetchMeasuredStatuses(['corag'])).resolves.toEqual(new Map());
  });

  it('reports the source as live only when all three variables are set', () => {
    vi.stubEnv('CF_ACCOUNT_ID', 'acct');
    vi.stubEnv('CF_REGISTRY_KV_ID', 'ns');
    vi.stubEnv('CF_KV_READ_TOKEN', '');
    expect(statusSourceIsLive()).toBe(false);

    vi.stubEnv('CF_KV_READ_TOKEN', 'token');
    expect(statusSourceIsLive()).toBe(true);
  });

  it('asks for nothing when given no publishers', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const result = await fetchMeasuredStatuses([]);
    expect(result.size).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
