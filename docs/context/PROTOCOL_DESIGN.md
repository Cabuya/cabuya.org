# PROTOCOL_DESIGN.md — `cabuya` Protocol, v0.1 Design Proposal

> **DRAFT FOR WORKING-GROUP REVIEW — NOTHING HERE IS FINAL.**
> Every normative statement is a proposal until the working group adopts it through
> the RFC process (`GOVERNANCE_AND_LICENSING.md` §3). Nothing commits any team.
>
> **TL;DR**
> 1. One schema, four transports: a static JSON feed (L2), a read API (L3), a write
>    API (L4) and an MCP surface are projections of the **same** `place` record —
>    a static feed is a degenerate read API and vice versa.
> 2. The envelope is GBFS's, the semantics are this ecosystem's own (verification
>    triple, negative confirmation, three-axis status), and the IDs are
>    `{publisher_id}:{local_id}` — globally unique with **zero coordination**.
> 3. Conformance is a five-level ladder (L0–L4) measured by a validator, never
>    self-declared. The floor for "publishes data" is an afternoon of work — proven
>    against real stacks from the 20-app matrix.
> 4. Person-level data is excluded by **join prohibition**, not just field
>    omission; contact data never travels; scraping is prohibited; moderation
>    verdicts do not federate; consent-to-reuse lives in the envelope.
> 5. Founding principle, made normative where the spec can carry it: **"Crecemos
>    juntos: no competimos, nos alimentamos."** Feeds exist so apps feed each other.
>
> **DECIDED (2026-08-16): the name is `Cabuya`**, with canonical domain **cabuya.org** and compound-name domain **cabuyaprotocol.org**. Brand assets delivered (see `brand/`). Shortlist history and full brand case: `BRAND_AND_NAMING.md`.
>
> Normative keywords **MUST / MUST NOT / SHOULD / SHOULD NOT / MAY** follow RFC 2119
> + RFC 8174. Inputs: `ENTITY_MODEL.md` (field model, verbatim), `PRIOR_ART.md`
> (verdicts A–L), `APPS_MATRIX.md` (+§4.1 addendum), 20 dossiers, `PROGRESS.md`.

---

## 1. Architecture — the conformance ladder

The protocol is a **ladder, not a gate**. Every level is a respected membership
class; each level up unlocks more of the network's value. Levels are cumulative.

| Level | Name | Requirements (summary) | Badge | Typical effort (matrix-calibrated) |
|---|---|---|---|---|
| **L0** | **Listed** | Appears in the registry with a reviewed entry: canonical URL, declared aliases, entity domains, crawl/reuse policy. | `listed` | One PR, minutes |
| **L1** | **Linked** | Publishes the **manifest** (§2) with identity, conformance target, `public_url` pattern, license, `permittedUse`, contact (org-level). Links out to peers (directory widget or equivalent). | `linked` | ≤ 1 hour (static JSON file) |
| **L2** | **Publishes** | Serves ≥ 1 conforming **place feed** (§3) passing the validator at profile `Core`. | `publishes` | **One afternoon** (S apps); days (M) |
| **L3** | **Serves & consumes** | Serves the **read API** (§4.1) *or* live-refreshed feeds with sync signals (§4.4); **consumes** ≥ 1 peer feed under the consumption rules (§4.3). | `interop` | Days |
| **L4** | **Federates** | Accepts **writes** (§4.2) with `source`+`external_id` idempotency; optionally exposes MCP (§4.5). | `federates` | Per-app; Corag + PereiraAyuda + Pereira Responde are already ≥ L4-capable |
| — | **Directory-only** | For apps whose records are irreducibly personal (e.g. Help Them Directly) or who choose not to publish: L0/L1 forever, stated plainly, **respected**. | `listed` / `linked` | — |
| — | **Link-out-only** | People-domain apps (Encontrados, SOS Pereira people sections): L0/L1 ceiling **by rule §7.1**, not by choice. | `listed` | — |

