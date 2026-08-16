# `@cabuya/validator`

The conformance validator for the [Cabuya Protocol](https://cabuya.org) —
**one engine, four harnesses**: the CLI, the CI action, the portal's live
checker at `/developers/validator`, and the registry's scheduled
re-validation. All four run the same checks, emit the same ids and the same
messages, and produce byte-identical JSON reports.

> **Conformance is measured, never declared.** A feed conforms when this
> validator says so — nothing here ever prints the word *certified*.

## Install

```bash
npm i -D @cabuya/validator      # or pnpm add -D / yarn add -D
```

Requires Node ≥ 24 for the CLI. The **core** has zero Node-only APIs, so it
also runs in Cloudflare Workers, Deno, Bun and the browser (test-enforced).

## Use it as a library

```js
import { Engine, EXIT, exitCodeFor, summaryPhrase } from '@cabuya/validator';

const report = await new Engine({
  validatorVersion: '0.1.0',
  specVersion: '0.1.0',
  target: 'https://example-app.org/feeds/places.json',
  schemas,          // injected — the core never reads from disk
  fetcher,          // omit for degraded (no-network) mode
}).register(...passes).run(document, raw);

console.log(summaryPhrase(report));            // the one-line verdict
process.exit(exitCodeFor(report, /* strict */ false));
```

### The report

Every harness emits the same shape (`Report` in `src/report.ts`). The fields
that matter to a fix loop:

| Field | Why it exists |
|---|---|
| `findings[]` | One violation per finding — `pointer`, `message`, `rule`, `fix`, optional `suggested_patch`, plus `spec` and `docs` deep links |
| `blockers_for_next_level` | Turns "here are six problems" into "fix these two and you are L2" |
| `measured_level` / `not_measured_in_this_version` | What was measured — and, explicitly, what this build *cannot* measure, so an unmeasurable level never looks like a failed one |
| `degraded` | True when transport checks did not run. A degraded report says **"schema-valid; conformance unmeasured"** — never "conforming" |
| `probes` | CORS, soft-404, always-now, byte size, timing, request count |

Findings quote a **JSON Pointer, never the offending value** — a PII finding
that echoed a phone number would leak it into a public CI log.

### Exit codes

| Code | Meaning | What a fix loop should do |
|---|---|---|
| `0` | Conformant at the requested level | Proceed |
| `1` | Non-conformant — content errors | Read `findings`, fix, re-run |
| `2` | Conformant, warnings, `--strict` | Decide; do not rewrite the mapping |
| `3` | **Transport failure** | Fix deployment/DNS/routing — **not** the data |
| `4` | Usage error | Fix the invocation |
| `5` | Internal validator error | Report a bug; do not retry in a loop |

Codes 1 and 3 are deliberately distinct: conflating "the feed is wrong" with
"the network is wrong" is how fix loops burn iterations rewriting correct
code.

## The check catalogue

Every check id is **stable forever** — deprecated, never renumbered, because
messages get quoted in issues, commits and agent transcripts. Checks that are
catalogued but not yet implemented carry `implemented: false` and a plan:
their ids are reserved, their docs pages exist, and the backlog is
pre-specified work.

```js
import { CHECKS, getCheck, docsUrl } from '@cabuya/validator/checks';

getCheck('REC001').rule;   // the requirement, in one clause
docsUrl('REC001');         // https://cabuya.org/developers/validator/checks#REC001
```

## Status

`0.1.0` — the engine, the contracts and the catalogue. The passes land
next: schema + semantic (Task 13), PII + golden corpus (14), behavioral
probes (15), the CLI (16). Track them in the repository's migration plan.

Apache-2.0 · part of [`Cabuya/cabuya.org`](https://github.com/Cabuya/cabuya.org)
