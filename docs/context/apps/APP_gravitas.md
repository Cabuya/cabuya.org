# APP_gravitas — GRAVITAS

## TL;DR

- GRAVITAS is a Next.js citizen emergency map on Vercel with a **four-category model** — Edificio, Centro de acopio, Logística, **Voluntariado** — and a small public route surface: `/`, `/explorar`, `/reportar`, `/login`.
- **It is the least externally legible app in the assigned set.** All eight discovery probes returned hard 404s, there is no `robots.txt`, no `sitemap.xml`, no JSON-LD, no visible licence, no repository link, no operator identification beyond the domain, and **no external host of any kind appears in its HTML**. Integration surface is `unknown` on the strongest possible evidence: there is nothing to find.
- Its data layer is entirely client-side and could not be resolved from public HTML or from the page's JavaScript chunk. This is recorded as a limit of the analysis, not as a claim that no backend exists.
- Two design choices are genuinely distinctive and worth carrying into the protocol: **automatic clustering of nearby reports about the same point** ("Reportes cercanos del mismo punto se agrupan solos") and an explicit **no-hiding policy** ("Aparece de inmediato en el panorama por ciudad, nunca se oculta"). Its `OfflineQueueIndicator` component implies **offline-capable reporting**, which no other app in this set shows.
- Freshness is the weakest observed: the homepage shell was served with `age: 289988` (≈3.4 days) and `/explorar` with `age: 202591` (≈2.3 days). No data timestamp of any kind is exposed.
- Feed-readiness: **L**. Not because the engineering is hard, but because nothing needed to start — identity, licence, contact, documentation, a resolvable data layer — is currently public.

**Inputs:** `src/content/ecosystem-apps/gravitas.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:03:13Z–04:08:46Z.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Gravitas (rendered **GRAVITAS**) |
| URL | https://mapa.gravitasworld.com/ |
| Category (YAML) | `damage` |
| Slug | `gravitas` |
| YAML `order` / `featured` | 60 / `false` |
| YAML tagline (ES/EN) | "Mapeo ciudadano de emergencia" / "Citizen emergency mapping" |
| Page title (observed) | "GRAVITAS — Mapeo Ciudadano de Emergencia" |
| H1 (observed) | "GRAVITAS" |
| Sub-heading (observed) | "Terremoto Colombia · 10 ago 2026" |
| Stated audience (observed) | "Hecho por ciudadanos, para ciudadanos, socorristas y organismos de emergencia" |
| Operator | **Not identified anywhere on the served pages** — no about text, no org name, no contact. `unverified` |
| Domain note | Hosted on the `mapa.` subdomain of `gravitasworld.com`; the apex was not probed (out of scope for this app's public surface) |
| YAML `integrations.publicApi` / `publicMcp` | `unknown` / `unknown` — both confirmed as `unknown` |
| Logo authorization (YAML) | `pending_contact` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Report and consult buildings, collection centers and logistics in real time" | **Confirmed for 3 of 4 categories, and incomplete** | The served homepage lists **four** reportable categories; the YAML omits **Voluntariado** |
| "Real-time report and consult" | **Claimed by the site, not verified** | The homepage renders "Cargando datos en vivo…" as a placeholder; no live data was server-rendered at probe time. `unverified` |
| "Live emergency map" | **Confirmed as a UI claim** | Homepage and `/explorar` present a map surface |
| "Independent civic tool; not operated by Corag" | **Consistent** | No Corag reference found in the served HTML |
| "We did not find public API or MCP documentation on the site" | **Confirmed** | All eight discovery probes 404 |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`. 10 requests to one host.

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://mapa.gravitasworld.com/ | 2026-08-16T04:03:13Z | 200 | text/html; charset=utf-8 | 31 975 |
| https://mapa.gravitasworld.com/robots.txt | 2026-08-16T04:03:14Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/sitemap.xml | 2026-08-16T04:03:16Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/.well-known/ | 2026-08-16T04:03:18Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/api | 2026-08-16T04:03:20Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/api/docs | 2026-08-16T04:03:21Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/openapi.json | 2026-08-16T04:03:23Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/mcp | 2026-08-16T04:03:24Z | **404** | text/html; charset=utf-8 | 13 041 |
| https://mapa.gravitasworld.com/explorar | 2026-08-16T04:08:32Z | 200 | text/html; charset=utf-8 | 13 153 |
| https://mapa.gravitasworld.com/_next/static/chunks/app/page-50dd396d71216c3f.js | 2026-08-16T04:08:46Z | 200 | application/javascript; charset=utf-8 | 5 164 |

