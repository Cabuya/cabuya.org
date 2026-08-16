# APP_reporteco — Reporte CO

## TL;DR

- **The baseline YAML is out of date on the most important field.** Reporte CO publishes an **open, unauthenticated, multi-format data feed** — `/api/reports` (JSON), `/api/reports.csv`, `/api/reports.geojson`, `/api/reports.kml` — under an explicit "no permission, no registration" policy. `integrations.publicApi` should move from `unknown` to **`yes`** (verified 2026-08-16T04:07:14Z).
- The GeoJSON is a correct `FeatureCollection` served as `application/geo+json` with `Access-Control-Allow-Origin: *` and `cache-control: public, max-age=60`. Filters `?departamento=`, `?category=`, `?severity=` apply to every format. **This is the closest thing to a conforming protocol feed that exists in the ecosystem today.**
- It is the **only app in the assigned set with an articulated privacy architecture**: phone numbers stored only as irreversible hashes, exact locations never published, every report moderated by volunteers, and personal data stripped from public text automatically.
- It is **open source** (`github.com/crafter-station/reporte-co`, Next.js 16 + React 19 + Supabase + Drizzle + Mapbox GL v3) and is itself a **fork of a Venezuela edition** — i.e. already engineered as a portable disaster-response template. The README describes `/api/reports` as a "PII-free feed" and lists CSV/RSS feeds for UNGRD and relief NGOs on the roadmap.
- **Important caveat on the data:** every `folio` in the published feed carries a `seed_` prefix and every `fecha` falls on 2026-08-10. The 39 published records are consistent with a **seeded dataset, not live citizen traffic** (observed 2026-08-16T04:07:14Z). Excellent plumbing, little water in the pipe.
- Feed-readiness: **S**. Also: **DNS for `co.crafter.run` failed to resolve for at least 44 seconds during probing** and recovered — see Risks.

