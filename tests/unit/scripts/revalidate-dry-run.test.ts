/**
 * The cron, driven end to end against fixtures.
 *
 * `revalidation-state.test.ts` covers the transitions; this covers the wiring
 * around them — that the script reads the real registry, applies the real state
 * machine, and in dry-run mode writes nothing. The distinction matters because
 * the state machine being correct is worthless if the script feeds it the wrong
 * exit code or the wrong previous record.
 *
 * Run through the fixture path rather than the network. A test suite that
 * fetched four volunteer-run servers on every commit would be exactly the
 * behaviour the cron's own budgets exist to prevent.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const FIXTURES = 'tests/fixtures/revalidate';

const dryRun = (extra: string[] = []): string =>
  execFileSync(
    process.execPath,
    ['scripts/revalidate.mjs', '--dry-run', '--fixtures', FIXTURES, ...extra],
    { cwd: ROOT, encoding: 'utf-8' }
  );

describe('the fixtures', () => {
  it('cover one of each outcome the state machine branches on', () => {
    const codes = readdirSync(join(ROOT, FIXTURES))
      .filter((file) => file.endsWith('.json'))
      .map(
        (file) =>
          JSON.parse(readFileSync(join(ROOT, FIXTURES, file), 'utf-8')).code
      );
    expect(new Set(codes)).toEqual(new Set([0, 1, 3]));
  });

  it('exists for every active publisher, so no run is silently skipped', () => {
    const publishers = readdirSync(join(ROOT, 'registry/publishers'))
      .filter((file) => file.endsWith('.json'))
      .map(
        (file) =>
          JSON.parse(
            readFileSync(join(ROOT, 'registry/publishers', file), 'utf-8')
          ).publisher_id
      );
    const fixtures = readdirSync(join(ROOT, FIXTURES))
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, ''));
    expect(fixtures.sort()).toEqual(publishers.sort());
  });
});

describe('a dry run', () => {
  const output = dryRun();

  it('writes nothing', () => {
    expect(output).toContain('nothing written');
    expect(output).not.toContain('status record(s) written');
  });

  it('reports one transition per active publisher', () => {
    const lines = output
      .split('\n')
      .filter((line) => /^ {2}\S/.test(line) && !line.startsWith('  ---'));
    expect(lines).toHaveLength(4);
  });

  it('turns a clean run into conforming', () => {
    expect(output).toMatch(/corag\s+unmeasured → conforming/);
  });

  it('turns errors into failing, and opens a status issue', () => {
    expect(output).toMatch(
      /pereira-ayuda\s+unmeasured → failing\s+\[issue: open\]/
    );
  });

  it('leaves a single transport failure alone — no badge moves', () => {
    // The two-strike rule, seen from outside: one failed fetch produces no
    // transition at all on an entry that was never measured.
    expect(output).toMatch(/pereira-responde\s+unmeasured$/m);
    expect(output).not.toMatch(/pereira-responde.*unreachable/);
  });

  it('calls a passing run with an old feed stale, not failing', () => {
    expect(output).toMatch(/reporte-co\s+unmeasured → stale/);
  });
});

describe('--only', () => {
  it('narrows the run to one publisher', () => {
    const output = dryRun(['--only', 'corag']);
    expect(output).toContain('1 publisher(s)');
    expect(output).toContain('corag');
    expect(output).not.toContain('reporte-co');
  });
});