`/reportar` and `/login` were **not** fetched: `/reportar` is a submission flow and `/login` is an authentication surface, both outside responsible read-only probing. Their existence is recorded from links in the served HTML.

The homepage returns real 404s with correct status codes — better behaviour than the SPA catch-alls in this category, and it means the absence of `robots.txt` and `sitemap.xml` is a genuine absence rather than a masking artefact.

---

## Observable architecture

- **Hosting:** Vercel (`server: Vercel`, `x-matched-path: /`, `x-vercel-cache: HIT`).
- **Framework:** Next.js App Router — `vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`, `self.__next_f` streaming payload (9 pushes on the homepage), **webpack**-style chunk hashes (`webpack-b58e55f954a75d92.js`, `fd9d1056-2a00d09cb9d99b82.js`), build id `lZyjDiaHAnufAx7Pj9bku`. Note this is webpack, not Turbopack — a different Next.js build configuration from `reporteco` and `terremotocolombia`.
- **Caching / staleness:** `cache-control: public, max-age=0, must-revalidate` with `age: 289988` on the homepage (≈3.36 days) and `age: 202591` on `/explorar` (≈2.34 days). The **rendered shells have been edge-cached since roughly 2026-08-12** — the site's markup has not been regenerated in over three days. Live data, if any, arrives client-side after hydration.
- **Zero external hosts.** The homepage HTML references only `mapa.gravitasworld.com` and `www.w3.org` (SVG namespaces). Fonts are self-hosted `.woff2` under `/_next/static/media/`. There is no CDN, no analytics, no map-tile host, and no API host in the markup. That is unusual and notable: even the map provider is not identifiable from public HTML.
- **Components identifiable in the RSC payload:** `LiveClock`, `FloatingReportButton`, **`OfflineQueueIndicator`**, `FeedbackWidget`, plus `error` and `global-error` boundaries.
- **`OfflineQueueIndicator` is the standout.** A component whose job is to show a queue of pending offline submissions implies **reports can be composed without connectivity and synced later**. In a disaster where a reported 46 % of national base stations were down, that is arguably the single most operationally valuable feature in the whole damage category — and no other app in this set exposes evidence of it.
- **Data layer: not resolvable from public surfaces.** `/explorar` server-renders 267 characters of chrome and no data; the homepage renders "Cargando datos en vivo…" as a placeholder; the fetched page chunk (5 164 bytes) contains no host, no `/api/` path and no data-fetching code. The data client lives in one of the shared chunks, which were not fetched. **Recorded as an analysis limit.** It is not evidence that no backend exists.
- **Roles:** an "Acceso verificadores / admin" link and a `/login` route indicate a **verifier role** distinct from an anonymous reporter — the same two-tier trust model SismoVision implements with professionals, and Reporte CO with volunteer moderators.
- **Design system:** self-hosted variable fonts, `theme-color: #EEF0EA`, Tailwind-style utility classes with named tokens (`bg-accent-water`, `text-cream`) visible in the RSC payload. A deliberately designed product, not a scaffold.
- **Orthography:** the rendered Spanish copy is written **without diacritics** — "logistica", "danada", "categoria", "informacion", "Emergencia medica", "socorristas y organismos". The `<title>` uses a proper em-dash but the body text does not carry tildes or ñ. Cosmetic for them; **substantive for the protocol**, because place and category strings that vary in accentuation will not match across apps. This is a concrete argument for code-based enumerations and DIVIPOLA codes rather than string matching on names.

---

## Entity inventory

### Entity: `Reporte` — four categories

