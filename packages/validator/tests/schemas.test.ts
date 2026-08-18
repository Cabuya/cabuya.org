/**
 * The inlined schemas must be the specification's schemas.
 *
 * `src/schemas.ts` is generated from `spec/schemas/0.1/` so the core can run
 * without a filesystem. That copy is the thing that goes stale: somebody edits
 * the schema, forgets to re-run the generator, and the validator starts
 * enforcing last month's rules while the published schema says something else.
 *
 * Comparing the parsed objects rather than the text: the generator
 * re-serializes with different whitespace, and whitespace is not what would
 * make this dangerous.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { bundledSchemas, SCHEMAS } from '../src/schemas.js';

const SPEC = join(process.cwd(), '..', '..', 'spec', 'schemas', '0.1');

/**
 * The copy the CLI reads at runtime.
 *
 * There are three copies of every schema: the specification's, the one inlined
 * into `src/schemas.ts` so the core runs without a filesystem, and this
 * directory — which `src/cli/index.ts` resolves at runtime and which ships in
 * the package's `files`.
 *
 * Only the inlined one had a guard. It caught a real drift the day the schema
 * titles changed, and this directory sat stale beside it with nothing
 * watching: a published CLI enforcing one document while the specification
 * says another, which is the exact failure the inlined guard exists to stop.
 */
describe('the schemas the CLI ships', () => {
  const SHIPPED = join(process.cwd(), 'schemas');

  it('agree with the specification, field for field', () => {
    for (const file of readdirSync(SPEC).filter((name) =>
      name.endsWith('.schema.json')
    )) {
      const shipped = join(SHIPPED, file);
      expect(existsSync(shipped), `${file} is not shipped`).toBe(true);
      expect(
        JSON.parse(readFileSync(shipped, 'utf-8')),
        `${file} disagrees with spec/schemas/0.1 — re-copy it`
      ).toEqual(JSON.parse(readFileSync(join(SPEC, file), 'utf-8')));
    }
  });
});

describe('bundled schemas', () => {
  const onDisk = readdirSync(SPEC).filter((file) =>
    file.endsWith('.schema.json')
  );

  it('bundles every schema the specification publishes', () => {
    expect(Object.keys(SCHEMAS).sort()).toEqual(onDisk.sort());
  });

  it.each(onDisk)('%s is identical to the published schema', (file) => {
    const published = JSON.parse(readFileSync(join(SPEC, file), 'utf-8'));
    expect(SCHEMAS[file]).toEqual(published);
  });

  it('keeps the absolute versioned $id, so it still resolves', () => {
    for (const [name, schema] of Object.entries(SCHEMAS)) {
      expect((schema as { $id?: string }).$id, name).toMatch(
        /^https:\/\/cabuya\.org\/schemas\/\d+\.\d+\//
      );
    }
  });

  it('is reachable through the accessor the engine callers use', () => {
    expect(bundledSchemas()).toBe(SCHEMAS);
  });
});
