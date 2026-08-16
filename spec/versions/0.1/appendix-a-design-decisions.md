---
version: "0.1"
status: draft
section: 9
order: 9
title: "Appendix A — design decisions and the implementability walkthrough (non-normative)"
---

# Appendix A — Design decisions (NON-NORMATIVE)

> Nothing in this appendix is normative. It records **why** the normative
> sections say what they say, so future RFCs argue against the real
> rationale instead of guessing at it.

## A.1 The decision log

| Decision | Alternatives considered | Why | Revisit when |
|---|---|---|---|
| Static file first (L2 floor) | REST-first; push federation | Nearly half the observed apps are an afternoon from a static file; federation protocols would cost the whole adoption budget; a 300 s `ttl` covers shelter-data latency | A real-time entity (bed availability) enters scope |
| JSON (+ the adopted envelope shape) | HXL-tagged CSV; JSON-LD | Every observed app is JSON-native; JSON-LD variance is a documented interop tax | Never for v0.x |
| Registry by PR + well-known | Central registry only; DNS discovery | Diff-able, reviewable, forkable (a governance feature); catch-all SPAs break well-known-only on real hosts today | Registry outgrows git review |
| One entity (`place`) | Ship need/offer/damage too | Places are the largest duplication surface, non-personal, slow-changing; matching vocabularies are provably incompatible and need the crosswalk machinery first | v0.2 RFCs |
| Feed-first; API required only at L3 | API-first | The founding goal is the API surface, but the *floor* can't be — most observed apps have no public API. One schema, four transports keeps the end-state coherent while the on-ramp stays an afternoon | Two release cycles of L3 adoption data |
| `{publisher_id}:{local_id}`; no UUID mandate | All-UUID; central place ids | Zero-coordination uniqueness; no migration tax; central place identity deferred until real clusters exist | v0.2 place index |
| No signatures v0.1 | Signed feeds; DID identity | Key management fails volunteer teams; registry + moderation mitigate the live threats; upgrade path preserved | First observed spoofing incident, or v1 |
| Event-scoped registry, event-optional records | Country-scoped; event-mandatory | Apps run multiple events in parallel; places outlive emergencies — reuse beyond the founding event is the north star | First non-Colombia deployment |
| Moderation never federates | Federate trust verdicts | Defamation-shaped risk; omission is safe, labelling is not | A cross-publisher trust framework RFC (v1+) |

## A.2 The implementability walkthrough — the afternoon bar

Profile: a real ecosystem app (Next.js App Router + Supabase, no public API),
taken to **L2** by a coding agent with the skill installed:

1. *(15 min)* The skill reads the repo, finds the database schema; maps the
   shelter/collection tables → `place`: `last_confirmed_at` ← the app's own
   confirmation field (this field was lifted *from* the ecosystem), category
   → `place_kind` via the crosswalk, municipality → DIVIPOLA lookup.
2. *(30 min)* The agent writes a route handler (or build-time export)
   serializing the mapped records into the envelope. **The PII decision is
   surfaced to the human**: name/phone columns flagged by the deny-list and
   excluded; `public_url` points at the app's own record pages. One human
   decision.
3. *(15 min)* Manifest written to `/.well-known/cabuya.json`; SPA catch-all
   exclusion added (one line); `robots.txt` check.
4. *(30–60 min)* Validator loop: schema errors → fix mapping; soft-404 →
   pass; always-now double-probe → pass.
5. *(10 min)* Registry PR opened; scheduled re-validation picks it up; the
   `publishes` badge appears.

**Total: ≈ 2 hours of agent time + one human decision.**

Steps that would break the bar if the spec were different — and therefore why
each §10 decision went the way it did: mandatory UUIDs (step 1 becomes a
migration) · mandatory GeoJSON (step 2 grows a geometry refactor) ·
signatures (step 3 becomes a key ceremony) · central place-id minting (step 5
becomes a negotiation).
