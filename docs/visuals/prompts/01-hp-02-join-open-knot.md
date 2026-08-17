# HP-02 — Join section: the open knot

> **Pack 01 · Landing** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** landing, the closing "join" section → left of the contribution paths
- **Type:** illustration
- **Priority:** high
- **Purpose:** The page ends by asking someone to participate. The image should feel like an invitation rather than a call to action — a knot deliberately left open, with room for one more strand. It is the visual form of «nos alimentamos»: the network is not finished and does not want to be.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** **transparent, one asset.** No matched pair and no `-dark` file: the ink carries both a forest-dark and an ivory value, so a single alpha asset reads correctly on `#FAF9F6` and on `#082A24`. It is also the only way the ground can be exactly right — every lossy WebP of a flattened background lands a step or two off the token and leaves a faint rectangle on the page.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Forest ink (`#0B3D32`) deepening to near-black in the shadows, with ivory (`#F6F3ED`) highlights inside the forms, all on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work; any paper tooth is drawn into the strokes themselves, never laid down as a background wash.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A large, loosely tied knot at the centre-right of the frame, drawn as a technical study the way a knot manual would show it: clear over-and-under, the structure legible. The knot is deliberately **not** pulled tight — there is an obvious open loop, a gap in the weave, and one short length of gold thread (`#C79A4A`) lying nearby, unattached, its end pointing toward that gap. Nothing suggests urgency; the composition is patient and has space around it.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, rectangle, box or outline; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.

- **Source file:** [`images/01-hp-02-join-open-knot.png`](images/01-hp-02-join-open-knot.png) — 1536 × 1024 RGBA, exactly 3:2, the generator's output, kept as the master.
- **Shipped asset path:** `public/images/visuals/home/join-open-knot.webp` (720 × 480, 57 KB) and `join-open-knot-2x.webp` (1440 × 960, 170 KB).
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** `FinalCta.astro`, left column of the closing panel from `lg`, below the copy on smaller screens. `loading="lazy"`, explicit width/height. A plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source: the asset is transparent, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Note this one lands on a **third** ground — the panel's `bg-cabuya-fill` (`#0B3D32`), not a page ground — which is exactly the case transparency was chosen for.
- **Accepted with one defect, and it is the edges rule:** the generator ran both cords off the canvas — 90 px of ink on the left border, 114 px on the right, zero clear margin on either side, against the 8% the entry now demands. The exported WebP **feathers the outer 9% of each side** so the cords dissolve instead of being cut, which is what shipped. That is a repair, not a fix: it eats the gold cord's frayed tail, which is a drawn detail the brief asked for. **Regenerate with the current prompt** — the no-clipping block was written from this failure — and drop the fade when a clean master arrives.
- **Verified:** exactly 3:2 (1.5000) · four corners transparent · top and bottom edges clear · zero text · exactly one gold accent, unattached, pointing at the gap in the knot · reads on `#FAF9F6`, `#082A24` **and** `#0B3D32`.
- **Judged:** the subject is right and the drawing is better than the brief asked for. The knot is legibly over-and-under, visibly not pulled tight, with a real gap in the weave; the loose gold cord lies outside it with its end aimed at that gap. It reads as an invitation rather than a call to action, which was the whole point of the entry.
- **Re-framed, 2026-08-17: the edges defect is gone and the fade with it.** `join-open-knot.webp` 520 × 342 (40 KB) + `-2x` 1040 × 684 (140 KB), ratio 1.521. `scripts/build-illustrations.mjs` trims to the drawing's bounding box and pads the 8% margin back on, so both cords end inside the canvas without the export feathering their sides — which means the gold cord keeps the frayed tail the fade used to eat. No regeneration needed after all.
- **Status:** integrated
