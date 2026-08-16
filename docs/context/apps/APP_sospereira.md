# APP dossier — `sospereira` (SOS Pereira 2026)

> **people-data: link-out only by design; analyzed at tool level only.**
>
> This portal publishes a missing-persons list ("la lista es pública") and runs municipal
> report flows. Per the plan's zero-PII rule, `/desaparecidos` and every other listing or
> case surface was **not** requested. Analysis is confined to the landing page, `robots.txt`
> and status-only endpoint probes. `/login` was identified as the operator entry point and
> deliberately not exercised.

## TL;DR

- The ecosystem's **only institutional node**: a Laravel portal under Alcaldía de Pereira
  branding, self-hosted on nginx/Ubuntu rather than a managed platform, acting as a hub for
  four citizen actions.
- It spans **three distinct entity domains at once** — missing persons, damaged structures,
  and an affected-business census — which makes it the single most protocol-relevant app in
  this analyst's set: two of its three domains are federable, one is categorically not.
- The business census is **not in the portal at all**: the landing page links out to a
  `tinyurl.com` third-party form, so the municipality's own economic-impact dataset lives
  outside its own system.
- No API, no MCP, no sitemap, no `security.txt`. `robots.txt` exists and allows everything —
  including, by omission, the public missing-persons list.
- Feed-readiness: **LINK-OUT for the people domain; M for the structures domain**, contingent
  on a governmental decision this analysis cannot make on the municipality's behalf.

**Inputs:** `src/content/ecosystem-apps/sospereira.yaml`;
`PLAN_ecosystem_apps_network_page/analysis_results/ENRICHED_PROBE.json` (seed);
live probes 2026-08-16T04:03Z–04:04Z.

---

## Identity

| Field | Value |
|-------|-------|
| Slug | `sospereira` |
| Name (YAML) | SOS Pereira 2026 |
| URL | `https://sospereira.com/` |
| Category | `people` |
| Site title (observed) | `Sospereira2026` |
| H1 (observed) | `SOS PEREIRA 2026`, under the eyebrow `Portal ciudadano · Pereira` |
| YAML `integrations.publicApi` | `unknown` → confirmed **no** at the probed paths |
| YAML `integrations.publicMcp` | `unknown` → confirmed **no** |
| Logo authorization | `pending_contact` |

**Operator: Alcaldía de Pereira (municipal government).** Evidenced on the landing page by
the logo asset `/storage/images/logo_alcaldia.webp` carrying `alt="Logo Alcaldía de Pereira"`
(2026-08-16T04:04:23Z), plus the `Portal ciudadano · Pereira` label. This is the sole
government-operated entry in the 20-app directory.

**YAML claim check.** The YAML lists four features: missing-person reports, building reports,
a census of affected businesses, and public lists with operator access. **All four are
confirmed present as landing-page actions** at 2026-08-16T04:04:23Z, with the caveat that the
census is an outbound link rather than a portal feature (below).

---

## Probe log

Public informational surfaces only. **`/desaparecidos` (the public list), any case page and
`/login` were not requested.**

| URL | UTC timestamp | Status | Content-type |
|-----|---------------|--------|--------------|
| `https://sospereira.com/` | 2026-08-16T04:03:56Z | 200 | text/html; charset=utf-8 |
| `https://sospereira.com/robots.txt` | 2026-08-16T04:03:58Z | 200 | text/plain |
| `https://sospereira.com/sitemap.xml` | 2026-08-16T04:03:59Z | 404 | text/html; charset=utf-8 |
| `https://sospereira.com/.well-known/security.txt` | 2026-08-16T04:04:01Z | 404 | text/html; charset=utf-8 |
| `https://sospereira.com/api` | 2026-08-16T04:04:02Z | 404 | text/html; charset=utf-8 |
| `https://sospereira.com/openapi.json` | 2026-08-16T04:04:04Z | 404 | text/html; charset=utf-8 |
| `https://sospereira.com/mcp` | 2026-08-16T04:04:05Z | 404 | text/html; charset=utf-8 |
| `https://sospereira.com/` (headers only) | 2026-08-16T04:04:07Z | 200 | text/html; charset=utf-8 |
| `https://sospereira.com/robots.txt` (body) | 2026-08-16T04:04:23Z | 200 | text/plain |
| `https://sospereira.com/` (structural read) | 2026-08-16T04:04:24Z | 200 | text/html; charset=utf-8 |

10 requests over ~30 seconds, one per path, ~1s apart. No auth probing, no listing access.

`robots.txt` body (2026-08-16T04:04:23Z): `User-agent: *` / `Disallow:` — an empty disallow.
Everything is crawlable, including the public missing-persons list, with no
`Sitemap:` directive and no per-path exclusion.

