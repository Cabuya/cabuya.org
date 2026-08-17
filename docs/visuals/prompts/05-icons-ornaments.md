# Prompt Pack — Marks and ornaments

> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md). Every **Prompt** field is
> copy-paste ready and self-contained.
>
> Small transparent pieces. All of these must read at 96 pixels, which means
> very few strokes — a mark that needs detail to be legible is the wrong mark.

---

### MK-01 — 404: the re-tied thread

- **Target surface:** `src/components/pages/NotFoundPage.astro` → above the heading, replacing the current isologo
- **Type:** illustration
- **Priority:** medium
- **Purpose:** A broken link is a small failure, and the page should be gracious about it. A thread that snapped and has been knotted back together says "this happens, it is fixable, keep going" — and it stays inside the project's own vocabulary instead of reaching for a sad robot.
- **Aspect & dimensions:** 1:1 · 160 × 160 displayed · generate @2x (320 × 320)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, knots, and threads that bind. Line weight varies the way real cordage does. Forest-ink line work (`#0B3D32`) with **one single fique-gold strand** (`#C79A4A`) — never a fill, never a second accent. Calm, warm, technical. Flat 2D. Generous margins. Print-quality line work.
  >
  > **SUBJECT —** A single thread running roughly horizontally, which has broken and been tied back together with a small, neat reef knot slightly off-centre. Both broken ends are still visible as short frayed tails beside the knot — the repair is honest, not hidden. The knot itself is drawn in fique gold (`#C79A4A`); the thread is forest ink. Very few strokes: this must read clearly at 96 pixels wide.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha), no fill.** The thread fades out softly before both left and right canvas edges. Centred with generous margin. No border or outline.
  >
  > **AVOID —** any border, frame, box or outline; elements touching or clipped by the edges; any background fill; gradients; glossy or 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals — including the digits "404"**; clip-art; emoji; a second accent colour; human faces; sad or apologetic imagery of any kind; fine detail that vanishes at 96 pixels.

- **Suggested asset path:** `public/images/visuals/marks/404-retied.webp`
- **Alt text (EN):** `alt=""` — decorative. The heading already says the page does not exist.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Replaces the isologo currently at the top of the 404. `loading="eager"`, explicit width/height.
- **Status:** to-generate

---

### MK-02 — Empty state: the waiting thread

- **Target surface:** `src/components/ui/EmptyState.astro` → above the title
- **Type:** illustration
- **Priority:** low
- **Purpose:** Empty states in the registry are common and meaningful — "nothing has been measured at L3" is a true statement about today, not a failure. The mark should be neutral and unhurried: a coiled thread waiting to be used.
- **Aspect & dimensions:** 1:1 · 96 × 96 displayed · generate @2x (192 × 192)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a rope-maker's technical drawing: twisted fibres and threads. Forest-ink line work (`#0B3D32`) with **one single fique-gold strand** (`#C79A4A`) — never a fill, never a second accent. Calm, technical. Flat 2D. Generous margins.
  >
  > **SUBJECT —** A short length of thread coiled loosely into a flat spiral, resting, with one end left free and pointing outward. Six or seven strokes at most. The free end is fique gold (`#C79A4A`). The mark should feel patient rather than empty — something set aside for later, not something missing.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha), no fill.** Soft edges, centred, generous margin. No border or outline.
  >
  > **AVOID —** any border, frame, box or outline; elements touching the edges; any background fill; gradients; glossy or 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals**; clip-art; emoji; a second accent colour; human faces; sad, apologetic or "nothing here" imagery such as empty boxes or crossed-out symbols; any detail that vanishes at 96 pixels.

- **Suggested asset path:** `public/images/visuals/marks/empty-coil.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Optional prop on `EmptyState.astro`; the component must render correctly without it.
- **Status:** to-generate

---

### MK-03 — Section ornament

- **Target surface:** landing and long portal pages → between major sections, as a divider
- **Type:** illustration
- **Priority:** low
- **Purpose:** A typographic breath between sections, in the project's own vocabulary rather than a generic asterisk or three dots. Used sparingly — three or four times on the longest page, never as a rule between every heading.
- **Aspect & dimensions:** 3:1 · 120 × 40 displayed · generate @2x (240 × 80)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a rope-maker's technical drawing. Forest-ink line work (`#0B3D32`) with **one single fique-gold strand** (`#C79A4A`). Calm, technical, editorial. Flat 2D.
  >
  > **SUBJECT —** A short horizontal ornament: three fine threads lying side by side, briefly twisting around each other at the centre and separating again toward both ends. Symmetrical. The middle thread is fique gold (`#C79A4A`). Extremely simple — this is a typographic ornament, closer to a fleuron than to an illustration.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha), no fill.** Threads fade out at both ends rather than being cut. No border or outline.
  >
  > **AVOID —** any border, frame, box or outline; any background fill; gradients; 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals**; clip-art; emoji; a second accent colour; ornamental flourishes, scrollwork or Victorian filigree.

- **Suggested asset path:** `public/images/visuals/marks/ornament-braid.webp`
- **Alt text (EN):** `alt=""` — decorative, always.
- **Alt text (ES):** `alt=""` — decorativa, siempre.
- **Integration note:** Wrap in `<Rule>`-adjacent markup or use as a `background-image` on a divider; either way `aria-hidden`.
- **Status:** to-generate
