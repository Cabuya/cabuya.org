# Architecture — cabuya.org

> The technical shape of the repository. Companion to
> [`AGENTS.md`](../AGENTS.md) (the entry point) and
> [`docs/INFORMATION_ARCHITECTURE.md`](./INFORMATION_ARCHITECTURE.md) (the URL
> surface). *(Ships in Task N)* markers track the migration plan.

---

## 1. The four artifacts, one repository

```
┌────────────────────────────────────────────────────────────┐
│                        cabuya.org repo                     │
│                                                            │
│  spec/          ← the standard (CC0, bounded, extractable) │
│  registry/      ← the publishers (CC0, PR-reviewed data)   │
│  packages/
│    validator/   ← @cabuya/validator (one engine, 4 harnesses)
│  src/ + functions/ + public/   ← the website               │
└────────────────────────────────────────────────────────────┘
```

**Why one repo:** a schema edit that breaks a teaching example fails the same
PR that made it — spec, schemas, examples, validator fixtures and rendered
docs stay provably consistent in one CI run. The skill lives in its own repo
(`Cabuya/cabuya-skill`) because it installs into *other people's*
repositories and has its own release cadence.

**The escape hatch:** `spec/` and `registry/` are governed by boundary rules
B1–B7 and a pre-committed extraction procedure (`spec/README.md`; original
analysis: `docs/context/PRODUCTS_BLUEPRINT.md` §1.3–1.4). The public surface
of the standard is a set of URLs, not a repository layout.

## 2. The boundary contract (B1–B7) — enforced, not intended

| # | Rule | Enforced by |
|---|---|---|
| B1 | `spec/` and `registry/` import/reference nothing outside themselves | `spec:boundary` *(Task 10)* |
| B2 | Site code reads them ONLY via `src/lib/spec-loader.ts` / `src/lib/registry-loader.ts` | grep gate: at most those two files match |
| B3 | Each carries its own LICENSE (CC0), README, CHANGELOG, CODEOWNERS entry | file-existence check |
| B4 | No build step, no `package.json`, no generated files inside — `.md`/`.json` only | extension allowlist |
| B5 | Schema `$id`s are absolute, versioned URLs (`https://cabuya.org/spec/...`) | schema lint in `spec:check` |
| B6 | Registry entries are data-only; no field rendered unescaped | `registry:check` + escaping test |
| B7 | No PII anywhere in either directory, examples included | PII deny-pattern pass in CI |

## 3. The website

### 3.1 Stack and why

| Layer | Choice | The one-line reason |
|---|---|---|
| Framework | Astro 7 SSG, islands | Documentation should not ship a runtime; 0 KB JS by default |
| Markdown | Sätteri (`markdown.processor: satteri({ hastPlugins })`) | The Rust pipeline; `.md`/`.mdx` share it. Transforms are HAST plugins in `src/lib/satteri-plugins.ts` — **never** remark/rehype |
| Islands | Svelte 5 (runes) | Smallest payload for the few interactive widgets (validator form, registry filter, nav) |
| Styling | Tailwind 4 `@theme` tokens | One declaration site; generated utilities; the token/utility coupling makes the design test possible |
| Types | TypeScript 6 (pinned) | `astro check` requires the TS 6 programmatic API |
| Lint/format | Biome 2 | One binary; no ESLint/Prettier |
| Tests | Vitest + Playwright | Unit + a11y/E2E |
| Hosting | Cloudflare Pages + Functions + KV | Free at this scale; Functions = the same Workers runtime the validator core targets |

### 3.2 Routing and i18n (D-W1) *(ships in Task 8)*

EN at `/`, ES at `/es`. Root routes are English pages; a single
`src/pages/[lang]/` dynamic tree serves every other active language via
`getStaticPaths`. A language is **active** when
`src/lib/translations/{code}.ts` exists — adding a language is one
translations file + content folders, zero routing edits.

- `src/lib/language-codes.ts` — dependency-free registry (also imported by
  the Astro config).
- `src/lib/i18n.ts` — `DEFAULT_LANGUAGE = 'en'`, `getUrlPrefix(lang)`
  (`''` for en, `/{code}` otherwise), active-language derivation.
- Page components (`src/components/pages/*Page.astro`) receive `lang` and are
  the single implementation; route files are thin.
- **URL-first**: no browser-language or localStorage redirects, ever.

### 3.3 The middleware allowlist

`src/middleware.ts` hard-allowlists top-level paths (`KNOWN_ROOT_PATHS` +
language-aware variants). Unknown paths 404 in production. **Every task that
adds a route updates the allowlist in the same commit** — this is the repo's
most common trap and it is documented everywhere on purpose.

### 3.4 Content collections *(wired progressively, Tasks 23–30)*

| Collection | Source | Loader path | Renders |
|---|---|---|---|
| `docs` | `src/content/docs/{en,es}/**` | glob | Portal prose (quickstart, consume, faq, …) |
| `specVersions` | `spec/versions/*/` | **via `spec-loader.ts`** | `/developers/spec/{v}/{section}` |
| `schemas` | `spec/schemas/*/` | via `spec-loader.ts` | Generated schema reference |
| `examples` | `spec/examples/*/` | via `spec-loader.ts` | Inline teaching examples |
| `rfcs` | `spec/rfcs/` | via `spec-loader.ts` | `/rfcs`, `/rfcs/{n}` |
| `changelog` | `spec/CHANGELOG.md` | via `spec-loader.ts` | `/changelog` |
| `publishers` | `registry/publishers/` | **via `registry-loader.ts`** | `/registry`, `/registry/{id}` |