**Handling note.** The landing page body was retrieved once. It proved to be a pure hub —
12,352 bytes, two `<img>` elements (the Alcaldía logo and one decorative asset), zero
`<form>` elements, and no case data of any kind — so no privacy concern arose. The local
copy was deleted at 2026-08-16T04:04:56Z regardless, as a matter of hygiene for this category.

---

## Observable architecture

Evidence from headers at 2026-08-16T04:04:07Z and landing markup at 2026-08-16T04:04:24Z.

- **Framework: Laravel (PHP).** `XSRF-TOKEN` plus a `laravel-session` cookie, both in
  Laravel's encrypted-cookie format, both `secure` + `samesite=lax`, the session cookie
  additionally `httponly`. `X-Powered-By: PHP/8.5.9` — a notably current PHP.
- **Server: nginx/1.24.0 (Ubuntu), self-hosted.** HTTP/1.1, `Transfer-Encoding: chunked`,
  no CDN or platform headers of any kind. This is a VPS or on-premise box, not Vercel /
  Cloudflare / shared hosting — a meaningful contrast with every other app in this set and a
  procurement fact: the municipality controls the origin.
- **Build: Laravel + Vite.** Assets at `/build/assets/app-DeVTQyG9.css`,
  `app-hiBxaygU.js`, `toast-qF6tQcLu.js` — content-hashed, so releases are versioned. The
  separate `toast-*` bundle implies client-side notification UI on the form flows.
- **Rendering: server-side.** `Cache-Control: no-cache, private`. No Livewire, no Alpine, no
  inline framework hydration payload on the landing page.
- **Styling: utility-class CSS with a custom design token set.** Class names combine
  Tailwind-shaped utilities with project tokens (`text-amarillo`, `text-rojo`,
  `border-amarillo/25`, `text-ink-muted`). Typography is Google Fonts —
  Big Shoulders Display, Public Sans, IBM Plex Mono.
- **Accessibility/motion quality signal.** The landing page carries a documented
  `motion-safe:`-gated beacon animation with an inline comment stating it is "globally paused
  under `prefers-reduced-motion` by the app stylesheet", and the logo link has an explicit
  `aria-label`. This portal was built with more care than its municipal-portal genre usually
  gets, and it suggests a team that would engage seriously with a protocol spec.
- **Third-party hosts on the landing page:** `fonts.googleapis.com`, `fonts.gstatic.com`,
  and `tinyurl.com` (the census link). No analytics tag observed in the landing markup;
  `unverified` whether analytics run server-side.
- **Media:** served from `/storage/images/…` — the Laravel `storage:link` layout again.

---

## Entity inventory — entity TYPES and flow only, zero instances

**No instance data was collected, and none appears below.** Entity types are inferred from
the four landing-page actions and their route names; field-level schemas were **not** probed
because doing so would mean opening report forms and public lists.

| Entity type | Entry route | Status | Notes |
|-------------|------------|--------|-------|
| **Missing person** | `/reportar` (file) · `/desaparecidos` (public list) | not probed | Landing copy states `Toma unos minutos · La lista es pública` — the operator explicitly declares the list public. Field schema `unverified` |
| **Damaged structure / building report** | `/estructuras/reportar` | not probed | The municipal counterpart to the ecosystem's damage-mapping apps. Whether reports are publicly listed is `unverified` — only a *report* route appears on the landing page, with no public structures list linked |
| **Affected-business census record** | `https://tinyurl.com/EmpresariosCensoPereira` | **external** | Not hosted in the portal. The link was **not** followed (it is a data-collection form) |
| **Operator / team account** | `/login` | not probed | Labelled `Acceso del equipo`. Implies role-separated access to case data behind the public list |

**Landing-page action set, verbatim** (2026-08-16T04:04:24Z):
`Reportar una persona desaparecida` · `Reportar edificaciones` ·
`Censo empresarios afectados` · `Ver personas desaparecidas`, with header nav
`Personas desaparecidas` · `Reportar una persona` · `Reportar estructuras` ·
`Acceso del equipo`.

**Freshness signals:** not assessed — determining them requires opening the list. Recorded as
**not probed by design**, not as absent.

**Coverage:** Municipality of Pereira. The portal name fixes it to the 2026 event.

---

## Integration surface

