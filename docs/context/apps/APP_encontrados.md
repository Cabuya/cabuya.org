# APP dossier — `encontrados` (Encontrados.co)

> **people-data: link-out only by design; analyzed at tool level only.**
>
> This app publishes missing-person records and processes biometric data. Per the plan's
> zero-PII rule, no case listing, search result, person page or photo was opened during this
> analysis. Every statement below concerns the **tool** — its flow design, stack, privacy
> posture and stated policies — sourced from the landing page's structural markup, the
> published privacy and terms pages, and the project's public MIT-licensed repository.
> Where a fact would have required opening a case surface, it is recorded as not probed.

## TL;DR

- A volunteer-built missing-person reunification tool: a rescuer uploads a photo of someone
  in their care, it is matched by facial recognition against family-filed reports, and the
  **rescuer's** photo is deleted immediately. Verified against the published policy.
- The photo-deletion claim in the ecosystem YAML is **accurate but partial**: it covers the
  rescuer-side upload only. Family-filed *reports* — name, status, last-seen location and
  photo — are retained and **published publicly**, by the operator's own policy.
- **It does have a public API** (`POST /api/updates`, `GET /api/people?q=`,
  `GET /api/people/<id>`, subscriptions, a WhatsApp webhook), documented in the public repo
  under MIT. This upgrades the YAML's `publicApi: unknown` — and it is precisely the API the
  protocol **must not** federate.
- Person records use **sequential integer identifiers** (`/person/{n}`, observed range in the
  4040s on the landing markup) with correspondingly enumerable photo paths. Enumerable IDs
  over a public biometric-linked corpus is the decisive re-identification argument.
- Feed-readiness: **LINK-OUT**. Not a capability gap — a category exclusion.

**Inputs:** `src/content/ecosystem-apps/encontrados.yaml`;
`PLAN_ecosystem_apps_network_page/analysis_results/ENRICHED_PROBE.json` (seed);
live probes 2026-08-16T04:02Z–04:03Z.

---

## Identity

| Field | Value |
|-------|-------|
| Slug | `encontrados` |
| Name (YAML) | Encontrados.co |
| URL | `https://encontrados.co/` |
| Category | `people` |
| Site title (observed) | `Voluntarios, rescatistas, bomberos, policías y hospitales — encontrados.co` |
| YAML `integrations.publicApi` | `unknown` → **should be `yes`** (see Integration surface) |
| YAML `integrations.publicMcp` | `unknown` → confirmed **no** |
| Logo authorization | `pending_contact` |

**Operator (organization level only):** the privacy and terms pages both name **Ni500** and
**Torrenegra** as the creators, with the service maintained by contributors and volunteers
(fetched 2026-08-16T04:03:12Z). The landing page links to `x.com/ni500` and a personal
site of the named founder; this dossier records the organizational attribution only. The
public repository is `github.com/encontradosco/encontrados`.

**YAML claim check.** The YAML says "upload a photo of someone with you; it is matched
against missing-person reports and then deleted" and lists "immediate photo deletion after
match (per the site)". **Confirmed** by the privacy policy for the rescuer path. The YAML's
`limits` field ("we do not reproduce missing-person PII on corag.app") is exactly right and
should be carried verbatim into the protocol's exclusion rationale.

---

## Probe log

Public informational surfaces only. **No case listing, search, person page or photo URL was
requested at any point.**

| URL | UTC timestamp | Status | Content-type |
|-----|---------------|--------|--------------|
| `https://encontrados.co/` | 2026-08-16T04:02:15Z | 200 | text/html; charset=utf-8 |
| `https://encontrados.co/robots.txt` | 2026-08-16T04:02:16Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/sitemap.xml` | 2026-08-16T04:02:18Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/.well-known/security.txt` | 2026-08-16T04:02:20Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/api` | 2026-08-16T04:02:21Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/openapi.json` | 2026-08-16T04:02:23Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/mcp` | 2026-08-16T04:02:24Z | 404 | text/html; charset=utf-8 |
| `https://encontrados.co/` (headers only) | 2026-08-16T04:02:28Z | 200 | text/html; charset=utf-8 |
| `https://encontrados.co/` (structural read) | 2026-08-16T04:02:44Z | 200 | text/html; charset=utf-8 |
| `https://encontrados.co/privacidad` | 2026-08-16T04:03:12Z | 200 | text/html |
| `https://encontrados.co/terminos` | 2026-08-16T04:03:12Z | 200 | text/html |
| `https://github.com/encontradosco/encontrados` | 2026-08-16T04:03:56Z | 200 | text/html (different host) |

