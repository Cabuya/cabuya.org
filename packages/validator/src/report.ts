/**
 * The report contract — the single most important interface in the project.
 *
 * Every harness (CLI, CI action, the portal's live checker, the registry
 * cron) emits exactly this shape, and the skill, the portal UI and the badge
 * cron all parse it. It is versioned by the package's own SemVer; changing a
 * field is a breaking change for four consumers at once.
 *
 * Design rules that live in the types themselves:
 *   - Findings carry a POINTER, never the offending value (the PII non-echo
 *     rule, spec §7 — a finding that echoed a phone number would leak it
 *     into a public CI log).
 *   - `blockers_for_next_level` exists so a fix loop can turn "here are six
 *     problems" into "fix these two and you are L2".
 *   - Ordering is deterministic (level → severity → pointer), so two runs of
 *     the same input diff cleanly.
 */

/** Conformance levels, in ladder order (spec §1). */
export const LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
export type Level = (typeof LEVELS)[number];

/** Severity: errors block the level, warnings do not, infos are notes. */
export type Severity = 'error' | 'warning' | 'info';

/** Conformance profile (spec §8.2). */
export type Profile = 'core' | 'extended';

/** An RFC 6902 operation the caller can apply mechanically (rule M4). */
export interface SuggestedPatch {
  op: 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

/**
 * One finding. The seven message rules (blueprint §4.5) are encoded as
 * separate fields on purpose: `message` locates and states, `rule` names the
 * requirement, `fix` is imperative, and `spec`/`docs` are always present so
 * an agent can resolve context without guessing.
 */
export interface Finding {
  /** Stable check id, never renumbered (e.g. `REC001`). */
  id: string;
  severity: Severity;
  /** The level this check gates. */
  level: Level;
  /** JSON Pointer into the document (RFC 6901). Never the value itself. */
  pointer: string;
  /** Line/column when the input was a file or raw text. */
  location?: { line: number; column: number };
  /** What is wrong, located precisely. One violation per message (M5). */
  message: string;
  /** What the protocol requires — the rule, not just the violation (M2). */
  rule: string;
  /** What to do, imperatively (M3). */
  fix: string;
  /** A minimal patch where the fix is mechanical (M4). */
  suggested_patch?: SuggestedPatch;
  /** Deep link to the normative anchor. */
  spec: string;
  /** Deep link to the check's documentation page. */
  docs: string;
}

/** Transport observations, filled by the fetch pass and the probes. */
export interface Probes {
  cors?: 'present' | 'missing' | 'unknown';
  soft_404?: 'pass' | 'fail' | 'unknown';
  always_now?: 'pass' | 'fail' | 'unknown';
  content_hash?: string;
  bytes?: number;
  elapsed_ms?: number;
  requests?: number;
}

export interface ReportSummary {
  errors: number;
  warnings: number;
  infos: number;
}

/** The full report. This shape is the public contract. */
export interface Report {
  validator_version: string;
  spec_version: string;
  /** What was validated: a URL, a file path, or `stdin` / `inline`. */
  target: string;
  checked_at: string;
  /** The highest level the run could MEASURE. */
  measured_level: Level | null;
  /** The level the caller asked about (default: the manifest's declaration). */
  requested_level: Level | null;
  profile: Profile;
  /**
   * True when transport-dependent checks did not run (`--no-network` or the
   * skill's degraded mode). A degraded run MUST NOT be reported as
   * "conforming" anywhere — see `summaryPhrase()`.
   */
  degraded: boolean;
  /** Levels this version cannot measure yet, stated rather than omitted. */
  not_measured_in_this_version: Level[];
  summary: ReportSummary;
  /** The check ids standing between `measured_level` and the next rung. */
  blockers_for_next_level: string[];
  findings: Finding[];
  probes: Probes;
}

/** Deterministic ordering: level, then severity, then pointer, then id. */
const SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) ||
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.pointer.localeCompare(b.pointer) ||
      a.id.localeCompare(b.id)
  );
}

export function summarize(findings: Finding[]): ReportSummary {
  return {
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    infos: findings.filter((f) => f.severity === 'info').length,
  };
}

/**
 * The one-line verdict, in the project's own honest vocabulary.
 *
 * A degraded run says **"schema-valid; conformance unmeasured"** — never
 * "conforming". The whole protocol rests on conformance being measured
 * (spec §8.3); blurring that line in a convenience mode would undermine the
 * thing the validator exists to protect. The skill's offline mode asserts
 * this exact phrase.
 */
export function summaryPhrase(report: Report): string {
  if (report.summary.errors > 0) {
    return `non-conformant: ${report.summary.errors} error(s)`;
  }
  if (report.degraded) return 'schema-valid; conformance unmeasured';
  if (report.measured_level) return `conforming at ${report.measured_level}`;
  return 'no level measured';
}
