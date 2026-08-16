# Corag — Design System

> **The agent-facing UI contract.** Read this before creating or modifying any
> component. Everything here is verifiable against `src/styles/global.css` — if
> this file and that file disagree, **this file is wrong** and must be fixed.
>
> - **[`BRAND_GUIDE.md`](./BRAND_GUIDE.md)** owns identity: what the mark means,
>   what the voice is, which colors are official.
> - **This file** owns implementation: exact token names, the utility classes
>   Tailwind generates from them, and the component patterns.
> - **[`ACCESSIBILITY.md`](./ACCESSIBILITY.md)** owns WCAG procedure.
>
> Measured ratios behind every rule here:
> [`CONTRAST_AUDIT.md`](../.dwp/plans/PLAN_corag_org_migration/analysis_results/CONTRAST_AUDIT.md).

---

## 1. How tokens become classes

Tokens are declared in a Tailwind 4 `@theme` block in `src/styles/global.css`.
Tailwind generates a utility for every `--color-*` token automatically:

```
--color-corag-primary   →   bg-corag-primary   text-corag-primary
                            border-corag-primary   ring-corag-primary
                            outline-corag-primary  shadow-corag-primary/20
```

You never write a hex value in a component. If you need a color that is not a
token, the answer is almost always that you need a different token — or that the
design is wrong.

**Never** override a `--color-corag-*` value outside `src/styles/global.css`. No
inline `style="--color-corag-primary: …"`, no scoped redefinition.

---

## 2. Color tokens

### 2.1 Brand — foreground

These **flip between themes**. Use them for text, icons, borders and focus rings.

| Token | Light | Dark | Use |
|---|---|---|---|
| `corag-primary` | `#78020e` | `#ffc7d5` | The brand color in running context |
| `corag-primary-strong` | `#5a0109` | `#ffe2e9` | Hover / pressed |
| `corag-primary-soft` | `#ffe2e9` | `#3a1a20` | Tinted surface behind primary content |
| `corag-primary-light` | `#ffc7d5` | `#ffc7d5` | The dark-mode primary, available in **both** themes — for content sitting on an intentionally dark canvas in light mode |

> **The inversion.** In light mode the brand is **wine**; in dark mode it is
> **rosa**. Wine on a dark ground measures **1.52:1** and is unusable. Both are
> official colors, so nothing is invented. Do not "fix" this.

### 2.2 Brand — solid fill (does **not** flip)

| Token | Both themes | Use |
|---|---|---|
| `corag-fill` | `#78020e` | Background of a filled brand surface |
| `corag-fill-strong` | `#5a0109` | Its hover state |
| `corag-on-fill` | `#ffe2e9` | The label **on** that surface — 9.54:1 |

```astro
<!-- ✅ correct — works identically in both themes -->
<a class="bg-corag-fill text-corag-on-fill hover:bg-corag-fill-strong">Quiero ayudar</a>

<!-- ❌ wrong — becomes white-on-rosa (~1.5:1) in dark mode -->
<a class="bg-corag-primary text-white">Quiero ayudar</a>
```

This is the single most common way to get the design system wrong. A primary
button needs **no dark variant**.

### 2.3 Rosa

| Token | Light | Dark |
|---|---|---|
| `corag-rosa` | `#ffc7d5` | `#ffc7d5` |
| `corag-rosa-soft` | `#ffe2e9` | `#ffe2e9` |

Rosa is an **official brand color**, not a tint of the wine. It is what makes
Corag feel warm rather than severe. Use it.

### 2.4 Accent — ⚠️ restricted

| Token | Light | Dark |
|---|---|---|
| `corag-accent` | `#bc727c` | `#bc727c` |
| `corag-accent-strong` | `#a34f5a` | `#d8a3aa` |

**`corag-accent` is never body text.** It fails AA on every light ground
(2.46–3.60). Permitted: large text ≥24px or ≥19px bold, hairlines, decorative
shapes, icon fills paired with an accessible label.

When the rose accent must carry readable text, use **`corag-accent-strong`**
(5.19:1 on the page ground).

### 2.5 Surfaces

| Token | Light | Dark |
|---|---|---|
| `corag-bg` | `#fbf8f5` | `#231518` |
| `corag-bg-elevated` | `#ffffff` | `#2e1b1f` |
| `corag-bg-brand` | `#ffe2e9` | `#3a1a20` |
| `corag-bg-brand-strong` | `#ffc7d5` | `#4a2128` |
| `corag-bg-dark` | `#231518` | `#231518` |

