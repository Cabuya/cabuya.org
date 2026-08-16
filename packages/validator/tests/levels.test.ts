/**
 * Level computation.
 *
 * The rule that matters most here is honesty about the boundary: a level
 * this build cannot measure must never look like a level the publisher
 * failed. `not_measured_in_this_version` states the gap explicitly.
 */
import { describe, expect, it } from 'vitest';

import {
  blockersForNextLevel,
  computeMeasuredLevel,
  Engine,
  type Finding,
  LEVELS,
  type Level,
  measurableLevels,
} from '../src/index.js';

const err = (id: string, level: Level): Finding => ({
  id,
  severity: 'error',
  level,
  pointer: '',
  message: 'm',
  rule: 'r',
  fix: 'f',
  spec: 's',
  docs: 'd',
});

const warn = (id: string, level: Level): Finding => ({
  ...err(id, level),
  severity: 'warning',
});

describe('measurable levels', () => {
  it('L0–L2 are measurable in this build; L3/L4 are not', () => {
    const measurable = measurableLevels();
    expect(measurable).toContain('L0');
    expect(measurable).toContain('L1');
    expect(measurable).toContain('L2');
    expect(measurable).not.toContain('L3');
    expect(measurable).not.toContain('L4');
  });

  it('every ladder level is either measurable or explicitly stated as not', async () => {
    const report = await new Engine({
      validatorVersion: 't',
      specVersion: '0.1.0',
      target: 'inline',
      fetcher: {
        fetch: async () => ({
          ok: true,
          status: 200,
          headers: {},
          body: '',
          bytes: 0,
          elapsedMs: 0,
        }),
        requestCount: () => 0,
      },
    }).run({});
    for (const level of LEVELS) {
      expect(
        measurableLevels().includes(level) ||
          report.not_measured_in_this_version.includes(level),
        level
      ).toBe(true);
    }
  });
});

describe('walking the ladder', () => {
  const measurable = measurableLevels();

  it('a clean run measures the highest measurable level', () => {
    expect(computeMeasuredLevel([], measurable)).toBe('L2');
  });

  it('an L2 error stops the walk at L1', () => {
    expect(computeMeasuredLevel([err('REC001', 'L2')], measurable)).toBe('L1');
  });

  it('an L1 error stops the walk at L0', () => {
    expect(computeMeasuredLevel([err('DSC002', 'L1')], measurable)).toBe('L0');
  });

  it('warnings never block a level', () => {
    expect(
      computeMeasuredLevel(
        [warn('REC005', 'L2'), warn('ENV008', 'L2')],
        measurable
      )
    ).toBe('L2');
  });

  it('errors at an unmeasurable level do not lower the measured level', () => {
    expect(computeMeasuredLevel([err('API001', 'L3')], measurable)).toBe('L2');
  });
});

describe('blockers for the next level', () => {
  const measurable = measurableLevels();

  it('lists exactly the error ids standing at the next rung, deduplicated and sorted', () => {
    const findings = [
      err('REC001', 'L2'),
      err('ENV007', 'L2'),
      err('REC001', 'L2'),
      warn('REC005', 'L2'),
    ];
    expect(blockersForNextLevel(findings, 'L1', measurable)).toEqual([
      'ENV007',
      'REC001',
    ]);
  });

  it('is empty when the next rung is beyond what this build measures', () => {
    expect(
      blockersForNextLevel([err('API001', 'L3')], 'L2', measurable)
    ).toEqual([]);
  });

  it('turns "six problems" into "fix these two" — the fix-loop contract', () => {
    const findings = [
      err('REC001', 'L2'),
      err('ENV007', 'L2'),
      warn('REC005', 'L2'),
      warn('REC013', 'L2'),
      warn('ENV008', 'L2'),
      warn('LIC001', 'L2'),
    ];
    const blockers = blockersForNextLevel(findings, 'L1', measurable);
    expect(blockers).toHaveLength(2);
    expect(findings).toHaveLength(6);
  });
});
