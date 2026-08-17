---
version: "0.1"
status: normative
section: 3
order: 3
title: The feed (L2) — envelope and records
---

# §3 — The feed (L2), entity `place`

## §3.1 Envelope

```json
{
  "last_updated": "2026-08-16T04:00:00Z",
  "ttl": 300,
  "version": "0.1.0",
  "publisher_id": "example-app",
  "license": "CC-BY-4.0",
  "permitted_use": ["display", "aggregate", "ai_answer"],
  "data": { "places": [] }
}
```

- **`last_updated`** (RFC 3339 UTC) is the REQUIRED feed-level generation
  timestamp — without it a consumer cannot distinguish "nothing changed" from
  "the pipeline died". **`ttl`** is the caching contract. **`version`** is the
  spec version implemented.
- **`license` is REQUIRED.** An unlicensed feed does not conform: absence
  blocks every consumer's legal review. **`permitted_use`** carries
  consent-to-reuse **in the envelope** (closed enum: `display` | `aggregate`
  | `redistribute` | `ai_answer` | `ai_train`).
- **Records** follow the `place` model encoded in
  [`place-feed.schema.json`](https://cabuya.org/schemas/0.1/place-feed.schema.json),
  including the three-axis status (names MUST NOT encode operational state —
  CR-2), the verification block (§6), structured `source{}`, REQUIRED
  `public_url`, and the locator rule (`address_text` OR `lat`+`lon`; both
  RECOMMENDED; neither = non-conforming).
- **Transport:** HTTPS, UTF-8, `Content-Type: application/json`, and
  **`Access-Control-Allow-Origin: *` REQUIRED** — the one non-obvious MUST;
  without it every browser-based consumer needs a proxy.
- **Localization:** human-readable strings MAY use `[{text, language}]`
  arrays; plain strings are interpreted as `es`. **`es` is the REQUIRED
  baseline; `en` RECOMMENDED.** Machine tokens are never translated.
- **Size:** one file SHOULD stay ≤ 5 MB / ≤ 10 000 records; beyond that,
  shard by DIVIPOLA municipality and list shards in the manifest `feeds[]`.
  No pagination inside static files.
- **Sync signals at L2:** re-generate + `last_updated`; RECOMMENDED
  per-shard `lastmod`. **Named anti-pattern (MUST NOT):** regenerating
  `last_updated` per request so it always reads "now" — worse than no signal
  (observed in production).

## §3.2 Static ≡ API equivalence rule

The feed's `data.places[]` array and the read API's items (§4.1) MUST be
byte-compatible per record. A static feed is a degenerate read API;
conformance tooling tests both with the same schema.
