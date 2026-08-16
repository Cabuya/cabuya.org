# APP_aquiayuda — AquíAyuda

## TL;DR

- AquíAyuda is not a data source. It is a **client-side federation hub**: a React SPA that, in the
  browser, queries three other teams' Supabase projects and two other teams' public REST APIs and
  renders the union as one product. Evidence: its shipped JS bundle, read 2026-08-16T04:01:28Z.
- The bundle contains a **hand-rolled source registry** — five adapters, each declaring
  `{id, nombre, tipo, descripcion, quienPublica, url, capacidades[]}` plus `leer`/`escribir` method
  maps — and a capability resolver that picks a source by capability string. This is a working
  proto-protocol already in production, and it is the single most valuable prior art in the ecosystem.
- Its integration cost is paid the hardest way possible: three foreign database schemas hard-coded
  column-by-column, three foreign publishable keys embedded in its bundle, two bespoke REST clients,
  and five per-source error namespaces (`AP`, `PU`, `PR`, `VI`, plus Corag). Every upstream schema
  change breaks it silently.
- Public integration surface of AquíAyuda **itself**: `publicApi: no` / `publicMcp: no` — every probed
  path returns the same 3 977-byte SPA shell (`/robots.txt`, `/sitemap.xml`, `/openapi.json`, `/mcp`
  included). It consumes; it does not publish.
- Adoption effort: **S**. It already speaks a capability vocabulary and an `externalId` + source
  convention. Replacing five adapters with one protocol client is a deletion, not a build.

Inputs: `src/content/ecosystem-apps/aquiayuda.yaml`; live probes of `www.aquiayuda.com`
(2026-08-16T04:00:52Z – 04:01:28Z).

## Identity

| Field | Value |
|-------|-------|
| Name | AquíAyuda |
| URL | https://www.aquiayuda.com/ |
| Category | logistics (per YAML) — functionally an **aggregator/portal** |
| Aliases | none declared; none observed |
| YAML claims | Centralizes post-quake aid info; collection centers by municipality; proximity map; "reunites data from Ayudas Pereira, Corag, Pereira Responde and Pereira Unida"; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed and materially extended.** The aggregation claim is true and mechanised. The source list is incomplete: a fifth source, `encuentraloaunclic.com`, is wired in and not named in the YAML. `publicApi`/`publicMcp` should move from `unknown` to `no` — every candidate path is served by the SPA catch-all |
| Declared app identity | `x-application-name: aquiayuda-web` sent on every Supabase request (bundle, 04:01:28Z) |

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://www.aquiayuda.com/ | 2026-08-16T04:00:52Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/robots.txt | 2026-08-16T04:00:53Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/sitemap.xml | 2026-08-16T04:00:54Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/.well-known/ | 2026-08-16T04:00:56Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/api | 2026-08-16T04:00:57Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/api/docs | 2026-08-16T04:00:59Z | 404 | text/plain; charset=utf-8 | 79 |
| https://www.aquiayuda.com/openapi.json | 2026-08-16T04:01:00Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/mcp | 2026-08-16T04:01:01Z | 200 | text/html; charset=utf-8 | 3977 |
| https://www.aquiayuda.com/ (response headers) | 2026-08-16T04:01:09Z | 200 | text/html | — |
| https://www.aquiayuda.com/assets/index-C-l10jxD.js | 2026-08-16T04:01:28Z | 200 | application/javascript | 343140 |

Ten requests, all public, all GET, no authenticated area touched. `robots.txt` and `sitemap.xml`
returning the SPA shell means **neither file exists** — the host has no crawl policy and no sitemap.

## Observable architecture

- **Hosting:** Vercel (`server: Vercel`, `x-vercel-cache: HIT`, `x-vercel-id: iad1::…`), observed
  2026-08-16T04:01:09Z.
- **Build:** Vite + React SPA. Entry `<script type="module" src="/assets/index-C-l10jxD.js">` with
  `modulepreload` of `react-*.js` and `supabase-*.js` chunks; body is a bare `<div id="root">`.
  Language declared `lang="es-CO"`.
- **Routing:** client-side only. The SPA route table extracted from the bundle:
  `/`, `/acerca`, `/afectaciones`, `/ayuda-directa`, `/centro/:id`, `/ciudad/:slug`, `/ciudades`,
  `/como-ayudar`, `/danos`, `/estado`, `/inventario`, `/manos`, `/mapa`, `/que-falta`,
  `/quiero-ayudar`, `/vivienda`.
