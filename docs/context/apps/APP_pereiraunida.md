# APP_pereiraunida — Pereira Unida

**Inputs:** `src/content/ecosystem-apps/pereiraunida.yaml` · `PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}` · live probing 2026-08-16T04:00:57Z–04:02:02Z.
**Probe agent string used:** `CoragEcosystemAnalysis/1.0 (protocol interop research; +https://corag.app/ecosystem)`.
**PII handling:** the home page server-renders live citizen help requests including personal names and phone numbers. **No record value, title, name, phone or location from that payload is reproduced in this dossier.** Only field names, enum values, counts and formats are recorded.

## TL;DR

- Pereira Unida is the **most data-rich matching app in the assigned set after Corag** — and the only one whose full entity model is observable, because it server-renders its records into the RSC payload.
- Stack: Next.js (App Router, Turbopack) on Vercel, with **Supabase** as the backing datastore (`preconnect` to a named Supabase project) and OpenFreeMap tiles.
- Four entities observed: help requests, volunteers, a family/people register, and **rental listings (`arriendos`)** — the last is unique in the ecosystem and is a genuine post-emergency need nobody else models.
- No public API, MCP, sitemap or docs found. `publicApi`/`publicMcp` stay **`unknown`** (not "no"): a Supabase project implies a PostgREST endpoint exists, it is simply not documented or advertised.
- It has the ecosystem's **best freshness and moderation vocabulary**: `last_confirmed_at`, plus statuses `ocultada`, `duplicado`, `informacion_falsa`, `reabierta`, and a visible "4 falsos" counter.
- Feed-readiness: **S–M** — a Supabase view + one Edge Function is a conforming feed, but the PII in their current shape has to be stripped first, which is a product decision, not a code change.

## Identity

| Field | Value | Source |
|---|---|---|
| Name | Pereira Unida | `pereiraunida.yaml` |
| Primary URL | `https://pereiraunida.com/` | `pereiraunida.yaml`; 200 at 2026-08-16T04:00:57Z |
| Alias | `https://pereira-unida.vercel.app` | `pereiraunida.yaml`; seed `URL_PROBE.txt` recorded 200 with identical title/description |
| Category (YAML) | `matching` | `pereiraunida.yaml` |
| Featured / order | `featured: false`, `order: 10` | `pereiraunida.yaml` |
| Logo authorization | `pending_contact` | `pereiraunida.yaml` |
| Site name (meta) | `Pereira Unida` (`og:site_name`) | probe 2026-08-16T04:02:00Z |
| Declared coverage | Pereira and Dosquebradas | `pereiraunida.yaml`; confirmed by the two municipality filter chips in the UI (2026-08-16T04:02:00Z) |
| Operator / team | Not stated on the home page; no about page, GitHub link or license notice observed | probe 2026-08-16T04:02:00Z — `unverified` |

**YAML claims:** `publicApi: unknown`, `publicMcp: unknown`, notes "No encontramos documentación pública de API ni MCP en el sitio." **Re-verified and still accurate as of 2026-08-16T04:01Z.**

## Probe log

All requests `GET`, one each, no auth.

| URL | UTC timestamp | Status | Content-Type |
|---|---|---|---|
| `https://pereiraunida.com/` | 2026-08-16T04:00:57Z | 200 (366 310 B) | `text/html; charset=utf-8` |
| `https://pereiraunida.com/robots.txt` | 2026-08-16T04:00:59Z | **200** (38 B) | `text/plain; charset=utf-8` |
| `https://pereiraunida.com/sitemap.xml` | 2026-08-16T04:01:01Z | 404 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/.well-known/` | 2026-08-16T04:01:02Z | 308 → `/.well-known` | `text/plain` |
| `https://pereiraunida.com/api` | 2026-08-16T04:01:04Z | 404 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/api/docs` | 2026-08-16T04:01:06Z | 404 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/openapi.json` | 2026-08-16T04:01:07Z | 404 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/mcp` | 2026-08-16T04:01:09Z | 404 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/` (body + headers capture) | 2026-08-16T04:02:00Z | 200 | `text/html; charset=utf-8` |
| `https://pereiraunida.com/robots.txt` (body capture) | 2026-08-16T04:02:02Z | 200 | `text/plain; charset=utf-8` |

