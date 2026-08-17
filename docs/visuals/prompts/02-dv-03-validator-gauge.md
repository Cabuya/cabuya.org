# DV-03 — Validator: the thread through the gauge

> **Pack 02 · Developers portal** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `/developers/validator` → beside the URL input
- **Type:** illustration
- **Priority:** high
- **Purpose:** Measurement without judgement. A thread passing through a simple gauge — the kind of aperture a rope-maker uses to check a diameter — is exactly what the validator does: it reports what passed through, it does not grade the maker. Nothing here may look like a dial, a score, or a traffic light.
- **Aspect & dimensions:** 1:1 · 320 × 320 displayed · generate @2x (640 × 640)
- **Light/dark strategy:** transparent — this sits beside a form control and needs to work on both the page ground and the panel ground, so a filled pair would fight the surface it lands on.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does. Forest-ink line work (`#0B3D32`) with ivory (`#F6F3ED`) highlights inside the forms, on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A simple round aperture — a plain metal ring or sizing gauge, drawn as a thin technical outline with no markings on it — seen slightly from the side. One laid cord passes cleanly through the centre of it, entering from the lower left and leaving at the upper right. The gold strand is visible within the cord's twist as it passes through the ring. The ring measures the cord; it does not constrain it. Nothing indicates pass or fail: no needle, no dial face, no scale, no arrow, no marks of any kind on the ring.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, rectangle, box or outline; hard straight edges; any background fill (the canvas must be transparent); glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals, labels, tick marks, scales or gauge markings**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces; disaster imagery; anything resembling a score, grade, dial, meter or traffic light.

- **Suggested asset path:** `public/images/visuals/developers/validator-gauge.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Beside the validator form, `loading="lazy"`, explicit width/height. Transparent asset — no dark variant, but check it against both grounds before shipping. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `validator-gauge.webp` 260 × 245 (11 KB) + `-2x` 520 × 490 (36 KB), ratio 1.061 rather than the nominal 1:1 — the gauge and the rope through it are not square, and the square canvas was padding. It sits in the intro band beside the lead, not next to the report panel: the validator is a Svelte island, and a drawing next to a result would read as a verdict, which is the one thing this entry forbids. Every master is re-framed by `scripts/build-illustrations.mjs`: trimmed to the drawing's own bounding box and padded back out until the ink occupies at most 84% of each axis. Nothing is cropped, so the composition is untouched — but the delivered aspect ratio is the drawing's own rather than the nominal one in this entry, and the drawing is larger inside its box than a plain resize would leave it, which is what makes it read on a phone.
- **Verified:** exactly the delivered 1.061 ratio · four corners fully transparent (alpha 0) · nothing touching any edge · at least 8% clear margin on all four sides after the re-frame · zero text · exactly one fique-gold strand · reads composited on `#FAF9F6` and on `#082A24` at the rendered size · present, decoded, undistorted and unclipped at all fifteen viewports in both themes (`illustrations:check`).
- **Judged:** Measurement without judgement, as asked. A thread passes through a plain rope-maker's gauge and continues; there is no dial, no needle, no scale and nothing that could be read as a grade. The gold strand is the thread being measured, which is the correct thing for it to be here.
- **Status:** integrated