Definitions transcribed from the served homepage (2026-08-16T04:03:13Z); the site's own copy is unaccented and is normalised here for readability.

| # | Category | Definition as published | Maps to |
|---|---|---|---|
| 1 | **Edificio** | "Edificio o estructura colapsada / dañada" | Structural damage |
| 2 | **Centro de acopio** | "Centro de acopio, albergue o puesto de mando" | Collection point / shelter / **command post** |
| 3 | **Logística** | "Logística: vehículos, rutas, carga" | **Transport capacity** |
| 4 | **Voluntariado** | "Voluntariado: persona disponible para ayudar" | **Person offering help** |

Two of these four are entity types that most of the ecosystem does not model:

- **Logística as vehicles, routes and cargo** is a *capacity* entity, not a place or a damage report. Only Gravitas models transport capacity as a first-class mappable thing. The logistics-category apps model *places* to bring things to; this models the *means of moving them*.
- **"Puesto de mando"** (command post) folded into the acopio category is an incident-command concept that appears nowhere else in this set.

**Category 4 is a PII boundary.** "Persona disponible para ayudar" is a person-availability record. Whatever fields it carries, a volunteer offer is personal data. It must be treated the same way as `terremotocolombia`'s volunteer registry: **non-federatable**, regardless of how it is stored. Flagging this explicitly because "volunteer" reads as an operational entity and can slip past a PII review that is looking only for victims and missing persons.

### Reporting flow (as published, homepage)

| Step | Text | Significance |
|---|---|---|
| 01 | "Elige categoria y ubicacion, GPS o escrita a mano" | GPS **or manual** location entry — accepts degraded input, matching the offline posture |
| 02 | "Reportes cercanos del mismo punto se agrupan solos" | **Automatic spatial clustering / deduplication at ingest** |
| 03 | "Aparece de inmediato en el panorama por ciudad, nunca se oculta" | **Immediate publication, explicit no-hiding policy** |

Step 02 is the ecosystem's only observed **automatic deduplication** mechanism, and it addresses the exact problem the protocol exists to solve — one physical place, many reports — except that it solves it *within* one app. The protocol needs the cross-app version of precisely this, and Gravitas's team has already thought about the intra-app version.

Step 03 is a deliberate governance stance and the **direct opposite of Reporte CO's** ("cada reporte es revisado por voluntarios antes de aparecer en el mapa"). Two apps in the same category have taken contradictory positions on pre-publication moderation. The protocol cannot mandate either; it must carry a **moderation-status field** so a consumer knows which kind of record it is holding. That is a concrete schema requirement discovered from this app.

### Entity: aggregate views

- **"Panorama nacional"** — a national roll-up view.
- **"Explorar por ciudad"** — city-level breakdown, reachable at `/explorar`.

City list, per-city counts, and any territorial coding were **not observable** — `/explorar` server-renders no data. `unverified`.

### Freshness signals

| Signal | Value | Source |
|---|---|---|
| Homepage shell `age` | **289 988 s (≈3.36 days)** | headers, 2026-08-16T04:03:13Z |
| `/explorar` shell `age` | **202 591 s (≈2.34 days)** | headers, 2026-08-16T04:08:32Z |
| `x-vercel-cache` | `HIT` on both | headers |
| Per-record timestamps | none observable | — |
| Feed / sitemap `lastmod` | **none — no sitemap** | probe |
| On-page freshness label | none; a `LiveClock` component renders the current time, which is **not** a data-freshness signal | RSC payload |
| Data volume | **not observable** — no counts server-rendered | homepage, `/explorar` |

