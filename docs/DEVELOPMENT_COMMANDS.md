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
| `pnpm run internal:check(:strict)` | The dev-only hub stayed out of the deployed artefact: no `dist/internal`, no internal route in any sitemap, no deployed page linking into it. Runs against `dist/`, so build first; skips itself (exit 0, with a message) when `INCLUDE_INTERNAL=true` marks a staging build |

## Protocol gates

| Command | Asserts | Ships |
|---|---|---|
| `pnpm run spec:check(:strict)` | Schemas lint (2020-12); `$id`s absolute+versioned; valid examples pass; invalid examples fail the schema OR declare their designed later-pass violation | ✅ live |
| `pnpm run spec:boundary` | B1–B7 for `spec/` + `registry/` | ✅ live |
| `pnpm run registry:check(:strict)` | Entries validate (measured fields refused by construction); ids/URLs unique; filename ≡ id; org-level contact; event refs resolve; no HTML (B6) | ✅ live |
| `pnpm run prose:check(:strict)` | Every `--tw-prose-*` variable in the **compiled** CSS resolves to a Cabuya token, and the mapping is unlayered. Reads `dist/`, so it runs after the build | ✅ live |
| `pnpm run issues:day-one(:check)` | Regenerates `docs/CONTRIBUTING-issues.md` from the catalogued checks that are not yet implemented — the backlog `/join` promises. `:check` fails when it has drifted | ✅ live |
| `pnpm run registry:ids:check` | The badge endpoint's inlined id list still matches `registry/publishers/` — a new entry whose own badge would 404 fails here | ✅ live |
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
| `pnpm run revalidate:dry-run` | Every transition the cron would make, against the live feeds, writing nothing |
| `node scripts/revalidate.mjs --dry-run --fixtures tests/fixtures/revalidate` | The same, against fixtures — no network, deterministic, what the test suite runs |
| `node scripts/revalidate.mjs --only <publisher_id>` | Narrow a run to one entry |
| `pnpm run registry:ids` | Regenerate the badge endpoint's inlined id list after adding an entry |
| `pnpm run ncu:check` | Dependency update report (TS major is pinned out) |
| `pnpm run release` | Version bump + release commit (CI release flow) |

## Local Functions development

```bash
pnpm run build
pnpm exec wrangler pages dev dist --kv VALIDATE_RATE --kv REGISTRY_STATUS
```

`--kv` creates each namespace locally, so working on the Functions needs no
Cloudflare account setup. `/api/validate` takes no secrets at all — see
`.dev.vars.example` for why that is a property worth keeping. `REGISTRY_STATUS`
starts empty, so every badge renders its honest *not yet measured* state until
you put something in it:

```bash
pnpm exec wrangler kv key put --local --binding REGISTRY_STATUS status:corag \
  '{"publisher_id":"corag","state":"conforming","level":"L2","checked_at":"2026-08-17T00:00:00Z","version":"0.1"}'
```

`/api/contact` needs `DAILYBOT_API_KEY`, `DAILYBOT_FORM_ID` and
`DAILYBOT_FORM_QUESTIONS` in `.dev.vars`. Without them it answers 503
`not-configured` and the form on `/join` says so — which is what a fork and a
local build should see, and worth exercising deliberately.

`URL_MODE_AVAILABLE` in `src/lib/validate-api-contract.ts` is the one switch
that turns the validator's URL mode off, for both the page and its Markdown
twin. It ships `true` now that the Function is deployed; set it `false` and the
page says the service is not up rather than failing on submit.

| Command | Asserts |
|---|---|
| `pnpm run retention:check(:strict)` | The validator endpoint keeps nothing: no `console.*`, no storage binding beyond the two rate counters, no analytics in the validation path, `Cache-Control: no-store` on every response. A grep, and honest about being one — it cannot prove the absence of retention, only the absence of its common shapes |
