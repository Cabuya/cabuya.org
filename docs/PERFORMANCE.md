# Performance — normative budgets

> Budgets are CI gates, not aspirations. A page over budget is a failing
> build, and the fix is a design decision, not a waiver. (Gate: `perf:budgets`
> + Lighthouse CI, *Task 34*.)

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
| Lighthouse CI | ≥ 95 perf / 100 a11y / 100 best-practices / ≥ 95 SEO on the eight representative routes | Advisory on PRs, blocking on main |

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

## 3. Measurement

- `pnpm run perf:budgets` — per-route compressed-JS audit against the table
  *(Task 34)*.
- `pnpm run lighthouse` — LHCI on the eight routes (home EN/ES, quickstart,
  a spec section, schema ref, validator, registry index, publisher page).
- Function latencies measured locally against the fixture server, recorded
  with methodology in `analysis_results/PERF_A11Y_BASELINE.md`.

## 4. When a budget and a feature collide

The budget wins by default. The escape path is explicit: measure, document
the trade in the PR, get the budget row changed in this file in the same
review — never ship over-budget silently.