`corag-bg-dark` is identical in both themes — for sections that intentionally
keep the wine-black identity regardless of theme.

### 2.6 Text

| Token | Light | Dark | Min ratio |
|---|---|---|---|
| `corag-text` | `#251f20` | `#f0e3e4` | 11.10 / 12.47 |
| `corag-text-secondary` | `#574f51` | `#d6c4c7` | 5.44 / 9.33 |
| `corag-text-muted` | `#635b5d` | `#92888a` | 4.52 / 4.53 |

Short aliases, because they are used constantly:

```
text-corag             ==  text-corag-text
text-corag-secondary   ==  text-corag-text-secondary
```

**`corag-text-muted` is the lightest permitted body text.** There is nothing
lighter that passes.

**Banned, always:** `text-gray-400` · `text-gray-500` · `dark:text-gray-400` ·
`dark:text-gray-500`.

### 2.7 Borders

| Token | Light | Dark | Use |
|---|---|---|---|
| `corag-border` | `#e8e0dc` | `#3e2a2e` | Decorative hairlines, dividers |
| `corag-border-strong` | `#c9b9b5` | `#5c4247` | Decorative emphasis |
| `corag-border-interactive` | `#968f8d` | `#7f6c6f` | **Inputs, selects, control edges** |

> WCAG 1.4.11 requires 3:1 for boundaries that convey meaning. `corag-border`
> sits at 1.23 — fine for a divider, **not** for an input outline. Any control
> edge uses `corag-border-interactive`.

### 2.8 Status

| Token | Light | Dark | Meaning in Corag |
|---|---|---|---|
| `corag-success` / `-soft` | `#24735d` / `#e7f3ee` | `#559381` / `#16302a` | entregado · **con evidencia** · completado |
| `corag-warning` / `-soft` | `#995d30` / `#f6ecdf` | `#b37b4f` / `#33240f` | en organización · pendiente |
| `corag-info` / `-soft` | `#3c6176` / `#eaf1f4` | `#6e8b9b` / `#17262e` | informativo · neutral |
| `corag-danger` / `-soft` | `#a43536` / `#fdecec` | `#c37073` / `#331416` | **urgente** · error |

> **Status colors sit on page or `-soft` chip grounds — never on the rosa brand
> surfaces.** They were verified against the former, not the latter.

---

## 3. Typography

| Token | Value |
|---|---|
| `--font-sans` | **Poppins**, then system fallbacks |
| `--font-display` | **Outfit**, then Poppins, then system fallbacks |

Both self-hosted from `/public/fonts`. Outfit is a variable font (400–800).
**Never add an external font request.**

```astro
<h1 class="font-display text-4xl font-bold">…</h1>   <!-- Outfit -->
<p class="text-base">…</p>                            <!-- Poppins, inherited -->
```

### Scale

| Role | Classes |
|---|---|
| Page title (h1) | `font-display text-4xl md:text-5xl font-bold tracking-tight` |
| Section (h2) | `font-display text-2xl md:text-3xl font-semibold` |
| Subsection (h3) | `font-display text-xl font-semibold` |
| Body | `text-base leading-relaxed` |
| Lead paragraph | `text-lg leading-relaxed text-corag-secondary` |
| Small print | `text-sm text-corag-secondary` |

**Never** set body copy below `text-base` (16px). This is a site people read
while worried — give the text room: `leading-relaxed` or looser on long-form.

**Never** skip a heading level. `h1` → `h3` is a defect, not a style choice.

---

## 4. Spacing, radius, elevation, motion

### Container

```astro
<div class="main-container">…</div>
```
`max-w-7xl`, centered, `px-4 md:px-6`. Defined in `@layer components`.

### Radius

| Token | Value | Use |
|---|---|---|
| `--radius-corag-sm` | `12px` | Chips, inputs, small controls |
| `--radius-corag-md` | `18px` | Cards, panels |
| `--radius-corag-lg` | `28px` | Hero panels, large feature surfaces |

Buttons use `rounded-full` — the brand reads friendlier that way.

### Elevation

| Token | Light | Dark |
|---|---|---|
| `--shadow-corag-sm` | `0 8px 24px rgb(60 2 12 / 0.08)` | `0 8px 24px rgb(0 0 0 / 0.35)` |
| `--shadow-corag-lg` | `0 28px 70px rgb(60 2 12 / 0.14)` | `0 28px 70px rgb(0 0 0 / 0.5)` |

