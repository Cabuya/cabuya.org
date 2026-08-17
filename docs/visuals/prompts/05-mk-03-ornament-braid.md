# MK-03 — Section ornament

> **Pack 05 · Marks and ornaments** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** landing and long portal pages → between major sections, as a divider
- **Type:** illustration
- **Priority:** low
- **Purpose:** A typographic breath between sections, in the project's own vocabulary rather than a generic asterisk or three dots. Used sparingly — three or four times on the longest page, never as a rule between every heading.
- **Aspect & dimensions:** 3:1 · 120 × 40 displayed · generate @2x (240 × 80)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a rope-maker's technical drawing. Forest-ink line work (`#0B3D32`) with ivory (`#F6F3ED`) highlights inside the forms, on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`). Calm, technical, editorial. Flat 2D.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A short horizontal ornament: three fine threads lying side by side, briefly twisting around each other at the centre and separating again toward both ends. Symmetrical. The middle thread is fique gold (`#C79A4A`). Extremely simple — this is a typographic ornament, closer to a fleuron than to an illustration.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, box or outline; any background fill; gradients; 3D render; photographic realism; neon; drop shadows; watermark; any logo; **any text, letters or numerals**; clip-art; emoji; a second accent colour; ornamental flourishes, scrollwork or Victorian filigree.

- **Suggested asset path:** `public/images/visuals/marks/ornament-braid.webp`
- **Alt text (EN):** `alt=""` — decorative, always.
- **Alt text (ES):** `alt=""` — decorativa, siempre.
- **Integration note:** Wrap in `<Rule>`-adjacent markup or use as a `background-image` on a divider; either way `aria-hidden`. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `ornament-braid.webp` 240 × 16 (3 KB) + `-2x` 480 × 32 (9 KB). **15:1, not 3:1** — the drawing is a hairline braid and the 3:1 canvas was 80% empty. Placed through `SectionOrnament.astro`, three times on the landing: thesis → mechanics, ladder → network, network → horizon. A component rather than a utility class, so adding a fourth is a deliberate edit and the entry's "never between every heading" survives contact with the next person. Every master is re-framed by `scripts/build-illustrations.mjs`: trimmed to the drawing's own bounding box and padded back out until the ink occupies at most 84% of each axis. Nothing is cropped, so the composition is untouched — but the delivered aspect ratio is the drawing's own rather than the nominal one in this entry, and the drawing is larger inside its box than a plain resize would leave it, which is what makes it read on a phone.
- **Verified:** delivered ratio 15.0 · `aria-hidden` on the wrapper and `alt=""` on the mark, so a screen reader gets what a `<hr>` would give it — nothing · four corners fully transparent (alpha 0) · nothing touching any edge · at least 8% clear margin on all four sides after the re-frame · zero text · exactly one fique-gold strand · reads composited on `#FAF9F6` and on `#082A24` at the rendered size · present, decoded, undistorted and unclipped at all fifteen viewports in both themes (`illustrations:check`).
- **Judged:** Punctuation, not a rule. Two dark strands and one gold one meeting at a single crossing, at 80% opacity: it separates without announcing a new topic, which is what the sections it sits between need.
- **Status:** integrated
