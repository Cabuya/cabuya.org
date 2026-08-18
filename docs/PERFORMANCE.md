# Performance — normative budgets

> Budgets are CI gates, not aspirations. A page over budget is a failing
> build, and the fix is a design decision, not a waiver. (Gates: `perf:budgets` and
> Lighthouse CI.)

---

## 1. The budgets

| Surface | Budget | Why |
|---|---|---|
| Any documentation page | **≤ 0 KB JS** unless it carries an island; LCP < 2.0 s on 4G | Documentation that ships a framework has failed |
| Landing (`/`, `/es`) | ≤ 40 KB JS total; LCP < 2.5 s; CLS < 0.1 | First impression on median hardware |
| Validator page | ≤ 90 KB JS, `client:idle` (the paste-JSON engine is the one heavy island; lazy-chunk if needed) | It's a tool, not a page — but it must not block paint |
| Registry | ≤ 60 KB JS; table server-rendered; **works with JS disabled** | Public-interest data degrades gracefully |
| Badge endpoint | < 50 ms p95, `max-age=900, stale-while-revalidate=3600` | A slow badge is a badge people remove |
| `/api/validate` | < 3 s p50 single-feed run | The quickstart's promise depends on it |
| Lighthouse CI | ≥ 95 perf / 100 a11y / 100 best-practices / ≥ 95 SEO. CI samples two routes (home + quickstart — the two heaviest renderers) so the job stays fast; the eight representative routes run as `pnpm run lighthouse:full` locally and at releases | Advisory on PRs, blocking on main |

## 2. The rules that keep budgets met

1. **Prefer static.** `.astro` renders at build; islands are the exception
   and each one is justified in its PR.
2. **Lightest hydration:** `client:visible` > `client:idle` > `client:load`
   (the last needs a measured reason).
3. **CSS before JS.** Interactions that CSS can express (`:target`, details/
   summary, scroll-margin) don't get JavaScript.
4. **Native APIs:** IntersectionObserver over scroll listeners; native
   `loading="lazy"` below the fold.
5. **Images:** WebP, explicit `width`/`height` (CLS), responsive sets via
   `pnpm run images:optimize`, lazy below fold.
6. **Fonts:** self-hosted, subset, `font-display: swap`, no new faces without
   a budget review (see BRAND_GUIDE §4).
7. **Zero CLS by construction:** theme set before paint; illustration slots
   and diagrams carry fixed `aspect-ratio`; async content reserves space.
8. **Islands are leaves.** No island imports page-level data wholesale; props
   are the narrow interface.
9. **Watch the chunk graph, not just the imports.** A module with no
   dependencies can still be expensive: Rollup places the CommonJS interop
   helper somewhere, and if that somewhere is the chunk holding the JSON Schema
   compiler, importing a dependency-free analytics module pulls 61 KB gzipped
   onto every page. That is not hypothetical — it is what happened, and the
   `manualChunks` rule in `astro.config.mjs` that isolates `validator-engine`
   is the fix. Measure the *page*, not the import list.

## 3. Measurement

- `pnpm run perf:budgets` — per-route gzipped-JS audit against the table, read
  from the built chunk graph. Counts island `component-url` attributes, not just
  `<script>` tags: an earlier version read only the latter and reported 1.1 KB
  for every route while a browser measured 24, which is worse than no gate.
- `pnpm run lighthouse` — LHCI on the eight routes (home EN/ES, quickstart,
  a spec section, schema ref, validator, registry index, publisher page).
- Function latencies measured locally against the fixture server, recorded
  with methodology in `analysis_results/PERF_A11Y_BASELINE.md`.

Measured, and held by `perf:budgets`. Full numbers, method and the two fixes
that produced them: `analysis_results/PERF_A11Y_BASELINE.md`.

| Route | Budget | Measured (gz) |
|---|---|---|
| `/`, `/es/` | ≤ 40 KB | **24.0 KB** |
| Documentation pages | shared chrome only | 25.0–27.0 KB |
| `/registry`, `/registry/{id}` | ≤ 60 KB | 24.0–24.9 KB |
| `/developers/validator` | ≤ 90 KB | 29.9 KB before a run |

Everything on a documentation page is the shared chrome. The row in §1 reads
*0 KB unless it carries an island*; every page carries the header island, which
is the site's navigation and is not optional — so what a documentation page is
actually held to is "the chrome and nothing else", and the gate's budget sits
just above the chrome so that adding an island to one fails.

**Two fixes got it here, both worth remembering.** The header island bundled 73
KB of site copy in two languages to render three labels, because
`getTranslations` reaches both translation modules and a lookup by key cannot be
tree-shaken; it takes its strings as props now (26.4 KB → 4.3 KB). And Rollup
had placed the CommonJS interop helper in the JSON Schema compiler's chunk, so a
dependency-free analytics import pulled 61 KB onto every page. Together, ~83 KB
gzipped off every route on the site.

## 4. When a budget and a feature collide

The budget wins by default. The escape path is explicit: measure, document
the trade in the PR, get the budget row changed in this file in the same
review — never ship over-budget silently.


## One declared exclusion in the Lighthouse configuration

The SEO category is reported with the **`robots-txt` audit skipped**, and the
published score should be read with that stated rather than assumed.

The audit implements RFC 9309 strictly and rejects `Content-Signal` — an IETF
draft directive (`draft-romm-aipref-contentsignals`) — as unknown syntax. That
directive is how this site declares its own reuse terms, which is the same
kind of declaration the protocol asks publishers to make. Removing it to
please an audit would be choosing a score over the thing being scored.

**What changed in the Task 50 security review.** The Pages middleware used to
serve a *different* `robots.txt` to Lighthouse-family user agents, with the
directive stripped, so the audit passed and the category read 1.00. That is
cloaking: different bytes to the tool that measures you. It is exactly the
failure this project measures other people's manifests for, and it has been
removed.

The distinction is worth stating plainly, because the two look similar and are
not: **skipping an audit in our own lab configuration is a declared
exclusion; changing what the tool sees is a false measurement.**
