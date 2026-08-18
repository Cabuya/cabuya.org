# Illustration prompt pack — index

> The founder generates the artwork; this pack is the brief. Seventeen prompts,
> each self-contained: hand the **Prompt** field to an image agent with no other
> context and the result should be usable.
>
> Permanent home: `docs/visuals/` in the website repo. This directory is the
> plan's snapshot — if the two ever disagree, `docs/visuals/` is authoritative.
>
> **Read [STYLE_GUIDE.md](./STYLE_GUIDE.md) first.** Two things in it are the
> difference between art that lands on the page and art that sits in a visible
> rectangle: the exact background hexes (`#FAF9F6` light, `#082A24` dark — never
> white, never black), and the edges rule.

## The house style, in one line

Hand-drawn fibre and cordage line work — forest ink on warm white, with exactly
one fique-gold strand per image. Wordless, always.

## Every prompt

| ID | Title | Surface | Priority | Aspect (delivered) | Strategy | Status |
|---|---|---|---|---|---|---|
| **OG-01** | The default share card | every page's `og:image` | **flagship** | 1200 × 630 | light only | **integrated**² |
| **HP-01** | Hero: threads becoming cordage | landing hero | **flagship** | 0.88:1, two framings⁴ | transparent¹ | **integrated** |
| HP-02 | Join section: the open knot | landing close | high | 1.52:1 | transparent¹ | **integrated** |
| DV-01 | Portal home: the loom | `/developers` | high | 1.39:1 | transparent¹ | **integrated** |
| DV-02 | Quickstart: the first thread | `/developers/quickstart` | high | 1.67:1 | transparent¹ | **integrated** |
| DV-03 | Validator: thread through the gauge | `/developers/validator` | high | 1.06:1 | transparent | **integrated** |
| DV-04 | Skill page: the handover | `/developers/skill` | medium | 2.18:1 | transparent¹ | **integrated** |
| RG-01 | Registry: the woven net | `/registry` | high | 1.43:1 | transparent¹ | **integrated** |
| RG-02 | Governance: hands and cords | `/governance` | medium | 1.58:1 | transparent¹ | **integrated** |
| RG-03 | Join: the added strand | `/join` | medium | 1.76:1 | transparent¹ | **integrated** |
| **AB-01** | The fique plant | `/about` hero | **flagship** | 0.74:1 | transparent | **integrated** |
| AB-02 | Leaf to fibre to cord | `/about` | high | 2.68:1⁵ | transparent | **integrated** |
| AB-03 | Five cords, no centre | `/about` | high | 1.01:1 | transparent | **integrated** |
| AB-04 | The open bight | `/about` | medium | 2.13:1⁵ | transparent | **integrated** |
| MK-01 | 404: the re-tied thread | 404 page | medium | 4.78:1 | transparent | **integrated** |
| MK-02 | Empty state: the waiting thread | `EmptyState.astro` + registry note | low | 1.53:1 | transparent | **integrated** |
| MK-03 | Section ornament | landing, 3× | low | 15:1 | transparent | **integrated** |
| OG-02 | Per-section share cards | section `og:image` | low | 1200 × 630 | light only | deferred³ |

**All seventeen illustrations and the share cards are live.** The whole pack is
placed through one component (`src/components/editorial/Illustration.astro`) and
one registry (`src/lib/illustrations.ts`), converted by
`scripts/build-illustrations.mjs`, and held by two gates:
`tests/unit/lib/illustrations.test.ts` measures every declared dimension, aspect
ratio, alpha channel and weight against the file on disk, and
`illustrations:check` loads every surface at fifteen viewports in both themes and
fails if a drawing is missing, undecoded, invisible, clipped, distorted or too
small to read on a phone.

