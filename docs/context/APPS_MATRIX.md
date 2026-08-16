# APPS_MATRIX.md — Consolidated Capability Matrix (20 apps)

> **TL;DR**
> 1. The ecosystem's real integration surface is **double the directory baseline**: **4 confirmed public APIs** (Corag, Pereira Responde, PereiraAyuda, Reporte CO) and **3 confirmed MCPs** (Corag, PereiraAyuda, Pereira Responde) — three YAML entries are materially out of date, all in the *under*-stated direction.
> 2. **9 of 20 apps are feed-ready at S** (an afternoon of work or less); only 3 are L, and two of those for policy/identity reasons, not engineering.
> 3. The **duplicate-place problem is proven at production scale**: ~20 concrete cases where the same physical shelter/collection center appears in 2–3 apps under different names, IDs, and even *opposite operational status*. Exact-name matching fails on 100% of cases; address matching succeeds on 100%.
> 4. **Consolidation is already underway** (SOS Terremoto is migrating into Corag): the alternative to federation is absorption, which puts a clock on RFC-0.
> 5. Three teams **independently invented the same freshness/verification model** — it goes in the protocol core. Discovery is broken ecosystem-wide (catch-all 200s defeated our own probes on 4 hosts) — the well-known descriptor must be **mandatory**.
>
> Sources: 20 dossiers in `apps/` (probes 2026-08-16T04:00–04:12Z) + 4 analyst reports. Every claim below is sourced in the corresponding dossier; `unknown` never means "doesn't have".

## 1. The matrix

Legend: **Feed-readiness** = effort to publish a v0.1-conforming place feed (S = afternoon, M = days, L = blocked on non-engineering factors). **API/MCP** = confirmed public surface (`yes` verified live; `de-facto` = open endpoint without docs; `unknown` = not confirmed, never "no").

| # | App (slug) | Cat. | Stack (observed) | Entities exposed | Freshness signal | API | MCP | Feed | Overlap cluster |
|---|---|---|---|---|---|---|---|---|---|
| 1 | corag | matching | Next.js (inferred) / Vercel; OpenAPI 3.1; CORS `*` | request/offer, logistics ops, panorama, emergencies | STRONG: `generatedAt`, per-record `timeline[]` | **yes** | **yes** | **S** | pereiraunida (same entity+geo) |
| 2 | pereiraunida | matching | Next.js App Router / Vercel + Supabase | help_request, volunteer, **rentals**, family | STRONGEST: `last_confirmed_at` + "hace N min" + 6h filter | unknown | unknown | S–M | corag; 10-app Pereira collision |
| 3 | sostremoto | matching | Next.js / Railway, CSR | help board (15 categories) | WEAK: "En vivo" label only | unknown | unknown | M (**migrating → Corag**) | corag (absorption in progress) |
| 4 | helpthemdirectly | matching* | Static + CF Worker + credentialed backend | campaigns (families, event-scoped incl. Venezuela) | NONE | unknown | unknown | L → **directory-only tier** | weak; *miscategorized: direct_aid |
| 5 | pereiraresponde | damage | SPA + Swagger UI; OpenAPI 3.1 | reports: housing/road/support, 4 risk levels, 1–3 photos | Excellent: ISO `createdAt`, 6h-fresh sample | **yes** | **yes** (POST /mcp in own spec) | **S** | damage cluster + acopio shortcuts |
| 6 | sismovision | damage | Vite+React / Vercel + Django REST (api. subdomain) | crack reports, professional reviews | not exposed | unknown | unknown | M | damage cluster |
| 7 | mapadelterremoto | damage | 551-URL site; Dataset JSON-LD; **DIVIPOLA + EDAN** | municipality damage aggregates (432 muni pages) | **BEST**: sitemap `lastmod` ≡ `dateModified`, 38 min | unknown | unknown | **S** | national aggregator (damage) |
| 8 | reporteco | damage | Next.js 16 **open source** + Supabase | PII-free reports; **GeoJSON/CSV/KML/JSON feed** | `max-age=60`; ⚠ data appears seeded, not live | **yes** | unknown | **S** | damage cluster |
| 9 | terremotocolombia | damage | Express API + CDN; **MIT open source**; org JSON-LD | 7 types; only missing-persons populated (307) at probe | n/a | unknown (robots Disallow /api — honored, not probed) | unknown | M | people entanglement |
| 10 | gravitas | damage | Next.js / Vercel, client-side data | edificio, acopio, logística, voluntariado | Weakest: page `age` ≈ 3.4 days | unknown | unknown | L (no public identity/licence/contact) | isolated |
| 11 | aquiayuda | logistics | Vite+React SPA; **client-side federation over 5 sources** | none owned — consumes centros/necesidades/inventario/… | consumer staleTime only | no | no | **S** (as consumer; adapters → protocol) | alluda (consumed wholesale) |
| 12 | alluda | logistics | Vite + Supabase (realtime) | centros, necesidades, inventario, transportes, ofrecimientos, voluntarios | `inventario.updated_at`; **centros has none** | de-facto (PostgREST) | no | S–M | aquiayuda, pereiraayuda |
| 13 | unidosporpereira | logistics | PHP 8.3 SSR + Leaflet | albergues, acopio, riesgos, salud, viviendas(87), comidas, mascotas | Best-in-batch UI: `frescura` tier + `verificado` + `aprox` | de-facto (`/mapa-datos.php` JSON) | no | **S** | pereiraayuda, ayudared (same shelters) |
| 14 | pereiraayuda | logistics | Static + Supabase RLS + Python generator | 10 categories, 214 places | **Best specified**: `ultima_validacion` + `confirmaciones_24h` + `contradicciones_activas` | **yes** (JSON/CSV/GeoJSON, open-data licence) | **yes** (8 tools incl. negative confirmation + consent flag) | **S** (reference implementation) | ayudared (near-total on shelters) |
| 15 | ayudared | logistics | Next.js SSR / nginx | acopio+albergues **226 recs / 57 municipios (national)**; DA-*/AC-* registries | **NONE** — no recency signal at all | no | no | M | pereiraayuda + national |
| 16 | gogo | logistics | Google Maps JS + Firebase (project `pereira-ayuda`!) | need-zones, road closures, open businesses | code-level only | no | no | M (name-gate UX blocks read) | unidosporpereira |
| 17 | pereiravive | logistics | PHP + Alpine.js | rental notices (106) | Sitemap per-record `lastmod` + 7-day TTL + **negative confirmation** + `origen` tier | no | no | S–M | unidosporpereira viviendas; 4 rental datasets ecosystem-wide |
| 18 | encuentratumascota | pets | Laravel / shared hosting | pet notices (se busca) | not exposed | unknown | unknown | **S** (small clean entity; UUIDv4 ids; brokered contact) | unique coverage |
| 19 | encontrados | people | (see dossier) — has a public API in its public repo, **including people search** | missing-person matching tool | n/a | yes (exists — **must never federate**) | unknown | **LINK-OUT by design** | sospereira |
| 20 | sospereira | people | Laravel self-hosted, Alcaldía branding | 3 domains: missing persons ✗, damaged structures ✓, business census (external form) | n/a | unknown | unknown | **LINK-OUT** (2 of 3 domains federable in principle; institutional process) | encontrados; damage cluster |

