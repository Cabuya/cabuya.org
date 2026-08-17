# Cabuya Design System — the agent-facing UI contract

> **Read this before generating or editing ANY user interface in this repo.**
> This document is the engineering contract that implements
> [`docs/BRAND_GUIDE.md`](./BRAND_GUIDE.md). Tokens are declared **once**, in
> `src/styles/global.css` (`@theme` + `.dark`); every value here is measured;
> `tests/unit/lib/design-tokens.test.ts` re-computes the critical ratios and
> fails the build on drift. Rendered reference: `/internal/ui/colors` and
> `/internal/brand` (dev-only).

---

## 1. The six hard rules

1. **Single declaration site.** `--color-cabuya-*` variables are declared only
   in `src/styles/global.css`. Never set or override one in a component, an
   inline `style`, or a page.
2. **No raw greys, ever.** `text-gray-400`, `text-gray-500` and their `dark:`
   variants fail WCAG AA on the Cabuya grounds and are test-banned. Use
   `text-cabuya-text-muted` / `-secondary`.
3. **Fique never carries text on a light ground.** `text-cabuya-accent`
   (`#C79A4A`, 2.45:1 on white) is for icons, strands and large decorative
   display only. Text in the fique hue uses `text-cabuya-accent-strong`
   (`#8A672C`, 4.92:1). A test scans for violations.
4. **Filled brand surfaces use the fill pair.**
   `bg-cabuya-fill text-cabuya-on-fill` (+ `hover:bg-cabuya-fill-strong`) —
   fixed forest/ivory in BOTH themes (10.97:1).
   `bg-cabuya-primary text-white` is the canonical bug: `primary` flips to
   fique in dark mode and white-on-fique is unreadable.
5. **Every color on the site comes from a token.** No hex literals in
   components. If a design needs a value that doesn't exist, add a token (with
   a measured ratio in its comment) — don't inline it.
6. **The prose token mapping is unlayered, and stays that way.** `.prose`
   points every `--tw-prose-*` variable at a Cabuya token, and that block sits
   outside every `@layer` in `global.css`. It was inside `@layer components`
   for six tasks and did nothing: Tailwind 4 registers `.prose` as a *utility*,
   utilities win over components, and so the entire reading surface — the
   specification, the quickstart, every portal page — rendered in the plugin's
   default slate. Light mode hid it; dark mode was `oklch(37.3%)` body text on
   `#082a24`, about 1.5:1. `prose:check` reads the **compiled** stylesheet and
   fails the build if the winning declaration stops being a token.

## 2. Color tokens

Utilities are generated from every token: `bg-cabuya-*`, `text-cabuya-*`,
`border-cabuya-*`, `ring-cabuya-*`, etc.

### Brand & interactive

| Token | Light | Dark | Role / pairing rules |
|---|---|---|---|
| `cabuya-primary` | `#0B3D32` forest | `#C79A4A` fique | Brand text, links, active states. 11.54:1 on white / 5.96:1 on Night. **Text only — never as a fill with white text** |
| `cabuya-primary-strong` | `#082A24` | `#D9B36C` | Hover/pressed of primary *as text* |
| `cabuya-primary-soft` | `#E7EFEA` | `#10382E` | Chip ground behind primary text (10.38:1 light / 5.01:1 dark) |
| `cabuya-primary-light` | `#CFE3D9` | (no flip) | Display text on dark canvases from light mode |
| `cabuya-fill` | `#0B3D32` | (no flip) | Filled buttons/surfaces |
| `cabuya-fill-strong` | `#082A24` | (no flip) | Fill hover |
| `cabuya-on-fill` | `#F6F3ED` | (no flip) | The ONLY text on `fill` |
| `cabuya-seedling` | `#CFE3D9` | (no flip) | Pale-green display text on `bg-dark` (11.44:1) |
| `cabuya-seedling-soft` | `#E7EFEA` | (no flip) | Soft seedling tint |
| `cabuya-accent` | `#C79A4A` | (no flip) | **Decorative only on light**: icons, strands, big display |
| `cabuya-accent-strong` | `#8A672C` | `#D9B36C` | Fique-hued **text** (4.92:1 light / 6.79:1 dark) |

### Grounds

| Token | Light | Dark | Role |
|---|---|---|---|
| `cabuya-bg` | `#FAF9F6` | `#082A24` | Page ground |
| `cabuya-bg-elevated` | `#FFFFFF` | `#0E352C` | Cards, panels — dark elevated is the **binding** contrast ground |
| `cabuya-bg-brand` | `#E7EFEA` | `#10382E` | Soft brand sections |
| `cabuya-bg-brand-strong` | `#DCE7E1` | `#164439` | Stronger brand ground (forest text: 9.58:1) |
| `cabuya-bg-dark` | `#082A24` | (no flip) | Always-dark canvas (heroes). Pair with ivory/seedling text; mark the component `cabuya-dark-canvas` if it uses raw fique text |

### Borders

