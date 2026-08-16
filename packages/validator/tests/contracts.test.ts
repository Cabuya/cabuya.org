/**
 * The contracts every harness depends on: the report shape, deterministic
 * ordering, exit codes, the check catalogue's invariants, degraded-mode
 * honesty, and the structural no-network guarantee.
 */
import { describe, expect, it } from 'vitest';

import {
  CHECKS,
  Engine,
  EXIT,
  exitCodeFor,
  type Finding,
  getCheck,
  LEVELS,
  measurableLevels,
  OfflineFetcher,
  type Pass,
  parseJson,
  pointer,
  sortFindings,
  summaryPhrase,
} from '../src/index.js';

const finding = (over: Partial<Finding> = {}): Finding => ({
  id: 'REC001',
  severity: 'error',
  level: 'L2',
  pointer: '/data/places/0/last_confirmed_at',
  message: 'm',
  rule: 'r',
  fix: 'f',
  spec: 's',
  docs: 'd',
  ...over,
});

const engine = (passes: Pass[], opts = {}) =>
  new Engine({
    validatorVersion: '0.1.0',
    specVersion: '0.1.0',
    target: 'inline',
    now: () => new Date('2026-08-16T00:00:00.000Z'),
    ...opts,
  }).register(...passes);

describe('the check catalogue', () => {
  it('has unique, well-formed, stable ids', () => {
    const ids = CHECKS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Z]{3}\d{3}$/);
  });

  it('carries a rule, a title and a spec anchor for every check', () => {
    for (const check of CHECKS) {
      expect(check.title, check.id).toBeTruthy();
      expect(check.rule, check.id).toBeTruthy();
      expect(check.specAnchor, check.id).toMatch(/^https:\/\/cabuya\.org\//);
    }
  });

  it('gives every unimplemented check a plan, so the backlog is specified work', () => {
    for (const check of CHECKS.filter((c) => !c.implemented)) {
      expect(check.plannedIn, check.id).toBeTruthy();
    }
  });

  it('covers every family and every ladder level', () => {
    expect(new Set(CHECKS.map((c) => c.family)).size).toBeGreaterThanOrEqual(8);
    for (const level of ['L1', 'L2', 'L3', 'L4']) {
      expect(
        CHECKS.some((c) => c.level === level),
        level
      ).toBe(true);
    }
  });

  it('resolves by id', () => {
    expect(getCheck('BEH002')?.family).toBe('behavior');
    expect(getCheck('NOPE000')).toBeUndefined();
  });
});

describe('deterministic ordering', () => {
  it('sorts by level, then severity, then pointer, then id', () => {
    const sorted = sortFindings([
      finding({ id: 'BEH002', level: 'L2', severity: 'error', pointer: '/z' }),
      finding({
        id: 'DSC003',
        level: 'L1',
        severity: 'warning',
        pointer: '/a',
      }),
      finding({ id: 'ENV001', level: 'L2', severity: 'error', pointer: '/a' }),
      finding({
        id: 'ENV008',
        level: 'L2',
        severity: 'warning',
        pointer: '/a',
      }),
    ]);
    expect(sorted.map((f) => f.id)).toEqual([
      'DSC003',
      'ENV001',
      'BEH002',
      'ENV008',
    ]);
  });

  it('is stable across runs of the same input', () => {
    const input = [
      finding({ id: 'REC004', pointer: '/b' }),
      finding({ id: 'REC001', pointer: '/a' }),
    ];
    expect(sortFindings(input)).toEqual(sortFindings([...input].reverse()));
  });
});

describe('exit codes', () => {
  const report = (errors: number, warnings: number) =>
    ({
      summary: { errors, warnings, infos: 0 },
    }) as never;

  it('maps content errors to 1, strict warnings to 2, clean to 0', () => {
    expect(exitCodeFor(report(2, 0))).toBe(EXIT.NON_CONFORMANT);
    expect(exitCodeFor(report(0, 3), true)).toBe(EXIT.WARNINGS_STRICT);
    expect(exitCodeFor(report(0, 3), false)).toBe(EXIT.OK);
    expect(exitCodeFor(report(0, 0))).toBe(EXIT.OK);
  });

  it('distinguishes transport from content (the fix-loop-saving rule)', () => {
    expect(EXIT.TRANSPORT).not.toBe(EXIT.NON_CONFORMANT);
  });
});

describe('the engine', () => {
  it('runs every registered pass and never short-circuits on the first error', async () => {
    const ran: string[] = [];
    const mk = (name: string, id: string): Pass => ({
      name,
      run: () => {
        ran.push(name);
        return [finding({ id })];
      },
    });
    const report = await engine([
      mk('a', 'ENV001'),
      mk('b', 'REC001'),
      mk('c', 'REC004'),
    ]).run({});
    expect(ran).toEqual(['a', 'b', 'c']);
    expect(report.findings).toHaveLength(3);
  });

  it('emits the full report contract', async () => {
    const report = await engine([]).run({});
    for (const key of [
      'validator_version',
      'spec_version',
      'target',
      'checked_at',
      'measured_level',
      'requested_level',
      'profile',
      'degraded',
      'not_measured_in_this_version',
      'summary',
      'blockers_for_next_level',
      'findings',
      'probes',
    ]) {
      expect(report, key).toHaveProperty(key);
    }
  });

  it('produces identical reports for identical input (modulo checked_at)', async () => {
    const build = () =>
      engine([{ name: 'p', run: () => [finding()] }]).run({ a: 1 });
    expect(await build()).toEqual(await build());
  });

  it('states the levels it cannot measure instead of omitting them', async () => {
    const report = await engine([]).run({});
    const measurable = measurableLevels();
    for (const level of LEVELS) {
      const stated =
        measurable.includes(level) ||
        report.not_measured_in_this_version.includes(level);
      expect(stated, level).toBe(true);
    }
  });
});

describe('degraded mode is honest by construction', () => {
  it('marks the report degraded and never claims a measured level', async () => {
    const report = await engine([]).run({});
    expect(report.degraded).toBe(true);
    expect(report.measured_level).toBeNull();
    expect(summaryPhrase(report)).toBe('schema-valid; conformance unmeasured');
    expect(summaryPhrase(report)).not.toContain('conforming');
  });

  it('skips network passes rather than running them silently', async () => {
    let ran = false;
    const report = await engine([
      {
        name: 'probe',
        requiresNetwork: true,
        run: () => {
          ran = true;
          return [];
        },
      },
    ]).run({});
    expect(ran).toBe(false);
    expect(report.degraded).toBe(true);
  });

  it('the offline fetcher throws rather than reaching the network', async () => {
    await expect(
      new OfflineFetcher().fetch('https://example.org')
    ).rejects.toThrow(/no-network/);
  });
});

describe('locate helpers', () => {
  it('builds RFC 6901 pointers with escaping', () => {
    expect(pointer('data', 'places', 0, 'name')).toBe('/data/places/0/name');
    expect(pointer('a/b')).toBe('/a~1b');
    expect(pointer()).toBe('');
  });

  it('reports parse failures with a location', () => {
    const result = parseJson('{"a": }');
    expect(result.ok).toBe(false);
    expect(result.location?.line).toBe(1);
  });
});
