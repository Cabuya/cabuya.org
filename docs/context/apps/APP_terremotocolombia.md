# APP_terremotocolombia — Terremoto Colombia (Mallanet.org)

## TL;DR

- Terremoto Colombia is the most **organisationally formalised** app in the assigned set: it publishes `NGO`/`Organization` JSON-LD, an org-level contact point, a privacy policy, terms, a data-deletion request path, and it is **MIT-licensed open source** at `github.com/mallanet/Terremotocolombia` (343 commits).
- It runs a real backend at **`api.terremotocolombia.co`** (Express, behind Cloudflare) plus a CDN host. That backend is **`Disallow: /api/`** in the site's own `robots.txt`, so it was **not probed** — integration surface stays **`unknown`**, and deliberately so.
- Its `robots.txt` encodes a **considered AI-data policy**: answer engines and search crawlers are allowed (`Googlebot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-User`, `Claude-Web`), training crawlers are blocked (`GPTBot`, `ClaudeBot`, `anthropic-ai`, `CCBot`, `Google-Extended`, `Bytespider`, `Amazonbot`, `Applebot-Extended`, `meta-externalagent`, `cohere-ai`). This is the ecosystem's first explicit statement of *consent to reuse*, and the protocol needs a field for it.
- **This app is the clearest illustration of why federation must be entity-scoped, not app-scoped.** Its seven map entity types include damage, collection and needs — but at probe time the only populated one was **missing persons (307)**, exactly the category that must never federate. Everything else read 0.
- The repository is described as a **template with AI-agent-compatible skills for rapid deployment by other organisations** — the same idea as this initiative's planned agent-skill repo, already shipped by a working-group member.
- Feed-readiness: **M**. Strong engineering and governance; the PII entanglement means the work is mostly deciding what *not* to publish.

**Inputs:** `src/content/ecosystem-apps/terremotocolombia.yaml`; `.dwp/plans/PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}`; live probes 2026-08-16T04:03:01Z–04:04:58Z; public repository metadata 2026-08-16T04:09Z.

**PII boundary honoured:** the homepage server-renders a paginated directory of named missing persons. **No individual case listing was opened, and no person's name, age, location, description or photo appears anywhere in this dossier.** Only aggregate counts and structural facts are recorded.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Terremoto Colombia |
| URL | https://terremotocolombia.co/ |
| Category (YAML) | `damage` |
| Slug | `terremotocolombia` |
| YAML `order` / `featured` | 50 / `false` |
| YAML tagline (ES/EN) | "Reportes y fuentes oficiales" / "Reports and official sources" |
| Page title (observed) | "Terremoto Colombia · Mallanet.org" |
| H1 (observed) | "Estamos contigo. ¿Qué necesitas hacer?" |
| Operator (observed, JSON-LD) | **Mallanet.org** — typed `["NGO","Organization"]`, https://mallanet.org |
| Org contact (observed, JSON-LD) | `info@mallanet.org` — role address, `contactType: customer support`, `availableLanguage: ["es"]` |
| Repository (observed) | https://github.com/mallanet/Terremotocolombia — **MIT** |
| Self-description (observed) | "Plataforma ciudadana, gratuita y **de código abierto** … Iniciativa independiente y no partidista. **No somos un canal oficial de gobierno.**" |
| YAML `integrations.publicApi` / `publicMcp` | `unknown` / `unknown` — both confirmed as `unknown` |
| Logo authorization (YAML) | `pending_contact` |

**YAML claims checked**

| Claim in YAML | Verdict | Evidence |
|---|---|---|
| "Citizen platform for reports, impact map and access to official emergency sources" | **Confirmed** | Four-way action chooser on the homepage, 2026-08-16T04:03:01Z |
| "The site references Mallanet.org" | **Confirmed and strengthened** | Mallanet.org is the operating NGO, declared in JSON-LD, not merely referenced |
| "Action flow: report / map / sources" | **Confirmed** | "Necesito Ayuda" / "Buscar personas" / "Reportar Información" / "Puedo Ayudar" |
| "Official sources live on their own sites; this tool only links or orients" | **Partially contradicted** | The app also *hosts* substantial first-party data — a 322-record persons directory, hospital and collection directories, and its own report map. It is a data holder, not only a signpost |
| "We did not find public API or MCP documentation on the site" | **Confirmed** | `/api/docs`, `/openapi.json`, `/mcp` all 404 on the web host |

