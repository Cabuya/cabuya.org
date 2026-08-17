#!/usr/bin/env node

/**
 * Inline `spec/schemas/0.1/*.json` into `src/schemas.ts`.
 *
 * The core cannot read from disk — that is what makes it portable across Node,
 * a browser and a Worker — so the schemas have to be part of the module graph.
 * This copies them verbatim rather than transforming them: a schema that means
 * something slightly different in the package than in `spec/` is the worst kind
 * of bug in a conformance tool, because both copies look right.
 *
 * `tests/schemas.test.ts` compares the two and fails if they diverge, so
 * forgetting to run this is caught by the suite rather than by a publisher.
 *
 * Usage: node scripts/inline-schemas.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = join(PKG, '..', '..', 'spec', 'schemas', '0.1');
const TARGET = join(PKG, 'src', 'schemas.ts');

const entries = readdirSync(SPEC)
  .filter((file) => file.endsWith('.schema.json'))
  .sort()
  .map((file) => [file, JSON.parse(readFileSync(join(SPEC, file), 'utf-8'))]);

const body = `export const SCHEMAS: Record<string, unknown> = ${JSON.stringify(
  Object.fromEntries(entries),
  null,
  2
)};`;

const source = readFileSync(TARGET, 'utf-8');
writeFileSync(
  TARGET,
  source.replace(
    /\/\* GENERATED:START \*\/[\s\S]*?\/\* GENERATED:END \*\//,
    `/* GENERATED:START */\n${body}\n/* GENERATED:END */`
  )
);
console.log(`inlined ${entries.length} schema(s) into src/schemas.ts`);
