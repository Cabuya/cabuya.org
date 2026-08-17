# MK-01 — 404: the re-tied thread

> **Pack 05 · Marks and ornaments** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `src/components/pages/NotFoundPage.astro` → above the heading, replacing the current isologo
- **Type:** illustration
- **Priority:** medium
- **Purpose:** A broken link is a small failure, and the page should be gracious about it. A thread that snapped and has been knotted back together says "this happens, it is fixable, keep going" — and it stays inside the project's own vocabulary instead of reaching for a sad robot.
- **Aspect & dimensions:** 1:1 · 160 × 160 displayed · generate @2x (320 × 320)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, knots, and threads that bind. Line weight varies the way real cordage does. Forest-ink line work (`#0B3D32`) with ivory (`#F6F3ED`) highlights inside the forms, on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) — never a fill, never a second accent. Calm, warm, technical. Flat 2D. Generous margins. Print-quality line work.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A single thread running roughly horizontally, which has broken and been tied back together with a small, neat reef knot slightly off-centre. Both broken ends are still visible as short frayed tails beside the knot — the repair is honest, not hidden. The knot itself is drawn in fique gold (`#C79A4A`); the thread is forest ink. Very few strokes: this must read clearly at 96 pixels wide.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, box or outline; any background fill; gradients; glossy or 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals — including the digits "404"**; clip-art; emoji; a second accent colour; human faces; sad or apologetic imagery of any kind; fine detail that vanishes at 96 pixels.

- **Suggested asset path:** `public/images/visuals/marks/404-retied.webp`
- **Alt text (EN):** `alt=""` — decorative. The heading already says the page does not exist.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Replaces the isologo currently at the top of the 404. `loading="eager"`, explicit width/height. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `404-retied.webp` 320 × 67 (8 KB) + `-2x` 640 × 133 (23 KB). **Not 1:1**: the drawing is a horizontal rope with a knot in the middle, and 82% of the square canvas was empty — at 160 × 160 the rope would have been a 30 px sliver. Delivered at its own 4.78:1 and rendered 216 px wide on a phone, 320 px from `sm`, in place of the isologo the 404 used to repeat. Every master is re-framed by `scripts/build-illustrations.mjs`: trimmed to the drawing's own bounding box and padded back out until the ink occupies at most 84% of each axis. Nothing is cropped, so the composition is untouched — but the delivered aspect ratio is the drawing's own rather than the nominal one in this entry, and the drawing is larger inside its box than a plain resize would leave it, which is what makes it read on a phone.
- **Verified:** delivered ratio 4.78 · four corners fully transparent (alpha 0) · nothing touching any edge · at least 8% clear margin on all four sides after the re-frame · zero text · exactly one fique-gold strand · reads composited on `#FAF9F6` and on `#082A24` at the rendered size · present, decoded, undistorted and unclipped at all fifteen viewports in both themes (`illustrations:check`).
- **Judged:** Gracious, which was the brief. The rope snapped and someone tied it back together with the gold strand; the knot is neat and the rope is clearly still in service. No sad robot, no apology, and the page's own vocabulary.
- **Status:** integrated
