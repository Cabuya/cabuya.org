/**
 * Exit codes (blueprint §4.6).
 *
 * Agents branch on the exit code BEFORE parsing anything, so the codes must
 * distinguish *the feed is wrong* from *the network is wrong* — conflating
 * them is how fix loops burn iterations rewriting correct code.
 */
export const EXIT = {
  /** Conformant at the requested level (warnings may exist). Proceed. */
  OK: 0,
  /** Non-conformant — errors in the content. Read findings, fix, re-run. */
  NON_CONFORMANT: 1,
  /** Conformant with warnings, and `--strict` was passed. Decide; do not rewrite the mapping. */
  WARNINGS_STRICT: 2,
  /** Transport failure (unreachable, TLS, timeout, non-JSON body). Fix deployment, NOT the data. */
  TRANSPORT: 3,
  /** Usage error — bad flags, unreadable file, unknown profile. Fix the invocation. */
  USAGE: 4,
  /** Internal validator error. Report a bug; do not retry in a loop. */
  INTERNAL: 5,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

/** Human-readable meaning, used by `--help` and the docs generator. */
export const EXIT_MEANING: Record<ExitCode, string> = {
  [EXIT.OK]: 'conformant at the requested level (warnings may exist)',
  [EXIT.NON_CONFORMANT]: 'non-conformant — one or more errors in the content',
  [EXIT.WARNINGS_STRICT]: 'conformant, but warnings exist and --strict was passed',
  [EXIT.TRANSPORT]: 'transport failure — unreachable, TLS, timeout, or a non-JSON body',
  [EXIT.USAGE]: 'usage error — bad flags, unreadable file, unknown profile',
  [EXIT.INTERNAL]: 'internal validator error — please report it',
};

import type { Report } from './report.js';

/** Map a completed report to its exit code. */
export function exitCodeFor(report: Report, strict = false): ExitCode {
  if (report.summary.errors > 0) return EXIT.NON_CONFORMANT;
  if (strict && report.summary.warnings > 0) return EXIT.WARNINGS_STRICT;
  return EXIT.OK;
}