10 requests to `pereiraunida.com`. Zero requests were made to the Supabase host (see Risks §7).

**`robots.txt` full content** (2026-08-16T04:02:02Z):

```
User-Agent: *
Allow: /
Disallow: /a/
```

`/a/` is disallowed and was therefore **not probed**. Its purpose is `unverified`; the pattern (short, opaque, excluded) is consistent with an admin or moderation area.

## Observable architecture

- **Hosting/edge:** `server: Vercel`, `x-vercel-id: iad1::…`, `x-vercel-cache: STALE`, `x-matched-path: /` (2026-08-16T04:02:00Z).
- **Framework:** Next.js App Router, confirmed by `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch` and `x-nextjs-prerender: 1`. **Turbopack** confirmed by the chunk `/_next/static/immutable/chunks/turbopack-3n7cf3j9lbbh5.js`. Asset path `/_next/static/immutable/chunks/*` indicates a recent Next.js with content-addressed immutable chunks.
- **Rendering strategy:** ISR/PPR-style. `x-nextjs-prerender: 1` + `x-nextjs-stale-time: 300` + `cache-control: public, max-age=0, must-revalidate` + `etag: "7ikh0vgrvy7tgk"` — the page is prerendered and revalidated on a ~300 s window. The 366 KB HTML contains the full record set inline; the client then hydrates and (per the visible "En vivo"/live behaviour) subscribes for updates.
- **Datastore:** **Supabase** — `<link rel="preconnect" href="https://ivnrelkbqqfebyullfeb.supabase.co">` in the document head (2026-08-16T04:02:00Z). The project ref is public in the HTML. The field naming (`created_at`, `last_confirmed_at`, `lat`/`lng`, snake_case throughout) and the ISO-8601 timestamps with microsecond precision and `+00:00` offset are Postgres/PostgREST-shaped, consistent with Supabase.
- **Maps:** `<link rel="preconnect" href="https://tiles.openfreemap.org">` — OpenFreeMap tiles (open, self-hostable, no API key). Notably **not** Mapbox or Google, i.e. no per-request map billing.
- **PWA:** `<link rel="manifest" href="/manifest.webmanifest">`, `theme-color: #1c1410`, apple-touch-icon + 192px icon set. Installable.
- **No `generator` meta tag**, no JSON-LD, no `application/ld+json` block observed.
- **Inferred (not asserted):** because Supabase is the datastore, a PostgREST API at `https://{project}.supabase.co/rest/v1/` and Realtime websockets almost certainly exist and are how the browser gets live updates. Marked `inferred` — **not probed**.

## Entity inventory

Extracted from JSON keys embedded in the server-rendered RSC payload of `https://pereiraunida.com/` at 2026-08-16T04:02:00Z. Occurrence counts indicate how many records of each shape were in the page at that moment.

### Entity A — Help request (`Pedir` / `Ofrecer` tabs) — ~180 records in payload

| Field | Notes |
|---|---|
| `title` | free text |
| `description` | free text |
| `category` | enum, observed values: `alimentos` (88), `otros` (28), `medicinas` (25), `revision_ingenieria` (9), `voluntariado` (8), `herramientas` (8), `transporte_logistica` (8), `mascotas` (5), `herramientas_rescate` (1) |
| `urgent_level` | enum: `critico` (94), `moderado` (86) — **binary**, no third level observed |
| `status` | enum (see status vocabulary below) |
| `location_name` | free text |
| `lat`, `lng` | numeric coordinates (399 occurrences of each across all entity types) |
| `municipality`, `department` | administrative geography (592 occurrences each — present on every record of every type) |
| `contact_phone` | **PII** — a phone number per record |
| `created_at` | `YYYY-MM-DDTHH:MM:SS.ffffff+HH:MM` |
| `last_confirmed_at` | `YYYY-MM-DDTHH:MM:SS.f+HH:MM` (variable sub-second precision) — **re-confirmation timestamp, distinct from creation** |
| `photo_urls` | array (261 occurrences) |
| `comments_count` | integer (261 occurrences) |

