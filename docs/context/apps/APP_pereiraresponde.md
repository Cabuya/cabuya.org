# APP_pereiraresponde — Pereira Responde

## TL;DR

- Pereira Responde is the **most integration-ready app in the damage category and, on this evidence, in the whole ecosystem**: an OpenAPI 3.1 specification is served at `https://pereiraresponde.co/api/public/openapi.json`, rendered through Swagger UI at `/api/docs`, with a working reference client at `/developers/example/`.
- **The baseline YAML understates it.** `integrations.publicMcp` is recorded as `unknown`; the live spec declares a `POST /mcp` operation under an `MCP` tag with JSON-RPC 2.0 methods `initialize`, `tools/list`, `tools/call` and three named tools. `publicMcp` should be **`yes`** (verified 2026-08-16T04:01:55Z).
- Public read is genuinely open: `GET /api/public/v1/reports` returned 100 live records over CORS `Access-Control-Allow-Origin: *` with no key (2026-08-16T04:02:17Z). Writes require a per-integration Bearer API key issued by an administrator, rate-limited to 5 reports/minute.
- The data model is small and clean — 3 report types (`housing`, `road`, `support`), 4 risk levels, `[lat, lon]` coords, ISO-8601 `createdAt`, 1–3 photos — and the spec explicitly states no identity, IP, individual vote or hidden report is exposed.
- Freshness is excellent: newest record in the sample was **2026-08-15T21:48:26Z**, roughly six hours before the probe; oldest of the 100 was 2026-08-14T17:46:02Z.
- Feed-readiness: **S**. They already emit conformant JSON over CORS; a protocol feed is a field-mapping exercise, not an engineering project.

**Inputs:** `src/content/ecosystem-apps/pereiraresponde.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:00:47Z–04:02:17Z.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Pereira Responde |
| URL | https://pereiraresponde.co/ |
| Category (YAML) | `damage` |
| Slug | `pereiraresponde` |
| YAML `order` / `featured` | 10 / `false` |
| YAML tagline (ES/EN) | "Infraestructura en el mapa" / "Infrastructure on the map" |
| YAML `apiDocsUrl` | https://pereiraresponde.co/api/docs |
| YAML `integrations.publicApi` | `yes` |
| YAML `integrations.publicMcp` | `unknown` — **contradicted by evidence, see Integration surface** |
| YAML `developersUrl` | https://pereiraresponde.co/developers/example/ |
| Declared coverage | Pereira (infrastructure + nearby support points) |
| Page title (observed) | `Pereira Responde` |
| Site H1 (observed) | `¿Qué necesitas ver?` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Documented public API at /api/docs" | **Confirmed** | 200 + Swagger UI shell, 2026-08-16T04:00:49Z |
| "Developer example at /developers/example/" | **Confirmed** | 200, live client with API-base/type/date/geo/limit inputs, 2026-08-16T04:00:50Z |
| "Up to three photos per record" | **Confirmed** | `CreateReport.photos` `minItems: 1, maxItems: 3`; sample distribution 82×1, 11×2, 7×3 |
| "Shortcuts to nearby collection and shelter points" | **Confirmed** | UI controls "⌂ Acopio cercano" / "▱ Refugio cercano" in the served shell |
| "Data download" | **Confirmed (UI)** | "⇩ Descargar datos" control present in the served shell; the download's file format was not exercised — `unverified` |
| "We did not find an announced public MCP server" | **Superseded** | `POST /mcp` is documented in their own OpenAPI spec under the `MCP` tag |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`.

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://pereiraresponde.co/ | 2026-08-16T04:00:47Z | 200 | text/html | 8413 |
| https://pereiraresponde.co/api/docs | 2026-08-16T04:00:49Z | 200 | text/html; charset=utf-8 | 609 |
| https://pereiraresponde.co/developers/example/ | 2026-08-16T04:00:50Z | 200 | text/html | 1556 |
| https://pereiraresponde.co/robots.txt | 2026-08-16T04:00:51Z | 200 | text/html | 8413 (SPA shell — soft-404) |
| https://pereiraresponde.co/sitemap.xml | 2026-08-16T04:00:53Z | 200 | text/html | 8413 (SPA shell — soft-404) |
| https://pereiraresponde.co/.well-known/ | 2026-08-16T04:00:55Z | 200 | text/html | 8413 (SPA shell — soft-404) |
| https://pereiraresponde.co/api | 2026-08-16T04:00:56Z | 301 → TLS error | — | 0 (see note) |
| https://pereiraresponde.co/openapi.json | 2026-08-16T04:00:58Z | 200 | text/html | 8413 (SPA shell — soft-404) |
| https://pereiraresponde.co/mcp | 2026-08-16T04:00:59Z | **405** | text/plain; charset=utf-8 | 18 (`Method Not Allowed`) |
| https://pereiraresponde.co/api/docs/init.js?v=3 | 2026-08-16T04:01:46Z | 200 | application/javascript; charset=utf-8 | 87 |
| https://pereiraresponde.co/api/public/openapi.json | 2026-08-16T04:01:55Z | 200 | application/json; charset=utf-8 | 8348 |
| https://pereiraresponde.co/api/public/v1/reports?limit=100 | 2026-08-16T04:02:17Z | 200 | application/json; charset=utf-8 | 32369 |

