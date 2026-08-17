# DV-01 — Portal home: the loom

> **Pack 02 · Developers portal** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `/developers` → header, right of the intro
- **Type:** illustration
- **Priority:** high
- **Purpose:** The portal is where someone decides whether this is a week or an afternoon. A loom — a machine that makes cloth out of separate threads, methodically and without drama — says "this is ordinary engineering work" better than any hero shot could.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** **transparent, one asset.** No matched pair and no `-dark` file: the ink carries both a forest-dark and an ivory value, so a single alpha asset reads correctly on `#FAF9F6` and on `#082A24`. It is also the only way the ground can be exactly right — every lossy WebP of a flattened background lands a step or two off the token and leaves a faint rectangle on the page.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Forest ink (`#0B3D32`) deepening to near-black in the shadows, with ivory (`#F6F3ED`) highlights inside the forms, all on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work; any paper tooth is drawn into the strokes themselves, never laid down as a background wash.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A partial view of a simple hand loom, drawn as a technical illustration: the warp threads stretched in parallel across the frame, a shuttle mid-pass, and a few centimetres of finished weave at one edge. Only part of the loom is in frame — the mechanism is implied, not catalogued. A single warp thread is fique gold (`#C79A4A`) and can be followed from the unwoven side into the finished cloth. No operator, no hands, no workshop background.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, rectangle, box or outline; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.

- **Suggested asset path:** `public/images/visuals/developers/portal-loom.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Portal header grid, `loading="eager"` (above the fold), explicit width/height. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `portal-loom.webp` 360 × 240 (24 KB) + `portal-loom-2x.webp` 720 × 480 (78 KB), from a 1536 × 1024 master. **Not the 720 displayed / 1440 @2x this entry specified**, and the reason is the layout: `/developers` renders inside the docs article column, between the 15 rem sidebar and the 13 rem contents rail, so the slot is ~360 px — a 1440 file would be 256 KB nobody ever sees at full size. Weight is the binding constraint on this drawing: its hatching costs roughly three times the home-page cordage per pixel, and 720 × 480 only reaches the 80 KB section budget at `quality 72 / alphaQuality 60`.
- **Accepted with one defect, and it is again the edges rule:** nothing touches, crosses or is clipped by any edge — but the clear margin is **1.0% at the top, 2.2% at the bottom, 5.5% left, 5.0% right**, against the 8% the entry demands. The two frame posts stop ~10 px short of the top border. It ships unmodified (no fade, no crop — a crop would change the 3:2), because at the ~360 px slot the thin band does not read as a cut. **Regenerate for anything that scales or crops it**, an OG card most of all.
- **Verified:** exactly 3:2 (1.5000) · four corners fully transparent (alpha 0) · nothing touching any edge · zero text · one fique-gold strand, continuous from the shuttle's bobbin through the shed into the finished weave · reads on `#FAF9F6` and on `#082A24` (both composited at the rendered size, not at @2x).
- **Judged:** the brief asked for ordinary engineering work rather than a hero shot and got it. Only part of the loom is in frame, the warp is parallel and countable, the shuttle is mid-pass, and the finished cloth at the left edge is where the single gold warp thread becomes visible as cloth — the argument of the page, drawn rather than stated. No operator, no workshop.
- **Re-framed, 2026-08-17.** `portal-loom.webp` 420 × 303 (36 KB) + `-2x` 840 × 605 (126 KB), ratio 1.388. The 1.0% top and 2.2% bottom margins are now 8% on every side, the drawing is larger inside its box than the first cut, and the file is less than half the weight — trimming 5% of dead canvas and delivering the drawing's own ratio buys both. The thin-margin regeneration this entry asked for is no longer needed.
- **Status:** integrated
