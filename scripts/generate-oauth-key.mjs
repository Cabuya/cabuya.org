/**
 * Generate the OAuth signing keypair.
 *
 * Prints the private JWK (one line — set it as the `OAUTH_SIGNING_KEY`
 * Cloudflare secret and NEVER commit it) and the public JWK (paste into
 * `functions/lib/oauth-public.ts`, updating `kid` there and in
 * `functions/lib/oauth.ts`). Rotating: run again, update both halves —
 * rotation revokes every issued client and token at once, which is the
 * documented revocation model.
 */
const pair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);
const kid = `cabuya-${new Date().toISOString().slice(0, 7)}`;
const priv = {
  ...(await crypto.subtle.exportKey('jwk', pair.privateKey)),
  kid,
};
const pub = {
  ...(await crypto.subtle.exportKey('jwk', pair.publicKey)),
  kid,
  alg: 'ES256',
  use: 'sig',
};
console.log('OAUTH_SIGNING_KEY (secret — never commit):');
console.log(JSON.stringify(priv));
console.log('\nPublic JWK (functions/lib/oauth-public.ts):');
console.log(JSON.stringify(pub, null, 2));