12 requests to one host — three above the ~10 guideline. The three extra (`init.js`, `openapi.json`, one `reports` read) are all documented public surfaces reached by following the site's own published documentation chain, and were needed to describe the API as this task requires. No authenticated endpoint, admin route, or write operation was touched.

**Note on `/api`:** the server answered `301` with a `Location` pointing at `https://pereiraresponde.co:8080/api/`. Port 8080 does not speak TLS, so the follow-up failed with `curl (35) wrong version number`. This is a reverse-proxy misconfiguration that leaks the origin's internal port into a public redirect. Flagged under Risks.

---

## Observable architecture

- **Edge / hosting:** Cloudflare (`server: cloudflare`, `cf-ray: …-BOG`, `cf-cache-status: DYNAMIC`, NEL reporting configured). The `-BOG` colo suffix indicates Bogotá edge termination.
- **Origin:** Node.js — `etag: W/"12-UGJMK66P4abaBlq0vKHJaCKuGCA"` on `/mcp` is Express/Node weak-ETag formatting (`inferred`, high confidence). The `/api` → `:8080` redirect points at a Node service behind a proxy (`inferred`).
- **Frontend:** single-page application. Every unmatched path returns the identical 8413-byte `index.html`, so `robots.txt`, `sitemap.xml`, `openapi.json` and `/.well-known/` are **soft-404s, not real resources**. Consequence: automated crawlers get an HTML shell where they expect text/XML — a real discoverability defect for an app that otherwise does integration well.
- **Docs layer:** Swagger UI 5.32.13 loaded from `unpkg.com` with SRI hashes; `/api/docs/init.js` is an 87-byte bootstrap pointing Swagger at `/api/public/openapi.json`.
- **Security posture (observed response headers):** `strict-transport-security: max-age=31536000; includeSubDomains`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: geolocation=(self), camera=(), microphone=()`, and a tight CSP: `default-src 'self'; script-src 'self' https://unpkg.com; … img-src 'self' data: blob: https://unpkg.com https://*.tile.openstreetmap.org; connect-src 'self' https://corag-ayuda-directa.vercel.app; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`. This is the strongest header posture observed in the damage category.
- **Map tiles:** OpenStreetMap raster tiles (`https://*.tile.openstreetmap.org` allow-listed in CSP).
- **Cross-app link, observed:** the CSP `connect-src` allow-lists `https://corag-ayuda-directa.vercel.app` — i.e. the app's own browser code is permitted to call a Corag-branded deployment. This is the only machine-observable app-to-app wiring found anywhere in this category. What that connection carries is `unverified`.
- **Caching:** API and MCP responses send `cache-control: no-store`; the SPA shell is served `DYNAMIC` through Cloudflare.

---

## Entity inventory

### Entity: `Report` (single entity — the app has exactly one)

