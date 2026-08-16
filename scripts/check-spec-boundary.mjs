#!/usr/bin/env node

/**
 * `spec:boundary` — the B1–B7 contract for the bounded CC0 directories
 * (`spec/`, and `registry/` once it exists).
 *
 *   B1  no imports / requires / @/ references inside
 *   B2  site code references the directories ONLY via the loader modules
 *   B3  LICENSE + README present; CODEOWNERS covers the path
 *   B4  .md/.json(.txt/.jsonl) only; no build files
 *   B7  no PII, examples included (designed teaching fixtures allowlisted)
 *
 * (B5 — absolute versioned $ids — is asserted by spec:check; B6 — registry
 * entries data-only/no-HTML — by registry:check.)
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  checkExtensions,
  checkLoaderBoundary,
  checkNoImports,
  checkPii,
  checkRequiredFiles,
} from './lib/spec-checks.mjs';

const ROOT = process.cwd();
const BOUNDED = [
  { dir: 'spec', loader: 'src/lib/spec-loader.ts' },
  { dir: 'registry', loader: 'src/lib/registry-loader.ts' },
].filter(({ dir }) => existsSync(join(ROOT, dir)));

console.log('🔍 spec:boundary — B1–B7 for bounded directories\n');

const findings = [];
for (const { dir } of BOUNDED) {
  const full = join(ROOT, dir);
  findings.push(
    ...checkNoImports(full),
    ...checkExtensions(full),
    ...checkRequiredFiles(full, join(ROOT, 'CODEOWNERS'), `/${dir}/`),
    ...checkPii(full)
  );
}

findings.push(
  ...checkLoaderBoundary(
    ['src', 'functions'],
    BOUNDED.map(({ dir }) => dir),
    BOUNDED.map(({ loader }) => loader),
    ROOT
  )
);

if (findings.length === 0) {
  console.log(
    `✅ boundary clean for: ${BOUNDED.map(({ dir }) => dir).join(', ')}`
  );
} else {
  console.log(`❌ ${findings.length} boundary finding(s):\n`);
  for (const f of findings) {
    console.log(`  [${f.check}] ${f.file}\n    ${f.message}`);
  }
  process.exit(1);
}
