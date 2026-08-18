/**
 * The committed half of the signing keypair — safe to publish, and published:
 * `/.well-known/jwks.json` is generated from this object, and
 * `functions/api/validate.ts` verifies bearer tokens against it. One module,
 * so the key the endpoint trusts and the key the world sees cannot drift.
 *
 * The private half is the `OAUTH_SIGNING_KEY` Cloudflare secret and exists
 * nowhere in this repository (`docs/SECURITY.md`; `.dev.vars.example`).
 */
export const PUBLIC_JWK: JsonWebKey & { kid: string; alg: string } = {
  kty: 'EC',
  crv: 'P-256',
  x: '9R9T1r7wpTqeZunBX0gDCwMB5rJU8j7y-qN54q4IRmQ',
  y: 'GETp1E_7x6dvatWOaYCHqK03xT2tC-Ea75T4rGSZd20',
  kid: 'cabuya-2026-08',
  alg: 'ES256',
  use: 'sig',
  key_ops: ['verify'],
  ext: true,
};
