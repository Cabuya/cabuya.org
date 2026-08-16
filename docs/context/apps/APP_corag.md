# APP_corag — Corag Ayuda Directa

**Inputs:** `src/content/ecosystem-apps/corag.yaml` · `PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}` · live probing 2026-08-16T04:00Z–04:03Z.
**Probe agent string used:** `CoragEcosystemAnalysis/1.0 (protocol interop research; +https://corag.app/ecosystem)`.

## TL;DR

- Corag Ayuda Directa is the only app in the assigned set with a **confirmed, documented, unauthenticated public API and a remote MCP server** — verified live, not just claimed in its YAML.
- The contract is materially richer than the YAML advertises: `OpenAPI 3.1`, four view modes (`panorama`, `list`, `detail`, `logistics`), 15-value category enum, idempotency via `source` + `externalId`, and an explicit `publishContact` consent flag.
- It ships a **discovery document at the collection root** (`GET /api/public/v1/help` with no params returns capabilities + active emergencies) — this is the single most reusable design idea in the ecosystem for the protocol.
- Stack is Next.js on Vercel (`server: Vercel`, `x-matched-path`, `x-vercel-cache`), with a CORS-open, `cache-control: no-store` read path.
- Two concrete defects found: `robots.txt` and `sitemap.xml` both 404, and the **version string disagrees across three surfaces** (`1.1` vs `v1.2` vs `1.2.0`).
- Feed-readiness: **S** — a conforming static feed is a serialization of an endpoint that already exists.

## Identity

| Field | Value | Source |
|---|---|---|
| Name | Corag Ayuda Directa | `corag.yaml` |
| Primary URL | `https://ayuda.corag.app` | `corag.yaml` |
| Effective landing | `https://ayuda.corag.app/emergencias/eje-cafetero/puntos-de-ayuda` (307 from `/`) | probe 2026-08-16T04:00:31Z |
| Category (YAML) | `matching` | `corag.yaml` |
| Featured / order | `featured: true`, `order: 0` | `corag.yaml` |
| Logo authorization | `authorized` | `corag.yaml` |
| Operator | Corag (same org as this repo; `corag.app` explains the model, `ayuda.corag.app` runs the operation) | `corag.yaml` `limits`; corag.app/developers/ 2026-08-16T04:02:49Z |
| Human docs | `https://corag.app/developers/` (site) and `https://ayuda.corag.app/integraciones` (app) | probes 2026-08-16T04:02:47Z / 04:02:49Z |

**YAML claims to verify:** `publicApi: yes`, `publicMcp: yes`, `apiDocsUrl`/`openApiUrl` = `https://ayuda.corag.app/api/public/openapi.json`, `mcpUrl` = `https://ayuda.corag.app/mcp`, `developersUrl` = `/developers`. **All five verified true** (see Integration surface). One correction: the machine-readable discovery document points humans at `/integraciones`, not `/developers` — the YAML's `developersUrl` is the marketing-site page, and both exist.

## Probe log

All requests `GET`, one each, no auth, no POST.

| URL | UTC timestamp | Status | Content-Type |
|---|---|---|---|
| `https://ayuda.corag.app/` | 2026-08-16T04:00:31Z | 307 → `/emergencias/eje-cafetero/puntos-de-ayuda` | `text/plain` |
| `https://ayuda.corag.app/robots.txt` | 2026-08-16T04:00:33Z | 404 | `text/html; charset=utf-8` |
| `https://ayuda.corag.app/sitemap.xml` | 2026-08-16T04:00:34Z | 404 | `text/html; charset=utf-8` |
| `https://ayuda.corag.app/.well-known/` | 2026-08-16T04:00:36Z | 308 → `/.well-known` | `text/plain` |
| `https://ayuda.corag.app/api` | 2026-08-16T04:00:37Z | 404 | `text/html; charset=utf-8` |
| `https://ayuda.corag.app/api/docs` | 2026-08-16T04:00:39Z | 404 | `text/html; charset=utf-8` |
| `https://ayuda.corag.app/api/public/openapi.json` | 2026-08-16T04:00:41Z | **200** | `application/json` (11 455 B) |
| `https://ayuda.corag.app/openapi.json` | 2026-08-16T04:00:42Z | 404 | `text/html; charset=utf-8` |
| `https://ayuda.corag.app/mcp` | 2026-08-16T04:00:44Z | **405** (JSON-RPC `-32000 Method not allowed.`) | `application/json` |
| `https://ayuda.corag.app/api/public/v1/help` | 2026-08-16T04:00:46Z | **200** (discovery doc, 845 B) | `application/json` |
| `https://ayuda.corag.app/integraciones` | 2026-08-16T04:02:47Z | 200 (35 682 B) | `text/html; charset=utf-8` |
| `https://corag.app/developers` | 2026-08-16T04:00:48Z | 308 → `/developers/` | — |
| `https://corag.app/developers/` | 2026-08-16T04:02:49Z | 200 (59 435 B) | `text/html; charset=utf-8` |

