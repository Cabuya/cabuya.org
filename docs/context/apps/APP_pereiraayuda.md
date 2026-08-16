# APP_pereiraayuda — Pereira Ayuda

## TL;DR

- **The baseline YAML is wrong on the most important field.** Pereira Ayuda has a documented,
  unauthenticated, CORS-open **public API** (`/api/*.json`, `.csv`, `.geojson`) *and* a documented
  **MCP server** with eight tools, four of which write. `publicApi: yes`, `publicMcp: yes` — verified
  live at 2026-08-16T04:06:43Z and 04:06:56Z.
- It is the most protocol-ready app in the ecosystem, and it got there without a protocol: closed
  category and tag vocabularies, a per-record `fuente` provenance string, an explicit open-data
  licence, a stated 30-minute refresh, and a documented request-rate expectation.
- Its freshness model is the best specified anywhere in this batch: `ultima_validacion`,
  `confirmaciones_24h` (distinct people confirming in the last day) and `contradicciones_activas`
  (reports that the place was not there), with an instruction to consumers — *"Adviértalo en su
  interfaz."*
- Its privacy design is also the strongest: ~550 person-level point pages are deliberately
  `noindex`, the API strips natural persons' phone numbers, and missing-persons and casualty data are
  explicitly refused. The one leak is in `fuente`, which sometimes carries a publisher's personal name.
- Adoption effort **S**: this app is closer to being a reference implementation than an adopter. The
  realistic move is to model the protocol's feed profile on what it already does.

Inputs: `src/content/ecosystem-apps/pereiraayuda.yaml`; seed `ENRICHED_PROBE.json`; live probes of
`pereiraayuda.com` (2026-08-16T04:04:10Z – 04:06:56Z).

## Identity

| Field | Value |
|-------|-------|
| Name | Pereira Ayuda |
| URL | https://pereiraayuda.com/ |
| Category | logistics |
| `<title>` | "Albergues, acopios y ayuda en Pereira tras el terremoto \| Pereira Ayuda" |
| Self-description (`/api/resumen.json`) | "Directorio comunitario de emergencia de Pereira y el área metropolitana tras el terremoto del 10 de agosto de 2026." |
| YAML claims | Dated directory of shelters, donation points and open hospitals in Pereira and Dosquebradas; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Substantially wrong.** Both integration fields are `yes` with documentation pages of their own (`/api.html`, `/mcp.html`, `/integraciones.html`, all listed in the sitemap). Scope also extends past Pereira/Dosquebradas to La Virginia and Santa Rosa de Cabal. The `logoAuthorization: pending_contact` note stands |
| Licence (self-stated) | "Datos abiertos: úselos, cítelos como pereiraayuda.com." Code MIT. Third-party credit preserved: *"El crédito de terceros no se borra"* |

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://pereiraayuda.com/ | 2026-08-16T04:04:10Z | 200 | text/html; charset=utf-8 | 310683 |
| https://pereiraayuda.com/robots.txt | 2026-08-16T04:04:11Z | 200 | text/plain; charset=utf-8 | 1595 |
| https://pereiraayuda.com/sitemap.xml | 2026-08-16T04:04:13Z | 200 | application/xml | 4988 |
| https://pereiraayuda.com/.well-known/ | 2026-08-16T04:04:14Z | 200 (SPA/page fallback) | text/html | 310683 |
| https://pereiraayuda.com/api | 2026-08-16T04:04:16Z | 200 (page fallback) | text/html | 310683 |
| https://pereiraayuda.com/api/docs | 2026-08-16T04:04:17Z | 200 (page fallback) | text/html | 310683 |
| https://pereiraayuda.com/openapi.json | 2026-08-16T04:04:19Z | 200 (page fallback) | text/html | 310683 |
| https://pereiraayuda.com/mcp | 2026-08-16T04:04:20Z | 200 (page fallback) | text/html | 310683 |
| https://pereiraayuda.com/api.html | 2026-08-16T04:06:11Z | 200 | text/html; charset=utf-8 | 41368 |
| https://pereiraayuda.com/mcp.html | 2026-08-16T04:06:13Z | 200 | text/html; charset=utf-8 | 31200 |
| https://pereiraayuda.com/integraciones.html | 2026-08-16T04:06:14Z | 200 | text/html; charset=utf-8 | 27034 |
| https://pereiraayuda.com/api/resumen.json | 2026-08-16T04:06:43Z | 200 | application/json | 1910 |
| https://pereiraayuda.com/api/albergue.json | 2026-08-16T04:06:56Z | 200 | application/json | 17942 |
| https://pereiraayuda.com/api/acopio.json | 2026-08-16T04:06:57Z | 200 | application/json | 35124 |