### Entity B — Volunteer / person offering skills — ~301 records in payload

`full_name` (**PII**), `skill`, `phone` (**PII**), plus the shared `status`, `municipality`, `department`, `created_at`, `description`, `lat`, `lng`.

`skill` enum observed: `otro` (94), `alimentacion` (60), `psicologia` (43), `transporte` (33), `rescate` (26), `medico` (19), `oficios` (12), `enfermeria` (6), `legal` (5), `ingenieria` (3).

### Entity C — Rental listing (`Arriendos` tab) — ~81 records in payload

`property_type` (enum: `Apartamento` 53, `Casa` 10, `Apartaestudio` 10, `Habitación` 6, `Local` 1, `Otro` 1 — note these are **display-cased Spanish strings, not slugs**), `neighborhood`, `address`, `monthly_rent`, `furnished`, `contact`, `submitted_at` (`YYYY-MM-DDTHH:MM:SS+HH:MM`, second precision), plus shared geography fields.

**This entity has no counterpart anywhere else in the 20-app ecosystem.** Post-earthquake housing supply is a real need class and Pereira Unida is the only app modelling it.

### Entity D — Family / people register (`Familia` tab)

A tab labelled "Familia" is present in the UI (2026-08-16T04:02:00Z). Its distinct field set could not be separated from Entity B in the payload. **`unverified`** — and per the plan's people-data rule this entity is **link-out only by design** regardless of what it contains; it must not federate.

### Shared status vocabulary (all entities, 592 records)

`activa` (243), `buscando` (140), `disponible` (62), `ocultada` (58), `resuelto` (26), `reabierta` (24), `ocupada` (19), `duplicado` (6), `cerrada` (6), `informacion_falsa` (4), `en_camino` (4).

This is **eleven** values spanning three different axes — lifecycle (`activa`/`cerrada`/`resuelto`/`reabierta`), fulfilment (`buscando`/`disponible`/`ocupada`/`en_camino`), and moderation (`ocultada`/`duplicado`/`informacion_falsa`). Any protocol status enum will have to decompose this into orthogonal fields; a flat mapping loses information.

### Freshness signals — the strongest in the assigned set

- `last_confirmed_at` per record: an explicit "someone re-verified this" timestamp, separate from `created_at`. **This field is the single best idea to lift into the protocol** — staleness is the number-one data-quality problem in emergency directories and this is a direct, cheap answer to it.
- Relative-time rendering in the UI ("Hace 52 minutos", "Hace N horas" — 19 such labels in the 2026-08-16T04:02:00Z payload), so freshness is surfaced to users, not just stored.
- A `⏱️ Últimas 6 h` filter chip — recency is a first-class filter.
- Live counters, observed drifting between probes: seed capture read `143 activos · 78 críticos`, `Todos 180`, `Cerrados 37`, `4 falsos`; the 2026-08-16T04:02:00Z capture read `144 activos · 78 críticos`, `Todos 180`, `Cerrados 36`, `4 falsos`. The counts moved between captures — **the dataset is demonstrably live**.
- `comments_count` per record — community activity as an implicit freshness proxy.
- Community moderation is user-facing: the list header reads "Toca una fila para notas o marcar info falsa · 4 falsos", and `reason` / `note` keys appear in the payload alongside the moderation statuses.

### Privacy pattern already in place

The literal string "Ubicación exacta" appears as a per-record label 194 times (2026-08-16T04:02:00Z) — the app distinguishes records with a precise location from those without, i.e. **location precision is already a modelled, displayed attribute**. That is directly reusable as a protocol `locationPrecision` field.

## Integration surface

**publicApi: `unknown`** — evidence and reasoning:

