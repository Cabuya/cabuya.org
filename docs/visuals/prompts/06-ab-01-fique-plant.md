# AB-01 — The fique plant

> **Pack 06 · Why Cabuya** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `/about` → the hero, right column
- **Type:** illustration
- **Priority:** flagship
- **Purpose:** The page's first claim is that the name comes from a real plant, and that the fibre it yields is a working material rather than a symbol. A botanical plate settles that before the prose starts. It is also the one image that carries the origin: the page names a country once, with a source, and everything else about place is left to the plant.
- **Aspect & dimensions:** 4:5 · 560 × 700 displayed · generate @2x (1120 × 1400)
- **Light/dark strategy:** transparent
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate from a 19th-century monograph: every leaf modelled with engraved hatching, line weight varying the way a real specimen does, the whole thing drawn to be *identified* rather than admired. Flat 2D — no perspective tricks, no lighting, no photographic reference, no 3D render. Print-quality line work with a faint natural paper tooth.
  >
  > **ONE FILE, BOTH THEMES —** The drawing is placed on a warm-white page (`#FAF9F6`) *and* on a dark green one (`#082A24`), from the same file, so it must carry its own tonal range instead of borrowing the page's. Draw it the way an engraving reads on either paper: deep forest-ink (`#0B3D32`) contours and shadow, with ivory (`#F6F3ED`) highlights worked into the forms themselves. A drawing in one flat value disappears on one of the two grounds.
  >
  > **SUBJECT —** A single **fique** plant (*Furcraea*, the agave relative), drawn as a specimen plate: a ground-level rosette of long, rigid, sword-shaped leaves radiating upward and outward, each leaf with fine parallel venation running its full length and a slightly serrated margin. The leaves are thick and structural — this is a plant you could cut a rope out of, and it should look like it. From the centre of the rosette a single slender flower spike rises, taller than the leaves, carrying small clustered bracts near its top.
  >
  > At the lower right of the rosette, **one leaf has been cut and partly stripped**: its parallel veins are separating into loose individual fibres that hang free, showing what the plant is for. This is the hinge of the whole image — above it a living specimen, at that one point a material. Keep it small and precise, the way a plate shows a detail, not dramatic.
  >
  > **One of those loose fibres is fique gold (`#C79A4A`)** — a single continuous strand, traceable from where it leaves the leaf to where it ends. It is the only chroma in the drawing. Everything else is forest ink and ivory. Never a fill, never a glow, never a highlight applied to several things.
  >
  > **EDGES / BACKGROUND —** Fully transparent ground: no page colour, no fill, no paper rectangle, no border, no frame, no vignette, no cartouche, no oval. **Nothing touches or crosses an edge** — every leaf tip, the flower spike and every loose fibre terminate inside the canvas with a clear margin of at least 8% of the canvas on all four sides containing no ink at all. Scale the plant down until the widest pair of leaves clears the side margins rather than fanning them to the border.
  >
  > **AVOID —** any border, frame, rectangle, box, outline, cartouche or oval; a filled or tinted ground of any kind; elements near or touching the edges; **any map, flag, border, territory outline or national symbol**; soil, landscape, horizon, sky or scenery; pots, fences, buildings; human figures, hands or faces; photographic realism; 3D render; glossy or waxy surfaces; drop shadows; watercolour or paint texture; neon or saturated greens; a second accent colour; **any text, letters, numerals, labels, botanical names or scale bars**; clip-art; flat-vector illustration; watermark.

- **Suggested asset path:** `public/images/visuals/about/fique-plant.webp` (+ `-2x.webp`)
- **Alt text (EN):** A fique plant drawn as a botanical plate — a rosette of long, rigid leaves with a tall flower spike, one cut leaf at its base separating into loose fibres, one of them golden.
- **Alt text (ES):** Una planta de fique dibujada como lámina botánica — una roseta de hojas largas y rígidas con una espiga floral alta, y en su base una hoja cortada que se abre en fibras sueltas, una de ellas dorada.
- **Integration note:** The hero's right column; the left carries the title and the sourced sentence about where the plant grows. Below `lg` the column does not render, so the plate is never the thing that pushes the first paragraph off a phone screen.
- **Status:** integrated
