/**
 * The one thing a credential buys on this site, and the machinery behind it.
 *
 * cabuya.org's reading surface needs no authentication and never will — that
 * is the design, and `/auth.md` still says so. What changed (owner's call,
 * 2026-08-18) is that one *optional* credential now exists, with exactly one
 * effect: a registered agent gets a higher `/api/validate` rate tier
 * (`validate:extended`) than an anonymous caller. Bulk validation runs are a
 * real agent workload — our own revalidation cron is one — and quota is the
 * honest thing to gate: never content, never conformance, never access.
 *
 * ## Registration stores nothing
 *
 * The registry-shaped way to do OAuth clients is a client table. This site's
 * posture is zero retention, so instead the client secret IS the proof:
 *
 *   client_secret = HMAC-SHA256(derived_key, client_id)
 *
 * Registration mints an id and computes its secret; the token endpoint
 * verifies by recomputing. Nothing is written anywhere — a credential that is
 * *verifiable* rather than *remembered*. The honest cost, documented in
 * auth.md: there is no per-client revocation. Rotating the signing key
 * revokes every client at once, and that is the only lever. For a credential
 * whose only power is a bigger rate bucket, that trade is right.
 *
 * ## One secret configures everything
 *
 * `OAUTH_SIGNING_KEY` (a Cloudflare secret, never in the repo) holds the
 * ES256 private JWK. Access tokens are JWTs signed with it; the public half
 * is committed at `/.well-known/jwks.json`. The client-HMAC key is derived
 * from the private scalar, so one rotation rotates both. When the secret is
 * absent the endpoints answer 503 `not_configured` — they never half-work.
 */
import type { PagesContext } from './pages-runtime';

export const ISSUER = 'https://cabuya.org';
export const KID = 'cabuya-2026-08';
export const TOKEN_TTL_SECONDS = 900;
export const SCOPE_EXTENDED = 'validate:extended';

export interface OauthEnv {
  /** ES256 private JWK as JSON. A Cloudflare secret; absent in dev by default. */
  OAUTH_SIGNING_KEY?: string;
}

const encoder = new TextEncoder();

const b64url = (bytes: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const b64urlDecode = (value: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(
    atob(
      value
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(value.length / 4) * 4, '=')
    ),
    (c) => c.charCodeAt(0)
  ) as Uint8Array<ArrayBuffer>;

export function signingKeyConfigured(env: OauthEnv): boolean {
  return typeof env.OAUTH_SIGNING_KEY === 'string' && env.OAUTH_SIGNING_KEY.length > 0;
}

async function importPrivateKey(env: OauthEnv): Promise<CryptoKey> {
  const jwk = JSON.parse(env.OAUTH_SIGNING_KEY ?? '') as JsonWebKey;
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

/**
 * The HMAC key for client secrets, derived from the signing key's private
 * scalar — one secret to configure, one rotation to rotate everything.
 */
async function clientHmacKey(env: OauthEnv): Promise<CryptoKey> {
  const jwk = JSON.parse(env.OAUTH_SIGNING_KEY ?? '') as { d?: string };
  const material = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`${jwk.d ?? ''}:cabuya-client-hmac:v1`)
  );
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
}

export async function mintClient(
  env: OauthEnv
): Promise<{ clientId: string; clientSecret: string }> {
  const raw = new Uint8Array(16);
  crypto.getRandomValues(raw);
  const clientId = `agent-${b64url(raw)}`;
  return { clientId, clientSecret: await secretFor(env, clientId) };
}

async function secretFor(env: OauthEnv, clientId: string): Promise<string> {
  const key = await clientHmacKey(env);
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(clientId));
  return b64url(mac);
}

export async function verifyClient(
  env: OauthEnv,
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  if (!/^agent-[A-Za-z0-9_-]{10,64}$/.test(clientId)) return false;
  const expected = await secretFor(env, clientId);
  /* Constant-time-ish comparison over equal-length digests. */
  if (expected.length !== clientSecret.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ clientSecret.charCodeAt(i);
  }
  return diff === 0;
}

// ── Access tokens ─────────────────────────────────────────

export async function issueToken(env: OauthEnv, clientId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(encoder.encode(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: KID })));
  const payload = b64url(
    encoder.encode(
      JSON.stringify({
        iss: ISSUER,
        sub: clientId,
        aud: ISSUER,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
        scope: SCOPE_EXTENDED,
      })
    )
  );
  const key = await importPrivateKey(env);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(`${header}.${payload}`)
  );
  return `${header}.${payload}.${b64url(signature)}`;
}

/**
 * Verify a bearer token against the committed public JWK. Returns the client
 * id when the token is valid, unexpired and carries the extended scope —
 * `null` for anything else, because the only failure mode this tier permits
 * is "you are anonymous after all".
 */
export async function verifyToken(
  token: string,
  publicJwk: JsonWebKey
): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      publicJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      b64urlDecode(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1]))) as {
      iss?: string;
      sub?: string;
      exp?: number;
      scope?: string;
    };
    if (payload.iss !== ISSUER) return null;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    if (payload.scope !== SCOPE_EXTENDED) return null;
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export const notConfigured = (): Response =>
  new Response(
    JSON.stringify({
      error: 'temporarily_unavailable',
      error_description:
        'The authorization server is not configured in this deployment (OAUTH_SIGNING_KEY is unset). The anonymous tier is unaffected.',
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );

export type OauthContext = PagesContext<OauthEnv>;
