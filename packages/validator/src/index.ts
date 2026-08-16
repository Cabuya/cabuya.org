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
  CHECKS,
  type CheckDefinition,
  type CheckFamily,
  checkIds,
  checksByFamily,
  docsUrl,
  getCheck,
  implementedChecks,
} from './checks.js';
export {
  blockersForNextLevel,
  computeMeasuredLevel,
  Engine,
  type EngineOptions,
  measurableLevels,
  type Pass,
  type PassContext,
} from './engine.js';
export {
  EXIT,
  EXIT_MEANING,
  type ExitCode,
  exitCodeFor,
} from './exit-codes.js';
export {
  type Fetcher,
  type FetchOptions,
  type FetchResult,
  HttpFetcher,
  OfflineFetcher,
} from './fetcher.js';
export { locatePointer, parseJson, pointer } from './locate.js';
export {
  authorMessage,
  checkIdForSchemaError,
  schemaNameFor,
  schemaPass,
} from './passes/schema.js';
export {
  envelopeChecks,
  fold,
  recordChecks,
  STATE_TOKENS,
  SUPPORTED_MAJOR,
  semanticPass,
} from './passes/semantic.js';
export {
  type Finding,
  LEVELS,
  type Level,
  type Probes,
  type Profile,
  type Report,
  type ReportSummary,
  type Severity,
  type SuggestedPatch,
  sortFindings,
  summarize,
  summaryPhrase,
} from './report.js';

/** The spec version this build validates against. */
export const SPEC_VERSION = '0.1.0';
