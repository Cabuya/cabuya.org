# APP dossier — `encuentratumascota` (Encuentra tu mascota)

## TL;DR

- Laravel/PHP 8.3 server-rendered classifieds board for lost and found pets, hosted on
  Hostinger shared hosting behind the `hcdn` CDN; ~6 pages of "se busca" listings at probe time.
- **Best privacy posture observed in this analyst's three apps:** no owner contact data is
  publicly rendered — contact is brokered through a form that relays the finder's phone to
  the owner over WhatsApp. Listing IDs are UUIDv4, not enumerable.
- **No API, no MCP, no sitemap, no about/terms/privacy/contact page** — all confirmed 404.
  There is no published operator identity, no licence, and no reuse terms on the site itself.
- Feed-readiness **S**: the entity is small (type, breed, colour, zone, status, photo,
  published-at), Laravel makes a JSON route trivial, and the sensitive field (contact) is
  already excluded from the public surface by the existing design.
- Main blocker is governance, not engineering: nobody can grant reuse rights on a site with
  no terms page and no published operator.

**Inputs:** `src/content/ecosystem-apps/encuentratumascota.yaml`;
`PLAN_ecosystem_apps_network_page/analysis_results/ENRICHED_PROBE.json` (seed, 2026-08-16);
live probes 2026-08-16T04:00Z–04:06Z.

---

## Identity

| Field | Value |
|-------|-------|
| Slug | `encuentratumascota` |
| Name (YAML) | Encuentra tu mascota |
| Canonical URL (YAML) | `https://encuentratumascota.co/anuncios/se-busca` |
| Site title (observed) | `Se busca · Encuentra a tu mascota` |
| Category | `pets` |
| YAML `integrations.publicApi` | `unknown` |
| YAML `integrations.publicMcp` | `unknown` |
| Featured | `false` |
| Logo authorization | `pending_contact` |

**YAML claims to verify:** "post or browse missing listings with photos and pet details";
"not a veterinary service or official rescue agency"; coverage "per listings published on
the site". All three are consistent with what was observed. The YAML integration note ("we
did not find public API or MCP documentation") is confirmed by probe — see Integration surface.

**Root behaviour:** `https://encuentratumascota.co/` is a 302 to `/anuncios/se-busca`
(2026-08-16T04:01:01Z), so the YAML's deep URL *is* effectively the home page.

---

## Probe log

All requests GET, one per path, ~1s apart. Status-only probes used `curl -o /dev/null`.

| URL | UTC timestamp | Status | Content-type |
|-----|---------------|--------|--------------|
| `https://encuentratumascota.co/` | 2026-08-16T04:01:01Z | 302 → `/anuncios/se-busca` | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncios/se-busca` | 2026-08-16T04:01:03Z | 200 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/robots.txt` | 2026-08-16T04:01:05Z | 200 | text/plain |
| `https://encuentratumascota.co/sitemap.xml` | 2026-08-16T04:01:06Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/.well-known/` | 2026-08-16T04:01:08Z | 301 → `/public/.well-known` | text/html |
| `https://encuentratumascota.co/api` | 2026-08-16T04:01:10Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/api/docs` | 2026-08-16T04:01:12Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/openapi.json` | 2026-08-16T04:01:13Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/mcp` | 2026-08-16T04:01:15Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncios/se-busca` (headers) | 2026-08-16T04:01:21Z | 200 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/publicar` | 2026-08-16T04:01:44Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncios/create` | 2026-08-16T04:01:45Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncios/nuevo` | 2026-08-16T04:01:47Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/mis-anuncios` | 2026-08-16T04:01:49Z | 200 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/login` | 2026-08-16T04:01:51Z | 404 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncios/se-encontro` | 2026-08-16T04:01:52Z | 200 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/anuncio/00c3f224-…-61641d299852` | 2026-08-16T04:05:35Z | 200 | text/html; charset=utf-8 |
| `https://encuentratumascota.co/acerca` | 2026-08-16T04:06:09Z | 404 | — |
| `https://encuentratumascota.co/nosotros` | 2026-08-16T04:06:11Z | 404 | — |
| `https://encuentratumascota.co/about` | 2026-08-16T04:06:13Z | 404 | — |
| `https://encuentratumascota.co/terminos` | 2026-08-16T04:06:14Z | 404 | — |
| `https://encuentratumascota.co/privacidad` | 2026-08-16T04:06:16Z | 404 | — |
| `https://encuentratumascota.co/contacto` | 2026-08-16T04:06:18Z | 404 | — |

