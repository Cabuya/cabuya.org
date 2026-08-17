/**
 * The agent-discovery surface may only describe things that exist.
 *
 * This surface was deleted once already. The launch dry run found
 * `public/openapi.json` advertising five endpoints removed in an earlier task,
 * and `public/auth.md` documenting an OAuth registration flow —
 * `/agent/register`, `/agent/claim`, `/oauth/revoke` — none of them
 * implemented. Both were published, both were fetchable, and both were false.
 *
 * They are back now, describing the three endpoints that are actually served.
 * The difference between that and what was deleted is not good intentions: it
 * is this file. Every path in the OpenAPI document must resolve to a real
 * Cloudflare Function, every anchor in the catalog must be a real route, and
 * the endpoints this site does not have must stay undocumented.
 *
 * "Manifests lie, behaviour doesn't" is the sentence the whole project rests
 * on. It applies to ours first.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf-8');
const json = <T>(path: string): T => JSON.parse(read(path)) as T;

interface OpenApi {
  paths: Record<string, Record<string, unknown>>;
  components?: { securitySchemes?: Record<string, unknown> };
}

interface Linkset {
  linkset: Array<{
    anchor: string;
    [rel: string]: unknown;
  }>;
}

/**
 * Which Function serves a documented path.
 *
 * Cloudflare Pages Functions map file paths to routes, so this is a direct
 * translation rather than a guess: `/api/validate` is `functions/api/validate.ts`,
 * and `/badge/{publisher}.svg` is `functions/badge/[publisher].ts`.
 */
function functionFileFor(apiPath: string): string {
  const withParams = apiPath
    .replace(/\.svg$/, '')
    .replace(/\{([^}]+)\}/g, '[$1]')
    .replace(/^\//, '');
  return join('functions', `${withParams}.ts`);
}

describe('the OpenAPI document describes only what is served', () => {
  const spec = json<OpenApi>('public/openapi.json');

  it('has paths', () => {
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });

  it.each(Object.keys(json<OpenApi>('public/openapi.json').paths))(
    '%s is backed by a real Function',
    (apiPath) => {
      const file = functionFileFor(apiPath);
      expect(
        existsSync(join(ROOT, file)),
        `${apiPath} is documented but ${file} does not exist — this is the defect that got the previous openapi.json deleted`
      ).toBe(true);
    }
  );

  it('declares no security schemes, because there is no authentication', () => {
    /*
     * Not an oversight to fill in later. Every read here is public by design,
     * and `/api/validate` fetches arbitrary URLs on request — a service that
     * does that *and* holds a credential is a far more attractive target.
     */
    expect(spec.components?.securitySchemes ?? {}).toEqual({});
  });

  it('leaves the contact endpoint undocumented on purpose', () => {
    expect(
      Object.keys(spec.paths),
      'the contact form has a honeypot, a minimum fill time and a rate limit; documenting it as an API invites the automated submission those exist to stop'
    ).not.toContain('/api/contact');
  });
});

describe('the API catalog points at real routes', () => {
  const catalog = json<Linkset>('public/.well-known/api-catalog');

  it('is a non-empty linkset', () => {
    expect(Array.isArray(catalog.linkset)).toBe(true);
    expect(catalog.linkset.length).toBeGreaterThan(0);
  });

  it('every link target is same-origin and absolute', () => {
    for (const entry of catalog.linkset) {
      const urls = [
        entry.anchor,
        ...Object.entries(entry)
          .filter(([rel]) => rel !== 'anchor')
          .flatMap(([, links]) =>
            (links as Array<{ href: string }>).map((link) => link.href)
          ),
      ];
      for (const url of urls) {
        expect(url, `${url} is not an absolute cabuya.org URL`).toMatch(
          /^https:\/\/cabuya\.org\//
        );
      }
    }
  });

  it('every static file it names is actually served', () => {
    /*
     * Two kinds of target, and an earlier version of this test only knew about
     * one: `llms-full.txt` ships from `public/`, while the JSON Schemas are
     * produced at build time from the bounded `spec/` directory by
     * `src/pages/schemas/[version]/[...file].ts`. Checking `public/` alone
     * reported a correct catalog entry as a defect.
     */
    const staticTargets = catalog.linkset
      .flatMap((entry) =>
        Object.entries(entry)
          .filter(([rel]) => rel !== 'anchor')
          .flatMap(([, links]) =>
            (links as Array<{ href: string }>).map((link) => link.href)
          )
      )
      .map((href) => href.replace('https://cabuya.org', ''))
      // Rendered pages and their twins are produced by the build, not by
      // `public/`; `internal-links.test.ts` already walks those.
      .filter((path) => /\.(json|txt)$/.test(path));

    for (const path of staticTargets) {
      const served =
        existsSync(join(ROOT, 'public', path)) ||
        existsSync(join(ROOT, 'dist', path));
      expect(
        served,
        `the catalog names ${path}, which is neither in public/ nor produced into dist/`
      ).toBe(true);
    }
  });
});

describe('the endpoints this site does not have stay undocumented', () => {
  /*
   * Each of these is something an agent-readiness scanner asks for and this
   * site cannot honestly provide. Publishing them would raise a score and
   * lower the only thing the project actually sells.
   */
  it.each([
    ['public/.well-known/openid-configuration', 'no OIDC provider exists'],
    ['public/.well-known/oauth-authorization-server', 'no OAuth server exists'],
    [
      'public/.well-known/oauth-protected-resource',
      'nothing here is protected — every read is public',
    ],
    [
      'public/auth.md',
      'deleted in the launch dry run; no registration flow exists',
    ],
    [
      'public/.well-known/mcp/server-card.json',
      'the MCP server is specified and not deployed',
    ],
  ])('%s is absent — %s', (path) => {
    expect(existsSync(join(ROOT, path))).toBe(false);
  });
});

describe('the Link headers', () => {
  const headers = read('public/_headers');

  it('advertise the catalog, the description and the agent index', () => {
    const link = headers
      .split('\n')
      .find((line) => line.trim().startsWith('Link:'));
    expect(link, 'no Link header found in _headers').toBeTruthy();
    for (const rel of ['api-catalog', 'service-desc', 'describedby']) {
      expect(link, `no rel="${rel}"`).toContain(`rel="${rel}"`);
    }
  });

  it('name only targets that exist', () => {
    const link =
      headers.split('\n').find((line) => line.trim().startsWith('Link:')) ?? '';
    for (const [, target] of link.matchAll(/<([^>]+)>/g)) {
      expect(
        existsSync(join(ROOT, 'public', target)),
        `the Link header advertises ${target}, which is not in public/`
      ).toBe(true);
    }
  });
});
