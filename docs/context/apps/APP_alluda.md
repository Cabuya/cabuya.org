# APP_alluda — Acopio / Ayudas Pereira

## TL;DR

- `alluda.online` and `ayudaspereira.com` are one app: the alias 301-redirects to the canonical host
  (verified 2026-08-16T04:03:11Z, `server: Caddy`). Both names are in active use across the
  ecosystem, which is itself a source-identity problem.
- The product is a single 576 KB inlined Vite bundle over a Supabase project
  (`yjkyzfuixdpuhgthoeua`) with realtime enabled. Fifteen tables observed; the operational core is
  `ciudades → centros → {necesidades, inventario} + transportes/transporte_items + voluntarios/vehiculos`.
- It is the ecosystem's **largest collection-centre registry**: 184 active centres across 42
  municipalities in 11 departments, per its own server-rendered stats page (2026-08-16T04:09:00Z) —
  national, not just Pereira.
- Yet none of it is machine-readable from the outside: `/api`, `/openapi.json`, `/mcp` and
  `/.well-known/` all 404, the sitemap lists two URLs, and the centre list only exists inside a
  marketing page and inside Supabase. `publicApi: no` (in the documented sense), `publicMcp: no`.
- Adoption effort **S–M**: the schema is the closest thing in the ecosystem to a canonical
  collection-centre model and a feed is a single view away, but the data carries real quality debt
  (status encoded in names, municipality mis-assignment) that a feed would export as-is.

Inputs: `src/content/ecosystem-apps/alluda.yaml`; seed `URL_PROBE.txt` / `ENRICHED_PROBE.json`;
live probes of `alluda.online` and `ayudaspereira.com` (2026-08-16T04:02:59Z – 04:09:00Z).

## Identity

| Field | Value |
|-------|-------|
| Name | Acopio (YAML) — the product calls itself **Ayudas Pereira**; AquíAyuda registers it as `id: ayudas-pereira` |
| URL | https://alluda.online/ |
| Alias | https://ayudaspereira.com/ → **301** → https://alluda.online/ (2026-08-16T04:03:11Z) |
| Category | logistics |
| `<title>` | "Centros de Acopio en Pereira \| Dónde Donar y Ser Voluntario" |
| Landing page | https://alluda.online/ayudas-pereira — "Ayudas Pereira — la app que coordina los centros de acopio" |
| Governance (self-stated) | "No la hizo ninguna institución. La hicimos entre voluntarios"; free, no ads, no data sales; "cualquier municipio del país puede crear la suya sin pedirle permiso a nadie" (04:09:00Z) |
| YAML claims | Centres by city, what is missing / where there is surplus, volunteer + transport signup; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed, and understated.** The YAML says "multiple cities"; the app is national in reach (42 municipalities, 11 departments). `publicApi`/`publicMcp` resolve to **no** |

Three names for one system — *Acopio*, *Ayudas Pereira*, *alluda* — is already a registry problem the
protocol has to solve on day one.

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://alluda.online/ | 2026-08-16T04:02:59Z | 200 | text/html; charset=utf-8 | 576130 |
| https://alluda.online/robots.txt | 2026-08-16T04:03:01Z | 200 | text/plain; charset=utf-8 | 67 |
| https://alluda.online/sitemap.xml | 2026-08-16T04:03:02Z | 200 | text/xml; charset=utf-8 | 432 |
| https://alluda.online/.well-known/ | 2026-08-16T04:03:04Z | 404 | — | 0 |
| https://alluda.online/api | 2026-08-16T04:03:05Z | 404 | — | 0 |
| https://alluda.online/api/docs | 2026-08-16T04:03:07Z | 404 | — | 0 |
| https://alluda.online/openapi.json | 2026-08-16T04:03:08Z | 404 | — | 0 |
| https://alluda.online/mcp | 2026-08-16T04:03:10Z | 404 | — | 0 |
| https://ayudaspereira.com/ | 2026-08-16T04:03:11Z | 301 → alluda.online | text/html | — |
| https://ayudaspereira.com/robots.txt | 2026-08-16T04:03:14Z | 301 → alluda.online | text/plain | 67 |
| https://alluda.online/ (headers) | 2026-08-16T04:03:2xZ | 200 | text/html | — |
| https://alluda.online/ayudas-pereira | 2026-08-16T04:09:00Z | 200 | text/html; charset=utf-8 | 56976 |

Twelve requests across two hostnames. No authenticated area, no Supabase query issued from this
analysis.

## Observable architecture

- **Alias layer:** `server: Caddy` on `ayudaspereira.com`, issuing a clean 301 to the canonical host.
  The canonical host does not advertise the alias back (no `rel=canonical` alias, no redirect note).
- **App:** single-document Vite build — the whole application, `@supabase/supabase-js` included, is
  inlined into `index.html` (576 130 bytes). No `_next`, no Astro island, no separate JS bundle.
- **Backend:** Supabase project `yjkyzfuixdpuhgthoeua`, client constructed with
  `auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}` and
  `realtime: {params: {eventsPerSecond: 5}}` — live updates are on.