Localized fields are `{en, es}` objects required by the Zod schema — a
missing translation is a build error.

### 3.5 Functions (the entire dynamic surface)

| Function | Job | Risk class |
|---|---|---|
| `functions/_middleware.ts` | `Accept: text/markdown` negotiation → `.md` twins; schema content negotiation | Low |
| `functions/api/validate.ts` | The live validator — fetches arbitrary URLs | **The attack surface.** Full SSRF control set; zero retention |
| `functions/api/contact.ts` *(Task 31)* | Contact form → DailyBot Forms | Env-gated secret; honeypot; rate limit |
| `functions/badge/[publisher].ts` | Measured badge SVG from KV | Read-only binding; cache 15 min; state as text; 404 for an unregistered id |
| `functions/registry/status.json.ts` | Every measured state, so the static pages can refresh themselves | Read-only binding; same cache window as the badge |

Every Function's KV binding is typed against `functions/lib/pages-runtime.ts`,
which declares the four runtime members this site uses and nothing else. The
badge and status endpoints bind `KvRead` — they have no `put` at the type level,
which is the first place the rule *only the cron writes conformance* is
enforced.

State: **KV only** (measured status + two rate counters), in two namespaces
that never mix. No database anywhere. The public audit trail is daily CC0 JSONL
appended to `registry/history/` by a reviewable bot pull request — measured
state lives in KV because it must be current, and its record lives in git
because it must be permanent.

### 3.6 The agent-facing content layer *(Task 32 completes it)*

Every page has a complete `.md` twin (coverage ≥ 0.85, checked by
`md:check`). **Spec twins are the source files** — served with a front block,
so drift is structurally impossible. `llms.txt` (the map) and
`llms-full.txt` (spec + quickstart + check catalogue inlined) are generated
at build from the route manifest.

### 3.7 The internal hub

`/internal/*` — dev-only design-system surface (brand book, token table,
component/diagram galleries). `InternalLayout`, English-only, excluded from
production three ways: post-build deletion, sitemap filter, noindex meta.

## 4. The validator (`packages/validator/`) *(Tasks 12–16)*

**One engine, four harnesses** — CLI, CI action, `/api/validate`, the
registry cron — same checks, same ids, same messages, byte-identical JSON
reports (parity-tested Node ↔ Workers). Core rules: zero Node-only APIs
(`fetch`/`TextDecoder`/`crypto.subtle` only); Ajv is the only production
dependency; passes never short-circuit (a fix loop wants the full list);
findings quote pointers, never values (the PII non-echo rule); deterministic
ordering. Pipeline: resolve → fetch → parse → schema → semantic → PII deny →
behavioral probes → level → report.

## 5. Build pipeline

`prebuild` (agent-skills index, og fallback guard *(Task 22)*) →
`astro check && astro build` → post-build internal-hub deletion → gates.
Everything a page shows is derived from checked sources at build time:
schema reference from the JSON Schemas, check pages from the validator's
registry, badges from KV at request time. **Hand-written copies of generated
things are bugs.**

## 6. Two repositories, one contract

The skill repo vendors `spec/schemas/`, the examples and the vocab with
SHA-256 checksums (`sync-spec.sh` is the only writer; CI verifies). The
skill's offline acceptance test asserts against the same five examples this
repo's `spec:check` validates — one contract, two enforcement points.

## Rendering the specification (Task 25)

The spec's HTML is produced from the same Markdown the repository ships, the
validator's snapshots assert against, and the skill vendors. There is no second
copy, so the site cannot publish a normative sentence the specification does not
contain.

**The collection is loaded through the adapter, not by a glob.** `spec/` is a
bounded directory (B2): one site-side reader, so lifting it into another
repository is a copy rather than an excavation. A `glob()` loader pointed at it
would be three lines shorter and would break that. Instead `src/content.config.ts`
declares a custom Content Layer loader that calls `spec-loader.ts` and hands each
body to the loader context's `renderMarkdown`, which runs the same Sätteri
pipeline configured in `astro.config.mjs`. The collection API — `getCollection`,
`render`, the heading list — works exactly as it would with a glob.

**Anchors come from the §-numbering, not from the heading text.** The
`spec-anchors` HAST plugin reads `§3.1` out of a heading and emits `id="3-1"`.
Validator findings deep-link to those anchors, and a slugified title would move
the moment somebody fixed a typo in it — breaking every message already in the
wild.

**RFC 2119 keywords are marked by a plugin**, not by authored markup: the spec
files stay plain Markdown for every other consumer, and presentation belongs to
whoever renders them.

**Spanish spec and schema routes serve the English body**, with a notice saying
so. `src/lib/normative-language.ts` (mirrored for the gate scripts at
`scripts/lib/normative-language.mjs`, with a test asserting the two agree) makes
that exemption conditional on the notice being present — a Spanish page that
silently served English still fails the language gates.

**The schema reference is generated.** `schema-reference.ts` walks the JSON
Schema into a field table; `field-checks.ts` maps a field path to the check ids
that fire on it, importing the ids from `@cabuya/validator` so a renamed check
cannot leave a dead cross-link. That link is the last edge of the agent fix
loop: field → check id → rule and fix, in the vocabulary the validator's own
output uses.
