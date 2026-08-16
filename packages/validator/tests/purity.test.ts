/**
 * The runtime-purity guarantee.
 *
 * "One engine, four harnesses" is only true if the core runs unchanged in
 * Node, Cloudflare Workers, Deno, Bun and the browser. That means **zero
 * Node-only APIs** in the built core: no `node:` imports, no `process`, no
 * `require`, no filesystem. This test reads the BUILD OUTPUT, because that
 * is what consumers actually load.
 *
 * Run `pnpm --filter @cabuya/validator build` first; the test skips with a
 * loud message if `dist/` is absent so a fresh clone's `test` is not a
 * confusing failure.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const DIST = join(import.meta.dirname, '..', 'dist');

function jsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) jsFiles(full, out);
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}

const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /from ['"]node:/, why: 'node: builtin import' },
  { pattern: /require\(/, why: 'CommonJS require' },
  { pattern: /\bprocess\.(env|argv|exit|cwd)\b/, why: 'Node process API' },
  { pattern: /\b__dirname\b|\b__filename\b/, why: 'CJS path global' },
];

describe('core runtime purity', () => {
  it('the built core contains no Node-only APIs', () => {
    if (!existsSync(DIST)) {
      throw new Error(
        'dist/ is missing — run `pnpm --filter @cabuya/validator build` before the purity test'
      );
    }
    const offenders: string[] = [];
    // The CLI harness is allowed Node APIs; the CORE is not.
    for (const file of jsFiles(DIST).filter((f) => !f.includes('/cli/'))) {
      const source = readFileSync(file, 'utf-8');
      for (const { pattern, why } of BANNED) {
        if (pattern.test(source)) {
          offenders.push(`${file.replace(DIST, 'dist')}: ${why}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('declares Ajv as its only production dependency', () => {
    const pkg = JSON.parse(
      readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8')
    );
    // Every dependency is supply-chain surface on a tool other people run
    // against their own infrastructure. Adding one is a reviewed decision.
    expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual([
      'ajv',
      'ajv-formats',
    ]);
  });
});
