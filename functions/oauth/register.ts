/**
 * `POST /oauth/register` — RFC 7591 dynamic client registration, open and
 * anonymous, because the credential it issues buys quota and nothing else.
 *
 * See `functions/lib/oauth.ts` for the design: registration **stores
 * nothing**. The secret is an HMAC over the client id, verifiable at the
 * token endpoint by recomputation — so this endpoint cannot leak a client
 * table, because there is none. It is rate-limited per IP anyway, since
 * minting ids costs the caller nothing.
 *
 * No identity is collected: no name, no email, no redirect URIs (the only
 * grant is client_credentials). An agent is `agent-{random}`, and that is
 * the whole identity model — deliberately, on a site whose auth.md's first
 * promise is that reading requires nobody to say who they are.
 */
import {
  mintClient,
  notConfigured,
  type OauthContext,
  signingKeyConfigured,
} from '../lib/oauth';

import type { KvReadWrite } from '../lib/pages-runtime';

const REGISTRATIONS_PER_HOUR = 10;

interface Env {
  OAUTH_SIGNING_KEY?: string;
  VALIDATE_RATE?: KvReadWrite;
}

export const onRequestPost = async (
  context: OauthContext & { env: Env }
): Promise<Response> => {
  if (!signingKeyConfigured(context.env)) return notConfigured();

  const kv = context.env.VALIDATE_RATE;
  const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (kv) {
    const key = `rate:reg:${ip}`;
    const current = Number((await kv.get(key)) ?? '0');
    if (current >= REGISTRATIONS_PER_HOUR) {
      return new Response(
        JSON.stringify({
          error: 'invalid_client_metadata',
          error_description: 'Too many registrations from here. Try later.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    await kv.put(`rate:reg:${ip}`, String(current + 1), {
      expirationTtl: 3600,
    });
  }

  const { clientId, clientSecret } = await mintClient(context.env);
  return new Response(
    JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      /* Never expires — but key rotation revokes every client at once, and
         auth.md says so. Verifiable, not remembered. */
      client_secret_expires_at: 0,
      grant_types: ['client_credentials'],
      token_endpoint_auth_method: 'client_secret_post',
      scope: 'validate:extended',
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};

export const onRequest = async (
  context: OauthContext & { env: Env }
): Promise<Response> => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
};