12 requests to `ayuda.corag.app`, 2 to `corag.app`. No POST was issued to `/mcp` (per instruction, GET status was sufficient).

## Observable architecture

- **Hosting/edge:** `server: Vercel`, `x-vercel-id: iad1::iad1::…`, `x-vercel-cache: HIT|MISS`, `x-matched-path` — Vercel serverless/edge (headers on `/api/public/openapi.json`, 2026-08-16T04:00:41Z).
- **Framework:** Next.js App Router — `inferred` from `x-matched-path` + `x-nextjs-*`-family behaviour on the platform and the `/emergencias/{slug}/{page}` route shape. Not directly asserted by a `generator` meta tag.
- **Preview/origin identity:** the OG image on the live site resolves to `https://corag-ayuda-directa.vercel.app/og.png` (seed `ENRICHED_PROBE.json`) — the Vercel project name leaks through OG metadata. Cosmetic, but it is the only public hint at the repo name.
- **Caching policy split, observed 2026-08-16T04:01:57Z–04:01:59Z:**
  - `/api/public/openapi.json` → `cache-control: public, max-age=300`, `age: 76`, CDN-cached (`x-vercel-cache: HIT`). The contract is cacheable.
  - `/api/public/v1/help` → `cache-control: no-store`, `age: 0`, `x-vercel-cache: MISS`. The data is never cached. **This is a deliberate freshness-over-cost choice and it is the opposite of what a federated feed wants** (see Risks).
- **CORS:** `access-control-allow-origin: *` on both. On the data endpoint additionally `access-control-allow-methods: GET,POST,OPTIONS`, `access-control-allow-headers: Content-Type,Idempotency-Key`, `access-control-max-age: 86400`. Browser-side integration works with no proxy.
- **Version header:** `x-corag-api-version: 1.1` (2026-08-16T04:01:59Z).
- **Transport security:** `strict-transport-security: max-age=63072000` on both endpoints.
- **SEO surface:** `robots.txt` and `sitemap.xml` both 404 (2026-08-16T04:00:33Z/04:00:34Z); the 404 body is the app's HTML shell (12 667 B), i.e. a SPA catch-all rather than a real 404 document.
- **`/.well-known/` :** 308 to the extensionless `/.well-known`, which then falls through to the app shell. There is no `.well-known` discovery convention in place.

## Entity inventory

Derived from `https://ayuda.corag.app/api/public/openapi.json` (OpenAPI 3.1, `info.version: 1.2.0`), retrieved 2026-08-16T04:01:57Z. Field names only; **no record values are reproduced anywhere in this dossier**.

### `Common` (shared publish envelope — POST input)

| Field | Type | Notes |
|---|---|---|
| `source` | string, **required** | "Nombre estable de la integración" — the publishing app's identifier |
| `externalId` | string, **required** | Stable ID in the origin app |
| `emergencySlug` | string | Required when multiple emergencies are active |
| `title` | string, **required** | |
| `description` | string | |
| `category` | enum, **required** | `alimentos, agua, medicamentos, higiene, panales, mascotas, ropa, salud, refugio, transporte, herramientas, voluntariado, acopio, rescate, otro` (15 values) |
| `contactName` | string, **required** | |
| `contactWhatsapp` | string, **required** | |
| `publishContact` | boolean, **required** | Explicit consent that name + WhatsApp may be shown publicly |

