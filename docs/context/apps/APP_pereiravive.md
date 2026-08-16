# APP_pereiravive — PereiraVive

## TL;DR

- A PHP + Alpine.js rental board (nginx 1.27.5, `x-powered-by: PHP/8.3.33`) holding **106 listings**
  at 2026-08-16T04:04:39Z, addressed as stable, human-guessable URLs: `/arriendo/{n}` with sequential
  integer ids.
- Its `sitemap.xml` is the closest thing to a change feed in this batch: **111 URLs, each with a
  per-record `lastmod`**, several minutes old at probe time (`2026-08-16T04:08:00+00:00`). Sitemap
  polling is a working freshness channel here today, with no code change at all.
- Two modelling ideas the protocol should take: `origen ∈ {avistamiento, propietario}` — a
  **provenance tier** separating "someone photographed a sign in the street" from "the landlord
  published this" — and a **7-day TTL with negative confirmation**, surfaced as *"106 de 106 avisos
  siguen probablemente disponibles"*.
- `publicApi: no`, `publicMcp: no` (all candidate paths 404 at 04:04:45Z–04:04:50Z). `robots.txt` is
  well-written and protects the tokenised owner-edit path.
- Adoption effort **S–M**, and it is the **odd one out on entity**: it is the only app of the seven
  whose core entity is not aid logistics. Its overlap is with Unidos por Pereira's 87 *viviendas* and
  Pereira Ayuda's 4 *vivienda* points — the same domain modelled three ways at three depths.

Inputs: `src/content/ecosystem-apps/pereiravive.yaml`; live probes of `pereiravive.com`
(2026-08-16T04:04:39Z – ~04:08Z).

## Identity

| Field | Value |
|-------|-------|
| Name | PereiraVive |
| URL | https://pereiravive.com/ |
| Category | logistics (YAML) — functionally **housing / rentals** |
| `<title>` | "PereiraVive · Arriendos en Pereira sin registro" |
| `<h1>` | "Pereira se levanta, encuentra un nuevo lugar donde vivir." |
| Affiliation | "Parte de Red Vive" (per YAML); the string *Red Vive* appears on the page, but no `redvive` domain is linked — the relationship is **`unverified`** |
| YAML claims | Free community rental board; find housing, list a place, report a "se arrienda" street sign with a photo, no account; price-gouging reports; Pereira, Dosquebradas, Cartago, Santa Rosa; `publicApi: unknown`, `publicMcp: unknown` |
| Verdict on YAML | **Confirmed in full**, including the no-signup claim, the street-sign flow, the price-gouging channel and the municipality list. Both integration fields resolve to **no**. The YAML's restraint on live listing counts is well-judged; this dossier cites 106 with its timestamp for analysis purposes only |

## Probe log

| URL | UTC timestamp | Status | Content-Type | Bytes |
|-----|---------------|--------|--------------|-------|
| https://pereiravive.com/ | 2026-08-16T04:04:39Z | 200 | text/html; charset=utf-8 | 75232 |
| https://pereiravive.com/robots.txt | 2026-08-16T04:04:41Z | 200 | text/plain; charset=utf-8 | 187 |
| https://pereiravive.com/sitemap.xml | 2026-08-16T04:04:42Z | 200 | application/xml; charset=UTF-8 | 22152 |
| https://pereiravive.com/.well-known/ | 2026-08-16T04:04:44Z | 404 | text/html; charset=utf-8 | 6659 |
| https://pereiravive.com/api | 2026-08-16T04:04:45Z | 404 | text/html; charset=utf-8 | 6659 |
| https://pereiravive.com/api/docs | 2026-08-16T04:04:47Z | 404 | text/html; charset=utf-8 | 6659 |
| https://pereiravive.com/openapi.json | 2026-08-16T04:04:48Z | 404 | text/html; charset=utf-8 | 6659 |
| https://pereiravive.com/mcp | 2026-08-16T04:04:50Z | 404 | text/html; charset=utf-8 | 6659 |
| https://pereiravive.com/robots.txt, /sitemap.xml (contents re-read) | ~2026-08-16T04:08Z | 200 | as above | — |

Nine requests. **No individual `/arriendo/{n}` listing was opened** — a rental ad carries an owner's
WhatsApp number, and nothing in this analysis needs it. `/mi-aviso/` (tokenised owner-edit URLs) and
`/admin` were not touched; both are `Disallow`ed by the site.

Correct 404s on unknown paths, unlike four of the other six hosts. A prober can trust this server's
status codes.

## Observable architecture

- **Server:** `nginx/1.27.5`, `x-powered-by: PHP/8.3.33`, `cache-control: no-cache, private`.
  Server-rendered; the listing grid is in the HTML.
