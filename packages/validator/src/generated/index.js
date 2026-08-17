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

import validate0 from './manifest.schema.js';
import validate1 from './place-feed.schema.js';

/** Keyed by schema filename, with the $id the validator was built from. */
export const PRECOMPILED = {
  "manifest.schema.json": { $id: "https://cabuya.org/schemas/0.1/manifest.schema.json", validate: validate0 },
  "place-feed.schema.json": { $id: "https://cabuya.org/schemas/0.1/place-feed.schema.json", validate: validate1 },
};
