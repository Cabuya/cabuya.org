# OG-02 — Per-section cards (guidance, not yet an entry)

> **Pack 04 · Open Graph cards** — index: [README.md](README.md).
> **Guidance, not a prompt.** This file carries no **Prompt** field on purpose:
> nothing here is to be generated yet. When it becomes an entry it must adopt
> the schema in [STYLE_GUIDE.md](../STYLE_GUIDE.md) §9 in full.

**Not generating these yet, on purpose.**

A per-section card is worth making when a section gets enough direct traffic
that its share previews are seen often — realistically `/developers/quickstart`
and `/registry`, and only once analytics shows people actually link to them.
Until then, five cards is five things to keep consistent for a benefit nobody
has measured.

When that day comes, the rules are:

- Same house style, same 1200 × 630, same safe area, same wordlessness.
- One motif per section, drawn from the same fibre vocabulary: the quickstart
  card takes the single drawn strand (`DV-02`), the registry card takes the
  mesh (`RG-01`).
- Set them per-route through the layout's `image` prop; do not invent a second
  resolution mechanism.
- **Never** put the page title into the card. The platform already shows the
  title, in the reader's own font, at the right size, and a baked-in title is
  wrong the moment the page is renamed — in every previously shared link.
