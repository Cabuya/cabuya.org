# APP_ayudared — ayuda.red

## TL;DR

- Exact branding: lowercase **`ayuda.red`**, styled as the domain itself. Full page title:
  *"ayuda.red — Ayuda Colombia · Sismo del 10 de agosto de 2026"*. It self-describes as *"ciudadana,
  sin ánimo de lucro"*. **This name collides with the obvious protocol-name candidates in the
  `ayuda*` space and must be excluded from the naming shortlist in Task 5.**
- Alone among the seven, it is **national in scope**: 226 collection-centre and shelter records
  across 57 municipalities in at least 15 departments (home page, 2026-08-16T04:04:26Z) — Cali,
  Manizales, Bogotá, Medellín, Barranquilla, Quibdó, Cartagena and more, not just Risaralda.
- Next.js on nginx, fully server-rendered, `cache-control: private, no-cache, no-store` — content is
  in the HTML and reachable by an agent, but nothing is cacheable and nothing is a feed.
- `publicApi: no`, `publicMcp: no`: `/api`, `/api/docs`, `/openapi.json`, `/mcp` and `/.well-known/`
  all return the Next.js 404 page (04:04:32Z–04:04:38Z). A 9-URL sitemap and a real `robots.txt`
  exist.
- It hosts a **missing-persons registry**. Per plan rules, its existence is recorded and **no listing
  was opened**; `robots.txt` itself disallows the individual case pages. People-data here is
  link-out-only by design in every protocol decision that follows.
- Adoption effort **M**: no data layer is observable from outside, its national scope means it would
  be the ecosystem's biggest producer, and its rescue/damage/missing-persons mix needs the sharpest
  publish/never-publish boundary of any app in the batch.

Inputs: `src/content/ecosystem-apps/ayudared.yaml`; seed `URL_PROBE.txt` / `ENRICHED_PROBE.json`;
live probes of `ayuda.red` (2026-08-16T04:04:26Z – ~04:08Z).

## Identity

| Field | Value |
|-------|-------|
| Name (exact) | **ayuda.red** — lowercase, dot included, no capitalisation anywhere on the page |
| URL | https://ayuda.red/ |
| Category | logistics (YAML) — functionally a **national multi-entity emergency map** |
| Meta description | "Mapa de puntos de acopio, albergues, voluntariado e instituciones; registro de personas desaparecidas; canales de donación verificados y guías oficiales tras el sismo de magnitud 7.4 en Chocó." |
| Publisher | "ciudadana, sin ánimo de lucro" (`/guias/apps`, ~04:08Z). No org name, team or legal entity published — **`unverified`** |
| YAML claims | Map of collection, shelters, volunteering, institutions; missing-persons registry; donation channels and official guides; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed; scope badly understated.** The YAML reads as a Pereira app; it is a national one. Both integration fields resolve to **no**. The `limits` note ("we do not reproduce missing-person PII on corag.app") is correct and should be kept |

**Naming conflict, stated plainly.** `ayuda.red` is a live, national, well-known brand in this
emergency. Any protocol name built on *ayuda* + a network word ("red", "network", "AyudaRed",
"RedAyuda", "ayuda.network") will be read as either this project or a fork of it. Task 5 should treat
the entire `ayuda*` + network-metaphor space as occupied.

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://ayuda.red/ | 2026-08-16T04:04:26Z | 200 | text/html; charset=utf-8 | 724158 |
| https://ayuda.red/robots.txt | 2026-08-16T04:04:29Z | 200 | text/plain | 168 |
| https://ayuda.red/sitemap.xml | 2026-08-16T04:04:30Z | 200 | application/xml | 1466 |
| https://ayuda.red/.well-known/ | 2026-08-16T04:04:32Z | 404 | text/html; charset=utf-8 | 21208 |
| https://ayuda.red/api | 2026-08-16T04:04:33Z | 404 | text/html; charset=utf-8 | 21208 |
| https://ayuda.red/api/docs | 2026-08-16T04:04:35Z | 404 | text/html; charset=utf-8 | 21208 |
| https://ayuda.red/openapi.json | 2026-08-16T04:04:36Z | 404 | text/html; charset=utf-8 | 21208 |
| https://ayuda.red/mcp | 2026-08-16T04:04:38Z | 404 | text/html; charset=utf-8 | 21208 |
| https://ayuda.red/robots.txt, /sitemap.xml (re-read for contents) | ~2026-08-16T04:08Z | 200 | as above | — |
| https://ayuda.red/guias/apps | ~2026-08-16T04:08Z | 200 | text/html | — |

