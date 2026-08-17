/**
 * GENERATED — do not edit.
 *
 * Written by scripts/build-standalone.mjs from spec/schemas/0.1/*.json.
 * Regenerate with:  node scripts/build-standalone.mjs
 *
 * An Ajv validator compiled ahead of time, so the browser build never calls
 * `new Function` — which a Content-Security-Policy without 'unsafe-eval'
 * forbids, and which otherwise makes the validator page fail silently.
 */

import type { ValidateFunction } from 'ajv';

export interface PrecompiledValidator {
  /** The $id of the schema this was built from. Checked before use. */
  $id: string;
  validate: ValidateFunction;
}

/** Keyed by schema filename. */
export declare const PRECOMPILED: Record<string, PrecompiledValidator | undefined>;