---

## Probe log

All requests `GET`, one each, User-Agent `CoragEcosystemAnalysis/1.0 (+https://corag.app/ecosystem)`. 8 requests to the web host, 2 to the API host.

| URL | UTC timestamp | Status | Content-Type | Bytes |
|---|---|---|---|---|
| https://terremotocolombia.co/ | 2026-08-16T04:03:01Z | 200 | text/html; charset=utf-8 | 250 280 |
| https://terremotocolombia.co/robots.txt | 2026-08-16T04:03:03Z | 200 | **text/plain** | 851 |
| https://terremotocolombia.co/sitemap.xml | 2026-08-16T04:03:04Z | 200 | **application/xml** | 3 988 |
| https://terremotocolombia.co/.well-known/ | 2026-08-16T04:03:06Z | **404** | text/html; charset=utf-8 | 52 973 |
| https://terremotocolombia.co/api | 2026-08-16T04:03:07Z | **404** | text/html; charset=utf-8 | 52 965 |
| https://terremotocolombia.co/api/docs | 2026-08-16T04:03:09Z | **404** | text/html; charset=utf-8 | 52 974 |
| https://terremotocolombia.co/openapi.json | 2026-08-16T04:03:10Z | **404** | text/html; charset=utf-8 | 52 974 |
| https://terremotocolombia.co/mcp | 2026-08-16T04:03:11Z | **404** | text/html; charset=utf-8 | 52 965 |
| https://api.terremotocolombia.co/robots.txt | 2026-08-16T04:04:57Z | 200 | **text/plain** | 1 248 |
| https://api.terremotocolombia.co/ | 2026-08-16T04:04:58Z | **404** | text/html; charset=utf-8 | 139 |

**Deliberately not probed:** the site's `robots.txt` sets `Disallow: /api/` for every user-agent it permits. No path under `/api/` on either host was requested beyond the bare `/api` (which 404s and is outside the disallowed `/api/` prefix) and the two API-host requests above — `robots.txt` itself, which every crawler is entitled to read, and the host root, which is not under `/api/`. **No person-scoped endpoint, no case listing, no `/api/missing/*` URL was fetched.**

### `robots.txt` — the web host (2026-08-16T04:03:03Z)

Two-tier policy, reproduced structurally:

| Group | Directive |
|---|---|
| `*`, `Googlebot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-User`, `Claude-Web` | `Allow: /` + `Disallow: /api/` |
| `GPTBot`, `ClaudeBot`, `anthropic-ai`, `CCBot`, `Google-Extended`, `Bytespider`, `Amazonbot`, `Applebot-Extended`, `meta-externalagent`, `cohere-ai` | `Disallow: /` |
| — | `Host: https://terremotocolombia.co` · `Sitemap: https://terremotocolombia.co/sitemap.xml` |

Read plainly: **"answer my users' questions from this site; do not train on it; never touch my API."** That is a coherent, defensible position and it is the first *consent* signal found anywhere in this analysis.

### `robots.txt` — the API host (2026-08-16T04:04:57Z)

The API host serves the **Cloudflare "content signals" managed `robots.txt`**, which defines `search`, `ai-input` and `ai-train` signals and closes with an express reservation of rights under **Article 4 of EU Directive 2019/790** (the text-and-data-mining opt-out of the DSM copyright directive). Note this is a platform-provided default, not necessarily a hand-authored team decision — but it is legally operative all the same, and it is a second, differently-worded consent signal on the same organisation's infrastructure. **Two consent vocabularies on one org is itself a finding**: the protocol should carry consent as structured data rather than leaving it to robots.txt dialects.

---

## Observable architecture

