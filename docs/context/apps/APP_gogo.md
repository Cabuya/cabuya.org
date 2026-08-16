# APP_gogo — Mapa de Ayuda — Gogó

## TL;DR

- The only app in this batch built on **Google Maps + Firebase/Firestore** rather than the ecosystem's
  Supabase/PHP norm. Firestore project id: `pereira-ayuda` — which is *not* `pereiraayuda.com`, a
  genuine identity collision inside the ecosystem.
- It is also the only one behind an **access gate**: the map is hidden until the visitor types a name
  into `#gate`. No crawler, no agent and no partner sees a single record. Its data is invisible by
  construction, not by omission.
- Distinct data model: `TIPOS_AYUDA` encodes **supply/demand polarity into the type itself** —
  `hidratacion_provee` vs `hidratacion_necesita`, `medicina_humana_provee` vs
  `medicina_humana_necesita`. Three Firestore collections: `reportes`, `cierres_via`, `negocios`.
- Its `negocios` layer (open businesses: restaurants, shops, pharmacies, hardware, bakeries, cafés,
  services, pet shops) is an entity **no other app in this batch models as a first-class type**, and
  the ecosystem's most under-served category.
- `publicApi: no`, `publicMcp: no` — every probed path returns the same 110 722-byte page. Its
  `robots.txt` is broken: it returns HTML with `content-type: text/plain`. Adoption effort **M**.

Inputs: `src/content/ecosystem-apps/gogo.yaml`; seed `URL_PROBE.txt` / `ENRICHED_PROBE.json`;
live probes of `soygogo.com` (2026-08-16T04:04:55Z – ~04:10Z).

## Identity

| Field | Value |
|-------|-------|
| Name | Mapa de Ayuda — Gogó |
| URL | https://soygogo.com/pereira-ayuda |
| Category | logistics |
| `<title>` / `<h1>` | "Mapa de Ayuda — Pereira \| Gogó" / "Mapa de Ayuda — Pereira" |
| Host product | `soygogo.com` is a broader Gogó platform; the emergency map is a section of it, not a standalone app |
| Self-attribution | gate card carries a "Una iniciativa…" badge (`gogo-badge`) |
| YAML claims | Help map for Pereira published by Gogó; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed but thin.** The YAML describes a map of help points; the app is a three-layer reporting tool (need-zones, road closures, open businesses) with a write path and a national city selector. Both integration fields resolve to **no**. The `limits` note about coverage depending on Gogó is accurate and, given the access gate, an understatement |

**Identity collision to record for the registry.** The Firebase project behind this map is literally
named `pereira-ayuda`, while a different team runs `pereiraayuda.com`. Any registry keyed on
human-guessable slugs will conflate them. Registry entries must be keyed on canonical URL, with the
display name as a label.

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://soygogo.com/pereira-ayuda | 2026-08-16T04:04:55Z | 200 | text/html | 272943 |
| https://soygogo.com/robots.txt | 2026-08-16T04:04:57Z | 200 | text/plain; charset=utf-8 | 112558 |
| https://soygogo.com/sitemap.xml | 2026-08-16T04:04:58Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/.well-known/ | 2026-08-16T04:04:59Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/api | 2026-08-16T04:05:01Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/api/docs | 2026-08-16T04:05:02Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/openapi.json | 2026-08-16T04:05:04Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/mcp | 2026-08-16T04:05:05Z | 200 | text/html; charset=utf-8 | 110722 |
| https://soygogo.com/robots.txt (contents re-read) | ~2026-08-16T04:10Z | 200 | text/plain | 112558 |

Nine requests, all public GETs. No Firestore query was issued; the Firebase config is public in the
page but was not exercised.

## Observable architecture

- **Edge:** Cloudflare (`cf-cache-status: HIT`, `cache-control: public, max-age=0, must-revalidate`).
  No origin framework fingerprint (`x-powered-by` absent, no generator meta).
- **Client:** hand-written vanilla JS with inline CSS custom properties, no framework. Third-party
  scripts loaded: Google Maps JavaScript API (referrer-restricted browser key, not reproduced here)
  and Firebase 10.13.1 compat SDKs — `firebase-app-compat`, `firebase-auth-compat`,
  `firebase-firestore-compat`.
- **Backend:** Cloud Firestore, project id `pereira-ayuda`. Collections referenced by the client:
  **`reportes`**, **`cierres_via`**, **`negocios`**.