| Token | Light | Dark | Rule |
|---|---|---|---|
| `cabuya-border` | `#E3E0D6` | `#1E453B` | Hairlines (decorative — no contrast floor) |
| `cabuya-border-strong` | `#C7C1B0` | `#2F5A4D` | Emphasized rules |
| `cabuya-border-interactive` | `#7A7568` | `#69857A` | Form controls & UI boundaries — measured ≥3:1 (4.36 / 3.83) |

### Text

| Token | Light | Dark | Measured |
|---|---|---|---|
| `cabuya-text` (alias `text-cabuya`) | `#233029` | `#F6F3ED` | 13.07:1 / 12.12:1 — AAA |
| `cabuya-text-secondary` (alias `text-cabuya-secondary`) | `#44534C` | `#CBD8D0` | 7.71:1 / 9.12:1 — AAA |
| `cabuya-text-muted` | `#57655E` | `#9DB0A6` | 5.82:1 / 5.88:1 — AA+. **The floor.** Nothing lighter may carry text |

### Status

All measured ≥4.5:1 on their grounds (light: White & Ivory; dark: the elevated
surface). Soft variants are chip grounds for their own status text.

| Token | Light | Dark |
|---|---|---|
| `cabuya-success` / `-soft` | `#24735D` / `#E7F3EE` | `#6BA895` / `#123328` |
| `cabuya-warning` / `-soft` | `#995D30` / `#F6ECDF` | `#C79263` / `#2E2413` |
| `cabuya-info` / `-soft` | `#3C6176` / `#EAF1F4` | `#86A3B3` / `#14262C` |
| `cabuya-danger` / `-soft` | `#A43536` / `#FDECEC` | `#D48A8D` / `#331A1C` |

Status is **never** communicated by color alone — always pair with a text
token, an icon with `aria-label`, or both. (The validator report renders
severity as text; that rule is normative in `docs/ACCESSIBILITY.md`.)

## 3. Type, spacing, radius, elevation

- **Faces:** `--font-sans` Poppins (body) · `--font-display` Outfit (display).
  Self-hosted, subset, `font-display: swap`. See BRAND_GUIDE §4.
- **Prose:** Markdown-rendered content uses the typography plugin retargeted to
  tokens — never restyle prose ad hoc.
- **Radius:** `rounded-cabuya-sm` 12px · `-md` 18px · `-lg` 28px. Use these
  three; arbitrary radii are a smell.
- **Elevation:** `shadow-cabuya-sm` / `shadow-cabuya-lg` — forest-tinted, not
  neutral. Dark mode swaps to deeper neutral shadows automatically.
- **Spacing:** Tailwind's scale; sections breathe (`py-12`+ on section
  wrappers); density is the exception, not the default.

## 4. Component patterns

- **Buttons (primary):** `bg-cabuya-fill text-cabuya-on-fill
  hover:bg-cabuya-fill-strong rounded-cabuya-sm` + visible focus
  (`focus-visible:outline-2 outline-cabuya-primary outline-offset-2`).
- **Buttons (secondary):** `border-cabuya-border-interactive text-cabuya-primary
  hover:bg-cabuya-primary-soft`.
- **Chips/badges:** status-soft ground + status text (measured pairs above),
  or `bg-cabuya-primary-soft text-cabuya-primary`.
- **Cards:** `bg-cabuya-bg-elevated border-cabuya-border rounded-cabuya-md
  shadow-cabuya-sm`.
- **Dark hero canvases:** `bg-cabuya-bg-dark` + `text-cabuya-seedling` display
  + `text-cabuya-on-fill`-adjacent body (ivory). Add the `cabuya-dark-canvas`
  marker comment if raw fique text is used, so the guard test knows.
- **Nav:** the disclosure pattern (`aria-expanded` on a `<button>`), never
  `role="menu"`. Focus trapped in the mobile drawer, Escape closes.

## 5. Do / Don't (agents: check your diff against this list)

| ✅ Do | ❌ Don't |
|---|---|
| `text-cabuya-text-muted` for de-emphasized text | `text-gray-400` / `dark:text-gray-500` (test-banned) |
| `bg-cabuya-fill text-cabuya-on-fill` | `bg-cabuya-primary text-white` |
| `text-cabuya-accent-strong` for fique-hued text | `text-cabuya-accent` on a light ground for text |
| Add a measured token when a value is missing | Inline a hex in a component |
| `width` + `height` on every `<img>` | Un-dimensioned images (CLS) |
| `client:visible` / `client:idle` | `client:load` without a measured reason |
| `prefers-reduced-motion` guards on animation | Unconditional motion |
| Both themes verified before commit | "Looks fine in light mode" |

## 6. Enforcement

| Guard | Where |
|---|---|
| Declared ≡ shown (internal pages can't go stale) | `tests/unit/lib/design-tokens.test.ts` |
| Measured contrast re-computed (body pairs, fique-strong, borders, fill pair) | same |
| Raw-grey ban · fique-on-light-text ban · one token namespace | same |
| No hex literals in the token showcase | same |
| Prose variables resolve to tokens, in the compiled CSS | `prose:check` |
| WCAG runtime scan (axe, route matrix) | `a11y:check` |