Ten requests. **`/desaparecidos` and every `/desaparecidos/AC-*` case page were deliberately not
fetched**, per the plan's zero-PII rule and this task's explicit instruction. `/danios/DA-*` case
pages and `/admin` were likewise not touched — all three are `Disallow`ed by the site's own
`robots.txt`.

## Observable architecture

- **Stack:** Next.js (`x-powered-by: Next.js`) behind `nginx/1.27.5`. The document contains a single
  `self.__next_f.push` RSC flight chunk and no `__NEXT_DATA__` — consistent with the App Router and
  React Server Components. `inferred`: server-rendered per request, not statically exported.
- **Caching:** `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`. Nothing is
  cacheable by an intermediary, and there is no `ETag`/`Last-Modified` to poll against. A consumer
  has no polite way to check for changes short of refetching 724 KB.
- **No client-side data endpoints leak into the HTML** — no Supabase host, no `/api/*` string, no
  Firebase config. The data layer is entirely server-side. This is the most closed of the seven from
  an integration standpoint, and the most robust from a security standpoint.
- **`robots.txt`** (04:04:29Z), complete:
  ```
  User-Agent: *
  Allow: /
  Disallow: /admin
  Disallow: /admin/
  Disallow: /desaparecidos/AC-
  Disallow: /danios/DA-
  Disallow: /reparar
  Sitemap: https://ayuda.red/sitemap.xml
  ```
  The two record-prefix disallows tell us the identifier scheme without opening a single record:
  **missing-persons cases are `AC-*`, damage reports are `DA-*`.** Prefixed, typed, human-readable
  ids — the only such scheme observed in this batch, and a good model for the protocol, minus the
  entity that must never federate.
- **`sitemap.xml`** (04:04:30Z), 9 URLs: `/`, `/donar`, `/danios`, `/desaparecidos`, `/solicitar`,
  `/guias`, `/guias/replicas`, `/guias/kit`, `/guias/apps`. Index-level pages only — no per-record
  URLs, no `lastmod` values observed.
- **In-app routes** found in the rendered navigation: `/`, `/chat`, `/danios`, `/desaparecidos`,
  `/donar`, `/rescates`, `/rescates/nuevo`, `/situacion`, `/solicitar`. Note `/rescates` and `/chat`
  are live routes absent from the sitemap.

## Entity inventory

Entity types visible on the home page (2026-08-16T04:04:26Z). Records are rendered as
`kind → name → address/reference → municipality → department` tuples.

| Entity | Observed shape | Freshness signals |
|---|---|---|
| **Rescate en curso** | status line (`Rescate en curso`) + situation line (`Búsqueda bajo escombros` \| `Se reportan N bajo escombros`) + place description + municipality + department | none observable in the HTML |
| **Daño** | severity (`Daño colapso`, `Daño leve`) + structure type (`Casa o apartamento`, `Colegio o universidad`) + address + municipality + department; ids `DA-*` | none observable |
| **Acopio** | name + address/reference + municipality + department | none observable |
| **Albergue** | name + address/reference + municipality + department | none observable |
| **Personas desaparecidas** | registry exists; ids `AC-*`; index at `/desaparecidos` | **not inspected — by design** |
| Solicitar / Donar / Guías / Chat / Situación | supporting surfaces | — |

**No freshness metadata is exposed for any record.** No "actualizado" label, no relative-age string,
no confirmation counter appeared in the rendered document. Among seven apps this is the only one
carrying no visible per-record recency signal at all — which, at 226 place records covering
57 municipalities, is the highest-volume unfreshness risk in the ecosystem.

