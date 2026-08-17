# RG-01 — Registry: the woven net

> **Pack 03 · Registry, governance and join** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `/registry` → header, beside the intro and the filters
- **Type:** illustration
- **Priority:** high
- **Purpose:** A registry of organisations, drawn as a net: knots joined by cord, each knot the same size as every other. No knot is bigger, more central, or more finished than the rest. This is the whole political claim of the registry made visual — it lists, it measures, and it does not rank.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** **transparent, one asset.** No matched pair and no `-dark` file: the ink carries both a forest-dark and an ivory value, so a single alpha asset reads correctly on `#FAF9F6` and on `#082A24`. It is also the only way the ground can be exactly right — every lossy WebP of a flattened background lands a step or two off the token and leaves a faint rectangle on the page.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Forest ink (`#0B3D32`) deepening to near-black in the shadows, with ivory (`#F6F3ED`) highlights inside the forms, all on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work; any paper tooth is drawn into the strokes themselves, never laid down as a background wash.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A section of hand-knotted net, drawn the way a fishing-net repair manual would show it: clear square or diamond mesh, each intersection a visible knot, the knots all the same size and drawn with equal care. The net is not perfectly regular — it is handmade, so the mesh varies slightly — and it is unfinished at two edges where the cords continue as loose ends into open paper. One cord running diagonally through the mesh is fique gold (`#C79A4A`), passing through several knots without being more prominent than them. No frame, no float, no fish, no water.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, rectangle, box or outline; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery; any knot drawn larger, brighter or more central than the others.

- **Suggested asset path:** `public/images/visuals/registry/registry-net.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Registry header, `loading="eager"`, explicit width/height. Must not appear on individual publisher pages. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `registry-net.webp` 460 × 321 (44 KB) + `-2x` 920 × 642 (134 KB), ratio 1.433. In the registry header beside the heading and the lead, `eager`, and on that surface only — `PublisherPage.astro` has no artwork, because a net on one publisher's page would read as that publisher standing for the network. The header ground is forest (`bg-cabuya-bg-dark`) in both themes, so this is one of the two assets that lands on a ground that is neither page ground. Every master is re-framed by `scripts/build-illustrations.mjs`: trimmed to the drawing's own bounding box and padded back out until the ink occupies at most 84% of each axis. Nothing is cropped, so the composition is untouched — but the delivered aspect ratio is the drawing's own rather than the nominal one in this entry, and the drawing is larger inside its box than a plain resize would leave it, which is what makes it read on a phone.
- **Verified:** delivered ratio 1.433 · four corners fully transparent (alpha 0) · nothing touching any edge · at least 8% clear margin on all four sides after the re-frame · zero text · exactly one fique-gold strand · reads composited on `#FAF9F6` and on `#082A24` at the rendered size · present, decoded, undistorted and unclipped at all fifteen viewports in both themes (`illustrations:check`).
- **Judged:** The political claim survives the drawing: every knot is the same size, no knot is more central or more finished, and the mesh is visibly unfinished at its edges. The gold cord runs through as one strand among equals rather than as a spine holding the rest together.
- **Status:** integrated
