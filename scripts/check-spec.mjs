#!/usr/bin/env node

/**
 * `spec:check` — schema and example integrity for every spec version.
 *
 *   - Every schema parses and compiles as JSON Schema 2020-12.
 *   - Every `$id` is absolute and version-matched (boundary rule B5).
 *   - Every `examples/{v}/valid/*` validates; every `invalid/*` FAILS —
 *     an invalid example that passes can never teach its designed error.
 *   - Every invalid example carries its `$comment` teaching note.
 *
 * (Task 16 extends the invalid-example assertion to "fails with exactly the
 * check ids its $comment names" once the validator exists.)
 *
 * Usage: node scripts/check-spec.mjs [--strict]
 */
import { join } from 'node:path';

import {
  checkSpecVersion,
  checkTranslations,
  specVersions,
} from './lib/spec-checks.mjs';

const STRICT = process.argv.includes('--strict');
const SPEC_DIR = join(process.cwd(), 'spec');

console.log('🔍 spec:check — schema and example integrity\n');

const versions = specVersions(SPEC_DIR);
if (versions.length === 0) {
  console.error('❌ no spec versions found under spec/schemas/');
  process.exit(1);
}

let total = 0;
for (const version of versions) {
  const findings = [
    ...checkSpecVersion(SPEC_DIR, version),
    ...checkTranslations(SPEC_DIR, version),
  ];
  total += findings.length;
  console.log(
    `  ${version}: ${findings.length === 0 ? '✅ clean' : `❌ ${findings.length} finding(s)`}`
  );
  for (const f of findings) {
    console.log(`    [${f.check}] ${f.file}\n      ${f.message}`);
  }
}

console.log(
  `\n${total === 0 ? '✅ spec:check clean' : `❌ spec:check: ${total} finding(s)`} across ${versions.length} version(s)`
);
if (total > 0 && (STRICT || true)) process.exit(1);
