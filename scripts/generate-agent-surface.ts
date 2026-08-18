/**
 * The agent-facing surface that is not a page: `auth.md` and the agent-skills
 * index, generated from the same sources everything else is.
 *
 *   pnpm run agents:generate      # write
 *   pnpm run agents:check         # fail if the committed files are stale
 *
 * ## What this exists for
 *
 * An agent arriving at cabuya.org with no prior knowledge has to answer two
 * questions before it can do anything: *do I need credentials*, and *is there
 * anything here that teaches me the job*. Both have well-known answers now —
 * `/auth.md` and `/.well-known/agent-skills/index.json` — and both are cheap to
 * publish and expensive to get wrong, because a wrong one sends an agent to
 * fetch an endpoint that does not exist.
 *
 * ## Generated, like `llms.txt`
 *
 * Every fact in these files already lives somewhere: the validator's limits are
 * in `functions/api/validate.ts`, the PII deny-list is in the validator package,
 * the spec's section list is in `spec/`. Hand-writing them would mean three
 * copies of each and no way to notice when one drifts. `agents:check` runs in
 * CI, so the committed artifacts and the repository cannot disagree.
 *
 * ## The one thing this file must never do
 *
 * Advertise something that is not there. The scanner at isitagentready.com also
 * asks for `/.well-known/openid-configuration`,
 * `/.well-known/oauth-protected-resource` and an MCP server card, and this site
 * publishes none of them **because it has no OAuth issuer, no protected
 * resource and no deployed MCP server** — `/developers/mcp` says so in its first
 * paragraph. Publishing those documents would score four more points and would
 * be a lie in a machine-readable format, which is the worst kind. `auth.md`
 * states the absence instead; that is the honest answer to the same question.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CHECKS, DENY_KEYS, DENY_PATTERNS } from '@cabuya/validator';
import { SKILL_REPO_URL } from '@/lib/site-navigation';
import { specSchemas, specSections, specVersions } from '@/lib/spec-loader';
import { START_COMMANDS } from '@/lib/start-commands';

const ROOT = process.cwd();
const check = process.argv.includes('--check');

/**
 * The canonical origin.
 *
 * Not imported from `constances.ts`, for the same reason `generate-llms-txt.ts`
 * does not: that module reads `import.meta.env`, which exists inside Astro's
 * build and not in a plain script.
 */
const SITE_URL = 'https://cabuya.org';
const url = (path: string): string => `${SITE_URL}${path}`;

/**
 * The validator's own limits, mirrored from `functions/api/validate.ts`.
 *
 * `tests/unit/lib/agent-surface.test.ts` reads that file and fails if these
 * drift, so the published numbers are the enforced ones rather than the ones
 * somebody remembered.
 */
const LIMITS = {
  perIpPerMinute: 10,
  perHostPerHour: 60,
  maxBytes: 5 * 1024 * 1024,
  runBudgetMs: 25_000,
  requestTimeoutMs: 8_000,
  maxRedirects: 3,
} as const;

const LATEST = specVersions().sort().at(-1) ?? '0.1';
const SECTIONS = specSections(LATEST);
const SCHEMAS = specSchemas(LATEST);
const IMPLEMENTED = CHECKS.filter(
  (entry) => entry.implemented !== false
).length;

/** Both quickstart fixtures are run through the real validator by a test. */
const fixture = (name: string): string =>
  readFileSync(join(ROOT, 'tests/fixtures/quickstart', name), 'utf-8').trim();

// ── /auth.md ──────────────────────────────────────────────

/**
 * The authentication document, which says there is no authentication.
 *
 * `auth.md` is normally where a site explains how an agent registers and gets a
 * credential. The honest version for this site is the negative one, and it is
 * not a hedge: "no account to create, no key to request, and nobody to
 * negotiate with" is what the landing page promises, and an agent that reads
 * this file can stop looking for a token and start fetching.
 */