Schema taken verbatim from `components.schemas.Report` in the live OpenAPI document (2026-08-16T04:01:55Z).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Numeric string (`"181"`, `"82"` in sample) |
| `type` | enum | yes | `housing` \| `road` \| `support` |
| `category` | string \| null | no | Only meaningful for `type=support`: `hospital`, `shelter`, `collection`, `store`, `pharmacy`, `veterinary`, `supplies` |
| `risk` | enum | yes | `high` \| `medium` \| `road` \| `support` — `housing` takes `high`/`medium`; `road` takes `road`; `support` takes `support` |
| `title` | string | yes | 1–200 chars, free text |
| `area` | string | yes | Neighbourhood-level label |
| `coords` | number[2] | yes | `[latitude, longitude]`, WGS-84, lat ∈ [-90,90], lon ∈ [-180,180] |
| `createdAt` | string(date-time) | yes | ISO 8601 with milliseconds and `Z` |
| `photos` | uri[] | yes | 1–3 URIs, served from `/api/photos/{n}` on the same origin |
| `score` | integer | yes | Vote balance |
| `votes` | integer | yes | Total votes |
| `userVote` | -1\|0\|1 | no | Visitor's own vote; documented as "normally 0 for integrations" |
| `note` | string \| null | write-only | ≤1000 chars on `CreateReport`; not present in the read schema |

**Observed distribution** in the 100 most recent records (2026-08-16T04:02:17Z) — reported as aggregates only; no individual record content is reproduced anywhere in this dossier:

- `type`: `housing` 93, `road` 6, `support` 1
- `risk`: `high` 60, `medium` 33, `road` 6, `support` 1
- `category`: `null` 99, `shelter` 1
- photos per record: one 82, two 11, three 7
- distinct `area` values: 14
- `score`/`votes`: 0 on the sampled record — voting is present in the model but sparsely used (`unverified` beyond the sample)

**Freshness signals**

| Signal | Value | Source |
|---|---|---|
| Newest `createdAt` in sample | 2026-08-15T21:48:26.579Z | `GET /api/public/v1/reports?limit=100`, 2026-08-16T04:02:17Z |
| Oldest `createdAt` in sample | 2026-08-14T17:46:02.499Z | same |
| Implied ingest rate | ~100 records / ~28 h in the sampled window | derived |
| UI freshness label | `ACTUALIZADO AHORA` badge in the served shell | 2026-08-16T04:00:47Z |
| Cache directive | `cache-control: no-store` on API responses | response headers |
| Server-side filters exposed to users | `Recientes`, `Nuevo <24 h`, `Histórico`, `Zonas rojas`, `Riesgo alto` | served shell |