**Coverage** (57 municipalities named in acopio/albergue records at 04:04:26Z): Acacías,
Ansermanuevo, Armenia, Barranquilla, Bogotá, Bosconia, Bucaramanga, Buenaventura, Cajicá, Cali,
Candelaria, Cartagena, Cartago, Chía, Cota, Cáqueza, Cúcuta, Dosquebradas, El Copey, Facatativá,
Florencia, Floridablanca, Funza, Fusagasugá, Granada, Ibagué, Itagüí, La Ceja, Manizales, Medellín,
Montería, Neiva, Pacho, Pailitas, Pasto, Pereira, Popayán, Quibdó, Riohacha, Rionegro, Sabaneta,
San Diego, San Gil, San José del Guaviare, Santa Marta, Sincelejo, Soledad, Tenjo, Tunja, Valledupar,
Villavicencio, Villeta, Yopal, Yumbo, Zipaquirá (plus two malformed values, `"12"` and `"2"` —
a parsing or data-entry defect visible in the rendered list).

**Risaralda records** (place level only, 04:04:26Z):

| Kind | Name | Reference | Municipality |
|---|---|---|---|
| Albergue | Coliseo Mayor de Pereira | Coliseo Mayor de Pereira | Pereira |
| Albergue | Ecoparque El Vergel | Ecoparque El Vergel | Pereira |
| Albergue | Estadio Mora Mora | Estadio Mora Mora | Pereira |
| Albergue | Parque El Oso | Parque El Oso | Pereira |
| Albergue | Parque Olaya Herrera | Parque Olaya Herrera | Pereira |
| Albergue | Plaza de Ferias | Plaza de Ferias | Pereira |
| Acopio | CAFE Comuna del Café | Carrera 3 con calle 59A, sector A del Parque Industrial | Pereira |
| Acopio | CAFE Consota | Manzanas 7 y 8, Villa Consota, Cuba | Pereira |
| Acopio | CAFE El Remanso | Avenida principal del barrio El Remanso, junto al centro de salud | Pereira |
| Acopio | CAFE Kennedy | Parque principal de Kennedy, junto a la cancha | Pereira |
| Acopio | CAFE Ormaza | Calle 3 bis #5-38, avenida del Río | Pereira |
| Acopio | CAFE Perla del Otún | Diagonal a la iglesia de los 2.500 Lotes, Cuba | Pereira |
| Acopio | CAFE San Nicolás | Carrera 14 bis #28-38, antigua estación de Policía | Pereira |
| Acopio | Centro de Desarrollo Empresarial 2.500 Lotes / Parque Industrial / Tokio | (three records) | Pereira |
| Acopio | Complejo Bodeguero Alpaca, Bodega 01 | Vía La Romelia, El Pollo, Vereda Santa Ana Baja | Pereira |
| Acopio | Banco de Alimentos de Pereira — punto alterno La Badea | Transversal 5 #6-30, Calle de Las Aromas, La Badea | Dosquebradas |

Two naming behaviours matter for the protocol:

1. **Systematic prefixing.** Municipal collection points carry a `CAFE ` prefix here and appear bare
   elsewhere (`Ormazá`, `Kennedy`, `San Nicolás` in Pereira Ayuda). Exact-name matching fails on every
   one of them; address matching succeeds on all of them.
2. **Cross-municipality name collision.** `Coliseo Mayor de Pereira` and `Coliseo Mayor de Manizales`
   both exist in this dataset, and Pereira Ayuda / Unidos por Pereira both call theirs simply
   *"Coliseo Mayor"*. A protocol that keys places on name — even name + fuzzy match — merges two
   buildings 50 km apart. **Place identity must be municipality-scoped at minimum.**

## Integration surface