function buildAuthMd(): string {
  return `${[
    '# Authentication',
    '',
    '**There is none, and that is the design.** cabuya.org has no accounts, no API',
    'keys, no OAuth issuer and no registration step. Every endpoint below is public,',
    'unauthenticated and rate-limited by politeness rather than by identity.',
    '',
    'This file follows the `auth.md` convention so an agent can stop looking for a',
    'credential it will not find.',
    '',
    '## What you can call',
    '',
    '| Endpoint | Method | What it does | Limits |',
    '|---|---|---|---|',
    `| [\`/api/validate\`](${url('/developers/validator')}) | POST | Validates a manifest or feed and returns findings with stable check ids | ${LIMITS.perIpPerMinute}/minute per caller · ${LIMITS.perHostPerHour}/hour per probed host |`,
    `| [\`/badge/{publisher}.svg\`](${url('/registry')}) | GET | The measured badge for a registry entry | none |`,
    `| [\`/openapi.json\`](${url('/openapi.json')}) | GET | OpenAPI 3.1 description of the above | none |`,
    `| [\`/.well-known/api-catalog\`](${url('/.well-known/api-catalog')}) | GET | RFC 9727 link set for the same API | none |`,
    `| Any page + \`.md\` | GET | The complete Markdown twin of that page | none |`,
    `| [\`/llms.txt\`](${url('/llms.txt')}) · [\`/llms-full.txt\`](${url('/llms-full.txt')}) | GET | The site as one map, and as one file | none |`,
    '',
    '`Accept: text/markdown` on any page URL returns the twin, so the `.md` suffix is',
    'a convenience rather than a requirement.',
    '',
    '## What the validator does with your request',
    '',
    `- It fetches the URL you name, following at most ${LIMITS.maxRedirects} redirects, each re-checked.`,
    `- It stops at ${LIMITS.maxBytes / (1024 * 1024)} MB per document, ${LIMITS.requestTimeoutMs / 1000} s per fetch and ${LIMITS.runBudgetMs / 1000} s per run.`,
    '- It keeps nothing. No request body, no URL, no finding is written anywhere;',
    '  the only state is two rate counters keyed by caller IP and probed host, and',
    '  `scripts/check-no-retention.mjs` fails the build if a log line appears near',
    '  that code.',
    `- It identifies itself as \`CabuyaValidator/0.1 (+${url('/developers/validator/probe')})\`.`,
    '',
    '## Identify yourself',
    '',
    'Send a `User-Agent` that names your agent and a URL a human can read. Nothing',
    'is enforced and nothing is stored — it is how we would recognise a well-behaved',
    'client if one of these endpoints ever needed defending.',
    '',
    '## What is deliberately absent',
    '',
    'These are the documents an agent-readiness scanner expects next, and why this',
    'site does not serve them:',
    '',
    '| Not published | Because |',
    '|---|---|',
    '| `/.well-known/openid-configuration` | No OpenID Provider exists. There is nothing to sign in to. |',
    '| `/.well-known/oauth-authorization-server` | No OAuth authorization server exists. |',
    '| `/.well-known/oauth-protected-resource` | Nothing here is a protected resource. Every byte is public. |',
    `| \`/.well-known/mcp/server-card.json\` | The reference MCP server is [specified and not deployed](${url('/developers/mcp')}). It ships when at least two live conforming feeds exist to federate over. |`,
    '',
    'Each of those would raise an automated score and would describe infrastructure',
    'that does not exist. If any of them appears here later, it will be because the',
    'thing itself does.',
    '',
    '## The protocol, not this site',
    '',
    'An application that *implements* Cabuya may well need authentication for its',
    'own write surface — that is its business, and the protocol does not model it.',
    `The specification's API surface section is [§4](${url(`/developers/spec/${LATEST}/4-api-surface`)}) ·`,
    `[Markdown](${url(`/developers/spec/${LATEST}/4-api-surface.md`)}).`,
    '',
    `Skills index: ${url('/.well-known/agent-skills/index.json')}`,
    `Español: ${url('/es')}`,
    '',
  ].join('\n')}`;
}

// ── The skill ─────────────────────────────────────────────

/**
 * A skill an agent can execute, served from the site it describes.
 *
 * Not the `Cabuya/cabuya-skill` pack — that is [in development](/developers/skill)
 * and listing it here would be advertising a download that does not exist. This
 * is a single self-contained file about the thing that *is* live: the published
 * specification, the schemas, and a validator you can call today.
 */
function buildSkill(): string {
  const sections = SECTIONS.map(
    (section) =>
      `- **${section.number} ${section.title}** — ${url(`/developers/spec/${LATEST}/${section.slug}.md`)}`
  );

  /* The `$id` is already the absolute versioned URL the schema declares, and
     the site serves it at that path — so one is the link and the other is the
     identifier, and they are the same string by design (spec boundary rule B3). */
  const schemas = SCHEMAS.map(
    (schema) =>
      `- \`${schema.name}\` — ${schema.id}${schema.title ? ` — ${schema.title}` : ''}`
  );

  return `${[
    '---',
    'name: publish-a-cabuya-feed',
    'description: Take an application that holds collection points, needs, capacities or deliveries, and publish them as a conforming Cabuya feed — then prove it with the public validator. Use when asked to implement Cabuya, publish a feed, or reach conformance level L2.',
    `version: ${LATEST}`,
    'license: CC0-1.0',
    '---',
    '',
    '# Publish a Cabuya feed',
    '',
    'Cabuya is an open interoperability format for emergency-aid applications: one',
    '`place` schema, published as a static file, so any application can read any',
    "other's data without asking permission. This skill takes you from a data model",
    'to a conforming feed, and to a measurement you did not have to be trusted for.',
    '',
    '## The five rules that do not bend',
    '',
    '1. **No person-level data, ever.** The schema models places, not people. This is',
    '   a join prohibition, not a field omission: do not publish a field, a note or',
    '   an id that lets a reader reconstruct who was helped.',
    `   Deny-listed keys: ${DENY_KEYS.map((key) => `\`${key}\``).join(', ')}.`,
    `   Deny-listed patterns: ${DENY_PATTERNS.map((pattern) => `\`${pattern.class}\``).join(', ')}.`,
    '2. **Conformance is measured, never declared.** Nothing you write about',
    '   yourself makes you conforming. The validator reads what you published.',
    '3. **A static file is enough.** L2 needs no API, no database and no account.',
    '4. **Contact is org-level.** A role address published by the organisation, never',
    "   a person's phone or email.",
    '5. **Say what you do not know.** Omit a field rather than guess it. `null` and an',
    '   invented value are not the same claim.',
    '',
    '## Step 1 — the manifest',
    '',
    'Serve this at `/.well-known/cabuya.json` on your own domain. It says who you',
    'are, what you publish and under which licence.',
    '',
    '```json',
    fixture('manifest.json'),
    '```',
    '',
    '## Step 2 — the feed',
    '',
    'One JSON file at a stable URL, in the shared schema. This one validates:',
    '',
    '```json',
    fixture('feed.json'),
    '```',
    '',
    '## Step 3 — serve both correctly',
    '',
    '- `Content-Type: application/json`',
    '- `Access-Control-Allow-Origin: *` — the one L2 requirement a static file host',
    '  cannot always give you; check yours before assuming.',
    '- If your site is a single-page app, exclude both paths from the catch-all',
    '  rewrite, or the validator receives your HTML shell and reports a parse error.',
    '',
    '## Step 4 — measure it',
    '',
    'Call the public validator. No key, no account, no registration:',
    '',
    '```bash',
    `curl -X POST ${url('/api/validate')} \\`,
    "  -H 'Content-Type: application/json' \\",
    '  -d \'{"url":"https://example.org/.well-known/cabuya.json"}\'',
    '```',
    '',
    `Findings come back with stable check ids — ${IMPLEMENTED} of ${CHECKS.length} catalogued checks are`,
    `implemented — each with a rule, a remedy and a link to the specification clause it`,
    `comes from. The catalogue: ${url('/developers/validator/checks.md')}`,
    '',
    'Or run the same engine locally, with no network round trip:',
    '',
    '```bash',
    'npx @cabuya/validator validate https://example.org/.well-known/cabuya.json',
    '```',
    '',
    '## Step 5 — join the registry',
    '',
    `Open a pull request against the registry directory in ${url('/developers')}'s`,
    'repository. Inclusion is not endorsement and the badge state is measured on our',
    'side, never written by hand.',
    '',
    '## The specification',
    '',
    `Version ${LATEST}. Every section is served as Markdown; fetch the section you need`,
    'rather than the whole document.',
    '',
    ...sections,
    '',
    '### Schemas',
    '',
    ...schemas,
    '',
    '### Everything, in one file',
    '',
    `- ${url('/llms.txt')} — the map`,
    `- ${url('/llms-full.txt')} — the specification, the quickstart and every check, inlined`,
    `- ${url('/auth.md')} — why there is nothing to authenticate against`,
    '',
  ].join('\n')}`;
}

// ── The adopt skill ───────────────────────────────────────

/**
 * The entry, not a copy: an agent that discovers this learns the two lines and
 * where the real procedures live (the installable pack, and `/start` for its
 * human). Duplicating the pack's flow here would be a second copy that rots —
 * the pack vendors the specification and carries the guardrails; this skill's
 * whole job is to route to it. The commands come from `start-commands.ts`,
 * the module pinned against the pack's own install proof.
 */
function buildAdoptSkill(): string {
  return `${[
    '---',
    'name: adopt-cabuya',
    'description: Adopt the Cabuya Protocol with a guided, resumable flow — install the cabuya-skill pack, say /cabuya, and the agent orients, asks who plans the work, and runs the adoption task by task. Use when asked to adopt Cabuya, get started with the protocol, or implement it end to end.',
    `version: ${LATEST}`,
    'license: CC0-1.0',
    '---',
    '',
    '# Adopt Cabuya',
    '',
    'Two lines. The pack teaches any coding agent the whole protocol — schema,',
    'levels, exclusions, validator — and works offline, because the specification',
    'is vendored inside it, checksummed.',
    '',
    '```bash',
    START_COMMANDS.install,
    '# or, vendored into the repository:',
    START_COMMANDS.installVendored,
    '```',
    '',
    `Then say \`${START_COMMANDS.invoke}\` (or, in words: "adopt Cabuya").`,
    '',
    '## What happens, in four lines',
    '',
    '1. **If the team already has a spec-driven methodology**, the pack briefs it',
    '   with the full context — ordered tasks, acceptance criteria, validation',
    '   commands — and that methodology plans. Theirs outranks anything the pack brings.',
    '2. **If DeepWorkPlan is installed**, the adoption renders as a reviewable plan',
    '   on disk and `/dwp-execute cabuya_adoption` runs it.',
    '3. **Otherwise the pack offers to install DeepWorkPlan (with onboarding), and a',
    '   "no" is final**: the agent plans in its own plan mode over the same task list.',
    '4. **Whoever plans, one thing stays fixed**: the PII decision is made by a',
    '   human, and the level is whatever the validator measures — never a declaration.',
    '',
    '## Where everything lives',
    '',
    `- The installable pack: ${SKILL_REPO_URL}`,
    `- The page for your human: ${url('/start')}`,
    `- The validator this ends at: ${url('/developers/validator')}`,
    '',
  ].join('\n')}`;
}

// ── The index ─────────────────────────────────────────────

const SKILL_PATH = '/.well-known/agent-skills/publish-a-feed/SKILL.md';
const ADOPT_SKILL_PATH = '/.well-known/agent-skills/adopt-cabuya/SKILL.md';

/**
 * The discovery index, per the Agent Skills Discovery RFC v0.2.0.
 *
 * Two entries, both served by this site. A `sha256` is part of the entry
 * schema, which is only meaningful if each digest is computed from the bytes
 * actually published — so the skills and the index are written by the same
 * script, in that order, and `agents:check` compares all three.
 */
function buildIndex(skill: string, adoptSkill: string): string {
  const digestOf = (contents: string): string =>
    createHash('sha256').update(contents, 'utf-8').digest('hex');
  return `${JSON.stringify(
    {
      $schema:
        'https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/index.schema.json',
      version: '0.2.0',
      skills: [
        {
          name: 'adopt-cabuya',
          type: 'skill',
          description:
            'The guided adoption: install the cabuya-skill pack, say /cabuya, and the agent orients, asks who plans (the team\u2019s own methodology first), and runs the adoption task by task — resumable, with the one PII decision always human.',
          url: url(ADOPT_SKILL_PATH),
          sha256: digestOf(adoptSkill),
          license: 'CC0-1.0',
        },
        {
          name: 'publish-a-cabuya-feed',
          type: 'skill',
          description:
            'Publish emergency-aid data as a conforming Cabuya feed and measure it with the public validator. No account, no key: the specification, the schemas and the validator are all public.',
          url: url(SKILL_PATH),
          sha256: digestOf(skill),
          license: 'CC0-1.0',
        },
      ],
    },
    null,
    2
  )}\n`;
}

// ── Write or check ────────────────────────────────────────

const skill = buildSkill();
const adoptSkill = buildAdoptSkill();

const outputs: Array<{ file: string; contents: string }> = [
  { file: `public${SKILL_PATH}`, contents: skill },
  { file: `public${ADOPT_SKILL_PATH}`, contents: adoptSkill },
  {
    file: 'public/.well-known/agent-skills/index.json',
    contents: buildIndex(skill, adoptSkill),
  },
  { file: 'public/auth.md', contents: buildAuthMd() },
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
      console.error(`❌ ${file} is stale — run \`pnpm run agents:generate\``);
    }
    process.exit(1);
  }
  console.log('✅ auth.md and the agent-skills index are current');
  process.exit(0);
}

for (const { file, contents } of outputs) {
  const path = join(ROOT, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  console.log(`✅ wrote ${file} (${contents.split('\n').length} lines)`);
}