- **Web host edge:** Cloudflare (`server: cloudflare`). `cache-control: s-maxage=300, stale-while-revalidate=31535700` — 5-minute edge freshness with a one-year stale-serving window. That very long SWR is a deliberate availability choice: the site keeps serving during an origin outage.
- **Framework:** Next.js App Router with **Turbopack** — chunk names such as `/_next/static/chunks/turbopack-0rmfczzgmyjo_.js`, `1nq0sqdultszo.js`; `self.__next_f` streaming payload present.
- **Backend:** `https://api.terremotocolombia.co` — root returns `Cannot GET /` in a minimal HTML error document, the **Express.js** default 404 body (confirmed by signature, framework `inferred` from it). Fronted by Cloudflare (`server: cloudflare`).
- **CDN:** `cdn.terremotocolombia.co` referenced from the homepage — media served from a dedicated host.
- **Full stack (from the public repository, 2026-08-16T04:09Z):** Next.js + **Express** + React frontend; **Neon Postgres**; **Cloudflare Workers**; **Leaflet** for mapping; role-based admin panel behind **Cloudflare Access**; automated deploys for frontend/admin on merge to `main` with **backend deploys manual-only**; VPS standup documented via `docker-compose.prod.yml` behind a **Caddy** reverse proxy with Let's Encrypt.
- **Map data:** OpenStreetMap (attributed in the footer).
- **Rendering:** substantially server-side. 250 KB of HTML yields ~4 200 characters of rendered text including the category legend, live counts and the first page of the persons directory. The map itself hydrates client-side ("Cargando mapa de reportes…").
- **404 handling:** real 404 status with a ~53 KB styled page.
- **Analytics:** a `googletagmanager.com` reference is present in the homepage HTML.
- **Structured data:** `NGO`/`Organization`, `WebSite`, `EmergencyService`, `ContactPoint`, `ImageObject`. Notably **no `Dataset`** — so unlike `mapadelterremoto`, the organisation is machine-legible but the data is not.

### Sitemap (2026-08-16T04:03:04Z)

22 URLs, all with `lastmod`, range **2026-08-11T14:59:46Z → 2026-08-16T04:03:04Z**. The maximum `lastmod` equals the probe second, so the sitemap is **generated dynamically per request** — technically fresh, but useless as a change-detection signal because every URL always looks just-modified. Worth flagging: *a `lastmod` that is always "now" is worse than no `lastmod`*, and the protocol's guidance should say so.

Routes: `/`, `/mapa-de-rescate`, `/hospitales` (+6 sub-pages), `/acopio` (+2), `/mascotas`, `/telefonos`, `/guia`, `/publicar-necesidad`, `/riesgo-sismico`, `/donaciones`, `/voluntario`, `/quienes-somos`, `/contacto`, `/privacidad`, `/terminos`.

---

## Entity inventory

### Map entity types (7) — with live counts at 2026-08-16T04:03:01Z

Each type is rendered with its own definition on the homepage. Definitions paraphrased from the served text.

| # | Type | Count at probe | Definition (as published) | Federates? |
|---|---|---|---|---|
| 1 | 🙋 **Necesidades** | 0 | Requests from people needing water, food, medicine, shelter or transport. "No es una oferta" | Yes — needs |
| 2 | 📦 **Tengo** | 0 | People who *have* supplies and can hand them over | Yes — offers |
| 3 | 🏠 **Acopio** | 0 on the map layer; a separate **`📦 Acopio 14`** chip is rendered | Verified point enabled to receive donations or shelter families | Yes — places |
| 4 | 💡 **Sin luz** | 0 | Zone with no serious damage and safe, but without electricity (and possibly without signal) | Yes — service status |
| 5 | 🔍 **Buscan** | **307** | Search for a missing person; last known location and a description | **No — never** |
| 6 | 🏢 **Edificios** | 0 | Photographic record of a building's condition, "útil para que ingenieros y autoridades evalúen daños estructurales" | Yes — damage |
| 7 | 🛰️ **Starlink** | 0 | Point with a Starlink antenna or satellite internet available to the community; indicates whether access is public | Yes — **unique to this app** |

**The `Sin luz` type is a modelling insight worth stealing.** It records the *absence of damage plus the absence of a service* — "this sector is fine but has no power". Every other app in the ecosystem models only damage and need. A protocol that can only express problems cannot express "this neighbourhood is okay", which is exactly what a responder allocating scarce capacity needs to know. **The canonical entity model should support negative and all-clear assertions.**

**The `Starlink` type is unique across all 20 ecosystem apps.** Connectivity-as-a-resource is a real entity in a disaster where 3 403 of 7 379 base stations were reported down. Nothing else in the ecosystem models it.

### Entity: `Persona` (missing / found person) — **link-out only by design**