> The light-mode shadows are **wine-tinted on purpose**. Do not "normalize" them
> to neutral grey — it desaturates the whole page.

### Motion

Transitions: `transition-colors duration-200` for state changes. Every
non-essential animation must be disabled under reduced motion — `global.css`
already applies a global guard, but component-level animations must not fight it:

```css
@media (prefers-reduced-motion: reduce) { .my-animation { animation: none; } }
```

---

## 5. Dark mode

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Most components need **no** `dark:` classes at all — the tokens flip themselves.
Reach for `dark:` only when the *structure* changes, not the palette.

```astro
<!-- ✅ flips automatically -->
<div class="bg-corag-bg-elevated text-corag border border-corag-border">…</div>

<!-- ⚠️ only when the design genuinely differs between themes -->
<div class="shadow-corag-sm dark:shadow-none">…</div>
```

---

## 6. Component patterns

### Buttons

```astro
<!-- Primary — theme-invariant -->
<a class="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-corag-fill
          px-6 py-3 font-semibold text-corag-on-fill transition-colors
          hover:bg-corag-fill-strong focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-corag-primary">
  Quiero ayudar
</a>

<!-- Secondary -->
<a class="inline-flex min-h-[44px] items-center gap-2 rounded-full border
          border-corag-primary px-6 py-3 font-semibold text-corag-primary
          transition-colors hover:bg-corag-primary-soft">
  Cómo funciona
</a>

<!-- Ghost -->
<a class="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2
          font-medium text-corag-secondary transition-colors
          hover:text-corag-primary">
  Ver más
</a>
```

Minimum touch target **44×44px**.

### Card

```astro
<article class="rounded-[18px] border border-corag-border bg-corag-bg-elevated
                p-6 shadow-corag-sm transition-shadow hover:shadow-corag-lg">
  <h3 class="font-display text-xl font-semibold text-corag">…</h3>
  <p class="mt-2 text-corag-secondary">…</p>
</article>
```

### Status pill

```astro
<span class="inline-flex items-center gap-1.5 rounded-full bg-corag-success-soft
             px-3 py-1 text-sm font-medium text-corag-success">
  Con evidencia
</span>
```

Swap `success` → `warning` / `info` / `danger` per §2.8. **Never rely on color
alone** to convey status — always pair it with a word or an icon plus a label.

### Form field

```astro
<label for="nombre" class="block text-sm font-medium text-corag">Nombre</label>
<input id="nombre" name="nombre"
       class="mt-1 block w-full rounded-[12px] border border-corag-border-interactive
              bg-corag-bg-elevated px-4 py-2.5 text-corag
              placeholder:text-corag-text-muted
              focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-corag-primary" />
```

`border-corag-border-interactive`, not `border-corag-border`. Every input has a
bound `<label>` — a placeholder is not a label.

### Navigation dropdown

Use the **disclosure pattern**: a `<button aria-expanded aria-controls>` plus a
panel. **Never `role="menu"`** — that ARIA role implies application-menu keyboard
semantics this site does not implement.

### Images

```astro
<img src="/images/…" alt="Descripción significativa"
     width={800} height={450} loading="lazy" decoding="async" />
```

`width` and `height` on **every** image. `alt=""` for purely decorative images.
The Corag wordmark is `342 × 100` (3.4156:1) — see `BRAND_GUIDE.md`.

---

### Homepage act system

The home (`src/components/pages/HomePage.astro`) is built as five **acts**,
each a full-bleed section with contained content. The binding conventions
(established by PLAN_world_class_homepage; keep new home sections inside
them):

- **Type scale:** hero `text-4xl → sm:text-5xl → lg:text-6xl → xl:text-7xl`
  (`font-display`, `tracking-tight`, `leading-[1.02]`); act titles
  `text-3xl → sm:text-4xl → lg:text-5xl` at `leading-[1.08]`.
- **Rhythm:** acts use `py-20 sm:py-24 lg:py-32`; title→content gap
  `mt-12 lg:mt-16`.
- **Hero fills the viewport exactly** at every breakpoint:
  `min-h-[calc(100dvh-var(--corag-chrome-height))]` — the layout keeps that
  variable synced to the sticky chrome. Keep hero content lean enough to fit
  a 360×640 fold; its `:root` default must match the measured header height
  or the hero shifts (CLS).
