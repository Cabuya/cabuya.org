/**
 * Unit tests for the spec:check / spec:boundary gate core — each rule proven
 * to fire on a seeded fixture and to stay silent on the near-miss.
 */
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// @ts-expect-error — plain-ESM gate module without type declarations
import {
  checkExtensions,
  checkNoImports,
  checkPii,
  checkRequiredFiles,
  checkSpecVersion,
  expectedSchemaId,
  schemaKeyForExample,
} from '../../../scripts/lib/spec-checks.mjs';

const FX = join(process.cwd(), 'tests/fixtures/spec-gates');

describe('spec:check core', () => {
  const findings = checkSpecVersion(FX, '9.9') as {
    check: string;
    file: string;
  }[];

  it('flags the wrong $id (B5) and nothing about the good schema', () => {
    const idFindings = findings.filter((f) => f.check === 'schema-id');
    expect(idFindings).toHaveLength(1);
    expect(idFindings[0].file).toContain('manifest.schema.json');
  });

  it('accepts the valid example and the declared invalid example', () => {
    expect(findings.some((f) => f.check === 'valid-example-fails')).toBe(false);
    expect(findings.some((f) => f.file.includes('bad-schema.json'))).toBe(
      false
    );
  });

  it('flags a schema-passing invalid example with no INVALID declaration', () => {
    const undeclared = findings.filter(
      (f) => f.check === 'invalid-example-undeclared'
    );
    expect(undeclared).toHaveLength(1);
    expect(undeclared[0].file).toContain('undeclared-pass.json');
  });

  it('derives the canonical $id shape', () => {
    expect(expectedSchemaId('0.1', 'place-feed.schema.json')).toBe(
      'https://cabuya.org/schemas/0.1/place-feed.schema.json'
    );
  });

  it('routes examples to the right schema', () => {
    expect(schemaKeyForExample({ protocol: {} })).toBe('manifest.schema.json');
    expect(schemaKeyForExample({ data: {} })).toBe('place-feed.schema.json');
  });
});

describe('spec:boundary core', () => {
  it('B1 fires on a bare import and not on fenced code', () => {
    const bad = checkNoImports(join(FX, 'bounded-bad')) as { check: string }[];
    expect(bad.some((f) => f.check === 'B1-import')).toBe(true);
    const good = checkNoImports(join(FX, 'bounded-good'));
    expect(good).toEqual([]);
  });

  it('B4 fires on a .ts file inside a bounded dir', () => {
    const bad = checkExtensions(join(FX, 'bounded-bad')) as {
      check: string;
      file: string;
    }[];
    expect(bad.some((f) => f.file.endsWith('script.ts'))).toBe(true);
  });

  it('B3 reports the missing LICENSE and a missing CODEOWNERS entry', () => {
    const bad = checkRequiredFiles(
      join(FX, 'bounded-bad'),
      join(FX, 'no-codeowners'),
      '/bounded-bad/'
    ) as { check: string }[];
    expect(bad.some((f) => f.check === 'B3-file')).toBe(true);
    expect(bad.some((f) => f.check === 'B3-codeowners')).toBe(true);
  });

  it('B7 fires on personal email + phone, never echoing the value, and allows org addresses', () => {
    const bad = checkPii(join(FX, 'bounded-bad')) as {
      check: string;
      message: string;
    }[];
    expect(bad.length).toBeGreaterThanOrEqual(2);
    for (const f of bad) {
      expect(f.message).not.toContain('gmail');
      expect(f.message).not.toContain('300 123');
    }
    const good = checkPii(join(FX, 'bounded-good'));
    expect(good).toEqual([]);
  });
});
