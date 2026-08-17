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

## 3. Light / dark strategy — transparent, one file

The site ships both themes. A raster cannot recolour itself, and the answer is
**not** two files: **every illustration is a true alpha asset with no ground of
any kind**, and the page supplies the background.

Two things make that work rather than merely convenient:

- **The ink carries both values.** The line work is drawn with forest-dark
  (`#0B3D32`) contours *and* ivory (`#F6F3ED`) highlights worked into the
  forms, the way an engraving reads on either paper. A drawing in one flat
  value vanishes on one of the two grounds; this is the instruction that makes
  a single file legitimate, and every prompt states it under
  **ONE FILE, BOTH THEMES**.
- **The ground is then exactly right by construction.** A filled asset has to
  reproduce `#FAF9F6` or `#082A24` exactly or it leaves a rectangle on the
  page — and it cannot: lossy WebP of a flat ground lands one to three steps
  off (`#FAF9F6` → `#FBF9F5`, `#082A24` → `#092A23`), and near-lossless
  costs 295 KB to avoid it. Measured on HP-01, which is why this section
  changed.

**Matched pairs are retired.** No entry ships a `{slug}-dark.webp`, and no
integration uses a `<picture>` with a `prefers-color-scheme` source; a
transparent asset takes a plain `<img>`.

**One exception, forced by the format.** `OG-01` is a JPEG — no alpha channel
exists in that format — and Open Graph has no `prefers-color-scheme`, so no
second file could ever be selected. It is filled on the light ground and says
so in full. Nothing else may use it as precedent.

### Edges and framing (mandatory, every illustration)

No border, frame, rectangle, box or outline. **Nothing touches or crosses an
edge.** Every stroke terminates inside the canvas and feathers out before it
gets there, with a clear margin of **at least 8% of the canvas** on all four
sides containing no ink at all — no thread, no fibre tip, no stray mark.

The reason is not neatness. These assets get scaled, and sometimes cropped, by
layouts and by platforms we do not control; a composition that runs to the
border reads as a broken image rather than a drawing. An asset that violates
this is regenerated, not cropped — cropping changes the aspect ratio the entry
specifies.

**One exception, and it is per-entry, not general:** `HP-01` may cross the
**top** edge, because the rope is meant to continue out of frame and the hero
aligns that cut to the header's bottom rule. Its left, right and bottom edges
follow the rule like everything else.

Each prompt states this in an **EDGES / BACKGROUND** block and repeats it at
the head of the **AVOID** list.

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
public/images/visuals/{area}/{slug}.webp        # transparent, 1x
public/images/visuals/{area}/{slug}-2x.webp     # only where 1x goes soft
```

No `-dark` file exists for any entry — see §3. The OG card is the exception
to the whole scheme and lives at `public/images/og-default*.jpg`.

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
- **Light/dark strategy:** transparent, one asset (§3) — state the reasoning
- **Prompt:**
  > {copy-paste ready: the §1 house style block verbatim, the ONE FILE, BOTH
  >  THEMES clause, the subject and composition, the EDGES / BACKGROUND block
  >  with its no-clipping rule, and the §8 AVOID list}
- **Suggested asset path:** `public/images/visuals/{area}/{slug}.webp`
- **Alt text (EN):** {meaningful, or `alt=""` (decorative)}
- **Alt text (ES):** {…}
- **Integration note:** {which component, which slot, eager or lazy}
- **Status:** to-generate | generated | integrated
```

A complete entry can be handed to an image agent (the **Prompt** field alone)
and to the integrator (everything else) with no further context.
