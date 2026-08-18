/**
 * `POST /oauth/token` — RFC 6749 token endpoint, `client_credentials` only.
 *
 * Verification is recomputation (`functions/lib/oauth.ts`): no client table
 * exists to look anything up in. A valid pair gets a 15-minute ES256 JWT
 * scoped `validate:extended`, whose sole effect is the higher rate tier on
 * `/api/validate`. Every other grant type is honestly unsupported.
 */
import {
  issueToken,
  notConfigured,
  type OauthContext,
  signingKeyConfigured,
  TOKEN_TTL_SECONDS,
  verifyClient,
} from '../lib/oauth';

const oauthError = (
  error: string,
  description: string,
  status = 400
): Response =>
  new Response(JSON.stringify({ error, error_description: description }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const onRequestPost = async (
  context: OauthContext
): Promise<Response> => {
  if (!signingKeyConfigured(context.env)) return notConfigured();

  let params: URLSearchParams;
  const contentType = context.request.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    params = new URLSearchParams(await context.request.text());
  } else {
    return oauthError(
      'invalid_request',
      'Send application/x-www-form-urlencoded, per RFC 6749 §4.4.2.'
    );
  }

  if (params.get('grant_type') !== 'client_credentials') {
    return oauthError(
      'unsupported_grant_type',
      'Only client_credentials is supported. There are no users to authorize — the credential buys a rate tier, nothing else.'
    );
  }

  /* client_secret_post, or HTTP Basic. */
  let clientId = params.get('client_id') ?? '';
  let clientSecret = params.get('client_secret') ?? '';
  const authorization = context.request.headers.get('authorization') ?? '';
  if (!clientId && authorization.startsWith('Basic ')) {
    try {
      const [id, secret] = atob(authorization.slice(6)).split(':');
      clientId = decodeURIComponent(id ?? '');
      clientSecret = decodeURIComponent(secret ?? '');
    } catch {
      /* falls through to invalid_client below */
    }
  }

  if (!(await verifyClient(context.env, clientId, clientSecret))) {
    return oauthError('invalid_client', 'Unknown client or wrong secret.', 401);
  }

  return new Response(
    JSON.stringify({
      access_token: await issueToken(context.env, clientId),
      token_type: 'Bearer',
      expires_in: TOKEN_TTL_SECONDS,
      scope: 'validate:extended',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const onRequest = async (context: OauthContext): Promise<Response> => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
};