- **Catch-all behaviour:** every unknown path returns the shell with HTTP 200. Only `/api/*` is
  handled by a different layer — `/api/docs` returned `404 text/plain "NOT_FOUND"` (Vercel's function
  router), while `/api` itself fell through to the shell. `inferred`: there is a Vercel routing rule
  for `/api/*`, but no function is deployed behind it.
- **Headers:** `access-control-allow-origin: *`, `x-content-type-options: nosniff`,
  `x-frame-options: SAMEORIGIN`, `strict-transport-security: max-age=63072000`,
  `cache-control: public, max-age=0, must-revalidate`.
- **Zero server-side data.** Nothing an HTTP client, a crawler, or an agent fetches from this host
  contains a single aid record. All content materialises after JS execution against foreign backends.
- **Client-side data layer:** TanStack-Query-style hooks with per-source `staleTime`
  (60 s for lists, 120 s for the Corag "panorama" view, 600 s for Corag emergencies) and
  `refetchOnWindowFocus: false`. Retry policy is capped at 2 and driven by a
  `reintentable` flag on the app's own error type.

## The source registry (primary finding)

The bundle defines five adapter objects collected into one array and resolved by capability:

```
qi(cap) = sources.filter(s => s.descripcion.capacidades.includes(cap))
_e(cap) = qi(cap)[0] ?? null          // first source that can do it
je(what)  → throws "Ahora mismo no hay ninguna fuente de {what}." (code APP-SRC0)
```

Each adapter carries a human-readable descriptor and a machine-readable capability list:

| `id` | `nombre` | `tipo` | `url` | Transport | Capabilities declared |
|------|----------|--------|-------|-----------|----------------------|
| `ayudas-pereira` | Ayudas Pereira | Centros de acopio | https://alluda.online | Supabase (`yjkyzfuixdpuhgthoeua`) | `leer:municipios`, `leer:centros`, `leer:necesidades`, `leer:inventario`, `leer:transportes`, `leer:transporte-items`, `leer:voluntarios`, `leer:vehiculos`, `escribir:ofrecimiento`, `escribir:voluntario`, `escribir:vehiculo`, `escribir:transporte`, `escribir:unirse-a-centro`, `sesion:correo` |
| `pereira-unida` | Pereira Unida | Tablón de la comunidad | https://pereiraunida.com | Supabase (`ivnrelkbqqfebyullfeb`) | `leer:peticiones-persona`, `leer:ofrecimientos-persona`, `leer:comentarios`, `leer:alojamientos` |
| `pereira-responde` | Pereira Responde | Daños y vías cerradas | https://pereiraresponde.co | REST `GET /api/public/v1/reports?limit=500` | `leer:afectaciones`, `escribir:afectacion` |
| `corag` | Corag | Ayuda entre personas | https://ayuda.corag.app | REST `GET/POST /api/public/v1/help` | `leer:ayuda-directa`, `escribir:ayuda-directa` |
| `vivienda` | Encuéntralo a un Clic | Vivienda en arriendo | https://encuentraloaunclic.com | Supabase (`jdxptkifjcewckbslpno`) | `leer:alojamientos`, `escribir:alojamiento` |

Three observations the working group should not miss:

1. **The capability vocabulary is already verb-scoped and entity-scoped** (`leer:centros`,
   `escribir:afectacion`, `sesion:correo`). A protocol capability manifest can adopt this shape
   nearly verbatim, and one ecosystem team will recognise it as their own idea.
2. **Declared ≠ implemented.** The `corag` adapter declares `leer:ayuda-directa` and
   `escribir:ayuda-directa` but ships `leer:{}` and `escribir:{}` — the Corag calls live in separate
   free-standing hooks outside the registry. A conformance test must check behaviour, not manifests.
3. **`Encuéntralo a un Clic` (Quindío rentals) is a source AquíAyuda uses and the YAML does not
   mention.** It is also not in `src/content/ecosystem-apps/`. The ecosystem is larger than the
   directory believes.

## Cross-app write conventions already in production

- Writes to Corag carry `externalId` of the form `ac-{uuid}` and a source namespace string
  `ayudas-colombia`. A prefixed, namespaced external id is therefore **already an ecosystem
  convention**, not a proposal.
- Corag reads are parameterised: `?view=panorama`, and
  `?view=list&status=active&type={t}&latitude&longitude&radiusKm&limit` (client-capped at 100).
  Its accepted `type` vocabulary as embedded in AquíAyuda:
  `alimentos, salud, refugio, transporte, acopio, rescate, otro`.
- Writes to Ayudas Pereira require a Supabase email-OTP session; the SPA surfaces
  `"Necesitas entrar con tu correo para hacer esto."` (`AP-SES1`). Cross-app write is therefore
  already gated per source, with a per-source session model AquíAyuda has to reimplement.

