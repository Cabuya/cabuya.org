/**
 * Content negotiation, exercised against the built site.
 *
 * The middleware is what makes the agent surface a *surface* rather than a set
 * of files somebody has to know the URL of. Two claims are made on it, and both
 * are the kind that quietly stops being true:
 *
 *   - `Accept: text/markdown` on any page returns that page's twin.
 *   - `Accept: application/schema+json` on a schema page returns the schema.
 *
 * The path resolution is unit-tested; the end of it — that a twin actually
 * exists at the resolved path — is checked against `dist/`, because a
 * resolution that points at a missing file is the failure mode this is for.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  resolveMarkdownPath,
  resolveSchemaPath,
} from '../../../functions/_middleware';

const DIST = join(process.cwd(), 'dist');
const built = existsSync(DIST);

describe('markdown path resolution', () => {
  it('maps a page to its twin', () => {
    expect(resolveMarkdownPath('/developers')).toBe('/developers.md');
    expect(resolveMarkdownPath('/registry/corag')).toBe('/registry/corag.md');
  });

  it('ignores a trailing slash', () => {
    expect(resolveMarkdownPath('/governance/')).toBe('/governance.md');
  });

  it('handles a language-prefixed route', () => {
    expect(resolveMarkdownPath('/es/registry')).toBe('/es/registry.md');
    expect(resolveMarkdownPath('/es/developers/consume')).toBe(
      '/es/developers/consume.md'
    );
  });
});

describe('schema path resolution', () => {
  it('resolves a schema page to the schema at its versioned id', () => {
    expect(resolveSchemaPath('/developers/schemas/0.1/place-feed')).toBe(
      '/schemas/0.1/place-feed.schema.json'
    );
    expect(resolveSchemaPath('/developers/schemas/0.1/manifest/')).toBe(
      '/schemas/0.1/manifest.schema.json'
    );
  });

  it('works on the Spanish route — a schema is the same schema', () => {
    expect(resolveSchemaPath('/es/developers/schemas/0.1/place-feed')).toBe(
      '/schemas/0.1/place-feed.schema.json'
    );
  });

  it('declines the index, which documents several', () => {
    expect(resolveSchemaPath('/developers/schemas')).toBeNull();
    expect(resolveSchemaPath('/developers/schemas/0.1')).toBeNull();
  });

  it('declines anything that is not a schema page', () => {
    for (const path of [
      '/registry',
      '/developers/spec/0.1/3-the-feed',
      '/schemas/0.1/place-feed.schema.json',
      '/developers/schemas/0.1/place-feed/extra',
    ]) {
      expect(resolveSchemaPath(path), path).toBeNull();
    }
  });
});

describe.skipIf(!built)('the resolved paths exist in the build', () => {
  /** A representative route from each family the site serves. */
  const ROUTES = [
    '/',
    '/developers',
    '/developers/quickstart',
    '/developers/consume',
    '/developers/spec/0.1/3-the-feed',
    '/developers/validator/checks',
    '/registry',
    '/registry/corag',
    '/governance',
    '/trademark',
    '/join',
    '/changelog',
    '/rfcs',
    '/rfcs/0001',
    '/es/',
    '/es/registry',
    '/es/developers/faq',
    '/es/governance',
  ];

  it('every representative route has a twin where the middleware looks', () => {
    const missing = ROUTES.filter((route) => {
      const path = resolveMarkdownPath(route);
      return (
        !existsSync(join(DIST, path)) &&
        !existsSync(join(DIST, path.replace(/\.md$/, ''), 'index.md'))
      );
    });
    expect(missing, 'routes whose twin the middleware would not find').toEqual(
      []
    );
  });

  it('every schema page resolves to a schema that is served', () => {
    for (const name of ['place-feed', 'manifest']) {
      const path = resolveSchemaPath(`/developers/schemas/0.1/${name}`);
      expect(path).toBeTruthy();
      expect(existsSync(join(DIST, path as string)), path as string).toBe(true);
    }
  });

  it('serves a schema that parses as one', async () => {
    const { readFileSync } = await import('node:fs');
    const raw = readFileSync(
      join(DIST, '/schemas/0.1/place-feed.schema.json'),
      'utf-8'
    );
    const schema = JSON.parse(raw) as Record<string, unknown>;
    expect(schema.$schema).toContain('json-schema.org');
    // Absolute versioned `$id` — boundary rule B5, and the reason the
    // negotiation can point at this file rather than generating one.
    expect(String(schema.$id)).toMatch(
      /^https:\/\/cabuya\.org\/schemas\/0\.1\//
    );
  });
});
