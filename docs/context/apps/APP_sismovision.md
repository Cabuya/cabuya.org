# APP_sismovision — SismoVision (Mapa de Grietas)

## TL;DR

- SismoVision is a single-purpose **structural-crack reporting** app: citizens photograph cracks, the app maps them, and a separate professional channel lets verified engineers review reports.
- Architecture is a clean **Vite + React SPA on Vercel** talking to a **separate Django REST backend at `api.sismovision.com/api/v1`**. The backend was not discovered by guessing — it is named in the app's own public JS bundle and confirmed by the server's own URLconf disclosure.
- **No public API documentation, no OpenAPI, no MCP, no `robots.txt`, no `sitemap.xml`** exist on the web host: every unmatched path returns the identical 819-byte SPA shell with `200`, so all eight discovery probes are soft-404s. Integration surface is therefore **`unknown`**, exactly as the YAML records — not "no".
- The backend exposes a conventional REST shape (`/reports/`, `/reports/{id}/images/`, `/reports/{id}/reviews/`, `/reports/{id}/comments/`, `/reports/{id}/available-professionals/`, `/professional/verify/`), which the browser calls without a login. Whether that is *intended* as a public integration surface is unknown; it was not probed for data.
- **Security note for the working group:** `api.sismovision.com` is running Django with **`DEBUG = True` in production** — the 404 page discloses the project name and URLconf (observed 2026-08-16T04:08:01Z). This should be reported to the team before any federation conversation.
- Feed-readiness: **M**. The data and the backend framework make a feed easy; the missing pieces are a decision to publish, a licence, and a route that is not swallowed by the SPA catch-all.

**Inputs:** `src/content/ecosystem-apps/sismovision.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:01:01Z–04:08:01Z.

---

## Identity

| Field | Value |
|-------|-------|
| Name | SismoVision |
| URL | https://sismovision.com/ |
| Category (YAML) | `damage` |
| Slug | `sismovision` |
| YAML `order` / `featured` | 20 / `false` |
| YAML tagline (ES/EN) | "Mapa de grietas" / "Crack map" |
| Page title (observed) | `Mapa de Grietas` |
| Meta description (observed) | "Mapa de grietas: reportes ciudadanos de daño estructural después de un sismo." |
| Favicon (observed) | `/vite.svg` — the unchanged Vite scaffold default |
| YAML `integrations.publicApi` / `publicMcp` | `unknown` / `unknown` |
| Logo authorization (YAML) | `pending_contact` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Citizen reports of structural damage (cracks)" | **Confirmed** | Title + meta description, 2026-08-16T04:01:01Z |
| "Local device report history" | **Confirmed** | Public bundle contains a persisted client store keyed `mapa-grietas/session` holding a `myReports` array of `{id, token, createdAt, municipality}` |
| "Channel for professionals (per the site)" | **Confirmed** | Bundle exposes `/professional/verify/` and `/reports/{id}/available-professionals/`, plus a `professionalCode` session selector |
| "Preliminary guidance only; not a professional inspection" | **Not re-verified** | Disclaimer text was not retrieved from the client-rendered app — `unverified` at probe time |
| "We did not find public API or MCP documentation on the site" | **Confirmed** | All eight discovery probes returned the SPA shell |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`. 9 requests to `sismovision.com`, 1 to `api.sismovision.com`.

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://sismovision.com/ | 2026-08-16T04:01:01Z | 200 | text/html; charset=utf-8 | 819 |
| https://sismovision.com/robots.txt | 2026-08-16T04:01:03Z | 200 | text/html; charset=utf-8 | 819 (SPA shell — soft-404) |
| https://sismovision.com/sitemap.xml | 2026-08-16T04:01:05Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/.well-known/ | 2026-08-16T04:01:06Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/api | 2026-08-16T04:01:08Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/api/docs | 2026-08-16T04:01:09Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/openapi.json | 2026-08-16T04:01:11Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/mcp | 2026-08-16T04:01:13Z | 200 | text/html; charset=utf-8 | 819 (soft-404) |
| https://sismovision.com/assets/index-Cu4bDq8a.js | 2026-08-16T04:07:34Z | 200 | application/javascript; charset=utf-8 | 1 588 551 |
| https://api.sismovision.com/robots.txt | 2026-08-16T04:08:01Z | 404 | text/html; charset=utf-8 | 2535 (Django debug 404) |