| Aspect | Value | Source |
|---|---|---|
| Total reported | **322** | homepage, 2026-08-16T04:03:01Z |
| Missing | **307** | homepage |
| Found | **15** | homepage |
| Directory pagination | 41 pages | homepage |
| Backend route family | `api.terremotocolombia.co/api/missing/{uuid}/photo` (URL pattern observed in the served HTML) | homepage HTML |
| Fields rendered in the directory | name, age, department, municipality, neighbourhood, status, photo, "Ver detalles" link | observed structurally |

**Analysis stops here, by rule.** No individual record was opened, transcribed, counted by attribute, or reproduced. **People-data: link-out only by design.** This entity must be excluded from any federated exchange the protocol defines — not minimised, not pseudonymised, not aggregated: excluded, with the app linked to instead.

Three specific hazards this app makes concrete:

1. **Photos are served by UUID from the API host.** A UUID in a URL is not access control. Any federated document that carried such a URL would propagate a durable pointer to a person's photograph.
2. **The persons directory is server-rendered into the homepage.** It is in the HTML of the site's front page, which means it is exposed to every crawler the `robots.txt` allows — including answer engines. That is the team's decision to make and their `robots.txt` shows they thought about crawlers, but it raises the stakes on the protocol never adding another distribution channel.
3. **The same platform and the same API host serve both person data and place data.** App-level federation would sweep in PII by construction. **Entity-scoped federation is not a preference here; it is the only safe option.**

### Entity: directories — hospitals, collection points, phones, pets

| Entity | Evidence |
|---|---|
| Hospitals | `/hospitales` + 6 sub-pages in the sitemap; `EmergencyService` JSON-LD |
| Collection points / shelters | `/acopio` + 2 sub-pages; `Acopio 14` chip on the homepage |
| Emergency phone numbers | `/telefonos` — a directory of institutional lines |
| Pets | `/mascotas` — overlaps the ecosystem's pets category |
| Volunteers | `/voluntario` — registration plus an "already a volunteer" update flow capturing location, availability, skills and area |
| Donations | `/donaciones` — directory of organisations |
| Guides | `/guia`, `/riesgo-sismico` — static reference content |

### Freshness signals

| Signal | Value | Source |
|---|---|---|
| Sitemap `lastmod` max | 2026-08-16T04:03:04Z (= probe second) | sitemap — **regenerated per request, not a real change signal** |
| Sitemap `lastmod` min | 2026-08-11T14:59:46Z | sitemap |
| Edge cache policy | `s-maxage=300, stale-while-revalidate=31535700` | headers |
| Live counters | 307 missing / 15 found / 14 acopio, rendered server-side | homepage |
| Per-record timestamps | none exposed in the server-rendered HTML | homepage |
| Machine-readable feed | **none found** | probes |

Live counters are rendered but individual records carry no visible timestamp, and the sitemap's `lastmod` is uninformative. A consumer has no way to answer "what changed since yesterday".

---

## Integration surface

| Surface | Verdict | Evidence |
|---|---|---|
| `publicApi` | **unknown** | A backend exists at `api.terremotocolombia.co` (Express, Cloudflare-fronted, 404 at root, 2026-08-16T04:04:58Z) and route families are visible in the served HTML. But it carries **no documentation, no OpenAPI, no stated terms**, and the site's own `robots.txt` **disallows `/api/`** — so it was not probed. Publishing intent is undetermined. `unknown`, firmly, and the disallow makes further probing off-limits regardless of curiosity |
| `publicMcp` | **unknown** | `/mcp` 404 on the web host; no MCP artefact in the repository description |
| `robots.txt` | **yes, and unusually deliberate** | Two-tier allow/deny across 18 named user-agents + sitemap declaration |
| `sitemap.xml` | **yes, but low-signal** | 22 URLs, all `lastmod` = generation time |
| `/.well-known/` | **no** | 404 |
| Structured data | **yes — org-level** | `NGO`, `Organization`, `WebSite`, `EmergencyService`, `ContactPoint`. **No `Dataset`** |
| Bulk download | **none found** | no export control observed |
| **Source code** | **yes — MIT** | github.com/mallanet/Terremotocolombia, 343 commits, self-hosting documented |
| Data licence | **not stated** | MIT covers the code; the data's reuse terms are separate and unstated |
| Privacy governance | **yes** | `/privacidad`, `/terminos`, and a "Solicitar borrado de datos" path — the only data-deletion request surface found in this set |

