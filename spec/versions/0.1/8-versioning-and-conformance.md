---
version: "0.1"
status: normative
section: 8
order: 8
title: Versioning and conformance
---

# §8 — Versioning and conformance

## §8.1 Versioning

- **SemVer** for the spec; `version` in every envelope; supported versions
  span ≤ 2 MAJORs; producers get 180 days on MAJOR bumps; deprecated terms
  warn for one release, then error.
- **A release candidate becomes normative only after ≥ 1 publisher ships it
  publicly** — the spec never outruns its implementers.

## §8.2 Profiles

- **`Core`**: the manifest + one conforming `places` feed with the required
  field set.
- **`Extended`**: capacity, needs, hours, media, institutional contact.
- Editorial rule: **a MUST that a script cannot validate SHOULD be a
  SHOULD.**

## §8.3 Conformance is measured

**Conformance = passing the published validator, never self-declaration**
(production evidence: adapter registries that *declare* unimplemented
capabilities — manifests lie, behavior doesn't). Registry badges are
re-measured on schedule; states: `conforming` | `stale` (validator passing
but `last_updated` beyond 7 × `ttl`) | `failing` | `unreachable` |
`archived`.

## §8.4 Extensibility

Unknown members MUST be preserved and MUST NOT fail validation;
`x_{publisher}_{field}` namespaced extensions are always allowed; shared
extension sets become versioned **Profiles** at public URIs.

## §8.5 Reserved for v0.2 (recorded so names don't drift)

- Entities: `need`/`offer` (with **`quantity_required`** and
  **`quantity_covered`** — the field that prevents over-delivery to
  saturated points while unserved zones wait), `rental_notice`,
  `damage_report` (EDAN-referenced).
- **Alerts reference CAP** — officially adopted in Colombia (IDEAM/UNGRD) —
  rather than any invented format; the registry records publishers' CAP
  endpoints as first-class.
- The curated place index (§5.2).