## 2. Overlap clusters (who duplicates whom)

| Cluster | Apps | What duplicates |
|---|---|---|
| **Pereira shelters/acopio** (the core problem) | pereiraayuda · unidosporpereira · ayudared · alluda · aquiayuda · gogo | Same physical shelters and collection centers, different names/IDs/status |
| Person-to-person matching | corag · pereiraunida · (sostremoto → absorbing into corag) | request/offer entities, same geography |
| Damage reports | pereiraresponde · sismovision · reporteco · terremotocolombia · gravitas · mapadelterremoto (aggregate) · sospereira (institutional) | geolocated damage, disjoint specializations (infra vs cracks vs citizen vs aggregate) |
| Rentals/housing (validated blind spot) | pereiraunida (87) · pereiravive (106) · aquiayuda `/vivienda` (via encuentraloaunclic.com) · unidosporpereira viviendas | 4 independent rental datasets, zero cross-links |
| People (excluded from federation) | encontrados · sospereira · terremotocolombia (307) · ayudared (AC-*) | **4 apps hold missing-persons data** — exclusion zone is bigger than the 2 "people" category apps |

### 2.1 Duplicate-place evidence (concrete, place-level, no PII)

**Same building, 3 apps, 3 names, 0 shared IDs** (probes 04:04–04:10Z): Coliseo Mayor ("Coliseo Mayor" / "coliseo Mayor" **Lleno** / "Coliseo Mayor de Pereira"); Ecoparque El Vergel (coords **1.7 km apart** between two apps); Estadio Alberto Mora Mora (coords ~2 km apart); Parque El Oso; Parque Olaya Herrera; Centro Vida Violetas (municipality stated in one app, absent in the other); Polideportivo Campestre B.

**Systematic prefix divergence** on municipal collection centers: pereiraayuda "Kennedy" ≡ ayudared "CAFE Kennedy" (identical addresses) — 9 such pairs, including an accent drop (Ormazá/Ormaza) and a name expansion (Tokio / "Centro de Desarrollo Empresarial Tokio").

