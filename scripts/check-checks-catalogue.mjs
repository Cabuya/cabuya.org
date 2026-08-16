#!/usr/bin/env node

/**
 * `checks:catalogue` — closes the agent fix loop at the repository level.
 *
 * An error message that points at a documentation page which does not exist
 * is the fastest way to make a fix loop useless: the agent reads
 * "see …/checks#REC001", fetches nothing, and starts guessing. This gate
 * asserts the catalogue is internally complete and consistent, in both
 * directions.
 *
 * Asserts:
 *   1. Every check id is unique and well-formed, and ids are never reused.
 *   2. Every check carries a title, a rule and a spec anchor that points at
 *      a spec section file that exists on disk.
 *   3. Every IMPLEMENTED check has a Spanish translation (message/rule/fix
 *      are the only translated fields; ids never translate).
 *   4. Every catalogued-but-unimplemented check states where it is planned,
 *      so the backlog is specified work rather than a mystery.
 *   5. From Task 26: every id has an anchor on the built checks page, and
 *      every anchor on that page corresponds to a real id. Until that page
 *      exists the gate says so rather than pretending to check it.
 *
 * Usage: node scripts/check-checks-catalogue.mjs [--strict]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST_CHECKS_PAGE = join(
  ROOT,
  'dist',
  'developers',
  'validator',
  'checks',
  'index.html'
);

const { CHECKS } = await import(
  join(ROOT, 'packages/validator/dist/checks.js')
);
const { ES } = await import(join(ROOT, 'packages/validator/dist/i18n.js'));

const findings = [];
const seen = new Set();

for (const check of CHECKS) {
  const where = `check ${check.id}`;

  if (!/^[A-Z]{3}\d{3}$/.test(check.id)) {
    findings.push(`${where}: id is not in the FAM### form`);
  }
  if (seen.has(check.id)) {
    findings.push(`${where}: duplicate id — ids are stable and never reused`);
  }
  seen.add(check.id);

  if (!check.title?.trim()) findings.push(`${where}: no title`);
  if (!check.rule?.trim()) findings.push(`${where}: no rule`);

  // The spec anchor must point at a section that exists.
  const match = /developers\/spec\/([\d.]+)\/([a-z0-9-]+)(#.*)?$/.exec(
    check.specAnchor ?? ''
  );
  if (!match) {
    findings.push(`${where}: spec anchor is not a versioned section URL`);
  } else {
    const [, version, section] = match;
    const file = join(ROOT, 'spec', 'versions', version, `${section}.md`);
    if (!existsSync(file)) {
      findings.push(
        `${where}: spec anchor points at spec/versions/${version}/${section}.md, which does not exist`
      );
    }
  }

  if (check.implemented && !ES[check.id]) {
    findings.push(
      `${where}: implemented but has no Spanish translation — half the ecosystem reads these messages in Spanish`
    );
  }
  if (!check.implemented && !check.plannedIn?.trim()) {
    findings.push(
      `${where}: catalogued but not implemented and no plan recorded — an unspecified backlog item`
    );
  }
}

// Direction 2 — only meaningful once the docs page is built (Task 26).
let pageChecked = false;
if (existsSync(DIST_CHECKS_PAGE)) {
  pageChecked = true;
  const html = readFileSync(DIST_CHECKS_PAGE, 'utf-8');
  const anchors = new Set(
    [...html.matchAll(/id="([A-Z]{3}\d{3})"/g)].map((m) => m[1])
  );
  for (const check of CHECKS) {
    if (!anchors.has(check.id)) {
      findings.push(
        `check ${check.id}: no anchor on /developers/validator/checks — its error messages would link nowhere`
      );
    }
  }
  for (const anchor of anchors) {
    if (!seen.has(anchor)) {
      findings.push(
        `checks page documents "${anchor}", which is not in the catalogue`
      );
    }
  }
}

const implemented = CHECKS.filter((c) => c.implemented).length;
console.log('🔍 checks:catalogue — the fix loop cannot point at nothing\n');
console.log(
  `  ${CHECKS.length} checks · ${implemented} implemented · ${CHECKS.length - implemented} catalogued with a plan`
);
console.log(
  `  docs-page cross-check: ${pageChecked ? 'run against dist/' : 'skipped (page ships in Task 26; run after a build)'}\n`
);

if (findings.length === 0) {
  console.log('✅ checks:catalogue clean');
} else {
  console.log(`❌ ${findings.length} finding(s):\n`);
  for (const finding of findings) console.log(`  ${finding}`);
  process.exit(1);
}