### `PublicHelp` (read model — the federation-relevant entity)

`id`, `type` (`request` \| `offer`), `emergency` (object), `title`, `description`, `category`, `urgency`, `status`, `operationalStatus`, `priorityScore` (number), `location` (object), `contact` (object), `quantities` (object \| null), `resources` (array), `verification` (object), `logistics` (object \| null), `collectionCenter` (object \| null), `timeline` (array), `publicUrl`.

### `LogisticsOperation`

`id`, `emergency_slug`, `destination_help_point_id`, `title`, `supply_description`, `quantity_label`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `distance_km`, `route_conditions`, `status`, `created_at`.
Note the **naming inconsistency**: this schema is `snake_case` while `PublicHelp` and `Common` are `camelCase`. Two conventions coexist in one public contract.

### Envelope / meta schemas

- `HelpList`: `generatedAt`, `total`, `returned`, `filters`, `items` — already a well-formed feed envelope with a generation timestamp and a total/returned pair.
- `Panorama`: `generatedAt`, `emergencies`, `counts`, `quantities`, `routes` — an aggregate rollup.
- `Discovery`: `name`, `version`, `public`, `documentation`, `openapi`, `mcp`, `views`, `capabilities`, `emergencies`.
- `PublishResult`: `ok`, `duplicate`, `id`, `type`, `emergencySlug`, `createdAt`, `publicUrl`, `quantity` — `duplicate` is how idempotency is signalled back.
- `Error`: `error`, `code`, `details`.

### Freshness signals

- `HelpList.generatedAt` and `Panorama.generatedAt` — machine-readable generation timestamps (strongest freshness signal in the assigned set).
- `PublicHelp.timeline` (array) — a public event log per record; `LogisticsOperation.created_at`.
- `cache-control: no-store` on the data path — reads are always live.
- Live discovery doc (2026-08-16T04:00:46Z) lists exactly one active emergency: `eje-cafetero` / "Damnificados del Eje Cafetero", `location: Eje Cafetero`, `occurred_on: 2026-08-11`. **Note:** this is one day after the plan's public event anchor of 2026-08-10 — the app dates the emergency record, not the seismic event.

## Integration surface

**publicApi: `yes`** — evidence:

- `https://ayuda.corag.app/api/public/openapi.json` → 200 `application/json`, OpenAPI 3.1, `info.version 1.2.0`, `servers: [https://ayuda.corag.app]` (2026-08-16T04:00:41Z).
- `GET https://ayuda.corag.app/api/public/v1/help` → 200 discovery document declaring `public: true`, `authentication: "none"` (2026-08-16T04:00:46Z).
- Declared views: `panorama` (`?view=panorama`), `list` (`?view=list`), `detail` (`?view=detail&id=HELP_ID`), `logistics` (`/api/logistics-operations?emergencia=eje-cafetero`).
- Declared capabilities: `publish_request_with_quantity`, `publish_offer_with_logistics`, `search_help_with_filters`, `read_coverage_and_timeline`, `read_public_panorama`, `read_available_logistics_operations`.
- Query filters on `GET /api/public/v1/help`: `view, id, emergencySlug, type, status, category, priority, q, latitude, longitude, radiusKm, logistics, capacity, limit` — including geo-radius search, which most of the ecosystem does not offer.
- Write path: `POST /api/public/v1/help` with an `Idempotency-Key` header parameter **in addition to** the `source`+`externalId` body pair. Two idempotency mechanisms coexist; the docs at `/integraciones` (2026-08-16T04:02:47Z) describe only the body-pair one.

**publicMcp: `yes`** — evidence:

- `GET https://ayuda.corag.app/mcp` → 405 with a well-formed JSON-RPC error body `{"jsonrpc":"2.0","error":{"code":-32000,"message":"Method not allowed."},"id":null}` (2026-08-16T04:00:44Z). A JSON-RPC error envelope on GET is positive evidence that an MCP endpoint is mounted there.
- OpenAPI documents `GET /mcp` ("Abrir transporte MCP Streamable HTTP"), `POST /mcp`, `DELETE /mcp` ("Cerrar una sesión MCP").
- **Discrepancy:** the spec advertises `GET /mcp` as the Streamable-HTTP open handshake, but live `GET /mcp` returns 405. Either the transport requires an `Accept: text/event-stream` negotiation the plain GET did not supply, or the spec overstates the GET route. Marked `unverified` which of the two — resolving it requires a POST, which was out of scope for this pass.
- Tools published on `/integraciones` (2026-08-16T04:02:47Z): `listar_emergencias`, `consultar_panorama`, `buscar_ayudas`, `ver_ayuda`, `publicar_solicitud`, `publicar_ofrecimiento` — **six**, whereas `corag.yaml` `tools:` lists only three. The YAML understates the surface.

**Version signalling — three disagreeing sources (all 2026-08-16T04:00–04:02Z):**

| Surface | Value |
|---|---|
| `x-corag-api-version` response header | `1.1` |
| Discovery doc `version` | `v1.2` |
| OpenAPI `info.version` | `1.2.0` |
| `/integraciones` page heading | `Integraciones públicas · v1.1` |

Four surfaces, three distinct strings, and three distinct *formats* (`1.1`, `v1.2`, `1.2.0`). This is exactly the failure mode a protocol version-negotiation rule has to prevent.

**Licensing / terms:** no license notice, no terms-of-use, and no rate-limit statement observed on any probed surface. `unverified` whether reuse terms exist anywhere.

## Adoption effort estimate

**S (small) — for Corag itself, effectively zero-to-trivial.**

Justification:

1. `HelpList` is already a feed envelope: `generatedAt` + `total` + `returned` + `items`. A conforming static JSON feed is a scheduled serialization of `GET /api/public/v1/help?view=list` — no new data model, no new storage.
2. The `Discovery` schema is 80 % of a protocol service-descriptor already (`name`, `version`, `openapi`, `mcp`, `views`, `capabilities`, `emergencies`). Adding a `.well-known` alias is a routing line.
3. The team demonstrably owns the whole stack (Vercel + Next.js), ships OpenAPI, and already thought about idempotency and consent — the conceptual work that usually blocks adoption is done.
4. The one real cost is **naming reconciliation**, not engineering: mapping the 15-value `category` enum and the `status`/`operationalStatus`/`urgency`/`priorityScore` quartet onto whatever the protocol standardizes. That is a mapping table, not a migration.

Because of this, Corag is the natural **reference implementation** and the natural host of the conformance fixtures. The risk is the mirror image: if the protocol is drafted *from* Corag's shapes, other teams will read it as "adopt Corag's schema", which is a governance problem, not a technical one (see Task 5 territory).

## Overlap map

Full ecosystem list read from `src/content/ecosystem-apps/*.yaml` (20 entries).

