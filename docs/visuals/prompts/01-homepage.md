# Prompt Pack — Landing

> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): the house style block (§1),
> palette (§2), light/dark strategy and the edges rule (§3), the wordless rule
> (§4), dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), and the entry schema (§9). Every **Prompt** field below is
> copy-paste ready and self-contained.
>
> **Two illustrations only.** The landing's other visual slots are diagram
> components (`ConformanceLadder`, `OneSchemaFourTransports`, `NetworkFlow`,
> `ExclusionBoundary`) because they carry text. See
> [VISUAL_INVENTORY.md](../VISUAL_INVENTORY.md) for the full classification,
> including the two deliberate skips.

---

### HP-01 — Hero: threads becoming cordage

- **Target surface:** `src/components/home/Hero.astro` → right column, visible from `lg`
- **Type:** illustration
- **Priority:** flagship
- **Purpose:** The first and often only image a reader sees. It has to carry the whole argument before they read a word: many separate thin threads, arriving from different directions, twisting into one rope that could actually hold a load. One of the threads is gold — the reader's app, or any app, it does not matter which. If this image works, the headline is a caption.
- **Aspect & dimensions:** 4:5 portrait · 520 × 650 displayed · generate @2x (1040 × 1300)
- **Light/dark strategy:** matched pair — `hero-cordage.webp` and `hero-cordage-dark.webp`. Atmospheric with a filled ground, so a pair reads better than a cutout.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** Roughly a dozen fine separate threads enter from the lower third of the frame at different angles, each drawn with its own character — some slack, some taut, some frayed at the end. As they rise they converge and twist into a single laid rope that continues out of the top of the composition, thick and evidently strong. The transition from loose threads to cordage happens in the middle third and is the focus of the drawing: you can see individual filaments still visible inside the twist. Exactly one thread is fique gold (`#C79A4A`) and is traceable by eye from its loose end at the bottom into the rope, where it remains just visible among the forest-ink filaments. No hands, no plant, no ground plane, no horizon — the threads and the rope are the entire subject, floating in the paper.
  >
  > **EDGES / BACKGROUND —** The background is filled edge to edge with **exactly `#FAF9F6`** (a warm white — not pure white `#FFFFFF`, not grey, not beige); every margin pixel and all four corners must sample to that hex. The thread ends and the top of the rope feather softly into that exact colour so the image has no visible boundary. No border, frame or outline of any kind.
  >
  > **AVOID —** any border, frame, rectangle, box or outline around the image; elements touching or clipped by the edges; hard straight edges; gradients other than the soft fade into the background; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy or cluttered composition; watermark or signature; any logo; **any text, letters, numerals or labels whatsoever**; garbled glyphs; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery of any kind.
  >
  > **DARK VARIANT —** Same composition exactly. Ivory ink (`#F6F3ED`) on a ground filled edge to edge with **exactly `#082A24`** (a deep warm green-black — not pure black, not blue-black). The single fique strand stays `#C79A4A`.

- **Suggested asset path:** `public/images/visuals/home/hero-cordage.webp` + `-dark.webp`
- **Alt text (EN):** `alt=""` — decorative. The headline beside it makes the same argument in words.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Hero right column, `loading="eager"` and `fetchpriority="high"` (it is the LCP candidate), explicit width/height, `<picture>` with a `prefers-color-scheme` source for the dark file.
- **Status:** to-generate

---

### HP-02 — Join section: the open knot

- **Target surface:** landing, the closing "join" section → left of the contribution paths
- **Type:** illustration
- **Priority:** high
- **Purpose:** The page ends by asking someone to participate. The image should feel like an invitation rather than a call to action — a knot deliberately left open, with room for one more strand. It is the visual form of «nos alimentamos»: the network is not finished and does not want to be.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** matched pair
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** A large, loosely tied knot at the centre-right of the frame, drawn as a technical study the way a knot manual would show it: clear over-and-under, the structure legible. The knot is deliberately **not** pulled tight — there is an obvious open loop, a gap in the weave, and one short length of gold thread (`#C79A4A`) lying nearby, unattached, its end pointing toward that gap. Nothing suggests urgency; the composition is patient and has space around it.
  >
  > **EDGES / BACKGROUND —** Background filled edge to edge with **exactly `#FAF9F6`**; all four corners sample to that hex. The cord ends feather into it. No border, frame or outline.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements touching or clipped by the edges; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.
  >
  > **DARK VARIANT —** Same composition. Ivory ink (`#F6F3ED`) on **exactly `#082A24`**; the loose gold thread stays `#C79A4A`.

- **Suggested asset path:** `public/images/visuals/home/join-open-knot.webp` + `-dark.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Section grid, `loading="lazy"`, explicit width/height, `<picture>` dark source.
- **Status:** to-generate
