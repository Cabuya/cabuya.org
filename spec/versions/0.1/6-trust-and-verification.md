---
version: "0.1"
status: draft
section: 6
order: 6
title: Trust and verification
---

# §6 — Trust and verification

## §6.1 The verification block (Core)

Three ecosystem teams invented this independently — the spec adopts it as
Core:

- **`last_confirmed_at`** — the **key is REQUIRED on every record; `null` is
  legal and honest** ("never confirmed"). Omission is non-conforming.
- `confirmed_by` — a **role token** (`team` | `volunteer` | `official_source`
  | `partner:{publisher_id}`), never a personal name.
- `confirmation_method` — closed enum.
- `confirmations_24h`, `contradictions_active`.
- **`last_reported_absent_at`** — negative confirmation is first-class.
- **`updated_at` ≠ `last_confirmed_at`** (CR-1): freshness semantics do not
  interconvert — **an edit is not a confirmation**.

## §6.2 Staleness display

Consumers MUST show age (§4.3 rule 2). Publishers SHOULD set `expires_at` on
inherently temporary places.

## §6.3 No signatures in v0.1

Key management is the one cost volunteer teams reliably fail at, and the
threat model's dominant risk (poisoned place data) is mitigated at the
**registry** layer (reviewed publishers, canonical URLs) and the **write**
layer (moderation queues), not by record signatures.

**Upgrade path (v1):** manifest-published keys + detached feed signatures
(`{feed-url}.sig`), opt-in per publisher — the envelope already carries
`publisher_id`, so the trust anchor exists.

Threats considered and their mitigations: feed spoofing (HTTPS + registry
canonical URL) · impersonation (registry review) · poisoned places
(moderation queue + `contradictions_active` + validator provenance checks) ·
id squatting (§5 namespace rule + 409) · stale-data harm (mandatory freshness
display) · aggregator amplification (chain preservation, §4.3 rule 4).
