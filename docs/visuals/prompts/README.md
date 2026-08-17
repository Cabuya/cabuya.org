# Prompt Packs — index

One file per image. Each file is self-contained: open it, copy the **Prompt**
field, generate, drop the result in `images/`. Nothing else needs reading —
except [STYLE_GUIDE.md](../STYLE_GUIDE.md), which every entry inherits, and
[VISUAL_INVENTORY.md](../VISUAL_INVENTORY.md), which explains the surfaces that
are deliberately left unillustrated.

Filenames sort in pack order: `<pack>-<id>-<asset-slug>.md`.

## Two rules every entry now carries

Both were learned by generating `HP-01` and integrating it, and both are
written into each prompt rather than left to the style guide, because a prompt
gets pasted into a generator on its own.

1. **Transparent ground, one file for both themes.** No entry ships a matched
   light/dark pair any more. The ink is drawn with a forest-dark value *and* an
   ivory highlight value, so one alpha asset reads on `#FAF9F6` and on
   `#082A24`. It is also the only way the ground can be exactly right: every
   lossy WebP of a flattened background landed one to three steps off the token
   (`#FAF9F6` → `#FBF9F5`), and near-lossless cost 295 KB to fix. With alpha the
   ground *is* the page. **One exception**, and it is forced by the format:
   `OG-01` is a JPEG, which has no alpha channel, and Open Graph has no
   `prefers-color-scheme` — that entry says so in full.
2. **Nothing touches an edge.** Generators like to run a composition to the
   border, and a clipped edge reads as a broken image once the asset is scaled
   or cropped on a page. Every entry now demands a clear margin of at least 8%
   of the canvas with no ink in it. `HP-01` is allowed to cross the **top** edge
   only, because the rope is meant to continue out of frame and the page aligns
   that cut to the header's bottom rule.

## 01 · Landing

Two illustrations only. The landing's other visual slots are diagram
components (`ConformanceLadder`, `OneSchemaFourTransports`, `NetworkFlow`,
`ExclusionBoundary`) because they carry text.

| Entry | File | Priority |
|-------|------|----------|
| HP-01 — Hero: threads becoming cordage | [01-hp-01-hero-cordage.md](01-hp-01-hero-cordage.md) | flagship |
| HP-02 — Join section: the open knot | [01-hp-02-join-open-knot.md](01-hp-02-join-open-knot.md) | high |

## 02 · Developers portal

Four illustrations for a portal with fourteen pages. The reference pages
(`spec`, `schemas`, `consume`, `profiles`, `mcp`, `faq`) are deliberately
unillustrated. Art beside a normative clause invites the reader to skim it,
which is the opposite of what a specification needs.

| Entry | File | Priority |
|-------|------|----------|
| DV-01 — Portal home: the loom | [02-dv-01-portal-loom.md](02-dv-01-portal-loom.md) | high |
| DV-02 — Quickstart: the first thread | [02-dv-02-quickstart-first-thread.md](02-dv-02-quickstart-first-thread.md) | high |
| DV-03 — Validator: the thread through the gauge | [02-dv-03-validator-gauge.md](02-dv-03-validator-gauge.md) | high |
| DV-04 — Skill page: the handover | [02-dv-04-skill-handover.md](02-dv-04-skill-handover.md) | medium |

## 03 · Registry, governance and join

Three illustrations. The publisher pages and the trademark policy are
deliberately unillustrated — a measurement page and a legal policy both lose
credibility when decorated.

| Entry | File | Priority |
|-------|------|----------|
| RG-01 — Registry: the woven net | [03-rg-01-registry-net.md](03-rg-01-registry-net.md) | high |
| RG-02 — Governance: hands and cords | [03-rg-02-governance-hands.md](03-rg-02-governance-hands.md) | medium |
| RG-03 — Join: the added strand | [03-rg-03-join-splice.md](03-rg-03-join-splice.md) | medium |

## 04 · Open Graph cards

The share card is the only artwork that appears somewhere we do not control, at
a size we do not choose, next to text we did not write. It gets its own rules.

| Entry | File | Priority |
|-------|------|----------|
| OG-01 — The default share card | [04-og-01-default-share-card.md](04-og-01-default-share-card.md) | flagship |
| OG-02 — Per-section cards | [04-og-02-per-section-cards.md](04-og-02-per-section-cards.md) | deferred (guidance only) |

## 05 · Marks and ornaments

Small transparent pieces. All of these must read at 96 pixels, which means very
few strokes — a mark that needs detail to be legible is the wrong mark.

| Entry | File | Priority |
|-------|------|----------|
| MK-01 — 404: the re-tied thread | [05-mk-01-404-retied.md](05-mk-01-404-retied.md) | medium |
| MK-02 — Empty state: the waiting thread | [05-mk-02-empty-coil.md](05-mk-02-empty-coil.md) | low |
| MK-03 — Section ornament | [05-mk-03-ornament-braid.md](05-mk-03-ornament-braid.md) | low |
