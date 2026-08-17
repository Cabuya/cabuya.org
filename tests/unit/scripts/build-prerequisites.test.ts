/**
 * The build must work on a machine that has never built anything.
 *
 * `packages/validator/dist/` is gitignored, so a fresh clone has the workspace
 * package's source and none of its output. `astro check` type-checks against
 * `@cabuya/validator`, and without that output every import of it resolves to
 * nothing.
 *
 * The Cloudflare deploy found this before any test did: 29 type errors, all of
 * them `Cannot find module '@cabuya/validator'` or an `any` that followed from
 * it, plus a `Failed to create bin` warning at install. Locally the build had
 * been green for the whole session — because `dist/` was sitting on disk from
 * an earlier run. A build that passes only on a machine that already built it
 * is not a build; it is a cache.
 *
 * So this asserts the ordering is declared, rather than inherited from
 * whatever happens to be lying around.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const pkg = (path: string) =>
  JSON.parse(readFileSync(join(ROOT, path), 'utf-8')) as {
    scripts?: Record<string, string>;
  };

describe('building from a clean checkout', () => {
  const root = pkg('package.json');

  it('builds the workspace package before type-checking against it', () => {
    const prebuild = root.scripts?.prebuild ?? '';
    expect(
      prebuild,
      'prebuild must build @cabuya/validator — `astro check` cannot resolve it otherwise, and its dist/ is gitignored'
    ).toContain('@cabuya/validator');
  });

  it('keeps the type check downstream of that build', () => {
    const build = root.scripts?.build ?? '';
    expect(build, 'the build still runs astro check').toContain('astro check');
    // `prebuild` is npm's own hook, so ordering is guaranteed by the name.
    expect(root.scripts).toHaveProperty('prebuild');
  });

  it('lets the package produce its own output on install', () => {
    /*
     * Belt and braces with the above: `prepare` covers a consumer that runs
     * `pnpm install` and then something other than `pnpm run build` — the
     * install-time `Failed to create bin` warning came from exactly that gap.
     */
    const validator = pkg('packages/validator/package.json');
    expect(validator.scripts?.prepare, '@cabuya/validator prepare').toContain(
      'build'
    );
  });
});
