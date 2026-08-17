/**
 * Generates `public/llms.txt` and `public/llms-full.txt`.
 *
 * `llms.txt` is the first file an agent reads, and until this script existed
 * the one being served was the Corag institutional site's — describing a write
 * API at a host this protocol does not run. That is the most consequential
 * possible place for stale copy: a person skims a wrong sentence and moves on;
 * an agent acts on it.
 *
 * So neither file is written by hand. Both are generated from the same modules
 * the site renders from — the navigation registries, the spec loader, the
 * registry loader, the check catalogue — and a gate fails when the committed
 * copy drifts from what those modules would produce.
 *
 * ## Why two files
 *
 * `llms.txt` is a map: every route, one line each, with its `.md` twin. An
 * agent orienting itself reads it and then fetches the two pages it needs.
 *
 * `llms-full.txt` is the protocol itself, inlined — the whole specification,
 * the quickstart, and every check id with its rule and fix. One fetch, no
 * follow-ups, works from a cache. It exists because the alternative is an
 * agent that reconstructs the protocol from a summary, and a reconstructed
 * specification is a hallucinated one.
 *
 * Usage: npx tsx scripts/generate-llms-txt.ts [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CHECKS } from '@cabuya/validator';
import { PORTAL_SECTIONS } from '@/lib/portal-nav';
import { allPublishers, officialSources } from '@/lib/registry-loader';
import { FOOTER_COLUMNS, NAV_GROUPS } from '@/lib/site-navigation';
import {
  specRfcs,
  specSchemas,
  specSections,
  specVersions,
} from '@/lib/spec-loader';

const ROOT = process.cwd();
const check = process.argv.includes('--check');

/**
 * The canonical origin.
 *
 * Not imported from `constances.ts`: that module reads `import.meta.env`,
 * which exists inside Astro's build and not in a plain script. A test asserts
 * the two agree, which is the property that actually matters — the constant
 * being in two places is only a problem if they can differ.
 */
const SITE_URL = 'https://cabuya.org';

const url = (path: string): string => `${SITE_URL}${path}`;
/** Every HTML route has a twin at the same path with `.md` appended. */
const twin = (path: string): string =>
  path === '/' ? url('/index.md') : url(`${path}.md`);

// ── llms.txt — the map ────────────────────────────────────

interface Entry {
  label: string;
  path: string;
  hint?: string;
}

/**
 * Routes the chrome advertises, in the order it advertises them.
 *
 * Taken from the navigation registries rather than from a second list, which
 * is what makes this file impossible to forget to update: a route that is not
 * in the chrome is a route this project does not consider public, and one that
 * is appears here the moment it flips to `live`.
 */
