# APP_mapadelterremoto — Mapa del terremoto

## TL;DR

- Mapa del terremoto is the **national aggregator** of the ecosystem and, by a wide margin, its most metadata-mature participant: 551 indexed URLs, 432 municipality pages, and a schema.org **`Dataset`** declaration carrying an explicit **CC BY 4.0 licence**, `dateModified`, `spatialCoverage` and `temporalCoverage`.
- It is the **only app in this set that has already solved the two hardest protocol problems**: it normalises everything to **DIVIPOLA** (Colombia's official territorial coding) and **EDAN** (the standard damage-assessment vocabulary), and it attributes every figure to the body that published it.
- It has **no REST API, no MCP and no `/.well-known/`** — all four integration probes returned hard 404s. Integration surface is `unknown` for programmatic access, but the sitemap plus the `Dataset` JSON-LD constitute a real, machine-readable discovery surface that no other app in this category offers.
- Freshness is the best observed anywhere: sitemap `lastmod` max **2026-08-16T03:24:37Z**, matching the `Dataset.dateModified` exactly — about 38 minutes before the probe.
- Operated by **Naboo Intelligence** (naboointel.ai), stated as built and maintained at no cost, updated through **30 November 2026**, after which the site commits to leaving the data **permanently published in an open format**.
- Feed-readiness: **S**. They already have the licence, the identifiers, the freshness metadata and the aggregation pipeline. What is missing is a serialization endpoint, not a capability.

**Inputs:** `src/content/ecosystem-apps/mapadelterremoto.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:02:37Z–04:02:49Z.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Mapa del terremoto |
| URL | https://www.mapadelterremoto.com/ |
| Category (YAML) | `damage` |
| Slug | `mapadelterremoto` |
| YAML `order` / `featured` | 30 / `false` |
| YAML tagline (ES/EN) | "Daños en un solo mapa" / "Damage on one map" |
| Page title (observed) | "Mapa del terremoto de Colombia — sismo del 10 de agosto de 2026" |
| H1 (observed) | "Toda la información del sismo, en un solo sitio." |
| Operator (observed, JSON-LD) | **Naboo Intelligence** — `Organization`, https://www.naboointel.ai |
| Licence (observed, JSON-LD) | **https://creativecommons.org/licenses/by/4.0/** |
| Content language (observed) | `es-CO` |
| YAML `integrations.publicApi` / `publicMcp` | `unknown` / `unknown` |
| Logo authorization (YAML) | `pending_contact` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Open damage map for Colombia's 10 August 2026 quake" | **Confirmed and understated** | `Dataset` JSON-LD names it "Registro de daños del terremoto de Colombia del 10 de agosto de 2026", CC BY 4.0, 2026-08-16T04:02:37Z |
| "Damage points, shelters and collection sites across several cities" | **Confirmed** | 432 `/municipio/*` pages, 26 `/albergues/*`, 23 `/servicios/*`, 35 `/colegios/*`, 17 `/vias/*`, 13 `/hospitales/*` in the sitemap, 2026-08-16T04:02:40Z |
| "Citizen contributions of new points" | **Not observed** | No contribution control was found in the server-rendered homepage; the site describes ingestion from sources, and lists "reportes ciudadanos" only as one of five ingest streams. The YAML's "Explore the map and add damage or aid-logistics points" is **`unverified`** and may overstate the citizen-write path |
| "Several cities affected" | **Confirmed and understated** | The site states 362 municipalities with registered impact — national, not "several cities" |
| "We did not find public API or MCP documentation" | **Confirmed** | `/api`, `/api/docs`, `/openapi.json`, `/mcp` all 404, 2026-08-16T04:02:44Z–04:02:49Z |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`. 8 requests to one host.

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://www.mapadelterremoto.com/ | 2026-08-16T04:02:37Z | 200 | text/html; charset=utf-8 | 291 411 |
| https://www.mapadelterremoto.com/robots.txt | 2026-08-16T04:02:39Z | 200 | **text/plain** | 78 |
| https://www.mapadelterremoto.com/sitemap.xml | 2026-08-16T04:02:40Z | 200 | **application/xml** | 97 315 |
| https://www.mapadelterremoto.com/.well-known/ | 2026-08-16T04:02:42Z | **404** | text/html; charset=utf-8 | 43 894 |
| https://www.mapadelterremoto.com/api | 2026-08-16T04:02:44Z | **404** | text/html; charset=utf-8 | 43 894 |
| https://www.mapadelterremoto.com/api/docs | 2026-08-16T04:02:45Z | **404** | text/html; charset=utf-8 | 43 894 |
| https://www.mapadelterremoto.com/openapi.json | 2026-08-16T04:02:47Z | **404** | text/html; charset=utf-8 | 43 894 |
| https://www.mapadelterremoto.com/mcp | 2026-08-16T04:02:49Z | **404** | text/html; charset=utf-8 | 43 894 |

This is the only app in the assigned set that returns **honest status codes**: real `text/plain` and `application/xml` for the discovery files, and true 404s for paths that do not exist. Every entity claim below is read from the two documents actually served — the homepage HTML and the sitemap — with no route guessing.

`robots.txt` in full (2026-08-16T04:02:39Z):

```
User-Agent: *
Allow: /

Sitemap: https://www.mapadelterremoto.com/sitemap.xml
```

Fully open, no AI-crawler restrictions, sitemap declared. Consistent with the CC BY 4.0 posture.

---

## Observable architecture

- **Hosting:** Vercel (`server: Vercel`, `x-matched-path: /`).
- **Framework:** Next.js App Router — `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`, `self.__next_f.push(...)` streaming payload appearing 51 times, `/_next/static/chunks/*` assets carrying `?dpl=dpl_APFDhbF5r…` deployment identifiers.
- **Rendering: server-side.** The homepage ships **291 KB of HTML containing ~14 400 characters of real rendered text** — figures, source attributions, status narratives and the full shelter-by-municipality breakdown are all in the initial response. This matters enormously: it is the only app in the category whose content is legible to a crawler or an agent **without executing JavaScript**.
- **Caching:** `cache-control: public, max-age=0, must-revalidate`, `age: 16551` (~4.6 h at probe). Content is regenerated and edge-cached rather than rendered per request.
- **404 handling:** a real 404 status with a 43 894-byte styled error page — correct behaviour, slightly heavy payload.
- **Structured data:** two `application/ld+json` blocks (see below). No other app in this set publishes a `Dataset`.
- **External hosts referenced from the homepage** (source attribution, not dependencies): `portal.gestiondelriesgo.gov.co` (UNGRD), `sismosentido.sgc.gov.co` and `www.sgc.gov.co` (Servicio Geológico Colombiano), `www.minsalud.gov.co`, `www.saludcapital.gov.co`, `colombiatebusca.com`, plus press outlets (`www.eltiempo.com`, `cronicadelquindio.com`, `www.lapatria.com`, `caracol.com.co`, `www.elpais.com.co`), `creativecommons.org` and `www.naboointel.ai`. **The link graph is the provenance graph** — this app cites its way out to the primary sources on every figure.

### Structured data (verbatim from the served HTML, 2026-08-16T04:02:37Z)

**Block 1 — `Event`:** "Terremoto de Colombia de 2026", `startDate: 2026-08-10T07:34:00-05:00`, magnitude 7.4, epicentre San José del Palmar, Chocó, `GeoCoordinates` `4.894, -76.226`, depth ~100 km.

**Block 2 — `Dataset`** (the important one):

| Property | Value |
|---|---|
| `name` | "Registro de daños del terremoto de Colombia del 10 de agosto de 2026" |
| `url` | https://www.mapadelterremoto.com |
| `inLanguage` | `es-CO` |
| `dateModified` | **2026-08-16T03:24:37.000Z** |
| `license` | **https://creativecommons.org/licenses/by/4.0/** |
| `creator` | `Organization` — Naboo Intelligence, https://www.naboointel.ai |
| `spatialCoverage` | `Place` — Colombia |
| `temporalCoverage` | `2026-08-10/..` (open-ended interval) |

Plus a `BreadcrumbList`. This single block answers — in machine-readable form — four questions the protocol will have to ask every publisher: *who made it, under what licence, covering what place and period, and how fresh is it.* It is a ready-made template for the protocol's feed-level metadata envelope.

---

## Entity inventory

### The publisher's own stated pipeline

The homepage documents a four-stage method (section "Cómo se construye esta página", 2026-08-16T04:02:37Z):

1. **Ingesta** — official portals, bulletins, institutional accounts, press, and citizen reports. *"257 fuentes activas."*
2. **Normalización** — *"Todo se lleva a una misma llave territorial y a un mismo vocabulario de daño. **DIVIPOLA · EDAN**"*
3. **Contraste** — *"Cada hecho se cruza contra las demás fuentes. **Las discrepancias se conservan, no se resuelven.**"*
4. **Publicación** — map, per-municipality records and official balance, each with its cut-off time.

Stage 2 and stage 3 are the two most valuable sentences discovered in this entire probing exercise. See "What this means for the protocol".

### Entity: `Municipio` (territorial record) — 432 pages

| Aspect | Observation |
|---|---|
| URL pattern | `/municipio/{slug}` |
| Count | 432 of 551 sitemap URLs (2026-08-16T04:02:40Z) |
| Territorial key | DIVIPOLA (stated in the methodology) |
| Site-reported total with impact | 362 municipalities |
| Freshness | per-URL `lastmod` in the sitemap |

Homepage shelter/collection counts per municipality (site's own register, 439 entries total): Bogotá D.C. 66, Cali 47, Pereira 38, Medellín 24, Manizales 23, Cartagena 12, Barranquilla 11, Bucaramanga 11, Quibdó 9, Dosquebradas 8, and a long tail down to single entries across ~110 municipalities.

### Entity: `Punto afectado` (damage point)

| Aspect | Observation |
|---|---|
| Site-reported count | **3 068** damage points, each with its own record and sources |
| Evidence attached | **6 609** pieces of evidence |
| Damage vocabulary | EDAN (stated) |
| Thematic slices exposed as routes | `/albergues` (26), `/colegios` (35), `/hospitales` (13), `/servicios` (23), `/vias` (17) |
| Freshness | sitemap `lastmod` per page |

### Entity: `Cifra` (attributed figure)

Every headline number carries a named source and a cut-off time. As presented by the site at 2026-08-16T04:02:37Z, **attributed to UNGRD with a cut-off of 15 August 06:30** — these are the site's attributions, restated here as attributions and not as claims of ours: 294 deceased · 320 missing · 3 935 injured · 353 rescued · 14 493 homes destroyed · 81 506 homes damaged · 66 buildings collapsed · 2 612 educational facilities affected · 241 health facilities affected · 298 roads affected. Magnitude 7.4 and the 10 Aug 07:34 origin time are attributed to the **SGC**. Counts attributed to *"este registro"* (the site's own aggregation): 3 068 damage points, 362 municipalities, 6 609 evidence items, 1 601 aggregated public sources, 192 distinct organisations channelling aid, 439 shelters/collection points, 272 blood-donation or drop-off sites across 35 cities, 227 ABACO food-bank points across 33 cities, 45 receiving hospitals across 9 cities.

The site labels itself, repeatedly and prominently, **"No es fuente oficial"** and states it does not dispatch aid.

### Entity: `Estado operativo` (hand-curated situation report)

Narrative status blocks per sector (telecommunications, airports, roads and mobility, …) each with a severity label (`Crítico`, `Parcial`), a source citation and a timestamp — e.g. the telecommunications block cites MinTIC 13 Aug and La Crónica del Quindío 14 Aug 14:55, and explicitly flags that no new national count has been published for five days. Marked "Curado a mano · 15 ago 09:33".

**This is the only app in the set that models the *absence* of data as a first-class fact.** Saying "the last published figure is five days old" is more useful than silently showing a stale number, and the protocol should have a way to express it.

### Freshness signals

| Signal | Value | Source |
|---|---|---|
| `Dataset.dateModified` | **2026-08-16T03:24:37.000Z** | homepage JSON-LD, 2026-08-16T04:02:37Z |
| Sitemap `lastmod` max | **2026-08-16T03:24:37.000Z** (identical) | sitemap, 2026-08-16T04:02:40Z |
| Sitemap `lastmod` min | 2026-08-11T05:00:00.000Z | sitemap |
| `lastmod` coverage | **551 of 551 URLs** — every single URL is timestamped | sitemap |
| On-page label | "Actualizado 15 ago · 22:24"; UNGRD figures "Corte 15 ago · 06:30" | homepage |
| Hand-curation stamp | "Curado a mano · 15 ago 09:33" | homepage |
| Stated maintenance horizon | updated **through 30 November 2026**, then permanently published in an open format | homepage |

Full `lastmod` coverage across every URL is, by itself, a usable incremental-sync mechanism today — a consumer could poll the sitemap and refetch only changed municipality pages. It is the closest thing to a working feed anywhere in the damage category outside Reporte CO.

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **unknown** | `/api`, `/api/docs`, `/openapi.json` all hard-404, 2026-08-16T04:02:44Z–04:02:47Z. No API is advertised anywhere on the served homepage. Whether an internal route handler exists is undetermined — Next.js apps commonly have them and they are not required to be discoverable |
| `publicMcp` | **unknown** | `/mcp` hard-404, 2026-08-16T04:02:49Z. No MCP artefact found |
| `robots.txt` | **yes** | 200 `text/plain`, fully permissive, declares the sitemap |
| `sitemap.xml` | **yes** | 200 `application/xml`, 551 URLs, 100 % `lastmod` coverage |
| `/.well-known/` | **no** | hard 404 |
| Structured data | **yes — `Dataset` + `Event`** | schema.org JSON-LD in the served HTML |
| **Licence** | **yes — CC BY 4.0** | `Dataset.license`, the only explicit licence found in this set |
| Bulk download | **not found today; committed for the future** | The site states data will remain "publicados de forma permanente en formato abierto" after 30 Nov 2026. No download control observed at probe time |

### Why this app matters more than its integration score suggests

Scored mechanically it is "no API, no MCP" — which badly misreads it. Federation needs four things from a publisher: **stable identifiers, a licence, provenance, and freshness metadata.** Mapa del terremoto is the only app in the assigned set that has all four *today*. What it lacks is a serializer.

### What this means for the protocol

1. **Adopt DIVIPOLA as the territorial key. Do not invent one.** A production system aggregating 257 sources has already made this choice and it is Colombia's official coding. Any protocol that introduces a competing place key makes this app worse, not better.
2. **Adopt or align with EDAN for the damage vocabulary.** Same argument. EDAN is the established damage-and-needs assessment vocabulary in the region; Pereira Responde's five-level UI scale and Reporte CO's eleven categories can both be mapped to it, whereas mapping them to each other is arbitrary.
3. **"Discrepancies are preserved, not resolved."** This should be a stated design principle of the protocol. When two apps disagree about a place, a federating layer that silently picks a winner destroys the most decision-relevant information there is. Model conflicting assertions as coexisting, each with its source.
4. **Per-fact source attribution and a cut-off time, not per-feed.** This app attaches provenance to each figure, not to the document. The protocol's record envelope should carry `source` and `asOf` at record level.
5. **Model absence explicitly.** A "no new national count for five days" state needs a representation. Silence and zero are not the same value.
6. **The `Dataset` JSON-LD is the feed envelope, already written.** `license` + `creator` + `spatialCoverage` + `temporalCoverage` + `dateModified` is very close to the minimum viable metadata header for a protocol feed. Reusing schema.org vocabulary here costs nothing and buys immediate search and agent legibility.

---

## Adoption effort estimate: **S**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed | **S** | The data is already normalised to DIVIPOLA + EDAN, already licensed CC BY 4.0, already timestamped per record. A Next.js route handler serializing the existing store is a small change |
| Licence and attribution metadata | **Already done** | CC BY 4.0 declared; attribution model is per-fact and richer than the protocol is likely to require |
| Freshness metadata | **Already done** | `dateModified` + 100 % sitemap `lastmod` coverage |
| Territorial identifiers | **Already done** | DIVIPOLA |
| Incremental sync | **S** | Sitemap `lastmod` polling works today with zero changes on their side |
| Geometry export | **S–M** | Coordinates are certainly held (there is a map) but were not observed in the server-rendered HTML; GeoJSON serialization effort is `unverified` |

**Blockers:** none observed. The constraint is attention, not capability — and the stated 30 November 2026 maintenance horizon means the window for a conversation is finite.

**Strong recommendation for Task 6/7:** this team is the natural **reference implementation partner** for the protocol's aggregation profile, in the same way Reporte CO is the natural partner for the citizen-reporting profile and Pereira Responde for the API/MCP profile.

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| **Every other app in the ecosystem** | all | — | This is the aggregator: 362 municipalities and 1 601 aggregated sources mean it structurally overlaps everyone. The right framing is not "duplicate" but "**should be downstream of**" |
| `reporteco` | damage | Damage points, shelters, roads, services across the same 8 departments; both are national in ambition | **Closest peer.** Reporte CO has a machine-readable feed and a small dataset; Mapa del terremoto has a large dataset and no feed. They are complementary halves of one capability |
| `pereiraresponde` | damage | Pereira damage points, shelters, collection | Depth vs breadth. Pereira Responde's ~100 recent records per window are exactly the kind of first-party stream this aggregator ingests. Today it can only be scraped, which the plan forbids — so the protocol is the *only* legal path between them |
| `terremotocolombia` | damage | Hospitals, shelters, collection, official-source directory, damage reports | **Direct functional duplicate at the aggregation layer.** Both aggregate official sources and both publish hospital and shelter directories nationally; Terremoto Colombia adds a missing-persons directory, which this app does not carry (it links out to Colombia Te Busca instead) |
| `sismovision` | damage | Structural damage to buildings | Aggregator vs specialist. SismoVision holds engineer-reviewed assessments this app has no route to ingest |
| `gravitas` | damage | Buildings, collection centres, logistics | Same entities, city-level scope, no published data |
| `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo` | logistics | **439 shelters and collection points across ~110 municipalities** | **The single largest duplication surface in the ecosystem.** Six logistics apps each maintain collection-point directories; this app already holds 439 of them nationally with per-source attribution, plus 227 ABACO points and 272 blood/drop-off sites. If the protocol delivers one thing first, it should be the shared place registry for collection points and shelters |
| `encontrados`, `sospereira` | people | — | **Deliberately no overlap.** This app does not host person records; it links out to Colombia Te Busca. That editorial choice matches the plan's "people-data never federates" prior and is worth citing as precedent set by a peer, not imposed by us |

**Concrete duplicate-place examples:**
- **Pereira collection/shelter points:** 38 entries in this register, against directories independently maintained by `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo`, plus `support/collection` and `support/shelter` records in `pereiraresponde` and `Acopio` in `terremotocolombia` and `gravitas` — the same physical warehouses and church halls held in up to nine independent identifier spaces.
- **Dosquebradas:** 8 entries here, plus `gogo`, `pereiraayuda` and `unidosporpereira` coverage and a `reporteco` city page.
- **San José del Palmar (the epicentre):** 4 entries here, a `reporteco` city page, and damage records in `reporteco` and `terremotocolombia` — the most consequential municipality in the country, with no shared identifier for any of its points.

---

## Risks & notes

1. **Finite maintenance horizon.** The site states it is maintained through **30 November 2026**. Any integration built on live polling needs a stated plan for what happens after that date — though the accompanying commitment to permanent open-format publication is exactly the right answer and should be held up as a model.
2. **Single-operator dependency.** Built and maintained at no cost by Naboo Intelligence. Sustainability, governance and succession are org-level questions the working group should raise early. The site is explicit that the engine was "cedida sin coste para esta emergencia".
3. **No API means no write path.** Federation with this app is read-only in practice. If the protocol assumes bidirectional exchange, this participant will be a consumer-and-publisher, never a receiver. Design accordingly.
4. **The YAML overstates citizen contribution.** "Explore the map and add damage or aid-logistics points" was not corroborated by the server-rendered homepage, which describes citizen reports as one of five *ingest* streams rather than an open contribution control. Marked `unverified`; worth correcting in the directory entry once confirmed with the team.
5. **Aggregation of third-party content raises rights questions the CC BY 4.0 licence may not fully cover.** The dataset is licensed CC BY 4.0 by Naboo Intelligence, but it aggregates press and institutional material whose own terms differ. A downstream federating consumer inherits that ambiguity. The protocol's licensing section should distinguish *the licence of the compilation* from *the licence of each source assertion* — a distinction this app's per-fact attribution model already makes possible.
6. **Heavy pages.** 291 KB of HTML on the homepage and a 43 894-byte 404 page. Not a protocol issue, but relevant to field use on degraded networks.
7. **`/.well-known/` returns 404**, so if the protocol standardises on a well-known descriptor this app needs a new route — trivial on Next.js, but it is a change.
8. **No `updatedAt` semantics beyond page granularity.** Sitemap `lastmod` tells a consumer that a municipality page changed, not which record within it. Adequate for polling, insufficient for precise incremental sync.
9. **Figures restated here are the site's attributions, not our verification.** We did not independently confirm any UNGRD or SGC number against the primary source. They appear in this dossier as "what this app publishes, and to whom it attributes it", which is what the protocol analysis needs; treating them as verified facts would violate Rule-0.
10. **No people-data, by editorial choice.** Confirms that the "link out for missing persons" pattern is already the ecosystem norm among the more mature aggregators, not a constraint the protocol has to impose against the grain.