**The three killer cases:**
1. **Same address, opposite status:** Cl. 43 #13-74 Dosquebradas — "Colegio Maria Auxiliadora" **Activo** (unidosporpereira) vs "Centro de acopio IE María Auxiliadora **(cerrado ahora)**" (alluda). A donor gets a contradictory answer depending on which board they found first.
2. **Manual cross-app copy already happening:** pereiraayuda carries "Colectivo Artemisa" with `fuente: "Acopio Pereira (ayudaspereira.com), 13 ago"`; alluda has the same place natively. Attribution preserved, identifiers not — the manual-integration cost documented in production.
3. **Self-duplication:** unidosporpereira lists the UTP campus twice (~1.1 km apart, same street address); alluda holds a third record. Three records, one campus, within and across apps.

**Name-collision hazard:** ayudared's national set holds "Coliseo Mayor de Pereira" AND "Coliseo Mayor de Manizales" while Pereira apps say just "Coliseo Mayor" → place identity MUST be municipality-scoped. But municipality data is itself dirty (rows misfiled across municipalities, one in another department; "Pereira cuba"; bare-number municipality values) → DIVIPOLA normalization (already solved by mapadelterremoto) is the fix.

## 3. Integration-readiness ranking (wave candidates)

| Wave | Apps | Why |
|---|---|---|
| **0 — reference implementations** | corag · pereiraayuda · pereiraresponde · reporteco | Already publish open structured data; protocol feed = field mapping |
| **1 — high-value early adopters** | aquiayuda (its 5 bespoke adapters get *deleted*, replaced by 1 protocol client) · mapadelterremoto (has licence+DIVIPOLA+freshness; needs only a serializer; ⚠ sunsets 2026-11-30 with open-data commitment) · unidosporpereira (de-facto JSON exists) · pereiravive | Aggregators + apps with data already shaped |
| **2 — an afternoon with the skill** | pereiraunida (PII-strip decision first) · alluda · encuentratumascota | S–M engineering |
| **3 — needs a decision, not code** | terremotocolombia (what NOT to publish) · sismovision · gogo (access gate) · ayudared (add freshness) | M for policy/identity reasons |
| **Directory-only tier** | helpthemdirectly (irreducibly personal records + AI-crawl legal reservation) · gravitas (no public identity) | Respected membership class, non-personal manifest only |
| **Link-out only (permanent)** | encontrados · sospereira (people domains) | Normative exclusion |

## 4. Top findings (full detail in PROGRESS.md and dossiers)

1. **AquíAyuda already ships a hand-rolled proto-protocol** — 5-adapter source registry, verb+entity capability vocabulary (`leer:centros`, `escribir:ofrecimiento`), namespaced external IDs when writing to Corag. The protocol formalizes something already validated in production. Also proves *declared ≠ implemented* → conformance must test behavior.
2. **Discovery is the ecosystem's broken layer.** Catch-all 200s produced false "unknown" on 3 apps with real APIs (pereiraayuda, reporteco, pereiraresponde-MCP); 0/20 hosts serve `/.well-known/`; robots.txt broken or absent on most. → the well-known descriptor is a conformance **precondition**.
3. **Freshness convergence:** pereiraayuda, unidosporpereira, pereiravive independently built verification-tier models (`ultima_validacion`/`confirmaciones`/`contradicciones`; `frescura`/`verificado`/`aprox`; TTL + negative confirmation + `origen`). 86% of one live map is stale by its own measure; ayudared's 226 national records carry no signal at all. → verification triple in core; `null` must be honest and legal.
4. **Vocabulary reality:** no category enum is a superset of any other (4 incompatible enums in matching alone); status conflates 3 axes (lifecycle/fulfilment/moderation); AquíAyuda's crosswalk tables (incl. lossy joins) are ready-made Task 2 input; DIVIPOLA + EDAN already adopted by the national aggregator.
5. **The network is already consolidating** (SOS Terremoto → Corag interstitial, 45s auto-forward). Federation vs absorption is a live choice, not a hypothesis. Spec needs an orderly-wind-down/record-custody clause; RFC-0 timeline is days.
6. **Contact data must not travel in feeds** (3 independent evidence lines) → `publicUrl` + link-out, opaque IDs, fetch-on-demand contact, per-participant crawl policy in the registry. And **consent-to-reuse is a real field**: terremotocolombia's robots.txt encodes answer-engines-yes/training-no; helpthemdirectly invokes EU DSM Art. 4.
7. **Emergent conventions to adopt, not invent:** `/api/public/v1/...` path shape (3 apps independently); `source`+`externalId` idempotency (Corag, used by AquíAyuda in production).

## 4.1 Addendum — sync & discovery design findings (analyst-damage final report, 04:25Z)

- **Incremental sync exists in the wild at zero cost:** mapadelterremoto's sitemap
  `lastmod` (551/551 URLs) ≡ `Dataset.dateModified` — poll the sitemap, refetch only
  changed pages. A working pattern to standardize.