**Not probed, deliberately:** `api.sismovision.com/api/v1/*` data collections, `admin/`, and `^media/` were left untouched. With `DEBUG = True` on the origin, minimising interaction was the responsible choice, and the bundle plus the URLconf disclosure already answer the architecture question without pulling data.

---

## Observable architecture

- **Web host:** Vercel (`server: Vercel`, `x-vercel-cache: HIT`, `x-vercel-id: iad1::…`). Edge region `iad1` (US East) — note the app serves Colombian users from a US edge.
- **Frontend:** Vite-built React SPA. Single ES-module entry `/assets/index-Cu4bDq8a.js` (1.59 MB unminified-name-mangled) plus `/assets/index-Hu9FDi3V.css`. `<div id="root">` only; **zero server-rendered content**.
- **Caching:** `cache-control: public, max-age=0, must-revalidate`, `age: 65653` (~18 h), `last-modified: Sat, 15 Aug 2026 09:46:49 GMT`. The shell had not been redeployed for ~18 h at probe time.
- **CORS:** the web host sends `access-control-allow-origin: *` on the HTML shell.
- **Client libraries observed in the bundle:** React + React DOM, **React Router**, **MapLibre GL JS**, a persisted state store (Zustand-style, `localStorage` key `mapa-grietas/session`).
- **Map stack:** **CARTO basemaps** (`basemaps.cartocdn.com`) for tiles and **Nominatim** (`nominatim.openstreetmap.org`) for geocoding. Note this differs from Pereira Responde (raw OSM tiles) and Reporte CO (Mapbox GL) — the ecosystem has no shared basemap convention.
- **Backend:** `https://api.sismovision.com`, base path `/api/v1`, resolved in the bundle by
  `function kt(){let e="https://api.sismovision.com".replace(/\/$/,"");return e?`${e}/api/v1`:"/api/v1"}`.
- **Backend framework: Django** — confirmed, not inferred. The 404 page states *"Using the URLconf defined in `SismoVision.urls`, Django tried these URL patterns, in this order: `admin/`, `api/v1/`, `^media/(?P<path>.*)$`"* and *"You're seeing this error because you have `DEBUG = True` in your Django settings file."* The trailing-slash route style and the client's `fieldErrors` / `429 isThrottled` error class are consistent with **Django REST Framework** (`inferred`).
- **Edge in front of the API:** the debug 404 was served with `content-type: text/html; charset=utf-8`; the API host is reachable directly over HTTPS. Whether a CDN fronts it is `unverified`.
- **Error contract (from the bundle):** a custom `ApiError` carrying `status`, `fieldErrors` (object), `payload`, with helpers `isClientError` (400–499) and `isThrottled` (`status === 429`). Rate limiting is therefore expected and handled client-side.
- **Anonymous ownership pattern:** reports are claimed via an opaque `token` stored client-side alongside the report `id`, and share links are built as `${origin}/reportes/${id}?t=${token}`. This lets a citizen edit or track a report without an account — a privacy-preserving design worth naming in the protocol's "no accounts required" section.

---

## Entity inventory

The UI is entirely client-rendered and was not driven interactively, so field-level detail below is read from the public bundle's route and endpoint shapes rather than from rendered records. Marked accordingly.

### Entity: `Report` (crack / structural damage report)

| Aspect | Observation | Confidence |
|---|---|---|
| Collection endpoint | `GET|POST {base}/reports/` | observed in bundle |
| Item endpoint | `{base}/reports/{id}/` | observed in bundle |
| Public permalink | `/reportes/{id}` and `/reportes/{id}?t={token}` | observed in bundle |
| Known client-held fields | `id`, `token`, `createdAt`, `municipality` | observed in the `mapa-grietas/session` store |
| Photo evidence | `{base}/reports/{id}/images/` — a **sub-resource**, so images are uploaded separately rather than inlined | observed in bundle |
| Severity / crack taxonomy | Not resolvable from the bundle | `unverified` |
| Geometry representation | Not resolvable from the bundle; MapLibre + Nominatim imply lat/lon decimal degrees | `inferred` |