**Preconditions for L2+** (from the discovery-trap evidence, APPS_MATRIX §4.1):
a real `robots.txt` (200, `text/plain`), and the manifest path **excluded from SPA
catch-alls** — the validator treats `200 + text/html` at a discovery path as
*absent* (soft-404 rule), with byte-size equality against `/` as discriminator.

## 2. Discovery

**2.1** A publisher MUST expose a **manifest**: a JSON document conforming to
`manifest.schema.json`.

**2.2** Location (verdict E): RECOMMENDED at `/.well-known/cabuya.json`.
ACCEPTABLE: any stable HTTPS path declared in the registry entry and advertised
with `<link rel="Cabuya" href="…">` in the site's HTML head. The registry
entry is the authoritative pointer; the well-known path is the convention.
(Provisional IANA registration pursued post-naming; never a MUST — some volunteer
hosts mangle dot-directories.)

**2.3** The manifest carries: `protocol` (name+`spec_version`), `publisher{}`
(registry `publisher_id`, canonical URL, declared aliases, org-level contact),
`conformance_target` (L0–L4), `feeds[]` (`{name, url, entity, profile}` — GBFS
auto-discovery style), `api{}` (base URL if L3+), `mcp{}` (endpoint if any),
`license`, `permitted_use[]`, `crawl_policy_url`, `events[]` (registry event ids
served, e.g. `sismos-co-2026`), `languages[]` (BCP 47).

**2.4** **Registry**: a git-tracked JSON/CSV of publishers (IATI/GBFS
`systems.csv` model), updated by pull request with human review. Keys are
**canonical URL + declared aliases, never slugs** (three-names-one-app is real:
alluda). The registry records each publisher's crawl/reuse policy; **tooling
(including the agent skill) MUST honor it** — no fetching from a publisher whose
policy reserves reuse (the Help Them Directly case).

**2.5** *Why not central-only discovery:* a registry outage must not break
publisher-to-publisher reads; why not well-known-only: catch-all SPAs and host
limitations proved 2/20 hosts can't serve it honestly today. Both, each doing the
job it's good at.

## 3. The feed (L2) — v0.1, entity `place`

**3.1 Envelope** (verdict D, adopted from GBFS nearly verbatim):

```json
{
  "last_updated": "2026-08-16T04:00:00Z",
  "ttl": 300,
  "version": "0.1.0",
  "publisher_id": "pereira-ayuda",
  "license": "CC-BY-4.0",
  "permitted_use": ["display", "aggregate", "ai_answer"],
  "data": { "places": [ … ] }
}
```

- `last_updated` (RFC 3339 UTC) is the **mandatory feed-level generation
  timestamp** — without it a consumer cannot distinguish "nothing changed" from
  "the pipeline died" (the seeded-feed case, APPS_MATRIX §4.1). `ttl` is the
  caching contract. `version` is the spec version implemented.
- `license` is REQUIRED. 1 of 20 apps declares one today; absence is an adoption
  blocker for every consumer's legal review. `permitted_use` carries
  consent-to-reuse **in the envelope**, not in robots.txt dialects (one org was
  observed publishing two contradictory consent vocabularies): closed enum
  `display` | `aggregate` | `redistribute` | `ai_answer` | `ai_train`.
- Records: the `place` model of `ENTITY_MODEL.md` §2 — adopted verbatim into
  `place-feed.schema.json`, including the three-axis status (CR-2: names MUST NOT
  encode operational state), the verification block (§6 below), structured
  `source{}`, `public_url` (REQUIRED), and the locator rule (address_text OR
  lat+lon; both RECOMMENDED; neither = non-conforming).
- Transport: HTTPS, UTF-8, `Content-Type: application/json`,
  `Access-Control-Allow-Origin: *` REQUIRED (the one non-obvious MUST — without
  it every browser-based consumer needs a proxy).
