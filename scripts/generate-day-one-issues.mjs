#!/usr/bin/env node

/**
 * Generates `docs/CONTRIBUTING-issues.md` — the issues to open at launch.
 *
 * `/join` promises a backlog **pre-populated with well-specified work**, and
 * says so because an empty issue tracker asks a newcomer to invent the work as
 * well as do it. This is that backlog, and it is generated rather than written
 * because the material already exists: every catalogued check that is not yet
 * implemented already has an id, a severity, a level, a rule and a fix.
 *
 * Nothing here is invented. If a check has no `fix` text, that shows up as a
 * gap in this document rather than as a plausible sentence somebody would then
 * have to unlearn.
 *
 * The output is a checklist a maintainer works through once, at launch, opening
 * each one. It deliberately does not call the GitHub API: creating dozens of
 * issues from a script, unattended, is how a tracker fills with entries nobody
 * has read.
 *
 * Usage: node scripts/generate-day-one-issues.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CHECKS, ES } from '../packages/validator/dist/index.js';

const ROOT = process.cwd();
const OUT = join(ROOT, 'docs/CONTRIBUTING-issues.md');
const check = process.argv.includes('--check');

const planned = CHECKS.filter((entry) => !entry.implemented).sort((a, b) =>
  a.id.localeCompare(b.id)
);

const byFamily = new Map();
for (const entry of planned) {
  const list = byFamily.get(entry.family) ?? [];
  list.push(entry);
  byFamily.set(entry.family, list);
}

const lines = [
  '# Day-one issues',
  '',
  '> **Generated** by `scripts/generate-day-one-issues.mjs` from the check',
  '> registry. Do not edit by hand — run `pnpm run issues:day-one` after the',
  '> catalogue changes.',
  '',
  'The issues to open when the repository goes public, so the tracker starts',
  'with well-specified work rather than empty. Every one below is a catalogued',
  'check that is not yet implemented, which means its id, severity, level, rule',
  'and fix text are already decided: the contributor writes one function and two',
  'tests, and designs nothing.',
  '',
  `**${planned.length} issues**, all labelled \`good-first-issue:check\`, across`,
  `${byFamily.size} families. ${CHECKS.length} checks are catalogued in total;`,
  `${CHECKS.length - planned.length} are already implemented.`,
  '',
  '## How to open one',
  '',
  'Title: `` `{id}` — {title} ``. Body: the rule, the fix, the level and the',
  'spec anchor, exactly as they appear below. Label: `good-first-issue:check`.',
  'Add the Spanish rule text where this document has one — a contributor who',
  'reads the issue in Spanish should not have to translate the requirement',
  'before they can implement it.',
  '',
];

for (const [family, entries] of [...byFamily.entries()].sort()) {
  lines.push(`## ${family} (${entries.length})`, '');
  for (const entry of entries) {
    lines.push(`### \`${entry.id}\` — ${entry.title}`, '');
    lines.push(`- **Severity:** ${entry.severity}`);
    if (entry.level) lines.push(`- **Level:** ${entry.level}`);
    if (entry.plannedIn) lines.push(`- **Planned in:** ${entry.plannedIn}`);
    lines.push(`- **Rule:** ${entry.rule}`);
    lines.push(
      entry.fix
        ? `- **Fix:** ${entry.fix}`
        : '- **Fix:** _(missing — write one before opening this issue; an issue with no remedy is a bug report)_'
    );
    if (ES[entry.id]?.rule) {
      lines.push(`- **Regla (ES):** ${ES[entry.id].rule}`);
    }
    if (ES[entry.id]?.fix) {
      lines.push(`- **Arreglo (ES):** ${ES[entry.id].fix}`);
    }
    if (entry.specAnchor) {
      lines.push(`- **Specification:** ${entry.specAnchor}`);
    }
    lines.push('');
  }
}

lines.push(
  '## The other labels',
  '',
  'These are not generated, because they are not enumerable from a registry —',
  'a stack guide or a translation is proposed by whoever knows the subject. The',
  'taxonomy and what each label is for are in [`CONTRIBUTING.md`](../CONTRIBUTING.md).',
  ''
);

const contents = `${lines.join('\n')}`;

if (check) {
  const current = readFileSync(OUT, 'utf-8');
  if (current !== contents) {
    console.error(
      '❌ docs/CONTRIBUTING-issues.md is stale — run `pnpm run issues:day-one`'
    );
    process.exit(1);
  }
  console.log(`✅ day-one issue list current (${planned.length} issues)`);
  process.exit(0);
}

writeFileSync(OUT, contents);
console.log(
  `✅ wrote docs/CONTRIBUTING-issues.md (${planned.length} issues, ${byFamily.size} families)`
);