- **Client:** Alpine.js 3.14.1 and Tailwind via CDN (`cdn.tailwindcss.com?plugins=forms`) — the
  runtime-compiled Tailwind build, i.e. a deliberately low-ceremony stack. Google Analytics `gtag`.
- **Same nginx build (1.27.5) as `ayuda.red`.** `inferred`: possibly the same hosting provider or
  operator; not evidence of a shared team, and not asserted as one.
- **`robots.txt`** (04:04:41Z), complete and thoughtful:
  ```
  User-agent: *
  Allow: /
  # El enlace privado del autor lleva su token en la ruta: nunca debe indexarse.
  Disallow: /mi-aviso/
  Disallow: /admin
  Sitemap: https://pereiravive.com/sitemap.xml
  ```
  The comment names the actual reason — owner-edit links carry a capability token in the path — which
  is the same class of care Pereira Ayuda shows.
- **`sitemap.xml`** (04:04:42Z): 111 `<loc>` entries — `/`, `/publicar`, `/denuncias`, `/denunciar`,
  `/mi-aviso`, and ~106 `/arriendo/{n}` listing URLs. Every entry carries a `<lastmod>` with a
  minute-precision UTC timestamp; the freshest at probe time was `2026-08-16T04:08:00+00:00`, i.e.
  regenerated continuously.
- **No structured data**: no JSON-LD, no `schema.org/Offer` or `RealEstateListing` markup, despite
  the domain being one where schema.org has excellent coverage. A one-line win available to them.

## Entity inventory

Single entity type, richly modelled.

| Entity | Visible fields | Freshness signals |
|---|---|---|
| **Aviso de arriendo** (`/arriendo/{id}`) | `tipo` · `municipio` · `barrio` · `precio` · `habitaciones` · description · photos · owner contact (on the listing page) · `origen` | `lastmod` per URL in the sitemap; a 7-day recency filter; a negative-confirmation flag ("ya no está") |

**Filter parameters exposed on the index** — effectively a query API over HTML:
`q`, `tipo`, `municipio`, `barrio`, `precio_max`, `habitaciones`, `frescos`, `origen`, `viewport`.

| Parameter | Vocabulary at 04:04:39Z |
|---|---|
| `tipo` | `apartamento`, `casa`, `habitacion`, `apartaestudio`, `local` — **a clean closed list** |
| `origen` | `avistamiento` ("Visto en la calle") · `propietario` ("Publicado por quien arrienda") |
| `frescos` | checkbox: "Solo avisos recientes (últimos 7 días, sin reportes de que ya no están)" |
| `municipio` | `Cartago`, `Dosquebradas`, `Pereira`, `Santa Rosa de Cabal` — **plus `Pereira cuba`**, a dirty value that has leaked into the list |
| `habitaciones` | 1–5 |
| `barrio` | **free text, uncontrolled** |

**The `barrio` vocabulary is the ecosystem's best worked example of why normalisation belongs in the
protocol.** Values observed in the live filter at 04:04:39Z include: `Poblado`, `Poblado 1`,
`Poblado I`, `Boston`, `Boston- El poblado`, `Condina`, `Condina - Palo Verde`,
`Condina cerca a Mall Palo de Agua`, `Cuba`, `Corales- Cuba`, `Pereira cuba`, `El milagro cuba`,
`Centro`, `Centro Pereira`, `Centro de Pereira`, `La badea`, `Guadalupe`, `Barrio Guadalupe`,
`N/A`, `No especifica`, plus entries that are addresses rather than neighbourhoods
(`Barrio Hernando Vélez Marulanda, detrás del colegio Hernando Vélez`) and named buildings
(`Conjunto residencial ACQUA HILLS`, `Hotel casa natura`).

Five spellings of *El Poblado*, four of *Centro*, and `Cuba` appearing inside four different strings.
Any cross-app join on neighbourhood is arithmetic on noise. The protocol's answer has to be a
municipality-scoped controlled list plus a free-text `neighborhood_raw` passthrough — not a hope that
publishers will clean up.

**Freshness / availability model** — the most interesting thing this app does:

- Listings expire from the "fresh" view after **7 days**.
- Readers can report that a listing is gone; that suppresses it from the fresh view.
- The index states the resulting confidence in words: *"106 de 106 avisos siguen probablemente
  disponibles"* (04:04:39Z). Note the hedge — **probablemente**. This is the same epistemic posture
  Pereira Ayuda encodes as `confirmaciones_24h` / `contradicciones_activas`, expressed as UI copy.
