# ENTITY_MODEL.md — Canonical Entity Model & Cross-App Field Mapping

> **Task:** 2 — Canonical entity model & cross-app field mapping
> **Plan:** `PLAN_unified_aid_protocol_analysis`
> **Date:** 2026-08-16
> **Status:** **Analysis only.** Everything below is a *proposal drafted for the working group to
> approve, amend or reject*. Nothing here commits any ecosystem team, and no field name is final —
> the wire format, JSON Schemas and conformance rules are Task 4's to decide. This document supplies
> the semantics those artefacts will encode.

> **TL;DR**
> 1. **v0.1 is one entity: `place`.** Twenty apps model overlapping realities, but exactly one object
>    recurs in eight of them with enough shared structure to standardise this month: a physical point
>    where aid happens — collection centre, shelter, hospital, water/food point. Everything else waits.
> 2. **Ten required fields, each earning its place by a documented failure.** `id`, `publisher_id`,
>    `name`, `place_kind`, `municipality_code`, one locator (`address_text` **or** `lat`+`lon`),
>    `lifecycle_status`, `last_confirmed_at` (nullable, but the key MUST be present), `public_url`,
>    `source{}`. Required = the minimum for **dedupe + trust**; nothing else is REQUIRED in Core.
> 3. **The verification/freshness triple is core, not an extension** — three teams invented it
>    independently, and `last_confirmed_at: null` must be legal, because on one live map 86 % of points
>    are stale by the app's own measure and another publishes 226 records with no recency signal at all.
>    **Negative confirmation ("ya no está") is a first-class concept**, not the absence of a positive one.
> 4. **Status is three orthogonal axes** — lifecycle / fulfilment / moderation — and **moderation
>    verdicts MUST NOT federate**: suppressed records are omitted, never labelled downstream.
> 5. **Contact data never travels in a feed.** Feeds carry `public_url` and the consumer links out.
>    IDs are opaque and carry no personal data.
> 6. **All person-level entities are excluded permanently** — and the exclusion zone is bigger than the
>    two apps in the `people` category: **four apps hold missing-persons data**, and two more hold
>    volunteer-availability records that are personal data wearing an operational label.
>
> **Inputs:** the 20 dossiers in `analysis_results/apps/` (probes 2026-08-16T04:00–04:12Z) ·
> `analysis_results/APPS_MATRIX.md` · `analysis_results/PRIOR_ART.md` (Part II verdict table) ·
> `PROGRESS.md` Task 1 findings. Every mapped field cites its dossier and section; anything thin is
> marked `unverified`. No personal data, no record values, no contact details appear anywhere below.

---

## 0. Method — how this model was derived

Bottom-up, in four passes:

1. **Enumerate.** Every entity any of the 20 apps exposes was listed from its dossier's *Entity
   inventory* section — 60+ named entities across the ecosystem.
2. **Normalise synonyms.** Names that denote the same real-world object were collapsed (§0.1).
3. **Rank by evidence, not by elegance.** An entity earns v0.1 status only if multiple independent
   apps hold *populated* records of it. Taxonomy breadth was explicitly not rewarded — one app
   publishes seven entity types of which six read `0` at probe time
   (`APP_terremotocolombia.md` §Entity inventory, §Risks note 7). **Federate the entities that have
   data, not the entities that have schemas.**
4. **Derive fields from observed failures.** Each REQUIRED field below is traceable to a concrete,
   dated failure in production data. A field that prevents no observed failure is OPTIONAL or absent.

### 0.1 Synonym normalisation