- Localized human-readable strings MAY use GBFS-v3 `[{text, language}]`; plain
  strings are interpreted as `es`. **`es` is the REQUIRED baseline; `en`
  RECOMMENDED.** Machine tokens are never translated.
- Size: one file SHOULD stay ≤ 5 MB / ≤ 10 000 records; beyond that, shard by
  DIVIPOLA municipality and list shards in the manifest `feeds[]`. No pagination
  inside static files.
- Sync signals at L2 (cheap tier): re-generate + `last_updated`. RECOMMENDED:
  sitemap-style per-shard `lastmod` (the mapadelterremoto pattern — a working
  incremental sync at zero cost). **Named anti-pattern (MUST NOT):** regenerating
  `lastmod`/`last_updated` per-request so it always reads "now" — worse than no
  signal (observed in production).

**3.2 Static ≡ API equivalence rule:** the feed's `data.places[]` array and the
read API's items (§4.1) MUST be byte-compatible per record. A static feed is a
degenerate read API; conformance tooling tests them with the same schema.

## 4. The standard API surface — how apps feed each other

> This section is the protocol's end-state and the founding goal: **standardized
> exposure and consumption so the apps feed each other.** L2 is the on-ramp; this
> is the road.

### 4.1 Read API (L3)

- Base path: `/{api-base}/v1/places` — RECOMMENDED base `/api/public/v1/`
  (an **emergent ecosystem convention already used independently by three apps**;
  adopted, not invented).
- Parameters (all optional): `municipality` (DIVIPOLA), `kind` (place_kind),
  `bbox` (`west,south,east,north`, RFC 7946 order), `updated_since` (RFC 3339),
  `limit` (1–500, default 100), `cursor` (opaque).
- **Cursor rule:** incremental sync MUST order on a **server-side sequence**
  (opaque cursor), never on record timestamps — offline-composed reports arrive
  hours after their `createdAt` and timestamp-cursors silently drop them
  (the gravitas offline-queue evidence). `updated_since` is a convenience filter,
  not the sync mechanism.
- Responses use the feed envelope with `data.places[]` + `next_cursor`.
  CORS `*`, no auth for reads.

### 4.2 Write API (L4)

Modeled on the ecosystem's own production precedent (Corag's public API, already
written to by AquíAyuda with namespaced external ids):

- `POST /{api-base}/v1/places` — envelope:
  `{ "source": "<publisher_id>", "external_id": "<sender's local_id>", "place": { … } }`.
- **Idempotency MUST be keyed on (`source`, `external_id`)** — re-sending is an
  upsert of the sender's own contribution, never a duplicate. (One mechanism, not
  two: the dual Idempotency-Key + source/externalId ambiguity observed in one
  spec is resolved in favor of the pair.)
- Auth: publisher's choice, declared in the manifest — `none` (emergency mode),
  `bearer` (hand-issued per integration, the Pereira Responde model). In `none`
  mode, mitigations are REQUIRED: rate limiting, a moderation queue before
  records enter the publisher's own feed, and echo responses carrying the
  record's moderation state (`received` | `published` | `held`).
- The receiver republishes accepted records with `source.source_id` = the sender
  — **the sender's identity travels with the record forever** (§4.3.1).
