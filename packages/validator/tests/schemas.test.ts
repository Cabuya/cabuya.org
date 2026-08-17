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
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { bundledSchemas, SCHEMAS } from '../src/schemas.js';

const SPEC = join(process.cwd(), '..', '..', 'spec', 'schemas', '0.1');

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
