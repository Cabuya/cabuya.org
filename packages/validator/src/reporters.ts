/**
 * Report renderers: text, json, sarif, markdown.
 *
 * All four render the SAME report object, so a publisher who reads the text
 * output and a CI job that parses the JSON are looking at one truth.
 *
 * Accessibility rule, normative for this project: **severity is never
 * communicated by colour alone.** Every finding carries its severity as a
 * text token in every format, including the TTY one — colour is decoration
 * on top of a label that is already there.
 */

import { getCheck } from './checks.js';
import type { Finding, Report, Severity } from './report.js';
import { summaryPhrase } from './report.js';

export type Format = 'text' | 'json' | 'sarif' | 'markdown';

/** Severity as a text token — the a11y contract, in every format. */
const TOKEN: Record<Severity, string> = {
  error: 'ERROR',
  warning: 'WARN ',
  info: 'INFO ',
};

const COLOR: Record<Severity, string> = {
  error: '[31m',
  warning: '[33m',
  info: '[36m',
};
const RESET = '[0m';
const DIM = '[2m';

export interface RenderOptions {
  color?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  /** Translations for message/rule/fix; ids and pointers never translate. */
  translate?: (finding: Finding) => Finding;
}

function groupByOutcome(report: Report): {
  blockers: Finding[];
  otherErrors: Finding[];
  warnings: Finding[];
  infos: Finding[];
} {
  const blocking = new Set(report.blockers_for_next_level);
  return {
    blockers: report.findings.filter(
      (f) => f.severity === 'error' && blocking.has(f.id)
    ),
    otherErrors: report.findings.filter(
      (f) => f.severity === 'error' && !blocking.has(f.id)
    ),
    warnings: report.findings.filter((f) => f.severity === 'warning'),
    infos: report.findings.filter((f) => f.severity === 'info'),
  };
}

// ── text (the TTY default) ────────────────────────────────

export function renderText(
  report: Report,
  options: RenderOptions = {}
): string {
  const { color = false, quiet = false, verbose = false } = options;
  const t = options.translate ?? ((f: Finding) => f);
  const paint = (severity: Severity, text: string): string =>
    color ? `${COLOR[severity]}${text}${RESET}` : text;
  const dim = (text: string): string =>
    color ? `${DIM}${text}${RESET}` : text;

  const lines: string[] = [];
  const { blockers, otherErrors, warnings, infos } = groupByOutcome(report);

  lines.push(`Cabuya validator ${report.validator_version} — ${report.target}`);
  lines.push(
    `${summaryPhrase(report)}${
      report.measured_level ? '' : report.degraded ? ' (no network)' : ''
    }`
  );
  lines.push('');

  const section = (title: string, findings: Finding[]): void => {
    if (findings.length === 0) return;
    lines.push(`${title} (${findings.length})`);
    for (const raw of findings) {
      const finding = t(raw);
      lines.push(
        `  ${paint(finding.severity, TOKEN[finding.severity])} ${finding.id}  ${finding.pointer || '(document)'}`
      );
      lines.push(`      ${finding.message}`);
      lines.push(`      ${dim('fix:')} ${finding.fix}`);
      if (verbose) {
        lines.push(`      ${dim('rule:')} ${finding.rule}`);
        lines.push(`      ${dim('spec:')} ${finding.spec}`);
        lines.push(`      ${dim('docs:')} ${finding.docs}`);
        if (finding.suggested_patch) {
          lines.push(
            `      ${dim('patch:')} ${JSON.stringify(finding.suggested_patch)}`
          );
        }
      }
    }
    lines.push('');
  };

  // Blockers first: the fix loop's next action, not the longest list.
  section('Blocking the next level', blockers);
  section('Errors', otherErrors);
  if (!quiet) {
    section('Warnings', warnings);
    section('Notes', infos);
  }

  if (report.blockers_for_next_level.length > 0) {
    lines.push(
      `Fix ${report.blockers_for_next_level.join(', ')} to reach the next level.`
    );
  }
  if (report.not_measured_in_this_version.length > 0) {
    lines.push(
      dim(
        `Not measured by this version: ${report.not_measured_in_this_version.join(', ')}.`
      )
    );
  }
  return `${lines.join('\n')}\n`;
}