| Canonical concept | Observed surface forms (app: term) |
|---|---|
| **collection centre** | alluda: `centros` / "Centro de acopio" · pereiraayuda: `categoria: acopio` · unidosporpereira: `sec: acopio` / `capa: "Centro de acopio"` · ayudared: "Acopio", with a systematic `CAFE ` prefix · terremotocolombia: "📦 Acopio" · gravitas: "Centro de acopio" (folded with albergue **and** "puesto de mando") · pereiraresponde: `type: support` + `category: collection` · reporteco: curated "Acopio y hospitales" · corag: `category: acopio`, `collectionCenter{}`, `destination_help_point_id` · mapadelterremoto: shelter/collection register · aquiayuda: `/centro/:id` (re-exposing alluda's PK) |
| **shelter** | pereiraayuda: `albergue` · unidosporpereira: `sec: albergues` / `capa: "Albergue"` · ayudared: "Albergue" · mapadelterremoto: `/albergues` · pereiraresponde: `support/shelter` · reporteco: `shelter` / "Albergue/techo" · corag: `category: refugio` · sostremoto: "Alojamiento" (demand-side) · aquiayuda: `"Refugio temporal"` (its own label for `support/shelter`) |
| **hospital / clinic** | pereiraayuda: `hospital` · unidosporpereira: `capa: "Clínica / hospital"`, `sec: salud` · terremotocolombia: `/hospitales` · mapadelterremoto: `/hospitales`, "45 receiving hospitals" · pereiraresponde: `support/hospital` |
| **water point** | gogo: `hidratacion_provee` · corag: `category: agua` · reporteco: `categoria: water` / "Agua" |
| **food point / kitchen** | gogo: `cocina`, `punto_comida` · unidosporpereira: "Cronograma de comidas" · mapadelterremoto: "227 ABACO food-bank points" · corag: `category: alimentos` |
| **pet-related point** | pereiraayuda: `mascota` · unidosporpereira: `#peluditos` · terremotocolombia: `/mascotas` · pereiraresponde: `support/veterinary` · gogo: `NEGOCIO_TIPOS: mascotas` |
| **open business** | gogo: `negocios` (9 subtypes) · unidosporpereira: `capa: "Local que ayuda"` · pereiraresponde: `support/store`, `support/pharmacy` |
| **information point** | gravitas: "puesto de mando" (folded into acopio) · terremotocolombia: `/telefonos` (institutional lines) · mapadelterremoto: official-sources section |
| **need** (attached to a place or standalone) | alluda: `necesidades` · unidosporpereira: `nec[]` · pereiraayuda: `etiquetas[]` + `necesita_ayuda` · gogo: quantity fields on `reportes` · corag: `type: request` · pereiraunida: Pedir · sostremoto: "Necesito ayuda" · terremotocolombia: "🙋 Necesidades" |
| **offer** | alluda: `ofrecimientos` · corag: `type: offer` · pereiraunida: Ofrecer / `help_offers` · sostremoto: "Ofrezco ayuda" · terremotocolombia: "📦 Tengo" |
| **damage report** | pereiraresponde: `Report{type: housing\|road}` · sismovision: crack `Report` · reporteco: `categoria: damage` · terremotocolombia: "🏢 Edificios" · gravitas: "Edificio" · ayudared: `DA-*` · pereiraayuda: `colapso` · sospereira: `/estructuras/reportar` · mapadelterremoto: 3 068 damage points (EDAN-normalised) |
| **rental / housing offer** | pereiravive: `/arriendo/{n}` · pereiraunida: `rentals` · unidosporpereira: `#viviendas` · pereiraayuda: `vivienda` · (out-of-directory) encuentraloaunclic: `inmuebles` |
| **pet notice** | encuentratumascota: `anuncio` (se busca / se encontró) |
| **person record** | encontrados · sospereira · terremotocolombia ("🔍 Buscan") · ayudared (`AC-*`) — **excluded, see §3** |
| **volunteer availability** | pereiraunida: Entity B · alluda: `voluntarios` · gravitas: "Voluntariado" · terremotocolombia: `/voluntario` — **excluded, see §3.4** |
| **transport capacity** | corag: `LogisticsOperation` · alluda: `transportes` + `vehiculos` · gravitas: "Logística" |
| **hazard / closure** | unidosporpereira: `sec: riesgos` / "No transitar" · gogo: `cierres_via` · pereiraresponde: `type: road` · reporteco: "Vías/deslizamientos" · reporteco curated "Zonas de peligro" |
| **service status / all-clear** | terremotocolombia: "💡 Sin luz" · reporteco: `telecoms`, `electricidad` · mapadelterremoto: `Estado operativo` narrative blocks |
| **connectivity point** | terremotocolombia: "🛰️ Starlink" — unique across all 20 apps |

---

## 1. The canonical set, tiered

### 1.1 v0.1 — one entity

| Entity | Definition | Why it is first |
|---|---|---|
| **`place`** | A fixed physical point where aid is given, received, stored or dispensed, published as a durable record rather than as a momentary event. | **Eight apps hold populated place records covering the same municipalities** (`APPS_MATRIX.md` §2). It is the ecosystem's proven duplication surface — ~20 concrete duplicate cases documented, including one where the same address carries **opposite operational status** in two apps (`APPS_MATRIX.md` §2.1). It is also the only entity where a de-identified record loses nothing: "Coliseo Mayor, Pereira, shelter, full, confirmed 8 h ago" is complete without a single personal datum. |

**Scope boundaries fixed now, so they are not re-litigated later:**

- A `place` is a **point**, not an area or a line. Road closures and risk zones (`unidosporpereira`
  `sec: riesgos`, `gogo` `cierres_via`, `pereiraresponde` `type: road`) are geometry of a different
  kind and are deferred to a v0.2 `hazard_notice` (§1.2, open question Q1).
- A `place` is not a *situation at a place*. `unidosporpereira` carries `coliseo Mayor` twice — once
  as an open shelter and once as a "No transitar" risk zone (`APP_unidosporpereira.md` §Shelters, in
  detail). That is legitimate modelling of two different assertions about one building, and the
  canonical model must let both exist without merging them.
- A `place` is **not** a person, an organisation, a campaign, or a household. See §3.

### 1.2 v0.2 candidates

Each is a real, evidenced entity that is *not* ready for v0.1, with the specific blocker named.

| Entity | Evidence base | Blocker for v0.1 | Field sketch |
|---|---|---|---|
| **`need`** | alluda `necesidades` (321 registered, 210 urgent-and-uncovered) · unidosporpereira `nec[]` with priority labels · pereiraayuda `etiquetas[]` (19 closed values) + `necesita_ayuda` (69) · gogo need/covered quantities · corag `type: request` · pereiraunida Pedir (~180) · sostremoto board · terremotocolombia "Necesidades" (0 at probe) | **Quantity semantics are incompatible.** alluda splits need vs stock across `necesidades` and `inventario`; gogo keeps *needed*, *already covered*, *can provide*, *affected people* and *capacity* on one record (`APP_gogo.md` §Entity inventory); pereiraayuda models needs as tags with no quantity at all. Standardising units and coverage arithmetic is a design task, not a mapping task. | `id`, `place_id?`, `category`, `quantity{value,unit}?`, `covered{value,unit}?`, `priority`, `fulfilment_status`, verification triple |
| **`offer`** | corag `type: offer` · alluda `ofrecimientos` (371 offered, 237 claimed, **172 awaiting transport**) · pereiraunida `help_offers` · terremotocolombia "Tengo" | **An offer is usually attached to a person.** alluda's `ofrecimientos` carries `nombre` and `direccion_recogida`; pereiraunida's `help_offers` carries `full_name` and `phone` (`APP_alluda.md`, `APP_pereiraunida.md` §Entity inventory). A publishable projection exists (category + quantity + municipality + link-out) but has to be designed, not mapped. | `id`, `category`, `quantity?`, `pickup_municipality_code`, `fulfilment_status`, `public_url` |
| **`damage_report`** | pereiraresponde (`housing` 93/100 in sample, 4 risk levels, 1–3 photos, ISO `createdAt`) · sismovision (crack reports + **professional reviews**) · reporteco (`damage`, GeoJSON today) · terremotocolombia "Edificios" · gravitas "Edificio" · ayudared `DA-*` · pereiraayuda `colapso` (82) · sospereira `/estructuras/reportar` · mapadelterremoto (3 068 points, **EDAN-normalised**) | **Vocabulary is not settled and the privacy line is subtle.** EDAN is the obvious reference (`APP_mapadelterremoto.md` §Entity inventory) but no other app uses it. And an address + "uninhabitable" + a timestamp **identifies a displaced household** (`APP_sospereira.md` §Structures domain) — so the damage entity needs coarsened geometry rules the place entity does not. | `id`, `damage_kind` (EDAN-aligned), `severity`, coarsened locator, `assessed_by?`, `media[]`, verification triple |
| **`pet_notice`** | encuentratumascota (dedicated board, 6 pages of listings, UUIDv4 ids, **contact brokered, never rendered**) · unidosporpereira `#peluditos` (5) · terremotocolombia `/mascotas` | **Smallest clean entity in the ecosystem and nearly ready** — its blocker is governance, not modelling: no terms, no privacy policy, no published operator, so nobody can licence the feed (`APP_encuentratumascota.md` §Integration surface, §Risks 1). Also: status is encoded in the *route* (`/se-busca` vs `/se-encontro`), not in the record. | `id`, `notice_status` (`sought`\|`found`), `species`, `breed_text`, `colour_text`, `zone_text`, `municipality_code`, `published_at`, `public_url` |
| **`rental_notice`** | **A validated blind spot: four independent datasets, zero cross-links.** pereiravive (106) · pereiraunida `rentals` (~81) · unidosporpereira `#viviendas` (87) · pereiraayuda `vivienda` (4) · plus out-of-directory `encuentraloaunclic` `inmuebles`, wired into aquiayuda `/vivienda` (`APP_pereiravive.md` §Overlap map; `APP_aquiayuda.md` §The source registry) | **Contact *is* the payload** — a rental listing without a way to reach the owner is useless — so this entity forces the `contact_public` consent question that `place` gets to avoid. Also the highest fraud surface: "a delete that does not federate is a fraud vector" (`APP_pereiravive.md` §Risks). | `id`, `property_type` (closed 5), `municipality_code`, `neighborhood_text`, `price?`, `rooms?`, `origin` (`sighting`\|`owner`), `expires_at`, `withdrawn_at`, `public_url` |

**Watch-list (not yet candidates, recorded so they are not lost):**

| Concept | Sole/primary evidence | Why it matters |
|---|---|---|
| `assessment` — an expert opinion attached to a report | sismovision `/reports/{id}/reviews/` + `/professional/verify/` (`APP_sismovision.md` §Entity: Review) | The ecosystem's richest damage data is an engineer's review, and it has nowhere to go. A `place`/`damage_report` cannot express "a credentialed party looked at this". |
| `service_status` / all-clear | terremotocolombia "Sin luz" (`APP_terremotocolombia.md` §Map entity types) | "This neighbourhood is fine but has no power" is decision-relevant and **no protocol that can only express problems can express it**. |
| `connectivity_point` | terremotocolombia "Starlink" — unique in 20 apps | Connectivity as a resource, in a disaster where a reported 3 403 of 7 379 base stations were down. |
| `transport_capacity` | corag `LogisticsOperation` (origin, destination, distance, route conditions) · alluda `transportes`/`vehiculos` · gravitas "Logística" | The *means of moving things* is not a place. alluda's "172 donations awaiting transport" is the gap this entity would close. |
| `hazard_notice` | unidosporpereira `riesgos` · gogo `cierres_via` · pereiraresponde `type: road` · reporteco "Zonas de peligro" | Line/area geometry; needs GeoJSON, which v0.1 deliberately keeps optional (`PRIOR_ART.md` verdict A). |
| `institutional_directory` | terremotocolombia `/telefonos` · mapadelterremoto official-sources · reporteco `/acerca` line list | Called out in `APP_terremotocolombia.md` §Concrete duplicate-place examples as "the easiest possible first federation win" — small, static, entirely non-personal, and copied by hand today. Worth revisiting as a *zero-risk* pilot even before `place`. |

### 1.3 Excluded permanently

| Excluded entity | Held by | Rule |
|---|---|---|
| Missing / found person | encontrados · sospereira · terremotocolombia (307 at probe) · ayudared (`AC-*`) | §3 |
| Person-level aid case (a named individual or family seeking help) | helpthemdirectly (142 campaigns) · pereiraunida "Familia" tab | §3 |
| Volunteer availability record | pereiraunida Entity B (~301) · alluda `voluntarios` (1 081) · gravitas "Voluntariado" · terremotocolombia `/voluntario` | §3.4 |
| Face template / biometric signature | encontrados | §3 |
| Reporter identity, comments, free-text threads | sismovision `/comments/` · pereiraunida `reason`/`note` · pereiraayuda `aviso_comunidad` (community text) | §3.5 |
| Contact details of natural persons | ubiquitous — see §5.6 | §5.6 |
| Moderation verdicts about other publishers' records | pereiraunida (`informacion_falsa`, `duplicado`, `ocultada`) | §5.3 |

---

## 2. `place` — the v0.1 field model

Conventions: field names are **English snake_case machine tokens** and are never translated; human
labels ship in a separate published label table (`PRIOR_ART.md` verdict J). Timestamps are RFC 3339
UTC. `REQ` column: **R** = REQUIRED in the Core profile · **C** = conditionally required · **O** =
optional in Core · **E** = Extended profile.

### 2.1 Identity and classification

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `id` | string | **R** | The publisher's stable identifier for this record, unique within the publisher. Opaque to consumers. MUST NOT embed personal data. |
| `publisher_id` | string | **R** | Registry-assigned, human-readable publisher token (e.g. `pereira-ayuda`). Together with `id` it forms a globally unique key with zero coordination cost. |
| `name` | string | **R** | Human-readable name of the place, as the publisher holds it. MUST NOT encode operational state (see §5.3, conformance rule CR-2). |
| `place_kind` | enum | **R** | One of the 11 core values in §4.1. |
| `place_kind_secondary` | array&lt;enum&gt; | O | Additional kinds when a place genuinely serves two functions (a shelter that is also a collection centre). Evidence for multi-valuedness: reporteco ships both `categoria` and `categorias[]` after finding real records need more than one (`APP_reporteco.md` §Risks 10). |
| `place_kind_ext` | string | O | Namespaced extension token for a kind the core vocabulary does not carry (e.g. `x_terremotocolombia_starlink`). |
| `origin_category` | string | O | The publisher's own category value, **verbatim**, untranslated. Preserves information the core vocabulary loses and makes every crosswalk auditable. |
| `description` | string | O | Free text. Publishers MUST strip personal data before publishing (§5.6). |

### 2.2 Location

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `municipality_code` | string | **R** | **DIVIPOLA** municipality code (5 digits, e.g. `66001`). The scoping key for place identity. |
| `municipality_text` | string | O | The publisher's raw municipality string, preserved for audit. |
| `address_text` | string | **C** | Street address or an unambiguous reference description ("junto a la cancha del parque principal"). |
| `neighborhood_text` | string | O | Barrio, verbatim. Uncontrolled by design in v0.1 (§5.5). |
| `lat` | number | **C** | WGS 84 decimal degrees, SHOULD carry 6 decimal places. |
| `lon` | number | **C** | WGS 84 decimal degrees. |
| `geo_precision` | enum | O | `exact` \| `approximate` \| `centroid` \| `unknown`. |

> **Conditional rule (the locator rule):** a record MUST carry **at least one** of
> (a) `address_text`, or (b) both `lat` and `lon`. Both is RECOMMENDED. Neither is non-conforming.

### 2.3 Status — three orthogonal axes

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `lifecycle_status` | enum | **R** | Does this place exist as an aid point at all? `active` \| `closed` \| `planned` \| `unknown`. |
| `service_status` | enum | O | Can it take what you are bringing right now? `open` \| `full` \| `paused` \| `unknown`. Separated from lifecycle because a shelter can be `active` + `full`. |
| *(moderation)* | — | **absent by design** | A publisher's internal trust verdict has **no field**. Suppressed records are omitted from the feed. See §5.3. |
| `closed_at` | timestamp | O | When the place stopped operating, if known. |
| `expires_at` | timestamp | O | For inherently temporary places, after which the record SHOULD be treated as unconfirmed. Precedent: pereiravive's 7-day TTL. |

### 2.4 Verification and freshness — the trust core

This block is **core, not an extension**. Three teams built the same model independently without
coordinating: pereiraayuda (`ultima_validacion` + `confirmaciones_24h` + `contradicciones_activas`),
unidosporpereira (`frescura` tier + `verificado` + `aprox`), pereiravive (7-day TTL + negative
confirmation + `origen` provenance tier). Convergence at that rate is a specification writing itself.

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `last_confirmed_at` | timestamp \| **null** | **R** | When a human last confirmed this place was there and operating as described. **The key MUST be present; `null` is a legal and meaningful value** meaning "never confirmed". Omitting the key is non-conforming; `null` is honest. |
| `confirmed_by` | string | O | A publisher-scoped **role or actor token** — `team`, `volunteer`, `official_source`, `partner:{publisher_id}`. **MUST NOT be a person's name.** |
| `confirmation_method` | enum | O | `in_person` \| `phone` \| `official_source` \| `partner_report` \| `user_report` \| `unverified`. |
| `confirmations_24h` | integer | O | Count of distinct positive confirmations in the last 24 h. Directly lifted from pereiraayuda. |
| `contradictions_active` | integer | O | Count of active reports that the place was **not** there. Negative confirmation is a first-class signal, not the absence of a positive one. |
| `last_reported_absent_at` | timestamp | O | When someone last reported "ya no está". A place can be simultaneously `active` per the publisher and carry a recent absence report — and a consumer must be able to show that tension. |
| `updated_at` | timestamp | O | When the record last changed for any reason. **Distinct from `last_confirmed_at` and never a substitute for it** (§5.2, conformance rule CR-1). |
| `published_at` | timestamp | O | When the record first appeared. |

### 2.5 Provenance — structured, never prose

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `source` | object | **R** | `{ source_id, source_url?, retrieved_at?, source_kind? }`. `source_id` is a registry publisher token when the origin is an ecosystem app, or a registry-declared external-source token otherwise. `source_kind` ∈ `first_party` \| `partner_feed` \| `official_source` \| `press` \| `user_report`. |
| `source_authority` | enum | O | `government` \| `ngo` \| `community` \| `volunteer` \| `commercial`. Requested explicitly in `APP_sospereira.md` §What institutional operation implies — a municipal record carries authority a volunteer record does not, and consumers must render that honestly. |
| `attribution_required` | boolean | O | Mirrors the publisher's licence terms at record level. pereiraayuda's rule — *"el crédito de terceros no se borra"* — becomes machine-checkable. |

### 2.6 Linking out (and what never travels)

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `public_url` | string (URL) | **R** | Canonical, human-facing page for this record at the origin. The mechanism by which contact, media and detail reach a user **without travelling in the feed**. |
| `contact_available` | boolean | O | Whether the origin holds a contact route for this place. Carries the *fact*, never the value. |
| `institutional_contact` | object | **E** | Extended profile only, and only for a number/address belonging to an **organisation**, never a natural person. Mirrors pereiraayuda's own published rule (institutional switchboards and consented numbers only). See open question Q2. |
| `media[]` | array | **E** | URLs referencing media **at the origin**. Consumers MUST reference, never mirror, so an origin takedown propagates (`APP_encuentratumascota.md` §Risks 3; `APP_pereiraresponde.md` §Risks 8). |

### 2.7 Cross-reference and merge

| Field | Type | REQ | Semantics |
|---|---|---|---|
| `same_as[]` | array&lt;string&gt; | O | Fully-qualified identifiers (`{publisher_id}:{id}`) of records **claimed** to describe the same physical place. A claim, never an authority; non-transitive (open question Q5). |
| `merged_into` | string | O | This record has been superseded by another record from the **same** publisher. Precedent: alluda's `ciudades.fusionada_en` — the team already solved merge identity one level up, for municipalities, and not for the entity that actually duplicates across apps (`APP_alluda.md` §Entity inventory). |
| `cluster_size` | integer | **E** | When a record is the product of automatic clustering, how many observations it represents. Required for honesty about gravitas-style ingest-time clustering, whose radius and reversibility are undocumented (`APP_gravitas.md` §Risks 8). |

### 2.8 Extended profile (reserved now, specified in v0.1 Extended)

| Field | Type | Semantics | Evidence |
|---|---|---|---|
| `capacity_total` | integer | Places available | unidosporpereira renders `N personas de M cupos (P%)` — **the only occupancy model in the ecosystem**, and exactly what someone deciding where to send a family needs (`APP_unidosporpereira.md` §Shelters, in detail) |
| `capacity_used` | integer | Places occupied | same |
| `needs[]` | array | `{category, priority, quantity?, unit?}` — needs attached to the place | unidosporpereira `nec[]` with priority labels; alluda `necesidades`; pereiraayuda `etiquetas[]`; gogo need/covered quantities |
| `hours_text` | string | Opening hours as free text in v0.1 | pereiraayuda `horario`. A structured representation is a deliberate non-decision (`PRIOR_ART.md`, deliberate non-decisions) |
| `languages[]` | array | BCP 47 tags served at this place | HSDS precedent |
| `accessibility_text` | string | Free text | HSDS precedent |
| `warning_text` | string | Publisher warning about this record | pereiraayuda `advertencia` / `advertencia_grave` — a publisher-authored caution is decision-relevant and has no other home |

### 2.9 Feed envelope (informative here; normative in Task 4)

`PRIOR_ART.md` verdict D adopts the GBFS envelope. Recorded here only because two envelope fields
are *entity-model* decisions rather than transport decisions:

| Field | Why it belongs to the entity model |
|---|---|
| `license` | mapadelterremoto is the only app in 20 with an explicit data licence (CC BY 4.0, in `Dataset` JSON-LD). Absence of a reuse licence is itself an adoption blocker — a consumer's legal review has nothing to point at (`APP_corag.md` §Risks 9). |
| `publisher{}` | Registry key MUST be a canonical URL + declared aliases, never a slug: alluda answers to three names (*Acopio*, *Ayudas Pereira*, *alluda*), "Unidos por Pereira" ≠ "Pereira Unida", and gogo's Firebase project is literally named `pereira-ayuda` while `pereiraayuda.com` is a different team (`APP_alluda.md` §Identity; `APP_gogo.md` §Identity). |

### 2.10 Why each REQUIRED field is required

Required = the minimum for **dedupe + trust**. Each entry names the failure it prevents.

| Field | The failure it prevents | Evidence |
|---|---|---|
| `id` | Records that cannot be updated, corrected or retired. unidosporpereira's 10-hex ids are app-local and resolvable nowhere; aquiayuda's `/centro/:id` exposes *another team's* primary key as if it were an identity. | `APP_unidosporpereira.md` §Entity inventory; `APP_aquiayuda.md` §Entity inventory |
| `publisher_id` | Identifier collisions across 20 independent id spaces, and unattributable data. Already a production convention: aquiayuda writes to corag with `externalId` `ac-{uuid}` plus a source namespace. | `APP_aquiayuda.md` §Cross-app write conventions |
| `name` | A record no human can adjudicate. Name is **necessary and provably insufficient**: exact-name matching failed on 100 % of ~20 observed duplicate cases. | `APPS_MATRIX.md` §2.1 |
| `place_kind` | Records a consumer cannot route or filter. No two apps' category enums are compatible and none is a superset of another — so a *shared* closed vocabulary is the only way a consumer can act on type. | `APP_sostremoto.md` §Category enum; `APP_pereiraunida.md` §Adoption effort 5 |
| `municipality_code` | Merging two buildings 50 km apart. ayudared holds "Coliseo Mayor de Pereira" **and** "Coliseo Mayor de Manizales" while two Pereira apps call theirs simply "Coliseo Mayor". A code rather than a string, because observed municipality data is dirty: rows misfiled across municipalities (one into another department), `"Pereira cuba"`, and bare numeric values `"12"` / `"2"`. | `APP_ayudared.md` §Entity inventory; `APP_alluda.md` §Collection centres; `APP_pereiravive.md` §Entity inventory |
| **locator** (`address_text` **or** `lat`+`lon`) | Undedupable records. **Address matching succeeded on 100 % of the observed duplicate cases where name matching failed.** Coordinates are *not* required instead, because only 78 of 214 points (36 %) in the ecosystem's best-specified dataset carry them — requiring `lat`/`lon` would discard two thirds of the reference implementation. | `APPS_MATRIX.md` §2.1; `APP_pereiraayuda.md` §Public API counts |
| `lifecycle_status` | Federating a closed collection centre as open. One address in Dosquebradas is `Activo` in one app and "(cerrado ahora)" in another, on the same day. | `APP_unidosporpereira.md` §Overlap map; `APP_alluda.md` §Collection centres |
| `last_confirmed_at` (nullable) | Laundering staleness into other apps' UIs. 31 of 36 points on one live map read `viejo` by the app's own measure (86 %); ayudared publishes 226 place records across 57 municipalities with **no recency signal at all**. `null` must be legal because pereiraayuda already ships a live shelter with `ultima_validacion: null` — and that is the honest value, not a bug. | `APP_unidosporpereira.md` §Risks; `APP_ayudared.md` §Entity inventory; `APP_pereiraayuda.md` §Entity inventory |
| `public_url` | Contact data travelling in feeds. Link-out is the **mechanism** that makes the no-contact rule workable rather than merely prohibitive — so the link cannot be optional. | `APP_corag.md` §Risks 7; `APP_pereiraunida.md` §Risks 1 |
| `source{}` | Personal names leaking through a free-text provenance field — observed in production, in an otherwise careful open API. Structure is the countermeasure: an id that refers to a registry entry cannot contain a person's name. | `APP_pereiraayuda.md` §Risks (PII leak in `fuente`) |

**Deliberately not required**, and why: `lat`/`lon` (36 % coverage); `service_status` (three apps
encode it in incompatible type-dependent vocabularies); `confirmed_by` (no app records a verifier
today — `estado: verificado` has no verifier and no verification timestamp, so requiring it would
make every publisher invent one); `capacity` (one app has it); `description` (free text is where PII
hides); `needs[]` (quantity semantics unsettled).

---

## 3. NORMATIVE — person-level entities are excluded from the protocol

The key words MUST, MUST NOT, SHALL and SHOULD are used per RFC 2119/8174.

### 3.1 The rule

1. The protocol **MUST NOT** define any entity, field, enum value or extension point whose value is,
   or identifies, a natural person. This includes but is not limited to: missing-person reports,
   found-person reports, casualty records, beneficiary or household case records, volunteer
   availability records, reporter identities, biometric templates or derived face signatures,
   personal photographs, and the contact details of natural persons.
2. Conforming publishers **MUST NOT** emit such records in any feed at any profile tier, and
   conforming consumers **MUST NOT** ingest, cache, mirror, index or redistribute them if
   encountered.
3. The registry **MAY** carry, for an app that holds person data: its name, canonical URL, operator,
   category, coverage area, and deep links to its **entry-point** flows. Nothing else.
4. Conforming implementations **MUST NOT** join protocol data against person-level data held
   elsewhere in order to reconstruct identifiable records. **The prohibition is on the join, not only
   on the field.**
5. This exclusion is **permanent and by design**, not a v0.1 scope limitation. It **SHALL NOT** be
   relaxed by a Profile, an extension, a private agreement between two publishers, or a future minor
   version. Any change requires a MAJOR version and an explicit, public working-group decision with
   legal advice on record.

### 3.2 Why — the safety rationale

- **The payload is special-category personal data.** A missing-person record combines an identified
  natural person, a photograph, a last-seen location and a safety status; one app additionally holds
  biometric templates. Under Colombia's Ley 1581 de 2012 and Decreto 1377 de 2013, biometric and
  sensitive data attract heightened consent and purpose-limitation duties
  (`APP_encontrados.md` §Why this app is LINK-OUT ONLY, item 1). *(Stated as an engineering and
  governance constraint; `unverified` as a formal legal opinion — counsel is required before any
  contrary decision.)*
- **Federation multiplies controllers without multiplying consent.** A family consented to *one*
  operator publishing *one* record. It did not consent to N downstream caches.
- **Consent cannot be withdrawn from a federated copy.** Deletion on request is a real remedy only
  while the origin is the single source. A person found safe, a family that changes its mind, a
  record filed in error, a case that becomes a criminal matter — every one needs an erasure path that
  federation destroys.
- **Re-identification and enumeration.** One app's person records use sequential `/person/{n}`
  identifiers with correspondingly enumerable photo paths, and publishes no `robots.txt`. A protocol
  feed would convert an already-walkable corpus into a zero-cost bulk transfer of clean structured
  JSON with names, locations and photo URLs pre-parsed (`APP_encontrados.md` §Why…, item 3).
- **Abuse surface, disproportionately against the vulnerable.** Missing-person data during a disaster
  is a targeting list: it identifies households that are absent, distressed, searching, and likely to
  answer an unknown caller. Foreseeable abuses include impersonation of authorities, extortion,
  donation fraud against named families, and — because reports concern people including minors —
  trafficking and grooming risk.
- **Probabilistic matches lose their caveats when they travel.** One operator states that facial
  recognition "is an aid, not proof". A low-confidence match, propagated across apps, sheds the
  caveat and gains false authority from repetition — producing a wrong identification of a living or
  deceased person, a harm with no undo.
- **Institutional data carries an added presumption of authority.** A record from an Alcaldía portal
  reads as official. Mirrored elsewhere it keeps the authority and loses the chain of custody, the
  correction path and the operator's context (`APP_sospereira.md` §Why this app is LINK-OUT ONLY).
- **The ecosystem already agrees.** This is not a constraint imposed against the grain: corag's own
  public contract states the requester's documentary identity is not part of the public contract;
  mapadelterremoto deliberately links out for persons rather than hosting them; pereiraayuda
  explicitly refuses to publish missing persons, casualty lists and victim counts; reporteco stores
  phone numbers only as irreversible hashes. **The mature apps got here first.**

### 3.3 The exclusion zone is bigger than the `people` category

Two apps are filed under `people` in the directory. **Four hold missing-persons data**, and the
boundary runs *through* apps, not between them:

| App | Category in directory | Person data it holds | Consequence |
|---|---|---|---|
| encontrados | `people` | Missing-person reports (public), rescuer uploads, face templates, reporter contact | Link-out only, permanently |
| sospereira | `people` | Public missing-persons list (municipal) | Link-out only for the people domain; its **structures** domain is a legitimate v0.2 `damage_report` source |
| terremotocolombia | `damage` | 307 missing / 15 found at probe, server-rendered on the homepage, photos served by UUID from the API host | **The proof that federation must be entity-scoped, not app-scoped.** The same platform and API host serve person data and place data |
| ayudared | `logistics` | `AC-*` missing-person case registry alongside 226 place records | Same: publish the places, never the `AC-*` namespace |
| sostremoto | `matching` | `/personas` surface | Not probed by design |
| helpthemdirectly | `matching` | 142 named individual/family fundraising campaigns, personal names in URL slugs | Directory-only tier: a non-personal manifest, nothing below that line |

**Therefore federation MUST be entity-scoped.** An app is never "in" or "out" — each of its entity
types is. Consuming "everything app X publishes" is a non-conforming behaviour.

### 3.4 Volunteer records are person data wearing an operational label

"Voluntariado: persona disponible para ayudar" reads operational and is not. Volunteer registries
carry names, phones, skills, availability and area — pereiraunida (~301 records with `full_name` and
`phone`), alluda (`voluntarios`, 1 081 per the publisher's own counter), gravitas (category 4),
terremotocolombia (`/voluntario`, capturing location, availability, skills and area). Named
explicitly here because the label slips past a PII review that is looking only for victims and
missing persons (`APP_gravitas.md` §Entity inventory, category 4; `APP_terremotocolombia.md` §Risks 11).

### 3.5 Free text is the third channel

Comment threads, community notes and moderation reasons are PII channels by construction: a citizen
types a phone number or a name into a report that publishes instantly. sismovision runs a public
comment thread per report; gravitas publishes with **no** pre-publication moderation
("nunca se oculta"). Conforming feeds **MUST NOT** carry comment threads, and publishers **SHOULD**
scrub free-text fields before publication.

### 3.6 What the ecosystem should offer these apps instead

Not a feed: an inbound **referral convention** (how other apps link *to* them correctly and
consistently), a shared "how to report a missing person" content block, and — as an engineering
donation with no data attached — a `robots.txt`, a `security.txt` and a non-enumerable identifier
scheme. Two of the four person-data apps currently publish none of the three.

---

## 4. Vocabularies

### 4.1 `place_kind` — invented, small, CC0

**Why invented rather than adopted** (`PRIOR_ART.md` verdict B): the AIRS/211 taxonomy that HSDS uses
de facto is **proprietary and fee-licensed**; schema.org's `CivicStructure`/`EmergencyService` tree is
**CC BY-SA 3.0** and models buildings rather than aid functions; OSM tags are apt but ODbL-adjacent in
perception. And within the ecosystem, **no observed enum is a superset of any other** — corag has 15
values, sostremoto 15 different ones, pereiraunida 9, pereiraayuda 10 (+19 tags), reporteco 11,
helpthemdirectly 5. Picking the biggest is not available.

The vocabulary is **CC0**, values are **English snake_case machine tokens**, and display labels live
in a separate table so they can be translated without touching a parser.

| # | Token | ES label | EN label | Evidence (apps holding populated records of this kind) |
|---|---|---|---|---|
| 1 | `collection_center` | Centro de acopio | Collection centre | alluda (184 active) · pereiraayuda (22) · unidosporpereira (16) · ayudared · terremotocolombia (14) · mapadelterremoto (part of 439) · reporteco (part of 33 curated) · pereiraresponde (`support/collection`) · gravitas · corag (`acopio`) |
| 2 | `shelter` | Albergue | Shelter | pereiraayuda (10) · unidosporpereira (10) · ayudared (6 in Pereira) · mapadelterremoto (`/albergues`, 26) · pereiraresponde (`support/shelter`) · reporteco (`shelter`) · corag (`refugio`) |
| 3 | `hospital` | Hospital o clínica | Hospital or clinic | pereiraayuda (11) · mapadelterremoto (`/hospitales`, 13 + 45 receiving) · terremotocolombia (`/hospitales` + 6 sub-pages) · pereiraresponde (`support/hospital`) · unidosporpereira (`sec: salud`, 2) |
| 4 | `health_point` | Punto de salud | Health point | pereiraresponde (`support/pharmacy`) · pereiraayuda (`psicologica`) · gogo (`medicina_humana_provee`) · sostremoto ("Atención médica", "Atención psicológica") |
| 5 | `water_point` | Punto de agua | Water point | gogo (`hidratacion_provee`) · reporteco (`water`) · corag (`agua`) · sostremoto ("Agua") |
| 6 | `food_point` | Punto de comida | Food point | gogo (`cocina`, `punto_comida`) · unidosporpereira ("Cronograma de comidas") · mapadelterremoto (227 ABACO food-bank points across 33 cities) · corag (`alimentos`) |
| 7 | `distribution_point` | Punto de entrega | Distribution point | mapadelterremoto (272 blood-donation / drop-off sites) · ayudared ("Banco de Alimentos — punto alterno") · pereiraresponde (`support/supplies`) |
| 8 | `pet_point` | Punto para mascotas | Pet point | pereiraayuda (`mascota`, 8) · unidosporpereira (`#peluditos`, 5) · terremotocolombia (`/mascotas`) · pereiraresponde (`support/veterinary`) · gogo (`NEGOCIO_TIPOS: mascotas`) |
| 9 | `info_point` | Punto de información | Information point | gravitas ("puesto de mando", folded into acopio) · terremotocolombia (`/telefonos`) · mapadelterremoto (official-sources section) |
| 10 | `open_business` | Negocio abierto | Open business | gogo (`negocios`, 9 subtypes, first-class) · unidosporpereira (`capa: "Local que ayuda"`, 3) · pereiraresponde (`support/store`) |
| 11 | `other` | Otro | Other | Every app. Required escape hatch; MUST be paired with `origin_category`. |

**Two deliberate departures from `PRIOR_ART.md`'s straw list, made on Task 1 evidence:**

- **`warehouse` dropped.** Warehouse-shaped places exist (ayudared's "Complejo Bodeguero Alpaca") but
  every app that holds them files them as collection centres. A value nobody selects is a value that
  fragments the data. Maps to `collection_center` + `origin_category`.
- **`pet_point` and `open_business` added.** Five apps and three apps respectively hold these as
  distinct kinds — more evidence than `water_point`, which the straw list already contained.

**Deferred to `place_kind_ext` / `origin_category`, with their evidence recorded:** machinery staging
(pereiraayuda `maquinaria`, 7), connectivity point (terremotocolombia Starlink — unique in 20 apps),
command post (gravitas, folded into acopio), blood-donation point (mapadelterremoto, 272 — currently
`distribution_point`), and rescue staging (sostremoto "Rescatistas", "Volquetas", "Maquinaria pesada",
which are *capability* classes, not places, and belong to the watch-list `transport_capacity`).

### 4.2 Per-app crosswalks to `place_kind`

Crosswalks live in the **registry**, not in feeds — so they can be corrected without a publisher
redeploying. Lossy joins are marked ⚠ and MUST be flagged in the registry rather than silently applied.

| Publisher | Their value | → `place_kind` | Note |
|---|---|---|---|
| pereiraayuda | `acopio` · `albergue` · `hospital` · `mascota` · `psicologica` · `vivienda` · `maquinaria` · `colapso` · `necesita_ayuda` · `donacion` | `collection_center` · `shelter` · `hospital` · `pet_point` · `health_point` · *(v0.2 `rental_notice`)* · `other`+ext · *(v0.2 `damage_report`)* · *(v0.2 `need`)* · `distribution_point` | The only published closed vocabulary in the ecosystem; 6 of 10 values map cleanly |
| unidosporpereira | `sec: albergues` · `acopio` · `salud` · `locales` · `riesgos` | `shelter` · `collection_center` · `hospital` · `open_business` · *(v0.2 `hazard_notice`)* | `capa` is the display twin of `sec`; map from `sec` |
| alluda | `centros` (single table) | `collection_center` | Kind is implicit in the table; ⚠ some rows are shelters by name |
| ayudared | "Acopio" · "Albergue" | `collection_center` · `shelter` | `CAFE ` prefix is a naming artefact, not a kind |
| pereiraresponde | `support/collection` · `support/shelter` · `support/hospital` · `support/pharmacy` · `support/veterinary` · `support/store` · `support/supplies` | `collection_center` · `shelter` · `hospital` · `health_point` · `pet_point` · `open_business` · `distribution_point` | **The cleanest 1:1 crosswalk in the ecosystem** — 7 of 7 map without loss |
| corag | `acopio` · `refugio` · `agua` · `alimentos` · `salud` · `medicamentos` · `mascotas` · … (15) | `collection_center` · `shelter` · `water_point` · `food_point` · `health_point` · `health_point` · `pet_point` | ⚠ corag's enum is a *need* vocabulary reused for places; `collectionCenter{}` is the real place object |
| gogo | `cocina` · `punto_comida` · `hidratacion_provee` · `hidratacion_necesita` · `medicina_humana_provee` · `negocios` | `food_point` · `food_point`+need · `water_point` · `water_point`+need · `health_point` · `open_business` | The `_provee`/`_necesita` polarity is **cleaner than the canonical model** and MUST survive as `origin_category` — see Q6 |
| terremotocolombia | `Acopio` · `Necesidades` · `Tengo` · `Edificios` · `Sin luz` · `Starlink` · `Buscan` | `collection_center` · *(v0.2 `need`)* · *(v0.2 `offer`)* · *(v0.2 `damage_report`)* · *(watch-list)* · `other`+ext · **EXCLUDED** | |
| reporteco | `shelter` · `water` · `damage` · `missing` · … (11) | `shelter` · `water_point` · *(v0.2)* · **EXCLUDED as a join hazard** | `categorias[]` multi-value maps to `place_kind_secondary` |
| gravitas | "Centro de acopio" (incl. albergue + puesto de mando) | `collection_center` + `place_kind_secondary: [shelter, info_point]` | ⚠ three kinds in one value; unresolvable without the publisher |
| mapadelterremoto | `/albergues` · `/hospitales` · `/colegios` · `/servicios` | `shelter` · `hospital` · `shelter`? · `other` | ⚠ `/colegios` (35) is ambiguous: a school may be a shelter or a damage record. Ask, do not guess |

**AquíAyuda's hand-rolled crosswalks, extracted verbatim from its shipped bundle** — the ecosystem's
only production evidence of what happens without a shared vocabulary
(`APP_aquiayuda.md` §Vocabulary translation already implemented):

*Pereira Responde → AquíAyuda (read path):*

| Source | Their target | Loss |
|---|---|---|
| `type: housing` → `vivienda`; `road` → `via`; `support` → `apoyo` | display labels | none |
| `risk: high` → `alta`; `medium` → `media`; `road`/`support` → `sin-clasificar` | display labels | ⚠ two distinct semantics collapse into one bucket |
| `category: shelter` → `"Refugio temporal"`; `collection` → `"Zona de acopio"` | display labels | none |

*AquíAyuda → Pereira Unida (write path):*

| Source | Their target | Loss |
|---|---|---|
| `alimentos` \| **`agua`** → `alimentos` | one value | ⚠ **water is destroyed into food** |
| `salud` \| `medicamentos` → `medicinas` | one value | ⚠ care and supplies conflated |
| `rescate` → `herramientas_rescate` | one value | narrowing |
| `transporte` → `transporte_logistica` | one value | none |
| `acopio` \| `voluntariado` → `voluntariado` | one value | ⚠ **a place becomes a person-availability class** |
| **`refugio`** \| `otro` → `otros` | one value | ⚠ **shelter is destroyed into "other"** |
| `mascotas` → `mascotas`; `herramientas` → `herramientas` | one value | none |

Four lossy joins in one production write path, two of which destroy the most decision-critical
categories in a disaster (water and shelter). This table is the single best argument for a shared
vocabulary that exists anywhere in the ecosystem, and it was written by an ecosystem team, not by us.

### 4.3 Territorial coding — DIVIPOLA

**Adopt DIVIPOLA** (DANE's official Colombian territorial coding), because the national aggregator
already normalises 257 sources to it, alongside EDAN for damage: *"Todo se lleva a una misma llave
territorial y a un mismo vocabulario de daño. DIVIPOLA · EDAN"* (`APP_mapadelterremoto.md` §Entity
inventory). Any protocol that introduces a competing place key makes that app worse, not better.

Illustrative codes used in the worked examples below. **`unverified` in this task** — these were not
checked against the DANE source, and MUST be validated against the official DIVIPOLA table before use:

| Municipality | Dept. | Code (illustrative) |
|---|---|---|
| Pereira | Risaralda | `66001` |
| Dosquebradas | Risaralda | `66170` |
| Santa Rosa de Cabal | Risaralda | `66682` |
| La Virginia | Risaralda | `66400` |
| Manizales | Caldas | `17001` |
| Cartago | Valle del Cauca | `76147` |

Publishers keep their raw string in `municipality_text`. Observed dirt the code field is meant to
absorb: rows filed under Pereira whose address is in Dosquebradas or in Dagua (Valle del Cauca);
`"Pereira cuba"` as a municipality value; bare numeric values `"12"` and `"2"`.

### 4.4 Damage vocabulary (v0.2 reference)

**EDAN** is the reference for the future `damage_report` entity, on the same "already adopted by the
national aggregator" argument. Two richer local scales exist and MUST be preserved as
`origin_category` when mapping: pereiraresponde's five-level structural UI scale (grietas en muros,
columnas o vigas · desprendimiento de fachada o techo · inclinación, hundimiento o colapso parcial ·
colapso total · daño menor visible), currently collapsed into free-text `title`
(`APP_pereiraresponde.md` §Damage vocabulary), and reporteco's 11-category taxonomy.

---

## 5. Cross-cutting design decisions

### 5.1 Discrepancies are preserved, not resolved

Taken verbatim as a design principle from the ecosystem's most mature aggregator, whose published
method reads: *"Cada hecho se cruza contra las demás fuentes. **Las discrepancias se conservan, no se
resuelven.**"* (`APP_mapadelterremoto.md` §Entity inventory). When two apps disagree about a place, a
federating layer that silently picks a winner destroys the most decision-relevant information there
is. Conforming consumers **SHOULD** render coexisting assertions with their sources and timestamps.

### 5.2 Freshness semantics do not interconvert (CR-1)

**Conformance rule CR-1: a publisher MUST NOT populate `last_confirmed_at` from a creation
timestamp.** The two are different claims, and five apps prove the confusion is live:

| App | Field | What it actually means |
|---|---|---|
| pereiraayuda | `ultima_validacion` | A human re-verified the place. The intended semantic. |
| pereiraunida | `last_confirmed_at` | Same — a re-confirmation timestamp distinct from `created_at`. |
| alluda | `centros.created_at` | When the row was inserted. **`centros` has no `updated_at` and no confirmation field at all** — a feed built from it would publish freshness it cannot substantiate. |
| unidosporpereira | `frescura` (`fresco`/`viejo`) + `hace` ("hace 2 días") | A derived tier and a rendered locale string; not machine-comparable, and the HTML uses four tiers (`vigente`/`tibio`/`viejo`/`simple`) while the feed uses two. |
| mapadelterremoto | sitemap `lastmod` = `Dataset.dateModified` | Page-level change, not record-level confirmation. Excellent for polling, insufficient for a record. |
| terremotocolombia | sitemap `lastmod` = request time | **Anti-pattern:** a `lastmod` that is always "now" carries no information and is worse than none. |

**Rule CR-1a:** `null` is the correct value when nothing better exists. A publisher migrating from
`created_at` **SHOULD** emit `last_confirmed_at: null` and `published_at: <created_at>` rather than
manufacturing trust.

### 5.3 Status: three axes, one of which never federates

- **Lifecycle** — does the place exist as an aid point.
- **Fulfilment** — can it serve you right now (`service_status`, and for needs, coverage).
- **Moderation** — the publisher's internal trust verdict.

pereiraunida's single `status` field carries all three at once across 11 values: `activa`/`cerrada`/
`resuelto`/`reabierta` (lifecycle), `buscando`/`disponible`/`ocupada`/`en_camino` (fulfilment),
`ocultada`/`duplicado`/`informacion_falsa` (moderation). Flattening that into one protocol enum loses
information; worse, a consumer that sees `ocultada` cannot tell whether the need was met or the record
was suppressed (`APP_pereiraunida.md` §Shared status vocabulary, §Risks 3–4).

**Normative:** moderation verdicts **MUST NOT** federate. A record a publisher has suppressed,
marked duplicate or judged false is **omitted from the feed**; it is never published with a
moderation label. Publishing another operator's "this is false" verdict downstream, without the
evidence or the appeal path, is a defamation-shaped risk and an unfixable trust leak.

**Conformance rule CR-2: `name` MUST NOT encode operational state.** Observed in production:
`"Centro de acopio IE María Auxiliadora  (cerrado ahora)"` — the schema has `activo` and `abierto`
booleans and operators write the state into the title anyway (`APP_alluda.md` §Collection centres).
A validator can catch this with a small pattern list; it is the single highest-value automated check
in the whole model.

**Two apps have opposite moderation policies** and both must remain conforming: reporteco reviews
every report before publication; gravitas publishes immediately and "nunca se oculta". The protocol
cannot and should not mandate either — but a consumer needs to know which kind of record it is
holding, which is what `confirmation_method` and `source_authority` are for.

### 5.4 Geometry

Named scalars `lat`/`lon` in WGS 84 decimal degrees, per `PRIOR_ART.md` verdict A: `[lon, lat]`
ordering is the highest-frequency silent bug in civic geo data, and named scalars make it
unrepresentable. A GeoJSON `FeatureCollection` export is OPTIONAL and normatively derived.

Geometry confidence is modelled explicitly because **four apps already model it in four ways**:
unidosporpereira `aprox` (true on 83 % of points), pereiraayuda `ubicacion.precision`, reporteco
"exact locations are never published; points are shown approximately" as policy, pereiraunida's
"Ubicación exacta" per-record label (194 occurrences). One field, `geo_precision`, absorbs all four.

**Coordinates are not a merge key.** See §6.3: two records for one campus, same street address,
**1.1 km apart**; and one shelter whose coordinates differ by 1.7 km between two apps, another by
~2 km. Radius matching would merge distinct places and split identical ones.

### 5.5 Neighbourhoods stay uncontrolled in v0.1

pereiravive's live `barrio` filter contains five spellings of *El Poblado*, four of *Centro*, `Cuba`
inside four different strings, plus `N/A`, `No especifica`, street addresses and building names
(`APP_pereiravive.md` §Entity inventory). Any cross-app join on neighbourhood is arithmetic on noise.
v0.1 therefore carries `neighborhood_text` as an uncontrolled passthrough and does **not** pretend to
normalise it. A municipality-scoped controlled list is a v0.2 registry deliverable.

### 5.6 Contact data does not travel

Three independent evidence lines converge:

1. One app server-renders names and phone numbers for ~480 records into a publicly cacheable HTML
   document with `Allow: /` and no `noindex` (`APP_pereiraunida.md` §Risks 1).
2. One app Cloudflare-obfuscates emails in its HTML and then serves `tel`, `tel_fmt` and `contacto`
   unauthenticated in the JSON behind the same page — the protective measure on the page is defeated
   by the feed behind it (`APP_unidosporpereira.md` §Risks).
3. One app leaks publisher personal names through a free-text provenance field in an otherwise
   careful open API (`APP_pereiraayuda.md` §Risks).

**Normative for `place`:** feeds carry `public_url` and `contact_available`; consumers link out;
contact is fetched on demand from the origin, under the origin's own consent model. Record
identifiers and slugs **MUST** be opaque with respect to personal data — one app's URLs are
`/{set}/{numeric-id}-{personal-given-name}/`, which is both a privacy problem and a durable
interoperability defect, since names are unstable, non-unique and locale-dependent
(`APP_helpthemdirectly.md` §Risks 1).

**The good patterns already exist and should be named in the spec:** corag's required `publishContact`
boolean; pereiraayuda's `contacto_publicable` consent flag captured **at write time**;
encuentratumascota's brokered contact, where the finder submits their own number and the system relays
it — no contact is ever rendered publicly.

### 5.7 Approximate is not the same as absent, and absence is a fact

Two modelling ideas the ecosystem already validated and the protocol should keep:

- **Model absence explicitly.** mapadelterremoto publishes narrative status blocks that say, in
  effect, "no new national count has been published for five days". Silence and zero are not the same
  value (`APP_mapadelterremoto.md` §Entity: Estado operativo).
- **Late-arriving records break naive sync.** gravitas ships an `OfflineQueueIndicator`, implying
  reports composed offline and synced hours later, so `created_at` and server arrival can differ by a
  lot. Any incremental-sync design keyed on `updated_at > cursor` would silently drop them
  (`APP_gravitas.md` §Risks 9).

---

## 6. Cross-app field mapping — all 20 apps × canonical `place` fields

Reading the tables: a cell names the app's observable field or value; `—` means the app has no
equivalent, which is data, not an omission; `n/a` means the app publishes no place entity at all;
`✗ excluded` means the field exists and MUST NOT be mapped. Evidence column cites the dossier and
section. All observations are from probes 2026-08-16T04:00–04:12Z.

### 6.1 M1 — Identity and classification

| # | App | `id` | `name` | `place_kind` source | `origin_category` vocabulary | Evidence |
|---|---|---|---|---|---|---|
| 1 | corag | `PublicHelp.id`; `destination_help_point_id` for places | `title` | `category ∈ {acopio, refugio, agua, alimentos, salud…}`; `collectionCenter{}` object | 15-value slug enum | `APP_corag.md` §Entity inventory |
| 2 | pereiraunida | `reports.id` | `title` (a need, not a place) | — (📦 Acopio is a filter chip, not a record class) | 9 observed values | `APP_pereiraunida.md` §Entity inventory |
| 3 | sostremoto | — (CSR; not observable) | — | — | 15 **display-cased Spanish labels, no slugs** | `APP_sostremoto.md` §Entity inventory |
| 4 | helpthemdirectly | numeric id in path | `card-title` ⚠ contains personal names | n/a (campaign entity) | 5 labels, EN with one ES value | `APP_helpthemdirectly.md` §Entity inventory |
| 5 | pereiraresponde | `id` (numeric string) | `title` (1–200 chars) | `type: support` + `category ∈ {hospital, shelter, collection, store, pharmacy, veterinary, supplies}` | 3 types + 7 support categories | `APP_pereiraresponde.md` §Entity: Report |
| 6 | sismovision | `reports/{id}` | — | n/a (damage only) | — (severity taxonomy `unverified`) | `APP_sismovision.md` §Entity inventory |
| 7 | mapadelterremoto | — (page-level, no record ids exposed) | page title per municipality/thematic slice | route slices `/albergues`, `/hospitales`, `/servicios`, `/colegios` | EDAN (damage) | `APP_mapadelterremoto.md` §Entity inventory |
| 8 | reporteco | `folio` (⚠ all `seed_` prefixed at probe) | — (`resumen` only) | `categoria` + `categorias[]` (multi) | 11 machine keys **+ separate `*_label`** | `APP_reporteco.md` §Entity: Report |
| 9 | terremotocolombia | — (not exposed) | rendered names | 7 map types | 7 display types | `APP_terremotocolombia.md` §Map entity types |
| 10 | gravitas | — (not observable) | — | 4 categories | 4 display labels, **unaccented** | `APP_gravitas.md` §Entity inventory |
| 11 | aquiayuda | **exposes alluda's PK** at `/centro/:id` | inherited | inherited | inherited + 3 hard-coded crosswalk tables | `APP_aquiayuda.md` §Entity inventory |
| 12 | alluda | `centros.id` | `centros.nombre` ⚠ carries state | table identity (`centros`) | `necesidades.categoria` | `APP_alluda.md` §Entity inventory |
| 13 | unidosporpereira | `id` (opaque 10-hex, no namespace) | `titulo` | `sec ∈ {albergues, acopio, riesgos, salud, locales}` | `capa` display twin | `APP_unidosporpereira.md` §/mapa-datos.php |
| 14 | pereiraayuda | `id` **and** `slug` (two systems) | `nombre` | `categoria` (closed 10) | `categoria` + `etiquetas[]` (closed 19) | `APP_pereiraayuda.md` §Per-point schema |
| 15 | ayudared | `DA-*`, `AC-*` (typed, prefixed — but **not** for places) | rendered name ⚠ `CAFE ` prefix | "Acopio" / "Albergue" kind line | 2 place kinds + rescue/damage | `APP_ayudared.md` §Entity inventory |
| 16 | gogo | Firestore doc ids | `Nombre del negocio` / form fields | `TIPOS_AYUDA` with **supply/demand polarity**; `NEGOCIO_TIPOS` (9) | `_provee`/`_necesita` pairs | `APP_gogo.md` §Entity inventory |
| 17 | pereiravive | sequential integer (`/arriendo/{n}`) | — | n/a (rental notice) | `tipo` (closed 5) | `APP_pereiravive.md` §Entity inventory |
| 18 | encuentratumascota | **UUIDv4** | pet name | n/a (pet notice) | `Tipo ∈ {dog, cat, other}` | `APP_encuentratumascota.md` §Entity inventory |
| 19 | encontrados | sequential `/person/{n}` ✗ excluded | ✗ excluded | n/a | n/a | `APP_encontrados.md` §Entity inventory |
| 20 | sospereira | — (not probed by design) | ✗ excluded (people) | n/a — portal has **no** shelter or collection surface | n/a | `APP_sospereira.md` §Entity inventory, §Overlap map |

### 6.2 M2 — Location

| # | App | `municipality_code` | `address_text` | `neighborhood_text` | `lat`/`lon` | `geo_precision` | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | corag | — (emergency slug `eje-cafetero`) | `location{}` (contents `unverified`) | — | yes (`latitude`/`longitude` + `radiusKm` search) | — | `APP_corag.md` §Entity inventory, §Integration surface |
| 2 | pereiraunida | `municipality` + `department` (**strings**, present on every record) | `location_name` (free text) | — | `lat`, `lng` | **"Ubicación exacta" label ×194** | `APP_pereiraunida.md` §Entity inventory, §Privacy pattern |
| 3 | sostremoto | filter: Pereira · Dosquebradas · Otra | — | — | — | — | `APP_sostremoto.md` §Entity inventory |
| 4 | helpthemdirectly | campaign set `sismos-co-2026` / `sismos-ve-2026` | — | — | — | — | `APP_helpthemdirectly.md` §Entity inventory |
| 5 | pereiraresponde | — (Pereira-scoped by design) | — | `area` (neighbourhood label) | `coords[2]` **`[lat, lon]`** ⚠ non-RFC-7946 order | — | `APP_pereiraresponde.md` §Entity: Report |
| 6 | sismovision | `municipality` (client-held) | — | — | inferred lat/lon (MapLibre + Nominatim) | — | `APP_sismovision.md` §Entity inventory |
| 7 | mapadelterremoto | **DIVIPOLA** ✓ (432 municipality pages) | — (page-level) | — | held (map exists) but not observed in HTML | — | `APP_mapadelterremoto.md` §Entity: Municipio |
| 8 | reporteco | `departamento` + `municipio` (**names, not codes**) | — (deliberately absent) | `barrio` | GeoJSON `Point` | **approximate by policy** | `APP_reporteco.md` §Entity: Report, §Privacy architecture |
| 9 | terremotocolombia | department + municipality + neighbourhood (rendered) | — | rendered | map layer (client-side) | — | `APP_terremotocolombia.md` §Entity: Persona *(field list; place layers were empty)* |
| 10 | gravitas | city breakdown in UI; coding unknown | — | — | — (not observable) | — | `APP_gravitas.md` §Entity: aggregate views |
| 11 | aquiayuda | inherited (`ciudades`) | inherited (`direccion`) | — | inherited (`lat`, `lng`) | — | `APP_aquiayuda.md` §Entity inventory |
| 12 | alluda | `ciudad_id` → `ciudades{nombre, departamento, slug}` ⚠ **mis-assignment observed** | `direccion` | — | `lat`, `lng` | — | `APP_alluda.md` §Collection centres |
| 13 | unidosporpereira | — (Pereira + Dosquebradas, not coded) | `direccion` | `zona` | `lat`, `lng` | **`aprox` (true on 30/36)** | `APP_unidosporpereira.md` §/mapa-datos.php |
| 14 | pereiraayuda | `ubicacion.municipio` (string; 5 values incl. `Otro`) | `ubicacion.direccion` | `ubicacion.barrio` | `ubicacion.lat`, `.lng` — **only 78/214 (36 %)** | **`ubicacion.precision`** | `APP_pereiraayuda.md` §Per-point schema, §Counts |
| 15 | ayudared | municipality + department strings ⚠ two bare-number values | address/reference line | — | — | — | `APP_ayudared.md` §Entity inventory, §Coverage |
| 16 | gogo | `CIUDADES_PRIORIDAD` (6) + `CIUDADES_RESTO` (29) | `Dirección / referencia del lugar` | — | Google Maps geometry (Firestore) | — | `APP_gogo.md` §Entity inventory |
| 17 | pereiravive | `municipio` (4 values ⚠ **+ `Pereira cuba`**) | on listing page | `barrio` **free text, 5 spellings of one barrio** | — | — | `APP_pereiravive.md` §Entity inventory |
| 18 | encuentratumascota | inside `Zona` free text | — | `Zona` (barrio + municipality) | **none, no map** | — | `APP_encuentratumascota.md` §Entity inventory |
| 19 | encontrados | ✗ excluded | ✗ excluded | ✗ excluded | ✗ excluded | — | `APP_encontrados.md` §Why LINK-OUT ONLY |
| 20 | sospereira | Pereira (portal scope) | ✗ (structures domain: address MUST be coarsened) | — | — | — | `APP_sospereira.md` §Structures domain |

### 6.3 M3 — Status, verification and freshness

| # | App | `lifecycle_status` | `service_status` | `last_confirmed_at` | negative confirmation | `confirmed_by` | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | corag | `status` | `operationalStatus` | — (`timeline[]` events; `generatedAt` at feed level) | — | `verification{}` object (contents `unverified`) | `APP_corag.md` §Entity inventory |
| 2 | pereiraunida | `activa`/`cerrada`/`resuelto`/`reabierta` | `buscando`/`disponible`/`ocupada`/`en_camino` | **`last_confirmed_at`** ✓ | — (community "info falsa" flag ✗ moderation) | — | `APP_pereiraunida.md` §Shared status vocabulary |
| 3 | sostremoto | "Solicitudes activas" (open/taken) | — | — (**"En vivo" label only**) | — | — | `APP_sostremoto.md` §Entity inventory |
| 4 | helpthemdirectly | `Meta Alcanzada` ⚠ status inside the category enum | — | **none — no date anywhere** | — | — | `APP_helpthemdirectly.md` §Freshness signals |
| 5 | pereiraresponde | visible/hidden (moderation, undocumented) | — | — (**`createdAt` only; no `updatedAt`**) | — | `score`/`votes` (social) | `APP_pereiraresponde.md` §Entity: Report, §Risks 4 |
| 6 | sismovision | — | — | `createdAt` (client-held) | — | **`Review` by verified professional** (watch-list) | `APP_sismovision.md` §Entity: Review |
| 7 | mapadelterremoto | narrative `Estado operativo` (`Crítico`/`Parcial`) | — | `dateModified` + **sitemap `lastmod`, 551/551 URLs** | — | per-fact source + cut-off time ✓ | `APP_mapadelterremoto.md` §Freshness signals |
| 8 | reporteco | — | — | `fecha` (creation) — **no feed-level `generatedAt`** | — | **`Oficial` flag** on authority-published points ✓ | `APP_reporteco.md` §Entity: Punto verificado |
| 9 | terremotocolombia | — | — | — (sitemap `lastmod` = request time ⚠ **anti-pattern**) | — | — | `APP_terremotocolombia.md` §Freshness signals |
| 10 | gravitas | "nunca se oculta" (no suppression) | — | **none; shells 2.3–3.4 days stale** | — | verifier/admin role exists | `APP_gravitas.md` §Freshness signals |
| 11 | aquiayuda | inherited | inherited | inherited; client `staleTime` 60–600 s only | — | — | `APP_aquiayuda.md` §Observable architecture |
| 12 | alluda | `activo` (bool) | `abierto` (bool) | **`centros`: `created_at` only — none** (`inventario.updated_at` exists) | — | — | `APP_alluda.md` §Entity inventory |
| 13 | unidosporpereira | `estado ∈ {Activo, Activa}` | `estado ∈ {Abierto, Lleno}` ⚠ **type-dependent enum** | `frescura` (`fresco`/`viejo`) + `hace` string — **31/36 `viejo`** | — | `verificado` (bool, **no verifier, no timestamp**) | `APP_unidosporpereira.md` §/mapa-datos.php, §Risks |
| 14 | pereiraayuda | `estado ∈ {verificado, reportado}` | `atiende`, `atiende_desde` | **`ultima_validacion`** ✓ (**`null` observed and correct**) | **`contradicciones_activas`** ✓ + MCP `confirmar_punto(slug, no_estaba)` | `confirmaciones_24h` (count, no identity) | `APP_pereiraayuda.md` §Per-point schema, §MCP server |
| 15 | ayudared | rendered status line (rescue) | — | **none — no recency signal on 226 records** | — | — | `APP_ayudared.md` §Entity inventory |
| 16 | gogo | — | quantities: needed / covered / capacity | `timestamp` in client code; no user-visible label | — | — | `APP_gogo.md` §Entity inventory |
| 17 | pereiravive | listing live / withdrawn | — | **per-record sitemap `lastmod`** ✓ + 7-day TTL | ✓ **"ya no está" reader report suppresses the listing** | `origen ∈ {avistamiento, propietario}` ✓ **provenance tier** | `APP_pereiravive.md` §Entity inventory |
| 18 | encuentratumascota | **status encoded in the route**, not the record | — | relative string on detail page; **nothing on the index** | — | — | `APP_encuentratumascota.md` §Entity inventory |
| 19 | encontrados | ✗ excluded | ✗ excluded | ✗ excluded | ✗ excluded | ✗ excluded | `APP_encontrados.md` §Entity inventory |
| 20 | sospereira | — (not probed by design) | — | — (not probed by design) | — | — | `APP_sospereira.md` §Entity inventory |

### 6.4 M4 — Links, contact, provenance, extended

| # | App | `public_url` | contact in the public surface | `source{}` | capacity / needs | licence | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | corag | **`publicUrl`** ✓ | `contact{}` in the read model ⚠ + `publishContact` consent bool ✓ | `source` + `externalId` (write path) ✓ | `quantities{}`, `resources[]`, `capacity` filter | **none observed** | `APP_corag.md` §Entity inventory, §Risks 7, 9 |
| 2 | pereiraunida | — | **`contact_phone`, `full_name`, `phone` server-rendered** ⚠⚠ | — | `photo_urls`, `comments_count` | none | `APP_pereiraunida.md` §Risks 1 |
| 3 | sostremoto | — | — (CSR) | — | — | none | `APP_sostremoto.md` §Integration surface |
| 4 | helpthemdirectly | detail link per campaign | donation channels on campaign pages ⚠ | — | — | **`ai-train=no`, `use=reference`, EU DSM Art. 4 reservation** | `APP_helpthemdirectly.md` §Crawl policy |
| 5 | pereiraresponde | `/api/public/v1/reports/{id}` | **none — spec states no identity, IP or vote is exposed** ✓ | — | `photos[1..3]` (same-origin, unversioned) | **none stated** | `APP_pereiraresponde.md` §Entity: Report, §Risks 7 |
| 6 | sismovision | `/reportes/{id}` (+ `?t=token` owner link) | — | — | `/images/` sub-resource | none | `APP_sismovision.md` §Observable architecture |
| 7 | mapadelterremoto | `/municipio/{slug}` etc. | — | **per-fact source + cut-off time** ✓ (best in ecosystem) | 439 shelter/collection counts per municipality | **CC BY 4.0** ✓ (only explicit licence in 20) | `APP_mapadelterremoto.md` §Structured data |
| 8 | reporteco | — (no stable record URI) | **phone stored only as an irreversible hash** ✓ | circle/square map glyphs = citizen vs cited source ✓ | — | **stated open-source; data licence pending** | `APP_reporteco.md` §Privacy architecture, §Risks 4 |
| 9 | terremotocolombia | route pages | `/telefonos` = **institutional** lines ✓ | official-source directory | — | MIT (code); **data licence unstated** | `APP_terremotocolombia.md` §Integration surface |
| 10 | gravitas | — | — | — | — | none found | `APP_gravitas.md` §Integration surface |
| 11 | aquiayuda | `/centro/:id` (another app's PK) | reads `telefono` only with a session ✓ | **`quienPublica` + `url` per adapter** ✓ | inherited | none found | `APP_aquiayuda.md` §The source registry |
| 12 | alluda | — (2 URLs in the whole sitemap for 184 centres) | `telefono` session-gated ✓; **`responsable` (a person's name) is not** ⚠ | — | `necesidades`, `inventario` (`updated_at`) | none (ethos suggests reuse welcome; nothing states it) | `APP_alluda.md` §Risks |
| 13 | unidosporpereira | `#ancla` fragments only | **`tel`, `tel_fmt`, `contacto` served unauthenticated in JSON** ⚠⚠ | — | **`N personas de M cupos (P%)`** ✓ unique · `nec[]` with priority | none (inert robots.txt boilerplate) | `APP_unidosporpereira.md` §Risks |
| 14 | pereiraayuda | **`url`** ✓ | `contacto{telefono, nombre, whatsapp, en_ficha}` ⚠ — **but natural persons' mobiles are stripped from the API** ✓ | **`fuente` free text** ⚠ leaks personal names → the case for structured `source{}` | `etiquetas[]` (19), `horario`, `advertencia` | **open data with attribution** ✓ (code MIT) | `APP_pereiraayuda.md` §Public API, §Risks |
| 15 | ayudared | — | — | — | — | none found | `APP_ayudared.md` §Integration surface |
| 16 | gogo | — (gated) | `Contacto (teléfono, optional)` ⚠ behind a name-only gate | — | needed / covered / capacity / affected ✓ | none found | `APP_gogo.md` §Entity inventory |
| 17 | pereiravive | **`/arriendo/{n}`** ✓ stable | owner WhatsApp on the listing page ⚠ (the payload) | **`origen`** ✓ | rooms, price | none found | `APP_pereiravive.md` §Entity inventory |
| 18 | encuentratumascota | `/anuncio/{uuid}` ✓ | **brokered — no contact rendered at all** ✓✓ best in ecosystem | — | photos | **none — no terms, no privacy policy, no operator** | `APP_encuentratumascota.md` §Entity inventory, §Risks 1 |
| 19 | encontrados | link-out target only | ✗ excluded | ✗ excluded | ✗ excluded | MIT (code) — **not a data licence** | `APP_encontrados.md` §Risks 5 |
| 20 | sospereira | link-out target only | ✗ excluded | `source_authority: government` ✓ | — | unknown; open-data channel is the key question | `APP_sospereira.md` §Integration surface |

### 6.5 Conflicts — same concept, incompatible semantics

| Concept | Incompatible encodings observed | Protocol resolution |
|---|---|---|
| **Freshness** | `created_at` (alluda) · `ultima_validacion` (pereiraayuda) · `last_confirmed_at` (pereiraunida) · `frescura` 2-tier feed / 4-tier HTML (unidosporpereira) · page `lastmod` (mapadelterremoto) · `lastmod` = now (terremotocolombia) · nothing (ayudared, gravitas, helpthemdirectly) | Rule CR-1: creation ≠ confirmation. `last_confirmed_at` nullable and mandatory-as-a-key. |
| **"Verified"** | `verificado` bool with no verifier and no timestamp (unidosporpereira) · `estado: verificado` with `ultima_validacion` but no verifier (pereiraayuda) · `Oficial` = published by an authority (reporteco) · professional `Review` (sismovision) | Split into `confirmation_method` (how) + `confirmed_by` (role token) + `source_authority` (who published). "Verified" alone is not a protocol value. |
| **Status** | Two booleans (alluda `activo`+`abierto`) · type-dependent enum (unidosporpereira `Abierto`/`Lleno` vs `Activo`/`Activa`) · 11-value flat enum across 3 axes (pereiraunida) · status inside the category enum (helpthemdirectly `Meta Alcanzada`) · status inside the route (encuentratumascota) · **status inside the name** (alluda "(cerrado ahora)") | Three axes (§5.3); rules CR-2 (`name` is not state) and moderation-never-federates. |
| **Geometry confidence** | `aprox` bool (unidosporpereira) · `precision` (pereiraayuda) · policy-level approximation (reporteco) · "Ubicación exacta" label (pereiraunida) · none (most) | One `geo_precision` enum. |
| **Coordinate order** | `[lat, lon]` (pereiraresponde `coords`) vs RFC 7946 `[lon, lat]` (reporteco GeoJSON) | Named scalars `lat`/`lon`; the ordering bug becomes unrepresentable. |
| **Municipality** | DIVIPOLA (mapadelterremoto) · names (reporteco, pereiraayuda, ayudared) · FK to a `ciudades` table with a `fusionada_en` merge pointer (alluda) · dirty values `"Pereira cuba"`, `"12"`, `"2"`, cross-department misfiling | `municipality_code` (DIVIPOLA) REQUIRED + `municipality_text` passthrough. |
| **Identifiers** | Sequential ints (pereiravive, encontrados) · UUIDv4 (encuentratumascota) · opaque 10-hex (unidosporpereira) · typed prefixes `DA-`/`AC-` (ayudared) · `id` **and** `slug` in one product (pereiraayuda) · a foreign app's PK re-exposed (aquiayuda) · name-bearing slugs (helpthemdirectly) | §7. |
| **Contact** | Rendered publicly (pereiraunida HTML, unidosporpereira JSON) · consent flag (corag `publishContact`, pereiraayuda `contacto_publicable`) · session-gated (alluda `telefono`) · brokered, never rendered (encuentratumascota) · hashed (reporteco) | §5.6: never in the feed. |
| **Category** | 6 mutually non-subsuming enums; a production write path that destroys `agua`→`alimentos` and `refugio`→`otros` | §4.1 core vocabulary + `origin_category` + registry crosswalks. |

---

## 7. Duplicate-place demonstrations, worked end to end

The claim these examples test: **a stable municipality-scoped place identity plus `last_confirmed_at`
turns an unresolvable contradiction into a decision a person can act on.** No personal data appears;
all values are place-level and carry their probe timestamps.

### 7.1 Case A — "Coliseo Mayor": one building, three apps, three names, zero shared ids

**The records, as published (2026-08-16T04:04–04:10Z):**

| Publisher | `name` as published | Kind | Municipality | `lat` | Status | Freshness |
|---|---|---|---|---|---|---|
| pereiraayuda | `Coliseo Mayor` | albergue | Pereira | 4.815091 | `estado: verificado` | `ultima_validacion: 2026-08-15T19:53:49Z` |
| unidosporpereira | `coliseo Mayor` | `sec: albergues` | (Pereira, uncoded) | present | `estado: Lleno` | `frescura: viejo` (≈1–2 days) |
| ayudared | `Coliseo Mayor de Pereira` | Albergue | Pereira | — | — | **none** |

*Sources: `APP_pereiraayuda.md` §Entity inventory (shelter roster); `APP_unidosporpereira.md` §Shelters, in detail; `APP_ayudared.md` §Entity inventory (Risaralda records).*

**The trap:** ayudared's national set also holds **"Coliseo Mayor de Manizales"** — a different
building 50 km away, in a different department (`APP_ayudared.md` §Entity inventory, naming behaviour 2).

**Step 1 — naive matching fails.** Exact name: 3 distinct strings, 0 matches. Casefold + accent-fold:
`coliseo mayor` ≡ `coliseo mayor`, but `coliseo mayor de pereira` still differs, and a substring rule
that would catch it **also matches the Manizales building**. Coordinate radius: only one of the three
records has usable coordinates. **All three naive strategies fail.**

**Step 2 — municipality scoping removes the collision.** Both Pereira records resolve to DIVIPOLA
`66001`; the Manizales record resolves to `17001`. The candidate set drops from four records to three
before any name comparison happens. *(Codes illustrative — see §4.3.)*

**Step 3 — a shared place identity is asserted, not computed.** Each publisher keeps its own record
and adds cross-reference claims:

```
pereira-ayuda:{their-id}      same_as: ["unidos-por-pereira:{their-id}", "ayuda-red:{their-id}"]
unidos-por-pereira:{their-id} same_as: ["pereira-ayuda:{their-id}"]
ayuda-red:{their-id}          same_as: []          # publishes no claim; consumers may still infer
```

`same_as` is a **claim**, never an authority (§2.7). A consumer that trusts pereiraayuda's claim gets
a three-record cluster; a consumer that does not still sees three records and can decide for itself.

**Step 4 — `last_confirmed_at` resolves the operational question.** After clustering, the merged view
is not "pick one":

| Assertion | Source | Confirmed | Rendered to a user |
|---|---|---|---|
| Shelter is operating, verified | pereira-ayuda | 2026-08-15T19:53:49Z (≈8 h before probe) | "Verificado hace 8 horas" |
| Shelter is **full** | unidos-por-pereira | `frescura: viejo` (≈1–2 days) | "Reportado lleno hace ~2 días" |
| Shelter exists | ayuda-red | `last_confirmed_at: null` | "Sin confirmación de recencia" |

A family looking for a bed sees: *this shelter is confirmed operating as of 8 hours ago and was
reported full about two days ago.* That is the honest answer, and no single app can produce it today.
Discrepancies preserved, not resolved (§5.1).

**What the protocol had to supply to make this work:** `municipality_code` (else the Manizales merge),
`place_kind` (else "albergue" vs "Albergue" vs "shelter" is a string comparison), `same_as`,
`lifecycle_status` + `service_status` as separate axes (else `verificado` and `Lleno` look like
competing values of one field), and `last_confirmed_at` **including the legal `null`** — because
ayudared's silence must be visible as silence, not inferred as freshness.

### 7.2 Case B — "Colegio María Auxiliadora": same address, opposite status

**The records (2026-08-16T04:09–04:10Z):**

| Publisher | `name` as published | Address | Status as modelled | Freshness |
|---|---|---|---|---|
| unidosporpereira | `Colegio Maria Auxiliadora` | Cl. 43 #13-74, Dosquebradas | `estado: Activo` | `frescura` tier only |
| alluda | `Centro de acopio IE María Auxiliadora  (cerrado ahora)` | Cl. 43 #13-74, Dosquebradas | `activo` / `abierto` booleans **in the schema**; the closure is written **in the name** | `centros.created_at` only — **no confirmation field exists** |

*Sources: `APP_unidosporpereira.md` §Overlap map; `APP_alluda.md` §Collection centres (data-quality patterns); `APPS_MATRIX.md` §2.1 "killer case 1".*

**Step 1 — name matching fails, three times over.** Accent drop (`Maria` / `María`), an institutional
prefix (`IE`), a kind prefix (`Centro de acopio`), and a **status suffix inside the name**
(`(cerrado ahora)`). No normalisation rule short of parsing Spanish parentheticals joins these two
strings — and a rule that strips parentheticals would silently delete the most important fact in the
record.

**Step 2 — address matching succeeds.** Normalising `Cl. 43 #13-74` → `calle 43 13 74`, scoped to
DIVIPOLA `66170` (Dosquebradas), both records land on one key. This is the general result:
**address matching succeeded on 100 % of the observed duplicate cases where name matching failed**
(`APPS_MATRIX.md` §2.1). It is why the locator rule (§2.2) exists and why `address_text` is
conditionally required rather than optional.

**Step 3 — the conformance rule does the real work.** CR-2 (`name` MUST NOT encode operational
state) forces the publisher to move `(cerrado ahora)` into `lifecycle_status: closed`. This is not
cosmetic: it is the difference between a machine-readable closure and a string a consumer's regex
may or may not catch. A validator can check it automatically.

**Step 4 — resolution, with an explicit safety asymmetry.** After conformance:

| Assertion | Source | Confirmation evidence |
|---|---|---|
| `lifecycle_status: active` | unidos-por-pereira | `frescura` tier, no timestamp → maps to `last_confirmed_at: null` + `confirmation_method: user_report` |
| `lifecycle_status: closed` | alluda | `last_confirmed_at: null` (the `centros` table has no confirmation field) + `closed_at` unknown |

Both claims carry `null` confirmation. Neither wins on freshness. **The protocol's answer is not to
pick — it is to state the asymmetry:** a consumer **SHOULD** surface an unrefuted closure claim
prominently, because the cost of sending a donor with a truckload to a closed centre is higher than
the cost of showing a "reported closed" caveat on an open one. That is a consumer-side rendering
guideline, not a data merge, and it belongs in the spec's implementation notes.

**What this case proves about the model:** the required-field set is exactly right and no larger.
Without `address_text` these records never meet. Without `lifecycle_status` the closure is invisible.
Without `last_confirmed_at` being *present and null* a consumer would mistake alluda's silence for
disagreement rather than for absence of evidence. And nothing else in the record was needed.

### 7.3 Case C — the UTP campus: an app that duplicates itself, and why radius matching is unsafe

| Record | Publisher | `id` | Address | `lat` |
|---|---|---|---|---|
| `UTP` | unidosporpereira | `70ac423f88` | Carrera 27 #10-02, barrio Álamos | 4.79105 |
| `Universidad Tecnologia de Pereira - Edificio 18` | unidosporpereira | `befb69558d` | Carrera 27 #10-02, barrio Álamos | 4.80092 |
| `UTP` | alluda | *(its own PK)* | — | — |

*Source: `APP_unidosporpereira.md` §Shelters, in detail; `APPS_MATRIX.md` §2.1 "killer case 3".*

Same street address, **coordinates ~1.1 km apart**, inside a single publisher — plus a third record in
another app. Two lessons the model already encodes:

- **Intra-publisher duplication is real**, so `merged_into` must exist for same-publisher merges
  (alluda already has this pattern one level up, on `ciudades.fusionada_en` — it simply never got
  applied to `centros`).
- **Coordinate proximity is not a merge key and coordinate distance is not a split key.** Two records
  1.1 km apart are the same campus; elsewhere, "Ecoparque El Vergel" differs by **1.7 km** between two
  apps and "Estadio Alberto Mora Mora" by **~2 km** for the same building. Any radius threshold that
  merged these would also merge genuinely distinct neighbouring places. Hence: address + municipality
  first, coordinates as corroboration.

### 7.4 Case D — systematic prefix divergence (nine pairs, one rule)

pereiraayuda publishes municipal collection points as `Kennedy`, `Ormazá`, `San Nicolás`, `Consota`,
`El Remanso`, `Perla del Otún`, `Comuna del Café`, `Tokio`. ayudared publishes the same points, at
**identical addresses**, as `CAFE Kennedy`, `CAFE Ormaza`, `CAFE San Nicolás`, `CAFE Consota`,
`CAFE El Remanso`, `CAFE Perla del Otún`, `CAFE Comuna del Café`, and expands `Tokio` to
`Centro de Desarrollo Empresarial … Tokio` (`APP_ayudared.md` §Entity inventory;
`APP_pereiraayuda.md` §Collection-centre roster; `APPS_MATRIX.md` §2.1).

Nine pairs; three distinct failure modes in one set — a systematic prefix, an accent drop
(`Ormazá`/`Ormaza`), and a name expansion. A prefix-stripping heuristic tuned to `CAFE ` would be
overfitted to one publisher and would break the day a tenth pair uses a different prefix.
**Addresses matched on all nine.** This is the case that turns "address matching works" from an
anecdote into a rule.

### 7.5 Case E — the manual copy that already happened

pereiraayuda carries a collection point whose provenance field reads
`"Acopio Pereira (ayudaspereira.com), 13 ago — ciudad Pereira"`, describing an organisation that also
exists natively in alluda's roster at the same address (`APP_pereiraayuda.md` §Cross-app provenance).

Attribution was preserved; **identity was not**. There is now no way to state that the two records are
the same place, no way for a correction at the origin to reach the copy, and no way for a consumer to
avoid counting the place twice. This is the manual-integration cost, documented in production, and it
is what `source{source_id, source_url, retrieved_at}` + `same_as[]` exist to replace. It is also the
concrete argument for structured provenance over prose: the same field, on other records, carries
personal names.

---

## 8. Identifier scheme — requirements

**Final form is Task 4's call.** This section fixes the requirements it must satisfy and the test
cases it must pass.

### 8.1 Two identifiers, two jobs — do not conflate them

| | **Record identity** | **Place identity** |
|---|---|---|
| Answers | "which row is this, in whose database" | "which building in the world is this" |
| Minted by | the publisher, unilaterally | nobody, in v0.1 — it is *claimed*, via `same_as` |
| Stability | must survive edits and republication | must survive a publisher disappearing |
| Shape (candidate) | `{publisher_id}:{local_id}` — `PRIOR_ART.md` verdict C | `co-{dept}-{municipality}-{kind}-{slug}-{nn}` — human-legible, municipality-scoped |
| v0.1 status | **REQUIRED** | **deferred**: consumers cluster; a registry-hosted place index is v0.2 (Q4) |

Conflating them is the mistake to avoid: a shared place ID minted centrally in v0.1 would require a
central authority that does not exist, would block adoption behind a registration step, and would be
wrong the first time two publishers disagreed about whether two records are one place.

### 8.2 Requirements

| # | Requirement | Why (evidence) |
|---|---|---|
| **R1** | **Stable across edits, republication and re-geocoding.** An id MUST NOT change because a name was corrected or coordinates were improved. | The UTP records differ in name and coordinates for the same address (§7.3); an id derived from either would churn. |
| **R2** | **Globally unique with zero coordination.** Uniqueness comes from `publisher_id` + local id, not from a central allocator. | 20 independent id spaces, no registry today; requiring coordination is the adoption killer (C7). |
| **R3** | **Decentrally mintable from what a publisher already has.** Integer PKs, UUIDs and slugs MUST all be acceptable as `local_id`. | Requiring UUID minting forces a migration on every app with integer PKs — a pure tax. pereiravive (ints), encuentratumascota (UUIDv4), unidosporpereira (10-hex) must all conform unchanged. |
| **R4** | **Municipality-scoped for *place* identity.** Any shared place identifier MUST include the DIVIPOLA municipality. | "Coliseo Mayor de Pereira" vs "de Manizales" (§7.1). |
| **R5** | **Human-legible where it is human-facing.** A registry place id SHOULD be readable and guessable enough to discuss in a WhatsApp group. Record ids need not be. | ayudared's `DA-*`/`AC-*` typed prefixes are the only human-legible scheme observed and made the entity model readable **from `robots.txt` alone**, without opening a record. |
| **R6** | **Opaque with respect to personal data.** Ids and slugs MUST NOT embed names, phone numbers or any personal identifier. | `/{set}/{numeric-id}-{personal-given-name}/` observed in production (`APP_helpthemdirectly.md` §Risks 1). |
| **R7** | **Non-enumerable where the corpus is sensitive.** For any entity touching persons, sequential ids are prohibited — and since person entities are excluded entirely, this reads as: **an excluded entity's ids must never appear in a protocol document at all.** | Sequential `/person/{n}` + no `robots.txt` makes a corpus walkable (`APP_encontrados.md` §Why…, item 3). |
| **R8** | **One id per record, per publisher.** A publisher MUST NOT expose two identifier systems for one entity. | pereiraayuda's API addresses records by `id` and its MCP tools by `slug` (`APP_pereiraayuda.md` §MCP server). A consumer cannot tell which is canonical. |
| **R9** | **A publisher MUST NOT mint identity in another publisher's namespace.** Re-exposing a foreign PK as your own identity is prohibited. | aquiayuda's `/centro/:id` is alluda's primary key, meaningful in exactly one other system (`APP_aquiayuda.md` §Entity inventory). |
| **R10** | **Cross-reference is a first-class field, and it is a claim.** `same_as[]` holds fully-qualified foreign ids; `merged_into` holds a same-publisher supersession pointer. Neither confers authority. | alluda's `ciudades.fusionada_en` is the ecosystem's existing merge-pointer precedent; corag's `source` + `externalId` idempotency pair is the existing cross-app convention, already used in production by aquiayuda. |
| **R11** | **Resolvable to a human page.** Every id MUST be accompanied by `public_url`. | Link-out is the mechanism that keeps contact data out of feeds (§5.6). |
| **R12** | **Survivable.** Ids MUST remain meaningful after a publisher winds down. | SOS Terremoto is migrating into corag *now*; mapadelterremoto commits to maintenance only through 2026-11-30. The spec needs an orderly-wind-down and record-custody clause, and ids that outlive their minter are the precondition. |

### 8.3 Test cases any proposed scheme MUST pass

1. **The Manizales test** — "Coliseo Mayor" in Pereira and in Manizales resolve to different place
   identities without any name-based disambiguation.
2. **The prefix test** — `Kennedy` and `CAFE Kennedy` at one address can be asserted as one place, and
   nine such pairs need one rule, not nine.
3. **The self-duplication test** — a publisher can point one of its own records at another
   (`merged_into`) without deleting either.
4. **The no-coordinates test** — a place with `address_text` and no `lat`/`lon` gets a full identity;
   64 % of the reference dataset depends on this.
5. **The silence test** — a publisher with no freshness data at all (226 records) can still mint
   conforming ids and publish, with `last_confirmed_at: null`.
6. **The migration test** — an integer-PK publisher, a UUID publisher and a 10-hex-id publisher all
   conform without a database migration.
7. **The wind-down test** — when a publisher stops, its ids remain unambiguous references in other
   publishers' `same_as` arrays and in consumers' caches.

---

## 9. Open questions for the working group

Ten, each with a recommended default so that silence resolves to a decision rather than to a delay.

| # | Question | Recommended default | Rationale |
|---|---|---|---|
| **Q1** | Does v0.1 `place` cover hazards and road closures (risk zones, `cierres_via`, `type: road`)? | **No.** Defer to a v0.2 `hazard_notice`. | They are lines and areas, not points; carrying them would force GeoJSON into v0.1, which verdict A deliberately keeps optional. Four apps hold them and they will keep. |
| **Q2** | May institutional phone numbers travel in a feed? | **Extended profile only, organisation-owned only, never a natural person** — and not in Core v0.1. | pereiraayuda already draws exactly this line and publishes only institutional switchboards and consented numbers. Meanwhile `/telefonos`-style directories are called out as the easiest zero-risk federation win in the ecosystem, so a blanket ban forfeits real value. |
| **Q3** | Is `municipality_code` REQUIRED even for publishers whose municipality strings are dirty? | **Yes, with a warning-not-error escape:** `municipality_code: null` is permitted **only** when `municipality_text` is present, and a validator emits a warning. | Making it a hard error on day one excludes ayudared (bare-number values), pereiravive (`Pereira cuba`) and alluda (cross-department misfiling) — i.e. three of the largest place datasets. A warning creates pressure without creating exclusion. |
| **Q4** | Who mints shared *place* ids — a registry, or the first publisher to describe a place? | **Nobody, in v0.1.** Consumers cluster using `same_as` claims; a registry-hosted place index ships in v0.2 once real clusters exist. | Central minting needs an authority that does not exist and a registration step that would gate adoption. Getting the entity model wrong cheaply beats getting it wrong expensively (HSDS's two breaking majors). |
| **Q5** | Is `same_as` transitive? If A claims B and B claims C, does A claim C? | **No.** Claims are one-hop and non-authoritative; consumers MAY compute transitive closure but MUST NOT republish it as a claim. | Transitive merge propagates one publisher's mistake across the whole network with no audit trail — the exact failure "discrepancies are preserved, not resolved" exists to prevent. |
| **Q6** | Multi-purpose places — one `place_kind` or many? | **One primary `place_kind` + optional `place_kind_secondary[]`.** | gravitas folds shelter, collection centre and command post into one value; reporteco shipped both `categoria` and `categorias[]` after real records needed more than one. A single value would force publishers to lie; an unordered set would break every "show me shelters" filter. |
| **Q7** | Capacity and occupancy — Core or Extended? | **Extended, with names reserved now** (`capacity_total`, `capacity_used`). | Exactly one app models it (`N personas de M cupos`), so requiring it would fail 19 publishers. Reserving the names now prevents three incompatible spellings appearing in three Profiles. |
| **Q8** | How are clustered or merged records represented? | **`merged_into` (same publisher) + `cluster_size` (Extended) + a normative rule that merges MUST be inspectable and SHOULD be reversible.** | gravitas clusters automatically at ingest with an undocumented radius and unknown reversibility; a consumer cannot tell one observation from a merged group. Clustering is lossy if the merge cannot be inspected. |
| **Q9** | Is `origin_category` free text, or must a publisher declare its vocabulary? | **Verbatim string in the record; the publisher declares its vocabulary in its publisher file; crosswalks live in the registry.** | Crosswalks in the registry can be corrected without a publisher redeploying — which matters because the observed crosswalks contain lossy joins (`agua`→`alimentos`) that will need fixing after publication, not before. |
| **Q10** | Is the network Colombia-scoped or event-scoped? Do places carry an `event_id`? | **Event-scoped registry, event-optional records.** Places persist across events by default; `event_id` is an OPTIONAL record field drawn from a registry-declared event list. | One app already runs two events side by side (`sismos-co-2026`, `sismos-ve-2026`) and its keys argue convincingly for event scoping; but a shelter is a building that outlives the emergency, and forcing an event onto every place would break the first re-use of this protocol — which is precisely the leverage this initiative is looking for. |

---

## 10. What this document does not decide

Recorded so these are not mistaken for omissions:

- **Wire format, JSON Schemas, file layout, conformance profiles and the validator** — Task 4.
- **The final identifier string format** — Task 4, against §8's requirements and test cases.
- **Discovery** (`/.well-known/` descriptor and the registry index) — Task 4; the entity model assumes
  it exists, because catch-all `200`s defeated our own probes on four hosts and produced false
  `unknown` verdicts on three apps that do have public APIs.
- **Structured opening hours, needs quantity arithmetic, write paths, and the `assessment` entity** —
  explicit non-decisions for v0.1, each with its evidence recorded above.
- **The protocol's name and namespace** — Task 5. No field prefix in this document is final, and none
  may be `corag-*`.
