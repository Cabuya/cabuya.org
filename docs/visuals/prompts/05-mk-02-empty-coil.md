# MK-02 — Empty state: the waiting thread

> **Pack 05 · Marks and ornaments** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `src/components/ui/EmptyState.astro` → above the title
- **Type:** illustration
- **Priority:** low
- **Purpose:** Empty states in the registry are common and meaningful — "nothing has been measured at L3" is a true statement about today, not a failure. The mark should be neutral and unhurried: a coiled thread waiting to be used.
- **Aspect & dimensions:** 1:1 · 96 × 96 displayed · generate @2x (192 × 192)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a rope-maker's technical drawing: twisted fibres and threads. Forest-ink line work (`#0B3D32`) with ivory (`#F6F3ED`) highlights inside the forms, on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) — never a fill, never a second accent. Calm, technical. Flat 2D. Generous margins.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A short length of thread coiled loosely into a flat spiral, resting, with one end left free and pointing outward. Six or seven strokes at most. The free end is fique gold (`#C79A4A`). The mark should feel patient rather than empty — something set aside for later, not something missing.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, box or outline; elements touching the edges; any background fill; gradients; glossy or 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals**; clip-art; emoji; a second accent colour; human faces; sad, apologetic or "nothing here" imagery such as empty boxes or crossed-out symbols; any detail that vanishes at 96 pixels.

- **Suggested asset path:** `public/images/visuals/marks/empty-coil.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Optional prop on `EmptyState.astro`; the component must render correctly without it. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `empty-coil.webp` 128 × 84 (6 KB) + `-2x` 256 × 167 (16 KB), ratio 1.53 rather than 1:1. Two call sites: the optional `mark="coil"` prop on `EmptyState.astro`, which this entry asked for and which renders the generic line icon when it is absent; and the registry's not-yet-measured note, where it appears only while the measurement store is unreachable. That is the state the entry describes — "nothing has been measured" is a true statement about today — so the mark disappears the day the store is connected. Every master is re-framed by `scripts/build-illustrations.mjs`: trimmed to the drawing's own bounding box and padded back out until the ink occupies at most 84% of each axis. Nothing is cropped, so the composition is untouched — but the delivered aspect ratio is the drawing's own rather than the nominal one in this entry, and the drawing is larger inside its box than a plain resize would leave it, which is what makes it read on a phone.
- **Verified:** delivered ratio 1.53 · four corners fully transparent (alpha 0) · nothing touching any edge · at least 8% clear margin on all four sides after the re-frame · zero text · exactly one fique-gold strand · reads composited on `#FAF9F6` and on `#082A24` at the rendered size · present, decoded, undistorted and unclipped at all fifteen viewports in both themes (`illustrations:check`).
- **Judged:** Neutral and unhurried, and it does not read as an error state. A coil of rope with the gold end loose and ready; nothing about it suggests something went wrong, which is the difference between an empty state and a failure.
- **Status:** integrated
