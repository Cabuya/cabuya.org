# APP_sostremoto — SOS Terremoto

**Inputs:** `src/content/ecosystem-apps/sostremoto.yaml` · `PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}` · live probing 2026-08-16T04:01:15Z–04:04:06Z.
**Probe agent string used:** `CoragEcosystemAnalysis/1.0 (protocol interop research; +https://corag.app/ecosystem)`.

## TL;DR

- **The headline finding of this whole batch: SOS Terremoto has announced a migration into Corag.** Its home page is now a farewell/redirect interstitial that auto-forwards to `https://ayuda.corag.app` after 45 seconds, with an opt-out link back to the still-running board at `/ayuda`.
- This is the ecosystem's **first observed consolidation event** — a live, dated precedent that matters more to the protocol strategy than any endpoint: it shows the alternative to federation (absorption) is already happening, and it sets a clock.
- The board itself is still operational at `/ayuda` and still accepts new requests; it is a **client-side-rendered** Next.js app, so no record data is present in the server HTML.
- Stack: Next.js (webpack build, App Router) on **Railway** (`server: railway-hikari`, `x-railway-edge: atl1`) — the only non-Vercel, non-Cloudflare host in the assigned set.
- No API, MCP, robots, or sitemap. `publicApi`/`publicMcp` remain **`unknown`**; the data source is `unverified` — it is not reachable from the served HTML or the public JS chunks inspected.
- Feed-readiness: **M**, and arguably **moot** — a team that has decided to migrate is unlikely to invest in publishing a feed. Its value to the working group is as a **case study and a warning**, not as a data source.

## Identity

| Field | Value | Source |
|---|---|---|
| Name | SOS Terremoto | `sostremoto.yaml`; `<title>` "SOS Terremoto — Solicitudes de ayuda" 2026-08-16T04:02:04Z |
| Primary URL | `https://conectando-ayudas-colombia.com/` | `sostremoto.yaml`; 200 at 2026-08-16T04:01:15Z |
| Live board | `https://conectando-ayudas-colombia.com/ayuda` | 200 at 2026-08-16T04:03:35Z |
| Category (YAML) | `matching` | `sostremoto.yaml` |
| Featured / order | `featured: false`, `order: 20` | `sostremoto.yaml` |
| Logo authorization | `pending_contact` | `sostremoto.yaml` |
| Brand colour | `theme-color: #b91c1c` (red) | probe 2026-08-16T04:02:04Z |
| Operator / team | Not stated anywhere on the probed pages; no about page, GitHub link, license or contact channel observed | `unverified` |
| Declared coverage (YAML) | "Enfocada en la respuesta al terremoto" | `sostremoto.yaml` |
| **Observed coverage** | Municipality filters: Pereira, Dosquebradas, "Otra" | `/ayuda` 2026-08-16T04:03:35Z — **narrower and more specific than the YAML states; the YAML should be updated** |

**YAML claims:** `publicApi: unknown`, `publicMcp: unknown`. **Re-verified, still accurate.** The YAML's `active: true` is also still accurate — but it does not capture that the app is mid-migration, which is now the most important fact about it.

## Probe log

All requests `GET`, one each, no auth.

| URL | UTC timestamp | Status | Content-Type |
|---|---|---|---|
| `https://conectando-ayudas-colombia.com/` | 2026-08-16T04:01:15Z | 200 (5 508 B) | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/robots.txt` | 2026-08-16T04:01:17Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/sitemap.xml` | 2026-08-16T04:01:18Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/.well-known/` | 2026-08-16T04:01:20Z | 308 → `/.well-known` | — |
| `https://conectando-ayudas-colombia.com/api` | 2026-08-16T04:01:22Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/api/docs` | 2026-08-16T04:01:23Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/openapi.json` | 2026-08-16T04:01:25Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/mcp` | 2026-08-16T04:01:27Z | 404 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/` (body + headers capture) | 2026-08-16T04:02:04Z | 200 | `text/html; charset=utf-8` |
| `https://conectando-ayudas-colombia.com/ayuda` | 2026-08-16T04:03:35Z | 200 (6 329 B) | `text/html; charset=utf-8` |
| `…/_next/static/chunks/app/page-bce6d05a77cc2541.js` | 2026-08-16T04:03:53Z | 200 (2 168 B) | `application/javascript; charset=UTF-8` |
| `…/_next/static/chunks/117-9776bcfde68b9ed6.js` | 2026-08-16T04:04:06Z | 200 (124 364 B) | `application/javascript` |