- **`robots.txt` is broken.** It returns 112 558 bytes with `content-type: text/plain` whose body
  begins with Cloudflare's "content signals" boilerplate and then continues into the site's own HTML
  — the tail of the response is `</script></body></html>` including a geolocation-permission script.
  `inferred`: a Cloudflare managed-robots feature is prepending its block to an origin catch-all that
  serves the app page. Net effect: **no parseable crawl directives, no `Sitemap:` line.**
- **`sitemap.xml` does not exist** — it returns the app page as `text/html` (04:04:58Z). Same for
  every other probed path; the origin has a blanket catch-all with HTTP 200, which is the worst case
  for automated discovery (a prober cannot distinguish "exists" from "does not exist" by status code
  alone).
- **Access gate.** The document contains `<div id="gate">` covering the viewport at `z-index:5000`
  with the copy *"Ingresa tu nombre para continuar."*, a text input
  (`"Tu nombre (para identificar tus reportes)"`) and an `Entrar` button calling `tryEnter()`. The
  map is behind it.
- **Geolocation:** the page requests the Notification permission and polls the visitor's position on
  an interval (`GOGO_GEO_CONFIG.checkIntervalMs`, `gogoRevisarUbicacion`). `inferred`: proximity
  alerts. Worth noting as a privacy posture difference from the rest of the batch, which uses
  location only on demand.

## Entity inventory

No records are in the HTML — all three collections load from Firestore after the gate. What the
client code and the report forms expose:

| Entity | Firestore collection | Fields visible in the create form | Freshness signals |
|---|---|---|---|
| **Zona / punto de ayuda** | `reportes` | Categoría de necesidad · Urgencia (`alta`/`media`/`baja`) · Personas afectadas (aprox.) · Capacidad · ¿Cuánto puede proveer? · Cantidad necesaria · Cantidad ya cubierta (`total`/`cantidad` modes) · ¿Quién está atendiendo? (optional) · Dirección / referencia del lugar · Descripción · Contacto (teléfono, optional) | `timestamp` field present in the client code; no user-visible recency label observed |
| **Cierre de vía** | `cierres_via` | "Reportar calle cerrada" form; `--cierre` colour token | as above |
| **Negocio abierto** | `negocios` | Nombre del negocio · Tipo de negocio · Disponibilidad · ¿Domicilio o recogida en sitio? · ¿Qué tienen disponible? · Dirección / referencia del lugar · Contacto (teléfono, optional) | as above |

**`TIPOS_AYUDA` — the vocabulary worth stealing.** The type enum pairs each resource with a polarity:

| Resource | Supply type | Demand type | Aggregate label |
|---|---|---|---|
| Alimentación | `cocina` (Cocina / Centro de preparación) | `punto_comida` (Punto que necesita comida) | Cocinas / Comida |
| Hidratación | `hidratacion_provee` (Punto de hidratación disponible) | `hidratacion_necesita` (Punto que necesita agua) | Puntos de agua / Necesita agua |
| Medicina humana | `medicina_humana_provee` (Punto médico / Botiquín) | `medicina_humana_necesita` | — |
| Medicina mascotas, alimentos no perecederos, donación de ropa / bebés / adulto mayor, kits de aseo, colchones y carpas, socorristas, dotación de rescatistas | same `_provee` / `_necesita` pattern, per the CSS token set | | |

Quantities are modelled per report — *cantidad necesaria*, *cantidad ya cubierta*, *cuánto puede
proveer*, *personas afectadas*, *capacidad* — which makes Gogó the only app here with an explicit
**coverage-gap** model (need minus covered) at the point level. alluda has quantities but splits them
across `necesidades` and `inventario`; Gogó keeps them on one record.

`NEGOCIO_TIPOS`: `restaurante, tienda, farmacia, ferreteria, panaderia, cafe, servicios, mascotas,
otro`.

**Geography:** `PEREIRA_CENTER` as the default map centre; `CIUDADES_PRIORIDAD` = Pereira, Manizales,
Armenia, Quimbaya, Salento, Chocó; `CIUDADES_RESTO` = 29 further Colombian capitals. So the app is
national-capable with an Eje Cafetero + Chocó priority, not Pereira-only as the YAML implies.

## Integration surface