## Entity inventory

AquíAyuda owns no entities. It **projects** foreign entities into a common UI vocabulary. What the
bundle shows it reads, per source, with the exact columns it selects:

| Entity (AquíAyuda view) | Source | Fields selected | Freshness signal |
|---|---|---|---|
| Municipio | Ayudas Pereira `ciudades` | `id, nombre, departamento, slug, activa, fusionada_en, created_at` | `created_at`; **`fusionada_en`** is a merge pointer for duplicate municipalities |
| **Centro de acopio** | Ayudas Pereira `centros` | `id, ciudad_id, nombre, direccion, responsable, notas, activo, created_at, lat, lng, foto, abierto` — plus `telefono` **only when a session exists** | `created_at` only; **no per-record updated/confirmed timestamp** |
| Necesidad | Ayudas Pereira `necesidades` | `id, centro_id, categoria, descripcion, prioridad, estado, created_at`; `prioridad ∈ {urgente, alta, normal}`, `estado ∈ {pendiente, cubierta}` | `created_at` |
| Inventario | Ayudas Pereira `inventario` | `id, centro_id, categoria, cantidad, unidad, updated_at` | **`updated_at` per line** — the only true freshness field in the AP schema |
| Transporte | Ayudas Pereira `transportes` | `id, ciudad_id, origen_id, destino_id, destino_texto, carga, vehiculo, conductor, estado, salida, notas, created_at`; `estado ∈ {programado, en_ruta, entregado, cancelado}` | `created_at`, `salida` |
| Transporte-item | Ayudas Pereira `transporte_items` | `id, transporte_id, categoria, cantidad, unidad` | inherited from parent |
| Voluntario | Ayudas Pereira `voluntarios` | `id, ciudad_id, centro_id, nombre, puede_ayudar_en, disponibilidad, notas, disponible` | none |
| Vehículo | Ayudas Pereira `vehiculos` | `id, ciudad_id, nombre, vehiculo, capacidad, zona, disponible` | none |
| Petición de persona | Pereira Unida `reports` | `id, title, description, category, urgent_level, status, municipality, location_name, lat, lng, contact_phone, created_at, photo_urls, last_confirmed_at, department` | **`last_confirmed_at`** — a confirmation timestamp distinct from creation |
| Ofrecimiento de persona | Pereira Unida `help_offers` | `id, full_name, skill, description, phone, municipality, status, created_at, department` | `created_at` |
| Comentario | Pereira Unida `comments` | `id, report_id, author_name, content, created_at` | `created_at` |
| Alojamiento | Pereira Unida `rentals` | `id, municipality, department, neighborhood, address, property_type, furnished, contact, monthly_rent, photo_urls, lat, lng, submitted_at, status, created_at` | `submitted_at`, `created_at` |
| Afectación | Pereira Responde REST | `id, title, description, type, risk, category, area, coords[lat,lng], photos[], votes, score, createdAt` | `createdAt`, plus `votes` as a social confirmation count |
| Ayuda directa | Corag REST | `emergencies[]` and a list view filtered by `type/status/radiusKm` | `staleTime` 60–600 s client-side |
| Inmueble | Encuéntralo a un Clic `inmuebles` | `id, title, description, price, type, city, neighborhood, area, bedrooms, bathrooms, parking, images[], owner_whatsapp, contact_count, created_at`, ordered `created_at desc` | `created_at` |

**Collection centers, specifically.** AquíAyuda's centre records are Ayudas Pereira's rows, verbatim.
The centre identity it exposes at `/centro/:id` is therefore *Ayudas Pereira's primary key* — an
identifier meaningful in exactly one other system and nowhere else. AquíAyuda has no way to state
that its `/centro/{ap-id}` and a Pereira Ayuda `albergue` slug and an `ayuda.red` marker are the same
building, so it does not try: it shows one source's centres and calls them the centres.

**Vocabulary translation already implemented.** The bundle carries three hard-coded mapping tables,
which are exactly the mappings a canonical model would replace:

- Pereira Responde → AquíAyuda: `type {housing→vivienda, road→via, support→apoyo}`,
  `risk {high→alta, medium→media, road/support→sin-clasificar}`,
  `category {shelter→"Refugio temporal", collection→"Zona de acopio"}`.
- AquíAyuda → Pereira Unida on write: `{alimentos|agua → alimentos, salud|medicamentos → medicinas,
  herramientas → herramientas, rescate → herramientas_rescate, transporte → transporte_logistica,
  acopio|voluntariado → voluntariado, mascotas → mascotas, refugio|otro → otros}`.
  Note the lossy joins: `agua` collapses into `alimentos`; `refugio` collapses into `otros`.

