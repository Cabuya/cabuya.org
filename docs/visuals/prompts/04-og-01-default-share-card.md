# OG-01 — The default share card

> **Pack 04 · Open Graph cards** — index: [README.md](README.md).
> **Inherits** [STYLE_GUIDE.md](../STYLE_GUIDE.md): house style (§1), palette
> (§2), light/dark strategy and the edges rule (§3), the wordless rule (§4),
> dimensions (§5), asset paths (§6), accessibility (§7), the negative
> boilerplate (§8), the entry schema (§9). The **Prompt** field below is
> copy-paste ready and self-contained.

- **Target surface:** `public/images/og-default.jpg` and `og-default-en.jpg` → every page's `og:image` and `twitter:image`, via `getDefaultOgImage(lang)`
- **Type:** illustration
- **Priority:** flagship
- **Purpose:** A link to cabuya.org lands in a Slack channel, a WhatsApp group or a timeline, competing with everything else there. It has one job: look like a serious technical standard rather than a campaign, at 400 pixels wide, in a light or dark chat client, beside a title the platform chose. Recognition beats explanation — the same threads-becoming-cordage motif as the hero, recomposed for a landscape crop.
- **Aspect & dimensions:** 1.91:1 · exactly **1200 × 630** · **no @2x** (platforms downscale from 1200 and an oversized card is silently re-encoded)
- **Light/dark strategy:** **light only, one filled asset — the pack's single exception to the transparency rule, and it is forced.** Every other entry ships a transparent PNG/WebP so one file serves both themes. This one cannot: the card is a **JPEG**, a format with no alpha channel at all, and it is fetched by a crawler that has no idea what colour scheme the eventual viewer prefers — `prefers-color-scheme` is not part of the Open Graph protocol, so a second file could never be selected even if we made one. The card is therefore built on the light ground, filled edge to edge, and must read well when a dark client draws its own dark border around it.
- **Prompt:**
  > **HOUSE STYLE —** Fine hand-drawn line work in the manner of a botanical plate or a rope-maker's technical drawing: twisted fibres, braided cords, knots, and threads that bind. Line weight varies the way real cordage does — a thick laid rope resolving into thin individual filaments. Monochrome forest ink (`#0B3D32`) on warm white paper (`#FAF9F6`), with **one single fique-gold strand** (`#C79A4A`) traced through the composition — one continuous thread, never a fill, never a second accent. Calm, warm, technical, editorial. Flat 2D. Print-quality line work with a faint natural paper tooth.
  >
  > **SUBJECT —** A landscape composition, 1200 × 630. Several fine threads enter from the left edge region at slightly different heights and travel rightward, converging and twisting into a single laid rope that continues toward the right. One thread is fique gold (`#C79A4A`) and stays traceable through the twist. The whole motif occupies the **middle 60% of the frame horizontally and the middle 70% vertically** — everything outside that is empty paper, because platforms crop this card to a square and to a 1.91:1 with different safe areas, and anything near an edge will be lost. The drawing must still read as "threads becoming rope" when the image is 400 pixels wide: use fewer, thicker threads than the portrait hero, with clear separation between them.
  >
  > **EDGES / BACKGROUND —** **This card is the one filled asset in the pack — a JPEG has no alpha, so it needs a ground.** Fill it edge to edge with **exactly `#FAF9F6`**; every pixel of the outer margin and all four corners must sample to that hex. The motif feathers into that colour. No border, no frame, no vignette darkening.
  >
  > **NOTHING MAY TOUCH AN EDGE.** The motif stays inside the middle 60% × 70% stated in the subject; the outer band is empty ground with no ink in it whatsoever. This is stricter than the other entries for a reason: platforms re-crop this card to a square and to other ratios with safe areas we do not control, and anything near a border is cut off in somebody's feed.
  >
  > **AVOID —** any border, frame, rectangle, box or outline; elements near or touching the edges; hard straight edges; gradients other than the soft fade; glossy or 3D render; photographic realism; neon or saturated colour; drop shadows; busy composition; watermark; **any logo or wordmark** (the card carries no branding — the platform shows the domain); **any text, letters, numerals or labels whatsoever**; flat-vector "corporate memphis" people; clip-art; emoji; a second accent colour; human faces; disaster imagery; fine detail that disappears below 500px wide.

- **Suggested asset path:** `public/images/og-default.jpg` (ES) and `public/images/og-default-en.jpg` (EN) — **the same artwork in both**, since the card is wordless. Keep two paths because `getDefaultOgImage(lang)` already resolves by language, and a future per-language card should not require touching call sites.
- **Alt text (EN):** Not applicable — `og:image:alt` is set from the page description, not from this file.
- **Alt text (ES):** —
- **Integration note:** JPEG rather than WebP: several platforms still fetch OG images with crawlers that do not negotiate WebP, and a card that fails to render is worse than a slightly larger file. Target under 300 KB. **Replaces the fallback card** generated by `scripts/generate-og-fallback.mjs`, which is a plain lockup on Night and exists only so the site is not sharing the previous project's artwork.
- **Shipped as:** `og-default-en.jpg` (126 KB) and `og-default.jpg` (130 KB), both exactly 1200 × 630, installed by `scripts/build-og-cards.mjs`. `scripts/generate-og-fallback.mjs` now reports both as "not a generated fallback, left untouched" — the EXIF-marker guard it was built around doing the job it was built for.
- **Shipped against this entry in two ways, both deliberate and both the founder's call:**
  1. **The cards carry type.** This entry specifies a wordless motif and forbids a wordmark; what shipped is a designed card per language — the lockup, a headline (*Connecting help that saves lives* / *Conectando ayuda que salva vidas*), the line *Open protocol for aid apps and crisis coordination*, three badges (open source · interoperable · community driven) and a closing line. A share card is the one surface where the platform gives you a title you did not write, so carrying your own is defensible in a way it would not be inside the site.
  2. **It is therefore per-language, not one file twice.** The path split `getDefaultOgImage(lang)` already had is now load-bearing rather than forward-looking.
- **Open against the voice guide, for the founder to settle:** *"that saves lives"* is a stronger claim than anything the site itself makes, and Rule-0 is that we publish no claim we cannot back — the landing says *«Each app is a thread. The protocol is the rope.»* and the registry is careful to say inclusion is not endorsement. The headline is not measurable and the protocol has no measured outcome yet. Flagged here rather than changed: the card is the founder's design, and the fix is a wording decision, not a build step.
- **The wordless master exists** at `04-og-01-default-share-card.png` in the master set — threads becoming rope on a filled ivory ground, exactly to this brief. It is what to fall back to if the lettered card is ever retired.
- **Status:** integrated (lettered per-language cards, superseding the wordless brief above)