`robots.txt` body (2026-08-16T04:01:05Z): `User-agent: *` / `Disallow:` — an empty
disallow, i.e. everything is crawlable. No `Sitemap:` directive.

Only public listing surfaces were touched. No authenticated area was probed: `/mis-anuncios`
is the *unauthenticated* access screen, not a logged-in view.

---

## Observable architecture

Evidence from response headers at 2026-08-16T04:01:21Z and page markup at 2026-08-16T04:05:08Z.

- **Framework: Laravel (PHP).** Confirmed by the `XSRF-TOKEN` cookie plus an app-named
  session cookie `encuentra-a-tu-mascota-session`, both Laravel's default encrypted-cookie
  format. `x-powered-by: PHP/8.3.30`.
- **Rendering: server-side, no SPA.** `cache-control: no-cache, private` on the listing page;
  markup contains no Livewire (`wire:` = 0 occurrences), no Alpine, and exactly one `fetch(`
  call. Assets are served from `/build/assets/…` — Laravel + Vite.
- **Hosting: Hostinger shared hosting.** Response headers `platform: hostinger`,
  `panel: hpanel`, `server: hcdn`, `x-hcdn-cache-status: DYNAMIC`, `x-hcdn-request-id`
  with a `phx-edge8` node. HTTP/2 with `alt-svc: h3`.
- **The `/.well-known/` 301 to `/public/.well-known`** is a Laravel-on-shared-hosting
  fingerprint: the document root is the project root rather than `public/`, so `.well-known`
  is rewritten into the public directory. Worth noting because it means a future
  `/.well-known/aid-protocol` discovery document would need a rewrite rule, not just a file.
- **Media: Laravel public storage.** Images resolve to
  `/storage/anuncios/{uuid}/{random-string}.{webp|jpg|png}` — the classic `storage:link`
  layout. Mixed formats in the same index (webp, jpg, png) indicate **raw uploads with no
  server-side transcoding or responsive resizing** — a performance note, and a signal that
  no image pipeline exists to hook a feed's thumbnail contract into.
- **Identifiers: UUIDv4.** Listing detail URLs are
  `/anuncio/00c3f224-3888-4b97-84d8-61641d299852` — full UUIDs, matching the UUID folder in
  the storage path. Not enumerable, not sequential. This is a materially better identifier
  design than the sequential integers observed on `encontrados` (see that dossier) and it
  means the site can publish per-item permalinks in a feed without leaking a record count.
- **CSP:** `content-security-policy: upgrade-insecure-requests` only — no directive set.
- **Zero third-party hosts** referenced from the listing page markup (all 40 absolute URLs
  point at `encuentratumascota.co`): no analytics, no fonts CDN, no map tiles, no
  social embeds. `unverified` whether analytics exist server-side.

---

## Entity inventory

One entity: **pet notice** (`anuncio`). Two public collections of it.

| Collection | Route | Observed at |
|-----------|-------|-------------|
| Sought ("Se busca") | `/anuncios/se-busca` | 2026-08-16T04:01:03Z, 200 |
| Found ("Se encontró") | `/anuncios/se-encontro` | 2026-08-16T04:01:52Z, 200 |

**Fields visible on the index card** (2026-08-16T04:01:23Z, structural read; field labels
only, no values recorded): photo thumbnail, species icon, pet name, breed/type, colour or
markings description, and a location line marked with a pin (neighbourhood + city).

**Fields visible on a detail page** (2026-08-16T04:05:35Z, structural read):

| Field label | Type | Note |
|-------------|------|------|
| `Tipo` | enum | Filter values observed on the index: `dog`, `cat`, `other` |
| `Raza` | free text | |
| `Color` | free text | |
| `Zona` | free text | Neighbourhood + municipality, e.g. a Dosquebradas barrio. **No coordinates, no map** |
| status | enum | Rendered as a badge: `Se busca` / `Se encontró` |
| photos | media | Gallery with a `1 / n` counter; the sampled listing had one photo |
| published-at | relative timestamp | Rendered as `Publicado hace 22 minutos` |
| name | free text | The pet's name |

