# APP_unidosporpereira — Unidos por Pereira

## TL;DR

- A PHP-rendered single-page emergency board (Cloudflare in front, `x-powered-by: PHP/8.3.30`) whose
  entire content is in the HTML — the only app in this batch that a crawler or an agent can read
  end-to-end with one GET.
- It has an **undocumented but fully public JSON feed**: `GET /mapa-datos.php` →
  `{generado, generado_tx, total, puntos[]}`, 200 `application/json`, 36 geolocated points at
  2026-08-16T04:10:27Z. It is a feed in everything but name and licence.
- Best freshness model in the batch: every point carries `frescura` (`fresco`/`viejo`), a
  human `hace` string, a `verificado` boolean and an `aprox` flag for coordinate confidence. The
  page-level seals run four tiers — `vigente / tibio / viejo / simple`.
- And it publishes its own bad news: at probe time **31 of 36 map points were `viejo`** — 86 % of the
  live emergency map was stale by the app's own measure. That number is the strongest argument in
  this analysis for machine-readable freshness metadata.
- `publicApi: no` in the documented sense (`/api`, `/openapi.json`, `/mcp` all 404), `publicMcp: no`,
  no sitemap. Adoption effort **S**: the feed exists; it needs a stable path, a licence, CORS and
  a PII pass.

Inputs: `src/content/ecosystem-apps/unidosporpereira.yaml`; seed `ENRICHED_PROBE.json`; live probes
of `unidosporpereira.com` (2026-08-16T04:03:59Z – 04:10:27Z).

## Identity

| Field | Value |
|-------|-------|
| Name | Unidos por Pereira |
| URL | https://unidosporpereira.com/ |
| Category | logistics |
| `<title>` | "Emergencia · Unidos por Pereira" |
| Self-description | "Albergues, acopio, clínicas, puntos que necesitan ayuda y zonas por donde no transitar. **Se refresca solo cada minuto.**" |
| YAML claims | Shelters, collection centres, meals, help, pets, with last-updated times; Pereira scope; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed and extended.** The timestamp claim is not decorative — it is a structured freshness tier. Scope is Pereira + Dosquebradas, not Pereira alone. `publicApi` should read **no (documented) / yes (de facto, undocumented)**; `publicMcp: no` |

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://unidosporpereira.com/ | 2026-08-16T04:03:59Z | 200 | text/html; charset=UTF-8 | 371466 |
| https://unidosporpereira.com/robots.txt | 2026-08-16T04:04:01Z | 200 | text/plain; charset=utf-8 | 1248 |
| https://unidosporpereira.com/sitemap.xml | 2026-08-16T04:04:03Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/.well-known/ | 2026-08-16T04:04:04Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/api | 2026-08-16T04:04:05Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/api/docs | 2026-08-16T04:04:07Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/openapi.json | 2026-08-16T04:04:08Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/mcp | 2026-08-16T04:04:09Z | 404 | text/html | 4511 |
| https://unidosporpereira.com/assets/mapa.js?v=4 | 2026-08-16T04:10:15Z | 200 | application/javascript | 8871 |
| https://unidosporpereira.com/mapa-datos.php | 2026-08-16T04:10:27Z | 200 | application/json; charset=UTF-8 | 27332 |

Ten requests. The last two follow the map's own client code; no admin or authenticated path touched.

## Observable architecture

- **Server:** PHP 8.3.30 behind Cloudflare (`cf-cache-status: DYNAMIC`,
  `cache-control: no-store, no-cache, must-revalidate`). Fully server-rendered; the 371 KB document
  is content, not framework.
- **Map:** Leaflet 1.9.4 from unpkg, driven by `assets/mapa.js?v=4`, which fetches `mapa-datos.php`.
  No Google Maps dependency, no map-provider API key exposed.
- **Email obfuscation:** Cloudflare `email-decode.min.js` + `data-cfemail` attributes — a deliberate
  anti-harvesting measure, which is a good sign about the team's instincts on contact data.
- **Cookie notice and an accessibility section** are present on the page (`Usamos cookies`,
  `Accesibilidad`).
- **`robots.txt` (04:04:01Z) is broken.** It contains only the Cloudflare "content signals"
  boilerplate — the explanatory comment block and the EU Directive 2019/790 reservation — and **no
  `User-agent:` line and no `Content-Signal:` line at all**. A file of pure comments grants nothing
  and restricts nothing. `inferred`: Cloudflare's managed robots.txt feature is enabled but no signal
  was configured. Worth telling the team.
- **No sitemap** (404 at 04:04:03Z), and the site is a single document with `#anchor` sections, so
  there is nothing per-entity to index anyway.

## Entity inventory

