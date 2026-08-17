/**
 * How a report is rendered.
 *
 * Three fixture reports — clean, with errors, and degraded — because the
 * differences between them are the ones that matter most to a reader deciding
 * whether their work is finished:
 *
 *   - blockers come first, since they are the next action;
 *   - severity is always a word, never colour alone (`docs/ACCESSIBILITY.md`
 *     makes that a site rule specifically for this surface);
 *   - a degraded run says "conformance unmeasured", never "conforming".
 */
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import ReportView from '@/components/validator/ReportView.svelte';

afterEach(cleanup);

const LABELS = {
  result: 'Result',
  blockers: 'Blocking the next level',
  errors: 'Errors',
  warnings: 'Warnings',
  notes: 'Notes',
  none: 'Nothing to report.',
  fix: 'Fix',
  rule: 'Rule',
  spec: 'Specification',
  check: 'About this check',
  degraded: 'Schema-valid; conformance unmeasured.',
};

const finding = (over: Record<string, unknown> = {}) => ({
  id: 'REC001',
  severity: 'error',
  level: 'L2',
  pointer: '/data/places/0',
  message: 'last_confirmed_at is missing.',
  rule: 'The confirmation key is REQUIRED.',
  fix: 'Publish null when nobody has confirmed it.',
  spec: 'https://cabuya.org/developers/spec/0.1/6-trust-and-verification#6-1',
  ...over,
});

const report = (over: Record<string, unknown> = {}) =>
  ({
    findings: [],
    blockers_for_next_level: [],
    degraded: false,
    ...over,
  }) as never;

describe('report view — a clean run', () => {
  it('says there is nothing to report', () => {
    render(ReportView, {
      report: report(),
      summary: 'conforming at L2',
      labels: LABELS,
    });
    expect(screen.getByText('Nothing to report.')).toBeInTheDocument();
    expect(screen.getByText('conforming at L2')).toBeInTheDocument();
  });
});

describe('report view — findings', () => {
  it('puts blockers before everything else', () => {
    render(ReportView, {
      report: report({
        findings: [
          finding({ id: 'ENV004', severity: 'warning', message: 'A warning.' }),
          finding(),
        ],
        blockers_for_next_level: ['REC001'],
      }),
      summary: 'non-conformant: 1 error(s)',
      labels: LABELS,
    });
    const html = document.body.innerHTML;
    expect(html.indexOf('Blocking the next level')).toBeLessThan(
      html.indexOf('Warnings')
    );
  });

  it('states severity as a word, not only as a colour', () => {
    render(ReportView, {
      report: report({
        findings: [finding()],
        blockers_for_next_level: ['REC001'],
      }),
      summary: 'non-conformant: 1 error(s)',
      labels: LABELS,
    });
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('links each finding to its check page and its spec anchor', () => {
    render(ReportView, {
      report: report({
        findings: [finding()],
        blockers_for_next_level: ['REC001'],
      }),
      summary: 'x',
      labels: LABELS,
      checksBase: '/developers/validator/checks',
    });
    expect(screen.getByRole('link', { name: 'REC001' })).toHaveAttribute(
      'href',
      '/developers/validator/checks#REC001'
    );
    expect(screen.getByRole('link', { name: 'Specification' })).toHaveAttribute(
      'href',
      finding().spec
    );
  });

  it('shows the fix, which is the actionable half', () => {
    render(ReportView, {
      report: report({ findings: [finding()] }),
      summary: 'x',
      labels: LABELS,
    });
    expect(
      screen.getByText(/Publish null when nobody has confirmed it/)
    ).toBeInTheDocument();
  });

  it('announces the result region politely', () => {
    const { container } = render(ReportView, {
      report: report(),
      summary: 'x',
      labels: LABELS,
    });
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});

describe('report view — a degraded run', () => {
  it('says conformance was not measured rather than implying it passed', () => {
    render(ReportView, {
      report: report({ degraded: true }),
      summary: 'schema-valid; conformance unmeasured',
      labels: LABELS,
    });
    expect(
      screen.getByText('Schema-valid; conformance unmeasured.')
    ).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('conforming at');
  });
});