- **Configuration escape hatch:** `window.ACOPIO_CONFIG` may override `SUPABASE_URL` /
  `SUPABASE_ANON_KEY` / `APP_URL`; absent config falls back to a `demo` mode with seeded rows.
  `inferred`: the codebase is intended to be re-deployed per municipality, consistent with the
  "any municipality can create its own" statement on the landing page.
- **Caching:** `cache-control: no-cache, must-revalidate, max-age=0`; `last-modified` on the document
  was 2026-08-14T18:10:03Z at probe time — the shell is static, the data is not.
- **Analytics:** Google Analytics (`gtag`, one property id).
- **`robots.txt`** (04:03:01Z), complete: `User-agent: *` / `Allow: /` / `Sitemap: …/sitemap.xml`.
- **`sitemap.xml`** (04:03:02Z), complete: exactly two URLs — `/` and `/ayudas-pereira`, both
  `lastmod 2026-08-15`, `changefreq hourly`. **184 centres, 2 indexable URLs.**

## Entity inventory

Tables reached by the client (`from(...)` call sites in the inlined bundle, 04:02:59Z). Column lists
are the app's own `select` constants.

| Entity | Table | Visible fields | Freshness signals |
|---|---|---|---|
| Municipio | `ciudades` | `id, nombre, departamento, slug, activa, fusionada_en, created_at` | `created_at`; **`fusionada_en`** = merged-into pointer |
| **Centro de acopio** | `centros` | `id, ciudad_id, nombre, direccion, responsable, notas, activo, created_at, lat, lng, foto, abierto` (+ `telefono`, session-gated) | `created_at` only. Operational state is carried by two booleans, `activo` and `abierto` — **no `updated_at`, no confirmation timestamp** |
| Necesidad | `necesidades` | `id, centro_id, categoria, descripcion, prioridad, estado, created_at`; `prioridad ∈ {urgente, alta, normal}`, `estado ∈ {pendiente, cubierta}` | `created_at` |
| Inventario | `inventario` | `id, centro_id, categoria, cantidad, unidad, updated_at` | **`updated_at` per line — the only real freshness field in the schema** |
| Transporte | `transportes` | `id, ciudad_id, origen_id, destino_id, destino_texto, carga, vehiculo, conductor, estado, salida, notas, created_at, updated_at`; `estado ∈ {programado, en_ruta, entregado, cancelado}` | `updated_at`, `salida` |
| Transporte-item | `transporte_items` | `*` (client selects all); mapped as `id, transporte_id, categoria, cantidad, unidad` | inherited |
| Ofrecimiento | `ofrecimientos` | `id, centro_id, ciudad_id, necesidad_id, categoria, descripcion, nombre, direccion_recogida, necesita_transporte, transportista_nombre, estado, creado_at, actualizado_at, avisado_at` | **three timestamps** — created / updated / notified |
| Voluntario | `voluntarios` | `id, ciudad_id, centro_id, usuario_id, nombre, puede_ayudar_en, disponibilidad, notas, disponible, creado_at` | `creado_at` |
| Vehículo | `vehiculos` | `id, ciudad_id, usuario_id, nombre, vehiculo, capacidad, zona, notas, disponible, creado_at` | `creado_at` |
| Solicitud (join a centre) | `solicitudes` | `centro_id, usuario_id, estado` — upsert on `(centro_id, usuario_id)` | — |
| Admin/roles | `admins_ciudad`, `asignaciones`, `invitaciones`, `perfiles` | not inspected — moderator surface | — |

**Auth:** Supabase email OTP (`signInWithOtp` → `verifyOtp`), error namespace `AP-AUTH`. Reads are
anonymous; volunteer / vehicle / transport / join-a-centre writes require a session; a plain
`ofrecimiento` does not.

### Collection centres — the detail that matters for the protocol

The server-rendered landing page publishes the full centre roster (names, municipality, address, and
a per-centre count), read 2026-08-16T04:09:00Z. Distribution as published there:

| Municipality | Dept. | Centres |
|---|---|---|
| Pereira | Risaralda | 74 |
| Bogotá D.C. | Bogotá D.C. | 33 |
| Dosquebradas | Risaralda | 18 |
| Marsella | Risaralda | 3 |
| Santa Rosa de Cabal, Guática | Risaralda | 2 each |
| Apía, Balboa, Belén de Umbría, La Celia, Pueblo Rico, Quinchía, Santuario | Risaralda | 1 each |

Headline figures published on the same page, "con corte a 15 de agosto de 2026": 184 active centres,
42 municipalities, 11 departments, 181 centre coordinators, 1 081 volunteers, 177 vehicles offered,
371 donations offered (237 claimed, **172 awaiting transport**), 321 needs registered, 210 urgent and
uncovered, 231 live inventory lines. The page states the list is "viva: se regenera con cada
publicación" and was last regenerated 2026-08-15 16:09 Colombia time.

Data-quality patterns visible in that roster — every one of them is an argument for the protocol, and
every one of them would be exported verbatim by a naive feed:

- **Status encoded in the name.** `"Centro de acopio IE María Auxiliadora  (cerrado ahora)"`,
  `"Xxxx (cerrado ahora)"`. The schema has `activo` and `abierto` booleans; operators are writing
  state into the free-text title anyway.
- **Municipality mis-assignment.** Rows filed under `Pereira` whose address is elsewhere:
  `"Acopio Barrio Las Vegas - Dosquebradas"` (Dosquebradas address), `"Centro médico Dosquebradas"`
  (Coliseo Dosquebradas), `"Clínica Quirokinetica"` (Buenos Aires, Dosquebradas), and
  `"Dagua — Centro de Bomberos Voluntarios de cabecera Municipal"` (Dagua, **Valle del Cauca**).
- **Placeholder rows in production** (`"Xxxx"`).
- **`fusionada_en` on `ciudades` but nothing equivalent on `centros`.** The team has already solved
  duplicate identity one level up — for municipalities — and not for the entity that actually
  duplicates across apps.

## Integration surface

| Question | Answer | Evidence |
|----------|--------|----------|
| `publicApi` | **no** (documented) / *de facto* PostgREST | `/api`, `/api/docs`, `/openapi.json` all 404 with 0 bytes (04:03:05Z–04:03:08Z). The Supabase project does expose PostgREST, and AquíAyuda consumes it with the embedded publishable key — but there is no documentation, no stability contract, and no invitation to do so |
| `publicMcp` | **no** | `/mcp` → 404, 0 bytes (04:03:10Z) |
| `robots.txt` | yes, permissive | `Allow: /` (04:03:01Z) |
| `sitemap.xml` | yes, 2 URLs | (04:03:02Z) |
| `/.well-known/` | no | 404 (04:03:04Z) |
| Server-rendered data | **partial and unique in this batch** | `/ayudas-pereira` renders the full centre roster and live counters as HTML tables — crawlable, agent-readable, and the only such page among the seven |
| Licence / open-data statement | none found | the landing page states governance and cost, not reuse terms — `unverified` whether reuse is permitted |

## Adoption effort estimate — **S–M**

- **Why small:** the relational model already separates place, need, stock and movement, with foreign
  keys — it is the most protocol-shaped schema in the batch. A `/feed` route that serialises
  `ciudades + centros + necesidades + inventario` is one Supabase view plus one handler. The team
  also already ships a server-rendered HTML view of exactly that data, so the "generate a static
  artefact from the DB" muscle exists.
- **Why not smaller:** three gaps a conforming feed must close. (1) `centros` has no `updated_at` and
  no confirmation timestamp — a feed would publish freshness it cannot substantiate. (2) Status lives
  partly in `nombre`. (3) Municipality is user-entered and demonstrably wrong on some rows, so the
  feed's own `municipality` field cannot be trusted for routing without cleanup.
- **Leverage:** it is already read in production by AquíAyuda and already cited by name in Pereira
  Ayuda's `fuente` field. Two consumers exist before the protocol does. Making this feed conform
  would immediately give the protocol its first real producer with real downstream traffic.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| aquiayuda | centros, necesidades, inventario, transportes, voluntarios, vehículos | **Consumed wholesale.** AquíAyuda's logistics surface is this database |
| pereiraayuda | acopio | Same physical places; **and a confirmed one-way copy** — Pereira Ayuda carries points whose `fuente` reads "Acopio Pereira (ayudaspereira.com), 13 ago". Attribution preserved, identifiers not |
| unidosporpereira | acopio, albergues | Same places, conflicting operational status (see cross-app notes) |
| ayuda.red | acopio | Same places, national overlap; ayuda.red covers 57 municipalities to alluda's 42 |
| gogo | needs points | Adjacent: Gogó models "point that needs X" with quantities, alluda models "centre with needs and inventory" |
| pereiravive | — | No overlap; different domain |

## Risks & notes

- **The registry is invisible.** 184 centres exist in a database; 2 URLs exist in the sitemap. Any
  agent, crawler or partner that does not know to load a 576 KB SPA and hold a Supabase key sees
  nothing. This is the ecosystem's largest single stock of collection-centre data and its least
  reachable.
- **`responsable` and `telefono` are personal data.** `telefono` is correctly session-gated in the
  client's `select`; `responsable` (a person's name) is not. A feed must drop both by default —
  this dossier records the field names only, no values.
- **The alias is load-bearing and undeclared.** Pereira Ayuda's provenance strings say
  `ayudaspereira.com`; AquíAyuda's registry says `alluda.online`; the ecosystem YAML lists both. A
  registry entry must carry a canonical URL *plus* known aliases, or provenance strings will not
  join up.
- **No licence.** Everything about the project's stated ethos suggests reuse is welcome; nothing on
  the site says so. This is the cheapest possible fix and a blocker for anyone doing this properly.
- **`unverified`:** the figures quoted above are the site's own published counters as of
  2026-08-15 16:09 Colombia time, not independently counted by this analysis. They are reported as
  the app's claims, with their timestamp, and should be re-read rather than cited as current.
- **Demo-mode fallback** means a misconfigured deployment silently serves seeded fake rows instead of
  failing. Any conformance check must be able to tell a demo instance from a live one.