The page is organised into named sections with live counters (read 2026-08-16T04:03:59Z):

| Section | Anchor | Count at probe |
|---|---|---|
| Por dónde no transitar | `#pordondenotransitar` | 5 |
| Albergues abiertos | `#albergues` | 10 |
| Necesitamos ayuda | `#necesitamos-ayuda` | 0 |
| Salud | `#salud` | 0 (2 appear in the map feed) |
| Centros de acopio | `#centros-de-acopio` | 16 |
| Cronograma de comidas | `#cronograma-de-comidas` | 2 |
| Viviendas disponibles | `#viviendas` | 87 |
| Voluntarios | `#voluntarios` | 0 |
| Donaciones ofrecidas | `#donaciones-ofrecidas` | 0 |
| Peluditos (mascotas) | `#peluditos` | 5 |
| Directorio: líneas, tiendas y locales | `#directorio` | 1 |
| Avisos e información oficial | `#avisos-oficiales` | 8 |

### The `/mapa-datos.php` record (the de-facto feed schema)

Envelope: `generado` (ISO-8601 with offset, `2026-08-15T23:10:28-05:00` at probe time),
`generado_tx` (human string), `total`, `puntos[]`. Generated per request — `generado` tracked the
request time exactly.

Per point, 23 fields:

`id, sec, capa, titulo, extra, estado, zona, direccion, lat, lng, aprox, color, tel, tel_fmt,
contacto, nec[], desc, imagen, hace, frescura, verificado, mapa, ancla`

| Field | Vocabulary observed (36 points, 04:10:27Z) | Notes |
|---|---|---|
| `sec` | `albergues` (10), `acopio` (16), `riesgos` (5), `salud` (2), `locales` (3) | machine slug — the join key a protocol would map |
| `capa` | `Albergue`, `Centro de acopio`, `No transitar`, `Clínica / hospital`, `Local que ayuda` | display label for the same axis |
| `estado` | `Abierto` (8), `Lleno` (4), `Activo` (19), `Activa` (5) | **type-dependent enum**, not a single vocabulary |
| `frescura` | `fresco` (5), `viejo` (31) | binary tier in the feed; the HTML uses four (`vigente`, `tibio`, `viejo`, `simple`) |
| `hace` | `hace 10 min` … `hace 2 días` | relative, human, locale-bound — not machine-comparable |
| `verificado` | true (27) / false (9) | boolean; no verifier identity, no verification timestamp |
| `aprox` | true (30) / false (6) | **coordinate-confidence flag** — 83 % of points admit approximate geometry |
| `id` | opaque 10-hex, e.g. `c32653bdd8` | app-local, no namespace, not resolvable elsewhere |
| `nec[]` | array of need strings with priority labels (`Importante`) | needs attached to the place, not modelled separately |
| `tel`, `tel_fmt`, `contacto` | present | **personal contact data — see Risks** |

### Shelters, in detail (the protocol's core entity)

Card-level fields observed in the HTML for `#albergues`: name, address (rendered as a Google Maps
search link), occupancy as `N personas de M cupos (P%)` with a progress bar, status chips
(`Lleno` / zone chip / `Verificado`), a needs list with per-item priority, and a free-text note.
Occupancy plus capacity is a field pair **no other app in this batch carries**, and it is exactly what
someone deciding where to send a family needs.

Shelter roster at 04:10:27Z (place-level only): Centro Vida José Argemiro Cárdenas · Centro Vida
Violetas · La villa (Pereira) · Iglesia Bautista Berea · Polideportivo Campestre B · Parque El Vergel
· Parque Olaya Herrera · Parque el Oso · coliseo Mayor · Estadio Alberto Mora Mora.

Collection-centre roster at the same timestamp: Los Molinos · UTP · Casa En Sueño · Universidad
Tecnologia de Pereira - Edificio 18 · Ukumari · Colegio Maria Auxiliadora · Effeta · Olaya · UNICO
(Dosquebradas) · CAM · Tatama · Expofuturo · Molivento Mall · Cerritos del MAr · Acopio Rebeca ·
Adoptame-Pereira.

**Intra-app duplicate, with conflicting geometry.** `UTP` (id `70ac423f88`, lat 4.79105) and
`Universidad Tecnologia de Pereira - Edificio 18` (id `befb69558d`, lat 4.80092) carry the *same
street address* — Carrera 27 #10-02, barrio Álamos — and coordinates roughly 1.1 km apart. One board,
one place, two records, two geocodes. If a single app cannot deduplicate itself, five apps sharing
free-text names certainly cannot.

