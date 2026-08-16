---
version: "0.1"
status: draft
section: 5
order: 5
title: Identifiers
---

# §5 — Identifiers

## §5.1 Record identity (REQUIRED, v0.1)

`{publisher_id}:{local_id}`.

- `publisher_id` is registry-assigned once (PR-reviewed, human-readable);
  `local_id` is whatever the publisher's database already uses (int, UUID,
  hex — all conforming unchanged). Globally unique with **zero
  coordination**.
- Ids MUST be stable across edits; MUST NOT embed personal data; one id
  system per entity per publisher; **never minted in another publisher's
  namespace** (the write API answers 409 — §4.2).

## §5.2 Place identity (deferred to v0.2)

*Claimed* via `same_as[]` (fully-qualified ids, one-hop, non-authoritative)
plus `merged_into` for same-publisher supersession. A curated,
municipality-scoped place index (DIVIPOLA-prefixed, human-legible — e.g. the
`CO-RIS-PER-ACOPIO-0007` shape used institutionally, mapped 1:1 to the
`co-66001-…` scheme) enters the registry **only after real clusters exist**.
Record identity is unchanged by any of this.

## §5.3 Survivability

Ids remain valid references after a publisher winds down (§7.4): a
`publisher_id` is never reassigned, even after archive.