**Inputs:** `src/content/ecosystem-apps/reporteco.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:02:51Z–04:07:14Z; public repository metadata 2026-08-16T04:09Z.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Reporte CO |
| URL | https://co.crafter.run/ |
| Category (YAML) | `damage` |
| Slug | `reporteco` |
| YAML `order` / `featured` | 40 / `false` |
| YAML tagline (ES/EN) | "Mapa ciudadano del sismo" / "Citizen quake map" |
| Page title (observed) | "Reporte CO · Mapa ciudadano del sismo" |
| Operator (observed) | `crafter-station` — the app is a tenant on `crafter.run`, whose apex redirects to `https://crafter.run/en` |
| Repository (observed) | https://github.com/crafter-station/reporte-co |
| YAML `integrations.publicApi` | `unknown` — **contradicted by evidence, see Integration surface** |
| YAML `integrations.publicMcp` | `unknown` — confirmed |
| Logo authorization (YAML) | `pending_contact` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Open, privacy-minded platform" | **Confirmed, strongly** | `/acerca` "Privacidad primero" section, 2026-08-16T04:06:59Z; repo README describes a PII-free feed |
| "Map damage, people trapped, injuries, shelters and service outages" | **Confirmed** | 11 report categories rendered on the homepage, 2026-08-16T04:06:22Z |
| "People trapped / injuries (per the site)" | **Confirmed** | `rescue` and `salud` categories present in the feed enum |
| "Report forms by type" | **Confirmed** | `/reportar` route; repo documents a WhatsApp webhook plus an anonymous web form |
| "We did not find public API or MCP documentation on the site" | **Superseded for API** | `/datos` publishes four download/API endpoints; MCP remains not found |
| "We do not reproduce sensitive personal data" (our own limit) | **Honoured** | No individual record content is reproduced in this dossier |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`.

### Resolution failure window

| URL | UTC timestamp | Status | Content-Type | Note |
|---|---|---|---|---|
| https://co.crafter.run/ (+7 discovery paths) | 2026-08-16T04:02:51Z – 04:03:00Z | **DNS failure** | — | `Could not resolve host: co.crafter.run` on all 8 requests — **unreachable at 2026-08-16T04:02:51Z** |
| DNS re-check `co.crafter.run` | 2026-08-16T04:03:35Z | **NXDOMAIN** | — | Apex `crafter.run` resolved normally in the same second (76.76.21.21 / 216.150.1.1), so the failure was subdomain-specific, not a general network fault |
| DNS re-check `co.crafter.run` | 2026-08-16T04:06:11Z | **resolved** | — | `216.150.1.129 / 216.150.16.129 → 3aa9bbd0e7e29229.vercel-dns-016.com`; HTTP 200 |

The outage window observed was **at least 44 seconds** (04:02:51Z → 04:03:35Z) and had recovered by 04:06:11Z. Recorded as a transient resolution failure, not an app shutdown.

### Successful probes

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://co.crafter.run/ | 2026-08-16T04:06:22Z | 200 | text/html; charset=utf-8 | 64 087 |
| https://co.crafter.run/robots.txt | 2026-08-16T04:06:24Z | **404** | text/html; charset=utf-8 | 14 255 |
| https://co.crafter.run/sitemap.xml | 2026-08-16T04:06:25Z | **404** | text/html; charset=utf-8 | 14 259 |
| https://co.crafter.run/.well-known/ | 2026-08-16T04:06:27Z | **404** | text/html; charset=utf-8 | 14 259 |
| https://co.crafter.run/api | 2026-08-16T04:06:29Z | **404** | text/html; charset=utf-8 | 14 227 |
| https://co.crafter.run/api/docs | 2026-08-16T04:06:30Z | **404** | text/html; charset=utf-8 | 15 691 |
| https://co.crafter.run/openapi.json | 2026-08-16T04:06:32Z | **404** | text/html; charset=utf-8 | 14 263 |
| https://co.crafter.run/mcp | 2026-08-16T04:06:34Z | **404** | text/html; charset=utf-8 | 14 227 |
| https://co.crafter.run/datos | 2026-08-16T04:06:57Z | 200 | text/html; charset=utf-8 | 172 283 |
| https://co.crafter.run/acerca | 2026-08-16T04:06:59Z | 200 | text/html; charset=utf-8 | 53 995 |
| https://co.crafter.run/api/reports.geojson | 2026-08-16T04:07:14Z | 200 | **application/geo+json; charset=utf-8** | 28 553 |
| https://crafter.run/ | 2026-08-16T04:06:11Z | 200 → `/en` | text/html; charset=utf-8 | — |

11 requests to `co.crafter.run` (plus one to the apex). The three beyond the standard eight follow links published on the app's own pages: `/datos` and `/acerca` are linked from the main navigation, and `/api/reports.geojson` is one of four downloads the `/datos` page explicitly offers for free use without registration. No moderation route, admin route or write endpoint was touched.

---

## Observable architecture

- **Hosting:** Vercel (`server: Vercel`, `x-powered-by: Next.js`, `x-matched-path: /`, `x-vercel-id: iad1::…`).
- **Framework:** Next.js App Router with **Turbopack** — chunk filenames are Turbopack-style (`/_next/static/chunks/3z524g4q0o21c.js?dpl=dpl_9SkuoR5i1KerHNPB`) rather than webpack hash-style; `self.__next_f` streaming payload present.
- **Full stack (from the public repository, 2026-08-16T04:09Z):** Next.js 16 (App Router) + React 19, **Supabase**, **Drizzle ORM**, **Zod**, **Mapbox GL JS v3**, shadcn/ui, Biome, bun.
- **Caching:** the homepage is served `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` with `x-vercel-cache: MISS` — dynamic per request. The GeoJSON feed, by contrast, is `public, max-age=60`, which is a sensible and deliberately different policy for a machine surface.
- **404 handling:** real 404 status codes with a styled ~14 KB page. Correct behaviour, unlike the SPA catch-alls elsewhere in this category.
- **No structured data:** zero `application/ld+json` blocks on the homepage — the one notable metadata gap in an otherwise well-built app.
- **Server-side rendering:** partial. The homepage's 64 KB of HTML yields only ~700 characters of extractable text (nav, category legend, city list); the map and record detail render client-side. `/datos`, by contrast, server-renders the full record table — 172 KB of HTML — which is why the data page is legible to agents while the map is not.
- **Intake channels (from the repository):** a **WhatsApp webhook** (`/api/webhooks/whatsapp`) alongside the anonymous web form at `/reportar`; a password-gated moderation queue at `/moderation`; an **append-only audit log** for state changes.
- **Routes observed:** `/`, `/acerca`, `/datos`, `/reportar`, `/moderation`, plus 14 city pages — `/armenia`, `/bogota`, `/buenaventura`, `/cali`, `/cartago`, `/dosquebradas`, `/ibague`, `/manizales`, `/medellin`, `/palmira`, `/pereira`, `/quibdo`, `/san-jose-del-palmar`, `/tulua`.
- **Provenance model, rendered as geometry:** the map draws **circles for citizen reports and squares for information transcribed from a cited source** — a visual encoding of provenance that most professional systems do not bother with.

---

## Entity inventory

### Entity: `Report` (citizen report) — the federating entity

Field list read directly from the served GeoJSON (2026-08-16T04:07:14Z). Values below are reported as aggregates and enumerations only; no individual record text is reproduced.

| Property | Type | Distinct values in feed | Notes |
|---|---|---|---|
| `folio` | string | 39 (all unique) | Record identifier. **Every value observed carried a `seed_` prefix** |
| `categoria` | enum (machine key) | 11 | Includes `missing`, `rescue`, `water`, `telecoms`, `damage`, `shelter` |
| `categoria_label` | string (es) | 11 | Human label paired 1:1 with the machine key |
| `categorias` | array of enum | 15 combinations | **Multi-category support** — a record can be e.g. `['damage','shelter']` |
| `severidad` | enum | 4 | `critical` / `high` / `medium` / `low` (machine keys observed include `high`, `medium`, `low`) |
| `severidad_label` | string (es) | 4 | `Crítica` / `Alta` / `Media` / `Baja` |
| `departamento` | string | 8 | Antioquia, Bogotá D.C., Caldas, Chocó, Quindío, Risaralda, Tolima, Valle del Cauca |
| `municipio` | string | 16 | Names, **not DIVIPOLA codes** |
| `barrio` | string | 10 | Neighbourhood granularity — deliberately coarser than a point address |
| `fecha` | ISO 8601 UTC | 37 | Machine timestamp |
| `fecha_local` | `DD/MM/YYYY HH:MM` | 37 | Human-readable local time, redundant but convenient |
| `resumen` | string (es) | 17 | Short summary. Note only 17 distinct values across 39 records — templated text, consistent with seeding |
| *geometry* | GeoJSON `Point` | 39 | Approximate by design (see Privacy) |

**Category taxonomy as displayed** (11 types, with counts at 2026-08-16T04:06:22Z): Rescate/atrapados 3 · Heridos/salud 5 · Personas desaparecidas 3 · Daños estructurales 6 · Albergue/techo 5 · Agua 3 · Alimentos 2 · Electricidad 3 · Vías/deslizamientos 3 · Comunicaciones 2 · Otro 4. Total 39/39.

**Severity distribution** (`/datos`, 2026-08-16T04:06:57Z): 9 crítica · 17 alta · 11 media · 2 baja.

This is the **richest damage taxonomy in the ecosystem** — 11 categories against Pereira Responde's 3 types and Gravitas's 4. It is also the only one that spans damage *and* needs (`agua`, `alimentos`, `electricidad`) in one enum, which makes it a strong candidate skeleton for the protocol's category vocabulary.

### Entity: `Punto verificado` (curated map layer) — 59 records

A second layer drawn over the citizen reports, described on `/acerca` (2026-08-16T04:06:59Z): **47 transcribed by volunteers** in the "CRISIS 10 DE AGOSTO" effort from official bulletins and established media, and **12 published directly by an authority**.

| Sub-type | Count |
|---|---|
| Zonas de peligro | 13 |
| Acopio y hospitales | 33 |
| Frentes de trabajo | 8 |
| Corredores viales | 5 |

Each record carries its source and warns when the location is approximate. **Points marked `Oficial` come directly from an authority**; the rest are explicitly not official. Whether this layer is included in the `/api/reports*` downloads was **not determined** — the `/datos` page frames the downloads as "los reportes verificados", and the GeoJSON returned 39 features matching the citizen-report count, so the curated 59 appear to be a separate set. `unverified`.

### Freshness signals

| Signal | Value | Source |
|---|---|---|
| Feed cache directive | `public, max-age=60` | `/api/reports.geojson` headers, 2026-08-16T04:07:14Z |
| All record `fecha` values | **2026-08-10** | GeoJSON, 2026-08-16T04:07:14Z |
| All `folio` values | `seed_NNN` prefix | GeoJSON |
| Stated snapshot | "Instantánea tomada el 10 de agosto de 2026 a las 4:42 p. m." | `/acerca` |
| On-page count | 39/39 reports, 59/59 verified points | homepage |
| Machine freshness field | **none** — no `generatedAt`, `updatedAt` or feed-level timestamp | GeoJSON |
| `sitemap.xml` `lastmod` | n/a — no sitemap (404) | probe |

**The honest reading:** the feed is technically live (60-second cache, dynamic origin) but its contents have not moved since 10 August. A consumer polling it today would receive six-day-old seeded records. The infrastructure is production-grade; the dataset is not yet.

### Privacy architecture (stated on `/acerca`, 2026-08-16T04:06:59Z)

- Phone numbers are **never stored** — only an irreversible hash.
- Exact location is **never published**; points are shown approximately.
- Every report is **reviewed by volunteers** before it appears on the map.
- Personal data is **automatically removed** from the public text.

The repository README reinforces this, describing `/api/reports` explicitly as a **"PII-free feed"** with an append-only audit log behind it.

**This is the ecosystem's existing answer to the hardest protocol question**, and it was designed independently of us. The plan's prior that people-data never federates is a special case of a broader principle Reporte CO already implements: *the federating surface is a deliberately degraded projection of the internal record.* That framing — publish a projection, not the record — should go into the protocol design directly.

**Note on the `missing` category:** the feed does carry a `Personas desaparecidas` category (3 records). These are **place-and-category records, not person records** — no name, contact or description appears in the feed's field set. No individual case listing was opened during this analysis. The protocol should still treat this category as non-federating or heavily restricted, since the category name alone invites downstream systems to join it against person data held elsewhere.

### Lineage: Mission 4636

`/acerca` situates the project explicitly in the lineage of **Mission 4636** — the 2010 Haiti earthquake effort where diaspora volunteers translated, categorised and geolocated SMS messages to direct aid. Reporte CO applies the same pipeline (Ingreso → Clasificación → Geolocalización → Verificación → Publicación) with WhatsApp in place of SMS.

This matters for Task 3 (prior art): Mission 4636 is the direct ancestor of **Ushahidi** and of the **HXL** humanitarian-exchange conventions. A working-group member has already read that literature.

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **yes** | Four documented, unauthenticated endpoints published on `/datos` under the heading "Para equipos de respuesta … Son de uso libre para Defensa Civil, bomberos, alcaldías, organismos de socorro, ONG y medios. **No hay que pedir permiso ni registrarse.**" Verified live: `GET /api/reports.geojson` → 200 `application/geo+json`, CORS `*`, 2026-08-16T04:07:14Z |
| `publicMcp` | **unknown** | `/mcp` hard-404, 2026-08-16T04:06:34Z; no MCP artefact in the repository description |
| Formats offered | **JSON · CSV · GeoJSON · KML** | `/datos`: `/api/reports`, `/api/reports.csv`, `/api/reports.geojson`, `/api/reports.kml` |
| Query filters | **`?departamento=`, `?category=`, `?severity=`** | Stated on `/datos`: "Los enlaces respetan el filtro activo y se pueden llamar directamente desde un script o un dashboard" |
| CORS | **`Access-Control-Allow-Origin: *`** | response headers |
| `robots.txt` / `sitemap.xml` / `/.well-known/` | **absent** | hard 404s |
| OpenAPI / formal docs | **none** | `/api/docs` and `/openapi.json` 404. The `/datos` page is prose documentation, not a machine-readable contract |
| Source code | **open** | https://github.com/crafter-station/reporte-co — TypeScript, 44 commits, 2 stars, 1 fork; README notes a LICENSE file is still to be added |
| Licence | **stated open-source, file pending** | Reuse terms for *the data* are separate and **not stated** — see Risks |
| Self-hosting | **documented** | README covers environment variables, database push and seed data |

### Why Reporte CO is the ecosystem's best feed template

Four properties, all already in place, that the protocol will otherwise have to argue teams into:

1. **Machine formats chosen for the consumer, not the developer.** CSV for a spreadsheet, KML for Google Earth, GeoJSON for QGIS/ArcGIS, JSON for scripts. That list is written from the perspective of a fire brigade or a mayor's office, and it is the right instinct.
2. **A no-permission, no-registration policy stated in plain language on a public page.** The hardest part of an open feed is the sentence granting permission. It is already written.
3. **Filters that compose with the UI.** The same query parameters drive the visible map and the download, so the download link a responder copies is the view they were looking at.
4. **The feed is a projection, not a dump.** PII-free by construction, coarse geography by policy, moderated before publication.

Missing, and worth asking for: a feed-level `generatedAt`, a stable record URI, an explicit data licence, and `robots.txt`/`sitemap.xml` for discovery.

---

## Adoption effort estimate: **S**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed | **S** | Four serializers already exist; a fifth shape is a small addition to an existing route family |
| Field mapping to a canonical model | **S** | 12 flat properties, machine keys already separated from Spanish labels — a mapping table, no transformation logic |
| Add feed-level metadata (`generatedAt`, licence, publisher) | **S** | Additive; the `Dataset` envelope from `mapadelterremoto` is a ready template |
| Add DIVIPOLA codes | **S–M** | `departamento`/`municipio` are held as names; DIVIPOLA codes are a lookup join, but somebody has to own the crosswalk |
| Stable record URIs | **S** | `folio` is already unique and stable-looking; needs a canonical resolvable URL |
| Data licence decision | **S (work) / M (calendar)** | A one-line decision that requires a human to make it |
| MCP server | **M** | Nothing exists today; the feed makes it straightforward but it is net-new |

**Blockers:** none technical. The two real questions are **the data licence** and **whether the dataset will carry live traffic**.

**Recommendation:** Reporte CO is the natural **reference implementation for the citizen-reporting profile** of the protocol — the fork lineage means whatever is built here propagates to the next emergency in another country, which is precisely the leverage this initiative is looking for.

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| `mapadelterremoto` | damage | Damage points, shelters, roads, services; overlapping departments; both national | **Closest peer, perfectly complementary.** Reporte CO: small dataset, excellent feed. Mapa del terremoto: large dataset, no feed. One publishes what the other has |
| `pereiraresponde` | damage | `damage` / `shelter` categories; Pereira is one of 14 city pages | Same entities, different taxonomies (11 categories vs 3 types + 7 support sub-categories). Both now have real public read surfaces — **these two could federate with each other today**, without waiting for the protocol |
| `terremotocolombia` | damage | Rescue, shelters, collection, missing persons, structural damage | **Heaviest taxonomy overlap in the set.** Reporte CO's 11 categories and Terremoto Colombia's 7 map types cover nearly the same ground, including the missing-persons category both carry |
| `gravitas` | damage | Buildings, collection centres, logistics; Colombian cities | Same entity space, coarser taxonomy, no published feed |
| `sismovision` | damage | `damage` category (structural) | Reporte CO publishes structural damage as GeoJSON; SismoVision holds far richer structural detail and publishes none |
| `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo` | logistics | `Albergue/techo`, `Acopio y hospitales` (33 curated points) | Direct duplication of the logistics cluster's core entity, at national rather than city scope |
| `encontrados`, `sospereira` | people | `Personas desaparecidas` category (3 records) | **Boundary case.** Reporte CO holds a missing-persons *category* but no person records. The people apps hold the person records. This is exactly the seam where a careless federation would reconstruct PII by joining — the protocol must forbid the join, not just the field |
| `corag` | matching | Needs (`agua`, `alimentos`, `electricidad`), evidence | Complementary: Reporte CO surfaces needs geographically, Corag matches and evidences the delivery |

**Concrete duplicate-place examples:**
- **San José del Palmar** — the epicentre municipality — appears as a Reporte CO city page with damage and health records, as one of Mapa del terremoto's 432 municipality pages with 4 registered shelter/collection points, and in Terremoto Colombia's national report set. Three independent records of the most consequential place in the country, with no shared identifier.
- **Pereira** appears in Reporte CO (city page), Pereira Responde (~93 housing records in the sampled window), Mapa del terremoto (38 shelter/collection points), Gravitas, Terremoto Colombia, and six logistics apps.
- **Dosquebradas, Manizales, Armenia, Cali, Quibdó, Buenaventura, Ibagué, Medellín, Bogotá** are city pages in Reporte CO *and* municipality pages in Mapa del terremoto — 14 of Reporte CO's 14 city pages are a strict subset of Mapa del terremoto's 432, so **every Reporte CO place has at least one duplicate**.

---

## Risks & notes

1. **DNS resolution for `co.crafter.run` failed during probing** (04:02:51Z–04:03:35Z, recovered by 04:06:11Z) while the apex `crafter.run` resolved normally throughout. Cause unknown — could be resolver-side or a propagation event. Recorded factually rather than diagnosed. Relevant to the protocol: **a federating consumer must tolerate a publisher disappearing for minutes at a time**, so feeds should be cached by consumers and staleness surfaced rather than treated as absence.
2. **The app lives on a subdomain of a product domain** (`crafter.run` apex serves a separate product at `/en`). Its address is a tenancy, not an independent identity. If the registry keys apps by URL, this one is fragile; keying by a stable publisher identifier plus a resolvable feed URL is safer.
3. **The published dataset appears to be seeded.** All 39 records carry `seed_` folios and 2026-08-10 dates, with only 17 distinct `resumen` values across 39 records. Any protocol demo or metric built on this feed would be measuring seed data. This is a fact about the dataset, not a criticism of the app — but it must not be read as evidence of live adoption.
4. **No data licence.** The repository is open source with a LICENSE file still pending, and the *data* licence is a separate question that `/datos` addresses only in permission language ("no hay que pedir permiso ni registrarse"), not in licence terms. Compare `mapadelterremoto`'s explicit CC BY 4.0. This is the single most valuable one-line change this team could make.
5. **No feed-level timestamp.** The GeoJSON has no `generatedAt`, so a consumer cannot distinguish "nothing changed" from "the pipeline stopped". Given point 3, this is currently the difference between a working integration and a silently dead one.
6. **No `robots.txt`, no `sitemap.xml`, no JSON-LD.** An app with excellent machine surfaces has no machine *discovery* surfaces. `/datos` is findable only by a human reading the navigation. A `/.well-known/` descriptor or a `Dataset` block would fix this cheaply.
7. **The `missing` category is a join hazard.** Place-and-category records for missing persons are individually PII-free but become identifying when joined against person-level data held by `encontrados`, `sospereira` or `terremotocolombia`. The protocol needs to prohibit the *join*, and should say so explicitly rather than relying on each feed being individually clean.
8. **Moderation is a human bottleneck.** Every report is volunteer-reviewed before publication. That is the right call for quality and PII safety, and it means feed latency is governed by volunteer availability, not by infrastructure. Protocol freshness expectations must accommodate human-in-the-loop publishers.
9. **The `/moderation` route is password-gated** and was not probed. Noted only to record that the boundary was respected.
10. **`categorias` (array) versus `categoria` (scalar) is a modelling signal.** This team found that real reports need multiple categories and shipped both a primary and a multi-valued field. The canonical entity model should be multi-category from day one rather than discovering this later.
11. **Fork lineage is an asset, not a footnote.** The app is a fork of a Venezuela edition and self-hosting is documented. Whatever protocol support lands here is portable to the next emergency in another country — the highest-leverage single integration available to this initiative.
