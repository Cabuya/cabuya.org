# Performance and accessibility baseline

Measured numbers for cabuya.org, with the method that produced each one. The
accessibility half lands with Task 35; the performance half is complete.

Nothing here is a projection. Where a number could not be measured honestly —
edge latency, real-network LCP — that is said rather than estimated.

---

## 1. JavaScript per route

**Method.** `pnpm run perf:budgets` reads the built site, collects each page's
module scripts, modulepreloads and island `component-url`/`renderer-url`
attributes, follows their static imports transitively, and gzips the union.
Cross-checked in Chromium by recording every script response on a real page
load and gzipping each body.

| Surface | Budget | Gate (static) | Browser | Verdict |
|---|---|---|---|---|
| Landing `/`, `/es/` | ≤ 40 KB | 24.0 KB | 24.0 KB | ✅ |
| Documentation pages | shared chrome only | 25.0–27.0 KB | 25.0–26.0 KB | ✅ |
| Validator `/developers/validator` | ≤ 90 KB | 29.9 KB | 28.9 KB | ✅ |
| Registry `/registry`, `/registry/{id}` | ≤ 60 KB | 24.0–24.9 KB | 24.0–24.9 KB | ✅ |

The gate reads slightly high because a modulepreload is counted whether or not
the page ends up executing it. Erring in that direction is deliberate.

### What every page carries, and why

| Chunk | Size (gz) | Why it is on every page |
|---|---|---|
| Svelte runtime | 16.2 KB | The header is an island; the runtime is the price of one |
| Header island | 4.3 KB | Navigation, language switch, theme toggle |
| Analytics | 1.5 KB | Cookieless, loaded on idle |
| Theme + preload helpers | 1.6 KB | Theme applied before paint (zero CLS) |

The validator's engine — 60.6 KB gzipped, the largest artefact on the site — is
**not** in that table. It is fetched by a dynamic import on the first run, so a
reader who came to understand what the validator does never downloads it.

### Two fixes this task made

**The header was carrying the whole site's copy.** `getTranslations` reaches
both translation modules, and a lookup by key cannot be tree-shaken out of an
object literal — so the header island bundled **73 KB of prose in two
languages** to render three labels, and the theme toggle inside it did the same
for two more. 26.4 KB gzipped, on every page, for the word "Menu". Both now take
their strings as props from the Astro side, which has them at build time for
free. Header: 26.4 KB → **4.3 KB**.

**Ajv was in the interop chunk.** Recorded under Task 28: Rollup had placed the
CommonJS interop helper in the same chunk as the JSON Schema compiler, so
importing a dependency-free analytics module pulled 61 KB gzipped onto every
page. A `manualChunks` rule isolates `validator-engine`.

Together: **~83 KB gzipped removed from every page on the site.**

## 2. Lighthouse

**Method.** `pnpm run lighthouse` — LHCI against `dist/`, mobile emulation,
median of 3 runs, on the eight representative routes (one per page renderer).
Numbers below are those medians.

| Route | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.65 s | 0.000 | 0 ms |
| `/es/` | 100 | 100 | 100 | 100 | 1.58 s | 0.000 | 0 ms |
| `/developers/quickstart/` | 99 | 100 | 100 | 100 | 1.88 s | 0.000 | 0 ms |
| `/developers/spec/0.1/3-the-feed/` | 100 | 100 | 100 | 100 | 1.73 s | 0.000 | 0 ms |
| `/developers/schemas/0.1/place-feed/` | 100 | 100 | 100 | 100 | 1.80 s | 0.000 | 0 ms |
| `/developers/validator/` | 100 | 100 | 100 | 100 | 1.65 s | 0.000 | 0 ms |
| `/registry/` | 100 | 100 | **96** | 100 | 1.58 s | 0.000 | 0 ms |
| `/registry/corag/` | 100 | 100 | **96** | 100 | 1.58 s | 0.000 | 0 ms |

Contract: ≥ 95 / 100 / 100 / ≥ 95. Met everywhere, with one documented
exception.

### The 96, stated plainly

`/registry` and `/registry/{id}` fetch `/registry/status.json` and
`/badge/{id}.svg`. Both are Pages Functions; the lab serves `dist/` with no
Functions, so both 404 and Chrome logs a console error, costing the category
0.04.

The tempting fix — dropping placeholder files into `dist/` so the requests
succeed — would mean shipping a fake badge and a fake measurement to make a
score look better. This project refuses that elsewhere and refuses it here.

What checks the real behaviour instead:

- Both endpoints have unit tests, including the malformed-record and
  missing-binding paths.
- The freshness script is **designed** to do nothing when its fetch fails, and
  was exercised in a browser against a failing endpoint: the page keeps the
  states baked at deploy time, with their timestamps.
- A browser pass over every route (below) recorded **zero page errors** —
  the failed requests are resource 404s, not exceptions.

### One accessibility defect Lighthouse found

`github-dark`'s comment colour, `#6A737D`, measures **3.19:1** on the code-block
ground — a WCAG AA failure on every code block containing a comment, which is
most of the ones that teach anything. Shiki writes colours as inline styles, so
no token rule and no token test could see it.

Replaced with `--color-cabuya-code-comment` (`#93A9A0`): **6.16:1** on
`bg-dark`, 5.88:1 on the theme's own ground, still visibly quieter than the code
around it. `tests/unit/lib/code-block-contrast.test.ts` now measures *every*
colour in *every* built code block against both grounds, so a theme change that
introduced a second failing token fails there rather than in an audit somebody
runs quarterly.

## 3. Layout stability

**Method.** Chromium, `PerformanceObserver` on `layout-shift`, discounting
input-driven shifts, over 15 routes.

Every route measured **≤ 0.0002** except `/registry` at **0.0067** — the filter
controls being revealed once their script confirms they work. Budget is 0.1;
the worst route is 15× inside it.

Zero shift is not an accident. The theme is applied by a blocking inline script
before first paint, every image carries `width` and `height`, diagrams declare
an `aspect-ratio`, and fonts are self-hosted with `font-display: swap`.

## 4. Function latency

**Method.** The badge endpoint invoked directly with an in-memory KV stand-in,
300 warm-up calls then 3,000 measured, `process.hrtime.bigint()`.

| Endpoint | p50 | p95 | p99 | Budget |
|---|---|---|---|---|
| `GET /badge/{id}.svg` (compose + respond) | 0.022 ms | 0.038 ms | 0.057 ms | < 50 ms p95 |

**This is not the production number and must not be quoted as one.** It measures
the work the endpoint does, excluding the KV round trip, TLS and the network —
which on Cloudflare's edge dominate. What it establishes is that the endpoint's
own work is three orders of magnitude inside the budget, so the budget will be
met or missed by KV latency, not by this code. That is a design property worth
having: there is nothing here to optimise later.

`/api/validate` is not benchmarked here. Its p50 is dominated by fetching a
third party's feed, so a local number would describe our machine rather than the
service. Its own limits — 8 s per request, 25 s per run, 5 MB, 3 redirects — are
in `functions/api/validate.ts` and tested.

## 5. Method notes

- **gzip, not brotli.** Cloudflare serves brotli, which is ~15% smaller. Budgets
  are held against the larger number.
- **Median of 3.** A single LHCI run swings ~0.03 on a shared runner.
- **`dist/`, not a deployment.** Every number here is reproducible from a clean
  checkout with `pnpm run build`. No number depends on infrastructure that only
  the maintainers can reach.