**Contact:** *not publicly rendered.* The detail page exposes a form and a
`¡Yo lo tengo!` call to action; the finder submits their own phone number, which the system
relays to the listing owner via WhatsApp. No phone number, email, WhatsApp deep link
(`wa.me` = 0 occurrences in markup) or `tel:` link appears in the public HTML. This is the
single most important observation in this dossier for protocol design.

**Freshness signals:**

- Per-item relative publication timestamp on the detail page (`Publicado hace 22 minutos`).
- **No timestamp of any kind on the index page** — no `<time>` element, no `datetime`
  attribute (both 0 occurrences in markup at 2026-08-16T04:05:08Z). A consumer cannot sort
  or diff by recency from the index alone.
- Scale signal: `Página 1 de 6` on `/anuncios/se-busca` at 2026-08-16T04:05:08Z.
- Liveness signal: the sampled listing was 22 minutes old at 2026-08-16T04:05:35Z, so the
  board was actively receiving posts during the probe window.

**Ownership / identity model** (from `/mis-anuncios`, 2026-08-16T04:01:49Z): there is **no
account system** — `/login` is 404. A poster reclaims their listings with the phone number
they used plus a self-chosen code ("the number you invented when you published the ad").
Consequences: no stable author identity to attribute a feed item to, and the poster's phone
number is held server-side even though it is never rendered publicly.

---

## Integration surface

| Surface | Verdict | Evidence |
|---------|---------|----------|
| Public REST/JSON API | **no** | `/api` 404, `/api/docs` 404, `/openapi.json` 404 (2026-08-16T04:01:10Z–04:01:13Z). No `/api/` string anywhere in the listing-page markup (2026-08-16T04:05:08Z) |
| MCP endpoint | **no** | `/mcp` 404 at 2026-08-16T04:01:15Z |
| Sitemap | **no** | `/sitemap.xml` 404 at 2026-08-16T04:01:06Z; no `Sitemap:` line in `robots.txt` |
| `/.well-known/` discovery | **no** | 301 into `/public/.well-known`, no document served |
| RSS / Atom / JSON Feed | **unknown** | No feed `<link rel="alternate">` observed in the sampled markup; no dedicated probe run |
| Structured data (JSON-LD) | **unknown** | Not extracted in this pass |
| Source code / repo | **unknown** | No `github` string in page markup; no repo found in the search performed |
| Crawl permission | **yes, implicitly** | `robots.txt` allows all agents on all paths |
| Reuse licence / terms | **no** | `/terminos` 404, `/privacidad` 404, `/about` 404 (2026-08-16T04:06:13Z–04:06:16Z). Nothing on the site grants or restricts reuse |

Operator identity: `unverified`. No about, contact, or footer credit exists on the site. A
web search on 2026-08-16T04:05:56Z surfaced a search-engine summary attributing the site to
an agency named "EnjoyDigital", but **no probed page corroborates this** and the search
results are polluted by a large family of unrelated same-name services
(`encuentratumascota.pet`, `encuentratumascotaperdida.es`, `encuentra-tu-mascota.com`,
`github.com/sborrazas/encuentratumascota`). Treat the operator as unidentified until a team
contact confirms it.

---

## Adoption effort estimate — **S** (small)

Engineering is genuinely small; governance is the real cost.

**Why S on engineering:**

1. The entity has ~8 fields and one enum for status. It maps cleanly onto a generic
   "notice" shape with a `pet` subtype.
2. Laravel makes a read-only JSON route a single controller plus a resource class. The data
   is already paginated server-side, so cursor or page-based feed pagination is free.
3. The privacy-hard part is *already solved*: contact data is not in the public view, so a
   feed built from the public projection cannot leak it by accident.
4. UUID primary keys mean stable, non-enumerable `id` values are available today with no
   migration.

**Real costs, in order:**

