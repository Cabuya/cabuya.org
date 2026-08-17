---
version: "0.1"
status: normative
section: 4
order: 4
title: The standard API surface
---

# §4 — The standard API surface

This section is the protocol's end-state and the founding goal:
**standardized exposure and consumption so the apps feed each other.** L2 is
the on-ramp; this is the road.

## §4.1 Read API (L3)

- Base path: `/{api-base}/v1/places` — RECOMMENDED base `/api/public/v1/`
  (an emergent ecosystem convention, adopted rather than invented).
- Parameters (all optional): `municipality` (DIVIPOLA), `kind`
  (`place_kind`), `bbox` (`west,south,east,north`), `updated_since`
  (RFC 3339), `limit` (1–500, default 100), `cursor` (opaque).
- **Cursor rule:** incremental sync MUST order on a **server-side sequence**
  (opaque cursor), never on record timestamps — offline-composed reports
  arrive hours after their creation time, and timestamp cursors silently drop
  them. `updated_since` is a convenience filter, not the sync mechanism.
- Responses use the feed envelope with `data.places[]` + `next_cursor`.
  CORS `*`; no auth for reads.

## §4.2 Write API (L4)

- `POST /{api-base}/v1/places` — envelope:
  `{ "source": "<publisher_id>", "external_id": "<sender's local_id>", "place": { … } }`.
- **Idempotency MUST be keyed on (`source`, `external_id`)** — re-sending is
  an upsert of the sender's own contribution, never a duplicate. One
  mechanism, not two.
- Auth: the publisher's choice, declared in the manifest — `none` (emergency
  mode) or `bearer` (hand-issued per integration). In `none` mode,
  mitigations are REQUIRED: rate limiting, a moderation queue before records
  enter the publisher's own feed, and echo responses carrying the record's
  moderation state (`received` | `published` | `held`).
- The receiver republishes accepted records with `source.source_id` = the
  sender — **the sender's identity travels with the record forever** (§4.3).
- Status codes: 201 created/replayed · 400 schema · 401
  (+`WWW-Authenticate`) · 409 (id conflict outside the sender's namespace —
  a publisher MUST NOT mint in another's namespace, §5) · 429 · 5xx.

## §4.3 Consumption rules — what «nos alimentamos» requires

A consuming app (L3+) MUST:

1. **Attribute:** display the origin publisher for every foreign record
   (machine-checkable via `source.source_id`; `attribution_required`
   honored).
2. **Show age:** render `last_confirmed_at` age (or "sin confirmar" for
   `null`) wherever a foreign record can direct a person somewhere. When age
   exceeds 7 days OR `contradictions_active > 0`, the consumer MUST visually
   distinguish the record; it SHOULD NOT silently hide it (absence of data is
   not evidence of closure — §6).
3. **Not mutate:** never alter a foreign record's content; enrichments live
   in the consumer's own records with `same_as` claims.
4. **Preserve chains:** an aggregator republishing MUST keep the **original**
   `source{}` intact — its own identity goes in the envelope `publisher_id`,
   never in the record's provenance.
5. **Dedupe by claim, not by authority:** cluster via `same_as` (one-hop,
   non-transitive) plus accent-folded address/DIVIPOLA matching — never raw
   display strings; publish clusters only as the consumer's own records.
6. **Respect exclusions:** never join place data with person-level sources
   (§7.1); never fetch from publishers whose declared policy reserves reuse.

## §4.4 Sync tiers

| Tier | Mechanism | Who |
|---|---|---|
| Cheap (L2) | Poll feed per `ttl`; optional per-shard `lastmod` | Static publishers |
| Standard (L3) | `cursor` pagination on a server sequence | API publishers |
| Push | **Out of scope v0.1** | v1+ discussion |

## §4.5 MCP mapping (network-level agent surface)

MCP is an OPTIONAL layer **above** the protocol, never the conformance floor.
One reference server (run by the initiative) serves the whole network:
`list_publishers` → registry; `search_places(municipality?, kind?, q?)` →
federated read over conforming feeds/APIs; `get_place(qualified_id)` → record
+ provenance; `publish_place(...)` → the §4.2 write, only against publishers
whose manifest declares write support. Tool schemas are 1:1 projections of
§4.1/§4.2 — same schema, fourth transport. Product-level MCPs remain their
own; the registry carries their tool metadata (identifiers may be Spanish —
tooling must not assume English).
