# Visual Style Guide — Cabuya

> The canonical house style for every generated illustration on cabuya.org, and
> the prompt schema every entry in `prompts/*.md` must follow. Read this before
> writing or generating any visual.
>
> **Diagrams are not here.** Anything with text is an HTML/CSS component —
> `docs/DIAGRAM_COMPONENTS.md`. This document covers the wordless half.

---

## 1. The house style block (paste into every prompt)

Every prompt **must** carry this block verbatim. It is the only thing making a
dozen separately generated images look like one hand.

> **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical
> plate or a rope-maker's technical drawing: twisted fibres, braided cords,
> knots, and threads that bind. Line weight varies the way real cordage does —
> a thick laid rope resolving into thin individual filaments. Monochrome forest
> ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold
> strand** (`#C79A4A`) traced through the composition — one continuous thread,
> never a fill, never a second accent. Calm, warm, technical, editorial. Flat
> 2D. Generous margins. Print-quality line work with a faint natural paper
> tooth.

Dark counterpart, when a pair is generated: ivory ink (`#F6F3ED`) on the Night
ground (`#082A24`), with the same single fique strand (`#C79A4A`, which reads
at 5.96:1 on Night).

**Why fibre and not engraving.** The predecessor of this guide used 19th-century
banknote engraving, which is beautiful and belongs to a different project. Cabuya
is named after a fibre; the artwork should look like the thing the name means.
A drawing of cordage also does argumentative work the copy has to do anyway —
many thin threads, one strong rope.

---

## 2. Palette (exact tokens — from `src/styles/global.css`)

| Token | Light | Dark | Use in art |
|---|---|---|---|
| Page ground | `#FAF9F6` Warm White | `#082A24` Night | Fill, edge to edge |
| Ink (all line work) | `#0B3D32` Forest | `#F6F3ED` Ivory | Every stroke |
| Fique accent | `#C79A4A` | `#C79A4A` | **One** strand per image |
| Seedling (rare) | `#CFE3D9` | `#CFE3D9` | Faint tonal wash, sparingly |

**Accent discipline.** Fique is the only chroma in the entire pack, and it is
one continuous thread per image — not a highlight applied to several things.
If you cannot point at the single golden strand, the image is wrong.

**Never** pure white `#FFFFFF`, pure black `#000000`, grey, or beige. The
grounds are warm and specific, and an approximation shows as a rectangle on the
page.

---

## 3. Light / dark strategy (decide per visual)

The site ships both themes. A raster cannot recolour itself, so every entry
picks one strategy and states it:

- **(A) Transparent.** Line art on a true alpha canvas, no fill. The same file
  sits on either ground. Use for marks, ornaments and spot glyphs where the
  line work *is* the image. Draw in a mid-tone that reads on both grounds, or
  state that the integrator will supply a filtered dark variant.
- **(B) Matched pair.** Two files, `{slug}.webp` and `{slug}-dark.webp`, each
  filled **edge to edge with the exact page hex**: light exactly `#FAF9F6`,
  dark exactly `#082A24`. Use for atmospheric illustrations with a ground.

Default: (A) for marks and ornaments, (B) for anything atmospheric.

### Edges and framing (mandatory, every illustration)

No border, frame, rectangle, box or outline. Nothing touches or is clipped by
an edge. The art sits centred with generous margin and **feathers into the
background on all four sides**, so there is no visible boundary:

- **Filled (B):** every pixel of margin, and all four corners, must equal the
  exact page hex. Test by sampling a corner. This is the single most common
  failure and it leaves a visible halo on the page.
- **Transparent (A):** true alpha, soft edges, never hard-cropped.

Each prompt states this in an **EDGES / BACKGROUND** line and repeats it in the
**AVOID** list.

---

## 4. Wordless — always

**Generated illustrations contain zero text.** No words, letters, numerals or
labels, in any language.