1. **Legal/governance (the blocker).** With no terms, no privacy policy and no published
   operator, there is no one visibly empowered to licence the feed and no statement telling a
   consumer what they may do with it. Adoption requires the operator to publish a licence
   (and, given photos of a household's pet plus a server-side phone number, a privacy notice).
2. **Timestamps.** The index has no machine-readable date. A feed needs `published_at` and
   `updated_at` as absolute ISO-8601 UTC, not `hace 22 minutos`. The data almost certainly
   exists in the database; it is a serialization change.
3. **Geocoding.** `Zona` is free text at neighbourhood granularity. Either the protocol
   accepts free-text place names with a municipality code, or this app needs a geocoding step
   it does not have today. Recommend the former — see the entity-model task.
4. **Resolution/closure signal.** The two-collection split (`se-busca` / `se-encontro`)
   encodes status by route, not by field. A feed must surface status as an explicit
   enumerated field so consumers can retire a resolved notice.
5. Shared hosting on a single origin means a feed endpoint should be cacheable
   (`Cache-Control: public, max-age=…`) to avoid load; today the app sends `no-cache, private`.

---

## Overlap map

| Overlaps with | Entity | Nature of overlap |
|---------------|--------|-------------------|
| `unidosporpereira` | pets | Its meta description explicitly lists "mascotas" alongside shelters, collection centres and meals (seed `URL_PROBE.txt`, 2026-08-16). Likely a directory-level pet section vs. this app's dedicated board — **the clearest duplicate-entity pair in the pets category** |
| `sospereira` | geography | Both operate over Pereira/Dosquebradas. No entity overlap: SOS Pereira has no pet surface among its four landing actions (2026-08-16T04:04:23Z) |
| `mapadelterremoto`, `sismovision`, `reporteco` | geography only | Same earthquake footprint, different entities (damage points, shelters, collection points) |
| External, non-ecosystem | name collision | `encuentratumascota.pet`, `encuentratumascotaperdida.es`, `encuentra-tu-mascota.com`, `encuentramimascota.com` are unrelated services sharing the name (search, 2026-08-16T04:05:56Z). Relevant to the registry design: **app identity in the protocol must key on origin/domain, never on display name** |

Duplicate-record risk *within* the ecosystem is low today because this is the only dedicated
pet board found; the risk is duplicate *notices* between this board and any pet section of a
general directory, which the protocol should resolve with an origin-qualified id.

---

## Risks & notes

1. **No terms, no privacy policy, no operator identity.** For a site that stores a poster's
   phone number and publishes household photos, this is the highest-severity finding here. It
   blocks licensing and it is a Ley 1581 de 2012 (Colombian habeas data) exposure for the
   operator, independent of any protocol work. `unverified` whether a policy exists off-site.
2. **Ownership via phone number + self-chosen code, with no account system.** The user is
   told to invent the code, so the code space is user-selected and likely weak, and the
   phone number is the only other factor. This makes listing-management authorization the
   weakest link in the app. It is not an integration blocker for a *read-only* feed, but the
   protocol must never define a write path into this app on top of that mechanism.
3. **Photos are unmoderated public media with no transcoding.** Any federated feed
   republishing image URLs inherits whatever is uploaded. Recommend feeds carry image URLs
   for hotlinking rather than consumers copying media, so takedown at the origin propagates.
4. **No abuse/report link** was observed on the detail page. A federating consumer has no
   upstream channel to flag a bad notice.
5. **Status is encoded in the route, not the record** — a consumer that caches
   `/anuncios/se-busca` has no way to learn that an item moved to `se-encontro`. Stale
   "still missing" notices are the most likely federation failure mode for this app.
6. **`/mis-anuncios` returning 200 unauthenticated is correct** (it is the access form), but
   it means automated availability checks against that path prove nothing about auth health.
7. Probe volume: 23 requests to this host over ~5 minutes, all public listing/informational
   paths, ~1s apart, no auth areas, no bulk crawling. Within the responsible-probing rule for
   a non-sensitive category.
8. The pet category is **lower-risk than people, not no-risk**: a notice carries a photo of a
   home's animal, a neighbourhood, and a timestamp, and the poster's phone sits behind it.
   See this analyst's normative recommendation in the final report.