**Key structural difference from Pereira Responde:** SismoVision uploads photos as a **separate sub-resource** (`/reports/{id}/images/`), while Pereira Responde inlines base64 in the create payload. Any protocol evidence model must accommodate both — reference-by-URI is the only shape both can satisfy cheaply.

### Entity: `Review` (professional assessment)

| Aspect | Observation | Confidence |
|---|---|---|
| Endpoint | `{base}/reports/{id}/reviews/` | observed in bundle |
| Availability lookup | `{base}/reports/{id}/available-professionals/` | observed in bundle |
| Verification | `{base}/professional/verify/`, gated by a `professionalCode` in session state | observed in bundle |

This is the **only professional-verification workflow found in the damage category**. It is a genuinely distinct entity: a citizen observation plus an expert opinion attached to it. The protocol needs a place for "assessment by a credentialed party" that is not just another report, and this app is the reason.

### Entity: `Comment`

`{base}/reports/{id}/comments/` — a discussion thread per report (observed in bundle). **Comments are free-text written by members of the public and are a PII hazard by construction.** Any federation must exclude them or treat them as strictly non-federating, the same way people-data is treated.

### Freshness signals

| Signal | Value | Source |
|---|---|---|
| SPA shell `last-modified` | 2026-08-15T09:46:49Z | response headers, 2026-08-16T04:01:01Z |
| Shell `age` at probe | 65 653 s (~18.2 h) | response headers |
| Per-record timestamps | `createdAt` present on client-held records | bundle |
| Public "updated at" label | none found | — |
| Machine-readable freshness | **none** | no feed, no sitemap `lastmod` |

