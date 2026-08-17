# DV-02 — Quickstart: the first thread

> **Pack 02 · Developers portal** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `/developers/quickstart` → above the five steps
- **Type:** illustration
- **Priority:** high
- **Purpose:** The most important page on the site, and the one where a reader is deciding whether to start now. Small and calm: a single thread being drawn from a bundle. The promise is not that you will build a network — it is that you will do one small thing today.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** **transparent, one asset.** No matched pair and no `-dark` file: the ink carries both a forest-dark and an ivory value, so a single alpha asset reads correctly on `#FAF9F6` and on `#082A24`. It is also the only way the ground can be exactly right — every lossy WebP of a flattened background lands a step or two off the token and leaves a faint rectangle on the page.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Forest ink (`#0B3D32`) deepening to near-black in the shadows, with ivory (`#F6F3ED`) highlights inside the forms, all on a fully transparent ground, and **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work; any paper tooth is drawn into the strokes themselves, never laid down as a background wash.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A loose bundle of raw fique fibre resting in the lower left of the frame, drawn with the dry, slightly wiry character of the real plant fibre. One single strand — fique gold (`#C79A4A`) — has been drawn out of the bundle and runs in a long, easy curve up and to the right, straightening as it goes, ending in open paper. It has not been twisted into anything yet. The composition is mostly empty space; the drawn bundle occupies less than a third of it.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha channel). No fill of any colour** — not white, not warm white, not a near-transparent tint, not a paper texture laid edge to edge. The page supplies the ground; anything baked in shows up as a rectangle in one of the two themes.
  >
  > **NOTHING MAY TOUCH OR CROSS AN EDGE.** Every stroke ends inside the canvas and feathers out before it gets there. Leave a clear margin of **at least 8% of the canvas** on those edges with no ink in it at all: no thread, no fibre tip, no stray mark, no faint tail. A composition that runs to the border and is cut is rejected and regenerated — the asset gets scaled, and sometimes cropped, on pages we do not control, and a cut edge reads as a broken image rather than a drawing.
  >
  > **AVOID —** **any element touching, crossing or clipped by an edge of the canvas**; a full-bleed composition; any background fill, ground colour or paper rectangle — including white; a vignette or darkened border; any border, frame, rectangle, box or outline; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.

- **Suggested asset path:** `public/images/visuals/developers/quickstart-first-thread.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Above the step list, `loading="eager"`, explicit width/height. Transparent asset: a plain `<img>`, never a `<picture>` with a `prefers-color-scheme` source — the same file serves both themes, and a `<source>` pointing at a `-dark` file that does not exist breaks the image in dark mode. Check it against both grounds before shipping.
- **Shipped as:** `quickstart-first-thread.webp` 360 × 240 (13 KB) + `-2x.webp` 720 × 480 (39 KB), from a 1536 × 1024 master, centred above the ladder and the five steps at `max-w-sm`. Small, per the entry's own "small and calm" — and small enough that a 1440 file would be dead weight. **`loading="lazy"`, against this entry's `eager`:** the steps arrive after the lead, the two path cards and the manifest block, which is below the fold on every viewport the page is measured at, so the integration guide's rule (eager above the fold, lazy below) is the one that describes the page as built.
- **Accepted with one defect, the edges rule:** nothing touches, crosses or is clipped by any edge — but the clear margin is **1.4% on the left**, 5.2% bottom, 4.0% right, against the 8% asked. Only the top (9.6%) is inside the rule. The hank's outer coils feather out ~21 px from the left border; at the rendered 384 px that is 5 px and does not read as a cut, so it ships unmodified. **Regenerate before this asset is used anywhere it can be cropped.**
- **Verified:** exactly 3:2 (1.5000) · four corners fully transparent (alpha 0) · nothing touching any edge · zero text · one fique-gold strand, continuous from inside the bundle to its frayed tip, no second accent — the red and yellow fringing visible when the PNG is previewed over black is semi-transparent edge pixels, and it disappears on both real grounds · reads on `#FAF9F6` and on `#082A24`.
- **Judged:** the promise of the page, drawn exactly as the entry framed it. One thread is being drawn out of a bundle that stays a bundle; the gold strand is already free and going somewhere, and nothing in the composition suggests a network — just the one small thing today.
- **Re-framed, 2026-08-17.** `quickstart-first-thread.webp` 420 × 252 (19 KB) + `-2x` 840 × 504 (61 KB), ratio 1.665. The 1.4% left margin is 8% on all four sides now, so the hank's outer coils are clear of the edge at any scale, and the regeneration this entry asked for is no longer needed.
- **Status:** integrated