`coliseo Mayor` also appears twice under different meanings — as an open shelter (`Lleno`) and as a
`No transitar` risk zone — which is legitimate modelling, but shows that "place" and "situation at a
place" are conflated in one record type.

## Integration surface

| Question | Answer | Evidence |
|----------|--------|----------|
| `publicApi` | **no** (documented) — **yes** (undocumented, de facto) | `/api`, `/api/docs`, `/openapi.json` → 404 (04:04:05Z–04:04:08Z). `GET /mapa-datos.php` → 200 `application/json`, 27 332 bytes, 36 records (04:10:27Z), no auth, no key |
| `publicMcp` | **no** | `/mcp` → 404 (04:04:09Z) |
| CORS | **not enabled** | no `access-control-allow-origin` header on `/mapa-datos.php` — a browser-side consumer cannot read it today |
| Cache policy on the feed | `no-store, max-age=0` | regenerated per request; no conditional-request support observed |
| `robots.txt` | present but inert | comments only, no directives (04:04:01Z) |
| `sitemap.xml` | no | 404 (04:04:03Z) |
| Licence / reuse terms | none found | the robots.txt boilerplate reserves EU text-and-data-mining rights *in comment form only* — legally inert as written, but it signals intent worth asking about |
| Server-rendered content | **yes, complete** | the whole board is in one HTML document |

## Adoption effort estimate — **S**

The smallest real build in the batch after AquíAyuda, because the hard part is already done.

- The feed exists, is generated server-side, is stable in shape, and already carries the two things
  protocols usually have to beg for: **a generation timestamp and a per-record freshness tier**.
- Work required: pin it to a documented path, add `Access-Control-Allow-Origin: *`, add a licence
  line, add `ETag`/`Last-Modified` so consumers can poll politely, and — the only non-trivial item —
  split contact fields behind a `contact_public` flag instead of shipping them to every caller.
- Two vocabulary items need mapping, not redesign: `estado` is currently type-dependent
  (`Abierto`/`Lleno` for shelters, `Activo`/`Activa` for everything else), and `hace` is a rendered
  string where an ISO timestamp belongs. Both are one-line changes at serialisation time.
- The team's instincts already match the protocol's: freshness tiers, an approximate-coordinate flag,
  a verified flag, and email obfuscation. They will not need convincing that any of this matters.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| pereiraayuda | albergues, acopio | Heavy — at least six shelters and several centres are the same physical places (see cross-app table) |
| ayuda.red | albergues, acopio | Heavy, same places, ayuda.red at national scope |
| alluda | acopio | Same places; **conflicting operational status** — `Colegio Maria Auxiliadora` (Cl. 43 #13-74) is `Activo` here and "(cerrado ahora)" in alluda's roster |
| aquiayuda | reads Pereira Unida's Supabase (`reports`, `help_offers`, `rentals`, `comments`) | Note: *Pereira Unida* (`pereiraunida.com`) is a **different app** from Unidos por Pereira. Similar names, different systems — a naming collision the registry must handle explicitly |
| pereiravive | viviendas (87 here) | Direct domain overlap on rentals, with an `Inmobiliaria` field this app carries and PereiraVive does not |
| gogo | road closures, businesses that help | `#pordondenotransitar` ≈ Gogó's `cierres_via`; `Local que ayuda` ≈ Gogó's `negocios` |

## Risks & notes

- **Personal phone numbers in an open JSON feed.** `tel`, `tel_fmt` and `contacto` are served
  unauthenticated to any caller, while the same numbers are Cloudflare-obfuscated in the HTML. The
  protective measure on the page is defeated by the feed behind it. No values are reproduced in this
  dossier. This should be raised with the team directly, not published — and it is a concrete reason
  the protocol needs an explicit `contact_public` consent flag rather than a convention.
- **86 % stale.** 31 of 36 map points read `viejo` at 04:10:27Z; the five `fresco` points were all
  `riesgos` (road/risk zones) updated 10 minutes earlier. Shelters and collection centres were
  1–2 days old. The board is honest about it — which is the point: **freshness has to be a first-class
  protocol field precisely because the honest answer is often "old".**
- **Opaque local ids.** 10-hex ids with no namespace, and the page's anchors are `#ancla` strings.
  Nothing here can be referenced from another app.
- **Type-dependent state vocabulary** (`Abierto`/`Lleno` vs `Activo`/`Activa`) will collide with any
  single-enum design. The canonical model should separate *operational status* from *capacity status*.
- **The robots.txt is a live misconfiguration**, not a policy: a Cloudflare content-signals file with
  every directive missing. Easy fix, worth reporting.
- **`unverified`:** team, org, licence, funding. No about page, no GitHub link, no contact block was
  observed at organisation level; the page carries operational content only.