| Overlap dimension | Apps that collide with Corag | Nature of the overlap |
|---|---|---|
| **Needs/offers matching** (same core entity: a request and an offer) | `pereiraunida`, `sostremoto`, `helpthemdirectly` (all `matching`) | Direct. Corag's `PublicHelp.type ∈ {request, offer}` is the same abstraction as Pereira Unida's Pedir/Ofrecer tabs and SOS Terremoto's board. **`sostremoto` has already resolved its overlap by migrating into Corag** (see `APP_sostremoto.md`). |
| **Collection points / shelters** (`category: acopio`, `refugio`, `collectionCenter` field) | `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `pereiravive`, `unidosporpereira`, `gogo` (all `logistics`) | High. Corag models a collection centre as an attribute of a help record; the logistics apps model it as a first-class place. **This is the ecosystem's canonical duplicate-entity problem** — a "shared place registry" (ladder rung 3) is the fix, and Corag's `destination_help_point_id` shows it already has internal place IDs. |
| **Logistics / transport** (`LogisticsOperation`, `category: transporte`) | `alluda` (transportista signup, per seed), `gogo`, `pereiravive` | Medium. Corag is the only one of the four assigned apps with a modelled route (origin, destination, distance, conditions). |
| **Geography** — Eje Cafetero / Pereira / Dosquebradas | `pereiraunida`, `pereiraayuda`, `pereiravive`, `unidosporpereira`, `sospereira`, `pereiraresponde`, `gogo`, `alluda`, `sismovision` | Very high. Corag's single active emergency `eje-cafetero` is the same territory nine other apps cover. |
| **Damage reports** | `mapadelterremoto`, `reporteco`, `sismovision`, `gravitas`, `terremotocolombia`, `pereiraresponde` | Low/none. Corag exposes no damage entity — a clean seam: damage apps feed *into* need-matching, they do not duplicate it. |
| **People / missing persons** | `encontrados`, `sospereira` | **None by design, and must stay none.** Corag's contract explicitly keeps documentary identity private ("La identidad documental del solicitante no forma parte del contrato público", OpenAPI `info.description`, 2026-08-16T04:01:57Z). This is the strongest existing precedent in the ecosystem for the "people-data never federates" rule. |
| **Pets** | `encuentratumascota` | Partial: Corag has `category: mascotas` (pet *supplies/needs*), which is a different entity from a lost-pet classified. A naming collision worth calling out in the protocol enum. |

**Concrete duplicate-place candidate:** Corag's `collectionCenter` / `destination_help_point_id` and the acopio listings of `alluda`, `pereiraayuda`, `unidosporpereira` and `pereiravive` all describe collection points in Pereira/Dosquebradas. Cross-app identity resolution for these is `unverified` at record level (not probed — would require reading individual records) but is structurally certain at entity level.

## Risks & notes

1. **`cache-control: no-store` on the read path conflicts with feed federation.** A federated consumer polling an uncacheable endpoint pushes cost onto the publisher — the classic reason a publisher later adds an API key and kills the federation. The protocol should mandate a cacheable, ETag'd feed artifact separate from the live query endpoint. Corag already proves it can cache (`max-age=300` on the OpenAPI doc).
2. **Version signalling is incoherent** (`1.1` / `v1.2` / `1.2.0` across four surfaces). If the reference implementation cannot agree with itself, the protocol needs one normative version field and one format, stated once.
3. **Two idempotency mechanisms.** `Idempotency-Key` header *and* `source`+`externalId`. Undocumented precedence. A protocol must pick one and say what happens when both are present and disagree.
4. **Mixed casing in one contract** (`camelCase` in `PublicHelp`, `snake_case` in `LogisticsOperation`). Trivial to fix now, expensive after adoption.
5. **`robots.txt` 404 and `sitemap.xml` 404** on the live operational app. Beyond SEO, a 404 `robots.txt` means the app publishes no crawl policy at all — and the protocol's "no scraping" principle is much easier to enforce when every participant states its policy in a file.
6. **No `.well-known` discovery.** `/.well-known/` 308s into the app shell. The discovery document exists but lives at an app-specific path (`/api/public/v1/help`), which a cross-app crawler cannot guess. A `/.well-known/aid-protocol.json` convention is the obvious ask.
7. **Consent is modelled but the public contract still carries contact data.** `publishContact` is a genuinely good design — explicit, required, boolean. But `PublicHelp.contact` is still in the read model, so any conforming mirror of Corag data becomes a redistributor of consented-but-personal contact details. The protocol must decide whether `contact` federates at all or is fetch-on-demand from origin. Recommendation for Task 4: **contact never travels in the feed; the feed carries `publicUrl` and the consumer links out.**
8. **`priorityScore` is a computed, app-specific number.** Federating a score computed by someone else's undocumented algorithm is a data-quality trap. Either the formula is normative or the field is origin-local and non-federating.
9. **No license, no terms, no documented rate limits** observed. For a network that expects other apps to consume it, absence of a reuse licence is itself an adoption blocker — a consumer's legal review has nothing to point at.
10. **Governance note (not a technical risk):** Corag is both a participant and the operator of this analysis. Every place where Corag's shapes become protocol shapes must be justified on merit in the RFC, or the other 19 teams will correctly read the spec as capture.
11. **Not probed, deliberately:** no `POST` to `/mcp` or `/api/public/v1/help` (would create records); no individual help record was opened; no reading of `?view=list` data. All entity knowledge in this dossier comes from the OpenAPI schema and the discovery document, both of which are pure metadata.