### What this means for the protocol

1. **Consent must be a protocol field, not a robots.txt dialect.** This organisation expresses reuse preferences in two different vocabularies on two hosts — a hand-tuned crawler allow/deny list on the web host and Cloudflare's content-signals default on the API host. Neither is machine-legible to a *federation* consumer, which is a different actor from a crawler. The protocol's feed envelope needs explicit `license` and `permittedUse` fields, and this team's distinction between **answering** (allowed) and **training** (denied) is a good starting taxonomy.
2. **Entity-scoped federation, enforced at the schema level.** This app is the proof. The protocol should define which entity types are federatable and give people-entities no representation at all — no optional field, no "omit if sensitive". If there is no slot, nobody can fill it by accident.
3. **All-clear and service-status assertions belong in the model.** `Sin luz` and `Starlink` are entity types nobody else has, and both are decision-relevant.
4. **A `lastmod` that always equals "now" is an anti-pattern.** Worth an explicit line in the protocol's freshness guidance.
5. **Their repo already does what our Task 6 proposes.** "Designed as a template with AI-agent-compatible skills for rapid deployment by other organisations" is, functionally, the agent-skill repo this initiative plans to build. The working group should study it before designing a competing one — and should probably invite this team to co-own that product rather than duplicating it.

---

## Adoption effort estimate: **M**

| Work item | Effort | Why |
|---|---|---|
| Emit a static protocol JSON feed for **non-person** entities | **S–M** | Express + Neon Postgres; adding a serializer route is routine. The M comes from carefully partitioning the query so no person data can leak into it |
| Deciding what may be published | **M** | The real work. Needs, offers, acopio, buildings, service status and Starlink are all publishable; persons and pets-with-owner-contact are not. That is a policy decision requiring the org, not just an engineer |
| Field mapping | **M** | 7 entity types with published Spanish definitions but no exposed field schemas — mapping cannot be finalised without the team |
| Consent / licence metadata | **S** | They have already reasoned about this more than anyone else; it needs writing down as data |
| Freshness metadata | **S–M** | Per-record timestamps must be exposed, and the sitemap `lastmod` behaviour fixed |
| MCP server | **M** | Net-new, but Express makes it straightforward and their agent-skills work suggests appetite |
| Governance / legal review | **M** | The only app in the set with a privacy policy, terms and a deletion path — meaning any new publication route genuinely has to pass their own review |

**Blockers:** none technical. The gating item is an organisational decision about which entities may leave the platform, and that decision is genuinely theirs to make.

**Note on deploy cadence:** backend deploys are manual-only by design. Any protocol change requiring backend work moves at human pace here. Plan for that in the adoption timeline rather than treating it as a delay.

---

## Overlap map

