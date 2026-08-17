/**
 * The `/api/validate` contract, and the distinction it exists to protect.
 *
 * A response says either "we measured your document" or "we could not reach
 * it", and the two must never be confusable. The CLI encodes that as exit code
 * 1 versus 3; here it is the `ok` discriminant. An agent that treats a DNS
 * failure as a data error rewrites correct records; a person who sees
 * "invalid" when their host blipped goes hunting for a bug that is not there.
 */
import { describe, expect, it } from 'vitest';

import {
  isSuccess,
  screenUrl,
  VALIDATE_ENDPOINT,
  type ValidateResponse,
} from '@/lib/validate-api-contract';

describe('validate contract — the success/failure discriminant', () => {
  it('narrows a success to a report', () => {
    const response: ValidateResponse = {
      ok: true,
      report: { findings: [] } as never,
    };
    expect(isSuccess(response)).toBe(true);
    if (isSuccess(response)) expect(response.report).toBeDefined();
  });

  it('narrows a failure to a reason, with no report to mistake for one', () => {
    const response: ValidateResponse = {
      ok: false,
      kind: 'transport',
      message: 'Could not reach it.',
    };
    expect(isSuccess(response)).toBe(false);
    expect('report' in response).toBe(false);
  });

  it('keeps the endpoint in one place', () => {
    expect(VALIDATE_ENDPOINT).toBe('/api/validate');
  });
});

describe('validate contract — client-side URL screening', () => {
  it('accepts an https URL with a real host', () => {
    expect(screenUrl('https://example.org/.well-known/cabuya.json')).toEqual({
      ok: true,
    });
  });

  it('rejects what is obviously not going to work', () => {
    expect(screenUrl('')).toMatchObject({ ok: false, reason: 'empty' });
    expect(screenUrl('   ')).toMatchObject({ ok: false, reason: 'empty' });
    expect(screenUrl('not a url')).toMatchObject({
      ok: false,
      reason: 'not-a-url',
    });
    expect(screenUrl('http://example.org/f.json')).toMatchObject({
      ok: false,
      reason: 'not-https',
    });
    expect(screenUrl('https://localhost/f.json')).toMatchObject({
      ok: false,
      reason: 'not-a-host',
    });
  });

  it('is not a security boundary, and does not pretend to be one', () => {
    /*
     * A private address with a dotted host passes this screen. That is correct
     * and deliberate: the server does the real check, and duplicating it here
     * would create two rules that can disagree — with the client's version
     * being the one nobody audits. This test exists so nobody "fixes" it.
     */
    expect(screenUrl('https://192.168.1.1/feed.json')).toEqual({ ok: true });
  });
});
