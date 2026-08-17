/**
 * Precompiled validators, and when they must *not* be used.
 *
 * The browser build runs ahead-of-time validators so it never calls
 * `new Function`, which the site's Content-Security-Policy forbids. That is a
 * real improvement and it introduces one real risk: a precompiled validator is
 * a *frozen copy* of a schema, and using it for a schema it was not built from
 * would enforce yesterday's contract while the harness believes it supplied
 * today's.
 *
 * The `$id` match is the guard. These tests are that guard's only proof.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PRECOMPILED } from '../src/generated/index.js';
import { schemaPass } from '../src/passes/schema.js';
import type { Finding } from '../src/report.js';

const SPEC = join(import.meta.dirname, '..', '..', '..', 'spec');
const read = (path: string) =>
  JSON.parse(readFileSync(join(SPEC, path), 'utf-8'));

const feedSchema = read('schemas/0.1/place-feed.schema.json');
const validFeed = read('examples/0.1/valid/valid-minimal-core.json');
const invalidFeed = read(
  'examples/0.1/invalid/invalid-1-missing-confirmation-key.json'
);

/**
 * The schema pass is synchronous — it is the only pass that never fetches —
 * but `Pass.run` is typed for the async ones too. Narrowed here so the
 * assertions can index the result rather than every test awaiting a value
 * that is never a promise.
 */
const run = (document: unknown, schemas: Record<string, unknown>): Finding[] =>
  schemaPass.run({ document, schemas, raw: '' } as never) as Finding[];

describe('the precompiled validators', () => {
  it('exist for every schema the engine validates against', () => {
    expect(Object.keys(PRECOMPILED)).toContain('place-feed.schema.json');
    expect(Object.keys(PRECOMPILED)).toContain('manifest.schema.json');
  });

  it('record the $id they were built from', () => {
    // The guard has nothing to compare without it.
    for (const [name, entry] of Object.entries(PRECOMPILED)) {
      expect(entry?.$id, name).toBeTruthy();
      expect(entry?.$id, name).toContain('cabuya.org/schemas/');
    }
  });

  it('contain no call to new Function', () => {
    // The whole point. If Ajv ever emits one, the validator page goes silent
    // again under the CSP — and silently, which is how it was found the first
    // time.
    const file = readFileSync(
      join(
        import.meta.dirname,
        '..',
        'src',
        'generated',
        'place-feed.schema.js'
      ),
      'utf-8'
    );
    // Strip the generated header, which explains in prose that the file avoids
    // `new Function` — and would otherwise match a naive search for it.
    const code = file.replace(/^\/\*\*[\s\S]*?\*\//, '');

    expect(code).not.toMatch(/new\s+Function\s*\(/);
    expect(code).not.toMatch(/\beval\s*\(/);
  });
});

describe('the schema pass', () => {
  it('accepts a conforming feed', () => {
    expect(run(validFeed, { 'place-feed.schema.json': feedSchema })).toEqual(
      []
    );
  });

  it('reports the missing confirmation key with its designed message', () => {
    const findings = run(invalidFeed, { 'place-feed.schema.json': feedSchema });
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toContain('last_confirmed_at');
  });

  it('falls back to runtime compilation when the $id does not match', () => {
    /*
     * The guard, exercised. A harness supplying a *different* schema under a
     * familiar filename must be validated against what it supplied — not
     * against the copy that was compiled at build time.
     *
     * Here the injected schema requires a field the real one does not, so a
     * feed that is valid under the precompiled copy must now fail. If the
     * precompiled validator were used regardless, this returns no findings.
     */
    const different = {
      ...feedSchema,
      $id: 'https://example.invalid/schemas/9.9/place-feed.schema.json',
      required: [...feedSchema.required, 'a_field_that_does_not_exist'],
    };

    const findings = run(validFeed, { 'place-feed.schema.json': different });
    expect(
      findings.length,
      'the precompiled validator was used for a schema it was not built from'
    ).toBeGreaterThan(0);
    expect(JSON.stringify(findings)).toContain('a_field_that_does_not_exist');
  });

  it('falls back when the injected schema carries no $id at all', () => {
    const anonymous = { ...feedSchema };
    delete (anonymous as { $id?: string }).$id;
    // Still validates — via the runtime path — rather than silently using a
    // copy it cannot confirm is the same.
    expect(run(validFeed, { 'place-feed.schema.json': anonymous })).toEqual([]);
  });

  it('throws a harness error, not a conformance failure, for a missing schema', () => {
    // A schema the harness forgot to inject is a bug in the harness. Reporting
    // it as non-conformance would blame a publisher for our mistake.
    expect(() => run(validFeed, {})).toThrow(/harness/i);
  });
});

/**
 * The authored messages for each schema keyword.
 *
 * These are the strings an implementer reads and an agent acts on, so each one
 * has to name the fix rather than the violation (rule M3). The keywords below
 * were the ones no fixture happened to reach.
 */
describe('schema findings name the fix, per keyword', () => {
  const check = (schema: Record<string, unknown>, document: unknown) =>
    run(document, {
      'place-feed.schema.json': {
        $id: 'https://example.invalid/schemas/test/place-feed.schema.json',
        ...schema,
      },
    });

  it('explains a pattern failure by naming the pattern', () => {
    const findings = check(
      {
        type: 'object',
        properties: {
          version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        },
      },
      { ...validFeed, version: 'one-point-oh' }
    );
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toContain('required shape');
    expect(findings[0].fix).toContain('\\d');
  });

  it('explains a format failure by naming the format', () => {
    const findings = check(
      {
        type: 'object',
        properties: { last_updated: { type: 'string', format: 'date-time' } },
      },
      { ...validFeed, last_updated: 'yesterday' }
    );
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toContain('date-time');
    expect(findings[0].fix.toLowerCase()).toContain('rfc');
  });

  it('explains an out-of-range value', () => {
    const findings = check(
      { type: 'object', properties: { ttl: { type: 'integer', minimum: 0 } } },
      { ...validFeed, ttl: -1 }
    );
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].message).toContain('out of range');
    expect(findings[0].fix).toContain('range');
  });

  it('gives every finding a pointer, a rule and a docs link', () => {
    // The six fields a fix loop parses. A finding missing any of them is one
    // an agent cannot act on.
    const findings = check(
      { type: 'object', properties: { ttl: { type: 'integer', minimum: 0 } } },
      { ...validFeed, ttl: -1 }
    );
    for (const finding of findings) {
      expect(finding.id).toBeTruthy();
      expect(finding.severity).toBeTruthy();
      expect(finding.rule).toBeTruthy();
      expect(finding.fix).toBeTruthy();
      expect(finding.docs).toContain('cabuya.org');
    }
  });
});