- **Copy contract:** every user-visible home string lives in `HomeCopy`
  (`src/lib/translations/types.ts` → both locales → both
  `src/content/pages/{es,en}/index.md` twins, same commit).
  `tests/unit/lib/home-copy.test.ts` pins non-emptiness, locale parallelism
  and the evidence-act **no-amounts rule** — the evidence copy must never
  contain a digit or currency sign.
- **Scroll reveals:** add `data-reveal` (optionally
  `style="--reveal-delay: 80ms"`) to a block; the deferred module in
  `HomePage.astro` and the CSS in `global.css` do the rest. Never hide
  content by default — the hidden state only exists under
  `html[data-reveal-ready]`, which only JS sets, inside
  `prefers-reduced-motion: no-preference`.
- **Screenshots** of the application come only from
  `scripts/capture-app-screens.mjs` (responsive WebP sets +
  `public/images/home/app/CAPTURES.json` provenance). Re-capturing requires
  the human personal-data review the script header describes, then
  `--attest`. Device frames are CSS (browser bar / phone bezel), never baked
  into images.

### Institutional page system

Seven pages — how-it-works, transparency, emergencies, leaders, partners,
developers, privacy — render from one component
(`src/components/pages/InstitutionalPage.astro`) and one copy object
(`InstitutionalPageCopy`). Fix the renderer once and all seven improve; style
one page by hand and you have started the drift the shared renderer exists to
prevent.

**Treatment tiers.** What a page *is* decides what it gets:

| Tier | Pages | Treatment |
|---|---|---|
| Product | how-it-works, transparency, emergencies, developers, leaders | Real app screens in CSS device frames. The product is the imagery. |
| Narrative | about, partners, channels, contact | Designed non-photographic treatments; an illustration only where one is commissioned. |
| Policy | privacy, governance, conduct, contributing | Typographic structure — section index, anchors, designed callouts. **No decorative imagery**: it trivializes the content. |

**Block kinds** (`InstitutionalBlock`): `prose`, `steps`, `cards`, `list`,
`callout`, `figure`, `split`, `statPair`. Adding one is a four-part change —
union, renderer, twin serializer, tests — with a silent failure mode if you
skip the serializer. Use the `add-institutional-block` skill.

**The hero is never empty.** Its second column renders `heroFigure` when the
page has one and the brand heart motif when it does not. A page whose hero
leaves half the viewport blank is a bug, not a style choice.

**Figures.** `InstitutionalFigure` takes `srcBase` + `widths` and derives
`src`/`srcset`, so pages never hand-write responsive sets. Frames (`browser`,
`phone`) are CSS: a re-captured screenshot drops straight in and the chrome
themes with the token layer. An app screenshot **must** carry a `caption`
declaring the data is live application data — this site never states a figure
of its own (rule 0).

**Long, imagery-free pages** may set `sectionIndexLabel` to get an in-page
index of their section headings. Navigability, not decoration.

## 7. Anti-patterns

| ❌ Don't | ✅ Do |
|---|---|
| `bg-corag-primary text-white` | `bg-corag-fill text-corag-on-fill` |
| `text-gray-500`, `dark:text-gray-400` | `text-corag-secondary` / `text-corag-text-muted` |
| `corag-accent` on body text | `corag-accent-strong`, or `corag-primary` |
| `style="--color-corag-primary: …"` | Change it in `global.css` or use a different token |
| A hex literal in a component | A token |
| `border-corag-border` on an input | `border-corag-border-interactive` |
| `role="menu"` on a nav dropdown | The disclosure pattern |
| `client:load` | `client:visible` / `client:idle` |
| A hardcoded user-visible string | `getTranslations(lang)` |
| A hardcoded `/en` prefix | `getUrlPrefix(lang)` |
| A `<img>` with no dimensions | Always `width` + `height` |
| Color alone to signal status | Color **plus** a word or labelled icon |
| An external font or CDN request | Self-hosted from `/public/fonts` |

---

## 8. Checklist before shipping a component

- [ ] Zero hex literals; every color is a token.
- [ ] Solid brand surfaces use `fill` / `on-fill`, not `primary` + `text-white`.
- [ ] Renders correctly in **both** themes — checked, not assumed.
- [ ] Heading hierarchy unbroken.
- [ ] Every image has `width` + `height` and meaningful `alt` (or `alt=""`).
- [ ] Keyboard reachable, with a visible focus state.
- [ ] Touch targets ≥ 44×44px.
- [ ] Reduced motion honored.
- [ ] Zero hardcoded user-visible strings.
- [ ] `.astro` unless it genuinely needs interactivity; then the laziest
      `client:*` directive that works.
