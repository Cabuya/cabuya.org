/**
 * `summaryPhrase` — the one line a human reads.
 *
 * Four outcomes, and the differences between them are the whole point:
 * "non-conformant" is a measurement, "schema-valid; conformance unmeasured" is
 * a refusal to claim one, and "no level measured" is neither. Collapsing any
 * two of them would be the exact failure this project argues against — and it
 * is a two-line function, so nothing else would catch it.
 */
import { describe, expect, it } from 'vitest';

import type { Report } from '../src/report.js';
import { summarize, summaryPhrase } from '../src/report.js';

const report = (overrides: Partial<Report> = {}): Report =>
  ({
    summary: { errors: 0, warnings: 0, infos: 0 },
    ...overrides,
  }) as Report;

describe('summaryPhrase', () => {
  it('names the error count when the document is non-conformant', () => {
    const phrase = summaryPhrase(
      report({ summary: { errors: 2, warnings: 1, infos: 0 } })
    );
    expect(phrase).toContain('non-conformant');
    expect(phrase).toContain('2');
  });

  it('refuses to claim conformance from a degraded run', () => {
    // Errors take precedence, but with none, a degraded run says exactly this
    // and nothing stronger.
    const phrase = summaryPhrase(
      report({ degraded: true, measured_level: 'L2' })
    );
    expect(phrase).toBe('schema-valid; conformance unmeasured');
    expect(phrase).not.toContain('conforming');
  });

  it('reports errors even in a degraded run', () => {
    // A degraded run that found schema errors is still reporting errors — the
    // unmeasured phrase must not hide them.
    const phrase = summaryPhrase(
      report({ degraded: true, summary: { errors: 1, warnings: 0, infos: 0 } })
    );
    expect(phrase).toContain('non-conformant');
  });

  it('states the measured level when there is one', () => {
    expect(summaryPhrase(report({ measured_level: 'L2' }))).toBe(
      'conforming at L2'
    );
  });

  it('says no level was measured rather than implying one', () => {
    // The case where nothing failed and nothing was established — which is not
    // the same as passing.
    expect(summaryPhrase(report())).toBe('no level measured');
  });
});

describe('summarize', () => {
  it('counts by severity', () => {
    const counted = summarize([
      { severity: 'error' },
      { severity: 'error' },
      { severity: 'warning' },
      { severity: 'info' },
    ] as never);
    expect(counted).toEqual({ errors: 2, warnings: 1, infos: 1 });
  });

  it('counts nothing as zeroes rather than undefined', () => {
    expect(summarize([])).toEqual({ errors: 0, warnings: 0, infos: 0 });
  });
});
