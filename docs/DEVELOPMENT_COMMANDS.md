# Development Commands

> Every npm script, what it does, and when to run it. Scripts marked
> *(Task N)* land with that migration task — the roster is kept current so
> nobody rediscovers the intended shape.

---

## Daily

| Command | What |
|---|---|
| `pnpm run dev` | Dev server at `http://localhost:7777` |
| `pnpm run build` | `astro check && astro build` (+ prebuild index, post-build internal-hub strip) |
| `pnpm run astro:preview` | Preview the production build |
| `pnpm run test` / `test:watch` / `test:coverage` | Vitest |
| `pnpm run biome:check` / `biome:fix` / `biome:fix:unsafe` | Lint + format |
| `pnpm run astro:check` | TypeScript over .astro/.ts |

## Content gates (the five — all have `:strict` CI variants)

| Command | Asserts |
|---|---|
| `pnpm run md:check` | Every page serves a COMPLETE `.md` twin (coverage ≥ 0.85, required sections) |
| `pnpm run lang:check` | `/` renders English, `/es` renders Spanish — HTML and twin |
| `pnpm run seo:check` | Per-URL SEO + structured data (+ OG image existence *(Task 22)*, JSON-LD matrix *(Task 33)*) |
| `pnpm run parity:check` | EN and ES carry the SAME content |
| `pnpm run redirects:check` | Every redirect resolves; no live page shadowed |

## Protocol gates

| Command | Asserts | Ships |
|---|---|---|
| `pnpm run spec:check(:strict)` | Schemas lint (2020-12); `$id`s absolute+versioned; valid examples pass; invalid examples fail the schema OR declare their designed later-pass violation | ✅ live |
| `pnpm run spec:boundary` | B1–B7 for `spec/` + `registry/` | ✅ live |
| `pnpm run registry:check(:strict)` | Entries validate (measured fields refused by construction); ids/URLs unique; filename ≡ id; org-level contact; event refs resolve; no HTML (B6) | ✅ live |
| `pnpm run checks:catalogue(:strict)` | Ids unique, well-formed and never reused; every check has a title, rule and a spec anchor that resolves to a file on disk; every **implemented** check has its Spanish rule and fix; every **catalogued-but-unimplemented** check says where it is planned. Once `/developers/validator/checks` exists (Task 26) the same run cross-checks ids ↔ page anchors in both directions — it needs `pnpm run validator:build` first, and CI therefore runs it after the site build | ✅ live |

## Quality gates

| Command | Asserts | Ships |
|---|---|---|
| `pnpm run perf:budgets` | Per-route JS budgets (docs 0 KB, landing ≤40, validator ≤90, registry ≤60) | Task 34 |
| `pnpm run a11y:check` | Playwright + axe over the route matrix × themes × viewports | Task 35 |
| `pnpm run lighthouse` / `lighthouse:full` | LHCI ≥ 95/100/100/95 on the eight routes | Task 34 retargets |
| `pnpm exec playwright test tests/e2e/journeys/` | The five E2E journeys | Task 47 |

## Validator workspace *(Tasks 12–16)*

| Command | What |
|---|---|
| `pnpm run validator:build` / `validator:test` | The package (aliases for `pnpm --filter @cabuya/validator …`) |
| `pnpm run validator:pack` | `npm pack --dry-run` review — the tarball must be `dist/` + `schemas/` + README + LICENSE and nothing else |
| `npx @cabuya/validator validate <path-or-url>` | Validate a feed or manifest. Exit codes: **0** clean · **1** content errors · **2** warnings under `--strict` · **3** transport failure · **4** usage · **5** internal |
| `… validate --format json\|sarif\|markdown\|text` | `json` is the machine contract, `sarif` feeds code scanning, `markdown` is what you paste into an agent session |
| `… validate --no-network` | Degraded run. Reports *"schema-valid; conformance unmeasured"* — never "conforming", because the transport checks did not run |
| `… validate --lang es` | Translates message, rule and fix in **every** format. Ids, pointers and links never translate |
| `… feed` / `manifest` / `probe <url>` | Narrow the run to one document kind, or exercise only the transport probes (`--probe-twice <seconds>`) |
| `… explain <CHECK_ID>` | Offline: the rule, the fix, implementation status, and both links. Case-insensitive, and suggests neighbours for a typo |
| `… checks` | The whole catalogue with implementation status |
| `… init --publisher-id <id> [--framework nextjs\|…]` | Manifest + feed skeleton, including the honest `"last_confirmed_at": null` |

## Utilities

| Command | What |
|---|---|
| `pnpm run images:optimize` | WebP + responsive sets for staged images |
| `pnpm run generate:agent-skills-index` | Regenerates the agent-skills index (runs in prebuild) |
| `node scripts/revalidate.mjs --dry-run` | Registry re-validation state machine locally *(Task 28)* |
| `pnpm run ncu:check` | Dependency update report (TS major is pinned out) |
| `pnpm run release` | Version bump + release commit (CI release flow) |

## Local Functions development

`wrangler pages dev` runs the site with `functions/` (validate, contact,
badge) against local KV *(documented fully in Task 27)*. Secrets come from
`.dev.vars` — see `.dev.vars.example` for every name; never commit values.