- `origen` adds a second confidence axis: a street-sign sighting is weaker evidence than a landlord
  publishing directly.

Two independent teams arriving at "recency tier + positive/negative confirmation + provenance tier"
is the strongest signal in this whole analysis that these belong in the canonical model, not in a
vendor extension.

## Integration surface

| Question | Answer | Evidence |
|---|---|---|
| `publicApi` | **no** | `/api`, `/api/docs`, `/openapi.json` → clean 404s, 6 659 bytes (04:04:45Z–04:04:48Z) |
| `publicMcp` | **no** | `/mcp` → 404 (04:04:50Z) |
| `/.well-known/` | no | 404 (04:04:44Z) |
| `robots.txt` | yes, with a stated rationale | (04:04:41Z) |
| `sitemap.xml` | **yes, per-record with `lastmod`** | 111 URLs (04:04:42Z) — a de-facto change feed |
| Server-rendered content | yes | listing grid and all filter vocabularies are in the HTML |
| Query surface | yes, via GET params | 9 filter parameters, stable, guessable |
| Structured data | none | no JSON-LD, no microdata |
| Licence / reuse terms | none found | **`unverified`** |

## Adoption effort estimate — **S–M**

- **Why small:** stable integer ids, stable URLs, a per-record `lastmod` already published, a closed
  `tipo` vocabulary, a working provenance flag and a working recency model. A PHP handler emitting
  JSON from the same query the index already runs is a small, well-bounded task.
- **Why not smallest:** `barrio` is free text and `municipio` has already been polluted, so a
  conforming feed needs a normalisation step, not just a serialiser. And the contact field is the
  whole point of a rental listing — the feed must carry a `contact_public` flag and default to
  withholding, which is a product decision as much as a technical one.
- **Cheapest possible first step, available today:** add JSON-LD to each listing page. It costs
  nothing, makes the board readable by search engines and agents immediately, and is a strictly
  smaller commitment than a feed — a good on-ramp to offer a team that has not yet agreed to anything.

## Overlap map

| Overlaps with | Entity | Nature |
|---|---|---|
| unidosporpereira | `#viviendas` — 87 records at 04:03:59Z | **Direct duplication of domain.** UPP carries an `Inmobiliaria` field PereiraVive does not; PereiraVive carries `origen` and a TTL that UPP does not. Neither can reference the other's listings |
| pereiraayuda | `vivienda` category — 4 points at 04:06:43Z | Same domain, 26× shallower; Pereira Ayuda treats housing as one point category among ten |
| aquiayuda | `/vivienda` route | AquíAyuda serves housing from **`encuentraloaunclic.com`** (Quindío), not from PereiraVive — despite PereiraVive being in the same ecosystem directory and the same city. A pure discovery failure |
| Pereira Unida | `rentals` table (`monthly_rent`, `furnished`, `property_type`, `address`…) | Fourth independent rental dataset in the ecosystem |
| alluda, ayuda.red, gogo | — | No overlap |

**Four separate rental datasets** — PereiraVive (106), Unidos por Pereira (87), Pereira Unida
(`rentals`), Encuéntralo a un Clic (`inmuebles`) — plus a fifth shallow one at Pereira Ayuda (4).
Nobody reads anybody. A family displaced by the quake must check five boards. This is the
duplicate-entity problem in its purest form, and it happens to be the one where the protocol's payoff
is easiest to explain to a non-technical stakeholder.

## Risks & notes

- **Not an aid-logistics app.** It is categorised `logistics` in the directory, but its entity is a
  rental listing. The canonical model should treat *housing offer* as its own entity with its own
  privacy profile, not stretch "aid point" to cover it.
- **Contact data is the payload.** Unlike a collection centre, a rental listing is useless without a
  way to reach the owner. Any feed profile must default to withholding contact and expose a
  `contact_public` consent flag captured at publish time — the same pattern Pereira Ayuda's
  `contacto_publicable` uses.
- **Fraud surface.** The site's own copy warns against sending money before seeing a property, and
  Unidos por Pereira's pinned notice warns that scammers are exploiting the emergency. A protocol that
  makes listings trivially syndicable also makes fraudulent listings trivially syndicable. Provenance
  (`origen`) and revocation ("ya no está") must propagate through federation, not just publication —
  **a delete that does not federate is a fraud vector.**
- **Uncontrolled `barrio`, and `municipio` already dirty** (`Pereira cuba`). Normalisation cannot be
  left to publishers.
- **No structured data** on a domain where schema.org is mature — a missed free win.
- **`unverified`:** the *Red Vive* affiliation, licence, team, org, and whether the 7-day TTL removes
  or merely de-emphasises listings.