- Probed and 404: `/api`, `/api/docs`, `/openapi.json` (2026-08-16T04:01:04Z–04:01:07Z). No API documentation link anywhere on the home page.
- **But**: a Supabase project is preconnected from the document head, and Supabase exposes PostgREST at `https://{ref}.supabase.co/rest/v1/` by default. An HTTP data API therefore almost certainly exists.
- It is `unknown`, **not `no`**, and must never be written as "they don't have one". The correct statement is: *no first-party public API is documented or advertised on `pereiraunida.com`; a backing Supabase datastore is visible in the page source but was not probed.*

**publicMcp: `unknown`** — `/mcp` returned 404 with the app's HTML shell (2026-08-16T04:01:09Z). No MCP reference anywhere on the site. No positive evidence either way.

**Machine-readable discovery:** none. No sitemap (404), no `.well-known` (308 into the shell), no JSON-LD, no OpenAPI.

**Crawl policy:** stated and permissive for the public surface (`Allow: /`), with `/a/` excluded. This is the only app in the assigned set with a hand-written, app-specific `robots.txt` — a small but real signal that the team thinks about machine access.

**Licensing / terms:** none observed on the home page. `unverified`.

## Adoption effort estimate

**S–M (small to medium).**

The **engineering** is S:

1. Supabase makes a feed nearly free — a `security definer` view that selects the non-personal columns, exposed either through PostgREST directly or through one Edge Function that emits the protocol envelope. Hours, not days.
2. Every field the protocol will want already exists and is already typed: geography (`municipality`, `department`, `lat`, `lng`), category, urgency, status, `created_at`, and — rare — `last_confirmed_at`.
3. The team already runs Vercel + Next.js + Supabase, i.e. exactly the stack the agent skill will target. A coding agent with the skill could produce their feed in one sitting.

The **product decision** is what makes it M:

4. Their current record shape is PII-first: `full_name`, `phone`, `contact_phone` are on the majority of records and are *the point* of the app (a request without a way to reach the requester does not connect anyone). Publishing a feed means deciding what a record looks like with those columns removed — and whether a stripped record is still useful to them. That is a conversation, not a ticket.
5. Their status enum (11 values, three axes) and category enum (9 observed values, overlapping-but-not-equal to Corag's 15) both need a mapping table. `revision_ingenieria`, `transporte_logistica`, `herramientas_rescate` have no clean Corag equivalent; Corag's `agua`, `higiene`, `panales`, `ropa`, `refugio`, `acopio` have no Pereira Unida equivalent. **Neither enum is a superset of the other** — this is the concrete evidence that the protocol needs its own vocabulary plus per-app crosswalks, not a "pick the biggest existing enum" shortcut.

## Overlap map

| Overlap dimension | Apps that collide | Nature |
|---|---|---|
| **Needs/offers matching** | `corag`, `sostremoto`, `helpthemdirectly` | Direct — same core request/offer entity. Pereira Unida's Pedir/Ofrecer maps 1:1 onto Corag's `type: request \| offer`. `sostremoto` has migrated into Corag, leaving Pereira Unida and Corag as the two live independent matching boards on the same territory. |
| **Geography — Pereira + Dosquebradas** | `corag` (`eje-cafetero`), `pereiraayuda`, `pereiravive`, `unidosporpereira`, `gogo`, `alluda`, `sospereira`, `pereiraresponde`, `sismovision` | **The densest overlap in the whole ecosystem.** Ten apps, two municipalities. Pereira Unida's `municipality`/`department` pair is the cleanest administrative-geography model observed and is a good normalization anchor. |
| **Collection points (`acopio`)** | `alluda`, `aquiayuda`, `ayudared`, `pereiraayuda`, `pereiravive`, `unidosporpereira`, `gogo` | High — the UI has a `📦 Acopio` filter chip, so acopio points are surfaced as a record class, while the logistics apps model them as first-class places. Same real-world places, two different entity treatments. **Concrete duplicate-place risk: Pereira/Dosquebradas collection centres almost certainly appear in Pereira Unida, `pereiraayuda`, `unidosporpereira`, `alluda` and `pereiravive` simultaneously** — five records, one place, no shared identifier. Record-level confirmation not attempted (would require reading individual records). |
| **Volunteers with skills** | `alluda` (volunteer/transporter signup per seed), `corag` (`category: voluntariado`) | Medium. Pereira Unida is the only assigned app with a **typed skill taxonomy** (10 values incl. `psicologia`, `enfermeria`, `legal`). Corag flattens the same thing into one category value. |
| **Structural/engineering assessment** | `sismovision`, `pereiraresponde`, `mapadelterremoto`, `gravitas`, `reporteco`, `terremotocolombia` | Partial and interesting: `category: revision_ingenieria` (9 records) and the `🏗️ Ingeniería` chip mean Pereira Unida carries *requests for* engineering inspection, while the damage apps carry *reports of* damage. Complementary, not duplicate — a natural cross-app handoff and a good first federation use case. |
| **Rentals / housing** | none | **Unique.** No other app in the 20 models `arriendos`. |
| **Pets** | `encuentratumascota`, `corag` | Partial — `category: mascotas` (5 records) here means pet-related needs; `encuentratumascota` is lost-pet classifieds. Same word, different entity. |
| **People / family** | `encontrados`, `sospereira` | The `Familia` tab is people-adjacent. Per the plan's rule this stays **link-out only**; Pereira Unida's family register must not be a federation source. |

## Risks & notes

1. **PII is server-rendered into a publicly cacheable HTML document.** `full_name`, `phone` and `contact_phone` for ~480 records were in the 366 KB response at 2026-08-16T04:02:00Z, on a page with `Allow: /` in `robots.txt` and no `noindex`. This is the ecosystem's clearest illustration of why **the protocol must forbid contact data in feeds and require link-out to origin**. Stated as a design lesson, not as a criticism of a volunteer team working an emergency.
2. **Consent is not modelled.** Unlike Corag's required `publishContact` boolean, no consent flag is observable in Pereira Unida's payload. If their data ever federates, consent state has to be added at source — a consumer cannot infer it.
3. **Status enum conflates three axes** (lifecycle / fulfilment / moderation) in one field. Federating it flat will produce wrong reads: a consumer that sees `ocultada` cannot tell whether the need is met or the record is suppressed. The protocol should split `lifecycleStatus`, `fulfilmentStatus` and `moderationStatus`.
4. **Moderation statuses must not federate as-is.** `informacion_falsa`, `duplicado` and `ocultada` are internal trust judgements. Publishing another app's "this is false" verdict downstream, without the evidence or the appeal path, is a defamation-shaped risk. Recommendation: suppressed records are **omitted** from the feed, not published with a moderation label.
5. **Enum drift with Corag is already real** — neither category vocabulary contains the other (see Adoption effort §5). Any protocol that assumes convergence-by-goodwill will fail here; crosswalk tables are mandatory.
6. **Free-text `location_name` plus `lat`/`lng` plus `municipality`/`department` with no place identifier** means the same collection centre is a different record in every app. Rung 3 of the integration ladder (shared place registry) is the highest-value, lowest-controversy first deliverable, and Pereira Unida is a strong pilot partner for it.
7. **The Supabase host was deliberately not probed.** The project ref is public in the page source, but the backing datastore of another team's app is not a "public documented endpoint" under the plan's responsible-probing rule, and probing it could be read as a security test. Anyone continuing this work should ask the team, not the database.
8. **`/a/` is `Disallow`ed and was not probed**, per their stated crawl policy.
9. **No team, contact, license or terms information** is discoverable on the site (2026-08-16T04:02:00Z). The `logoAuthorization: pending_contact` status in the YAML is consistent with this: there is no published channel to contact them through. **The working group needs a contact route for this team before any protocol commitment is assumed on their behalf** — and per plan guideline 9, nothing here commits them.
10. **Alias domain drift:** `pereira-unida.vercel.app` serves the same app (seed `URL_PROBE.txt`) but its OG image points at the `pereiraunida.com` origin. Two hostnames serving one dataset is a small identity problem for any registry that keys apps by URL — the registry should key by a stable app ID, not a hostname.