**Damage vocabulary in the UI** (richer than the API's `risk` enum, and currently collapsed into free-text `title`): *Grietas en muros, columnas o vigas* · *Desprendimiento de fachada o techo* · *Inclinación, hundimiento o colapso parcial* · *Colapso total* · *Daño menor visible*. This five-level structural scale is a direct input for the protocol's damage vocabulary and should not be lost in mapping.

**PII posture:** the spec's own `info.description` states the API returns only visible reports and exposes no identity, IP, individual vote, hidden report or administration. The observed field set contains no personal data. Photos are damage imagery served from the origin.

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **yes** | OpenAPI 3.1.0 document at `/api/public/openapi.json`, 200 application/json, 2026-08-16T04:01:55Z; Swagger UI at `/api/docs`; live 200 read at 2026-08-16T04:02:17Z |
| `publicMcp` | **yes** | `POST /mcp` documented in the same spec under tag `MCP`; `GET /mcp` → 405 with `access-control-allow-headers: Authorization, Content-Type, MCP-Protocol-Version` and `access-control-allow-methods: GET, POST, OPTIONS`, 2026-08-16T04:00:59Z |
| Bulk download | **yes (UI), format unverified** | "⇩ Descargar datos" control in the served shell; output format not exercised |
| `robots.txt` / `sitemap.xml` | **no real resource** | Both return the SPA shell (soft-404) |
| `/.well-known/` | **no real resource** | SPA shell (soft-404) |

### The REST API in detail

**Base:** `https://pereiraresponde.co` (single `servers` entry, described `Producción`). **Spec version:** OpenAPI **3.1.0**. **API version:** `v1`. **Contact:** organization-level only (`Pereira Responde`, https://pereiraresponde.co).

**Tags:** `Reportes` (public read) · `Escritura` (authenticated create) · `MCP` (agent access).

**1. `GET /api/public/v1/reports` — list visible reports** (public, no auth)

| Param | In | Type | Constraints | Purpose |
|---|---|---|---|---|
| `type` | query | string | `housing` \| `road` \| `support` | Report class |
| `limit` | query | integer | 1–500, default 100 | Page size |
| `from` | query | string | ISO 8601 | Inclusive period start |
| `to` | query | string | ISO 8601 | Inclusive period end |
| `latitude` | query | number | requires `longitude` + `radiusMeters` | Search centre |
| `longitude` | query | number | requires `latitude` + `radiusMeters` | Search centre |
| `radiusMeters` | query | integer | 1–100000 | Radius |

Responses `200` (object with a `reports` array — confirmed against the live response) and `400`. Observed default ordering is newest-first (`id` 181 → 82 across the returned page). **There is no cursor, `offset`, `page` or `Link` header** — pagination beyond `limit=500` is not expressible. For a full-history consumer this is the single biggest gap; the documented workaround is windowing with `from`/`to`.

**2. `POST /api/public/v1/reports` — create a report** (server-to-server, Bearer API key)

- `security: bearerAuth` (`http`/`bearer`, `bearerFormat: API key`).
- Body `CreateReport`: required `type`, `risk`, `title`, `coords`, `photos`; optional `category` (mandatory only for `support`, must be absent/`null` otherwise), `note` (≤1000).
- Photos are inlined as `{contentType: image/jpeg|png|webp, data: <base64, no data: prefix>}`, **max 30 MB decoded**, 1–3 per report.
- Responses: `201`, `400` (payload or type/risk combination invalid), `401` (+ `WWW-Authenticate: Bearer`), `413`, `429` (publication limit or moderation suspension), `502` (evidence could not be stored).
- Stated policy: keys are issued per authorized integration by the administrator, shown once, revocable, and each key carries its own **5 reports/minute** limit. The spec explicitly warns never to ship the key in browser JavaScript.

**3. `GET /api/public/v1/reports/{id}`** — single visible report by integer `id`; `200` / `404`.

**4. `POST /mcp` — MCP server.** JSON-RPC 2.0. Documented methods `initialize`, `tools/list`, `tools/call`. Tools: **`listar_reportes`** and **`consultar_reporte`** are public; **`crear_reporte`** requires the administrative API key in `Authorization: Bearer <API_KEY>` and reuses the `POST /api/public/v1/reports` payload. Tool errors are signalled with `result.isError`. The spec's own example calls `listar_reportes` with `{latitude, longitude, radiusMeters}`.

*No JSON-RPC handshake was performed.* The verdict rests on the published specification plus the `MCP-Protocol-Version` CORS advertisement, which together are conclusive without sending a request the probing rules do not cover.

### What this means for the protocol

Pereira Responde is the ecosystem's **existence proof** that a volunteer team under emergency time pressure can ship OpenAPI 3.1 + a reference client + an MCP server. Three design lessons transfer directly:

1. **Read public, write keyed.** Separating an unauthenticated read surface from a per-integration keyed write surface with independent rate limits is exactly the shape the protocol needs, and it is already implemented here.
2. **Ship the example client with the spec.** `/developers/example/` is a working consumer whose "API base" field is an editable input — it is, in effect, a conformance harness that any other app could point at itself. The protocol's developer portal should copy this pattern.
3. **One MCP endpoint, tools named in Spanish, mirroring the REST verbs.** Tool naming will need a protocol-level convention; note this team chose Spanish tool names, which argues for the registry carrying tool metadata rather than assuming English identifiers.

---

## Adoption effort estimate: **S**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed | **S** | The data already serializes to JSON over CORS `*`; a feed is a rename-and-reshape over an existing query |
| Field mapping to a canonical model | **S** | 12 read fields, 3 types, 4 risk levels, ISO-8601 timestamps, decimal degrees — no bespoke encodings |
| Add `robots.txt` / `sitemap.xml` / `/.well-known/` discovery | **S** | Needs one server-side route exclusion so these stop hitting the SPA catch-all |
| Add pagination for full-history sync | **M** | Requires a cursor or `updatedAt` ordering that does not exist today |
| MCP conformance to a protocol tool contract | **S–M** | Server exists; only the tool contract would need alignment |

**Blockers:** none technical. The only structural gap is pagination/incremental sync.

**Highest-value single change:** add an `updatedAt` field plus a cursor. Everything else the protocol wants is already there.

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| `sismovision` | damage | Structural damage to buildings, citizen photo evidence | **Near-total entity overlap.** Both collect geolocated cracked/damaged-building reports with photos. Pereira Responde's `housing` + `risk` maps onto SismoVision's crack reports; the same physical building can be reported in both with no shared identifier |
| `mapadelterremoto` | damage | Damage points, shelters, collection points; Pereira is one of its 432 municipality pages | Pereira Responde is the deeper, first-party Pereira source; Mapa del terremoto is the national aggregator that would ideally *consume* it |
| `gravitas` | damage | "Edificio o estructura colapsada / dañada" + "Centro de acopio" | Direct duplicate of both `housing` and `support/collection` |
| `reporteco` | damage | `Daños estructurales` category + shelter/water/food; Pereira is one of its 14 city pages | Same entity classes, different taxonomy granularity (11 categories vs 3 types) |
| `terremotocolombia` | damage | `Edificación` report type, `Acopio`, hospital directory | Overlaps on buildings and collection points |
| `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo` | logistics | `type=support` with `category` ∈ {`shelter`, `collection`, `hospital`, `pharmacy`, `supplies`} | **The heaviest duplication in the ecosystem.** Six logistics apps plus this one all carry Pereira collection points and shelters. `support` is only 1 of 100 sampled records here, so Pereira Responde is a *thin* holder of an entity six other apps hold thickly — a strong argument for a shared place registry rather than seven independent copies |
| `corag` | matching | Evidence-backed aid delivery in Pereira | Complementary, not duplicative: Corag models the *delivery*, Pereira Responde the *damage*. The observed CSP `connect-src` allow-listing of `corag-ayuda-directa.vercel.app` suggests some wiring already exists |

**Concrete duplicate-place risk:** a single collapsed building in a Pereira barrio can plausibly exist simultaneously as a `housing/high` record here, a crack report in SismoVision, an `Edificio` in Gravitas, a `damage` feature in Reporte CO, an `Edificación` in Terremoto Colombia, and a damage point inside Mapa del terremoto's Pereira municipality page — six records, six identifier spaces, zero reconciliation. The protocol's deduplication story has to work at the *place* level, and Pereira is the densest place to test it.

---

## Risks & notes

1. **Open redirect to an internal port.** `GET /api` returns `301` to `https://pereiraresponde.co:8080/api/`, which does not speak TLS. The origin's internal port is disclosed in a public redirect, and any client following it fails with a TLS error rather than a clean 404. Worth reporting to the team; low severity, trivially fixable.
2. **SPA catch-all defeats machine discovery.** `robots.txt`, `sitemap.xml`, `/openapi.json` and `/.well-known/` all return HTML with `200`. A crawler or agent probing conventional discovery paths gets a false positive, not a 404. If the protocol adopts a `/.well-known/` descriptor, this app must exclude that path from the catch-all first.
3. **No pagination cursor.** `limit` maxes at 500 with no offset or cursor. Full-history sync is only possible by windowing `from`/`to`, which is fragile if records are backdated or edited.
4. **No `updatedAt`.** Only `createdAt` exists, so a consumer cannot detect edits, moderation changes or a report becoming hidden. Records that disappear from the visible set are invisible as deletions.
5. **Write path is administrator-gated by design.** Keys are hand-issued. That is good governance, but it means the protocol cannot assume programmatic onboarding for writes — the human step is deliberate and should be respected in the adoption playbook.
6. **Moderation and voting are load-bearing but undocumented.** `score`, `votes`, `429 (moderation suspension)` and the "visible reports only" language imply a moderation state machine whose rules are not published. A federating consumer inherits moderation decisions it cannot inspect. `unverified`.
7. **No license statement found** on the site, in the spec, or in response headers as of 2026-08-16T04:02:17Z. Reuse terms for the published reports are **unknown**. This is the single most important open question for the working group, and it is a contrast with `mapadelterremoto`, which declares CC BY 4.0.
8. **Photo hosting is same-origin and unversioned** (`/api/photos/{n}`). A federated consumer that hot-links evidence photos creates load on the origin and inherits any future re-numbering. The protocol should prefer referencing over mirroring, and say so.
9. **Geographic scope is narrow by design** (Pereira). Depth over breadth — the opposite trade-off from `mapadelterremoto`. Both shapes must be first-class in the protocol.
10. **Language.** Spanish-only UI, spec descriptions and MCP tool names. Any protocol vocabulary must be bilingual or code-based, never English-word-based, or this team pays a translation tax to conform.
