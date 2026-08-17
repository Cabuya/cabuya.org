import type { APIRoute } from 'astro';

import { specSchemas, specVersions } from '@/lib/spec-loader';

/**
 * The schemas, served at the URLs their own `$id` declares.
 *
 * `place-feed.schema.json` says its `$id` is
 * `https://cabuya.org/schemas/0.1/place-feed.schema.json`. A `$id` that does
 * not resolve is a broken promise to every validator that tries to follow it,
 * and a schema nobody can dereference is a schema nobody can trust.
 *
 * Served from `spec-loader.ts` rather than copied into `public/`: a copy is a
 * second file that can go stale, and B2 exists so the bounded directory has one
 * reader. Byte-exact — this returns the file, not a re-serialization of the
 * parsed object, so a consumer hashing it gets the same digest as one reading
 * it from the repository.
 */
export function getStaticPaths() {
  return specVersions().flatMap((version) =>
    specSchemas(version).map((schema) => ({
      params: { version, file: `${schema.name}.schema.json` },
      props: { raw: schema.raw },
    }))
  );
}

export const GET: APIRoute = ({ props }) =>
  new Response((props as { raw: string }).raw, {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
      // A published schema at a versioned URL never changes. Anything that
      // would change it is a new version at a new URL.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