**This is the crux of the Gravitas problem.** Every other app in the set gives an outside observer *something* — a record count, a timestamp, a `dateModified`, a `lastmod`. Gravitas gives nothing. From outside, it is impossible to tell whether it holds three reports or three thousand, or whether anything has been added since 12 August. A `LiveClock` showing the current time next to a stale shell is, if anything, misleading about freshness.

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **unknown** | `/api`, `/api/docs`, `/openapi.json` all hard-404 (2026-08-16T04:03:20Z–04:03:23Z). No API host appears in the served HTML; the fetched page chunk contains no data-fetching code. A backend certainly exists behind the client — the app accepts and displays reports — but **its address, shape and access policy are not determinable from public surfaces**. `unknown`, not `no` |
| `publicMcp` | **unknown** | `/mcp` hard-404, 2026-08-16T04:03:24Z |
| `robots.txt` | **absent (hard 404)** | 2026-08-16T04:03:14Z |
| `sitemap.xml` | **absent (hard 404)** | 2026-08-16T04:03:16Z |
| `/.well-known/` | **absent (hard 404)** | 2026-08-16T04:03:18Z |
| Structured data | **none** | zero `application/ld+json` blocks in the served HTML |
| Bulk download | **none found** | no export control observed |
| Licence | **none found** | no notice on any served page |
| Source repository | **none found** | no repository link in the served HTML |
| Operator identity | **none found** | no about page, org name or contact in the served HTML |
| Roles | **verifier / admin exists** | "Acceso verificadores / admin" link + `/login` route |

**The honest summary:** GRAVITAS is a well-designed product with an invisible perimeter. Everything an outside integrator needs — who runs it, under what terms, how much data it holds, how fresh it is, where the data lives — is absent from its public surfaces. Nothing here suggests unwillingness; the app is barely a week old and the team has clearly prioritised the field experience (offline queue, manual location entry, immediate publication) over external legibility. That is a defensible priority in week one. It is simply the opposite of federation-ready.

---

## Adoption effort estimate: **L**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed | **S–M** *(engineering, assuming a conventional backend)* | Next.js on Vercel; a route handler is routine work |
| **Overall adoption** | **L** | The engineering is small; everything around it is missing. No published identity, no contact path, no licence, no repository, no documentation, no observable data layer. Adoption cannot begin with a spec — it has to begin with finding out who to talk to |
| Establish operator identity + contact | **prerequisite** | Nothing else can proceed without it |
| Licence decision | **M** | No prior art on the site to build from |
| Freshness metadata | **M** | Nothing is exposed today; per-record timestamps and a feed-level `generatedAt` would both be net-new |
| Territorial coding | **M** | City breakdown exists in the UI; whether DIVIPOLA codes are held is unknown, and the unaccented place strings suggest name-based keys that will need normalisation |
| Volunteer-entity exclusion | **S** | Straightforward, but must be explicit |
| Moderation-status field | **S** | They have a clear policy ("nunca se oculta"); it just needs expressing as data |
| Deduplication metadata | **M** | They already cluster nearby reports; exposing cluster membership would be genuinely valuable to the protocol and is more than a serialization change |

**Blockers:** operator identity and a contact path. This is the only app in the assigned set where the **first task is finding the team**, not designing an integration.

**Counter-note, fairly stated:** effort estimates measure distance from a published feed, not quality. Gravitas's offline queue, manual-location fallback and automatic clustering are among the best field-engineering decisions found anywhere in this analysis. An `L` here means "furthest from publishing", not "least capable".

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| `terremotocolombia` | damage | **All four Gravitas categories map onto its seven types**: Edificio↔Edificios, Centro de acopio↔Acopio, Logística↔(partial), Voluntariado↔volunteer registry | **Highest overlap of any pair in this dossier set.** Gravitas is close to a strict subset of Terremoto Colombia's model, built independently |
| `pereiraresponde` | damage | Edificio↔`housing`; Centro de acopio↔`support/collection`+`support/shelter` | Same entities; Pereira Responde publishes them via a documented API, Gravitas publishes nothing |
| `reporteco` | damage | Edificio↔`damage`; Centro de acopio↔`shelter` + curated "Acopio y hospitales" | Same entities, opposite moderation policies (immediate publication vs pre-publication volunteer review) |
| `sismovision` | damage | Edificio — "estructura colapsada / dañada" | Same observation, far coarser: one category here, an entire specialised product with professional review there |
| `mapadelterremoto` | damage | Damage points, shelters, collection, roads | Gravitas is a city-level producer the national aggregator cannot ingest, because there is nothing published to ingest |
| `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo` | logistics | **Centro de acopio** — collection points, shelters | Duplicates the logistics cluster's core entity. Gravitas adds "puesto de mando", which none of them model |
| `corag`, `pereiraunida`, `sostremoto`, `helpthemdirectly` | matching | **Voluntariado** — people available to help | Overlaps the matching category's supply side. Also the PII-sensitive part of Gravitas's model |
| `encontrados`, `sospereira`, `encuentratumascota` | people / pets | — | **No overlap.** Gravitas models no person-search or pet entity |

