/**
 * `@cabuya/validator` — the Cabuya Protocol conformance validator.
 *
 * One engine, four harnesses (CLI, CI action, the portal's live checker, the
 * registry re-validation cron). The core has **zero Node-only APIs**, so one
 * bundle runs in Node, Cloudflare Workers, Deno, Bun and the browser — that
 * property is what makes "the badge measures what the CLI said" true, and it
 * is enforced by a test.
 *
 * Conformance is measured, never declared.
 */

export {
  blockersForNextLevel,
  computeMeasuredLevel,
  Engine,
  measurableLevels,
  type EngineOptions,
  type Pass,
  type PassContext,
} from './engine.js';
export {
  EXIT,
  EXIT_MEANING,
  exitCodeFor,
  type ExitCode,
} from './exit-codes.js';
export {
  CHECKS,
  checkIds,
  checksByFamily,
  docsUrl,
  getCheck,
  implementedChecks,
  type CheckDefinition,
  type CheckFamily,
} from './checks.js';
export {
  HttpFetcher,
  OfflineFetcher,
  type FetchOptions,
  type Fetcher,
  type FetchResult,
} from './fetcher.js';
export { locatePointer, parseJson, pointer } from './locate.js';
export {
  LEVELS,
  sortFindings,
  summarize,
  summaryPhrase,
  type Finding,
  type Level,
  type Probes,
  type Profile,
  type Report,
  type ReportSummary,
  type Severity,
  type SuggestedPatch,
} from './report.js';

/** The spec version this build validates against. */
export const SPEC_VERSION = '0.1.0';
