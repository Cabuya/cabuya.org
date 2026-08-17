# Development Commands

> Every npm script, what it does, and when to run it.

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
| `pnpm run md:check` | Every page serves a COMPLETE `.md` twin (coverage ≥ 0.85, required sections). `md:check:existence` is the cheaper half — every page *has* a twin, without reading it |
| `pnpm run lang:check` | `/` renders English, `/es` renders Spanish — HTML and twin |
| `pnpm run seo:check` | Per-URL SEO + structured data (+ OG image existence, JSON-LD matrix) |
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
| `pnpm run a11y:check` | axe over 8 routes × 2 themes × 2 viewports + 4 interactive states, plus the structural pass (headings, landmarks, focus, reflow) | ✅ live |
| `pnpm run perf:budgets(:strict)` | Per-route gzipped JS against the budget table. Reads `dist/`, follows each page's island and preload graph | ✅ live |
| `pnpm run lighthouse` | LHCI on the eight representative routes, median of 3, against `dist/` | ✅ live |
| `pnpm run llms:generate(:check)` — `llms:check` | Regenerates `public/llms.txt` and `llms-full.txt` from the nav registries, the spec loader, the registry and the check catalogue. `llms:check` fails when the committed copy has drifted | ✅ live |
| `pnpm run issues:day-one(:check)` | Regenerates `docs/CONTRIBUTING-issues.md` from the catalogued checks that are not yet implemented — the backlog `/join` promises. `:check` fails when it has drifted | ✅ live |
| `pnpm run registry:ids:check` | The badge endpoint's inlined id list still matches `registry/publishers/` — a new entry whose own badge would 404 fails here | ✅ live |
| `pnpm run checks:catalogue(:strict)` | Ids unique, well-formed and never reused; every check has a title, rule and a spec anchor that resolves to a file on disk; every **implemented** check has its Spanish rule and fix; every **catalogued-but-unimplemented** check says where it is planned. Once `/developers/validator/checks` exists the same run cross-checks ids ↔ page anchors in both directions — it needs `pnpm run validator:build` first, and CI therefore runs it after the site build | ✅ live |

## Quality gates

| Command | Asserts | Ships |
|---|---|---|
| `pnpm run lighthouse:full` | The wider LHCI surface, for a release check | ✅ live |
| `pnpm exec playwright test tests/e2e/journeys/` | The five E2E journeys | Task 47 |

## Validator workspace

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

## End-to-end and audits

Everything here needs a build first — they run against `dist/` through
`astro preview`, which Playwright starts for them.

| Command | What | CI |
|---|---|---|
| `pnpm run test:e2e` | The five journeys plus the CSP suite. Unit tests prove modules; these prove the paths between them | blocking |
| `pnpm run test:journeys` | Just the journeys: adoption, verification, language integrity, agent surface, theme + keyboard | — |
| `pnpm run a11y:check` | axe over eight routes × two themes × two viewports, plus four interactive states | blocking |
| `pnpm run test:responsive` | Layout snapshots and touch targets across the viewport matrix | **advisory** — a snapshot diff is a review signal, not a verdict |
| `pnpm run test:responsive:update` | Accept the new snapshots, after looking at them |
| `pnpm run responsive:capture(:quick)` | Screenshots for every route × viewport, for a human to page through |
| `pnpm run responsive:audit(:quick)` | Overflow and layout heuristics over the same matrix |
| `pnpm run responsive:inventory` | Rebuild the route list from `dist/` after adding a renderer |
| `pnpm run lighthouse` | Performance, on the eight representative routes | advisory on PRs, blocking on main |

## Coverage

| Command | What |
|---|---|
| `pnpm run test:coverage` | Vitest with thresholds enforced — 80% across `src/lib` |
| `pnpm run validator:coverage` | The validator package, held higher: 90% statements and lines, because it is the enforcement point of the protocol |

## Generated artifacts

These write files that are committed. Each has a `--check` counterpart in CI
that fails when the committed copy no longer matches what the generator
produces — a stale generated file is worse than none, because it looks
authoritative.

| Command | Regenerates | Checked by |
|---|---|---|
| `pnpm run csp:check` | — | Fails when `dist/_headers` no longer matches the built output. The policy itself is written by `postbuild` |
| `pnpm run llms:generate` / `llms:check` | `public/llms.txt` | `llms:check` |
| `pnpm run agents:generate` / `agents:check` | `public/auth.md`, `public/.well-known/agent-skills/index.json` and the skill it digests | `agents:check` |
| `pnpm run og:fallback(:force)` | The fallback social card | `seo:check` |
| `pnpm --filter @cabuya/validator run schemas:precompile` | The ahead-of-time schema validators, so the browser never calls `new Function` | `schemas:check` |
| `pnpm run issues:day-one(:check)` | The day-one issue set for the repository | `issues:day-one:check` |
| `pnpm run dns:aid:dry-run` / `dns:aid:publish` | The DNS-AID records | dry-run first, always |

## Utilities

| Command | What |
|---|---|
| `pnpm run images:optimize` | WebP + responsive sets for staged images |
| `pnpm run illustrations:build -- --masters=<dir>` | Re-frames and encodes every illustration from the masters (1x + 2x, weight-searched). The masters are not in the repo — see `docs/visuals/README.md` |
| `pnpm run illustrations:check` | Every drawing present, decoded, visible, unclipped, undistorted and legible at 15 viewports × 2 themes. Needs `build` + `astro preview`. `--quick` for four viewports |
| `pnpm run og:cards -- --masters=<dir>` | Installs the per-language share cards at exactly 1200 × 630 |
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
pnpm exec wrangler kv key put --local --binding REGISTRY_STATUS status:pereira-ayuda \
  '{"publisher_id":"pereira-ayuda","state":"conforming","level":"L2","checked_at":"2026-08-17T00:00:00Z","version":"0.1"}'
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