## Integration surface

| Question | Answer | Evidence |
|----------|--------|----------|
| `publicApi` | **no** | `/api` and `/openapi.json` return the SPA shell (04:00:57Z, 04:01:00Z); `/api/docs` returns Vercel `NOT_FOUND` (04:00:59Z). No documented endpoint anywhere on the host |
| `publicMcp` | **no** | `/mcp` returns the SPA shell, 200 text/html, 3977 bytes (04:01:01Z) |
| `robots.txt` | absent | shell returned (04:00:53Z) |
| `sitemap.xml` | absent | shell returned (04:00:54Z) |
| `/.well-known/` | absent | shell returned (04:00:56Z) |
| Machine-readable output | none | body is `<div id="root">`; there is no server-rendered content to parse |
| Machine-readable **input** | five, all bespoke | three PostgREST schemas + two REST APIs, listed above |

## Adoption effort estimate — **S**

Smallest of the seven, and by a wide margin.

- The abstraction the protocol needs already exists here. A protocol client would implement the same
  `leer:*` / `escribir:*` surface the registry already resolves against, and four of five adapters
  would be deleted rather than rewritten.
- Every mapping the protocol would standardise is already written down in one file — the two
  translation tables above are a ready-made input for Task 2's canonical field mapping.
- The one non-trivial piece is write auth: AquíAyuda currently holds a Supabase email-OTP session
  against another team's project. A protocol write path has to give it an equivalent, and that is a
  governance question, not a code question.
- Cost of *not* adopting is already visible: five error namespaces, three foreign keys to rotate,
  and a hard dependency on three schemas its team does not control.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| alluda (Ayudas Pereira) | centros, necesidades, inventario, transportes, voluntarios, vehículos | **Total.** AquíAyuda's logistics product *is* alluda's database, re-skinned |
| pereiraayuda | albergues, acopio | Same physical places, no shared identifier; AquíAyuda does not read Pereira Ayuda at all despite it being the only source in the ecosystem with a documented open API |
| unidosporpereira | albergues, acopio, viviendas | Same places, no link |
| ayuda.red | acopio, albergues | Same places, national scope on ayuda.red's side |
| pereiravive | rentals | Overlapping domain; AquíAyuda instead wires `encuentraloaunclic.com` for `/vivienda` |
| Pereira Unida | reports, offers, rentals | Read-only consumer |
| Pereira Responde | afectaciones | Read-only consumer via public API |
| Corag | ayuda directa | Read **and** write consumer |

The sharpest overlap finding: **AquíAyuda ignores Pereira Ayuda**, whose open API (JSON + CSV +
GeoJSON, CORS `*`, no key) is the cheapest source in the ecosystem to consume, while paying to
maintain three PostgREST integrations. That is what an ecosystem with no discovery mechanism looks
like.

## Risks & notes

- **Foreign publishable keys in a shipped bundle.** Three Supabase projects' publishable anon keys
  are embedded in AquíAyuda's JS. Supabase anon keys are public by design and RLS is the real
  boundary — but two of the three projects are not AquíAyuda's to rotate, and one of the schemas it
  reads (`reports`) includes `contact_phone`. If any of those three teams' RLS policies regress,
  AquíAyuda becomes the distribution channel for the regression. Key values are deliberately not
  reproduced in this dossier.
- **Silent-breakage coupling.** Every column list is hard-coded. An upstream `ALTER TABLE` produces a
  PostgREST error surfaced to end users as a generic per-source failure message, mid-emergency.
- **Attribution asymmetry.** AquíAyuda names its sources in-product (`quienPublica`, `url` per
  adapter), which is better practice than most of the ecosystem. It has no reciprocal way to tell
  those sources it is redistributing them.
- **Invisible to agents and crawlers.** No robots.txt, no sitemap, no server-rendered content. An LLM
  agent asked "where is the nearest collection centre" cannot answer from this host at all, despite
  it being the app that has assembled the most complete picture.
- **`unverified`:** liveness of `pereiraresponde.co/api/public/v1/reports` and
  `ayuda.corag.app/api/public/v1/help` was not probed from this workstream — those hosts belong to
  other analysts' assignments. The endpoint paths, parameters and response keys above are read from
  AquíAyuda's client code, not from the endpoints themselves.
- **`unverified`:** team, org, licence and funding. `/acerca` exists as a client route but renders no
  server-side content, and no GitHub or licence link appears in the bundle.
