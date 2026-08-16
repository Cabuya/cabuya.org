# PRODUCTS_BLUEPRINT.md — the products that carry `cabuya`

> **DRAFT FOR WORKING-GROUP REVIEW.** Nothing here is built, registered, bought or
> committed on behalf of any team. Every stack choice below is a recommendation with
> its alternative recorded, so the group can overturn any single row without
> unpicking the rest.
>
> **TL;DR**
> 1. **Two repos, decided:** `cabuya-website` (landing + `/developers` portal,
>    same architecture as this CoragWeb repo) and `cabuya-skill` (the agent
>    pack, modeled on the vendored DailyBot + DeepWorkPlan packs).
> 2. **The spec lives in the website repo**, in a bounded, CC0, self-contained
>    `spec/` directory with its own CHANGELOG and a no-imports rule — because the
>    normative text and its canonical URL are the same artifact, and one repo means
>    one CI, one review queue, one place a volunteer looks. `registry/` is a second
>    bounded CC0 directory on the same contract. Both are extractable to their own
>    repos in an afternoon; §1.4 records the exact procedure and its triggers.
> 3. **The validator is one engine with four harnesses** — CLI, CI action, the
>    portal's live paste-URL checker, and the scheduled registry re-validation.
>    TypeScript, zero Node-only APIs, so the same bundle runs in Node, a Cloudflare
>    Worker and the browser. Its **error messages are written for an agent fix
>    loop**: stable check ids, JSON Pointer locations, the rule, the fix, and a
>    minimal patch — the three invalid examples in `schemas/examples/` already
>    contain the exact strings, and they are the validator's acceptance fixtures.
> 4. **The skill is the adoption budget.** Five sub-skills (`implement`, `consume`,
>    `validate`, `publish-status`, `setup`), a vendored read-only copy of the spec,
>    and a bundled validator runner, so that *any* agent that installs it already
>    knows the whole protocol offline. §3.8 makes that claim a scored, reproducible
>    acceptance test rather than a slogan.
> 5. **The walking skeleton for v0.1 is small on purpose** (§7.3): manifest +
>    place feed schemas, the validator's schema/PII/soft-404 passes, a quickstart
>    page, a paste-URL validator, a registry with three real publishers and
>    measured badges, and the `implement` + `validate` sub-skills. Everything else
>    is phase 2.
>
> **DECIDED (2026-08-16): the name is `Cabuya`**, with canonical domain **cabuya.org** and compound-name domain **cabuyaprotocol.org**. Brand assets delivered (see `brand/`). Repo names are final: `cabuya-website` and `cabuya-skill`.
>
> **Inputs:** `PROTOCOL_DESIGN.md` (conformance ladder L0–L4, discovery, feed,
> API surface, MCP mapping §4.5, exclusions §7, agent walkthrough §11) ·
> `BRAND_AND_NAMING.md` §5–7 (shortlist, master-brand architecture, verbal
> identity) · `GOVERNANCE_AND_LICENSING.md` (licensing split, badge policy, org
> surface §6) · `APPS_MATRIX.md` (readiness waves, the four confirmed APIs) ·
> `schemas/` + `schemas/examples/` (the five worked examples) · this repo's
> `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/SEO.md`,
> `docs/aeo/MARKDOWN_FOR_AGENTS.md`, `docs/PERFORMANCE.md`, `docs/SECURITY.md` ·
> the vendored packs at `.agents/skills/deepworkplan/` and `.agents/skills/dailybot/`.
> Date of writing: **2026-08-16**.

---

## 0. Conventions used in this document

| Convention | Meaning |
|---|---|
| `cabuya` | The unvoted name. Lowercase in paths, packages, handles; capitalised in prose (`BRAND_AND_NAMING.md` §7.1). |
| Repo naming | The GitHub org is `cabuya`; the repos inside it are `website` and `skill` (`GOVERNANCE_AND_LICENSING.md` §6.2 URL aesthetics). This document calls them **`cabuya-website`** and **`cabuya-skill`** for readability; the clone URL is `github.com/Cabuya/website`. |
| "This repo" | `CoragWeb` / `corag.app`, the source of the website architecture. |
| MUST / SHOULD / MAY | RFC 2119, used only where this blueprint states a contract a future implementer has to honour. |
| Every stack row | Carries a one-line justification **and** the alternative that was considered and not taken. |

---

## 1. Repo topology and where the spec lives

### 1.1 The decided split, and how it absorbs the seven-repo layout

The founder decided **two repos**. `GOVERNANCE_AND_LICENSING.md` §6.2 had sketched
seven (`spec`, `validator`, `registry`, `skill`, `mcp-server`, `website`,
`.github`). Those are not in conflict — the seven are *artifacts*, the two are
*repositories*. The mapping is explicit so nothing is silently dropped:

| Governance §6.2 artifact | Home under the 2-repo decision | Licence | Extractable later? |
|---|---|---|---|
| `spec` (normative text, schemas, examples, RFCs) | `cabuya-website/spec/` — bounded directory | **CC0-1.0** (directory-scoped `LICENSE`) | **Yes** — §1.4 |
| `registry` (publishers, validation results) | `cabuya-website/registry/` — bounded directory | Data **CC0-1.0**; the rendering code is the site's Apache-2.0 | **Yes** — §1.4 |
| `validator` | `cabuya-website/packages/validator/` — pnpm workspace package, published to npm as `Cabuya-validator` | **Apache-2.0** | **Yes** — it is already a package |
| `website` | `cabuya-website/src/` + `functions/` | **Apache-2.0**, content CC0 | n/a |
| `skill` | `cabuya-skill/` — its own repo (decided) | **Apache-2.0** | n/a |
| `mcp-server` | `cabuya-website/packages/mcp-server/` — workspace package, deployed as a Worker | **Apache-2.0** | Yes |
| `.github` (org profile, CoC, TRADEMARK, SECURITY) | Org-level `.github` repo — **not** a product; it is three markdown files and issue templates | — | n/a |

> The org `.github` repo is the one exception to "two repos". It holds no product
> and no code — `CODE_OF_CONDUCT.md`, `TRADEMARK.md`, `SECURITY.md`, issue and PR
> templates — and GitHub requires that exact name for org-wide defaults to work.
> Counting it as a third product would be pedantry; not creating it means every
> repo re-declares its own CoC and they drift.

**Why two repos is the right call anyway** (the decision is not being re-opened,
but the blueprint should say why it holds): the failure mode of a young standard
is not repo sprawl, it is *review latency*. Seven repos means seven CI configs,
seven dependency-update streams and seven places a volunteer has to look before
they can answer "is the schema in sync with the docs?". One repo makes the spec,
its schemas, its examples, its validator and its rendered documentation change in
**one pull request that CI can prove is internally consistent** — a schema edit
that breaks an example fails the same PR that made it. The skill is separate
because it is installed into *other people's* repositories, has its own release
cadence, and must be clonable without pulling a website's `node_modules`.

### 1.2 Where the normative spec, schemas and validator live — the analysis

Three options were evaluated against the constraints that actually bind here.

| Criterion (weight) | **A — website repo, bounded `spec/`** | **B — bundled in the skill repo** | **C — separate npm package consumed by both** |
|---|---|---|---|
| Canonical URL is the artifact (high) | **Best.** `Cabuya.org/spec/0.1/…` renders from the same files that CI validates. One source, one URL, no publishing step. | Poor. The normative text would live in a repo whose purpose is agent installation; the website would fetch or vendor it, creating a sync gap. | Medium. The package is the source, but a human-readable canonical URL still needs a renderer, so the website vendors it anyway. |
| Review latency for a spec change (high) | **Best.** Schema + example + prose + rendered page + validator fixtures in one PR, one CI run. | Poor. A schema change needs a skill release *and* a website release before the public sees it. | Poor. Three PRs across two repos plus an npm publish for a typo fix. |
| Agent access offline (high — §3.8) | Good. The skill vendors a checksummed read-only copy (`spec/` inside the skill), synced by script. | **Best** trivially — it is already there. | Medium — requires install to have succeeded. |
| Extractability to its own repo (hard constraint) | **Good, if disciplined** — the whole point of §1.3's boundary rules. | Poor. Extracting from a skill pack means untangling prose from procedures. | Best (already separate) but see the two rows above. |
| Contributor barrier for a non-JS implementer (medium) | Good. `git clone`, read `spec/`, no toolchain needed to read or propose text. | Medium. The repo looks like tooling, not like a standard. | Poor. "Where is the spec?" answered with "npm install" is a bad answer for a standard. |
| Governance optics — "the spec is not owned by the website" (medium) | **Weakest point of A.** Mitigated by the directory licence, its own CHANGELOG, its own CODEOWNERS, and the pre-committed extraction path. | Worse — it would look owned by the tooling. | Best optics, worst ergonomics. |
| Ops cost year one (medium) | One CI, one deploy, one dependency stream. | Two of everything. | Three of everything plus a release process. |

**Recommendation: Option A.** The spec, its schemas and its examples live at
`cabuya-website/spec/`, a bounded CC0 directory. The validator lives at
`packages/validator/` in the same repo and is published to npm so the skill, CI
and third parties consume a versioned artifact rather than a path. The skill
vendors a **read-only, checksummed** copy of `spec/schemas/` and a distilled
`PROTOCOL_SUMMARY.md` so an agent is useful with no network.

**The one honest cost:** optics. A spec that lives inside a website repo can look
subordinate to the website. That is answered by making the boundary real and
visible rather than by rhetoric — §1.3 — and by pre-committing the extraction in
§1.4 so "we will move it if governance requires" is a documented procedure with
triggers, not an intention.

### 1.3 The boundary contract for `spec/` and `registry/`

These rules are enforced by CI (`scripts/check-spec-boundary.mjs`), not by good
intentions. A violation fails the build.

| # | Rule | Enforcement |
|---|---|---|
| **B1** | `spec/` and `registry/` MUST NOT import, require or reference anything outside themselves. No `@/` alias, no site utilities, no framework types. | Static scan for import/require statements and `@/` occurrences. |
| **B2** | Site code MAY read `spec/` and `registry/` **only** through a single adapter module each (`src/lib/spec-loader.ts`, `src/lib/registry-loader.ts`). No other file may reference those paths. | Grep gate: at most those two files match. |
| **B3** | Each directory carries its own `LICENSE` (CC0-1.0), `README.md`, `CHANGELOG.md` and `CODEOWNERS` entry. | File-existence check; CODEOWNERS parse. |
| **B4** | `spec/` contains **no** build step, no `package.json`, no generated files. Markdown, JSON Schema and JSON examples only. | Extension allowlist. |
| **B5** | Schema `$id` values are **absolute, versioned URLs** (`https://Cabuya.org/spec/0.1/schemas/place-feed.schema.json`), never relative paths — so a vendored copy resolves identically to the hosted one. | Schema lint. |
| **B6** | `registry/` entries are data-only JSON validated against `registry/schema/publisher-entry.schema.json`; no free-text field is rendered as HTML without escaping. | `registry:check` gate + the site's escaping test. |
| **B7** | No PII in either directory, ever — including in examples, RFC bodies and registry contact fields (org-level contact only, per `PROTOCOL_DESIGN.md` §7.2). | The validator's own `PII` pass, run over the repo's own fixtures in CI. |

### 1.4 The extraction evolution path (pre-committed, not improvised)

**Triggers** — any one of these opens the extraction PR; none is a judgement call:

1. A maintainer from an app other than the founder's requests it in an RFC and the
   §2.4 decision rule passes.
2. The spec gains a second, independent renderer (someone else publishes the spec
   at another URL) — at that point the directory is genuinely a shared artifact.
3. Governance moves to Model C (`GOVERNANCE_AND_LICENSING.md` §2.2) and the entity
   wants the standard held separately from the site.
4. The website repo needs a licence change that would contaminate the CC0 boundary.

**Procedure** (estimated: one afternoon, one maintainer):

| Step | Action | Why it is cheap |
|---|---|---|
| 1 | `git filter-repo --path spec/ --path registry/` into a new `spec` repo, preserving history | B1/B4 guarantee no dangling imports |
| 2 | Move `packages/validator/` the same way if the group wants it with the spec | It is already a self-contained package |
| 3 | Website adds the new repo as a **git submodule** or a CI-time `degit` fetch pinned to a tag; `src/lib/spec-loader.ts` changes its base path — **one file** | B2 guarantees one call site |
| 4 | URLs do not change: `Cabuya.org/spec/…` is still served by the website | The canonical URL was never a repo path |
| 5 | `$id`s do not change | B5 |
| 6 | Registry PR workflow moves; the badge cron reads the new repo | One workflow file |

**The contract this preserves:** *the public surface of the standard is a set of
URLs, not a repository layout.* Anything that would break if the directory moved
is a boundary violation and CI says so before it ships.

### 1.5 What each repo is explicitly **not**

- The website repo is **not** the application. It never holds a real person's
  situation, a case, a name or a phone number — same rule as this repo's
  `CLAUDE.md`, and here it is stronger because the registry is machine-read.
- The website repo is **not** a mirror of anyone's aid data. It stores publisher
  *metadata* and *validation results*; it never caches place records to disk.
  (The MCP server holds an in-memory, TTL-bounded cache and nothing else — §5.5.)
- The skill repo is **not** a CLI. It is a prompt layer plus vendored contracts; the
  executable it drives is the published validator.
- Neither repo is a place to publish claims about who is trustworthy
  (`GOVERNANCE_AND_LICENSING.md` §4.5: *inclusion is not endorsement*, printed on
  the registry itself).

---

## 2. `cabuya-website` — landing + developers portal

### 2.1 Stack

