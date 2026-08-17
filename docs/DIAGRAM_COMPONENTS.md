# Diagram Components — the Cabuya standard

> Diagrams on cabuya.org are **HTML/CSS/SVG components, never images**. Read
> this before creating or modifying one.
>
> Adapted from the deepworkplan.com editorial asset standard, which in turn
> adapts Dailybot's interactive-asset system. The pattern is proven; what
> follows is the Cabuya-specific contract.

---

## 1. Why not images

A protocol site is mostly explanation, and explanation is mostly diagrams. Four
properties decide the format:

| Property | Component | Image |
|---|---|---|
| Translating a label | one key in a diff a reviewer can read | regenerate and re-export, per language |
| Dark mode | free — strokes inherit `currentColor` | a second file, kept in sync by hand |
| Zoom to 400% | stays sharp; text is real text | pixels |
| Selecting or searching the text | works | does not exist |

The rule of thumb, verbatim from the brief: **needs text → HTML/CSS component;
wordless atmosphere → generated image.** The illustration pack (Task 20) covers
the second half.

## 2. The mandatory rules

1. **One component per use case.** No `variant` or `mode` props to make one
   component serve two sections. A diagram is a figure, and a figure appears in
   one place. Shared *primitives* are in `global.css`; shared *assets* are not.
2. **Zero JavaScript.** Diagrams are `.astro`. A Svelte island is allowed only
   when a genuinely low-cognitive interaction earns it (a two-state comparison
   toggle), always `client:visible`, never `client:load`.
3. **All text through the i18n map.** Including `aria-label`. No string a reader
   can see is written inline in the markup.
4. **`role="img"` + a localized `aria-label` that describes the content**, not
   the shape. "Five levels from Listed to Federates, each unlocking more of the
   network" — not "a diagram of the conformance ladder".
5. **Explicit `aspect-ratio`.** A diagram that reserves no space is a diagram
   that shifts the paragraph under it.
6. **Tokens only.** No hex literals. Strokes and text inherit `currentColor`
   from `.cabuya-figure`, which is how dark mode comes for free.
7. **One accent per diagram.** The fique strand marks the single thing the
   reader should look at first. Two accents means neither is the accent.
8. **`prefers-reduced-motion` respected** by any diagram that moves. Most do
   not move at all, which is the better answer.

## 3. Anatomy

```astro
---
/**
 * WhatItIs — one sentence on what the diagram argues.
 *
 * Spec anchor, if it visualises normative text.
 */
import type { Language } from '@/lib/i18n';

interface Props {
  lang?: Language;
  class?: string;
}

const { lang = 'en', class: className = '' } = Astro.props;

const i18n = {
  en: { ariaLabel: '…', caption: '…', /* labels */ },
  es: { ariaLabel: '…', caption: '…', /* etiquetas */ },
} as const;

const t = i18n[lang as keyof typeof i18n] ?? i18n.en;
---

<figure class:list={['cabuya-figure', className]} role="img" aria-label={t.ariaLabel}>
  <svg viewBox="0 0 640 360" aria-hidden="true" focusable="false" style="aspect-ratio: 640 / 360">
    …
  </svg>
  <figcaption>{t.caption}</figcaption>
</figure>
```

`en` fallback is mandatory: an unsupported language degrades to English and
never renders blank.

### Adding a language

Add one key to each map. That is the entire change — no new asset, no export
pipeline, no per-language file. It is reviewable as a normal diff, which is the
property that makes the whole approach worth its extra markup.

### What stays in English in every language

Check ids (`REC001`), level names as identifiers (`L0`–`L4`), field names
(`last_confirmed_at`), HTTP verbs, MIME types, and `robots.txt`. These are
protocol vocabulary: translating them would produce a diagram that teaches a
Spanish reader a name that does not exist in the schema.

## 4. Visual style

Built from the `.cabuya-*` primitives in `src/styles/global.css`:

| Primitive | Role |
|---|---|
| `.cabuya-figure` | The plate: hairline border, elevated ground, generous padding, caption rule |
| `.cabuya-node` | An outlined panel. No heavy fills |
| `.cabuya-node--accent` | The one panel the eye should land on |
| `.cabuya-node--dark` | A forest-filled panel, for the protocol itself |
| `.cabuya-line` / `--accent` / `--dashed` | Hairline connectors; accent for the one path that matters; dashed for "optional" or "later" |
| `.cabuya-label` / `.cabuya-sub` / `.cabuya-kicker` / `.cabuya-mono` | Display label · supporting line · small-caps section marker · identifiers and field names |

Discipline: hairlines over fills, generous margins, no drop shadows, no
gradients, no icon font. These should read as printed figures.

## 5. Accessibility

- The `<svg>` is `aria-hidden`; the `<figure>`'s `aria-label` carries the
  meaning. A screen reader should get the *argument* of the diagram in one
  sentence, not a tour of its boxes.
- Never encode meaning in colour alone. A path that matters is thicker *and*
  accent-coloured; a state that failed carries a word.
- Text is real SVG `<text>`, so it scales with the page and can be selected.
- Minimum type size inside a figure is 10px only for small-caps kickers, which
  are redundant labels; anything load-bearing is 11.5px or larger.

## 6. Embedding

- **Astro pages** import the component directly and pass `lang`.
- **Markdown content** renders through a reader that maps a slug to its
  diagram, so prose stays `.md` and the diagram lands at the marked point.
- **Markdown twins** get the `aria-label` as the diagram's textual stand-in —
  an agent reading the twin receives the argument, not a dangling figure
  reference.

## 7. The catalogue

| Component | Argues | Used on | Status |
|---|---|---|---|
| `protocol/ConformanceLadder.astro` | Five levels, each a respected membership class; two tiers that stop at L1 by rule or by choice | Landing, `/developers/spec/0.1/1-architecture` | ✅ |
| `protocol/OneSchemaFourTransports.astro` | One `place` record, four ways to move it; the schema does not change per transport | Landing, `/developers` | ✅ |
| `protocol/FeedAnatomy.astro` | The envelope's required fields, and what each one is for | `/developers/quickstart`, spec §3 | ✅ |
| `protocol/VerificationBlock.astro` | `updated_at` is not `last_confirmed_at`; null is a valid, useful answer | Spec §6, quickstart | ✅ |
| `protocol/NetworkFlow.astro` | Publishers feed consumers who are also publishers; attribution travels with the data | Landing | ✅ |
| `protocol/ExclusionBoundary.astro` | Person-level data never crosses; the link-out is the door | Spec §7, landing | ✅ |
| `developers/QuickstartPath.astro` | Five steps from nothing to a measured badge | `/developers/quickstart` | ✅ |
| `developers/ValidatorLoop.astro` | Run, read, fix, re-run, register — the loop an agent closes | `/developers/validator` | ✅ |

**Reference implementation:** `protocol/ConformanceLadder.astro`. When in doubt
about spacing, label placement or i18n shape, match it.

## 8. Enforcement

`tests/unit/lib/diagram-components.test.ts` walks every file under
`src/components/diagrams/` and asserts: an i18n map with a key for every active
language, `role="img"`, a localized `aria-label`, an explicit `aspect-ratio`, no
hex colour literals, and no `client:load`. These are source assertions — greps
with documented limits, not a rendering check. The gallery at
`/internal/ui/diagrams` is the rendering check, and it is a human one.
