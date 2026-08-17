# Accessibility — WCAG AA, measured

> AA is the floor and it is *measured*: the token system re-computes its own
> contrast ratios in the test suite, and axe runs over the route matrix in CI
> (`a11y:check`, *Task 35*). "Looks accessible" is not a state this repo
> recognizes.

---

## 1. Contrast (enforced by computation)

- 4.5:1 normal text · 3:1 large text and non-text UI.
- **Only token text colors.** `text-gray-400/500` (+ `dark:` variants) are
  test-banned. The muted floor is `text-cabuya-text-muted` (5.82:1 light /
  5.88:1 dark-elevated — measured).
- Fique (`#C79A4A`) never carries text on light; `cabuya-accent-strong` is
  the text-safe fique (4.92:1). The token test scans for violations.
- Dark mode is measured against the **elevated** surface (the lighter, binding
  ground).
- **Prose is measured too, and it was the one place that was not.** Every
  Markdown-rendered page is styled through the typography plugin's
  `--tw-prose-*` variables, and for six tasks those resolved to the plugin's
  defaults rather than to tokens, because the mapping sat inside a cascade
  layer the plugin's utilities beat. In light mode that measured fine by
  accident. In dark mode the body text was about **1.5:1** — the specification,
  the quickstart and every portal page. Measured after the fix: body 10.44:1,
  headings 13.87:1, links 5.96:1 in dark; 7.71 / 13.07 / 11.54 in light.
  `prose:check` reads the compiled stylesheet and fails the build if any prose
  variable stops resolving to a token.

  The lesson worth keeping: **a contrast rule that is only checked against
  declared tokens does not check the surfaces those tokens never reached.** The
  token test was green throughout.

## 2. The two site-specific rules

1. **The validator report must be readable as text.** Severity is never
   communicated by color alone — every finding carries a text severity token
   (`error`/`warning`/`info`), in the UI and in every output format.
2. **The badge SVG speaks.** `<title>` + `aria-label` carrying state AND
   version ("Cabuya 1.0 compatible — measured 2026-08-16"); state is also
   text inside the SVG, not only color.

## 3. Structure

- Semantic landmarks (`header`/`nav`/`main id="main"`/`footer`) + a skip
  link.
- Heading hierarchy never skips levels; one `h1` per page.
- Nav dropdowns use the **disclosure pattern** (`<button aria-expanded>`),
  never `role="menu"`. Mobile drawer traps focus; Escape closes; focus
  returns to the trigger.
- Buttons act, links navigate — never a `<div onclick>`.

## 4. Media & motion

- Every `<img>` has `width`, `height`, and either meaningful `alt` or
  `alt=""` (decorative). Icon-only links carry `aria-label`.
- Diagrams (`src/components/diagrams/`) are `role="img"` with a localized,
  meaningful `aria-label`; their text is real text (HTML/SVG), not raster.
- All non-essential motion sits behind `prefers-reduced-motion: reduce`.

## 5. Forms & dynamic content

- Every control has a visible `<label>`; errors are text + `aria-live`
  announcements; honeypots are `aria-hidden` and off the tab order.
- Async results (validator report, form status) announce via
  `aria-live="polite"` regions.
- Focus is always visible (`focus-visible` ring tokens) and never removed.

## 6. Verification

| Layer | Tool |
|---|---|
| Token contrast | `tests/unit/lib/design-tokens.test.ts` (re-computed WCAG) |
| Runtime scan | `a11y:check` — axe over eight routes × light/dark × mobile/desktop + menu/report states |
| Structural | Heading levels, landmarks, skip link, `alt` + dimensions, focus visibility, Escape/focus return, reduced motion, 200% reflow — `tests/e2e/a11y/manual-checks.spec.ts` |
| Manual | Screen-reader pass and testing with disabled users — **not yet done**, and listed as not done in `analysis_results/PERF_A11Y_BASELINE.md` §9 |
| Lighthouse | a11y = 100 on the route matrix |