| Surface | Verdict | Evidence |
|---------|---------|----------|
| Public REST/JSON API | **no** (at probed paths) | `/api` 404, `/openapi.json` 404 (2026-08-16T04:04:02Z–04:04:04Z). Laravel projects commonly namespace under `/api/*` sub-paths; those were not enumerated, so read this as "no documented public API surface", not as proof of none |
| MCP endpoint | **no** | `/mcp` 404 at 2026-08-16T04:04:05Z |
| Sitemap | **no** | `/sitemap.xml` 404 at 2026-08-16T04:03:59Z |
| `security.txt` | **no** | 404 at 2026-08-16T04:04:01Z. For a government portal holding missing-person reports, this is a notable gap |
| `robots.txt` | **yes, permissive** | 200; `Disallow:` empty. No protection for `/desaparecidos` |
| Open source | **unknown** | No repository link on the landing page |
| Terms / privacy policy | **unknown** | Neither is linked from the landing page. Not probed further — a government portal's legal notices may live on the Alcaldía's main domain rather than here |
| Operator access | **yes, gated** | `/login` present, not exercised |
| Open-data publication | **unknown** | `unverified` whether structure or census data is published through Colombia's `datos.gov.co` open-data programme. **This is the highest-value follow-up question for the working group** — if the municipality already has an open-data obligation and pipeline, the structures dataset may be publishable through an existing legal channel rather than a new one |

---

## Why this app is LINK-OUT ONLY (people domain) in the protocol

This section replaces the adoption-effort estimate for the people domain. The structures
domain is treated separately below, because conflating them would lose the most useful finding
in this dossier.

1. **Same category exclusion as `encontrados`.** A public missing-persons list is identified
   natural persons in a crisis, with photographs and last-seen information. Federating it
   multiplies controllers, destroys the erasure path, and creates a targeting list for
   impersonation, extortion and trafficking risk against households known to be searching.
   The full rationale is set out in `APP_encontrados.md` and applies identically here.
2. **Institutional data carries an additional presumption of authority.** A record from an
   Alcaldía portal reads as official. Mirrored into a third-party app, it keeps the authority
   and loses the chain of custody, the correction path and the operator's context. A wrong or
   stale official-looking record is worse than a wrong unofficial one.
3. **The municipality is a data controller with statutory duties, not a volunteer team.**
   Under Ley 1581 de 2012 and the public-administration rules governing municipal data,
   redistribution decisions are not the working group's to make and cannot be granted by a
   protocol document. Any change of posture MUST come from the Alcaldía through its own
   process. (`unverified` as a legal opinion; stated as an engineering and governance
   constraint.)
4. **Operator-gated data must stay gated.** `/login` indicates data visible to the municipal
   team beyond the public list. A federation surface risks becoming a path around that
   boundary, whether by design error or by a future permissive default.
5. **A protocol that touched this data would fail politically as well as ethically.** The
   ecosystem's one institutional partner is also its most cautious. Proposing anything other
   than link-out for missing persons is the fastest way to lose the municipality — and with
   it the credibility the initiative needs.

**Therefore:** the registry may carry this portal's name, origin, category, coverage
(Municipality of Pereira), operator (Alcaldía de Pereira) and deep links to its *entry-point*
flows. It MUST NOT emit or consume any person record, photo, report field or case count from
it.

---

## What institutional operation implies for protocol adoption

This app is the ecosystem's only government node, so its constraints are worth stating
explicitly — they shape the spec's non-technical requirements more than any volunteer app does.

- **Procurement and change control.** A municipal portal changes through a contract, a vendor
  and an approval chain, not a merge request. The protocol MUST therefore be adoptable as a
  *read-only additive endpoint* that changes nothing about existing behaviour, and its
  conformance requirements must be stable enough to survive a procurement cycle. A spec that
  churns quarterly is uninstallable here.
- **Licensing is an act of government.** For a volunteer app, publishing a feed licence is a
  README edit. Here it is a decision about public data with legal consequences. The spec
  should offer a small, named set of acceptable licences (with a public-sector-friendly
  default such as CC-BY 4.0) rather than a free-text field, so the municipality's lawyers
  approve a known instrument.
- **Official data changes the trust model in both directions.** Municipal structure reports
  carry authority other apps will want to display as authoritative. The protocol therefore
  needs a first-class `source_authority` or `operator_type` field (`government` /
  `ngo` / `community` / `volunteer`) so consumers can render provenance honestly — and an
  attribution requirement so a municipal record is never displayed unattributed.
- **Operator access model, as publicly described.** The site exposes a single
  `Acceso del equipo` login and a public list; the team-side capabilities behind it are
  `unverified`. The protocol should assume any government node publishes a **narrower**
  public projection than it holds internally, and must never define a mechanism that could
  widen it. Read-only, pull-based, origin-controlled feeds satisfy this; write-back and push
  federation do not.