Fourteen requests. Above the ~10 guidance, and deliberately so: this host turned out to hold the only
documented API and MCP surface in the batch, and every extra request was to a path the site itself
publishes in its sitemap or its API index. The moderation panel (`/moderacion.html`, `Disallow`) was
not touched. No point-level file containing personal contacts (`puntos.json`, `necesita_ayuda.json`)
was fetched.

The bare `/api` and `/mcp` paths returning the home page is a **discovery trap**: an automated prober
that only tries the conventional paths concludes "no API" from a 200 HTML response. That is almost
certainly how the baseline YAML came to say `unknown`. A protocol needs a discovery convention that
does not depend on guessing paths.

## Observable architecture

- **Delivery:** static files behind Cloudflare (`cf-cache-status: HIT`, `age: 180`,
  `cache-control: no-cache`). `last-modified` on the home page was 2026-08-16T03:27:47Z at probe
  time — roughly 37 minutes before the probe, consistent with the documented 30-minute regeneration.
- **Backend:** Supabase with row-level security. The `robots.txt` comment names the policy file
  (`supabase/02_rls.sql`) and argues, correctly, that RLS — not `Disallow` — is what protects the
  moderation queue.
- **Build pipeline:** `inferred` from the robots.txt commentary — a Python generator
  (`scripts/fichas.py`) renders per-point pages and a second sitemap, and a `se_indexa()` predicate
  decides indexability per record.
- **Progressive enhancement, done properly.** The home page's inline comments (visible in source at
  04:04:10Z) describe navigation that works without JavaScript and only becomes a dropdown once the
  script sets `data-js`, plus measured sticky-chrome heights driven into CSS variables. This is a
  team that writes down *why*.
- **`robots.txt` is unusually thoughtful.** It allows everything except `/moderacion.html`, declares
  two sitemaps, and explains that ~550 point pages carry `noindex` on purpose because they are
  "pedidos y ofertas con el nombre de una persona encima, y que eso salga en Google para siempre no
  es lo que esa persona vino a pedir."
- **Sitemap** (04:04:13Z, 25 URLs): `/`, `/donar.html`, `/recomendaciones.html`, `/privacidad.html`,
  `/albergues.html`, `/medicamentos.html`, `/ayudas.html`, `/voluntarios.html`, `/construccion.html`,
  `/reconstruccion.html`, `/entretenimiento.html`, `/mapa-del-sitio.html`, seven `/guia/*` pages, and
  — the find — **`/integraciones.html`, `/api.html`, `/mcp.html`**. A second sitemap,
  `/p/sitemap.xml`, lists only shelters and hospitals.

## Public API (verified)

Base: `https://pereiraayuda.com/api/`. Index at `/api/resumen.json` (read 2026-08-16T04:06:43Z).

**Response headers observed on `resumen.json`:** `content-type: application/json`,
`access-control-allow-origin: *`, `cache-control: public, max-age=300`,
`last-modified: Sun, 16 Aug 2026 03:27:47 UTC`.

**Endpoints advertised by the index (13):** `puntos.json`, `resumen.json`, `acopio.json`,
`albergue.json`, `colapso.json`, `hospital.json`, `maquinaria.json`, `mascota.json`,
`necesita_ayuda.json`, `psicologica.json`, `vivienda.json`, `puntos.geojson`, `puntos.csv`.

**Envelope** (identical across category files): `proyecto, descripcion, sitio, actualizado, licencia,
aviso, datos_personales, contacto, categoria, total, puntos[]`. `resumen.json` additionally carries
`por_categoria`, `por_municipio`, `con_ubicacion`, `atendidos`, `con_contradiccion`, `endpoints`,
`documentacion`.