There is no way for an outside consumer to tell how fresh SismoVision's data is without querying its undocumented backend. That is the practical definition of "not yet federated".

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **unknown** | A REST backend demonstrably exists (`api.sismovision.com/api/v1`, named in the public bundle, confirmed by the server's own URLconf at 2026-08-16T04:08:01Z) and is called by anonymous browsers. But there is **no documentation, no OpenAPI, no announcement and no stated terms**, and the endpoints were not probed for data. Publishing intent is undetermined — this is `unknown`, not `no`, and not `yes` |
| `publicMcp` | **unknown** | `GET /mcp` returned the SPA shell (soft-404). No MCP artefact found anywhere on either host |
| `robots.txt` | **absent** | SPA shell returned, 2026-08-16T04:01:03Z; the API host returns a 404 for it |
| `sitemap.xml` | **absent** | SPA shell returned, 2026-08-16T04:01:05Z |
| `/.well-known/` | **absent** | SPA shell returned, 2026-08-16T04:01:06Z |
| Bulk download | **none found** | no export control observed; `unverified` beyond the bundle |
| Licence / reuse terms | **none found** | no licence notice on the host or in headers |
| Source repository | **none found** | one `github.com` reference in the bundle, not resolvable to a project without further probing; `unverified` |

**The important nuance for the working group:** SismoVision is *technically* the easiest kind of app to federate — a real database behind a real REST framework — and *organisationally* the least legible, because nothing about it is published. The gap here is not engineering. It is a decision nobody has been asked to make.

---

## Adoption effort estimate: **M**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed | **S** (engineering) | DRF serializers to JSON is a day's work at most; a management command writing a static file would do it |
| Overall adoption | **M** | The engineering is S; the M comes from everything around it — no published licence, no documented terms, no public contact surface, and a `DEBUG=True` deployment that should be fixed before anything new is exposed |
| Serve the feed at a stable path | **S–M** | The SPA catch-all currently swallows every unmatched path on the web host; the feed would need to live on the API host or on an excluded route |
| Comment / PII exclusion | **S** | Straightforward, but must be explicit: comments and any professional-review free text must not enter a federated feed |
| Crack taxonomy mapping | **M** | The severity vocabulary is not published, so mapping cannot even be designed until the team shares it |
| Professional-review entity | **M–L** | Genuinely novel across the ecosystem; the protocol has no obvious slot for it yet, so this needs design work, not just mapping |

**Blockers:** (1) `DEBUG = True` must be fixed first — it is bad practice to invite integration traffic to an origin leaking its own configuration; (2) no licence; (3) no documented contact path for an integration conversation.

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| `pereiraresponde` | damage | Damaged buildings with photo evidence | **Highest overlap in the ecosystem.** Pereira Responde's `housing` type with `risk: high|medium` and its UI vocabulary ("Grietas en muros, columnas o vigas") is the same observation SismoVision specialises in. One cracked building, two systems, no shared key |
| `gravitas` | damage | "Edificio o estructura colapsada / dañada" | Same entity, coarser taxonomy |
| `reporteco` | damage | `damage` category ("Daños estructurales", 6 records at probe) | Same entity; Reporte CO already publishes it as GeoJSON while SismoVision publishes nothing |
| `terremotocolombia` | damage | `Edificación` — explicitly framed as "registro fotográfico … útil para que ingenieros y autoridades evalúen daños estructurales" | **This is SismoVision's exact product description, inside another app.** Two teams built the same engineer-facing building-photo register independently |
| `mapadelterremoto` | damage | 3 068 damage points nationally, normalised to DIVIPOLA + EDAN | SismoVision is a depth source that the national aggregator cannot currently ingest, because there is nothing to ingest from |
| Logistics cluster (`alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo`) | logistics | — | **No overlap.** SismoVision is the most sharply scoped app in the damage set: it models one thing and nothing else |
| `corag` | matching | — | Complementary. A verified structural assessment is exactly the kind of evidence a matching platform would want to cite |

**Concrete duplicate-place example:** a cracked apartment block in a Pereira barrio can exist as (a) a SismoVision crack report with a professional review attached, (b) a Pereira Responde `housing/high` record, (c) a Gravitas `Edificio`, and (d) a Terremoto Colombia `Edificación`. Only (a) carries an engineer's opinion, and only (a) has no way to publish it. That asymmetry — the richest assessment trapped in the least accessible app — is the clearest single argument in this category for the protocol.

---

## Risks & notes

1. **`DEBUG = True` in production on `api.sismovision.com`.** The 404 page names the Django project (`SismoVision.urls`) and enumerates its top-level URL patterns (`admin/`, `api/v1/`, `^media/`). Django's debug pages can also expose settings and stack traces on unhandled exceptions. This is a real finding, discovered incidentally while fetching `robots.txt`, and it should be passed to the team privately before anything else. No further probing of that host was done. **Severity: high for them, and a precondition for any federation discussion.**
2. **Admin surface on the same host** (`admin/` in the URLconf). Not probed. Its presence alongside a debug-enabled deployment compounds risk 1.
3. **A `media/` route implies user-uploaded files served from the origin.** Crack photos are damage imagery, but user uploads can incidentally contain people, documents or EXIF location. Not probed. The protocol should treat evidence media as reference-only and never mirror it.
4. **Comments are an uncontrolled PII channel.** A free-text comment thread on a disaster report will accumulate phone numbers and addresses. Federating comments would violate the plan's zero-PII rule; the mapping must exclude them explicitly rather than by omission.
5. **No published licence.** Reuse terms for crack reports and professional reviews are **unknown** as of 2026-08-16T04:08:01Z.
6. **No `robots.txt` anywhere.** Neither host serves one (`sismovision.com` soft-404s, `api.sismovision.com` returns a hard 404). The team has expressed no crawler or AI-training preference at all — worth raising, since two other apps in this set have taken explicit and opposite positions.
7. **Vite scaffold defaults still in place** (`/vite.svg` favicon). Cosmetic, but a reasonable proxy for how much time this team has had.
8. **US-East edge for a Colombian audience.** `iad1` on Vercel; combined with a full client-side render and a 1.59 MB bundle, the field experience on degraded mobile networks in an earthquake zone is a real concern. Relevant to the protocol only insofar as it argues for small static feeds over live API calls at the edge of connectivity.
9. **Single point of knowledge.** With no docs, no repo and no licence, everything known about this app comes from reading its bundle. If the team is unavailable, SismoVision cannot be federated at all — which makes it the strongest case for the adoption playbook leading with a human conversation rather than a spec.
10. **The professional-review entity has no home in the current protocol sketch.** Flagging this forward to Task 2: the canonical entity model needs an `Assessment` concept distinct from `Report`, with a credential/verification attribute, or SismoVision's most valuable data has nowhere to go.
