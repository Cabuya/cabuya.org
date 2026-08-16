/**
 * The engine: orchestrates the pass pipeline and assembles the report.
 *
 * Pipeline (blueprint §4.3):
 *   resolve → fetch → parse → SCHEMA → SEMANTIC → DENY(PII) → BEHAVIOR
 *   → LEVEL → REPORT
 *
 * **Passes 4–7 always ALL run.** The engine never short-circuits after the
 * first failure: an agent fix loop that gets one error per run takes eight
 * runs; one that gets the full list takes one. Completeness of the report is
 * a feature, not a courtesy.
 *
 * Tasks 13–15 register the real passes; this module owns the contract they
 * plug into and the assembly that follows them.
 */

import { CHECKS } from './checks.js';
import type { Fetcher } from './fetcher.js';
import {
  type Finding,
  LEVELS,
  type Level,
  type Probes,
  type Profile,
  type Report,
  sortFindings,
  summarize,
} from './report.js';

/** What a pass receives. Passes are pure: input in, findings out. */
export interface PassContext {
  /** The parsed document under validation (feed or manifest). */
  document: unknown;
  /** The raw text, when available — used for line/column locations. */
  raw?: string;
  /** Schemas by filename, injected — the core never reads from disk. */
  schemas: Record<string, unknown>;
  /** Absent in `--no-network` mode. */
  fetcher?: Fetcher;
  /** The URL under validation, when the input was fetched. */
  url?: string;
  profile: Profile;
  /** Mutable transport observations, filled by fetch/behavior passes. */
  probes: Probes;
}

export interface Pass {
  name: string;
  /** Passes that need transport are skipped in degraded mode. */
  requiresNetwork?: boolean;
  run(context: PassContext): Promise<Finding[]> | Finding[];
}

export interface EngineOptions {
  validatorVersion: string;
  specVersion: string;
  target: string;
  profile?: Profile;
  requestedLevel?: Level | null;
  /** Omit to run in degraded (no-network) mode. */
  fetcher?: Fetcher;
  schemas?: Record<string, unknown>;
  /** Injected for determinism in tests. */
  now?: () => Date;
}

/**
 * Which levels this build can measure at all. Everything else is reported in
 * `not_measured_in_this_version` rather than silently omitted — a level the
 * validator cannot see must never look like a level the publisher failed.
 */
export function measurableLevels(): Level[] {
  const implemented = new Set(
    CHECKS.filter((c) => c.implemented).map((c) => c.level)
  );
  return LEVELS.filter((l) => l === 'L0' || implemented.has(l));
}

/**
 * The highest level with no error findings, walking the ladder from the
 * bottom and stopping at the first rung that has one.
 */
export function computeMeasuredLevel(
  findings: Finding[],
  measurable: Level[]
): Level | null {
  let measured: Level | null = null;
  for (const level of LEVELS) {
    if (!measurable.includes(level)) break;
    const blocked = findings.some(
      (f) => f.level === level && f.severity === 'error'
    );
    if (blocked) break;
    measured = level;
  }
  return measured;
}

/** The error check ids standing between the measured level and the next. */
export function blockersForNextLevel(
  findings: Finding[],
  measured: Level | null,
  measurable: Level[]
): string[] {
  const index = measured ? LEVELS.indexOf(measured) + 1 : 0;
  const next = LEVELS[index];
  if (!next || !measurable.includes(next)) return [];
  return [
    ...new Set(
      findings
        .filter((f) => f.level === next && f.severity === 'error')
        .map((f) => f.id)
    ),
  ].sort();
}

export class Engine {
  private passes: Pass[] = [];

  constructor(private readonly options: EngineOptions) {}

  register(...passes: Pass[]): this {
    this.passes.push(...passes);
    return this;
  }

  async run(document: unknown, raw?: string): Promise<Report> {
    const degraded = !this.options.fetcher;
    const probes: Probes = {};
    const context: PassContext = {
      document,
      raw,
      schemas: this.options.schemas ?? {},
      fetcher: this.options.fetcher,
      url: this.options.target.startsWith('http')
        ? this.options.target
        : undefined,
      profile: this.options.profile ?? 'core',
      probes,
    };

    const findings: Finding[] = [];
    for (const pass of this.passes) {
      // Degraded mode SKIPS network passes — it never runs them silently.
      if (pass.requiresNetwork && degraded) continue;
      findings.push(...(await pass.run(context)));
    }

    const sorted = sortFindings(findings);
    const measurable = measurableLevels();
    const measured = computeMeasuredLevel(sorted, measurable);

    if (context.fetcher) probes.requests = context.fetcher.requestCount();

    return {
      validator_version: this.options.validatorVersion,
      spec_version: this.options.specVersion,
      target: this.options.target,
      checked_at: (this.options.now?.() ?? new Date()).toISOString(),
      measured_level: degraded ? null : measured,
      requested_level: this.options.requestedLevel ?? null,
      profile: context.profile,
      degraded,
      not_measured_in_this_version: LEVELS.filter(
        (l) => !measurable.includes(l)
      ),
      summary: summarize(sorted),
      blockers_for_next_level: blockersForNextLevel(
        sorted,
        measured,
        measurable
      ),
      findings: sorted,
      probes,
    };
  }
}
