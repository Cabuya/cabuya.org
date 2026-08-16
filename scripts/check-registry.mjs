#!/usr/bin/env node

/**
 * `registry:check` — integrity gate for `registry/`.
 *
 * Schema validity (additionalProperties:false refuses measured fields by
 * construction) · id + URL uniqueness · filename ≡ id · org-level contact
 * heuristic · event references resolve · B6 (no HTML in any field —
 * entries are data, never markup).
 *
 * Usage: node scripts/check-registry.mjs [--strict]
 */
import { join } from 'node:path';

import { checkRegistry } from './lib/registry-checks.mjs';

console.log('🔍 registry:check — publisher/official-source/event integrity\n');

const findings = checkRegistry(join(process.cwd(), 'registry'));

if (findings.length === 0) {
  console.log('✅ registry:check clean');
} else {
  console.log(`❌ ${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.log(`  [${f.check}] ${f.file}\n    ${f.message}`);
  }
  process.exit(1);
}