| Overlapping app | Category | Shared entity / geography | Nature of the overlap |
|---|---|---|---|
| `reporteco` | damage | 11 categories vs 7 map types — rescue, needs, shelter, structural damage, services, missing persons | **Heaviest taxonomy overlap in the set.** Both are national citizen-report platforms with a missing-persons category and a curated official layer. Reporte CO publishes a feed; this one does not |
| `mapadelterremoto` | damage | Hospitals, shelters, collection, official-source directory, national scope | **Direct functional duplicate at the aggregation layer.** Both aggregate official sources nationally. Divergence: Mapa del terremoto deliberately *links out* for persons; this app *hosts* them |
| `pereiraresponde` | damage | `Edificios` ↔ `housing`; `Acopio` ↔ `support/collection`; hospitals ↔ `support/hospital` | Same entities; this app is national and thin, Pereira Responde is local and thick |
| `sismovision` | damage | `Edificación` — "registro fotográfico … para que ingenieros y autoridades evalúen daños estructurales" | **This is SismoVision's entire product, as one of seven types here.** Two teams independently built an engineer-facing building-photo register |
| `gravitas` | damage | Edificios, Acopio, Logística, Voluntariado | Near-complete overlap: 4 of Gravitas's 4 categories map onto types here, including the volunteer registry |
| `encontrados`, `sospereira` | people | **307 missing-person records** | **The critical overlap.** Three apps in the ecosystem hold person records. All three must be link-out-only, and the protocol must forbid joining across them — the risk is not any one feed, it is the join |
| `encuentratumascota` | pets | `/mascotas` | Pet-search overlap; note pet listings routinely carry owner contact details and are a PII channel by another name |
| `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `unidosporpereira`, `gogo` | logistics | `/acopio`, `/hospitales`, `/donaciones`, `/voluntario`, `/telefonos` | Full duplication of the logistics cluster's core directories at national scope |
| `corag`, `pereiraunida`, `sostremoto`, `helpthemdirectly` | matching | `Necesidades` (requests) + `Tengo` (offers) | **A complete needs/offers matching market, unpopulated (0/0 at probe), sitting inside a damage-category app.** Four matching apps do this as their whole product. The most redundant capability found anywhere in the ecosystem |

**Concrete duplicate-place examples:**
- **Hospitals:** `/hospitales` + 6 sub-pages here, 45 receiving hospitals across 9 cities in `mapadelterremoto`, 33 "acopio y hospitales" points in `reporteco`, and `support/hospital` records in `pereiraresponde` — the same institutions in at least four identifier spaces.
- **Collection points:** 14 here, 439 in `mapadelterremoto`, 33 in `reporteco`, plus six dedicated logistics apps. **No two use the same identifier**, and every one of them is a physical place with a fixed address that a shared registry could key.
- **Emergency phone numbers** (`/telefonos`): duplicated by `mapadelterremoto`'s official-sources section, `reporteco`'s `/acerca` line list, and several logistics apps. This is the **easiest possible first federation win** — a small, static, uncontroversial, entirely non-personal dataset that every app copies by hand today.

---

## Risks & notes

1. **PII is central to this app, not incidental.** 307 missing-person records with names, ages and locations are server-rendered on the homepage, and photos are served by UUID from the API host. Any protocol conversation with this team must start from "these records never enter the federation" and stay there. Analysis here is tool-level only, per plan rule 3.
2. **The join risk is the real risk.** Even PII-free feeds from this app could become identifying when combined with the person directory it publishes on the same domain. The protocol must prohibit joins across people-entities explicitly, not merely omit person fields from schemas.
3. **`/api/` is `Disallow`-ed in their own `robots.txt`.** Respected. Any future analysis must obtain the team's consent before probing that namespace — writing it down here so nobody repeats the question.
4. **Sitemap `lastmod` is generated per request** and therefore carries no change information. A polling consumer would refetch all 22 URLs every time.
5. **No data licence.** MIT covers the code. Reuse terms for the reports, directories and person records are unstated. Given the person records, this gap is more consequential here than anywhere else in the set.
6. **Two conflicting consent vocabularies across the organisation's hosts** — a hand-authored crawler policy on the web host and a Cloudflare-default content-signals policy (with an EU DSM Article 4 reservation) on the API host. Which governs a federation consumer is genuinely ambiguous today.
7. **The map layers were empty at probe time** except missing persons: Necesidades 0, Tengo 0, Acopio 0 on the map layer, Sin luz 0, Edificios 0, Starlink 0. A rich taxonomy with no data in it is a common failure mode, and a protocol built on taxonomy breadth rather than populated entities will inherit it. **The lesson: federate the entities that have data, not the entities that have schemas.**
8. **Analytics on an emergency site handling person data.** A Google Tag Manager reference appears in the homepage HTML. Not our call to make, but worth noting alongside their otherwise careful privacy posture.
9. **Very long stale-while-revalidate (≈1 year).** Excellent for availability during an outage; risky for a page showing "found" status on a missing person, where a stale view has human consequences. A protocol freshness contract should distinguish availability caching from data validity.
10. **Backend deploys are manual-only.** Deliberate and sensible for a system holding sensitive data; plan adoption timelines around it.
11. **Volunteer registry captures location, availability, skills and area** (`/voluntario`). This is person data of a different kind and is equally non-federatable. Flagged so it is not mistaken for an org-level directory.
12. **Strongest governance in the assigned set.** NGO identity, privacy policy, terms, deletion path, MIT licence, 343 commits, org-level contact. Whatever else is true, this is a team that can be talked to formally — which makes them a good early partner for the governance and consent parts of the protocol, even though their data is the hardest to federate.
