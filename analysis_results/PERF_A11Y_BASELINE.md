# Performance and accessibility baseline

Measured numbers for cabuya.org, with the method that produced each one.

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
| ~~Analytics~~ | ~~1.5 KB~~ | Removed in Task 36 — the custom-event module sent nothing once the provider changed |
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

**A third fix, from Task 36:** the 299-line tracking module was deleted rather
than left dormant, taking another 1.5 KB with it. Dead tracking code is a
privacy claim nobody can verify by reading the page.

Together: **~85 KB gzipped removed from every page on the site**, which is why
the landing page now measures 20.8 KB against a 40 KB budget.

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

---

# Accessibility

## 6. axe across the matrix

**Method.** `pnpm run a11y:check` — axe-core through Playwright on the eight
representative routes × two themes × two viewports, plus four interactive
states, tagged `wcag2a wcag2aa wcag21a wcag21aa`. **55 checks.**

**Result: zero serious or critical violations, zero moderate, zero minor.**

The interactive states are the half a static scan cannot reach:

| State | Why it needs its own check |
|---|---|
| Mobile drawer, open | The disclosure pattern only exists after a click |
| Nav group, expanded | Same, and it is where `role="menu"` would creep in |
| Registry with a filter applied | Rows hidden, the live count updated |
| Validator showing a report | Severity markup only renders after a run |

### Two real failures it found

**`text-cabuya-danger` on the prose code ground: 4.07:1.** The PII deny-pattern
chips on the quickstart carried the danger colour with no ground of their own,
so they inherited the inline-code chip background. 198 nodes, dark mode only.
They carry `bg-cabuya-danger-soft` now — 5.99:1, and identical to the chip
directly above them that already did.

**Fique inside a link inside a code chip: 4.24:1.** A `<code>` inside a link
takes the link colour, which is fique, on the code-chip ground. 58 nodes on the
specification pages. The chip is dropped inside a link now: the element is a
link that happens to be set in mono, the reader needs the link affordance more
than the code affordance, and on the page ground the same colour is 5.96:1.

Both were dark-mode only. Both were invisible to every test that reads source
rather than pixels — which is the third time that has been true on this project
and the reason the matrix runs in both themes.

## 7. Structure, keyboard, motion, zoom

**Method.** `tests/e2e/a11y/manual-checks.spec.ts` — the mechanical floor of a
manual audit, over ten routes, so a human pass can spend its attention on
judgement rather than on counting.

| Check | Result |
|---|---|
| Exactly one `<h1>` in `<main>` | ✅ after one fix |
| No skipped heading level | ✅ |
| `banner` / `main` / `contentinfo` landmarks | ✅ |
| Skip link is the first tab stop | ✅ |
| Every `<img>` has `alt` and dimensions | ✅ |
| Every focusable control shows a focus indicator | ✅ |
| Drawer closes on `Escape`, focus returns to its toggle | ✅ |
| `prefers-reduced-motion` stops every animation > 0.2 s | ✅ |
| 200% zoom (640×512) reflows without horizontal scroll | ✅ after two fixes |

### Three more findings, fixed

**Two `<h1>` on every specification page.** The layout renders the route title,
and each specification file opens with `# §3 — The feed` because it is also a
standalone document. Assistive technology announced two document titles and the
outline claimed the page contained two documents.

The rendered body now drops that first line; the `.md` twin still serves the
file byte-exact, because the twin *is* the source and a reader fetching it
should get the document rather than the document minus a line. Anchors are
unaffected: they are derived from the § number in the text, not from the tag —
which was not luck, it is why they were built that way.

**The publisher page was 1268 px wide in a 640 px viewport.** A grid item's
minimum width defaults to its content's, so one long unbroken line in an embed
snippet widened the item, the section, and the page. `overflow-x-auto` inside
the code block could not help until the box was allowed to be narrower than its
contents. `min-w-0` on the code figure and on the grid children.

**The quickstart was 680 px in the same viewport**, for the same reason in a
different grid.

axe does not flag any of the three. WCAG 1.4.10 is about reflow, and a page that
scrolls sideways at 200% zoom is one a low-vision reader has to pan through line
by line.

## 8. The two site-specific rules

| Rule | Where it is enforced |
|---|---|
| Validator severity is never colour alone | `axe.spec.ts` reads the rendered report as text and asserts the severity word is present; `ReportView.svelte` prints it |
| The badge SVG carries `<title>` and `aria-label` | `tests/unit/lib/badge.test.ts` asserts both on all six states × two languages, plus the version and the absence of "certif" |

## 9. What this does not measure

Stated because an accessibility report that implies completeness is worse than
one that does not.

- **No screen-reader pass.** Nobody has driven this site with VoiceOver, NVDA
  or TalkBack. The landmark, heading and name checks make one likely to go
  well; they do not replace it.
- **No testing with disabled users.** The most valuable pass, and the one that
  needs people rather than a runner.
- **axe finds about a third of WCAG issues** by its own maintainers' estimate.
  Zero violations means zero *detectable* violations.
- **Cognitive accessibility is unmeasured.** Reading level, consistent
  vocabulary, error-recovery — the writing guides address these; nothing
  verifies them.
