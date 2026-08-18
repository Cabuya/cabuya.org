/**
 * The OAuth agent tier: registration that stores nothing, tokens that verify
 * against the committed JWK, and the one thing a credential buys.
 *
 * The suite generates its own keypair — the production private key is a
 * Cloudflare secret and exists nowhere the tests can reach, which is itself
 * the property being protected.
 */
import { beforeAll, describe, expect, it } from 'vitest';

import {
  issueToken,
  mintClient,
  verifyClient,
  verifyToken,
} from '../../../functions/lib/oauth';
import { onRequestPost as register } from '../../../functions/oauth/register';
import { onRequestPost as token } from '../../../functions/oauth/token';

let env: { OAUTH_SIGNING_KEY: string };
let publicJwk: JsonWebKey;

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  env = {
    OAUTH_SIGNING_KEY: JSON.stringify(
      await crypto.subtle.exportKey('jwk', pair.privateKey)
    ),
  };
  publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
});

const post = (url: string, body: string, contentType: string) =>
  new Request(url, {
    method: 'POST',
    headers: {
      'content-type': contentType,
      'cf-connecting-ip': '203.0.113.9',
    },
    body,
  });

describe('the stateless client model', () => {
  it('a minted client verifies by recomputation — no store involved', async () => {
    const { clientId, clientSecret } = await mintClient(env);
    expect(clientId).toMatch(/^agent-[A-Za-z0-9_-]+$/);
    expect(await verifyClient(env, clientId, clientSecret)).toBe(true);
  });

  it('a wrong secret, a foreign id and a tampered id all fail', async () => {
    const { clientId, clientSecret } = await mintClient(env);
    expect(await verifyClient(env, clientId, 'not-the-secret')).toBe(false);
    expect(await verifyClient(env, 'agent-invented00', clientSecret)).toBe(
      false
    );
    expect(await verifyClient(env, `${clientId}x`, clientSecret)).toBe(false);
  });

  it('a different signing key mints different secrets — rotation revokes', async () => {
    const { clientId, clientSecret } = await mintClient(env);
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    const rotated = {
      OAUTH_SIGNING_KEY: JSON.stringify(
        await crypto.subtle.exportKey('jwk', pair.privateKey)
      ),
    };
    expect(await verifyClient(rotated, clientId, clientSecret)).toBe(false);
  });
});

describe('tokens', () => {
  it('an issued token verifies, carries the scope, and names the client', async () => {
    const { clientId } = await mintClient(env);
    const jwt = await issueToken(env, clientId);
    expect(await verifyToken(jwt, publicJwk)).toBe(clientId);
  });

  it('a token signed by another key does not verify here', async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    const foreign = {
      OAUTH_SIGNING_KEY: JSON.stringify(
        await crypto.subtle.exportKey('jwk', pair.privateKey)
      ),
    };
    const jwt = await issueToken(foreign, 'agent-someone');
    expect(await verifyToken(jwt, publicJwk)).toBe(null);
  });

  it('garbage is null, never a throw', async () => {
    expect(await verifyToken('a.b.c', publicJwk)).toBe(null);
    expect(await verifyToken('', publicJwk)).toBe(null);
  });
});

describe('the endpoints', () => {
  it('register → token → verified bearer, end to end', async () => {
    const registration = await register({
      request: post(
        'https://cabuya.org/oauth/register',
        '{}',
        'application/json'
      ),
      env,
    } as never);
    expect(registration.status).toBe(201);
    const client = await registration.json();
    expect(client.grant_types).toEqual(['client_credentials']);

    const granted = await token({
      request: post(
        'https://cabuya.org/oauth/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: client.client_id,
          client_secret: client.client_secret,
        }).toString(),
        'application/x-www-form-urlencoded'
      ),
      env,
    } as never);
    expect(granted.status).toBe(200);
    const grant = await granted.json();
    expect(grant.token_type).toBe('Bearer');
    expect(await verifyToken(grant.access_token, publicJwk)).toBe(
      client.client_id
    );
  });

  it('a wrong secret is invalid_client, 401', async () => {
    const { clientId } = await mintClient(env);
    const response = await token({
      request: post(
        'https://cabuya.org/oauth/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: 'wrong',
        }).toString(),
        'application/x-www-form-urlencoded'
      ),
      env,
    } as never);
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe('invalid_client');
  });

  it('any other grant type is honestly unsupported', async () => {
    const response = await token({
      request: post(
        'https://cabuya.org/oauth/token',
        'grant_type=authorization_code&code=x',
        'application/x-www-form-urlencoded'
      ),
      env,
    } as never);
    expect((await response.json()).error).toBe('unsupported_grant_type');
  });

  it('an unconfigured deployment says so with a 503, never half-works', async () => {
    const response = await register({
      request: post(
        'https://cabuya.org/oauth/register',
        '{}',
        'application/json'
      ),
      env: {},
    } as never);
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe('temporarily_unavailable');
  });
});