11 requests to `encontrados.co` over ~60 seconds, one per path, no repeats, no auth probing.
This is marginally above the ~8-request guidance; the overage is the two legal pages and one
header-only call, and is recorded here rather than omitted. `/desaparecidos`-style listing
routes, `/person/*` and `/photo/*` were deliberately **not** requested.

**Handling note.** The landing page body was retrieved once for structural fingerprinting. It
was found to embed case thumbnails (`/photo/{id}/thumb`) and per-person links; body retrieval
on this host was stopped at that point and the local copy was deleted at
2026-08-16T04:02:52Z. Only aggregate shapes (counts, path patterns, framework markers,
outbound hosts) were extracted from it — no case content was read, recorded, or transcribed.

---

## Observable architecture

- **Hosting: Vercel.** `server: Vercel`, `x-vercel-id: iad1::iad1::…`, `x-vercel-cache: MISS`,
  `strict-transport-security: max-age=63072000` (headers, 2026-08-16T04:02:28Z). US-East
  region (`iad1`) — worth noting for a Colombian service, both for latency and for the data
  residency question the protocol's governance work will have to touch.
- **No JavaScript framework.** Zero occurrences of `_next`, `__NEXT_DATA__`, `self.__next_f`,
  `nuxt`, `sveltekit`, `vite` or `react` in the served HTML (2026-08-16T04:02:44Z). Zero
  external `<script src>`; three inline `<script>` blocks; one external stylesheet
  (`/styles.css`). The repository README corroborates: "server-rendered HTML, minimal CSS,
  no frontend frameworks", explicitly optimized for legacy devices and poor connectivity.
  For a disaster tool this is a deliberate and well-judged constraint.
- **Backend: Node.js / Express.** Per the public repo (2026-08-16T04:03:56Z): Express,
  PostgreSQL in production (SQLite in development), storage adapters, a names-normalization
  module, a conversational bot and a notification system.
- **Facial recognition: AWS Rekognition** (per repo README). The privacy policy describes what
  is stored as "mathematical signatures" that permit comparison but not photo reconstruction —
  i.e. face embeddings/templates.
- **Messaging: Meta WhatsApp Cloud API** via a `/webhooks/whatsapp` inbound webhook; email via
  SendGrid.
- **Identifiers: sequential integers.** The landing markup exposes `/person/{n}` links in a
  contiguous band (values observed in the 4040s at 2026-08-16T04:02:44Z) and photo paths of
  the form `/photo/{n}/thumb`. Recorded as an architectural property; no such URL was fetched.
- **No `robots.txt`.** A 404 at 2026-08-16T04:02:16Z means crawlers get no directive at all
  and default to crawling everything, including person pages. Combined with sequential IDs and
  no sitemap, the corpus is trivially enumerable by any crawler. This is the finding that most
  strongly motivates protocol-level exclusion.

---

## Entity inventory — entity TYPES and flow only, zero instances

**No instance data of any kind was collected, and none appears below.**

| Entity type | Source of knowledge | Notes |
|-------------|--------------------|-------|
| **Missing-person report** | privacy policy, 2026-08-16T04:03:12Z | Filed by families. The policy states name, status and last-seen location are "visibles públicamente" and the report photo is published in the missing-persons list. Facial-recognition points are retained alongside it |
| **Rescuer sighting / "I have them with me" upload** | privacy policy | A photo submitted by a rescuer. Compared instantly, then deleted: *"esa imagen se compara al instante y se borra de inmediato"*. Only the derived facial metadata is described as retained |
| **Face template (biometric)** | privacy policy + repo | Mathematical signature enabling comparison; explicitly stated not to permit reconstruction of the photo |
| **Reporter contact** | privacy policy | Phone and/or email collected from the person filing a report. Terms restrict its use to informing about that person only |
| **Subscription** | repo README (`POST /api/people/<id>/subscriptions`) | A watcher registered against a person record, driving email/WhatsApp notifications |
| **Update / status event** | repo README (`POST /api/updates`) | The write path for reporting a missing or found person; `GET /api/people/<id>` returns "details and history", implying an append-only event log per person |

**Flow (two entry points, as described on the landing page and in the YAML):**

1. *"La tengo conmigo"* — rescuer path: upload → instant match against reports → the uploaded
   photo is deleted → the matching family is notified.