| Question | Answer | Evidence |
|---|---|---|
| `publicApi` | **no** | `/api`, `/api/docs`, `/openapi.json` → 404 Next.js error page, 21 208 bytes each (04:04:33Z–04:04:36Z). No `/api/*` string anywhere in the rendered HTML |
| `publicMcp` | **no** | `/mcp` → 404 (04:04:38Z) |
| `/.well-known/` | no | 404 (04:04:32Z) |
| `robots.txt` | yes, real directives | (04:04:29Z) |
| `sitemap.xml` | yes, 9 index URLs | (04:04:30Z) |
| Server-rendered content | **yes, complete** | 724 KB of records in the document — agent-readable, if expensively |
| Cacheability | **none** | `private, no-cache, no-store`; no `ETag`, no `Last-Modified` |
| Licence / reuse terms | none found | **`unverified`** |

## Adoption effort estimate — **M**

- **Working in its favour:** a real server-side data layer, a typed prefixed identifier scheme
  (`AC-`, `DA-`), Next.js route handlers make a JSON endpoint a small task, and the team already
  reasons about what to expose (the `robots.txt` disallows are precise and intentional).
- **Working against it:** no freshness metadata exists to publish, so a conforming feed requires a
  schema change, not just a serialiser. Its national footprint means its feed would immediately be
  the largest in the ecosystem, raising real questions about volume, pagination and change detection
  that no other app forces.
- **The hard part is the boundary.** This is the only app in this batch mixing collection centres and
  shelters (federate) with rescue operations, damage reports and a missing-persons registry
  (do not federate, ever). Its adoption work is 30 % code and 70 % agreeing, in writing, on the
  publish/never-publish line — and getting that agreement right here protects the whole protocol.
- The malformed municipality values (`"12"`, `"2"`) show input validation gaps that a feed would
  export directly.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| pereiraayuda | albergues, acopio | **Near-total on Pereira shelters** — 5 of 6 ayuda.red Pereira shelters appear in Pereira Ayuda's `albergue.json`; the municipal `CAFE *` acopio set maps 1:1 to Pereira Ayuda's bare-named set |
| unidosporpereira | albergues, acopio | Same physical shelters, third naming variant |
| alluda | acopio | Same national ambition (42 vs 57 municipalities), different rosters, no shared ids |
| pereiraayuda + Pereira Responde | damage reports | `DA-*` records duplicate the `colapso` category and Pereira Responde's `type: housing` reports |
| gogo | road/risk status | Adjacent |
| encontrados / sospereira | missing persons | **Link-out only.** No federation, no mirroring, no analysis of individual records |
| aquiayuda | — | Not consumed by AquíAyuda; not consuming anything |

`/guias/apps` (~04:08Z) is an app directory, but it lists **official and seismological tools only** —
Sismo Sentido (SGC), Yo Reporto (UNGRD), the SGC mobile app, LastQuake, Earthquake Network,
My Earthquake Alerts, Bridgefy, QuakeLink and native offline sharing. It names **no** community board
from this ecosystem and makes no statement about data sharing or duplication between them. The
ecosystem is not yet visible to itself.

## Risks & notes

- **Missing-persons registry: existence recorded, contents untouched.** `/desaparecidos` exists;
  individual cases are `AC-*` and are `Disallow`ed by the site. No listing was opened at any point in
  this analysis, and no field, count or record from it appears in any output of this plan.
  **Protocol position: people-data is link-out only, by design, permanently.**
- **Name collision with the protocol's naming space** — see Identity. This is an input to Task 5, not
  a criticism of the app.
- **No freshness anywhere.** 226 place records with no visible recency signal, on a `no-store` page.
  A consumer cannot tell a shelter confirmed this morning from one copied on 11 August.
- **No licence, no team, no contact at organisation level.** Everything is `unverified` beyond the
  self-description "ciudadana, sin ánimo de lucro". For a national dataset that is a governance gap
  worth raising before any federation.
- **Rescue-status records are the most time-critical and least verifiable data in the ecosystem**
  (`"Se reportan N bajo escombros"`). Whatever the protocol does, it should not make this class of
  record easier to copy than to correct.
- **Data-entry defects visible in production**: two municipality values are bare numbers.
- `inferred` throughout the architecture section where marked; the data layer is not observable from
  outside and no attempt was made to discover it.