**Counts at 2026-08-16T04:06:43Z** (`actualizado: 2026-08-16T03:26:56Z`), total 214:

| Category | n | | Municipality | n |
|---|---|---|---|---|
| colapso | 82 | | Pereira | 172 |
| necesita_ayuda | 69 | | Dosquebradas | 38 |
| acopio | 22 | | Santa Rosa de Cabal | 2 |
| hospital | 11 | | La Virginia | 1 |
| albergue | 10 | | Otro | 1 |
| mascota | 8 | | | |
| maquinaria | 7 | | `con_ubicacion` | 78 |
| vivienda | 4 | | `atendidos` | 0 |
| psicologica | 1 | | `con_contradiccion` | 2 |

Only 78 of 214 points carry coordinates — a 36 % geolocation rate. Any protocol that assumes
lat/lng is present will discard most of this dataset.

**Per-point schema** (per `/api.html`, 04:06:11Z, confirmed against `albergue.json` / `acopio.json`
at 04:06:56Z):

`id, categoria, estado, nombre, descripcion, ubicacion{direccion, barrio, municipio, lat, lng,
precision}, contacto{telefono, nombre, whatsapp, en_ficha}, horario, etiquetas[], atiende,
atiende_desde, confirmaciones_24h, contradicciones_activas, aviso_comunidad, ultima_validacion,
publicado_en, fuente, advertencia, advertencia_grave, url`

**Closed vocabularies** — the ecosystem's only published controlled vocabulary:

- `categoria`: `acopio, albergue, colapso, donacion, hospital, maquinaria, mascota, necesita_ayuda,
  psicologica, vivienda`
- `etiquetas` (19): `agua, alimentos, medicamentos, ropa, aseo, colchonetas, mascotas, voluntarios,
  rescate, maquinaria, transporte, psicosocial, estructural, duchas, energia, panales, carpas,
  cocina, herramienta`
- `estado` observed in live data: `verificado`, `reportado`

**Consumer guidance, stated by the publisher:** regenerated every 30 minutes;
`Cache-Control: public, max-age=300`; *"No consulte más seguido que eso."* No API key, no quota, no
registration. No write endpoints — writes go through the web form or the MCP server.

**What it refuses to publish, explicitly:** missing persons, casualty lists, victim counts (because
official sources conflict), and natural persons' mobile numbers — only institutional switchboards and
numbers whose owner authorised publication. `contacto.en_ficha: true` signals that a contact exists
on the point's own page. And a direct instruction to would-be scrapers: *"No reconstruya la lista
raspando el sitio: son datos de gente que acaba de perder la casa y el fraude alrededor de este
terremoto está activo."*

## MCP server (documented)

From `/mcp.html` (04:06:13Z). **Transport: local stdio JSON-RPC 2.0**, not a hosted HTTP/SSE
endpoint — which is why `/mcp` returns the home page. Install:
`claude mcp add pereira -- python3 scripts/mcp_pereira.py`, or the equivalent `.mcp.json` block. No
key required; it ships with the same public Supabase URL and publishable key the website uses, and
`SUPABASE_URL` / `SUPABASE_ANON` can override.

| Tool | Parameters (`*` mandatory) | Kind |
|---|---|---|
| `buscar_puntos` | `texto, categoria, etiqueta, municipio, solo_sin_atender, limite` (default 20, max 100) | read |
| `estado_directorio` | — | read |
| `publicar_punto` | `nombre*, descripcion*, categoria, barrio, municipio, etiquetas, contacto_telefono, contacto_publicable` | write |
| `confirmar_punto` | `slug*, no_estaba` | write |
| `atender_punto` | `slug*, quien*` | write |
| `resolver_punto` | `slug*, nota` | write |
| `reabrir_punto` | `slug*` | write |
| `anotar_punto` | `slug*, nota*` | write |

Two design decisions worth copying into the protocol's agent story:

1. **`confirmar_punto(slug, no_estaba)`** — one tool expresses both positive confirmation and
   negative contradiction. That is what feeds `confirmaciones_24h` and `contradicciones_activas`.
   A protocol that only models "created/updated" cannot express "three people went and it was gone".