function navEntries(): Entry[] {
  const out: Entry[] = [];

  for (const group of NAV_GROUPS) {
    if (group.status !== 'live') continue;
    if (group.path) {
      out.push({ label: group.label.en, path: group.path });
    }
    for (const child of group.children ?? []) {
      if (child.status !== 'live') continue;
      out.push({
        label: child.label.en,
        path: child.path,
        hint: child.hint?.en,
      });
    }
  }

  for (const section of PORTAL_SECTIONS) {
    for (const entry of section.entries) {
      if (entry.status !== 'live') continue;
      out.push({
        label: entry.label.en,
        path: entry.path,
        hint: entry.blurb?.en,
      });
    }
  }

  for (const group of FOOTER_COLUMNS) {
    for (const entry of group.entries) {
      if (entry.status !== 'live' || entry.external) continue;
      out.push({ label: entry.label.en, path: entry.path });
    }
  }

  // Deduplicate by path, keeping the first — which is the most prominent
  // placement, and therefore the label a reader is most likely to have seen.
  const seen = new Set<string>();
  return out.filter((entry) => {
    const path = entry.path.split('#')[0];
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

function buildIndex(): string {
  const version = specVersions()[0];
  const sections = specSections(version);
  const schemas = specSchemas(version);
  const publishers = allPublishers();
  const implemented = CHECKS.filter((entry) => entry.implemented).length;

  const lines = [
    '# Cabuya Protocol',
    '',
    '> An open interoperability standard for emergency-aid applications. One',
    '> `place` schema, four transports — a static feed, a read API, a write API',
    '> and an MCP surface — that carry byte-identical records. Conformance is',
    '> **measured by a published validator, never self-declared**.',
    '',
    `The specification is at version ${version} and it is normative. It changes`,
    'through the RFC process, and nothing here is self-declared: conformance is',
    'whatever the published validator measured. This file is generated from the',
    'same modules the site renders from.',
    '',
    '## Read this first if you are an agent',
    '',
    '- **Every page has a `.md` twin** at the same URL with `.md` appended, and',
    '  responds to `Accept: text/markdown`. The twin is complete, not a summary.',
    `- **The whole protocol in one fetch**: ${url('/llms-full.txt')} — the`,
    '  specification, the quickstart and every check, inlined.',
    '- **The specification twins are the source files.** There is no second copy',
    '  to drift.',
    '- **This site has no write API.** It publishes a standard and measures',
    '  conformance. Writing a record means writing to a publisher that',
    '  implements the write surface, never to us.',
    '- **Do not claim conformance the validator has not measured.** «Cabuya 1.0',
    '  compatible» is a claim about a measurement, and the registry holds the',
    '  measurement.',
    '',
    '## The line that never moves',
    '',
    'The protocol MUST NOT transport person-level data — missing persons,',
    'individual cases, volunteer identities, personal names, personal phone',
    'numbers, personal media. This is a **join prohibition, not a field',
    'omission**: tooling MUST NOT combine protocol data with person-level',
    'sources, even internally, even for a feature that would be useful.',
    '',
    'People-domain integration is link-out only, permanently.',
    '',
    '## Licensing and reuse',
    '',
    'The specification, the schemas and the registry are **CC0-1.0** — public',
    'domain, no attribution required, fork and vendor freely. The code is',
    'Apache-2.0. Each publisher declares the licence of **their own data** in',
    'their manifest, and a consumer MUST honour the `permitted_use` it finds',
    'there, including when the consumer is an AI system.',
    '',
    '## Site map',
    '',
  ];

  for (const entry of navEntries()) {
    const path = entry.path.split('#')[0];
    const hint = entry.hint ? ` — ${entry.hint}` : '';
    lines.push(`- [${entry.label}](${url(path)})${hint} · ${twin(path)}`);
  }

  lines.push(
    '',
    `## Specification ${version}`,
    '',
    ...sections.map(
      (section) =>
        `- [§${section.number} ${section.title}](${url(
          `/developers/spec/${version}/${section.slug}`
        )}) · ${twin(`/developers/spec/${version}/${section.slug}`)}`
    ),
    '',
    '## Schemas',
    '',
    ...schemas.map(
      (schema) =>
        `- [${schema.name}](${url(
          `/schemas/${version}/${schema.name}.schema.json`
        )}) — ${schema.title ?? schema.name}`
    ),
    '',
    '## Registry',
    '',
    `${publishers.length} publisher entr${publishers.length === 1 ? 'y' : 'ies'}, ${officialSources().length} official sources.`,
    'Measured state is not in the repository — it is written by the validation',
    'cron and served live:',
    '',
    `- [Registry](${url('/registry')}) · ${twin('/registry')}`,
    `- Live measured state, JSON: ${url('/registry/status.json')}`,
    `- Badge: ${url('/badge/{publisher_id}.svg')} (\`?lang=es\`, \`?style=flat\`)`,
    '',
    '## Validator',
    '',
    `${CHECKS.length} checks catalogued, ${implemented} implemented. Every check id is`,
    'permanent and every error message links to its anchor.',
    '',
    `- [The catalogue](${url('/developers/validator/checks')}) · ${twin('/developers/validator/checks')}`,
    `- \`npx @cabuya/validator validate <url> --format json\` — exit 0 conforming,`,
    '  1 content errors, 3 transport failure. Branch on the code before parsing.',
    '',
    '## RFCs',
    '',
    ...specRfcs().map(
      (rfc) =>
        `- [RFC-${rfc.id} ${rfc.title}](${url(`/rfcs/${rfc.id}`)}) — ${rfc.status}`
    ),
    '',
    '## Español',
    '',
    'Every page exists in Spanish at the same path under `/es`, natively',
    'written rather than translated. The specification is published in English',
    'and the Spanish pages say so where they carry English normative text.',
    ''
  );

  return lines.join('\n');
}

// ── llms-full.txt — the protocol, inlined ─────────────────

function buildFull(): string {
  const version = specVersions()[0];
  const sections = specSections(version);
  const quickstart = readFileSync(
    join(ROOT, 'src/content/docs/en/consume.md'),
    'utf-8'
  );

  const lines = [
    '# Cabuya Protocol — everything, in one file',
    '',
    `Specification ${version}, the consumption rules, and every`,
    'validator check with its rule and remedy. Generated from the repository;',
    'nothing here is a summary.',
    '',
    `Map of the site: ${url('/llms.txt')}`,
    '',
    '---',
    '',
    `# Specification ${version}`,
    '',
  ];

  for (const section of sections) {
    lines.push(
      `<!-- ${url(`/developers/spec/${version}/${section.slug}`)} -->`,
      '',
      section.body.trim(),
      '',
      '---',
      ''
    );
  }

  lines.push(
    '# Consumption rules — the half that is usually forgotten',
    '',
    `<!-- ${url('/developers/consume')} -->`,
    '',
    // Frontmatter stripped: it is site metadata, not protocol content.
    quickstart.replace(/^---\n[\s\S]*?\n---\n/, '').trim(),
    '',
    '---',
    '',
    '# Checks',
    '',
    'Every check the validator can report. Ids are permanent — a retired check',
    'keeps its id and is marked rather than removed, because renaming one would',
    'break the fix loop of every agent that cached the old id.',
    ''
  );

  for (const entry of CHECKS) {
    lines.push(
      `## ${entry.id} — ${entry.title}`,
      '',
      `- Severity: ${entry.severity}${entry.level ? ` · Level: ${entry.level}` : ''}`,
      `- Status: ${entry.implemented ? 'implemented' : `catalogued, not implemented${entry.plannedIn ? ` (${entry.plannedIn})` : ''}`}`,
      `- Rule: ${entry.rule}`,
      ...(entry.fix ? [`- Fix: ${entry.fix}`] : []),
      ...(entry.specAnchor ? [`- Specification: ${entry.specAnchor}`] : []),
      ''
    );
  }

  return lines.join('\n');
}

// ── Write or check ────────────────────────────────────────

const outputs: Array<{ file: string; contents: string }> = [
  { file: 'public/llms.txt', contents: buildIndex() },
  { file: 'public/llms-full.txt', contents: buildFull() },
];

if (check) {
  const stale = outputs.filter(({ file, contents }) => {
    try {
      return readFileSync(join(ROOT, file), 'utf-8') !== contents;
    } catch {
      return true;
    }
  });

  if (stale.length > 0) {
    for (const { file } of stale) {
      console.error(`❌ ${file} is stale — run \`pnpm run llms:generate\``);
    }
    process.exit(1);
  }
  console.log(`✅ llms.txt and llms-full.txt current`);
  process.exit(0);
}

for (const { file, contents } of outputs) {
  writeFileSync(join(ROOT, file), contents);
  console.log(`✅ wrote ${file} (${contents.split('\n').length} lines)`);
}
