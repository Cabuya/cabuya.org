/**
 * The badge state machine.
 *
 * Every rule in here exists because the naive version would publish something
 * unfair about a volunteer team's software, so every rule is tested from that
 * angle: what does this refuse to say, and under what conditions.
 *
 * The two-strike rule gets the most attention. It is the difference between a
 * badge that reports outages and a badge that reports afternoons.
 */
import { describe, expect, it } from 'vitest';

// @ts-expect-error — plain ESM, no types; the module is shared with the cron.
import {
  describeTransition,
  FAILURE_GAP_MS,
  FAILURES_BEFORE_UNREACHABLE,
  issueAction,
  nextStatus,
  outcomeFromExitCode,
  STALE_AFTER_HOURS,
} from '../../../scripts/lib/revalidation-state.mjs';

const AT = '2026-08-17T12:00:00.000Z';
const hoursBefore = (hours: number): string =>
  new Date(Date.parse(AT) - hours * 3_600_000).toISOString();

const run = (overrides: Record<string, unknown> = {}) => ({
  publisherId: 'corag',
  kind: 'pass',
  level: 'L2',
  failingChecks: [],
  feedAgeHours: 1,
  version: '0.1',
  at: AT,
  ...overrides,
});

describe('exit codes map to outcomes', () => {
  it('treats 0 and 2 as a pass — warnings do not fail a badge', () => {
    expect(outcomeFromExitCode(0)).toBe('pass');
    expect(outcomeFromExitCode(2)).toBe('pass');
  });

  it('separates content errors from transport failures', () => {
    expect(outcomeFromExitCode(1)).toBe('fail');
    expect(outcomeFromExitCode(3)).toBe('transport');
  });

  it('treats our own bugs as a skip, never as the publisher failing', () => {
    expect(outcomeFromExitCode(4)).toBe('skip');
    expect(outcomeFromExitCode(5)).toBe('skip');
  });
});

describe('a passing run', () => {
  it('records conforming with the level the validator measured', () => {
    const next = nextStatus(null, run());
    expect(next.state).toBe('conforming');
    expect(next.level).toBe('L2');
    expect(next.checked_at).toBe(AT);
    expect(next.consecutive_failures).toBe(0);
  });

  it('records stale when the feed itself is old, not when the run is', () => {
    const next = nextStatus(null, run({ feedAgeHours: STALE_AFTER_HOURS + 1 }));
    expect(next.state).toBe('stale');
    // Still a pass: staleness is information about freshness, not a verdict.
    expect(next.level).toBe('L2');
  });

  it('does not call a feed stale one hour before the threshold', () => {
    expect(
      nextStatus(null, run({ feedAgeHours: STALE_AFTER_HOURS - 1 })).state
    ).toBe('conforming');
  });

  it('clears a failure counter — recovery is immediate', () => {
    const previous = { state: 'unreachable', consecutive_failures: 3 };
    expect(nextStatus(previous, run()).consecutive_failures).toBe(0);
    expect(nextStatus(previous, run()).state).toBe('conforming');
  });
});

describe('a failing run', () => {
  it('records the failing check ids so the page can link them', () => {
    const next = nextStatus(
      null,
      run({ kind: 'fail', failingChecks: ['ENV-003', 'REC-011'] })
    );
    expect(next.state).toBe('failing');
    expect(next.failing_checks).toEqual(['ENV-003', 'REC-011']);
  });
});

describe('the two-strike rule', () => {
  it('does not move the badge on the first transport failure', () => {
    const previous = {
      state: 'conforming',
      level: 'L2',
      checked_at: hoursBefore(6),
      consecutive_failures: 0,
    };
    const next = nextStatus(previous, run({ kind: 'transport' }));

    // The badge still says what it said. One failed fetch is not evidence.
    expect(next.state).toBe('conforming');
    expect(next.level).toBe('L2');
    expect(next.consecutive_failures).toBe(1);
    // But the timestamp moves, so the second strike knows how long ago this was.
    expect(next.checked_at).toBe(AT);
  });

  it('moves to unreachable on the second failure an hour or more later', () => {
    const previous = {
      state: 'conforming',
      level: 'L2',
      checked_at: hoursBefore(6),
      consecutive_failures: 1,
    };
    const next = nextStatus(previous, run({ kind: 'transport' }));
    expect(next.state).toBe('unreachable');
    expect(next.consecutive_failures).toBe(FAILURES_BEFORE_UNREACHABLE);
  });

  it('does not count two failures inside the hour as two observations', () => {
    const previous = {
      state: 'conforming',
      checked_at: new Date(Date.parse(AT) - FAILURE_GAP_MS / 2).toISOString(),
      consecutive_failures: 1,
    };
    const next = nextStatus(previous, run({ kind: 'transport' }));
    expect(next.state).toBe('conforming');
    expect(next.consecutive_failures).toBe(1);
  });

  it('never turns a transport failure into failing', () => {
    for (const previousState of ['conforming', 'stale', 'unmeasured', null]) {
      const previous = previousState
        ? {
            state: previousState,
            checked_at: hoursBefore(6),
            consecutive_failures: 1,
          }
        : null;
      const next = nextStatus(previous, run({ kind: 'transport' }));
      expect(next.state).not.toBe('failing');
    }
  });

  it('leaves an unmeasured entry unmeasured on a first failure', () => {
    const next = nextStatus(null, run({ kind: 'transport' }));
    expect(next.state).toBe('unmeasured');
    expect(next.consecutive_failures).toBe(1);
  });
});

describe('a skipped run', () => {
  it('writes nothing at all — our bug never marks a publisher', () => {
    const previous = { state: 'conforming', level: 'L2' };
    expect(nextStatus(previous, run({ kind: 'skip' }))).toBeNull();
    expect(nextStatus(null, run({ kind: 'skip' }))).toBeNull();
  });
});

describe('the status issue', () => {
  it('opens on entering a bad state', () => {
    expect(issueAction({ state: 'conforming' }, { state: 'failing' })).toBe(
      'open'
    );
    expect(issueAction(null, { state: 'unreachable' })).toBe('open');
  });

  it('updates rather than reopening while the state persists', () => {
    expect(issueAction({ state: 'failing' }, { state: 'failing' })).toBe(
      'update'
    );
    expect(issueAction({ state: 'failing' }, { state: 'unreachable' })).toBe(
      'update'
    );
  });

  it('closes on recovery', () => {
    expect(issueAction({ state: 'unreachable' }, { state: 'conforming' })).toBe(
      'close'
    );
  });

  it('does nothing while everything is fine', () => {
    expect(issueAction({ state: 'conforming' }, { state: 'conforming' })).toBe(
      'none'
    );
    expect(issueAction({ state: 'conforming' }, null)).toBe('none');
  });
});

describe('transition descriptions', () => {
  it('names both ends when the state moved', () => {
    expect(
      describeTransition({ state: 'conforming' }, { state: 'failing' })
    ).toBe('conforming → failing');
  });

  it('names one end when it did not', () => {
    expect(
      describeTransition({ state: 'conforming' }, { state: 'conforming' })
    ).toBe('conforming');
  });
});