2. *"Reporta desaparecido"* — family path: file a report → the record becomes **public** and
   is indexed for matching → subscribers are notified on updates.

**Freshness signals:** not assessed. Determining them would require opening case surfaces.
Recorded as **not probed by design**, not as absent. The repo's per-person "history" endpoint
implies records carry an update trail; `unverified` whether timestamps are publicly rendered.

---

## Integration surface

| Surface | Verdict | Evidence |
|---------|---------|----------|
| Public REST API | **yes** | Documented in the public MIT repo (2026-08-16T04:03:56Z): `POST /api/updates`, `GET /api/people?q=<query>` (fuzzy name search), `GET /api/people/<id>`, `POST /api/people/<id>/subscriptions`. Note `https://encontrados.co/api` itself returns 404 — the documented routes are the sub-paths, which were **not** called |
| OpenAPI document | **no** | `/openapi.json` 404 at 2026-08-16T04:02:23Z |
| MCP endpoint | **no** | `/mcp` 404 at 2026-08-16T04:02:24Z |
| `robots.txt` | **no** | 404 at 2026-08-16T04:02:16Z — no crawl directives published at all |
| Sitemap | **no** | 404 at 2026-08-16T04:02:18Z |
| `security.txt` | **no** | 404 at 2026-08-16T04:02:20Z — no published vulnerability-disclosure channel for a service processing biometric data |
| Open source | **yes** | `github.com/encontradosco/encontrados`, **MIT**, topics `colombia`, `disaster-response`, `earthquake`, `express`, `face-recognition`, `missing-persons`, `nodejs`, `open-source`; 9 stars, 10 forks, 194 commits on `main` at 2026-08-16T04:03:56Z |
| Inbound webhook | **yes** | `/webhooks/whatsapp` (Meta Cloud API), per repo |
| Interop with other registries | **partial** | The landing page links out to `colombiatebusca.com`, and the repo describes imports from public missing-persons registries. `unverified` whether that import is automated or manual |
| Reuse terms | **restrictive** | Terms (2026-08-16T04:03:12Z): contact data may be used *"únicamente para informar sobre la persona; cualquier otro uso está prohibido"*. Service is "tal cual" with no availability or accuracy warranty. Facial recognition is stated to be "an aid, not proof" |

**Discrepancy to flag:** the repo description as summarized on 2026-08-16T04:03:56Z refers to
an **August 2024** earthquake, while this plan's event anchor is 2026-08-10. Either the repo
text predates the current event, the project was reused from an earlier response, or the
summary is imprecise. Recorded as `unverified` — do not repeat either date as fact without a
direct read of the repository README.

**Tension worth surfacing to the working group:** the terms reportedly *invite* AI agents to
help locate missing-person reports on social media, while simultaneously prohibiting any use
of contact data beyond informing about the person. A protocol that positions itself as
agent-friendly must not be read as endorsing the first half of that; see the exclusion
rationale below.

---

## Why this app is LINK-OUT ONLY in the protocol

This section replaces the adoption-effort estimate. The question is not whether Encontrados
*could* emit a conforming feed — with an Express backend, a documented API and an MIT licence,
it plainly could, in an afternoon. The question is whether it **should**, and the answer is no.

1. **The payload is special-category personal data.** A missing-person record combines an
   identified natural person, a photograph, a last-seen location and a health/safety status,
   and the system additionally holds a **biometric template**. Under Colombia's Ley 1581 de
   2012 and Decreto 1377 de 2013, biometric and sensitive data attract heightened consent and
   purpose-limitation duties. Federation multiplies controllers without multiplying consent:
   the family consented to *this* operator publishing *this* record, not to N downstream
   caches. `unverified` as a formal legal opinion — this is an engineering risk assessment,
   and the working group should obtain counsel before any contrary decision.
2. **Consent cannot be withdrawn from a federated copy.** The privacy policy offers deletion
   on request via a published operator email. That remedy is real only while the origin is the
   single source. Once records are mirrored into other apps' stores, "delete me" becomes a
   promise no one can keep — the classic distributed-erasure failure. A person found safe, a
   family that changes its mind, a record filed in error, a case that becomes a criminal
   matter: every one of these needs an erasure path that federation destroys.
3. **Re-identification and enumeration.** Sequential `/person/{n}` identifiers, no
   `robots.txt`, and no sitemap mean the corpus is already walkable. A protocol feed would
   hand that corpus to consumers as clean structured JSON with names, locations and photo URLs
   pre-parsed — converting a scraping cost into a zero-cost bulk transfer, and enabling
   cross-referencing against other ecosystem datasets that were never meant to be joined.
