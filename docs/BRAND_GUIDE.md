# Cabuya — Brand Guide

> **Authority chain.** This guide is derived from the founding brand delivery
> (`docs/context/brand/PALETTE.md` + the delivered logo assets) and the naming
> analysis (`docs/context/BRAND_AND_NAMING.md`). The engineering contract that
> implements it is [`docs/DESIGN.md`](./DESIGN.md); the tokens live once, in
> `src/styles/global.css`; the rendered reference is the dev-only
> [`/internal/brand`](http://localhost:7777/internal/brand).

---

## 1. The story

**Cabuya** is the fibre — from the fique plant — with which you tie what no one
can carry alone. Many thin threads that individually hold nothing, twisted
together, carry anything. That is literally this network: **each app is a
thread; the protocol is the rope.**

- The word is Colombian and common property: it belongs to no single app, and
  it does not expire when an emergency ends.
- Colombia is one of the world's largest producers of fique, the plant cabuya
  fibre comes from — a real, checkable fact that grounds the name.
- The founding principle, printed wherever the brand speaks:
  **«Crecemos juntos: no competimos, nos alimentamos.»**
  (*We grow together: we don't compete, we feed each other.*)

## 2. The mark

The logo is a **rope braided into a C** — the brand thesis made visual: many
fibres, one cordage. Three strands: white, fique gold, and the forest outline
that binds them.

| Asset | File | Use |
|---|---|---|
| Isologo (the braided C) | `public/images/brand/cabuya-isologo.webp` | Favicons, avatars, small squares, bullets |
| Lockup, light grounds | `public/images/brand/cabuya-lockup.webp` (+`.png`) | Header, documents on White/Ivory |
| Lockup, dark grounds | `public/images/brand/cabuya-lockup-dark.webp` (+`.png`) | Header in dark mode, Night canvases |
| Source masters | `docs/context/brand/assets/` | Never served; regenerate derived assets from these |

Rules:

- **Clear space:** at least the height of the C's stroke on all sides.
- **Never** recolor the strands, add effects, rotate, or place the light-ground
  lockup on a dark ground (use the dark variant).
- The isologo works single-asset on both light and dark grounds (it carries its
  own forest outline) — that is why the favicon set derives from it.
- Favicons and PWA icons are **generated** from the isologo (see Task 3 of the
  migration plan; regeneration commands live in the commit that produced them).

## 3. Palette — measured, not asserted

The five canonical colors (from `PALETTE.md`) plus one derived value. Every
ratio below is **measured** (WCAG relative luminance), and
`tests/unit/lib/design-tokens.test.ts` re-computes the critical ones on every
test run.

| Color | Hex | Role | Key measurements |
|---|---|---|---|
| Cabuya Forest | `#0B3D32` | Primary brand; text on light; fills | 11.54:1 on White, 10.97:1 on Ivory — AAA |
| Fique Fiber | `#C79A4A` | The golden strand — accent, **decorative only on light** | 2.45:1 on White — **fails AA**; 5.96:1 on Night — AA |
| Cabuya Night | `#082A24` | Dark-mode ground; always-dark canvases | 14.59:1 under White text |
| Natural Ivory | `#F6F3ED` | Soft light ground; text on dark; on-fill | 13.87:1 on Night |
| Warm White | `#FAF9F6` | The page ground (light) | — |
| **Fique Strong** (derived) | **`#8A672C`** | The ONLY text-safe fique on light | **4.92:1 on White, 4.67:1 on Ivory** — measured, chosen as the lightest hue-held darkening passing both |

### The two rules that follow from the measurements

1. **Fique never carries text on a light ground.** Icons, strands, large
   display type and the logo only. Any *text* use of the fique hue on light
   goes through `--color-cabuya-accent-strong` (`#8A672C`).
2. **The brand color flips Forest → Fique in dark mode** (forest is unreadable
   on Night at ~1.9:1; fique measures 5.96:1). **The fill pair does not flip:**
   a filled brand surface is forest-with-ivory in both themes
   (`bg-cabuya-fill` + `text-cabuya-on-fill`, 10.97:1). Pairing
   `bg-cabuya-primary` with `text-white` is the bug this split exists to
   prevent.

Supporting tints (seedling `#CFE3D9`, the soft grounds, borders, text greys,
status colors) are all derived and measured — the full table with per-token
ratios is in [`docs/DESIGN.md`](./DESIGN.md) and rendered live at
`/internal/ui/colors`.

## 4. Typography

**Interim decision (recorded 2026-08-16, Task 3):** the baseline's self-hosted
pair carries over —

- **Outfit** for display (geometric sans; consistent with the wordmark's
  wide-tracked geometric letterforms),
- **Poppins** for body (already subset to latin + latin-ext, `font-display:
  swap`, zero new bytes).

Rationale: both faces are geometric sans in the family of the wordmark, the
loading is already optimized, and shipping a new webfont would spend
performance budget on a marginal gain. Revisit only if a bespoke brand face is
ever commissioned; record any change here and in the tokens
(`--font-sans` / `--font-display`).

## 5. Voice and tone

The register is a **serious technical standard that anyone can read**: calm,
concrete, humble, precise. Model: the way deepworkplan.com explains a
methodology; never the way a startup announces a launch.

- Spanish is written natively — with ñ, tildes and interrogative accents — and
  is never machine-flavored. English is not a translation of the Spanish, nor
  vice versa: both are first drafts in their own language.
- Normative keywords (MUST/SHOULD/MAY) appear **only** inside `spec/`.
- State the limit instead of writing around it: "The public specification is a
  draft under review" is better copy than an evasion.
- **Rule-0:** no invented figures, no endorsement we cannot maintain, no CTA to
  a channel we do not run, no conformance claim the validator has not measured.

### Banned vocabulary

From the founding verbal-identity analysis (`BRAND_AND_NAMING.md` §7.3) — these
words are how aid-tech marketing erodes trust, and they do not appear in Cabuya
copy in any language:

> revolucionario / revolutionary · disruptivo / disruptive · líder /
> leading · el mejor / the best · único / unique-in-the-world · certificado /
> certified · garantizado / guaranteed · "Powered by" · impacto exponencial ·
> game-changer · cutting-edge · world-class (about ourselves) · seamless ·
> innovador as filler

The word **certificado/certified is doubly banned**: conformance is *measured*,
and the validator's own output never says "certified" either.

## 6. Badge language

The conformance badge reads **«Compatible con Cabuya 1.0»** (EN: *"Cabuya 1.0
compatible"*) — always version-scoped, always backed by a validator
measurement, linking to the registry page where the measurement is visible.

- ✅ `Compatible con Cabuya 1.0` — version-scoped, measured, falsifiable
- ❌ `Powered by Cabuya` — implies a dependency relationship that doesn't exist
- ❌ `Certificado Cabuya` — banned word; certification implies an authority
  granting it, measurement is what actually happens
- ❌ `Compatible con Cabuya` — unversioned claims rot silently

Badge colors: forest-on-ivory or ivory-on-forest; the fique strand is the
graphic element, never the type color on light grounds.

## 7. Where the brand lives in the repo

| Surface | Path |
|---|---|
| Tokens (single declaration site) | `src/styles/global.css` `@theme` + `.dark` |
| Engineering contract | `docs/DESIGN.md` |
| Guard tests | `tests/unit/lib/design-tokens.test.ts` |
| Rendered brand book (dev-only) | `/internal/brand` |
| Live token table (dev-only) | `/internal/ui/colors` |
| Assets | `public/images/brand/`, `public/icons/`, `public/favicon.*` |
| Founding sources | `docs/context/brand/` |