- Status codes: 201 created/replayed, 400 schema, 401 (+`WWW-Authenticate`),
  409 (id conflict outside sender's namespace — a publisher MUST NOT mint in
  another's namespace, R9), 429, 5xx.

### 4.3 Consumption rules — what "nos alimentamos" requires

A consuming app (L3+) MUST:

1. **Attribute**: display the origin publisher for every foreign record
   (machine-checkable via `source.source_id`; `attribution_required` honored —
   *"el crédito de terceros no se borra"*).
2. **Show age**: render `last_confirmed_at` age (or "sin confirmar" for `null`)
   wherever a foreign record can direct a person somewhere. When age exceeds
   7 days OR `contradictions_active > 0`, the consumer MUST visually distinguish
   the record (de-emphasis, warning, or equivalent); it SHOULD NOT silently hide
   it (absence of data is not evidence of closure — §6).
3. **Not mutate**: never alter a foreign record's content; enrichments live in
   the consumer's own records with `same_as` claims.
4. **Preserve chains**: an aggregator republishing MUST keep the **original**
   `source{}` intact (chain, not overwrite) — its own identity goes in the
   envelope `publisher_id`, not in the record's provenance.
5. **Dedupe by claim, not by authority**: cluster via `same_as` (one-hop,
   non-transitive, Q5) + address/DIVIPOLA matching (accent-folded, never raw
   display strings); publish its own clusters only as its own records.
6. **Respect exclusions**: never join place data with person-level sources
   (§7.1), never fetch from publishers whose declared policy reserves reuse.

### 4.4 Sync tiers

| Tier | Mechanism | Who |
|---|---|---|
| Cheap (L2) | Poll feed per `ttl`; optional per-shard `lastmod` | Static publishers |
| Standard (L3) | `cursor` pagination on server sequence | API publishers |
| Push | **Out of scope v0.1** (federation protocols rejected, verdict K) | v1+ discussion |

### 4.5 MCP mapping (network-level agent surface)

- MCP is an OPTIONAL layer **above** the protocol, never the conformance floor
  (verdict L). One **reference server** (run by the initiative, spec'd in
  `PRODUCTS_BLUEPRINT.md`) serves the whole network:
  `list_publishers` → registry; `search_places(municipality?, kind?, q?)` →
  federated read over conforming feeds/APIs; `get_place(qualified_id)` → record +
  provenance; `publish_place(target_publisher, source, external_id, place)` →
  §4.2 write, only against publishers whose manifest declares write support.
- Tool schemas are 1:1 projections of §4.1/§4.2 — same schema, fourth transport.
- Product-level MCPs (Corag's, PereiraAyuda's, Pereira Responde's) remain their
  own; the registry carries their tool metadata (names may be Spanish — the
  registry must not assume English identifiers).

## 5. Identifiers

- **Record identity (REQUIRED, v0.1):** `{publisher_id}:{local_id}`. `publisher_id`
  is registry-assigned once (PR-reviewed, human-readable); `local_id` is whatever
  the publisher's database already uses (int, UUID, 10-hex — all conforming
  unchanged, R3). Globally unique with zero coordination (R2). MUST NOT embed
  personal data (R6); MUST be stable across edits (R1); one id system per entity
  per publisher (R8); never minted in another's namespace (R9).
- **Place identity (deferred to v0.2, Q4):** *claimed* via `same_as[]`
  (fully-qualified ids, one-hop, non-authoritative) + `merged_into` for
  same-publisher supersession. The registry hosts a curated place index
  (municipality-scoped, DIVIPOLA-prefixed, human-legible:
  `co-66001-shelter-coliseo-mayor-01` shape) **only after real clusters exist**.
- All 7 test cases of `ENTITY_MODEL.md` §8.3 pass by construction; worked
  demonstrations for Coliseo Mayor (Manizales test) and Colegio María Auxiliadora
  (same-address-opposite-status → two records, two publishers, `same_as` claim +
  both `service_status` values visible with their ages) are in
  `ENTITY_MODEL.md` §7 and are normative examples in the schema examples folder.
- **Survivability (R12):** ids remain valid references after a publisher winds
  down. See §7.4 (orderly wind-down).

## 6. Trust & verification

- The **verification block is Core** (three independent inventions = a spec
  writing itself): `last_confirmed_at` (key REQUIRED; `null` legal and honest),
  `confirmed_by` (role token, never a name), `confirmation_method` (closed enum),
  `confirmations_24h`, `contradictions_active`, `last_reported_absent_at`
  (**negative confirmation is first-class**), `updated_at` ≠ `last_confirmed_at`
  (CR-1: freshness semantics do not interconvert — an edit is not a
  confirmation).
- Staleness display rules: consumers MUST show age (§4.3.2). Publishers SHOULD
  set `expires_at` on inherently temporary places (7-day precedent).
- **No signatures in v0.1.** Why: key management is the one cost volunteer teams
  reliably fail at, and the threat model's dominant risk (poisoned place data)
  is mitigated at the *registry* layer (reviewed publishers, canonical URLs) and
  the *write* layer (moderation queues), not by record signatures. **Upgrade
  path (v1):** manifest-published keys + detached feed signatures
  (`{feed-url}.sig`), opt-in per publisher; the envelope already carries
  `publisher_id` so the trust anchor exists. Threats considered: feed spoofing
  (mitigated: HTTPS + registry canonical URL), impersonation (registry review),
  poisoned places (moderation queue + `contradictions_active` + §9 validator
  provenance checks), ID squatting (R9 + 409), stale-data harm (mandatory
  freshness display), aggregator amplification (chain preservation §4.3.4).

## 7. Normative exclusions — the lines that don't move

**7.1 Person-level data.** The protocol MUST NOT transport person-level entities
— missing persons, individual cases, volunteer *identities*, personal names,
personal phone numbers, personal media. This is a **join prohibition, not a
field omission**: tooling MUST NOT combine protocol data with person-level
sources, and grants are entity-scoped — an app that holds both acopio and
missing-persons data (four apps do) federates **only** its non-person entities,
from surfaces that do not co-serve person data. People-domain integration is
link-out only, permanently. Free text is the third leak channel: publishers MUST
strip personal data from `description`/`warning_text` before publishing.

**7.2 Contact.** Contact values MUST NOT travel in feeds. `public_url` + link-out
is the mechanism; `contact_available` carries the fact, never the value;
`institutional_contact` (Extended) is org-owned numbers only (Q2 default).

**7.3 Scraping & consent.** Data enters the network by **publication, never by
scraping**. Consuming a publisher requires its registry-declared consent
(`permitted_use`). Suppressed/moderated records are **omitted**, never labelled
downstream (a foreign "informacion_falsa" verdict republished without appeal is
a defamation-shaped risk).

**7.4 Orderly wind-down.** Consolidation is live (one app is absorbing another
*today*; another commits maintenance only through 2026-11-30). A departing
publisher SHOULD: freeze feeds with a final `last_updated`, publish a
`sunset_at` in its manifest, and either (a) transfer record custody to a named
publisher (records republished with chained provenance) or (b) declare records
archived. The registry marks the publisher `archived`; its `publisher_id` is
never reassigned (R12).

**7.5 Registry suspension (involuntary).** The maintainers MAY mark a publisher
`suspended` — badge withdrawn, feeds delisted, consumers SHOULD stop ingesting —
for: publishing person-level data, persistent fabricated places after notice, or
impersonation. Suspension follows the RFC process's lazy-consensus rules with a
48-hour emergency path for PII incidents; the publisher gets a public, appealable
record (never a silent removal — the same no-silent-verdicts principle §7.3
applies to the registry itself). `publisher_id` is still never reassigned.

## 8. Versioning & conformance

- **SemVer** for the spec; `version` in every envelope; supported versions span
  ≤ 2 MAJORs; producers get 180 days on MAJOR bumps; deprecated terms warn for
  one release, then error. **A release candidate becomes normative only after
  ≥ 1 publisher ships it publicly** (verdict I — the spec never outruns its
  implementers).
- **Profiles:** `Core` (manifest + one conforming `places` feed with the
  required set) and `Extended` (capacity, needs, hours, media, institutional
  contact). Editorial rule: **a MUST that a script cannot validate SHOULD be a
  SHOULD.**
- **Conformance = passing the published validator**, never self-declaration
  (the AquíAyuda lesson: its own adapter registry *declares* capabilities that
  are unimplemented — manifests lie, behavior doesn't). Registry badges are
  re-measured on schedule; states: `conforming` | `stale` (validator passing but
  `last_updated` beyond 7× `ttl`) | `unreachable` | `archived`.
- Extensibility (verdict H): unknown members MUST be preserved and MUST NOT fail
  validation; `x_{publisher}_{field}` namespaced extensions always allowed;
  shared extension sets become versioned **Profiles** at public URIs.

## 9. Draft schemas & examples

Machine-readable proposals (JSON Schema 2020-12) alongside this document:

- `schemas/manifest.schema.json` — the §2 manifest.
- `schemas/place-feed.schema.json` — envelope + `place` (ENTITY_MODEL §2
  encoded; conditional locator rule; verification block with nullable-but-
  required `last_confirmed_at`).
- `schemas/examples/` — **2 valid** (a minimal Core feed; a rich Extended feed
  exercising same_as/negative confirmation with the two worked duplicate cases)
  and **3 invalid with reasons** (missing `last_confirmed_at` key vs honest
  null; contact data in a feed + personal name in `confirmed_by`; name encoding
  status + always-now `last_updated` anti-pattern) — agents learn from
  counterexamples; the validator's error messages quote these cases.

## 10. Design-decision log

| Decision | Alternatives considered | Why | Revisit when |
|---|---|---|---|
| Static file first (L2 floor) | REST-first; push federation | 9/20 apps are an afternoon from a static file; ActivityPub/ATProto cost the whole adoption budget (verdict K); a 300 s `ttl` solves shelter-data latency | A real-time entity (e.g. bed availability) enters scope |
| JSON (+GBFS envelope) | HXL-style tagged CSV; JSON-LD | Every observed app is JSON-native; HXL's own retirement is the cautionary tale; JSON-LD variance is ActivityPub's documented interop tax | Never for v0.x |
| Registry by PR + well-known | Central registry only; DNS discovery | Diff-able, reviewable, forkable (a governance feature); catch-all SPAs break well-known-only on 2/20 hosts today | Registry outgrows git review |
| One entity (`place`) | Ship need/offer/damage too | Places are the largest duplication surface (up to 9 id spaces), non-personal, slow-changing; matching vocabularies are provably incompatible and need the crosswalk machinery first | v0.2 RFCs: need/offer, rental-notice, hazard_notice (Q1), damage (EDAN) |
| Feed-first, API-required-only-at-L3 | API-first | The founding goal is the API surface; the *floor* can't be — 16/20 apps have no public API today. One schema, four transports keeps the end-state coherent while the on-ramp stays an afternoon | Two release cycles of L3 adoption data |
| `{publisher_id}:{local_id}`, no UUID mandate | HSDS all-UUID; central place ids | Zero-coordination uniqueness; no migration tax; central place identity deferred until real clusters exist (Q4) | v0.2 place index |
| No signatures v0.1 | Signed feeds; DID-style identity | Key management fails volunteer teams; registry+moderation mitigate the live threats; upgrade path preserved | First observed spoofing incident, or v1 |
| Event-scoped registry, event-optional records | Colombia-scoped; event-mandatory | One app already runs two country-events in parallel; places outlive emergencies — and reuse-beyond-this-event is the initiative's north star (Q10) | First non-Colombia deployment |
| Moderation never federates | Federate trust verdicts | Defamation-shaped risk; omission is safe, labelling is not | A cross-publisher trust framework RFC (v1+) |

## 11. Agent-implementability check — the afternoon walkthrough

Profile: **Pereira Unida** (real matrix row: Next.js App Router on Vercel +
Supabase, S–M readiness, strongest freshness signals, **no public API**), taken
to **L2** by a coding agent with the future skill installed:

1. *(15 min)* Skill reads the repo, finds Supabase schema; maps `albergues`/
   acopio tables → `place`: `last_confirmed_at` ← its own `last_confirmed_at`
   (exact semantic match — this field was lifted *from this app*), category →
   `place_kind` via crosswalk, municipality → DIVIPOLA lookup (66001/66170).
2. *(30 min)* Agent writes a Next.js route handler (or build-time static
   export) serializing the mapped records into the envelope; **PII decision
   surfaced to the human**: `full_name`/`phone` columns are flagged by the
   skill's deny-list and excluded; `public_url` points at the app's own record
   pages. This is the "M" part of its S–M rating — a human confirms once.
3. *(15 min)* Manifest written to `/.well-known/cabuya.json`; SPA
   catch-all exclusion added (one line in the framework config); `robots.txt`
   check.
4. *(30–60 min)* Agent runs the bundled validator in a loop: schema errors →
   fix mapping; soft-404 check → passes; anti-pattern check (`last_updated`
   must not equal request time on two consecutive probes) → passes.
5. *(10 min)* Registry PR opened with the manifest URL; scheduled re-validation
   picks it up; badge `publishes` appears on the portal.

Total: ≈ 2 hours agent time + one human decision. Every step is validator-loop
checkable; no step requires coordination with any other team. **The bar holds.**

Steps that would break the bar if the spec were different: mandatory UUIDs
(step 1 becomes a migration), mandatory GeoJSON (step 2 grows a geometry
refactor), signatures (step 3 becomes key ceremony), central place-id minting
(step 5 becomes a negotiation). Each is why the corresponding decision in §10
went the way it did.

---

*Produced under plan Rule-0. Every evidence citation resolves to
`APPS_MATRIX.md`, `ENTITY_MODEL.md`, `PRIOR_ART.md` or a dossier in `apps/`.
This is a draft for the working group; the RFC process governs every change.*

---

## Addendum A — Mesa Técnica integration (2026-08-16, post-completion iteration)

Adopted from the mesa técnica's interoperability report (full analysis:
`MESA_TECNICA_ALIGNMENT.md`; decisions log: `DECISIONS.md`):

1. **Name & domains final:** the protocol is **Cabuya**; canonical host
   `cabuya.org`, compound `cabuyaprotocol.org`; manifest at
   `/.well-known/cabuya.json`; schema `$id`s use `https://cabuya.org/schemas/…`.
2. **HXL/CSV on-ramp (below L2):** an HXL-tagged CSV at a stable URL is an
   accepted *generator input* — the skill/validator `convert` mode produces the
   conforming JSON feed from it. One canonical schema still (§3.2 holds);
   conformance is measured on the produced feed. The converter MUST drop
   contact columns (§7.2) unless declared institutional. Metric adopted: from
   2 machine-readable sources to 10.
3. **Alerts (v0.2) reference CAP, not an invented format** — CAP is officially
   adopted in Colombia (IDEAM/UNGRD/Google). Q1's default is updated
   accordingly: `hazard_notice` becomes a CAP profile/reference, and the
   registry records publishers' CAP endpoints as first-class.
4. **People verticals converge to official channels:** the §7.1 exclusion now
   also RECOMMENDS that people-domain tools display and link the authoritative
   channels — Cruz Roja Colombiana (Restablecimiento del Contacto Familiar) for
   missing persons; Registro Único de Damnificados (UNGRD) for affected people
   — and the registry lists those channels as `official_source` entries.
5. **Registry as fraud countermeasure:** a verified, PR-reviewed registry of
   legitimate points is a public-utility argument (Police/DIJIN fraud alerts,
   report §2.4); institutional presentation to Alcaldía + UNGRD is a roadmap
   task. §7.5 suspension + measured badges are what make the property real.
6. **Registry place-id shape harmonized** with the mesa's human-legible pattern
   (`CO-RIS-PER-ACOPIO-0007` ↔ our DIVIPOLA-scoped `co-66001-…` — one mapping,
   documented in the registry spec); record identity is unchanged
   (`{publisher_id}:{local_id}`).
7. **`quantity_covered` reserved** for the v0.2 need/offer entity (the report's
   `cantidadCubierta`), alongside `quantity_required` — the field that prevents
   over-delivery to saturated points while unserved zones wait.