**The delivered aspect ratio is the drawing's own, not the nominal one in the
entry.** Every master is trimmed to its bounding box and padded back out to the
8% margin, so the ratios above are what the drawings actually are — `MK-01` is a
horizontal rope, not a square, and `MK-03` is a hairline, not a 3:1 block.
Nothing is cropped away, and the edges rule now holds by construction for every
asset rather than being checked by hand afterwards. The three entries that
shipped with an edges defect (HP-02's feathered sides, DV-01's 1% top margin,
DV-02's 1.4% left) are repaired by it, and their regeneration requests are
withdrawn.

¹ **Matched pairs are retired — every entry is transparent now.** HP-01 was
specified as a pair and delivered with an alpha channel that reads on both
grounds, which turned out to be strictly better: no lossy WebP of a flattened
ground reproduces `#FAF9F6` or `#082A24` exactly, so a filled asset always
leaves a faint rectangle, and one file costs half of two. The prompts, the
style guide (§3) and the integration guide all say so now, and every prompt
carries the **ONE FILE, BOTH THEMES** clause that makes a single asset legible
on either ground. `OG-01` is the sole exception and it is forced: JPEG has no
alpha channel, and Open Graph has no `prefers-color-scheme`.

² OG-01 shipped as **lettered per-language cards**, not the wordless motif its
entry briefs: the lockup, a headline, the one-line description and three badges,
in English and Spanish. A share card is the one surface where the platform
supplies a title nobody here wrote, so carrying our own type is defensible where
it would not be inside the site. Its entry records the deviation, and flags one
open question for the founder: *"that saves lives"* is a stronger claim than
anything the site itself makes, and Rule-0 is that we publish no claim we cannot
back. The wordless master exists and is what to fall back to.

³ OG-02 stays deferred, and the reason has not changed: five section cards are
five things to keep consistent for a benefit nobody has measured. The mechanism
is already built — `SECTION_CARDS` in `src/lib/og-image.ts` is an empty map with
a comment explaining how to fill it — so the artwork is the only missing piece.

⁵ **AB-02 and AB-04 came back much wider than their entries brief.** Both ask
for 3:2 and both were drawn as long horizontal bands — 2.68:1 and 2.13:1. They
are kept rather than regenerated: the subject of each is a *sequence* read left
to right (leaf → loose fibre → twist → cord; and a bight offered along a running
line), and a band is the honest shape for that. The layout absorbs it, since both
sit full-width under their prose rather than beside it. Recorded here because the
entry and the file disagree, and the file is what ships.

⁴ HP-01 ships two framings of one drawing, chosen by width through a `media`
source: flush at the top for `lg` and up, where the rope descends out of the site
header, and flush at the bottom below it, where the phone shows a full-bleed band
of the fan with everything above it masked into the ground. Same aspect ratio, so
one declared box is honest for both, and one fetch either way. Its entry has the
reasoning; the short version is that a 4:5 drawing shrunk into a phone column is
a thumbnail of a hero, and `hidden lg:block` is not an option.

It is also the entry that taught the pack two lessons the gates now carry.
**Artwork can be present and still be wrong**: the desktop framing rendered at its
intrinsic width on every screen for two passes, because `h-full` resolves against
an indefinite grid-row height and quietly became `auto` — `illustrations:check`
measures the *painted* drawing against the fold now. And **CSS that exists is not
CSS that applies**: the band's fade sat in a scoped `<style>` as `.hero-art img`,
which Astro compiles to require its own `data-astro-cid` on the `<img>` — an
element that belongs to `Illustration.astro`. Two visual defects, neither visible
to a build, both now covered.

## What is left

Nothing is blocked. `OG-02` (per-section share cards) is the only entry not
integrated, deliberately. The standing work is smaller than a new entry:

1. **Settle the share card's headline** — see footnote ² and the OG-01 entry.
2. **Re-run `pnpm run illustrations:build` after any regeneration.** The
   re-frame, the weight search and the 2x pair all come from that one script, and
   the unit test will fail the moment a regenerated file changes shape without
   `src/lib/illustrations.ts` being updated to match.

## The two rules most likely to be broken

1. **The background hex must be exact.** Sample all four corners. `#FAF9F6` is a
   warm white and `#FFFFFF` is not close enough; `#082A24` is a deep warm green-
   black and `#000000` is not close enough. A wrong fill shows as a rectangle.
2. **Zero text, in every image, forever.** One asset serves every language. The
   moment art carries a word it needs regenerating per locale, and the second
   locale is where that quietly stops happening.