4. **Abuse surface, disproportionately against the vulnerable.** Missing-person data during a
   disaster is a targeting list: it identifies households that are absent, distressed,
   searching, and likely to answer an unknown caller. Predictable abuses include impersonation
   of authorities, ransom and "I have information" extortion, donation fraud against named
   families, and — because reports concern people including minors — trafficking and
   grooming risk. The terms' own restriction of contact data to "informing about the person"
   is the operator telling us exactly this.
5. **Matching accuracy is not federation-safe.** The terms state that facial recognition "is
   an aid, not proof" and require verification by other means before acting. A probabilistic
   match is defensible inside one tool with one operator's human review. Propagated across
   apps, a low-confidence match loses its caveat, gains false authority from repetition, and
   can produce a wrong identification of a living or deceased person — a harm with no undo.
6. **Institutional primacy.** Missing-person cases belong with the family, the operator, and
   the authorities. The protocol adds nothing here that a hyperlink does not, and it would
   dilute accountability by placing intermediaries between a family and the record.

**Therefore, the protocol MUST treat this app as a directory node only.** The registry may
carry its name, origin, description, category, coverage area and a deep link to its
*entry-point* flows. It MUST NOT define, and conforming implementations MUST NOT emit or
consume, any person record, photo, face template, contact detail, or case count from it. The
correct integration is a link that sends a user to `encontrados.co` — layer 1 of the
five-layer ladder, permanently, by design and not for lack of capability.

**What the ecosystem should offer this app instead:** an inbound referral standard (how other
apps link *to* it correctly and consistently), a shared "how to report a missing person"
content block, and — if the working group wants a technical contribution — a `robots.txt`,
a `security.txt` and a non-enumerable identifier scheme, all of which are upstream security
improvements the protocol effort can donate without touching a single record.

---

## Overlap map

| Overlaps with | Entity | Nature |
|---------------|--------|--------|
| `sospereira` | missing persons | **Direct entity overlap.** SOS Pereira runs its own missing-person report flow and public list under municipal branding (2026-08-16T04:04:23Z). Two independent public registries over the same population and the same event is a real duplicate-record problem — and one the protocol explicitly must **not** solve by federating records. The safe intervention is a shared *referral* convention so each site can point to the other |
| `colombiatebusca.com` (outside the ecosystem directory) | missing persons | Linked from the landing page as a public registry where families publish; the repo describes importing from public registries. Not an ecosystem app; relevant as prior art for a national-scale registry |
| `helpcolombia.vaki.org`, `vaki.co` | donations | Linked from the landing page for fundraising. Different entity (campaign), adjacent to the ecosystem's logistics category |
| Everything else in the ecosystem | geography only | Same event footprint, disjoint entities |

---

## Risks & notes

1. **The clean-sounding claim needs its second half.** "The photo is deleted immediately" is
   true of the rescuer upload and false of the family report, whose photo is published. Any
   corag.app or protocol copy describing this app MUST carry both halves, or it publishes a
   claim it cannot back.
2. **Biometric processing on a US-region third-party service.** Face templates derived from
   Colombian residents, matched via AWS Rekognition, served from `iad1`. Not a protocol
   decision to make, but it belongs in the working group's risk register and it reinforces why
   this data stays at one origin.
3. **No `security.txt`, no `robots.txt`.** For a service holding biometric and
   missing-person data, the absence of a disclosure channel is the highest-value, lowest-cost
   fix available. Recommend the working group offer it as a goodwill contribution.
4. **Enumerable identifiers.** Recorded from public markup, never exercised. Should be raised
   with the team privately rather than published in any community-facing document — this
   dossier is an internal analysis artifact and the finding should be summarized, not
   detailed, in RFC-0.
5. **MIT licence on the code is not a licence on the data.** A future reader may conflate the
   two. The protocol spec should state the distinction explicitly: open-source implementation,
   non-federated data.
6. **Volunteer-maintained with no SLA** ("tal cual", no availability warranty). Even for
   link-out, the registry should degrade gracefully when the target is down, and should not
   assert liveness it has not checked.
7. This dossier deliberately contains no freshness metrics, no record counts, no case
   examples and no field-value samples. That is the correct output shape for this category,
   and the matrix row should reflect the same discipline.