- **Anti-pattern to name in the spec:** terremotocolombia regenerates sitemap
  `lastmod` per request (always "now") — *worse than no lastmod*: consumers refetch
  everything and can never detect change. gravitas renders a live clock next to a
  3.4-day-stale shell — same misleading effect at UI level.
- **Feed-level `generatedAt` must be MANDATORY** and records need `updatedAt`, not
  just `createdAt`: reporteco's live feed hasn't moved since 2026-08-10 and a
  consumer cannot distinguish "nothing changed" from "pipeline stopped";
  pereiraresponde has no `updatedAt`, so edits/moderation/removals are invisible.
- **Offline reality:** gravitas ships an offline report queue → `createdAt` and
  server arrival can differ by hours. Incremental sync MUST order on a server-side
  sequence/cursor, never on the record's own timestamps. (Pereira Responde also has
  no pagination cursor — only `limit`+date windowing — and **no licence anywhere**;
  both are gaps the protocol fixes.)
- **Soft-404 detection rule for the validator/registry:** `200 + text/html` on a
  discovery path = `absent`, never `present`; byte-size equality with the homepage
  is the reliable discriminator (pereiraresponde serves identical 8413-B shell on 4
  discovery paths; sismovision the identical 819-B shell on all 8). Hosts adopting
  the well-known descriptor must exclude it from SPA catch-alls first.
- **Matching rule:** key places on DIVIPOLA codes or Unicode-accent-folded names,
  never raw display strings (one app writes UI copy without diacritics; Quibdó/
  Ibagué/Tuluá would silently fail). reporteco stores names, not codes → crosswalk
  needs an owner.
- **Join prohibition, not just field exclusion:** terremotocolombia serves acopio
  AND 307 missing-persons from the same platform/API host — app-level federation
  sweeps in PII by construction. The spec must forbid the *join* across
  people-holding apps, entity-scoping every grant.
- **Consent goes in the envelope:** one org exposes two different consent
  vocabularies (robots.txt AI-agent split vs Cloudflare content-signals + EU DSM
  Art. 4) → `license` + `permittedUse` are envelope fields, not robots.txt dialects.
- **Scale of the prize:** collection points/shelters exist in up to **nine
  identifier spaces** (mapadelterremoto holds 439 nationally + 227 ABACO + 272
  blood/drop-off; 6 logistics apps; 3+ damage apps). Every one of reporteco's 14
  city pages duplicates mapadelterremoto. **Easiest first win:** emergency phone
  directories — small, static, non-personal, hand-copied today.
- Dossier note: `APP_encontrados.md` / `APP_sospereira.md` intentionally replace
  "Adoption effort" with the link-out rationale (per task design) — not a defect.
- Probe budget: 2 hosts at 12 and 11 requests (justified, documented, public
  docs-chain surfaces only); all others ≤10; robots Disallow honored everywhere.

## 4.2 Addendum — mesa técnica census (2026-08-16)

The mesa técnica's report identifies **4 additional platforms in press** beyond
the 20-app directory, including two more missing-persons platforms ("Colombia
te busca", desaparecidos.co) — the people-exclusion zone is larger still, and
its report counts 4,344 people listed across citizen platforms in parallel to
the official Cruz Roja channel. Its interface census (2 verified) undercounts
ours (4 APIs + 3 MCPs, probe-evidenced) — the catch-all-200 discovery trap
explains the gap. See `MESA_TECNICA_ALIGNMENT.md`.

## 5. Baseline YAML corrections (proposed — NOT applied; tracked-file changes are out of scope)

| Entry | Field | Current | Should be | Evidence |
|---|---|---|---|---|
| pereiraayuda | integrations.publicApi / publicMcp | unknown / unknown | **yes / yes** | /api.html, /mcp.html, 8 MCP tools (dossier §Integration) |
| reporteco | integrations.publicApi | unknown | **yes** | /api/reports{,.csv,.geojson,.kml}, CORS *, 04:07:14Z |
| pereiraresponde | integrations.publicMcp | unknown | **yes** | POST /mcp in own OpenAPI spec, 04:01:55Z |
| sostremoto | coverage / status | active board | migration notice → Corag | farewell interstitial, 04:02:04Z |
| helpthemdirectly | category | matching | direct_aid (or directory-only) | campaign model, no matching flow |

## 6. Security items (routed to Task 9 — private disclosure, details withheld here)

Four findings are recorded for **private disclosure to the respective teams** (an unauthenticated side endpoint exposing contact fields; publisher personal names in a free-text provenance field; third-party publishable keys in a client bundle; a production backend running with framework debug mode enabled). No key values, endpoints-with-PII, or personal data are reproduced in any analysis output. See `SECURITY_REVIEW.md` §disclosure queue.
