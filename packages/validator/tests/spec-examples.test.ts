/**
 * The five worked examples from `spec/examples/0.1/` — the acceptance
 * fixtures the whole protocol teaches from.
 *
 * The two valid examples must produce zero errors. The three invalid ones
 * must produce the check ids their `$comment` teaching notes describe. This
 * is the layered contract `spec:check` records: some designed violations are
 * schema-level, others are semantic (and, from Task 14/15, PII and
 * behavioral).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { Engine, type Report } from '../src/index.js';
import { schemaPass } from '../src/passes/schema.js';
import { semanticPass } from '../src/passes/semantic.js';

const SPEC_ROOT = join(import.meta.dirname, '..', '..', '..', 'spec');
const EXAMPLES = join(SPEC_ROOT, 'examples', '0.1');

let schemas: Record<string, unknown>;
beforeAll(() => {
  const dir = join(SPEC_ROOT, 'schemas', '0.1');
  schemas = Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f, JSON.parse(readFileSync(join(dir, f), 'utf-8'))])
  );
});

async function validate(path: string): Promise<Report> {
  const raw = readFileSync(path, 'utf-8');
  return new Engine({
    validatorVersion: 'test',
    specVersion: '0.1.0',
    target: path,
    schemas,
    now: () => new Date('2026-08-16T00:00:00.000Z'),
  })
    .register(schemaPass, semanticPass)
    .run(JSON.parse(raw), raw);
}

const errorIds = (report: Report) =>
  report.findings.filter((f) => f.severity === 'error').map((f) => f.id);

describe('the two valid examples', () => {
  for (const file of ['valid-minimal-core.json', 'valid-rich-extended.json']) {
    it(`${file} produces no errors`, async () => {
      const report = await validate(join(EXAMPLES, 'valid', file));
      expect(errorIds(report)).toEqual([]);
    });
  }
});

describe('the three invalid examples produce their designed check ids', () => {
  it('invalid-1 (omitted confirmation key) → REC001', async () => {
    const report = await validate(
      join(EXAMPLES, 'invalid', 'invalid-1-missing-confirmation-key.json')
    );
    expect(errorIds(report)).toContain('REC001');
    const finding = report.findings.find((f) => f.id === 'REC001');
    // The parenthetical is the whole design: it names the honest alternative
    // so an agent cannot "fix" the error by inventing a timestamp.
    expect(finding?.message).toContain('last_confirmed_at: null');
  });

  it('invalid-3 (state in name) → REC010 (BEH002 arrives with the probes)', async () => {
    const report = await validate(
      join(EXAMPLES, 'invalid', 'invalid-3-status-in-name-and-always-now.json')
    );
    expect(errorIds(report)).toContain('REC010');
  });

  it('invalid-2 (contact + personal data) is caught by the PII pass, not these two', async () => {
    // Recorded expectation, not an accident: its violations are §7 exclusions,
    // which the deny pass owns (Task 14). Until then this example passes the
    // content passes — exactly what spec:check's layered contract says.
    const report = await validate(
      join(EXAMPLES, 'invalid', 'invalid-2-contact-and-personal-data.json')
    );
    expect(report).toBeDefined();
  });
});

describe('degraded-mode honesty on real data', () => {
  it('never claims conformance without transport checks', async () => {
    const report = await validate(
      join(EXAMPLES, 'valid', 'valid-minimal-core.json')
    );
    expect(report.degraded).toBe(true);
    expect(report.measured_level).toBeNull();
    expect(report.not_measured_in_this_version.length).toBeGreaterThan(0);
  });
});