**Concrete duplicate-place examples:** every collection point Gravitas holds is, by definition, also a candidate record in `mapadelterremoto`'s 439-entry register, `terremotocolombia`'s acopio layer, `reporteco`'s 33 curated acopio/hospital points, `pereiraresponde`'s `support/collection` records, and the six logistics apps' directories. Because Gravitas exposes no counts, **the size of this duplication cannot be measured** — which is itself the finding: an app that publishes nothing cannot be deduplicated against, so its contribution to ecosystem-wide duplication is unbounded and invisible.

The unaccented place strings compound this. A collection point in "Dosquebradas" (unaccented, as Gravitas writes it) versus one in "Dosquebradas" elsewhere happens to match, but "Quibdó", "Ibagué", "Tuluá" and "Manizales" will not match reliably across apps that differ in accentuation. **Concrete recommendation for Task 2: place matching must key on DIVIPOLA codes or Unicode-normalised, accent-folded names — never on raw display strings.**

---

## Risks & notes

1. **No operator identity or contact path on any served page.** No about section, no organisation name, no email. Anyone wanting to invite this team into the working group must find them out of band. This is the primary adoption blocker.
2. **No licence, no terms, no privacy policy observed.** Reuse terms for anything Gravitas holds are entirely unknown as of 2026-08-16T04:08:32Z.
3. **Stale rendered shells** (3.4 days on the homepage, 2.3 days on `/explorar`). Either the deploy cadence has slowed or the static shells are intentionally long-lived with all dynamism client-side. Either way, an outside observer cannot distinguish "actively maintained" from "abandoned on 12 August" — a genuine risk for anyone considering a dependency.
4. **Data layer opaque.** Recorded honestly as an analysis limit: shared JS chunks were not fetched, so the backend may well be documented in code that was not read. **This should be re-checked before any final capability judgement in `APPS_MATRIX.md`.**
5. **`Voluntariado` is person data.** Volunteer availability records must be excluded from federation. Named explicitly because the category reads operational, not personal.
6. **No moderation before publication** ("nunca se oculta"). Combined with free-text reports, this is a PII-leakage channel: a citizen can type a phone number or a name into a report that publishes instantly with no review. Any feed derived from Gravitas would need field-level scrubbing that does not currently exist. Contrast Reporte CO, which reviews everything first.
7. **Unaccented Spanish throughout the UI.** Cosmetic on its own; a real interoperability hazard once place and category names cross app boundaries. Direct input to the protocol's normalisation rules.
8. **Automatic clustering is undocumented in its behaviour.** "Reportes cercanos del mismo punto se agrupan solos" — the radius, the matching rule and whether clustering is reversible are all unknown. If Gravitas ever publishes a feed, consumers need to know whether a record is one observation or a merged cluster, and clustering is lossy if the merge cannot be inspected.
9. **Offline queue implies eventual, out-of-order arrival.** Reports composed offline and synced later mean `createdAt` and "arrived at the server" can differ by hours. Any protocol freshness or incremental-sync design must tolerate late-arriving records with old timestamps — a requirement discovered only from this app, and one that would silently break a naive `updatedAt > cursor` sync.
10. **Correct 404 handling** is worth crediting: unlike two other apps in this category, Gravitas does not return `200` for paths that do not exist, so its discovery-surface absences are real signals rather than masking artefacts.
11. **Analysis confidence is lower here than for the other five apps in this set.** The dossier rests on two rendered pages, one small JS chunk and response headers. Every capability statement is bounded accordingly, and no absence has been upgraded to a "no".