2. **`contacto_publicable`** — an explicit consent flag at write time, not a policy in a footer.
3. Closed lists silently discard invalid values for `categoria`, `etiqueta`, `etiquetas` and
   `municipio`, and the server cannot verify points, delete data, or reach the moderation queue.
   The agent surface is deliberately less privileged than the human one.

Note the identifier split: the API exposes `id`, the MCP tools address records by `slug`. A protocol
must pin one.

## Entity inventory

| Entity | Fields | Freshness signals |
|---|---|---|
| **Albergue** (10) | full point schema; `estado ∈ {verificado, reportado}` | `ultima_validacion` per record; `confirmaciones_24h`; `contradicciones_activas` |
| **Acopio** (22) | as above | as above |
| Hospital (11) | as above | as above |
| Colapso (82) | as above; structural damage | as above |
| Necesita ayuda (69) | as above; person-level requests/offers — `noindex`, contacts withheld from the API | as above |
| Maquinaria (7), Mascota (8), Vivienda (4), Psicológica (1) | as above | as above |
| Directory-level | `actualizado` on every file | file generation time |

**Shelter roster at 2026-08-16T04:06:56Z** (place level only, contacts omitted):

| Name | Municipality | Coords | `estado` | `ultima_validacion` (UTC) |
|---|---|---|---|---|
| Parque El Oso | Pereira | 4.798927 | verificado | 2026-08-15T19:59:21Z |
| Coliseo Mayor | Pereira | 4.815091 | verificado | 2026-08-15T19:53:49Z |
| Plazoleta Risaralda (Villa Olímpica) | Pereira | — | reportado | 2026-08-15T02:20:33Z |
| Estadio Alberto Mora Mora | Pereira | 4.806989 | verificado | 2026-08-14T17:50:09Z |
| Ecoparque El Vergel | Pereira | 4.804899 | verificado | 2026-08-14T17:13:52Z |
| Plaza de Ferias | Pereira | 4.806649 | verificado | 2026-08-14T14:51:28Z |
| Centro Vida Violetas | Dosquebradas | 4.822594 | verificado | 2026-08-14T04:59:25Z |
| Polideportivo Campestre B | Dosquebradas | 4.833199 | verificado | 2026-08-14T04:56:56Z |
| Parque Olaya Herrera | Pereira | 4.809428 | verificado | 2026-08-12T23:00:00Z |
| Polideportivo Belalcázar | Pereira | — | reportado | *null* |

`ultima_validacion: null` on a live shelter is not a bug — it is the schema saying "never confirmed",
which is precisely the honesty the protocol should require.

**Collection-centre roster** (22 at 04:06:57Z) includes Expofuturo, Consota, El Remanso, Perla del
Otún, Comuna del Café, Kennedy, Ormazá, San Nicolás, Tokio, CAM de Dosquebradas, Banco de Alimentos —
sede Dosquebradas, Comfamiliar Risaralda — sede Dosquebradas, Colectivo Artemisa — insumos médicos,
Convite Pereira — acopio Guadalupe, Territorio Luna Azul, and several household-scale points.

## Cross-app provenance, observed in the data

`fuente` is a free-text provenance string, and it demonstrates real cross-app copying:

- `"Acopio Pereira (ayudaspereira.com), 13 ago — ciudad Pereira"` on *Colectivo Artemisa — insumos
  médicos* (Carrera 4 #20-55). The same organisation appears in alluda's own roster as
  *"Colectivo Artemisa"* at `Cra 4#20-55`. **This is a documented, attributed, one-way copy between
  two ecosystem apps — the clearest single proof that manual integration is already happening.**
- Municipal and press provenance is the norm elsewhere: *"Alcaldía de Pereira vía El Tiempo y Semana,
  12 ago"*, *"Alcaldía de Dosquebradas, 12–13 ago"*, *"El Diario del Otún, 12 ago"*,
  *"SOS Terremoto #92, oferta, 13 ago 7:38"*, *"Afiche Comfamiliar Risaralda … 12 ago 22:16"*.

`/integraciones.html` (04:06:14Z) makes the intent explicit: *"Muchos vienen a su vez de otros
tableros comunitarios y cada punto dice su fuente en el campo `fuente`"*, *"El crédito de terceros no
se borra"*, and an open invitation — *"La interoperabilidad con otros tableros de la emergencia nos
interesa"*. It offers no deduplication procedure and no formal contract: *"Los nombres de campo, los
valores posibles y los parámetros de las herramientas salen del código."*

That is the gap the protocol fills, described by the ecosystem's most advanced team in their own words.

## Integration surface

| Question | Answer | Evidence |
|---|---|---|
| `publicApi` | **yes** | `/api/resumen.json` 200 `application/json`, CORS `*`, no auth, documented at `/api.html` (04:06:11Z–04:06:43Z) |
| `publicMcp` | **yes** (local stdio) | `/mcp.html` documents 8 tools; no hosted endpoint (04:06:13Z) |
| Formats | JSON, CSV, GeoJSON | `/api/puntos.{json,csv,geojson}` per the index |
| Auth | none | stated and observed |
| Licence | open data with attribution; code MIT | `licencia` field in every envelope |
| Rate expectation | poll ≤ every 5 min; data regenerates every 30 min | `cache-control: public, max-age=300` + `/api.html` |
| Discovery | poor | `/api` and `/mcp` return HTML 200; only the sitemap reveals `/api.html` |

## Adoption effort estimate — **S**

Reframe the question: this app is a candidate **reference implementation**, not an adopter.

- It already has an envelope, a licence, a provenance field, closed vocabularies, a confirmation
  model, a refusal list, CORS, and cache guidance. Almost every clause a v0.1 spec would contain
  exists here in some form.
- Real work to conform: emit ISO-8601 consistently (`fuente` mixes machine timestamps with
  human dates like "12 ago"), pick one identifier (`id` vs `slug`), expose a discovery document at a
  conventional path so probers stop concluding "no API", and structure `fuente` into
  `{source_id, source_url, retrieved_at}` instead of prose.
- Its team has already written the argument for the protocol on `/integraciones.html`. They are the
  natural first co-author of RFC-0.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| unidosporpereira | albergues, acopio | ≥6 shared shelters, several shared centres, divergent names and addresses |
| ayuda.red | albergues, acopio | Near-identical Pereira shelter set; ayuda.red adds a `CAFE` prefix to the same municipal collection points |
| alluda | acopio | **Confirmed ingestion** with attribution in `fuente` |
| aquiayuda | everything | AquíAyuda does *not* consume this API despite it being the cheapest source available — a discovery failure, not a capability failure |
| gogo | needs points, road status | Adjacent vocabularies |
| pereiravive | vivienda (4 points here vs 106 listings there) | Same domain, wildly different depth |
| Pereira Responde | colapso (82 points here) | Direct duplication of the damage-report entity |

## Risks & notes

- **PII leak in `fuente`.** Several community-submitted points carry provenance strings of the form
  "Publicado desde la página por {personal name}" or "WhatsApp de {personal name}". The dataset is
  otherwise careful about personal data; this field is the exception, and it ships in the open API.
  No values are reproduced here. Recommended protocol countermeasure: `fuente` becomes a structured
  object with a `source_id` referring to a registry entry, never free text.
- **`estado: verificado` has no verifier and no verification timestamp** — `ultima_validacion` says
  *when*, nothing says *by whom* or *against what*. A protocol claiming verifiability must model the
  verifier.
- **Discovery trap.** `/api` and `/mcp` return 200 HTML. Any convention-based prober mislabels this
  app — as the ecosystem YAML currently does. Argues for a mandatory
  `/.well-known/`-style descriptor in the protocol.
- **MCP is local-only.** Useful for developers with the repo, useless for a hosted agent. If the
  protocol wants agent reach, a hosted MCP profile is the missing piece — and this team is closest to
  shipping one.
- **Two identifier systems** (`id` in the API, `slug` in MCP) in one product.
- **`unverified`:** the `/api.html` documentation page quotes a point total (567) that does not match
  the live `resumen.json` total (214 at 04:06:43Z). Live values are used throughout this dossier;
  the documentation figure is treated as stale, not as evidence.
- Governance, funding and team composition are **`unverified`**; only a WhatsApp contact link is
  published, which is org-level and not reproduced here.