12 requests, of which 2 were public static build assets fetched to identify the data backend (they turned out to be the redirect stub and a framework vendor chunk — neither contained app data logic).

**`/personas` was deliberately NOT probed.** The `/ayuda` page links to it under the label "Personas desaparecidas — reportar o ayudar a buscar". Per plan guideline 3 and the task's people-data rule, missing-persons surfaces are analyzed tool-level only. **People-data: link-out only by design.**

## Observable architecture

- **Hosting/edge:** **Railway** — `server: railway-hikari`, `x-railway-request-id: tIwX9DqmQnSjXX8x2h0iww`, `x-railway-edge: atl1`, `x-hikari-trace: atl1.1v22` (2026-08-16T04:02:04Z). Edge region `atl1` (Atlanta). The only Railway-hosted app in the assigned set.
- **Framework:** **Next.js App Router**, explicitly declared: `x-powered-by: Next.js`, `vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding`, and the RSC payload keys `buildId`, `assetPrefix`, `initialTree`, `initialSeedData`, `parallelRouterKey`.
- **Build toolchain:** **webpack**, not Turbopack — chunk names `webpack-c8441f2d519541e3.js`, `main-app-*.js`, `polyfills-*.js`, `fd9d1056-*.js`. Contrast with Pereira Unida's Turbopack build; this is an older or more conservative Next.js setup.
- **Caching:** `cache-control: s-maxage=31536000, stale-while-revalidate`, `x-nextjs-cache: HIT`, `etag: "ifsf5n3qrk480"` (2026-08-16T04:02:04Z). The **shell** is cached for a year at the edge — which is coherent only because the shell contains no data.
- **Rendering strategy:** **CSR for data.** The `/ayuda` document ends with the literal text "En vivo / Cargando…" and contains zero record payload (6 329 B total, no data keys in the RSC tree beyond routing scaffolding). Records are fetched client-side after hydration.
- **Consequence for analysis:** the entity model is **not observable from the public HTML**, unlike Pereira Unida. The two JS chunks inspected contained no `.from()`, no `.select()`, no API path literals and no external host other than `ayuda.corag.app` and `nextjs.org` — the data-fetching code lives in a chunk not referenced by the initial document. Probing further chunks would be reverse-engineering rather than surface observation, so it was stopped.
- **Data backend: `unverified`.** No Supabase/Firebase/PostgREST fingerprint was found in the document head, the response headers, or the two chunks inspected.
- No `generator` meta, no JSON-LD, no PWA manifest, no favicon set (seed `ENRICHED_PROBE.json` recorded `icons: []`), no OG image.
- **The only external host referenced anywhere in the served pages is `ayuda.corag.app`.**

## Entity inventory

Because the board is client-rendered, **no field names, no record shapes and no freshness fields could be observed**. What *is* observable is the UI's controlled vocabulary, which is a reliable proxy for its category enum.

### Entity — Help request (board record)

| Aspect | Observed values | Source |
|---|---|---|
| Record types (CTAs) | "Necesito ayuda" (request), "Ofrezco ayuda" (offer), "+ Publicar una solicitud" | `/ayuda` 2026-08-16T04:03:35Z |
| Lifecycle surfaced | "Solicitudes activas", "Solicitudes de ayuda abiertas · tomá una y ayudá" — an open/taken model | same |
| Geography filter | Pereira · Dosquebradas · Otra | same |
| **Category filter enum (15 values)** | Transporte · Voluntarios · Rescatistas · Insumo · Agua · Comida · Medicamentos · Alojamiento · Remover escombros · Volquetas · Maquinaria pesada · Atención médica · Evaluación de infraestructura · Atención psicológica · Otro | same |
| Freshness | "En vivo" label only; **no per-record timestamp, no "actualizado" label, no relative-time rendering observable** | same |
| Field names | Not observable (CSR) — `unverified` | — |

### Secondary surface — missing persons

`/personas`, linked as "Personas desaparecidas — reportar o ayudar a buscar". **Not probed. People-data: link-out only by design.** Its existence is recorded here solely so the working group knows this app spans both aid matching *and* people search, which places it in the same handling class as `encontrados` and `sospereira` for that half of its surface.

### Category enum — cross-app significance

This 15-value vocabulary is **the third distinct, incompatible category enum** found in the four matching apps:

- It has values **nobody else has**: `Volquetas`, `Maquinaria pesada`, `Remover escombros`, `Rescatistas`, `Evaluación de infraestructura`, `Atención psicológica`, `Alojamiento`.
- It **splits** what Corag merges (`Atención médica` vs `Medicamentos` vs Corag's single `salud`/`medicamentos` pair) and merges what Pereira Unida splits.
- Its heavy-equipment values (`Volquetas`, `Maquinaria pesada`) are a **capability/asset** class, not a supply class — semantically a different entity that happens to share a filter row.
- It is written as **display-cased Spanish label text, not slugs** — no stable machine identifiers are exposed.

Together with Corag's 15-value enum and Pereira Unida's 9 observed values, this is decisive evidence for Task 2/Task 4: **no existing app's vocabulary can serve as the protocol's vocabulary.** The protocol needs its own small, stable, slug-based core enum plus an `originCategory` passthrough string and per-app crosswalks.

## Integration surface

**publicApi: `unknown`**

- `/api`, `/api/docs`, `/openapi.json` all 404 with the app's HTML shell (2026-08-16T04:01:22Z–04:01:25Z).
- No API documentation, developer link, or machine-readable descriptor anywhere on the two pages probed.
- The board demonstrably fetches data from *somewhere* client-side, so an HTTP data surface exists; it is simply not documented, not advertised, and not discoverable from the served HTML. **`unknown`, not `no`.**

**publicMcp: `unknown`** — `/mcp` 404 (2026-08-16T04:01:27Z), no MCP mention anywhere. No positive evidence either way.

**Machine-readable discovery:** none. `robots.txt` 404, `sitemap.xml` 404, `/.well-known/` 308s into the shell, no JSON-LD, no OpenAPI. **No crawl policy is published at all** — a consumer has no stated permission or prohibition to rely on.

**Licensing / terms:** none observed. `unverified`.

**The migration announcement — verbatim structural facts** (`/` 2026-08-16T04:02:04Z):

- Headline: "Gracias por formar parte de esta red de ayuda 🙏 / Muchas gracias por tu labor".
- Body states a "migración integral a la aplicación CORAG, donde toda la ayuda y la información seguirán funcionando de forma centralizada."
- Primary CTA: "Ir a CORAG" → `https://ayuda.corag.app`.
- Auto-redirect: "Serás redirigido a https://ayuda.corag.app en 45 s…" (client-side timer; the server returned 200, not a 30x, so the redirect is JS-driven and does not affect crawlers).
- Escape hatch: "← Seguir usando el tablero SOS Terremoto" → `/ayuda`.
- The redirect stub chunk (`page-bce6d05a77cc2541.js`, 2 168 B, 2026-08-16T04:03:53Z) contains `ayuda.corag.app` as its only external host — confirming the interstitial is the app's actual home route, not a temporary banner.

**No cross-app data integration is implied by this.** The migration is a *user* redirect and a stated intent to centralize; there is **no evidence of a data pipe** between SOS Terremoto and Corag. Whether historical board records were or will be transferred, and under what consent basis, is **`unverified` and is a question for the teams, not for a probe.**

## Adoption effort estimate

**M (medium) — with a strong caveat that effort may be the wrong question for this app.**

Why M and not S:

1. The data backend is unidentified. Unlike Pereira Unida (Supabase → a view and an Edge Function), there is no visible "obvious cheap path" to a feed. The work starts with discovery.
2. CSR-only architecture means there is no existing server-side serialization of records to piggyback on; a feed route would be new server code on Railway.
3. Their category vocabulary is label text, not slugs. Producing stable machine identifiers means introducing an enum where currently there is only UI copy — a schema change, not a serialization change.
4. No timestamps are surfaced anywhere, so a protocol feed requiring `updatedAt`/`lastConfirmedAt` may need new columns.

Why the estimate is arguably moot:

5. **A team that has publicly announced a migration into Corag has no incentive to build an integration.** The rational ask of this team is not "publish a feed" but "tell us what happens to the records, and let us learn from why you consolidated."

**Strategic read:** SOS Terremoto is the ecosystem's proof that the counterfactual to a protocol is not "twenty apps federate" — it is "apps quietly fold into the biggest one." That is a legitimate outcome for users, but it concentrates the network in a single operator, which is precisely what a neutral protocol exists to avoid. **This app should be the opening case study in RFC-0's motivation section.** It also sets urgency: consolidation is happening on a timescale of days, so a protocol that takes months to ratify may arrive after the question is settled.

## Overlap map

| Overlap dimension | Apps that collide | Nature |
|---|---|---|
| **Needs/offers matching** | `corag`, `pereiraunida`, `helpthemdirectly` | Direct — and **resolving by absorption**: SOS Terremoto is migrating into `corag`. That leaves `pereiraunida` as the principal independent matching board on the same territory, and makes the Corag↔Pereira Unida relationship the one that matters most for the protocol. |
| **Geography — Pereira + Dosquebradas** | `corag`, `pereiraunida`, `pereiraayuda`, `pereiravive`, `unidosporpereira`, `gogo`, `alluda`, `sospereira`, `pereiraresponde`, `sismovision` | Very high. Its municipality filters are **identical** to Pereira Unida's (Pereira / Dosquebradas / other) — two independent teams converged on the same geographic partition without coordinating, which is a good sign for a shared administrative-geography model. |
| **Missing persons** | `encontrados`, `sospereira` | Direct — `/personas`. **Link-out only by design**, not probed, never federates. |
| **Rescue & heavy logistics** | `alluda` (transportistas), `gogo`, `pereiravive`, `corag` (`category: rescate`, `transporte`) | Medium-high, and **SOS Terremoto is the richest in this class**: `Volquetas`, `Maquinaria pesada`, `Remover escombros`, `Rescatistas` are asset/capability categories no other assigned app enumerates. |
| **Structural assessment** | `sismovision`, `pereiraresponde`, `mapadelterremoto`, `gravitas`, `reporteco`, `terremotocolombia` | Partial — `Evaluación de infraestructura` is a *request for* assessment, the damage apps hold the *reports*. Same complementary seam noted for Pereira Unida's `revision_ingenieria`. **Two independent matching apps both created a category for "come inspect my building" — that is a validated cross-domain workflow and a strong candidate for the protocol's first federation use case.** |
| **Psychosocial care** | `pereiraunida` (`skill: psicologia`) | `Atención psicológica` — only these two model it. |
| **Shelter / housing** | `pereiraunida` (`Arriendos`), logistics apps' albergues | Partial: `Alojamiento` here is emergency shelter demand; Pereira Unida's `Arriendos` is rental supply; the logistics apps list albergues as places. Three treatments of "somewhere to sleep", none interoperable. |

## Risks & notes

1. **Consolidation risk is the dominant strategic risk in the ecosystem, and it is no longer hypothetical.** Recorded live 2026-08-16T04:02:04Z. Any protocol timeline must be measured against how fast apps are folding.
2. **Corag is the destination of that consolidation**, which sharpens the governance problem flagged in `APP_corag.md`: the protocol's convening organization is also the entity currently absorbing its peers. RFC-0 must address this openly or the neutrality claim will not survive contact with the other teams.
3. **Data-transfer basis is `unverified`.** "Toda la ayuda y la información seguirán funcionando de forma centralizada" is a migration promise about *information*. If records containing personal contact data move between operators, the consent basis for that transfer is a real question. **This dossier makes no claim that any transfer has occurred.** It is flagged because the protocol will need a normative answer for "what happens to records when an app shuts down" — an orderly-wind-down clause is a genuine spec requirement nobody usually writes until it is too late.
4. **The board is still live and still accepting new requests** while the home page tells users to leave. Users arriving via a direct `/ayuda` link never see the migration notice. Split-brain state; records created there after the migration announcement may be less likely to be seen.
5. **No crawl policy at all** (`robots.txt` 404). The protocol's "no scraping" principle is unenforceable against apps that publish no policy — an argument for the spec requiring participants to publish a `robots.txt` and a machine-readable descriptor as a **conformance precondition**, before any data requirement.
6. **No contact channel, no team identity, no license** discoverable on any probed surface. Consistent with `logoAuthorization: pending_contact` in the YAML. **The working group has no observed way to reach this team**, which makes them impossible to include in a consent-based process — and makes the case for the registry (rung 1 of the ladder) carrying a maintainer contact field.
7. **Edge caching a year-long `s-maxage` on the shell** is fine today but means a future change to the home page may take a long time to propagate to some edges unless they purge. Minor operational note.
8. **Not probed, deliberately:** `/personas` (people data), any individual board record, any authenticated or admin surface. Two public static JS chunks were fetched to identify the backend and yielded nothing; no further bundle analysis was performed.
9. **YAML correction to propose (out of scope to apply here, per plan guideline 7):** `coverage` currently reads "Enfocada en la respuesta al terremoto"; the app's own filters show Pereira / Dosquebradas / other. And the entry does not reflect the migration notice, which is now the app's most salient public fact.
