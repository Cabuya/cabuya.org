# Prompt Pack — Developers portal

> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md). Every **Prompt** field is
> copy-paste ready and self-contained.
>
> Four illustrations for a portal with fourteen pages. The reference pages
> (`spec`, `schemas`, `consume`, `profiles`, `mcp`, `faq`) are deliberately
> unillustrated — see [VISUAL_INVENTORY.md](../VISUAL_INVENTORY.md). Art beside
> a normative clause invites the reader to skim it, which is the opposite of
> what a specification needs.

---

### DV-01 — Portal home: the loom

- **Target surface:** `/developers` → header, right of the intro
- **Type:** illustration
- **Priority:** high
- **Purpose:** The portal is where someone decides whether this is a week or an afternoon. A loom — a machine that makes cloth out of separate threads, methodically and without drama — says "this is ordinary engineering work" better than any hero shot could.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** matched pair
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** A partial view of a simple hand loom, drawn as a technical illustration: the warp threads stretched in parallel across the frame, a shuttle mid-pass, and a few centimetres of finished weave at one edge. Only part of the loom is in frame — the mechanism is implied, not catalogued. A single warp thread is fique gold (`#C79A4A`) and can be followed from the unwoven side into the finished cloth. No operator, no hands, no workshop background.
  >
  > **EDGES / BACKGROUND —** Background filled edge to edge with **exactly `#FAF9F6`**; corners sample to that hex; the warp threads feather out at the sides rather than being cut by the frame. No border or outline.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements touching or clipped by the edges; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.
  >
  > **DARK VARIANT —** Same composition. Ivory ink (`#F6F3ED`) on **exactly `#082A24`**; gold warp thread unchanged.

- **Suggested asset path:** `public/images/visuals/developers/portal-loom.webp` + `-dark.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Portal header grid, `loading="eager"` (above the fold), explicit width/height.
- **Status:** to-generate

---

### DV-02 — Quickstart: the first thread

- **Target surface:** `/developers/quickstart` → above the five steps
- **Type:** illustration
- **Priority:** high
- **Purpose:** The most important page on the site, and the one where a reader is deciding whether to start now. Small and calm: a single thread being drawn from a bundle. The promise is not that you will build a network — it is that you will do one small thing today.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** matched pair
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** A loose bundle of raw fique fibre resting in the lower left of the frame, drawn with the dry, slightly wiry character of the real plant fibre. One single strand — fique gold (`#C79A4A`) — has been drawn out of the bundle and runs in a long, easy curve up and to the right, straightening as it goes, ending in open paper. It has not been twisted into anything yet. The composition is mostly empty space; the drawn bundle occupies less than a third of it.
  >
  > **EDGES / BACKGROUND —** Background filled edge to edge with **exactly `#FAF9F6`**; the drawn strand fades before it reaches the right edge rather than touching it. All four corners sample to the hex. No border or outline.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements touching or clipped by the edges; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery.
  >
  > **DARK VARIANT —** Same composition. Ivory ink (`#F6F3ED`) on **exactly `#082A24`**; the drawn strand stays `#C79A4A`.

- **Suggested asset path:** `public/images/visuals/developers/quickstart-first-thread.webp` + `-dark.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Above the step list, `loading="eager"`, explicit width/height.
- **Status:** to-generate

---

### DV-03 — Validator: the thread through the gauge

- **Target surface:** `/developers/validator` → beside the URL input
- **Type:** illustration
- **Priority:** high
- **Purpose:** Measurement without judgement. A thread passing through a simple gauge — the kind of aperture a rope-maker uses to check a diameter — is exactly what the validator does: it reports what passed through, it does not grade the maker. Nothing here may look like a dial, a score, or a traffic light.
- **Aspect & dimensions:** 1:1 · 320 × 320 displayed · generate @2x (640 × 640)
- **Light/dark strategy:** transparent — this sits beside a form control and needs to work on both the page ground and the panel ground, so a filled pair would fight the surface it lands on.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does. Forest-ink line work (`#0B3D32`) with **one single fique-gold strand** (`#C79A4A`) — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work.
  >
  > **SUBJECT —** A simple round aperture — a plain metal ring or sizing gauge, drawn as a thin technical outline with no markings on it — seen slightly from the side. One laid cord passes cleanly through the centre of it, entering from the lower left and leaving at the upper right. The gold strand is visible within the cord's twist as it passes through the ring. The ring measures the cord; it does not constrain it. Nothing indicates pass or fail: no needle, no dial face, no scale, no arrow, no marks of any kind on the ring.
  >
  > **EDGES / BACKGROUND —** **True transparent background (alpha), no fill of any colour.** Soft, non-cropped edges; the cord fades out before the canvas edge on both ends. Centred with generous margin. No border or outline.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements touching or clipped by the edges; hard straight edges; any background fill (the canvas must be transparent); glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals, labels, tick marks, scales or gauge markings**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces; disaster imagery; anything resembling a score, grade, dial, meter or traffic light.

- **Suggested asset path:** `public/images/visuals/developers/validator-gauge.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Beside the validator form, `loading="lazy"`, explicit width/height. Transparent asset — no dark variant, but check it against both grounds before shipping.
- **Status:** to-generate

---

### DV-04 — Skill page: the handover

- **Target surface:** `/developers/skill` → header
- **Type:** illustration
- **Priority:** medium
- **Purpose:** The skill hands the protocol to an agent. Drawn as one cord being passed from one set of loops to another — no robots, no anthropomorphism, nothing that dates the way an illustrated "AI" always does.
- **Aspect & dimensions:** 3:2 · 720 × 480 displayed · generate @2x (1440 × 960)
- **Light/dark strategy:** matched pair
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Generous margins. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** Two separate arrangements of looped cord, one on the left and one on the right, each neatly coiled in its own way — clearly two different systems of organising the same material. A single continuous cord runs between them, leaving the left coil and entering the right, joining the two without either losing its own structure. The connecting cord carries the gold strand. No hands, no figures, no devices, no screens.
  >
  > **EDGES / BACKGROUND —** Background filled edge to edge with **exactly `#FAF9F6`**; corners sample to that hex; both coils sit well inside the frame with generous margin. No border or outline.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements touching or clipped by the edges; hard straight edges; gradients other than the soft edge fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; any logo; **any text, letters, numerals or labels**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces or identifiable people; disaster imagery; robots, circuit boards, screens, or any other visual shorthand for computers.
  >
  > **DARK VARIANT —** Same composition. Ivory ink (`#F6F3ED`) on **exactly `#082A24`**; connecting strand stays `#C79A4A`.

- **Suggested asset path:** `public/images/visuals/developers/skill-handover.webp` + `-dark.webp`
- **Alt text (EN):** `alt=""` — decorative.
- **Alt text (ES):** `alt=""` — decorativa.
- **Integration note:** Page header, `loading="lazy"`, explicit width/height.
- **Status:** to-generate