- **Uptime expectations run the other way.** Being self-hosted on a single nginx box with no
  CDN, this node is *less* resilient than the Vercel- and Cloudflare-hosted volunteer apps. A
  consumer must cache defensively and degrade to a link when the origin is unreachable.
- **It is also the strongest adoption lever available.** If the Alcaldía publishes one
  conforming feed, every volunteer app in the ecosystem gains a reason to conform, and the
  protocol acquires institutional legitimacy no amount of documentation buys. Prioritize the
  structures dataset accordingly.

---

## Structures domain — adoption effort estimate **M** (medium)

The building-report entity is **not** people data. It is the same class of object as the
damage points already mapped by other ecosystem apps, and it is the realistic first
integration for this node.

- **Why M rather than S:** the engineering is small (Laravel + a JSON route, as with the pets
  app), but everything around it is institutional. Approval to publish, a licence decision, a
  determination of which fields are publishable (a structure report may carry a reporter's
  identity and a specific address, both of which must be stripped or coarsened), and probably
  an alignment with the municipality's existing open-data obligations.
- **Field-level caution.** An address is not automatically safe merely because it describes a
  building rather than a person: an address plus a "structure uninhabitable" status plus a
  timestamp identifies a displaced household. The protocol's damage entity should support
  coarsened location (block, barrio, or a rounded coordinate) and MUST NOT require the
  reporter's identity.
- **Highest-value next step:** ask the team directly whether structure reports are already
  published anywhere, and whether the census results will be. Both are questions for the
  working group, not for further probing.

---

## Overlap map

| Overlaps with | Entity | Nature |
|---------------|--------|--------|
| `encontrados` | missing persons | **Direct entity overlap** — two independent public missing-person registries over the same event, one volunteer and one municipal. Real duplicate-record problem; the protocol's answer is a shared *referral* convention, never record federation |
| `mapadelterremoto` | damaged structures | **Direct entity overlap.** The open damage map covers "puntos de daño, albergues y puntos de acopio" for the same 2026-08-10 event (seed `URL_PROBE.txt`). Municipal structure reports and community-mapped damage points describe the same physical buildings from two sources — **the single clearest federable duplicate-entity pair involving this app**, and the best pilot for a `damage` feed with provenance |
| `sismovision`, `reporteco`, `sostremoto`, `terremotocolombia` | damage / seismic reporting | Same domain, assessed by the damage analyst; overlap likely on structure condition reporting |
| `alluda`, `unidosporpereira`, `pereiraunida`, `pereiraayuda` | none directly | Logistics and directory apps over the same geography; the portal has no shelter or collection-centre surface |
| Business census | — | No ecosystem counterpart found. The affected-business dataset appears unique in the directory — and it currently lives in a tinyurl'd external form |

---

## Risks & notes

1. **`robots.txt` allows crawling of the public missing-persons list.** The most consequential
   observation here. A permissive `Disallow:` over a page the portal itself calls "public"
   invites indexing and archiving of missing-person records with no expiry. Recommending a
   crawl-delay or path exclusion for `/desaparecidos` is a concrete, zero-cost contribution
   the working group could offer the municipality.
2. **No `security.txt` on a government portal handling case reports.** Same recommendation as
   for `encontrados`: offer it.
3. **The economic dataset is outsourced to a URL shortener.** `tinyurl.com/…` as the
   municipality's census entry point means the link target can change without the portal
   changing, the destination is opaque to citizens, and the resulting data is held by a
   third-party form provider outside the portal's control. Worth raising with the team
   independently of protocol work; it also means the census is **not** integrable through this
   origin, whatever is decided about the rest.
4. **Self-hosted single origin, no CDN.** A traffic spike from an ecosystem-wide "check the
   official portal" moment lands on one nginx box. Any protocol-driven polling MUST be
   conservative — conditional requests, `ETag`/`If-Modified-Since`, and a documented minimum
   poll interval. This node is the reason the spec needs a politeness section.
5. **PHP 8.5.9 with content-hashed Vite assets** indicates active, current maintenance —
   a positive signal for adoption capability.
6. **No terms or privacy policy linked from the landing page.** `unverified` whether they
   exist on the Alcaldía's main domain. A consumer cannot today determine reuse rights for
   anything this portal publishes.
7. **Categorization note for the matrix.** This app is filed under `people`, but it is
   materially a multi-domain portal (people + damage + economic census). The matrix row should
   carry the primary category with an explicit multi-domain flag, or the ecosystem's cluster
   analysis will miss the strongest damage-side overlap in the directory.
8. This dossier deliberately contains no record counts, no list contents, no form schemas and
   no case examples.