// ── json (the machine contract) ───────────────────────────

export function renderJson(report: Report): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

// ── markdown (paste into an agent session or a PR) ────────

export function renderMarkdown(
  report: Report,
  options: RenderOptions = {}
): string {
  const t = options.translate ?? ((f: Finding) => f);
  const lines: string[] = [
    `# Cabuya conformance report`,
    '',
    `- **Target:** ${report.target}`,
    `- **Result:** ${summaryPhrase(report)}`,
    `- **Checked:** ${report.checked_at}`,
    `- **Validator:** ${report.validator_version} (spec ${report.spec_version})`,
  ];
  if (report.blockers_for_next_level.length > 0) {
    lines.push(
      `- **Blocking the next level:** ${report.blockers_for_next_level.join(', ')}`
    );
  }
  if (report.degraded) {
    lines.push(
      '- **Degraded run:** transport checks did not run, so conformance is unmeasured.'
    );
  }
  lines.push('');

  if (report.findings.length === 0) {
    lines.push('No findings.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('| Severity | Check | Location | What to fix |');
  lines.push('|---|---|---|---|');
  for (const raw of report.findings) {
    const f = t(raw);
    lines.push(
      `| ${f.severity} | [\`${f.id}\`](${f.docs}) | \`${f.pointer || '(document)'}\` | ${f.message} |`
    );
  }
  lines.push('');
  for (const raw of report.findings) {
    const f = t(raw);
    lines.push(`### ${f.id} — \`${f.pointer || '(document)'}\``);
    lines.push('');
    lines.push(`${f.message}`);
    lines.push('');
    lines.push(`- **Rule:** ${f.rule}`);
    lines.push(`- **Fix:** ${f.fix}`);
    if (f.suggested_patch) {
      lines.push(`- **Patch:** \`${JSON.stringify(f.suggested_patch)}\``);
    }
    lines.push(`- **Spec:** ${f.spec}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

// ── sarif (code scanning) ─────────────────────────────────

const SARIF_LEVEL: Record<Severity, string> = {
  error: 'error',
  warning: 'warning',
  info: 'note',
};

export function renderSarif(report: Report): string {
  const rules = [...new Set(report.findings.map((f) => f.id))].map((id) => {
    const check = getCheck(id);
    return {
      id,
      name: id,
      shortDescription: { text: check?.title ?? id },
      fullDescription: { text: check?.rule ?? '' },
      helpUri: check
        ? `https://cabuya.org/developers/validator/checks#${id}`
        : undefined,
      properties: {
        level: check?.level,
        family: check?.family,
      },
    };
  });

  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'cabuya-validator',
            version: report.validator_version,
            informationUri: 'https://cabuya.org/developers/validator',
            rules,
          },
        },
        results: report.findings.map((f) => ({
          ruleId: f.id,
          level: SARIF_LEVEL[f.severity],
          message: { text: `${f.message} Fix: ${f.fix}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: report.target },
                ...(f.location
                  ? {
                      region: {
                        startLine: f.location.line,
                        startColumn: f.location.column,
                      },
                    }
                  : {}),
              },
              logicalLocations: [{ fullyQualifiedName: f.pointer || '/' }],
            },
          ],
        })),
      },
    ],
  };
  return `${JSON.stringify(sarif, null, 2)}\n`;
}

export function render(
  report: Report,
  format: Format,
  options: RenderOptions = {}
): string {
  switch (format) {
    case 'json':
      return renderJson(report);
    case 'sarif':
      return renderSarif(report);
    case 'markdown':
      return renderMarkdown(report, options);
    default:
      return renderText(report, options);
  }
}