One asset then serves every language forever. The moment art carries a word, it
needs regenerating per locale, and the second locale is where that promise
quietly breaks. Anything that needs a label is a diagram component instead —
see `docs/DIAGRAM_COMPONENTS.md`.

This also means there is no bilingual asset policy here. There is nothing to
translate.

---

## 5. Dimensions

Sizes are the **displayed** size. Generate at **@2x**, downscale to WebP on
integration.

| Class | Aspect | Displayed | Generate @2x |
|---|---|---|---|
| Hero illustration | 4:5 portrait | 520 × 650 | 1040 × 1300 |
| Section illustration | 3:2 | 720 × 480 | 1440 × 960 |
| Page spot | 1:1 | 320 × 320 | 640 × 640 |
| Inline mark / ornament | 1:1 | 96 × 96 | 192 × 192 |
| Open Graph card | 1.91:1 | 1200 × 630 | 1200 × 630 (no @2x) |

Every entry records the exact `width`/`height` so the integrator can set them
on `<img>` and reserve the space.

---

## 6. Asset paths

```
public/images/visuals/{area}/{slug}.webp        # primary (light or transparent)
public/images/visuals/{area}/{slug}-dark.webp   # only for matched pairs
```

`{area}` ∈ `home` · `developers` · `registry` · `governance` · `og` · `marks`.
`{slug}` is short kebab-case English in every case — slugs are English
throughout this project, and the art is wordless so there is no locale variant.

---

## 7. Accessibility

- Every entry drafts alt text in **EN and ES**. Purely decorative pieces get
  `alt=""` and say so explicitly — an atmospheric illustration described in
  detail is noise in a screen reader, not access.
- `width`/`height` are mandatory at integration. A hero without dimensions is
  the largest layout shift on the page.
- Nothing in an illustration may carry meaning by the fique strand alone. The
  strand is emphasis; the argument lives in the prose beside it.

---

## 8. Negative boilerplate (append to every prompt)

> **AVOID —** any border, frame, rectangle, box or outline around the image;
> elements touching or clipped by the edges; hard straight edges; gradients
> other than the soft fade into the background; glossy or 3D render;
> photographic realism; neon or saturated colour; drop shadows; busy or
> cluttered composition; watermark or signature; any logo; **any text, letters,
> numerals or labels whatsoever**; garbled glyphs; lorem ipsum; flat-vector
> "corporate memphis" people; clip-art; emoji; a second accent colour.

Two additions specific to this project, and both are load-bearing:

> **No human faces, and no identifiable people.** Hands are permitted when the
> subject genuinely requires them (a knot being tied). Cabuya's entire premise
> is that person-level detail does not travel; artwork of individual people
> would contradict the protocol in the one medium nobody reads carefully.

> **No disaster imagery.** No rubble, no flood water, no collapsed buildings, no
> emergency vehicles. The protocol is infrastructure, not spectacle, and a
> reader who came to publish a JSON feed does not need to be reminded what an
> earthquake looks like.

---

## 9. Prompt entry schema (every entry uses all fields)

```markdown
### {ID} — {Short title}

- **Target surface:** {file path} → {exact location}
- **Type:** illustration
- **Priority:** flagship | high | medium | low
- **Purpose:** {what it communicates, and why that matters here}
- **Aspect & dimensions:** {aspect} · {displayed px} · generate @2x ({px})
- **Light/dark strategy:** transparent | matched pair ({note})
- **Prompt:**
  > {copy-paste ready: the §1 house style block verbatim, the subject and
  >  composition, the EDGES / BACKGROUND line, and the §8 AVOID list}
- **Suggested asset path:** `public/images/visuals/{area}/{slug}.webp`
- **Alt text (EN):** {meaningful, or `alt=""` (decorative)}
- **Alt text (ES):** {…}
- **Integration note:** {which component, which slot, eager or lazy}
- **Status:** to-generate | generated | integrated
```

A complete entry can be handed to an image agent (the **Prompt** field alone)
and to the integrator (everything else) with no further context.
