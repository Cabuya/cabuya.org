---
title: How it works
description: The network end to end — the two premises, the published copy, how records travel with attribution and location, and what installing the skill produces.
section: start
order: 1
updated: 2026-08-19
---

Everything on this page follows from two facts. State them once and the rest
of the protocol stops looking like machinery and starts looking inevitable.

**Many apps will exist, and that is fine.** In every emergency, teams build
their own boards, maps and directories — often several for the same city. The
2026 ecosystem directory lists twenty-one of them. Unification is not coming,
and the protocol does not ask for it: every app keeps its own product, its own
users and its own database. What changes is that their records stop being
trapped inside them.

**The data is sensitive.** These records sit next to people in their worst
week. So the shared layer carries places and facts — never people. No names,
no phone numbers, no personal contact, excluded by a
[join prohibition](/developers/spec/0.1/7-normative-exclusions), not by good
intentions.

## The published copy

An app joins the network by publishing two things:

1. **A manifest** at `/.well-known/cabuya.json` — one JSON file that says who
   you are, what you publish, and under which licence.
2. **A feed** — your records in the shared schema, at a URL the manifest
   declares. **The URL is yours to choose, and a static file and a read API
   are the same feed**: the spec's
   [equivalence rule](/developers/spec/0.1/3-the-feed#3-2) makes them
   byte-compatible per record, so a plain file at a stable URL is the floor,
   not a lesser option. `places.json` is an example filename, not a rule.

Nothing internal changes. Your tables, your primary keys and your product stay
exactly as they are — the feed is a translated copy, produced by a small
serializer, and the [data model guide](/developers/data-model) shows how to
organize new apps so that translation is nearly free.

## How a record travels

Another app fetches your feed and re-displays your records under the
[six consumption rules](/developers/consume). Two of them shape what a person
actually sees:

- **Attribution travels with the record.** Every record carries its
  `publisher_id` and its own geography — `municipality_code`,
  `municipality_text`, `neighborhood_text`, coordinates and their precision.
  So the canonical way a consumer displays a foreign record is:

  > **{name}** — by {publisher} · {municipality}, {neighborhood}

  A reader in Cali sees a Pereira record *and sees that it is a Pereira
  record, published by someone else* — attribution and location survive every
  hop.

- **Every action button leads back to the origin.** Each record carries
  `public_url`: the publisher's own page for it. Contact values never travel
  in feeds, so a consumer's buttons — "I can help", "call the shelter",
  "details" — link out to the app that owns the record. That is what makes
  the no-contact rule workable instead of merely prohibitive: the feed moves
  the fact, the origin resolves the help.

The registry sits to one side of all this. It lists who exists and what the
validator measured; no data passes through it, and inclusion is not
endorsement.

## What installing the agent skill produces

The [agent skill](/developers/skill) teaches a coding agent the whole protocol
offline and walks your app through adoption. Concretely, an adopter ends up
with:

- `https://your-app.org/.well-known/cabuya.json` — the manifest.
- `https://your-app.org/cabuya/places.json` — the feed (that example URL, or
  any URL you prefer; file or endpoint).
- In the repo: the crosswalk from your existing columns to the shared schema
  and the serializer that produces the feed — proposed file by file, approved
  by you; a short note at the repo root that explains the integration to
  whoever finds it months later; and a `.cabuya/adoption.json` progress
  ledger. Those last two are the only files the skill writes on its own, and
  both are deletable.
- The loop: run the [validator](/developers/validator) against your URLs,
  read what it measured, fix, repeat.

This is what the two documents look like, trimmed (the
[quickstart](/developers/quickstart) carries both in full):

```json
// your-app.org/.well-known/cabuya.json — the manifest
{
  "publisher_id": "example-app",
  "license": "CC-BY-4.0",
  "feeds": [
    { "name": "places", "entity": "place",
      "url": "https://example.org/cabuya/places.json" }
  ]
}
```

```json
// one record from the feed
{
  "name": "Coliseo Municipal",
  "place_kind": "shelter",
  "municipality_text": "Pereira",
  "lifecycle_status": "active",
  "public_url": "https://example.org/places/coliseo"
}
```

It never migrates your internal data model. If your app is still on the
drawing board, the [data model guide](/developers/data-model) is the shape to
start from.

## The levels, in plain language

Conformance is measured by the validator, never declared — and the levels are
membership classes, not grades. One sentence each:

- **L0 — Listed.** Your app appears in the registry. A pull request.
- **L1 — Linked.** Your records link out to other apps' pages. Under an hour.
- **L2 — Publishes.** Your feed is live and others can read it. One afternoon
  for a small app.
- **L3 — Serves and consumes.** You also read other apps' feeds and show
  their records. Days.
- **L4 — Federates.** Reads and writes flow both ways. Depends on the app.

Two classes never climb past L1, on purpose: apps whose records are
irreducibly personal (missing persons, reunification — link-out only,
permanently), and apps that simply choose not to publish. Both are listed,
and both are respected members. Staying at a level is a position, not a
failure.

## What the protocol carries today — and what is proposed

Version 0.1 ships one entity: `place` — shelters, collection centres,
hospitals, water and food points, and the other places aid runs on. Help
requests and offers with quantities (`need`/`offer`), damage reports, and a
publisher coverage declaration are **proposed for v0.2 in
[RFC 0002](/rfcs/0002)** — a draft under open review, not something you can
publish yet. The site will say so the day that changes, and not before.