Inherited wholesale from this repo, because it is a proven, measured, zero-cost
static stack with an agent-facing content layer already solved. Each row carries
the alternative considered.

| Layer | Choice | Why | Alternative considered |
|---|---|---|---|
| Framework | **Astro 7.x**, SSG, islands | Zero JS by default; the portal is 90% documentation, and documentation should not ship a runtime. Proven here across ~480 pages. | Docusaurus (docs-native but React-heavy and opinionated about IA; the landing page would fight it); VitePress (excellent for docs, weak for a marketing landing + registry app). |
| Markdown | **Sätteri** (`markdown.processor: satteri({ hastPlugins })`) | Astro 7's default Rust pipeline; `.md` and `.mdx` share one processor. The spec is thousands of lines of Markdown — compile speed is a daily cost. | remark/rehype via `@astrojs/markdown-remark` — rejected for the same reason as here: it is the compatibility path, not the supported default. Transforms are written as HAST plugins in `src/lib/satteri-plugins.ts`. |
| Islands | **Svelte 5.x** with `client:visible` / `client:idle` | Only four things on the site are interactive (validator form, registry filter, schema explorer, nav). Svelte 5 runes give the smallest island payload of the mainstream options. | React (larger runtime for four widgets); Alpine (too little structure for the validator form's state). |
| Styling | **Tailwind 4.x** with a `@theme` token block | The token discipline from `docs/DESIGN.md` transfers verbatim: one declaration site, generated utilities, no hex values in components. New brand palette from Task 5 post-vote. | Vanilla CSS + custom properties (loses the utility generation and the token/utility coupling that makes the design-token test possible). |
| Language | **TypeScript 6.x**, pinned | Same constraint as this repo: `astro check` depends on the programmatic API TS 7 does not yet expose. | TS 7 — blocked upstream; revisit when the roadmap issue ships. |
| Lint/format | **Biome 2.x** | One binary, one config, no ESLint/Prettier plugin archaeology. | ESLint + Prettier — explicitly not used here; consistency across the two repos matters more than familiarity. |
| Package manager | **pnpm** workspaces | The repo holds three publishable packages (`validator`, `mcp-server`, and later an SDK); workspaces are the reason. | npm workspaces (works, slower, worse hoisting); a monorepo tool (Nx/Turbo) — overkill for three packages. |
| Tests | **Vitest** (unit) + **Playwright** (a11y/responsive smoke, optional at v0.1) | Matches this repo; the validator's golden corpus is a Vitest suite. | Jest (slower, no native ESM story with this toolchain). |
| Hosting | **Cloudflare Pages** + **Pages Functions** | Free at this scale (`GOVERNANCE_AND_LICENSING.md` §6.4), and the Functions runtime is the same Workers runtime the validator core must run in anyway — one less runtime to support. | Netlify/Vercel (fine, but the validator-in-a-Worker and the badge KV store are Cloudflare-native and free); GitHub Pages (no server-side surface, which kills the live validator). |
| State for badges | **Cloudflare KV** (live status) + a monthly CC0 JSONL history committed to `registry/history/` | Badges must be current without a rebuild; the audit trail must be public and mirrorable. | Committing every validation run to git (noisy: 20+ publishers × 4 runs/day = an unreadable history); a database (a cost and a custody problem the project explicitly avoids). |
| Analytics | **Cloudflare Web Analytics** (cookieless, no consent banner) | Zero ops, zero cost, no personal data, no cookie banner to build. | Self-hosted Umami behind a first-party proxy (this repo's pattern, `functions/api/umami/[[path]].ts`) — better event granularity, but it is a service to run and a database to own; adopt only if the group wants funnel-level adoption metrics. **Never GA4** (`docs/ANALYTICS.md` §"Why NOT Google Analytics 4"). |

### 2.2 Patterns inherited from this repo — named, with source paths

| Pattern | Source in this repo | How it lands in the website repo |
|---|---|---|
| **Page-wrapper pattern** | `src/components/pages/*Page.astro` + 3-line wrappers in `src/pages/` | Identical. One `*Page.astro` per route, two thin wrappers (`src/pages/x.astro` → `<XPage lang="es" />`, `src/pages/en/x.astro` → `lang="en"`). Wrappers never import a layout. |
| **Bilingual routing, ES at `/`, EN at `/en`** | `src/lib/i18n.ts`, `getUrlPrefix(lang)` | Identical, including the rule that **route slugs are English in both languages** (`/developers/quickstart`, `/en/developers/quickstart`). URL-first: no browser-language redirect. |
| **Exhaustive translation types** | `src/lib/translations/{types,en,es}.ts` | Identical. A missing key is a type error, which is what keeps two languages honest without a process. |
| **Content Collections + Zod** | `src/content.config.ts` | New collections (§2.5). Same discipline: schemas in one file, localized fields as `{es, en}` objects. |
| **`.md` twins for agents** | `docs/aeo/MARKDOWN_FOR_AGENTS.md`, `src/lib/markdown-for-agents.ts`, `scripts/check-md-parity.mjs` | **First-class, and cheaper here**: the spec's HTML is *rendered from* Markdown, so its twin is the source file plus a front block. Completeness contract, coverage ≥ 0.85, required-section lists and the three-layer gate all carry over. |
| **`Accept: text/markdown` content negotiation** | `functions/_middleware.ts` | Identical, plus `application/schema+json` negotiation on schema pages so an agent asking for a schema page gets the schema. |
| **`llms.txt` / `llms-full.txt`** | `public/llms.txt`, `public/llms-full.txt` | Generated at build from the route manifest. `llms.txt` is the portal's table of contents for agents; `llms-full.txt` inlines the current spec version and the quickstart. |
| **Middleware allowlist** | `src/middleware.ts` `KNOWN_ROOT_PATHS` / `KNOWN_EN_PATHS` | Kept, and its trap is documented in the repo's `AGENTS.md`: a new top-level route 404s in production until it is added. |
| **Design-token discipline** | `docs/DESIGN.md`, `src/styles/global.css` `@theme` | Kept verbatim in shape: one declaration site, no token overrides in components, a `/internal/ui/colors` page reading computed values at runtime, and a unit test that fails if a token is declared-but-not-shown or shown-but-not-declared. |
| **Internal dev-only hub** | `src/pages/internal/`, excluded from production three ways | Kept — it is where the brand book, the token table and the badge-state gallery live. Same three-layer exclusion (post-build deletion, sitemap filter, `noindex`). |
| **Quality gates as npm scripts** | `md:check`, `lang:check`, `seo:check`, `parity:check`, `redirects:check` (+ `:strict` CI variants) | All five carried over, plus three new ones (§2.9). |
| **`.agents/` + `.claude` symlink** | `.agents/` canonical, `.claude → .agents` | Identical, so the repo is agent-pilotable from day one and the DeepWorkPlan skill can onboard it. |
| **Image discipline** | `docs/PERFORMANCE.md` | Every `<img>` carries `width`/`height`; WebP; `loading="lazy"` below the fold via the `satteriImageDefaults()` HAST plugin. |

### 2.3 Named exclusions — what does **not** carry over

Being explicit here is what keeps the blueprint lean; each exclusion says what
replaces it.

| Excluded from CoragWeb | Why | Replacement |
|---|---|---|
| **Institutional pages system** (`InstitutionalPage.astro` + `InstitutionalPageCopy` + the serializer) | It exists to keep seven long prose pages in sync across languages from one copy object. The portal's long-form content is the **spec**, which is already Markdown and already versioned — a second prose engine would compete with it. | Markdown-sourced pages via the `docs` collection; the spec renders from `spec/versions/*/`. |
| **Blog** (posts, tags 3-tier taxonomy, series, authors, search index, RSS) | A standards project's news surface is its **changelog and RFC index**, which are structured, not editorial. A blog invites the marketing register `BRAND_AND_NAMING.md` §7.3 bans. | `/changelog` (from `spec/CHANGELOG.md`) + `/rfcs` (from `spec/rfcs/`) + a single `/blog`-shaped **announcements** collection deferred to phase 3, only if the group wants one. |
| **DailyBot intake forms** (`functions/api/contact.ts`, ContactForm, ConductReportForm) | Those exist for Corag's aid intake and a specific vendor integration. | One `mailto:` alias and a GitHub issue template. Contact for a standard is an issue tracker; anything more is an inbox nobody staffs. |
| **`contributors` / `authors` / `channels` collections** | They model a team directory and an owned-channel inventory — Corag-specific. | `MAINTAINERS.md` in the repo root (governance already requires it) rendered at `/governance`. |
| **Notifications top-bar** | Date-bounded emergency banners are an aid-app affordance. | Kept **only** as a spec-status banner ("0.1 is a draft under review") — one collection entry, no scheduling machinery, decided at phase 2. |
| **Blog search index + `search:budgets`** | No blog, no index. | The portal's search is a static client-side index over spec sections and check ids (phase 2), budgeted the same way if it ships. |
| **Ecosystem apps directory** (`src/content/ecosystem-apps/`) | That is Corag's directory of apps; the protocol's equivalent is the **registry**, which is measured, not curated. | `registry/` (§2.8). The distinction is the whole point: a directory lists, a registry measures. |
| **Agent claim/OAuth endpoints** (`functions/agent/claim.ts`, `.well-known/oauth-*`) | Product-level agent authorization for Corag's app. | Nothing at v0.1. The protocol's read surface needs no auth (`PROTOCOL_DESIGN.md` §4.1). |

### 2.4 Repo layout

```
cabuya-website/
├── spec/                          # CC0 · bounded · extractable (§1.3)
│   ├── LICENSE  README.md  CHANGELOG.md
│   ├── versions/0.1/              # normative Markdown, one file per section
│   ├── schemas/0.1/               # manifest.schema.json · place-feed.schema.json
│   ├── examples/0.1/{valid,invalid}/
│   ├── profiles/                  # Core, Extended, future shared extension sets
│   └── rfcs/                      # RFC-0000-template.md, RFC-0001-…, INDEX.md
├── registry/                      # CC0 · bounded · PR-reviewed (§2.8)
│   ├── LICENSE  README.md
│   ├── publishers/*.json          # one file per publisher_id
│   ├── events/*.json              # registry event ids (e.g. the 2026 event)
│   ├── history/YYYY-MM.jsonl      # monthly rolled-up validation results
│   └── schema/publisher-entry.schema.json
├── packages/
│   ├── validator/                 # Apache-2.0 · npm Cabuya-validator (§4)
│   └── mcp-server/                # Apache-2.0 · reference MCP server (§5)
├── src/
│   ├── components/{pages,developers,registry,validator,ui,layout}/
│   ├── content/{docs,registry-view,changelog,rfcs}/   # collections (§2.5)
│   ├── layouts/{MainLayout,DocsLayout,InternalLayout}.astro
│   ├── lib/{i18n,translations,spec-loader,registry-loader,markdown-for-agents}.ts
│   ├── pages/                     # ES at root · en/ mirror · api/ · internal/
│   ├── middleware.ts              # KNOWN_ROOT_PATHS / KNOWN_EN_PATHS allowlist
│   └── styles/global.css          # the ONLY @theme declaration site
├── functions/                     # Cloudflare Pages Functions
│   ├── _middleware.ts             # Accept: text/markdown negotiation
│   ├── api/validate.ts            # live validator (§2.7)
│   └── badge/[publisher].ts       # measured badge SVG (§2.8)
├── scripts/                       # quality gates (§2.9)
├── tests/unit/                    # Vitest
├── docs/                          # repo-facing docs (AGENTS.md indexes them)
├── public/                        # llms.txt · robots.txt · _headers · _redirects
├── .agents/  (+ .claude symlink)  # skills, commands, agent definitions
├── .github/workflows/             # ci.yml · revalidate.yml · release.yml
└── AGENTS.md  (+ CLAUDE.md symlink)
```

### 2.5 Content collections

| Collection | Loader | Schema highlights | Renders |
|---|---|---|---|
| `docs` | glob `src/content/docs/{es,en}/**/*.md` | `title`, `description`, `order`, `section`, `updated` | Portal prose pages (quickstart, guides, FAQ) |
| `specVersions` | glob `spec/versions/*/**.md` via `spec-loader.ts` | `version`, `status: draft\|rc\|normative\|superseded`, `section`, `order`, `anchor` | `/developers/spec/{version}/…` |
| `schemas` | glob `spec/schemas/*/*.json` | Parsed JSON Schema; `$id` must match the version path (B5) | `/developers/schemas/{version}/{name}` |
| `examples` | glob `spec/examples/*/**/*.json` | `valid: boolean` derived from the folder; `$comment` extracted as the teaching note | Inline in the schema reference and the quickstart |
| `rfcs` | glob `spec/rfcs/*.md` | `number`, `title`, `status: draft\|review\|accepted\|declined\|withdrawn`, `opened`, `decided` | `/rfcs`, `/rfcs/{number}` |
| `changelog` | `spec/CHANGELOG.md` (Keep-a-Changelog format) | Parsed into releases | `/changelog` |
| `publishers` | glob `registry/publishers/*.json` via `registry-loader.ts` | `publisher_id`, `canonical_url`, `aliases[]`, `manifest_url`, `entity_domains[]`, `crawl_policy_url`, `declared_target`, `contact_org`, `status: active\|archived`, `sunset_at?` | `/registry`, `/registry/{publisher_id}` |

**Localized fields** follow this repo's convention — `{es, en}` objects required by
the Zod schema, so a missing translation is a build error, not a runtime blank.

### 2.6 Information architecture

**Landing (`/`, `/en`)** — the initiative's story, in the register
`BRAND_AND_NAMING.md` §7 sets: concrete, humble, no hype vocabulary, no
fabricated traction.

| Section | Content | Rule-0 constraint |
|---|---|---|
| Hero | The elevator pitch (§7.2 of the brand doc, verbatim ES/EN) + two CTAs: *Publish a feed* (→ quickstart) and *See who publishes* (→ registry) | No adoption count until the registry can prove it per app with a timestamp |
| "Crecemos juntos" thesis | The founding sentence — *no competimos, nos alimentamos* — and the one-paragraph argument: many weak feeds, twisted together, carry a load none carries alone | Stated as intent, never as achieved outcome |
| How it works, in four boxes | Manifest → feed → validator → registry | Links to the ladder, not a marketing funnel |
| The ladder (L0–L4) | The `PROTOCOL_DESIGN.md` §1 table, rendered, with effort estimates and the two respected non-publishing tiers named | "Directory-only" and "link-out-only" shown as **membership classes**, not failures |
| Network map | The registry rendered as a graph/map of *who publishes what*, with measured status | Only publishers with a registry entry appear; no app is listed without its own PR |
| Signatories / who is in | Working-group participants who have opted in, each linking to their own site | Nobody appears without written opt-in; the section is absent, not empty, until there is one |
| The long horizon | Emergency network → interop standard → regional tech movement, phrased as vision | Explicitly labelled as ambition, per the plan's north-star rule |
| Footer | Governance, trademark policy, licences, code of conduct, GitHub, `llms.txt` | — |

**`/developers` portal** — modeled on the dailybot.com/developers shape: a
narrow, ordered path from "I have never heard of this" to "my feed is green".

| Route (ES at root; EN mirrored under `/en`) | Job | Notes |
|---|---|---|
| `/developers` | Portal home: the five-minute promise, the four transports, choose your path (publish / consume / agent) | One screen, no scroll-jacking |
| `/developers/quickstart` | **"Publish your first feed in 5 minutes"** — copy-paste a minimal manifest, a minimal feed, run the validator, see it green | §2.6.1 |
| `/developers/spec` | Version index: `0.1 (draft)`, with status badges and the "a release candidate becomes normative only after ≥1 publisher ships it" rule printed | Versions are permanent URLs |
| `/developers/spec/{version}` | The spec's table of contents | Rendered from `spec/versions/{version}/` |
| `/developers/spec/{version}/{section}` | One normative section per page, with stable anchors matching the spec's numbering (`#3.1`) | Deep links from validator messages point here |
| `/developers/schemas` | Schema reference index | |
| `/developers/schemas/{version}/{name}` | Field-by-field reference generated from the JSON Schema: type, required, enum, description, `Core`/`Extended` profile tag, an example row, and the validator check ids that fire on it | The check-id cross-link is what closes the agent loop |
| `/developers/validator` | **Live validator** — paste a URL or paste JSON, get a conformance report | §2.7 |
| `/developers/validator/checks` | The full check catalogue: id, severity, level, message template, how to fix, linked spec anchor | Stable URLs: `/developers/validator/checks#PII002` |
| `/developers/skill` | **Skill install page** — one copy-paste block per agent (Claude Code, Codex, Cursor, Gemini, Copilot, OpenClaw), what it does, what it will not do, link to `TRUST.md` | §3.9 |
| `/developers/mcp` | The reference MCP server: endpoint, tools, how to add it to an agent, the network-vs-product boundary | §5 |
| `/developers/consume` | Consumption rules as a checklist (`PROTOCOL_DESIGN.md` §4.3): attribute, show age, do not mutate, preserve chains, dedupe by claim, respect exclusions | The half of the protocol that is usually forgotten |
| `/developers/profiles` | `Core` vs `Extended`, and how a shared extension set becomes a versioned profile | |
| `/developers/faq` | Including the four questions that actually block adoption: licence, PII, "do I have to rewrite my ids?", "what if I shut down?" | Answers link to normative anchors |
| `/registry` | The implementers registry: table + map, filterable by level, entity domain, municipality, licence, status | Public, not dev-only — badges link here |
| `/registry/{publisher_id}` | One publisher: measured level, badge state, last validation timestamp, check results, declared licence and `permitted_use`, crawl policy, feeds, history sparkline | The page a badge click lands on |
| `/rfcs`, `/rfcs/{number}` | RFC index + individual RFCs with status and decision | From `spec/rfcs/` |
| `/changelog` | Spec + validator + skill releases, one timeline, SemVer-tagged | |
| `/governance` | Governance model, maintainers, decision rules, the continuity clause | From the governance doc |
| `/trademark` | The badge policy, bilingual, at the same URL structure as everything else | Required by `GOVERNANCE_AND_LICENSING.md` §5.6 |
| `/join` | How to get involved: open an issue, publish a feed, open a registry PR, join the working group | Also the good-first-issue entry point (§6.7) |
| `/internal/*` | Dev-only: brand book, token table, badge-state gallery, check-catalogue lint | Stripped from production three ways |

#### 2.6.1 The quickstart, in detail

The single most important page on the site: it is the adoption budget. Design
constraints, each derived from evidence in `APPS_MATRIX.md`:

1. **The first thing on the page is a file**, not prose — a 12-line minimal
   manifest the reader can save immediately.
2. **Five steps, each with a copy-paste block and a "you are here" ladder marker:**
   (1) write the manifest, (2) put it at `/.well-known/cabuya.json`,
   (3) exclude that path from your SPA catch-all, (4) serialize your places into
   the envelope, (5) run the validator until green, then open the registry PR.
3. **Step 3 is not optional and not buried.** The discovery trap defeated the
   plan's own probes on four hosts; a quickstart that omits it produces feeds that
   validate locally and fail in production. Each of the common stacks gets its own
   one-liner (Next.js, Vite/React SPA, Astro, Laravel, PHP, Django, static hosts).
4. **The PII decision is surfaced as a step**, not a footnote — with the deny-list
   the skill uses and the sentence "a human confirms this once".
5. **Two paths from the top:** *"I have an agent"* → three lines that install the
   skill and hand it the repo; *"I do it by hand"* → the five steps. The agent path
   is offered first because it is the one the protocol is designed around.
6. **The page ends where the validator begins** — a live embedded validator input,
   prefilled with the reader's own domain if they typed it earlier.
7. **Estimated-time honesty:** "five minutes" is the copy-paste path for a static
   file. The page states plainly that a real mapping is an afternoon
   (`PROTOCOL_DESIGN.md` §11), and links the worked walkthrough. Over-promising
   here would be the exact failure the project's Rule-0 exists to prevent.

### 2.7 The live validator — architecture decision

**Requirement:** paste a URL → get the same conformance report the CLI produces.

| Option | Can it do the job? | Verdict |
|---|---|---|
| **Client-side only** (fetch from the visitor's browser) | **No.** A non-conforming feed is precisely the one missing `Access-Control-Allow-Origin: *` (`PROTOCOL_DESIGN.md` §3.1), and a CORS failure in the browser is indistinguishable from a network error — the validator would report "unreachable" for the single most common real defect. It also cannot compare a candidate URL's byte size against `/` for the soft-404 rule when both are cross-origin. | Rejected as the only mode |
| **Pages Function** (`/api/validate`) running the same core in the Workers runtime | Yes. Server-side fetch sees real status codes, real headers, real byte sizes; can double-probe for the always-now anti-pattern; produces byte-identical output to the CLI. | **Recommended** |
| **Hybrid** | The URL mode goes through the Function. A **paste-JSON mode runs entirely client-side** (same bundle, no network) for anyone validating a feed they have not published yet, or on an internal network, or who does not want to hand a URL to our server. | **Recommended — ship both** |

**Function hardening** (this is a server that fetches arbitrary URLs — it is an
SSRF surface and must be treated as one):

| Control | Rule |
|---|---|
| Scheme | `https:` only. `http:` rejected with a message that says why. |
| Address | Reject literal IPs, `localhost`, `*.local`, and any host resolving into private/link-local/loopback ranges. |
| Redirects | Max 3, re-checked against the address rule at every hop. |
| Size | 5 MB hard cap (matches the spec's feed size guidance); streaming abort past the cap. |
| Time | 8 s per request, 25 s per validation run. |
| Rate | 10 validations / minute / IP via Workers KV counter; 60 / hour / host being probed, so the validator can never be used to hammer a volunteer's server. |
| Politeness | A stable `User-Agent` naming the project and linking to a page explaining the probe; `Referer` omitted. |
| Retention | **Nothing is stored.** No feed bodies, no request logs beyond Cloudflare's own, no analytics event carrying the probed URL — only an anonymous counter. |
| Abuse | Cloudflare Turnstile appears only after the per-IP limit trips, never on first use. |

**Report rendering:** the Function returns the validator's JSON report; the page
renders it with the same check ids, severities and fix hints as the CLI, plus a
one-click "copy report as Markdown" for pasting into an agent session — which is
the actual workflow this whole product exists to serve.

### 2.8 The implementers registry and the measured badge

**Data model** (`registry/publishers/{publisher_id}.json`, CC0):

```jsonc
{
  "publisher_id": "example-app",              // assigned once, never reassigned (R12)
  "canonical_url": "https://example-app.org",
  "aliases": ["https://www.example-app.org", "https://old-name.org"],
  "manifest_url": "https://example-app.org/.well-known/cabuya.json",
  "entity_domains": ["place"],
  "declared_target": "L2",                    // a declaration, never the badge
  "crawl_policy_url": "https://example-app.org/robots.txt",
  "contact_org": "equipo@example-app.org",     // org-level only, never a person
  "events": ["<registry event id>"],
  "status": "active",                          // active | archived
  "sunset_at": null,
  "added": "2026-08-16",
  "review_pr": "https://github.com/Cabuya/website/pull/42"
}
```

Note what is **absent**: any measured field. The registry file records what the
publisher *claims* and what a human reviewer *checked about identity*. Everything
about conformance is written by the validator, never by hand — this is the
`AquíAyuda` lesson from `PROTOCOL_DESIGN.md` §8 made structural: *manifests lie,
behavior doesn't*.

**Measured status** lives in KV, keyed `status:{publisher_id}`:

```jsonc
{
  "publisher_id": "example-app",
  "measured_level": "L2",
  "badge_state": "conforming",
  "checked_at": "2026-08-16T06:00:00Z",
  "feed_last_updated": "2026-08-16T04:00:00Z",
  "ttl": 300,
  "spec_version": "0.1.0",
  "profile": "core",
  "errors": 0, "warnings": 2,
  "failing_checks": [],
  "validator_version": "0.1.4"
}
```

**Badge states** (from `PROTOCOL_DESIGN.md` §8, with the operational definition
each one needs to be computable):

| State | Computed when | Portal treatment |
|---|---|---|
| `conforming` | Validator passes at the measured level, `last_updated` within 7 × `ttl` | Green; badge served |
| `stale` | Validator passes but `last_updated` older than 7 × `ttl` | Amber; badge served **with the age rendered**, because staleness is information, not failure |
| `unreachable` | Transport failure (DNS, TLS, timeout, 5xx) on two consecutive scheduled runs ≥ 1 h apart | Grey; badge shows `unreachable`; the entry is **not** removed |
| `failing` | Validator returns errors | Red; the failing check ids are listed on the publisher page with links to their fix docs |
| `archived` | `status: archived` in the registry entry, or a manifest `sunset_at` in the past | Neutral; records are marked historical; `publisher_id` never reassigned |

**Two consecutive failures before flipping to `unreachable`** matters: volunteer
infrastructure has bad afternoons, and a registry that publicly marks a team red
for a five-minute outage teaches teams to leave the registry.

**Scheduled re-validation** — GitHub Actions cron, every 6 hours:

1. Read `registry/publishers/*.json` (active only).
2. For each, run `Cabuya-validator` against the manifest, then each feed.
   Concurrency 4, per-host serial, 30 s budget per publisher.
3. Write results to KV via the Cloudflare API.
4. Append one line per publisher to `registry/history/YYYY-MM.jsonl` and open a
   **single daily** bot PR with that day's appended lines (auto-merged by a
   maintainer-approved workflow). Daily, not 6-hourly, so the git history stays
   human-readable while the public audit trail stays complete.
5. On a transition to `failing` or `unreachable`, open (or update) a GitHub issue
   tagged `registry:status` naming the publisher and the failing check ids — the
   conversation-first escalation `GOVERNANCE_AND_LICENSING.md` §5.5 describes.

**Badge endpoint:** `GET /badge/{publisher_id}.svg` (Pages Function, KV-backed,
`Cache-Control: public, max-age=900, stale-while-revalidate=3600`). Renders
`Compatible con Cabuya 1.0` / `Cabuya 1.0 compatible` per an
`?lang=` parameter, colour by state, and **always version-scoped** — never a bare
name, never the word *certificado* (`BRAND_AND_NAMING.md` §7.3,
`GOVERNANCE_AND_LICENSING.md` §5.2). A `?style=flat` variant matches shields.io
conventions so it sits naturally in a README. Clicking it lands on
`/registry/{publisher_id}`, where the measurement behind it is visible — that
link is what makes the badge falsifiable, and a falsifiable badge is the only
kind worth wearing.

**Printed on the registry index, in both languages:** *inclusion is not
endorsement*, and *each entry shows the last validation timestamp and result*.

### 2.9 Quality gates and CI

Inherited (identical scripts, adapted content rules): `md:check(:strict)`,
`lang:check(:strict)`, `seo:check(:strict)`, `parity:check(:strict)`,
`redirects:check(:strict)`, `biome:check`, `astro:check`, `test`.

New, specific to this repo:

| Gate | What it asserts | Fails the build when |
|---|---|---|
| `spec:check` | Every schema lints against JSON Schema 2020-12; every `$id` is absolute and version-matched (B5); **every `examples/*/valid/*` passes the validator and every `examples/*/invalid/*` fails with exactly the check ids its `$comment` names** | A schema change silently breaks a teaching example — the single most likely spec regression |
| `spec:boundary` | The B1–B7 rules of §1.3 | The spec directory grows a dependency on site code |
| `registry:check` | Every publisher entry validates; `publisher_id` unique and never reused; canonical URLs unique across entries and aliases; no personal-looking contact | A registry PR would break the badge cron |
| `checks:catalogue` | Every check id emitted by the validator has a documentation page and a spec anchor, and vice versa | An error message points at a page that does not exist — the fastest way to make an agent loop useless |
| `links:check` | Internal links and spec anchors resolve; external links resolve weekly (advisory, never blocking a PR) | A normative anchor moved |
| `a11y:check` | Playwright + axe on eight representative routes | A new component ships a contrast or landmark regression |

**CI matrix** (GitHub Actions): `ci.yml` on every PR — install → biome → astro
check → unit tests → `spec:check` → `spec:boundary` → `registry:check` → build →
the five content gates in `:strict` → a11y smoke. `revalidate.yml` on the 6-hour
cron. `release.yml` on tag: publish `Cabuya-validator` to npm with
provenance, attach the conformance suite as a release artifact, update
`/changelog`. **DCO check required on every PR** (governance §4.3).

### 2.10 SEO, AEO and the agent surface

- Every page has a `.md` twin under the completeness contract (`coverage ≥ 0.85`,
  required sections present, one language per page, absolute-path links, one Site
  Navigation block).
- **The spec's twins are the source files** — `/developers/spec/0.1/3-the-feed.md`
  is the same Markdown CI validated, with a front block prepended. This is the
  cheapest correct outcome and it makes drift structurally impossible.
- `llms.txt` lists the portal's map; `llms-full.txt` inlines the current spec
  version, the quickstart and the check catalogue — so an agent that fetches one
  file has the whole protocol.
- JSON-LD: `TechArticle` on spec sections, `SoftwareSourceCode` on the schema
  pages, `Dataset` on `/registry` (it is one — CC0, with a distribution URL),
  `BreadcrumbList` sitewide, `FAQPage` on the FAQ.
- `hreflang` pairs for every ES/EN route; canonical always to the HTML; versioned
  spec URLs are canonical to themselves, never to "latest" — a normative document
  that silently changes under its own URL is a standards-project failure.
- `robots.txt` allows the AI crawlers this repo allows, and the registry and spec
  are explicitly crawlable. The site's own `permitted_use` for registry data is
  CC0, stated in `llms.txt`.
- Meta descriptions 130–160 characters, composed from content, not hand-tuned.

---

## 3. `cabuya-skill` — the agent pack

> The skill is not a convenience. `APPS_MATRIX.md` says 9 of 20 apps are an
> afternoon from a conforming feed and the rest are days — but only if someone has
> the afternoon. The skill is the mechanism that converts "an afternoon of a
> volunteer's time" into "twenty minutes of an agent's time plus one human
> decision". It is the highest-leverage product in this blueprint.

### 3.1 Conventions extracted from the vendored packs — named, with paths

| Convention | Source | How it lands |
|---|---|---|
| **Router `SKILL.md` that routes and does nothing else** | `.agents/skills/deepworkplan/SKILL.md` ("This is the **router**. It does not run any flow itself") | Same. The root skill maps intent → sub-skill and says "read that sub-skill's `SKILL.md` and execute it there". |
| **Intent-routing table** | `.agents/skills/dailybot/SKILL.md` § "For the agent — routing rules"; `deepworkplan/SKILL.md` § routing | Same two-column table: *Developer says…* → *Route to*, with quoted natural-language triggers in **both languages** (the ecosystem's developers speak Spanish). |
| **Versioned frontmatter** | Both packs: `name`, `description`, `version`, `documentation_url`, `user-invocable`, `allowed-tools`, `metadata.openclaw` | Same fields, plus one addition: **`metadata.protocol.supported_spec_versions`** (§3.6). |
| **Sub-skill naming** | `deepworkplan-create`, `deepworkplan-verify`, … | `Cabuya-implement`, `-consume`, `-validate`, `-publish-status`, `-setup`. |
| **`shared/` with a context script** | `deepworkplan/shared/context.sh`, `dailybot/shared/context.sh` — both emit single-line JSON, both Bash 3.2-safe, both document a manual fallback | `shared/context.sh` emits `{"repo","repo_root","branch","agent_tool","stack","framework","manifest_path","spec_version"}` — repo context **plus** detected stack, because every sub-skill's first question is "what am I working on?". |
| **`shared/*.md` reference notes** | `dailybot/shared/{auth,env-json,http-fallback,list-query-and-errors,repo-profile}.md` | `shared/{validator,pii-deny-list,crawl-policy,stack-detection,error-codes,paths}.md` — each read by several sub-skills, none duplicated. |
| **`spec/` shipped inside the skill** | `deepworkplan/spec/` (five RFC-2119 documents, so "an agent has the standard locally, no network required") | `spec/` = the vendored, read-only protocol contracts (§3.5). This is the single most important structural borrowing in this blueprint. |
| **`examples/`** | `deepworkplan/examples/` (templates an agent copies from) | `examples/` = the five worked examples plus per-stack serializer sketches. |
| **`TRUST.md`** | Both packs ship one: what the skill will and will not do on your machine, plus a self-audit | Same, and stricter — the skill touches production data pipelines and PII decisions. |
| **Addon pattern** | `deepworkplan/addons/README.md` — four rules (never required, reconcile don't clobber, reason don't copy-paste, archetype-agnostic) and a four-component contract (`SPEC.md`, `templates/`, `SKILL.md` hook, validation step) | Two addons planned: `ci-gate` (adds feed validation to the adopter's CI) and `mcp-bridge` (exposes the adopter's feed as a product MCP). Both opt-in; declining leaves a fully working skill. |
| **Consent-first posture** | DailyBot: CLI install, hooks and email sends all require explicit confirmation | Every write to the adopter's repo, every network fetch of a third-party feed, and **every PII decision** requires confirmation. |
| **Cross-agent install** | `dailybot/setup.sh` auto-detects agents; `npx skills add …`; six install methods | §3.9. |
| **"Reason, do not copy-paste"** | `deepworkplan/shared/adaptation.md` — the overriding rule of that pack | Inherited as the skill's first principle: the serializer the agent writes is adapted to the app's real schema; the *shape* is fixed, the *content* is reasoned. |

### 3.2 Repo layout

```
cabuya-skill/
├── SKILL.md                    # router · frontmatter · routing table · install
├── TRUST.md                    # what it will and will not do; self-audit
├── implement/                  # take an app to L1/L2/L3
│   ├── SKILL.md
│   ├── stacks/                 # nextjs.md · vite-spa.md · laravel.md · php.md
│   │                           # django.md · supabase.md · firebase.md · static.md
│   ├── mapping/                # field-crosswalk.md · divipola.md · place-kind.md
│   └── templates/              # manifest.json · serializer sketches per stack
├── consume/
│   ├── SKILL.md
│   └── rules.md                # the six consumption MUSTs, as a checklist
├── validate/SKILL.md
├── publish-status/SKILL.md     # manifest level, sunset, registry PR
├── setup/SKILL.md              # doctor: toolchain, validator, paths, network
├── shared/
│   ├── context.sh              # single-line JSON; Bash 3.2-safe; manual fallback
│   ├── validator.md            # resolution order, exit codes, offline mode
│   ├── pii-deny-list.md        # the deny patterns + the human-decision gate
│   ├── crawl-policy.md         # never fetch from a publisher reserving reuse
│   ├── stack-detection.md
│   ├── error-codes.md          # check-id → cause → fix, mirrored from the portal
│   └── paths.md
├── spec/                       # VENDORED · read-only · checksummed
│   ├── VERSION                 # e.g. 0.1.0
│   ├── CHECKSUMS.txt
│   ├── PROTOCOL_SUMMARY.md     # the "already knows the protocol" payload
│   ├── schemas/*.schema.json
│   └── EXCLUSIONS.md           # §7 of the spec, verbatim — the lines that don't move
├── examples/{valid,invalid}/*.json
├── addons/{ci-gate,mcp-bridge}/
├── bin/run-validator.sh        # the resolution-order runner (§3.5)
├── scripts/sync-spec.sh        # pull spec@vX → spec/ + regenerate CHECKSUMS
├── docs/{INSTALLATION,DESIGN,COMPATIBILITY,ACCEPTANCE_TEST}.md
├── setup.sh                    # multi-agent installer
├── CHANGELOG.md  LICENSE (Apache-2.0)  README.md
└── .github/workflows/ci.yml    # lint md · verify checksums · run acceptance test
```

### 3.3 Router `SKILL.md`

Frontmatter:

```yaml
name: Cabuya
description: >
  Cabuya — the open format that lets aid apps publish and read the same
  data. Implement a conforming feed in your app, consume peers' feeds, validate
  conformance locally, publish your conformance level, and set up the toolchain.
  Routes to implement / consume / validate / publish-status / setup by intent.
  Use when the developer mentions Cabuya, a place feed, a conformance
  level, or wants their app to interoperate with the aid ecosystem.
version: "0.1.0"
documentation_url: https://Cabuya.org/developers
user-invocable: true
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
metadata:
  openclaw: { emoji: "🪢", homepage: "https://Cabuya.org",
              requires: { anyBins: ["node", "git"] } }
  protocol: { supported_spec_versions: ["0.1"], vendored_spec: "0.1.0" }
```

Body, in this order (the DailyBot/DeepWorkPlan shape):

1. **What this is** — three sentences, the elevator pitch, the licence, the source
   of truth URL.
2. **Start here (first run)** — self-sufficient, no network required: read
   `spec/PROTOCOL_SUMMARY.md`, run `shared/context.sh`, then `setup/SKILL.md` if
   the validator is missing. Explicitly: *the skill is useful with zero network*.
3. **Routing rules** — the table below.
4. **The five rules that never bend** — a short block, before any procedure,
   because these are the ones an agent must not reason its way around:
   no person-level data, no contact values in feeds, no scraping, honour crawl
   policy, never claim conformance the validator has not measured.
5. **Install** + **cross-agent invocation** (`/` vs `#`).
6. **Compatibility matrix** (§3.6) and a link to `TRUST.md`.

| Developer says… | Route to |
|---|---|
| "implement Cabuya", "publica un feed", "expose our shelters", "get us to L2" | **Implement** → `implement/SKILL.md` |
| "consume peers", "lee los feeds de las otras apps", "show other apps' collection points" | **Consume** → `consume/SKILL.md` |
| "validate", "valida el feed", "is my feed conforming?", "why is my badge red?" | **Validate** → `validate/SKILL.md` |
| "publish our level", "update the manifest", "abre el PR del registro", "we're shutting down" | **Publish-status** → `publish-status/SKILL.md` |
| "set up", "doctor", "no me corre el validador", "install the toolchain" | **Setup** → `setup/SKILL.md` |
| "what is Cabuya?", "explain the ladder", "what does L3 require?" | Answer from `spec/PROTOCOL_SUMMARY.md` — **do not route**; this is the one case the router answers directly, because it is the whole point |

### 3.4 The sub-skills

#### `implement` — take an app from L0 to L2 (or L3)

| Phase | Steps | Guardrails |
|---|---|---|
| **0. Read** | Run `shared/context.sh`. Detect stack via `shared/stack-detection.md` (framework, ORM/DB, hosting, existing public endpoints, whether an SPA catch-all exists). Read the app's data model. | Read-only. No file is written in phase 0. |
| **1. Map** | Build the field crosswalk: app fields → `place`. Use `mapping/field-crosswalk.md` (seeded with the real mappings from `ENTITY_MODEL.md`), `mapping/place-kind.md` (category crosswalk), `mapping/divipola.md` (municipality → DIVIPOLA code). Produce a **mapping table shown to the human before any code**. | Every unmapped required field is named. `last_confirmed_at` maps to a real confirmation event or is `null` — never to `updated_at` (CR-1). |
| **2. PII gate** | Run the deny-list (`shared/pii-deny-list.md`) over every candidate column and every free-text field. Present the flagged columns. **Stop and ask.** | This is the one **mandatory human decision** of the flow (`PROTOCOL_DESIGN.md` §11 step 2). The agent may not proceed on its own judgement. |
| **3. Serialize** | Write the feed generator — a route handler, a build-time export, or a cron job — from `templates/` adapted to the stack. Envelope first, records second. `public_url` per record. | Never invents data. A field the app does not have is omitted (Extended) or the record is reported as non-conforming (Core). `last_updated` is generated at build/publish time, **never per request** (BEH002). |
| **4. Discover** | Write the manifest to `/.well-known/cabuya.json`; add the SPA catch-all exclusion (one line, per stack); check `robots.txt` returns 200 `text/plain`; add the `<link rel>` fallback. | The soft-404 trap is checked *here*, not left to the validator. |
| **5. Loop** | Run the validator (§3.5) → parse the JSON report → fix → repeat. Max 8 iterations, then stop and summarize what remains and why. | The loop halts on `PII` errors and asks a human. It never "fixes" a PII error by widening the deny-list. |
| **6. Hand off** | Print the diff summary, the measured level, remaining warnings, and the exact next step (`publish-status`). | Never opens a PR to the adopter's repo without asking. |

**Outputs:** a feed endpoint or generated file, a manifest, a config change, a
`Cabuya.md` note in the adopter's docs, and a green validator report.

#### `consume` — read the network without breaking its rules

Steps: resolve the registry (bundled snapshot, refreshed if online) → filter by
declared `permitted_use` and crawl policy → fetch manifests → fetch feeds honouring
`ttl` → parse → **dedupe by claim** (`same_as` one-hop, non-transitive; plus
accent-folded address + DIVIPOLA matching, never raw display names) → render.

The six consumption MUSTs of `PROTOCOL_DESIGN.md` §4.3 become a checklist the
sub-skill verifies in the code it writes, each with a self-test:

| Rule | What the skill generates | Self-test |
|---|---|---|
| Attribute | Source publisher rendered on every foreign record | A grep-able assertion in the generated component's test |
| Show age | `last_confirmed_at` age, or *"sin confirmar"* for `null`; visual de-emphasis past 7 days or `contradictions_active > 0` | Unit test with three fixture records |
| Not mutate | Foreign records stored read-only; enrichments in the consumer's own records with `same_as` | Type-level: the foreign record type has no setters |
| Preserve chains | Republishing keeps the original `source{}`; own identity in the envelope `publisher_id` | Fixture round-trip test |
| Dedupe by claim | Clusters published as the consumer's own records, never as authority | Documented in the generated code's header |
| Respect exclusions | No join with person-level sources; no fetch from reuse-reserving publishers | The fetch layer refuses those hosts by construction |

#### `validate` — conformance, locally, in the loop

Thin by design: resolve the validator (§3.5), run it, **parse the JSON report,
not the text**, and present results grouped by *what to do next*: blockers for the
current target level first, then warnings, then the next level's requirements.
Supports `--no-network` (schema + PII passes over a local file), which is how an
agent works on a feed before it is deployed.

#### `publish-status` — the manifest is a claim; keep it honest

Updates `conformance_target`, `feeds[]`, `api{}`, `mcp{}`, `license`,
`permitted_use[]`, `languages[]`. Opens the registry PR (a real `gh pr create`
against `Cabuya/website`, with the entry JSON generated and validated
locally first). Handles **orderly wind-down** (`PROTOCOL_DESIGN.md` §7.4): set
`sunset_at`, freeze feeds with a final `last_updated`, and either name a custody
transfer or declare records archived. Refuses to set a `conformance_target` above
the level the validator last measured, and says why.

#### `setup` — the doctor, in the DailyBot style

Checks, in order, each with a fix: Node ≥ 24 present · validator resolvable (§3.5)
· vendored spec checksums intact · network reachability to the registry (and an
explicit "offline is fine, here is what still works") · git identity for the
registry PR · `gh` present if a PR is wanted · agent-specific install path correct
(`.agents/skills/` + `.claude` symlink, or the vendor's directory). Ends with a
one-screen status table. Idempotent, safe to re-run — the same promise this repo's
`/setup` command makes.

### 3.5 How the validator ships inside the skill

The skill does not bundle a copy of the validator's code. It bundles the
**contracts** (schemas + summary + examples) and a **runner** with a resolution
order:

| Order | Source | When |
|---|---|---|
| 1 | `$PROTOCOL_VALIDATOR_BIN` if set | Air-gapped or pinned environments |
| 2 | A local `node_modules/.bin/Cabuya-validator` in the adopter's repo | Once `ci-gate` addon or a dev dependency is installed |
| 3 | `npx --yes Cabuya-validator@^{major}.{minor}` | Default; version range pinned to the vendored spec version |
| 4 | **Degraded offline mode** — the skill validates against `spec/schemas/*.json` and runs the PII deny-pattern pass itself, and **says loudly that behavioral probes (soft-404, always-now, CORS) were not run** | No network, no install rights |

Degraded mode never reports "conforming". It reports "schema-valid; conformance
unmeasured" — because the whole protocol rests on conformance being measured
(`PROTOCOL_DESIGN.md` §8), and a skill that blurred that line would undermine the
thing it exists to spread.

`shared/validator.md` documents the exit codes (§4.6) and the JSON report shape so
every sub-skill parses the same structure.

### 3.6 Versioning: skill versions vs spec versions

Two independent SemVer streams with a declared compatibility matrix — the mistake
to avoid is a skill whose version number implies a spec version.

| Rule | Statement |
|---|---|
| V1 | The skill's `version` is its own. It never mirrors the spec version. |
| V2 | `metadata.protocol.supported_spec_versions` lists every spec MINOR the skill can implement and validate against; `vendored_spec` names the exact copy in `spec/`. |
| V3 | Adding support for a new spec MINOR is a skill **MINOR** bump. |
| V4 | Dropping support for a spec MAJOR is a skill **MAJOR** bump — and may not happen inside the spec's 180-day producer window (`PROTOCOL_DESIGN.md` §8). |
| V5 | The skill supports at most **two spec MAJORs** at once, matching the spec's own rule. |
| V6 | `scripts/sync-spec.sh` is the only writer of `spec/`; CI verifies `CHECKSUMS.txt` on every PR. A hand-edited vendored schema fails the build. |
| V7 | The skill's `CHANGELOG.md` states, for every release, which spec versions it supports — so an adopter reading one file knows whether it applies to them. |

Compatibility is published at `/developers/skill#compatibility` and in
`docs/COMPATIBILITY.md`:

| Skill | Vendored spec | Supports | Validator range |
|---|---|---|---|
| 0.1.x | 0.1.0 | 0.1 | `^0.1` |
| 0.2.x | 0.2.0 | 0.1, 0.2 | `^0.2` |

### 3.7 The PII guardrails, inside the skill

The skill is the piece that touches real production databases. Its exclusions are
not advisory:

1. **Deny-list before mapping.** Column names, JSON keys and free-text fields are
   screened against `shared/pii-deny-list.md` (name, nombre, apellido, phone,
   telefono, celular, whatsapp, email, correo, cedula, documento, direccion_casa,
   foto, photo, contacto, responsable, plus regexes for Colombian phone shapes and
   email addresses). Matches are **surfaced, never auto-resolved**.
2. **Free text is the third leak channel** (`PROTOCOL_DESIGN.md` §7.1). The skill
   scans `description` / `warning_text` for name+phone patterns and refuses to
   publish until they are stripped — which is exactly the check
   `invalid-2-contact-and-personal-data.json` teaches.
3. **Entity-scoped grants.** If the app holds both places and person-level data
   (four apps do), the skill federates only the non-person entities, and only from
   surfaces that do not co-serve person data. It will not generate a feed endpoint
   that shares a route prefix or an auth context with a person-data endpoint.
4. **Join prohibition.** `consume` refuses to write code that joins protocol data
   with a person-level source, and says which rule it is refusing under.
5. **Crawl policy.** Before any fetch of a third party, `shared/crawl-policy.md` is
   consulted; a publisher whose declared policy reserves reuse is never fetched,
   even if a human asks — the skill explains and offers the link-out instead.
6. **No moderation verdicts travel.** Suppressed records are omitted, never
   labelled downstream (the defamation-shaped risk, spec §7.3).

### 3.8 The acceptance test: "any agent installs it and already knows the whole protocol"

A claim that cannot fail is marketing. This one is a procedure, in
`docs/ACCEPTANCE_TEST.md`, run in CI on every skill release.

**Setup:** a fresh agent session, **network disabled**, an empty repo, the skill
installed at `.agents/skills/Cabuya/`. No other context. The agent may
read only skill files.

**Part A — knowledge (10 questions, machine-checkable against a key).** Each
answer must be correct *and* must cite the skill file it came from.

| # | Question | Correct answer must contain |
|---|---|---|
| 1 | What are the five conformance levels and what does each require? | L0 listed · L1 manifest+links · L2 conforming feed · L3 read API/live feeds + consumes a peer · L4 accepts writes |
| 2 | Where does a publisher put its manifest, and what is the fallback? | `/.well-known/cabuya.json`; any stable HTTPS path declared in the registry + `<link rel>` |
| 3 | Why is `200 + text/html` at a discovery path treated as absent? | The soft-404 rule; byte-size equality against `/` as discriminator |
| 4 | What is the record id format and why? | `{publisher_id}:{local_id}`; globally unique with zero coordination |
| 5 | What must never travel in a feed? | Person-level data; contact values; moderation verdicts |
| 6 | What is the difference between `updated_at` and `last_confirmed_at`? | An edit is not a confirmation (CR-1); they do not interconvert |
| 7 | What does an omitted `last_confirmed_at` mean vs `null`? | Omission is non-conforming; `null` is the honest "never confirmed" |
| 8 | Name the two production anti-patterns the validator probes for. | Status encoded in `name` (CR-2); always-now `last_updated` |
| 9 | What are the six consumption MUSTs? | Attribute · show age · not mutate · preserve chains · dedupe by claim · respect exclusions |
| 10 | Which envelope fields are required, and which one is the non-obvious MUST? | `last_updated`, `ttl`, `version`, `publisher_id`, `license`; CORS `Access-Control-Allow-Origin: *` |

**Part B — capability (3 tasks, offline).**

| Task | Pass condition |
|---|---|
| B1 | Given a 6-column `albergues` table definition, produce a complete field mapping to `place`, flag the two PII columns, and stop for human confirmation | Mapping complete; both PII columns flagged; the agent **stops** |
| B2 | Given `invalid-2-contact-and-personal-data.json`, name every violation and the rule behind each | All three violations, each with its `§7` reference |
| B3 | Produce a minimal conforming manifest + one-record feed for a fictional app, then validate them in degraded offline mode | Schema-valid; the agent reports "schema-valid, conformance unmeasured", not "conforming" |

**Pass bar: 10/10 on Part A and 3/3 on Part B.** Anything less blocks the release.
Part A is graded by string-match against a key; Part B by the validator plus two
assertions on the transcript (did it stop at the PII gate; did it avoid claiming
conformance). The test runs against at least two different agent harnesses before
a MINOR release — the cross-agent claim is only true if it has been observed twice.

### 3.9 Install and cross-agent invocation

**Install** — four supported paths, mirroring the DailyBot pack's approach without
inventing a registry the project does not run:

```bash
# 1. Vendored (recommended for a team repo — reviewable, pinned, offline)
git clone --depth 1 https://github.com/Cabuya/skill \
  .agents/skills/Cabuya && rm -rf .agents/skills/Cabuya/.git
ln -s .agents .claude    # if the repo does not already have it

# 2. Installer script (auto-detects which agents are present)
curl -fsSL https://Cabuya.org/skill/install.sh -o install.sh
# verify the SHA-256 sidecar, read it, then run it
bash install.sh

# 3. Skills CLI, if the developer already uses one
npx skills add Cabuya/skill

# 4. HTTP-only fallback for an agent with no filesystem
# point the agent at https://Cabuya.org/skill.md (the router, inlined)
```

The install page never prints a `curl … | bash` one-liner as the recommended path,
and the skill's own docs repeat the DailyBot warning about why: a truncated
download executes a partial script, and without `pipefail` a failed fetch exits 0
and installs nothing, silently.

**Invocation across agents** (this repo's `CLAUDE.md` convention, and the packs'):

| Agent | Prefix | Example |
|---|---|---|
| Claude Code | `/` native | `/Cabuya-implement` |
| OpenAI Codex · Cursor · Gemini · Copilot · Cline · Windsurf · OpenClaw | `#` | `#Cabuya-implement` |
| Any | plain language | "implementa Cabuya en esta app" |

`#` exists because most CLIs intercept `/` as their own command namespace. Every
sub-skill is `user-invocable: true`, so each is reachable directly, and the router
is reachable by name.

---

## 4. The validator — one engine, four harnesses

> This is the heart of the product set. Conformance is *"passing the published
> validator, never self-declaration"* (`PROTOCOL_DESIGN.md` §8), which makes the
> validator the only place where the protocol is actually enforced — and its error
> messages the interface through which most implementations will be written,
> because most implementations will be written by agents.

### 4.1 One core, four harnesses

| Harness | Entry point | Runtime | Adds |
|---|---|---|---|
| **CLI** | `Cabuya-validator` (npm bin) | Node ≥ 24 | TTY formatting, `--watch`, file input, stdin |
| **CI** | `Cabuya/validate-action@v1` + the `ci-gate` skill addon | Node in GitHub Actions | SARIF output → code-scanning annotations, PR comment, exit-code gating |
| **Portal** | `functions/api/validate.ts` | Cloudflare Workers | SSRF guards, rate limits, no retention (§2.7) |
| **Scheduled re-validation** | `revalidate.yml` cron | Node in Actions | Concurrency, per-host politeness, KV write, badge transitions, issue filing |

**The core is identical in all four** — same checks, same ids, same messages, same
severity. A publisher who fixes what the CLI said has fixed what the badge
measures. That property is worth more than any individual feature, so it is a
test: `tests/parity/` runs the same 40-case corpus through the Node harness and
the Workers harness and asserts byte-identical JSON reports.

### 4.2 Language and runtime

**TypeScript**, compiled to ESM, **zero Node-only APIs in the core** (`fetch`,
`TextDecoder`, `crypto.subtle` only), so one bundle runs in Node, Workers, Deno,
Bun and the browser.

| Alternative | Why not |
|---|---|
| **Go** | A single static binary is genuinely attractive for CLI distribution. But it cannot run in a Cloudflare Worker or in the browser without a WASM build, which would mean two implementations or a heavyweight compile step — and *one engine, four harnesses* is the property that makes conformance trustworthy. It would also be a second toolchain for an ecosystem that `APPS_MATRIX.md` shows is overwhelmingly JS/TS. |
| **Python** | Matches one publisher's generator (PereiraAyuda) but not the ecosystem, and the browser/Worker harnesses are out. |
| **Rust → WASM** | Fastest and the most portable target, but the build and the contributor barrier are wrong for a volunteer project whose validator must accept drive-by check contributions (§6.7). Revisit if feed sizes ever make performance a real constraint — at 10 000 records they do not. |

**Dependencies, deliberately few:** one JSON Schema 2020-12 validator (Ajv, with
`$data` and formats), and nothing else in the core. Every dependency is a supply-chain
surface on a tool that other people run against their own infrastructure.

### 4.3 Pipeline

```
input (URL | file | stdin | JSON string)
  │
  ├─ 1. RESOLVE     registry entry? manifest? feed? — decide what was given
  ├─ 2. FETCH       transport probe: status, headers, byte size, timing, redirects
  ├─ 3. PARSE       JSON parse with byte offsets preserved for error locations
  ├─ 4. SCHEMA      JSON Schema 2020-12 (manifest.schema.json / place-feed.schema.json)
  ├─ 5. SEMANTIC    rules a schema cannot express (locator rule, id namespace,
  │                 status-in-name, license/permitted_use coherence, same_as one-hop)
  ├─ 6. DENY        PII / contact deny-pattern pass over keys AND free text
  ├─ 7. BEHAVIOR    soft-404, always-now double-probe, CORS, ttl sanity,
  │                 static≡API equivalence, shard consistency
  ├─ 8. LEVEL       compute the highest level met + the blockers for the next one
  └─ 9. REPORT      text | json | sarif | markdown
```

Passes 4–7 always all run — the validator never short-circuits after the first
failure. An agent fix loop that gets one error per run takes eight runs; one that
gets the full list takes one. **Completeness of the report is a feature, not a
courtesy.**

### 4.4 Check catalogue

Ids are stable forever. A check may be deprecated, never renumbered — messages are
quoted in issues, commits and agent transcripts. Severity: **E** error (blocks the
level), **W** warning (does not block), **I** info.

| Id | Sev | Level | Checks |
|---|---|---|---|
| `DSC001` | E | L1 | Manifest reachable over HTTPS with `Content-Type: application/json` |
| `DSC002` | E | L1 | **Soft-404**: `200 + text/html` at a discovery path is treated as absent; byte-size equality against `/` is the discriminator (§4.8) |
| `DSC003` | W | L1 | `robots.txt` returns 200 `text/plain` |
| `DSC004` | W | L1 | Manifest at the RECOMMENDED `/.well-known/cabuya.json`, or a `<link rel>` advertisement present |
| `DSC005` | E | L1 | Manifest validates against `manifest.schema.json` |
| `DSC006` | E | L1 | `publisher.canonical_url` matches the registry entry (when validating a registered publisher) |
| `DSC007` | E | L1 | Every `feeds[].url` is absolute HTTPS and reachable |
| `DSC008` | W | L1 | `crawl_policy_url` resolves |
| `DSC009` | E | L1 | `conformance_target` is a declaration; it MUST NOT exceed what this run measures — reported as a mismatch, not as the level |
| `ENV001` | E | L2 | Envelope validates: `last_updated`, `ttl`, `version`, `publisher_id`, `license` present and well-typed |
| `ENV002` | E | L2 | `last_updated` is RFC 3339 with a UTC offset |
| `ENV003` | E | L2 | `license` present (an unlicensed feed does not conform — governance §4.4) |
| `ENV004` | W | L2 | `license` is an SPDX id, or `license_url` accompanies a non-SPDX string |
| `ENV005` | W | L2 | `permitted_use[]` present; values within the closed enum |
| `ENV006` | E | L2 | `version` is a supported spec version (within 2 MAJORs) |
| `ENV007` | E | L2 | `Access-Control-Allow-Origin: *` present — the one non-obvious MUST |
| `ENV008` | W | L2 | `ttl` is a positive integer and plausible (1–86400) |
| `ENV009` | W | L2 | Feed ≤ 5 MB and ≤ 10 000 records, or shards declared in the manifest |
| `ENV010` | I | L2 | `Content-Type: application/json`, UTF-8 |
| `REC001` | E | L2 | `last_confirmed_at` **key** present on every record (`null` is legal; omission is not) |
| `REC002` | E | L2 | `id` matches `{publisher_id}:{local_id}` shape, or the record's `publisher_id` + `id` pair resolves to it |
| `REC003` | E | L2 | Record `publisher_id` never mints in another publisher's namespace (R9) |
| `REC004` | E | L2 | Locator rule: `address_text` **or** `lat`+`lon` present |
| `REC005` | W | L2 | Both locators present (RECOMMENDED) |
| `REC006` | E | L2 | `public_url` present and absolute |
| `REC007` | E | L2 | `place_kind` within the enum |
| `REC008` | W | L2 | `municipality_code` is a valid DIVIPOLA code |
| `REC009` | E | L2 | `source{}` present with `source_id` |
| `REC010` | E | L2 | **CR-2**: `name` contains no operational-state token (`cerrado`, `lleno`, `abierto`, `inactivo`, `closed`, `full`, …) |
| `REC011` | W | L2 | `name` and `lifecycle_status`/`service_status` do not contradict each other |
| `REC012` | E | L2 | `updated_at` ≠ semantic reuse of `last_confirmed_at` (CR-1): both present and distinct where both are published |
| `REC013` | W | L2 | `expires_at` set on inherently temporary place kinds |
| `REC014` | W | L2 | `same_as[]` entries are fully-qualified ids, one-hop (no transitive chains) |
| `REC015` | E | L2 | Unknown members preserved, not rejected (extensibility, verdict H) — the validator itself must not fail on them |
| `REC016` | W | L2 | `x_` extensions are namespaced `x_{publisher}_{field}` |
| `REC017` | W | L2 | `es` baseline present for localized strings |
| `REC018` | E | L2 | Duplicate `id` within one feed |
| `PII001` | E | any | A contact value (phone, email, WhatsApp, messenger handle) appears in any field, **including namespaced extensions** |
| `PII002` | E | any | `confirmed_by` is a role token, never a personal name |
| `PII003` | E | any | Free text (`description`, `warning_text`) matches a personal-data pattern (name + phone, national id, email) |
| `PII004` | E | any | A person-level entity appears (missing person, case, individual beneficiary) |
| `PII005` | W | any | A field name matches the deny-list even if the value looks clean |
| `PII006` | E | any | A moderation verdict about a third party is republished |
| `BEH001` | E | L2 | Feed reachable on two probes; content-type stable |
| `BEH002` | E | L2 | **Always-now**: `last_updated` advanced with the probe clock while the content hash was unchanged (§4.8) |
| `BEH003` | W | L2 | `last_updated` older than 7 × `ttl` → the `stale` badge state |
| `BEH004` | W | L2 | Per-shard `lastmod` present (the incremental-sync pattern) |
| `BEH005` | E | L2 | Declared shards all reachable and consistent in envelope fields |
| `API001` | E | L3 | Read API base reachable; envelope identical in shape to the feed |
| `API002` | E | L3 | **Static ≡ API**: the same record is byte-compatible from both surfaces |
| `API003` | E | L3 | `cursor` pagination present and ordered on a server sequence, not a timestamp (offline-queue evidence) |
| `API004` | W | L3 | Documented parameters accepted: `municipality`, `kind`, `bbox`, `updated_since`, `limit`, `cursor` |
| `API005` | E | L3 | CORS `*` on the API, no auth required for reads |
| `API006` | E | L3 | Consumes ≥ 1 peer feed — evidenced by the manifest's declaration and a registry cross-check (self-declared portion flagged `I` with a note that it is the one L3 requirement a probe cannot fully measure) |
| `WRT001` | E | L4 | `POST` accepts the `{source, external_id, place}` envelope |
| `WRT002` | E | L4 | Idempotency on (`source`, `external_id`): a replay returns 201 and does not duplicate |
| `WRT003` | E | L4 | 409 on an id conflict outside the sender's namespace |
| `WRT004` | E | L4 | In `auth: none` mode, a moderation state is echoed (`received`/`published`/`held`) and rate limiting is observable |
| `WRT005` | E | L4 | Republished records carry `source.source_id` = the original sender |
| `LIC001` | W | any | Declared licence is not share-alike (share-alike poisons aggregation — governance §4.4) |
| `LIC002` | I | any | `attribution` string present for aggregators to display |

Every id has a page at `/developers/validator/checks#{id}` — and the
`checks:catalogue` gate (§2.9) fails the build if one does not.

### 4.5 Error messages designed for an agent fix loop

**The seven rules**, each with the failure mode it prevents:

| # | Rule | Prevents |
|---|---|---|
| M1 | **Locate precisely** — JSON Pointer (`data.places[0].last_confirmed_at`) plus byte offset / line-column when the input is a file | The agent guessing which record broke |
| M2 | **State the rule, not just the violation** — one clause naming what the protocol requires | A fix that satisfies the message but not the spec |
| M3 | **Name the fix, imperatively** — "move it to `service_status`", not "this is invalid" | Loops that re-fail identically |
| M4 | **Offer the minimal patch** in `--format json` (`suggested_patch`: an RFC 6902 operation) where the fix is mechanical | Multi-turn negotiation over a one-token change |
| M5 | **One violation per message.** Never merge two problems into one string | Half-fixes |
| M6 | **Stable machine id + doc URL on every message** | Messages being parsed by regex, which then breaks |
| M7 | **Never blame, never moralize, and never say "certified"** — the tone is a colleague pointing at a line | A team that stops running the validator |

**The reference outputs are already written.** The three invalid examples in
`schemas/examples/` carry the designed strings in their `$comment`, and those
strings are the validator's snapshot fixtures — if a message changes, a test fails
and someone has to decide on purpose.

`invalid-1-missing-confirmation-key.json` → **`REC001`**:

> `data.places[0]: required property 'last_confirmed_at' is missing (did you mean to publish last_confirmed_at: null?)`

The parenthetical is the whole design in one line: it names the honest alternative,
so an agent does not "fix" the error by inventing a timestamp — which would be the
worst possible outcome, a fabricated confirmation.

`invalid-2-contact-and-personal-data.json` → **`PII001`, `PII002`, `PII003`**:

> `data.places[0].x_example_phone: contact values MUST NOT travel in feeds (use contact_available + public_url)`
> `data.places[0].confirmed_by: must be a role token (team|volunteer|official_source|partner:{id}), never a personal name`
> `data.places[0].description: possible personal data detected (name+phone pattern) — strip before publishing`

Three separate messages for three separate violations (M5), each naming the
mechanism that replaces the forbidden thing (M3). Note the second one **enumerates
the legal values**: an agent that reads it can fix the field without opening the
spec.

`invalid-3-status-in-name-and-always-now.json` → **`REC010`, `BEH002`**:

> `data.places[0].name: operational state token detected in name ('cerrado') — move to service_status/lifecycle_status (CR-2)`
> `envelope.last_updated: value advanced with the probe clock on identical content — generate at build/publish time, not per request`

The second is the clearest example of why messages are written for the fix and not
for the diagnosis: "generate at build/publish time, not per request" is a code
change an agent can make; "invalid timestamp semantics" is not.

**JSON report shape** (what every harness emits and every consumer parses):

```jsonc
{
  "validator_version": "0.1.4",
  "spec_version": "0.1.0",
  "target": "https://example-app.org/.well-known/cabuya.json",
  "checked_at": "2026-08-16T06:00:00Z",
  "measured_level": "L1",
  "requested_level": "L2",
  "profile": "core",
  "summary": { "errors": 2, "warnings": 3, "infos": 1 },
  "blockers_for_next_level": ["REC001", "ENV007"],
  "findings": [
    {
      "id": "REC001",
      "severity": "error",
      "level": "L2",
      "pointer": "/data/places/0/last_confirmed_at",
      "location": { "line": 14, "column": 7 },
      "message": "required property 'last_confirmed_at' is missing (did you mean to publish last_confirmed_at: null?)",
      "rule": "The confirmation key is REQUIRED; null is the honest 'never confirmed'.",
      "fix": "Add \"last_confirmed_at\": null, or the timestamp of the last real confirmation.",
      "suggested_patch": { "op": "add", "path": "/data/places/0/last_confirmed_at", "value": null },
      "spec": "https://Cabuya.org/developers/spec/0.1/6-trust#6.1",
      "docs": "https://Cabuya.org/developers/validator/checks#REC001"
    }
  ],
  "probes": {
    "cors": "missing",
    "soft_404": "pass",
    "always_now": "pass",
    "content_hash": "sha256:…",
    "bytes": 18422,
    "elapsed_ms": 412
  }
}
```

`blockers_for_next_level` is the field the skill's loop reads first. It converts
"here are 6 problems" into "fix these 2 and you are L2", which is the difference
between a tool that measures and a tool that teaches.

### 4.6 Exit codes

Agents branch on exit codes before they parse anything, so the codes must
distinguish *the feed is wrong* from *the network is wrong* — conflating them is
how fix loops burn iterations rewriting correct code.

| Code | Meaning | What a fix loop should do |
|---|---|---|
| `0` | Conformant at the requested level (warnings may exist) | Proceed |
| `1` | **Non-conformant** — one or more errors in the content | Read `findings`, fix, re-run |
| `2` | Conformant but warnings exist **and** `--strict` was passed | Decide whether the warnings matter; do not rewrite the mapping |
| `3` | **Transport failure** — unreachable, TLS failure, timeout, non-JSON body | Fix deployment/DNS/routing, **not** the data |
| `4` | Usage error — bad flags, unreadable file, unknown profile | Fix the invocation |
| `5` | Internal validator error | Report a bug; do not retry in a loop |

### 4.7 CLI design

```
Cabuya-validator <command> [target] [flags]

Commands
  validate <url|file|->     Full run: discovery → feed(s) → level determination
  feed <url|file|->         Validate a feed only (skip discovery)
  manifest <url|file|->     Validate a manifest only
  probe <url>               Transport diagnostics only (status, headers, CORS,
                            soft-404, double-probe) — no schema pass
  explain <check-id>        Print the rule, the fix, examples, the spec anchor
  registry check <file>     Validate a registry entry before opening the PR
  init                      Emit a minimal manifest + feed skeleton for this repo

Flags
  --level L1|L2|L3|L4       Target level (default: the manifest's declared target)
  --profile core|extended   Default: core
  --format text|json|sarif|markdown     Default: text on a TTY, json otherwise
  --strict                  Warnings become exit code 2
  --no-network              Schema + semantic + PII passes only; behavioral skipped
  --probe-twice <seconds>   Gap for the always-now probe (default 3, min 2)
  --timeout <ms>            Per-request (default 8000)
  --max-bytes <n>           Body cap (default 5242880)
  --concurrency <n>         Across shards/feeds (default 4, per-host serial)
  --user-agent <string>     Override; the default names the project and links docs
  --quiet | --verbose
  --version | --help
```

Design notes: `explain` exists so an agent can resolve a check id **without a
network round-trip to the docs site** — the catalogue ships in the package.
`probe` exists because "my feed is fine locally but the badge is red" is a
transport problem 90% of the time, and it should take one command to prove it.
`init` exists so the quickstart's copy-paste block has a generated, correct
starting point rather than a hand-maintained snippet that drifts.

### 4.8 Behavioral probes in detail

These are the checks that separate this validator from "a JSON Schema in a
trenchcoat". Each exists because the plan's own probes hit the failure in
production.

**Soft-404 (`DSC002`).** The trap: SPA catch-alls return `200 text/html` for any
path, so a missing manifest looks present. Algorithm:

1. `GET {discovery_path}`. If status ≠ 200 → absent, report cleanly.
2. If `Content-Type` is `text/html` → **absent** (a manifest is JSON). Report with
   the fix: "exclude this path from your SPA catch-all", plus the one-line fix for
   the detected framework when the User-Agent/headers or the manifest's own
   `feeds[]` reveal it.
3. If the body is JSON but suspicious, `GET /` and compare **byte size and content
   hash**. Equal size → the same catch-all document → absent.
4. Report which discriminator fired, so the fix is unambiguous.

**Always-now (`BEH002`).** The trap: `last_updated` regenerated per request, which
is worse than no signal because consumers can never detect change. Algorithm:

1. Probe 1 at `t0`: record `last_updated₀` and `sha256(body_without_last_updated)`.
2. Wait `--probe-twice` seconds (default 3).
3. Probe 2 at `t1`: record `last_updated₁` and the same hash.
4. **Fire only when the content hash is identical and `last_updated₁ − last_updated₀ ≈ t1 − t0`** (within 1 s tolerance). Two conditions, because a genuinely busy feed *can* legitimately change in three seconds — and a false positive on this check would be an accusation, not a finding.
5. When it fires, the message names the cause and the fix, not the symptom.

**CORS (`ENV007`).** Checked on the actual `GET`, not a preflight, because that is
what a browser consumer will do. Reported with the header to add, verbatim.

**Static ≡ API (`API002`).** Fetch the same record id from both the feed and the
read API; compare after removing envelope-level fields. Any per-record difference
is an error — the equivalence rule is what lets one schema serve four transports.

**Politeness across all probes.** Maximum 6 requests per host per validation run;
serial per host; 8 s timeout; a `User-Agent` that names the project and links to an
explanation page; and the scheduled re-validation spreads publishers across the
cron window rather than firing them simultaneously. A validator that behaves like
a scraper would contradict `PROTOCOL_DESIGN.md` §7.3 with its own traffic.

### 4.9 Determinism, caching and correctness

- **Deterministic:** the same input yields the same report, modulo the `checked_at`
  timestamp and probe timings. Ordering of findings is stable (level, then
  severity, then pointer).
- **No caching in the core.** The harnesses cache: the portal Function for 60 s per
  URL (so a refresh does not re-probe), the cron not at all.
- **`Cache-Control` respect:** the validator sends `Cache-Control: no-cache` on its
  probes, because a CDN-cached response would defeat the always-now probe.
- **Unknown members are preserved and never fail validation** (`REC015`) — the
  extensibility rule applies to the validator first, or every publisher's private
  extension becomes an error.

### 4.10 Test strategy

| Layer | Content |
|---|---|
| **Golden corpus** | The five worked examples, plus ~35 fixtures generated from real shapes in `APPS_MATRIX.md` (all de-identified, all synthetic values) |
| **Must-fail fixtures** | Every `E` check has at least one fixture that triggers it and one near-miss that must **not** trigger it |
| **Message snapshots** | The exact strings, including the three designed messages quoted in §4.5. A message change is a deliberate act, not a diff nobody reads |
| **Parity tests** | The same corpus through the Node and Workers harnesses → byte-identical JSON |
| **Probe tests** | A local fixture server that reproduces the soft-404 catch-all, the always-now feed, a missing-CORS feed, a redirect chain, an oversized body |
| **Schema mutation tests** | Delete each required property in turn; assert the expected check id fires and no other |
| **Published conformance suite** | The corpus ships as a release artifact so an implementer can run the same tests against their own generator, offline |

### 4.11 What the validator must never do

No scraping (it fetches only declared discovery paths and declared feeds) · no
storage of feed bodies anywhere, in any harness · no PII in logs, reports or
issues (findings quote a **pointer**, never the offending value — a PII finding
that echoed the phone number would leak it into a public CI log) · no use of the
word *certified* in any output · no network calls in `--no-network` mode, verified
by a test that fails if `fetch` is called.

---

## 5. The reference MCP server

### 5.1 What it is, and the boundary it must not cross

One server, run by the initiative, exposing the **network** — the registry and the
conforming feeds behind it. It is an OPTIONAL layer above the protocol, never the
conformance floor (`PROTOCOL_DESIGN.md` §4.5, verdict L).

| | **Network-level MCP** (this) | **Product-level MCP** (Corag's, PereiraAyuda's, Pereira Responde's) |
|---|---|---|
| Owner | The initiative | Each app |
| Scope | Every registered publisher's public place data | That app's own product, including features the protocol does not model |
| Entities | `place` only (v0.1) | Whatever the app offers — matching, cases, workflows |
| Auth | None for reads | The app's own |
| PII | **Impossible by construction** — the server can only speak the `place` schema | The app's own policy, outside this protocol |
| Tool names | English identifiers | May be Spanish; the registry records them as-is and must not assume English |
| Deprecation risk to apps | Zero — it never proxies a product surface | n/a |

**The boundary rule, stated once and enforced in the code:** the network MCP
**never** proxies a product MCP, never aggregates a product's non-protocol
endpoints, and never presents itself as a substitute for one. It lists them
(`list_publishers` returns each publisher's declared `mcp{}` endpoint) so an agent
can connect directly. An initiative server that quietly became the front door to
twenty apps would recreate the centralization the protocol exists to avoid.

### 5.2 Tools — 1:1 projections of §4.1/§4.2

| Tool | Input | Output | Backed by |
|---|---|---|---|
| `list_publishers` | `{ level?, entity?, municipality?, event?, status? }` | Registry entries + measured status, badge state, last-validated timestamp, declared licence and `permitted_use`, `mcp{}` endpoint if any | `registry/` + KV status |
| `search_places` | `{ municipality?, kind?, q?, bbox?, updated_since?, limit?, cursor? }` | Feed envelope with `data.places[]`, `next_cursor`, plus `sources[]` and `unreachable[]` | Federated read over conforming feeds/APIs |
| `get_place` | `{ qualified_id }` (`{publisher_id}:{local_id}`) | The record + full provenance chain + freshness block | The owning publisher, fetched live |
| `publish_place` | `{ target_publisher, source, external_id, place }` | The publisher's echo response incl. moderation state | §4.2 write, **only** against publishers whose manifest declares write support |

Tool input/output schemas are **generated from the same JSON Schemas** the
validator uses (`spec/schemas/`), not hand-written — the fourth transport, same
schema, per `PROTOCOL_DESIGN.md` §3.2/§4.5.

### 5.3 Federation semantics

- **Fan-out with a budget:** the registry drives the target list; per-request budget
  8 s and 12 publishers, ordered by declared relevance (municipality/kind match
  first).
- **Partial results are explicit.** The response always carries `sources[]` (who
  answered, with each one's `last_updated`) and `unreachable[]` (who did not, with
  why). Silently dropping a publisher would make the network look smaller and
  fresher than it is — the exact dishonesty the freshness rules exist to prevent.
- **`ttl` is honoured**, per publisher, from their envelope. Cache is in-memory,
  bounded, never written to disk.
- **Attribution travels.** Every returned record keeps its `source{}` chain and the
  publisher's `attribution` string; the tool description tells the calling agent it
  MUST display it (`PROTOCOL_DESIGN.md` §4.3.1).
- **Consent is checked before fetch:** a publisher whose `permitted_use` excludes
  `ai_answer` is excluded from `search_places` results served to an agent, and the
  response says so in `excluded_by_policy[]` rather than pretending they do not
  exist.
- **Freshness is rendered, not hidden:** every record carries its
  `last_confirmed_at` age and `contradictions_active` so the calling agent can obey
  §4.3.2.

### 5.4 Hosting

| Option | For | Against | Verdict |
|---|---|---|---|
| **Cloudflare Workers** (same account as the site) | Free at this scale; same runtime the validator core already targets; Streamable HTTP is a natural fit; global edge means a fan-out from near the publishers | 30 s CPU limits on the free tier constrain very wide fan-outs (mitigated by the 12-publisher budget) | **Recommended** |
| Fly.io / Railway container | No runtime constraints; long-lived SSE trivial | A monthly bill and a machine to patch — the project's cost model says no | Alternative if fan-out grows |
| Deno Deploy | Similar profile to Workers | A second vendor for one product | No |
| Self-hosted by a member app | Free-ish | Puts the neutral surface inside one app's infrastructure — the exact neutrality problem governance §6 designs against | No |

**Transport:** Streamable HTTP at `https://mcp.Cabuya.org/mcp`, with SSE
fallback while clients catch up. **Auth:** none for the three read tools;
`publish_place` requires the caller to supply their own credential for the target
publisher, passed through per-request and **never stored** — the initiative must
never hold a write credential for another team's system.

### 5.5 PII-free by construction

Three structural guarantees, not policies:

1. The server's only output schema is the `place` schema. It has no code path that
   can emit a person-level field, because it has no type for one.
2. It never accepts a query that could act as a person lookup — no free-text search
   against anything but place `name`/`description`, and `q` is length-capped and
   pattern-screened by the same deny-list the validator uses.
3. It holds no database. Nothing persists past a request except an anonymous
   counter, so there is nothing to breach and nothing to subpoena.

---

## 6. Cross-cutting standards

### 6.1 Accessibility — WCAG AA, measured

Inherited from `docs/ACCESSIBILITY.md` and `docs/DESIGN.md`: 4.5:1 normal text,
3:1 large text and non-text UI; approved token colours only, never raw greys;
`width`/`height` on every image; semantic landmarks and heading hierarchy;
disclosure pattern for nav dropdowns, never `role="menu"`; visible focus; all
non-essential motion behind `prefers-reduced-motion`. Two additions specific to
this site: **the validator report must be readable as text** (severity is never
communicated by colour alone — every finding carries a text severity token), and
**the badge SVG carries a `<title>` and an `aria-label`** with the state and the
version, because a badge that only says something in colour says nothing to a
screen reader.

### 6.2 Performance budgets

| Surface | Budget | Why |
|---|---|---|
| Any documentation page | **≤ 0 KB JS** unless it has an island; LCP < 2.0 s on 4G | Documentation that ships a framework has failed |
| Landing | ≤ 40 KB JS total (nav + map island), LCP < 2.5 s, CLS < 0.1 | Same targets as `docs/PERFORMANCE.md` |
| Validator page | ≤ 90 KB JS (the client-side paste-JSON engine is the only heavy island, `client:idle`) | It is a tool, not a page — but it still must not block first paint |
| Registry | ≤ 60 KB JS; the table renders server-side and the filter hydrates `client:visible` | Works with JS disabled |
| Badge endpoint | < 50 ms p95, cached 15 min | A slow badge is a badge people remove |
| Validator API | < 3 s p50 for a single-feed run | The quickstart's promise depends on it |
| Lighthouse CI | ≥ 95 performance, 100 accessibility, 100 best practices, ≥ 95 SEO on eight representative routes | Gate, advisory on PRs, blocking on `main` |

### 6.3 Analytics — cookieless, and honest about what it measures

Cloudflare Web Analytics (no cookies, no consent banner, no personal data). What is
measured: page views, the quickstart funnel (quickstart → validator → registry PR),
validator runs (count only, **never the URL probed**), skill install-page views,
`.md`/`llms.txt` fetches by agent user-agent class. What is never measured: who
validated what, any feed content, any IP-derived identity beyond Cloudflare's own
aggregate. If the group later wants funnel granularity, self-hosted Umami behind a
first-party proxy is the upgrade — the pattern exists in this repo
(`functions/api/umami/[[path]].ts`) and carries over unchanged.

### 6.4 Security

| Area | Standard |
|---|---|
| Headers (`public/_headers`) | `Content-Security-Policy` with no `unsafe-inline` for scripts (the theme script is hashed), `Strict-Transport-Security` with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geolocation, `X-Frame-Options: DENY` except the badge endpoint |
| The validator Function | The full SSRF control set in §2.7. This is the highest-risk surface in the blueprint and it is reviewed as such |
| Secrets | None in the site. The cron's Cloudflare API token is a repository secret scoped to one KV namespace, write-only |
| Supply chain | Pinned exact versions; `pnpm audit` in CI; Dependabot weekly; npm publish with provenance; the validator's dependency count is a reviewed number, not an accident |
| Repo | 2FA required org-wide; branch protection on `main`; DCO required; CODEOWNERS on `spec/` and `registry/`; all repos public from the first commit |
| Disclosure | `SECURITY.md` in the org `.github` repo with a contact alias and a 90-day coordinated-disclosure posture |
| Data | The site stores no personal data, and the registry schema has no field that could hold one — org-level contact only |

### 6.5 Language policy

**Code, comments, commit messages, check ids, JSON keys, schema field names, repo
docs and validator messages: English.** **Public content: Spanish first, English as
a first-class rendition**, with proper orthography (ñ, tildes, interrogative
accents) — the same gate this repo runs before commits.

The one nuance worth deciding explicitly: **validator output is English by
default**, with `--lang es` shipping full Spanish translations of the `message`,
`rule` and `fix` strings while `id`, `pointer` and `spec` stay identical. Check ids
are never translated — they are the stable handle that appears in issues,
transcripts and this catalogue. The portal renders findings in the page's own
language using the same translation table.

### 6.6 Documentation set (per repo)

`AGENTS.md` (+ `CLAUDE.md` symlink) as the single entry point indexing everything ·
`docs/ARCHITECTURE.md` · `docs/STANDARDS.md` · `docs/DESIGN.md` · `docs/TESTING.md`
· `docs/DEVELOPMENT_COMMANDS.md` · `docs/I18N.md` · `docs/SEO.md` ·
`docs/ACCESSIBILITY.md` · `docs/PERFORMANCE.md` · `docs/SECURITY.md` ·
`CONTRIBUTING.md` · `CODE_OF_CONDUCT.md` (org) · `TRADEMARK.md` (org) ·
`GOVERNANCE.md` + `MAINTAINERS.md` + `ADOPTERS.md` + `OPERATIONS.md` (the domain and
continuity runbook governance §6.3 requires). The skill repo adds
`docs/INSTALLATION.md`, `docs/DESIGN.md`, `docs/COMPATIBILITY.md`,
`docs/ACCEPTANCE_TEST.md` and `TRUST.md`.

### 6.7 Contribution and the good-first-issue strategy

The contributor this project needs is a volunteer dev with two free hours who
already builds one of the twenty apps. The strategy is built around that person:

| Label | What it means | Why it is a good first issue |
|---|---|---|
| `good-first-issue:check` | Implement one validator check from the §4.4 catalogue | Perfectly bounded: the id, severity, message and fixture are already specified; the PR is one function plus two tests |
| `good-first-issue:stack` | Write the `implement/stacks/{stack}.md` guide for a stack you know | Requires domain knowledge, not project knowledge — the highest-value thing an outsider can contribute on day one |
| `good-first-issue:translation` | Translate a spec section, a check message or a portal page to EN or ES | Reviewable by anyone; keeps the bilingual promise real |
| `good-first-issue:example` | Add a valid or invalid example with a teaching `$comment` | Directly improves the agent-implementability of the whole protocol |
| `registry` | Add or correct a publisher entry | The lowest-effort path from reader to contributor |
| `rfc` | Open or discuss a normative change | The governance on-ramp |
| `help-wanted:probe` | Reproduce a behavioral failure against a real stack | Turns a bug report into a fixture |

Supporting practices: every check in the catalogue that is not yet implemented ships
as an open issue on day one (so the backlog is *pre-populated with well-specified
work* rather than empty and intimidating) · a 48-hour first-response target,
publicly stated · `CONTRIBUTING.md` in both languages · DCO explained in one
paragraph with the exact `git commit -s` command · a `good first issue` view linked
from `/join` · and the rule that **a first PR gets a review, not a redesign**.

---

## 7. Interlock, build order and the walking skeleton

### 7.1 What blocks what

```
                       ┌──────────────────────────────┐
                       │  spec/  (schemas + normative) │  ← the root of everything
                       └───────────────┬───────────────┘
                    ┌──────────────────┼────────────────────┐
                    ▼                  ▼                    ▼
            ┌───────────────┐  ┌───────────────┐   ┌──────────────────┐
            │   validator   │  │  portal pages │   │  vendored spec/  │
            │  (npm pkg)    │  │ (spec render) │   │  in the skill    │
            └───┬───┬───┬───┘  └───────┬───────┘   └────────┬─────────┘
       ┌────────┘   │   └────────┐     │                    │
       ▼            ▼            ▼     ▼                    ▼
 ┌──────────┐ ┌───────────┐ ┌─────────────┐        ┌────────────────┐
 │ CLI/CI   │ │ /api/     │ │ revalidate  │        │  sub-skills    │
 │ harness  │ │ validate  │ │ cron        │        │  implement/…   │
 └──────────┘ └─────┬─────┘ └──────┬──────┘        └───────┬────────┘
                    │              │                       │
                    ▼              ▼                       ▼
              ┌──────────────────────────┐        ┌─────────────────┐
              │  registry/ + KV status   │───────▶│  real adopters  │
              │  + measured badges       │        │  (L2 feeds)     │
              └────────────┬─────────────┘        └────────┬────────┘
                           │                                │
                           └───────────┬────────────────────┘
                                       ▼
                              ┌──────────────────┐
                              │  MCP server      │  (needs ≥2 live feeds
                              │  (federation)    │   to be worth running)
                              └──────────────────┘
```

| Producer | Blocks | Nature of the block |
|---|---|---|
| `spec/schemas` | validator, portal schema reference, skill's vendored spec, MCP tool schemas | Hard — everything downstream is generated from them |
| validator | portal live validator, CI action, badge cron, skill's `validate`/`implement` loops | Hard |
| portal quickstart | first external adopter | Soft — an adopter with the skill can start without it, but nobody finds the skill without the portal |
| registry entries | badges, MCP fan-out | Hard for both |
| ≥ 2 live conforming feeds | MCP server being meaningful; the `consume` sub-skill being testable against reality | Hard — a federation server over one feed is a proxy |
| skill | adoption rate of everything else | Soft but decisive: it is the difference between "an afternoon" and "an afternoon nobody has" |

### 7.2 Build order

| Phase | Ships | Exit criterion |
|---|---|---|
| **P0 — Foundations** (days 1–3) | Org + two repos + `.github` repo; licences in place (CC0 in `spec/`, Apache-2.0 elsewhere); DCO; branch protection; `spec/` populated from this plan's `PROTOCOL_DESIGN.md` + `schemas/`; CI skeleton | `spec:check` green on the five existing examples |
| **P1 — Validator core** (week 1–2) | Schema + semantic + PII passes; the check catalogue's `E` checks; JSON + text reports; exit codes; golden corpus; npm publish `0.1.0` | The three invalid examples fail with exactly their designed messages; the two valid ones pass |
| **P2 — Behavioral probes + CLI polish** (week 2) | `DSC002` soft-404, `BEH002` always-now, `ENV007` CORS, `probe` and `explain` commands, the fixture server | The fixture server's four traps are detected, and the near-miss fixtures do **not** fire |
| **P3 — Website v0.1** (week 2–4) | Astro scaffold with the inherited patterns; landing; `/developers` quickstart; versioned spec rendering; schema reference; `.md` twins + `llms.txt`; the five content gates | `md:check:strict`, `lang:check:strict`, `parity:check:strict` green; Lighthouse budgets met |
| **P4 — Live validator + registry** (week 4–5) | `/api/validate` Function with the SSRF controls; paste-JSON client mode; `registry/` with the first three publishers; badge endpoint; `revalidate.yml` cron | Three real badges rendering measured states; a failing publisher shows `failing` with check ids |
| **P5 — Skill v0.1** (week 4–6, parallel with P4) | Router + `implement` + `validate` + `setup`; vendored spec; validator runner; two stack guides for the two most common stacks in `APPS_MATRIX.md` | The §3.8 acceptance test passes on two agent harnesses |
| **P6 — First external adopter** (week 6) | One wave-0 or wave-1 app publishes a conforming feed using the skill, end to end, with a human from that team | Their badge is green and they opened their own registry PR |
| **P7 — Consume + publish-status** (week 7–8) | `consume` and `publish-status` sub-skills; `/developers/consume`; the CI action | A second app consumes the first app's feed under the six rules |
| **P8 — MCP server** (week 8+) | The four tools over ≥ 2 live feeds; hosting; `/developers/mcp` | An agent answers a real question over two publishers' data with attribution and ages |
| **P9 — Depth** | RFC index and process live; Extended profile; L3/L4 checks; shard support; more stack guides; announcements | The first RFC merges through the documented process |

### 7.3 The walking skeleton for v0.1

The minimum set that makes the whole loop real — *a publisher can go from nothing to
a measured green badge, guided by an agent* — and nothing more.

**In:**

1. `spec/schemas/0.1/{manifest,place-feed}.schema.json` + the five examples + the
   normative sections they depend on (§1–3, §5–8 of `PROTOCOL_DESIGN.md`).
2. Validator: schema pass, semantic pass (locator rule, id namespace, `REC010`),
   PII deny pass, `DSC002` soft-404, `BEH002` always-now, `ENV007` CORS. Text +
   JSON reports, exit codes 0–5, `explain`.
3. Website: landing, `/developers`, `/developers/quickstart`,
   `/developers/spec/0.1/*`, `/developers/schemas/0.1/*`,
   `/developers/validator` (URL mode via the Function + paste-JSON client mode),
   `/registry` + `/registry/{id}`, `/developers/skill`, `/changelog`, `/governance`,
   `/trademark` — all bilingual, all with `.md` twins, plus `llms.txt`.
4. Registry: three publisher entries (the wave-0 apps with confirmed public
   surfaces), the 6-hour cron, KV status, the badge endpoint with all five states.
5. Skill: router + `implement` + `validate` + `setup`, vendored spec, the
   validator runner, two stack guides.

**Out (explicitly deferred, with the phase noted):** L3/L4 checks (P9) · write API
validation (P9) · MCP server (P8) · `consume` and `publish-status` (P7) · Extended
profile (P9) · search over the portal (P9) · announcements/blog (P9 or never) ·
shard support (P9) · SDKs in other languages (unscheduled) · the `mcp-bridge` and
`ci-gate` skill addons (P7+).

**Done means:** a developer who has never heard of `cabuya` lands on the
quickstart, installs the skill, and 45 minutes later has a green badge on
`/registry/{their_id}` that a stranger can click and verify — with no message from
a maintainer in between.

### 7.4 The three riskiest calls in this blueprint

| Risk | Why it is real | Mitigation already in the design |
|---|---|---|
| **The spec lives in the website repo.** If the group reads that as "the standard belongs to whoever runs the site", the neutrality argument that governance spent a whole document building is damaged on day one. | Optics, not engineering. And optics are what convince nineteen other teams. | The B1–B7 boundary rules, directory-scoped CC0, its own CHANGELOG and CODEOWNERS, and the pre-committed extraction procedure with named triggers (§1.4) — published, not merely intended. |
| **The live validator is a server that fetches arbitrary URLs.** It is the only meaningful attack surface in a stack that is otherwise static files. | SSRF, amplification, and the reputational cost if the initiative's own tool is used to probe someone's infrastructure. | The full control set in §2.7, plus per-host rate limits so the validator can never out-request a volunteer's server, plus zero retention so there is nothing to leak. |
| **The skill's acceptance test is the load-bearing claim.** "Any agent installs it and already knows the whole protocol" is the entire adoption thesis; if it is only ever asserted, the thesis is untested. | Skill packs rot silently — the spec moves, the vendored copy drifts, and nobody notices until an agent writes a non-conforming feed confidently. | §3.8 makes it a scored, offline, CI-run test with a 10/10 + 3/3 bar, checksums on the vendored spec (V6), and a rule that the test runs on two harnesses before a MINOR release. |

---

## 8. Decisions this blueprint hands to the working group

Not open questions — prepared decisions, each with a recommendation and the cost of
choosing otherwise.

| # | Decision | Recommendation | Cost of the alternative |
|---|---|---|---|
| 1 | Spec home | Website repo, bounded `spec/` (§1.2) | A separate repo costs review latency and a second CI now, in exchange for optics that §1.3–1.4 already buy |
| 2 | Live validator architecture | Pages Function + client-side paste mode (§2.7) | Client-only cannot diagnose the most common real defect (missing CORS) |
| 3 | Badge storage | KV live + monthly CC0 JSONL history (§2.8) | Committing every run makes the git history unreadable; a database adds a cost and a custody question |
| 4 | Re-validation cadence | Every 6 h, two consecutive failures before `unreachable` | Faster is unkind to volunteer infrastructure; slower makes badges lie for a day |
| 5 | Validator language | TypeScript, no Node-only APIs (§4.2) | Go gives a nicer binary and costs the one-engine property |
| 6 | Analytics | Cloudflare Web Analytics | Umami gives funnels and costs a service to run |
| 7 | Announcements surface | Changelog + RFC index only at v0.1 | A blog invites the register the brand doc bans |
| 8 | Validator message language | English default, `--lang es` translations, ids never translated | Spanish-first output would be warmer and would fragment the searchable error strings |
| 9 | MCP server timing | After ≥ 2 live conforming feeds (P8) | Shipping it earlier makes the network look like a proxy over one app |
| 10 | The org `.github` repo | Create it (three files, not a product) | Every repo re-declaring its own CoC and TRADEMARK, then drifting |

---

*Produced under the plan's Rule-0. Every architectural claim traces to a file in
this plan's `analysis_results/`, to a named path in this repository, or to one of
the two vendored skill packs. Nothing has been built, registered or committed on
behalf of any team; the name is decided (`Cabuya`), and every
recommendation here survives whichever name wins.*