| Question | Answer | Evidence |
|---|---|---|
| `publicApi` | **no** | `/api`, `/api/docs`, `/openapi.json` all return the app page, 200 `text/html`, 110 722 bytes (04:05:01Z–04:05:04Z). No documented endpoint; no first-party API referenced in the client |
| `publicMcp` | **no** | `/mcp` → same catch-all page (04:05:05Z) |
| `robots.txt` | **malformed** | 200 `text/plain` containing HTML; no directives, no `Sitemap:` (04:04:57Z) |
| `sitemap.xml` | **absent** | app page returned (04:04:58Z) |
| `/.well-known/` | absent | app page returned (04:04:59Z) |
| Server-rendered data | **none** | records live in Firestore and load after the gate |
| Accessible without interaction | **no** | `#gate` blocks the map until a name is entered |
| Licence / reuse terms | none found | **`unverified`** |

*De facto* surface: Firestore exposes a REST/gRPC API governed by security rules, and the project id
and web API key are in the page as they must be. **No query was made**, so whether the collections
are world-readable is **`unverified`** — and deliberately left that way. That question belongs to the
Gogó team, not to an outside prober.

## Adoption effort estimate — **M**

- **Cheapest technically, hardest organisationally.** A Cloud Function reading three collections and
  emitting a JSON feed is an afternoon's work — the protocol's stated design target. Firestore
  documents already carry `timestamp`, so freshness is available without a schema change.
- **But the gate is the real cost.** The product decision that you must identify yourself to see the
  map is incompatible with publishing an open feed, and it is a decision, not an oversight. Adoption
  here means the team agreeing that *place-level* data (open businesses, road closures, need-zones
  without contacts) is public even though the interactive map is gated. That is a conversation, and
  it may end in "no".
- **Vocabulary mapping is straightforward and valuable in both directions.** The `_provee`/`_necesita`
  polarity is cleaner than what most of the ecosystem does and should feed into the canonical model
  rather than being flattened away.
- **Uncertainty:** `soygogo.com` is a commercial platform hosting a civic map. Licensing and data
  ownership are unstated, so the adoption path may have a commercial dimension the other six do not.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| unidosporpereira | road closures (`#pordondenotransitar`, 5 records) vs `cierres_via`; `Local que ayuda` (3) vs `negocios` | Same two entities, different depth — Gogó models them as first-class, UPP as a section |
| ayuda.red | road/risk and damage context | Adjacent; ayuda.red has no business layer |
| alluda | need quantities | alluda splits need vs stock across two tables; Gogó keeps a single point with need/covered quantities |
| pereiraayuda | `necesita_ayuda` (69 points) | Direct conceptual overlap with `reportes`; Pereira Ayuda has no business or road-closure category |
| pereiravive | — | none |
| aquiayuda | — | Not consumed; not consuming. Gogó is fully outside the AquíAyuda federation |
| Pereira Responde | `type: road` reports | Direct overlap on road closures |

**Gogó is the ecosystem's most isolated app**: no one reads it, it reads no one, and its gate means
nobody *can* read it. It is also the one holding a category — open businesses with delivery/pickup
and stated availability — that nobody else holds. That combination is precisely what a protocol is
for.

## Risks & notes

- **The access gate makes the data unreachable to agents, crawlers, partners and search.** Anyone
  searching "farmacia abierta Pereira" will not find this map. Whatever the reason for the gate, it
  is worth the team knowing what it costs them.
- **A name-only gate is not authentication** and offers no protection to the reporters whose contact
  numbers sit behind it; it mainly imposes friction on legitimate readers. Raise as feedback, not as
  a vulnerability.
- **Catch-all 200 on every unknown path** is actively hostile to automated discovery, and it is why
  a status-code-based probe of this host yields nothing usable. Reinforces the case for a mandatory
  well-known descriptor in the protocol.
- **Broken `robots.txt`** (HTML served as `text/plain`) — a real, reportable misconfiguration.
- **Continuous geolocation polling plus a notification-permission request** is a heavier privacy
  posture than the rest of the batch. Not a protocol matter, but relevant if this app ever becomes a
  data producer for others.
- **`unverified`:** Firestore rules, whether the collections are world-readable, record counts, data
  freshness in practice, licence, team, and the relationship between the civic map and the commercial
  Gogó platform. None of these were probed; several of them should be *asked*.
