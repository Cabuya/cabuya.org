# ADOPTION_PLAYBOOK.md — how `cabuya` gets adopted

> **TL;DR**
> 1. **Nobody conforms today, because the spec does not exist yet.** What exists is
>    *shape*: 4 public APIs, 3 MCPs, 5 apps whose data is already one serializer away
>    from a conforming feed. The playbook turns that shape into a ladder position.
> 2. **Five waves.** Wave 0 is the convener alone (Corag ships before it asks anyone).
>    Wave 1 is six apps that already publish structured data. Wave 2 is four apps that
>    are an afternoon with the skill. Wave 3 is five apps blocked on a decision, not on
>    code. Two apps are a respected non-publishing tier; two are link-out forever.
> 3. **Three early implementers, argued from evidence:** **PereiraAyuda** (already
>    invites interop in writing), **AquíAyuda** (adoption is a *deletion* of four
>    adapters — the first consumer), **Pereira Responde** (API + MCP live, S effort,
>    and it keeps wave 1 from being a logistics-only club).
> 4. **The clock is days, not months:** one app is already being absorbed rather than
>    federated, and the ecosystem's best-documented dataset commits to maintenance only
>    through 2026-11-30.
> 5. **The convener is also the absorber.** The playbook and RFC-0 both say so out
>    loud, because the alternative — being found out later — costs the whole thing.
>
> **Inputs:** `APPS_MATRIX.md` (+ §3 ranking, §4.1 addendum) · 20 dossiers in `apps/` ·
> `PROTOCOL_DESIGN.md` (conformance ladder L0–L4, §7 exclusions, §11 walkthrough) ·
> `GOVERNANCE_AND_LICENSING.md` (Model B, §2.3 co-maintainer criteria, §3 RFC process,
> §3.5 RFC-0) · `BRAND_AND_NAMING.md` (§5 shortlist) · `PROGRESS.md` (Task 1 findings).
> Date of writing: **2026-08-16**.

> **Standing frame.** Everything here is a **proposal drafted for the working group**.
> No team has agreed to anything, no team has been contacted, nothing has been
> registered, and no level, date or wave assignment in this document commits anyone.
> Apps appear here because they are publicly listed in the ecosystem directory, not
> because they have accepted a role.

---

## 1. How to read the adoption table

**Ladder levels** are `PROTOCOL_DESIGN.md` §1: **L0** listed · **L1** manifest +
link-out · **L2** one conforming `place` feed · **L3** read API or live feeds **and**
consuming ≥ 1 peer · **L4** accepts writes. Levels are cumulative and every one of them
is a respected membership class.

**"Level today" is not a conformance claim.** No app conforms, because there is no
spec and no validator. The column records the highest ladder level an app's *existing
public surfaces* would plausibly reach once the registry exists and the envelope is
applied — measured, per Rule-0, against what was probed on 2026-08-16 and cited in its
dossier. `L0-ready` means "one registry PR away". `L2-shaped` means "publishes
structured non-personal records over HTTP, in its own format".

**The v0.1 entity is `place`, and that changes some targets.** `PROTOCOL_DESIGN.md`
§10 scopes v0.1 to places; need/offer, rental notices, hazard notices and damage are
v0.2 RFCs. So an app whose core entity is a damage report or a rental notice cannot
reach L2 in the first cycle **on its core entity** — its honest first-cycle target is
**L1 plus co-authorship of the v0.2 RFC that covers it**, or **L2 on a place subset**
it happens to hold. Marked `L2 (subset)` and `L1 + RFC` below. This is not a demotion:
the apps that write the v0.2 entity RFCs are the ones who will define them.

**What the skill automates** is the `PROTOCOL_DESIGN.md` §11 loop, specialized per
stack: read the schema → map fields → DIVIPOLA lookup → generate the serializer with
the PII deny-list surfaced to a human → write the manifest and the discovery exclusion
→ run the validator until green → open the registry PR. The column names the part of
that loop that is *this app's* actual work.

---

## 2. Per-app adoption paths (all 20)

| # | App | Cat. | Level today | First-cycle target | Effort — evidence | What the skill automates for them | Blockers |
|---|---|---|---|---|---|---|---|
| 1 | **Corag** | matching | `L4-shaped` — OpenAPI 3.1, MCP, `source`+`externalId` writes, Discovery doc (matrix row 1) | **L4** + reference fixtures | **S** — *"`HelpList` is already a feed envelope"*; the `Discovery` schema is *"80 % of a protocol service-descriptor already"*; the real cost is *"naming reconciliation, not engineering"* (`APP_corag.md` §Adoption) | Enum crosswalk from the 15-slug `category` set; `.well-known` alias as a routing line; envelope rename; validator loop | Its **own API incoherences** first: version string differs across 4 surfaces, two undocumented idempotency mechanisms, mixed casing (PROGRESS T1). And the optic in its own dossier: *"if the protocol is drafted from Corag's shapes, other teams will read it as 'adopt Corag's schema'"* |
| 2 | **PereiraAyuda** | logistics | `L4-shaped` — JSON/CSV/GeoJSON API, open-data licence, 8 MCP tools incl. negative confirmation (matrix row 14) | **L4** + the reference feed profile | **S** — *"closer to being a reference implementation than an adopter"* (`APP_pereiraayuda.md` §Adoption) | ISO-8601 normalization (`fuente` mixes machine timestamps with `"12 ago"`); prose `fuente` → structured `{source_id, source_url, retrieved_at}`; one identifier (`id` vs `slug`); discovery at a conventional path | None technical. Structured provenance must land **before** publishing, because free-text provenance is where non-place data leaks |
| 3 | **Pereira Responde** | damage | `L3-shaped` — OpenAPI 3.1 read API + `POST /mcp` in its own spec (matrix row 5) | **L2 (subset)** + **L3** as consumer; damage entity → v0.2 RFC | **S** on the feed and the field mapping (12 read fields, ISO-8601, decimal degrees — `APP_pereiraresponde.md` table); **M** only for pagination | Envelope wrap over an existing query; one route exclusion so 4 discovery paths stop serving the 8413-B SPA shell; cursor scaffold | No `updated_at`, no cursor, and **no licence anywhere** (matrix §4.1) — the licence is a human decision, not a ticket |
| 4 | **Reporte CO** | damage | `L2-shaped` — GeoJSON/CSV/KML/JSON feed, CORS `*`, open source (matrix row 8) | **L1 + RFC** (damage v0.2); **L2** if a place subset is published | **S** — *"four serializers already exist; a fifth shape is a small addition to an existing route family"* (`APP_reporteco.md` table) | Fifth serializer + envelope + `generatedAt`; DIVIPOLA crosswalk join (it stores names, not codes); fixture PRs can be written **for** them, since the repo is public | **No data licence** — README notes a LICENSE file still to be added; `/datos` uses permission language, not licence terms. And the live feed has not moved since 2026-08-10 — seeded vs live must be answered |
| 5 | **AquíAyuda** | logistics | `L2-shaped` as a **consumer** — 5-adapter registry, verb+entity capability vocabulary, namespaced external ids (matrix row 11) | **L3** — first conforming consumer | **S**, and it is *"a deletion, not a build"*: four of five adapters retire (`APP_aquiayuda.md` §Adoption) | Generate the protocol client from the registry; retire adapters; implement §4.3 consumption rules (attribution, age display, chain preservation) | **Write auth**: it currently holds an email-OTP session against another team's project — *"a governance question, not a code question"*. It owns no entities, so L3 comes from consumption plus its own cluster records |
| 6 | **Mapa del Terremoto** | damage | `L2-shaped` — `Dataset` JSON-LD, **CC BY 4.0**, DIVIPOLA + EDAN, sitemap `lastmod` ≡ `dateModified` (matrix row 7) | **L2 (subset)** — the 439 national collection points + 227 ABACO + 272 drop-off sets | **S**; licence, freshness and territorial identifiers are all marked *"Already done"* (`APP_mapadelterremoto.md` table); *"Blockers: none observed"* | Route handler over the existing store; its sitemap-`lastmod` pattern becomes the protocol's documented incremental-sync recipe (it is the source of the pattern, not a consumer of it) | **Attention, not capability** — and a **2026-11-30 maintenance horizon**. The ask must include the §7.4 wind-down conversation from day one. Compilation-licence vs source-licence ambiguity needs the per-fact attribution the spec should copy |
| 7 | **Unidos por Pereira** | logistics | `L2-shaped` — de-facto `/mapa-datos.php` JSON with a `frescura` tier, `verificado` and `aprox` flags (matrix row 13) | **L2** | **S** — *"the smallest real build in the batch after AquíAyuda, because the hard part is already done"*; the feed exists and already carries a generation timestamp and a per-record freshness tier (`APP_unidosporpereira.md` §Adoption) | Stable path + CORS `*` + `ETag`/`Last-Modified`; `estado` (type-dependent `Abierto`/`Lleno`/`Activo`) → three-axis status; rendered `hace` string → ISO timestamp | Contact fields currently ship to every caller → §7.2 requires a `contact_public` split, which is a product decision. Self-duplication (one campus listed twice, ~1.1 km apart) surfaces on first validation |
| 8 | **PereiraVive** | logistics | `L1-equiv` — per-record sitemap `lastmod`, 7-day TTL, negative confirmation, `origen` provenance; no JSON (matrix row 17) | **L1 + RFC** (rental-notice v0.2); **JSON-LD on listing pages as the on-ramp** | **S–M** — stable ids, stable URLs, closed `tipo` vocabulary; *"why not smallest"*: free-text `barrio`, polluted `municipio` (`APP_pereiravive.md` §Adoption) | PHP handler emitting JSON from the query the index already runs; `barrio`/`municipio` normalization; JSON-LD injection as the zero-commitment first step | Contact **is** the rental listing — the feed must default to withholding, a product decision. Rentals are a v0.2 entity, so L2 waits on an RFC this team should co-author (4 independent rental datasets, zero cross-links) |
| 9 | **Pereira Unida** | matching | `L2-shaped` in data terms — strongest freshness signals in the batch (`last_confirmed_at` + 6h filter), no public API (matrix row 2) | **L2** on albergues/acopio; need/offer → v0.2 | **S–M** — engineering is S (*"a `security definer` view … hours, not days"*); the M is the product decision, because `full_name`/`phone` are on the majority of records and *"are the point of the app"* (`APP_pereiraunida.md` §Adoption) | **The entire §11 walkthrough — this app is the worked example.** Schema read, crosswalk, DIVIPOLA lookup (66001/66170), PII deny-list flagged to a human, manifest, validator loop, registry PR: ≈ 2 h agent time + one human decision | The PII-strip decision. And, first: **no published contact route for the team** (dossier note 9) — the group needs a way to talk to them before anything is assumed on their behalf. Alias-domain drift means the registry must key on app id, not hostname |
| 10 | **Alluda / Ayudas Pereira** | logistics | `L2-shaped` — de-facto PostgREST; *"the most protocol-shaped schema in the batch"* (matrix row 12) | **L2** | **S–M** — a feed is *"one Supabase view plus one handler"*, and the team already ships a server-rendered view of the same data; three gaps keep it off S (`APP_alluda.md` §Adoption) | View + handler generation; status extracted out of `nombre` (CR-2); municipality normalization proposals; honest `last_confirmed_at: null` rather than invented freshness | `centros` has **no** `updated_at` and no confirmation timestamp → a conforming feed needs a schema change, not a serializer. Municipality is user-entered and wrong on some rows. **Leverage: two consumers already exist before the protocol does** — AquíAyuda reads it, PereiraAyuda cites it by name |
| 11 | **Encuentra tu Mascota** | pets | `L0-ready` — no API, no sitemap, no terms; UUIDv4 ids; contact already excluded from the public surface (matrix row 18) | **L1 + RFC** (pet-notice, v0.2) | **S** on engineering — 8 fields, one status enum, Laravel resource route, *"the privacy-hard part is already solved"* (`APP_encuentratumascota.md` §Adoption) | Laravel route + resource class; `hace 22 minutos` → absolute ISO-8601; status-by-route (`se-busca`/`se-encontro`) → an explicit field; `Cache-Control` for shared hosting | **Governance, not engineering:** no terms, no privacy policy, no published operator → *"nobody visibly empowered to licence the feed"*. Pet notices are not `place`, so L2 needs the v0.2 entity |
| 12 | **ayuda.red** | logistics | `L0-ready` — 226 records / 57 municipios, national; **no recency signal at all** (matrix row 15) | **L2** — the ecosystem's largest place feed | **M** — Next.js route handlers make the endpoint small, but *"no freshness metadata exists to publish, so a conforming feed requires a schema change"*; adoption is *"30 % code and 70 % agreeing, in writing, on the publish/never-publish line"* (`APP_ayudared.md` §Adoption) | Route handler; DIVIPOLA normalization across 57 municipios; shard-by-municipality layout with shards listed in the manifest; deny-list surfacing on its people-domain tables | Freshness columns are net-new. The **boundary** is the real work: it mixes acopio/albergues (federate) with rescue ops, damage and a missing-persons registry (never) → §7.1 entity-scoped grants and the join prohibition must be written down before a byte moves |
| 13 | **Terremoto Colombia** | damage | `L0-ready` — Express API + CDN, MIT open source, org JSON-LD; `robots` Disallow `/api` honored, not probed (matrix row 9) | **L2 (subset)** — acopio only; + consent-vocabulary RFC | **M** — *"adding a serializer route is routine. The M comes from carefully partitioning the query so no person data can leak into it"*; *"Blockers: none technical"* (`APP_terremotocolombia.md` table) | Partitioned serializer with the people tables on the deny-list; envelope + `license`/`permitted_use`; fixes the always-now `lastmod` anti-pattern | **The §7.1 textbook case:** it serves acopio **and** 307 missing-persons records from the same platform and API host, so federation must come from a surface that does not co-serve person data. The publish/never-publish call is the organization's to make, not ours |
| 14 | **SismoVisión** | damage | `L0-ready` — Vite+React over a Django REST API subdomain; identical 819-B shell on all 8 discovery paths (matrix row 6) | **L1** | **M** — engineering is S (*"DRF serializers to JSON is a day's work at most"*), the M is *"everything around it"* (`APP_sismovision.md` table) | Management command writing a static file; comment/free-text exclusion; route or host selection so the feed escapes the SPA catch-all | Three, in order: (1) a **`DEBUG=True` deployment** should be fixed before inviting integration traffic; (2) no licence; (3) no documented contact path. Its crack-severity vocabulary is unpublished, so mapping *cannot be designed* yet, and its professional-review entity has no slot in the model (M–L design work) |
| 15 | **Gogó** | logistics | `L0-ready` — Firebase; name-gate blocks read; `robots.txt` returns HTML with `content-type: text/plain` (matrix row 16) | **L1** (L2 a stretch) | **M** — *"cheapest technically, hardest organisationally"*: a Cloud Function over three collections is an afternoon, and Firestore docs already carry `timestamp` (`APP_gogo.md` §Adoption) | Cloud Function + envelope; the `_provee`/`_necesita` polarity maps cleanly and should feed **into** the canonical model rather than be flattened | The **identify-yourself gate** is a product decision, *"and it may end in 'no'"*. Broken `robots.txt` fails the L2 precondition on its own. Ownership and commercial intent are unstated, so the adoption path may have a dimension the others do not |
| 16 | **SOS Pereira 2026** | people + damage | `L0-ready`; institutional (Alcaldía branding); people list public (matrix row 20) | **L1 link-out** (people, permanent by rule); **L2 (subset)** for structures is a later-cycle institutional decision | **M** for the structures domain — engineering small, *"everything around it is institutional"*: approval to publish, a licence decision, field determination (`APP_sospereira.md` §Structures) | Laravel JSON route for structures; address coarsening; reporter-identity stripping | Municipal process, on the municipality's timetable. An address plus an "uninhabitable" status is not automatically non-personal. Its business census lives in a third-party form outside the portal entirely |
| 17 | **SOS Terremoto** | matching | `L0-ready`; **publicly migrating into Corag** — farewell interstitial, 45s auto-forward (matrix row 3) | **Not an adoption target — the first §7.4 wind-down case** | **M** nominally, *"with a strong caveat that effort may be the wrong question for this app"* (`APP_sostremoto.md` §Adoption) | Nothing to build. The skill's role here is the **wind-down checklist**: final `last_updated`, `sunset_at` in the manifest, custody transfer or an archived declaration | No visible data backend; category vocabulary is UI label text, not slugs; no timestamps anywhere. Record transfer to Corag is **unverified** — the wind-down clause exists so this is documented rather than assumed |
| 18 | **Gravitas** | damage | `L0-blocked` — no public identity, no contact, no licence, no repository; page `age` ≈ 3.4 days behind a live clock (matrix row 10) | **L0 — pending a counterpart** | **L** — *"the engineering is small; everything around it is missing. Adoption cannot begin with a spec — it has to begin with finding out who to talk to"* (`APP_gravitas.md` §Adoption) | Nothing, until a counterpart exists. Once one does, the route handler is S–M and its report-clustering would be a genuine contribution to the dedup model | Operator identity and a contact path are **prerequisites**, not tasks. Its live-clock-over-stale-data pattern is the UI form of the anti-pattern the spec names |
| 19 | **Help Them Directly** | direct aid | `L0-ready` — static + Worker + credentialed backend; **explicit AI-crawl reservation** (`ai-train=no`, AI bots `Disallow`, EU DSM Art. 4) (matrix row 4) | **L1 — directory-only tier, permanently and by choice** | **L**, *"and the size is policy and ethics, not code"* (`APP_helpthemdirectly.md` §Adoption) | Only the **non-personal manifest**: identity, coverage, events, vocabulary, aggregate counts, link-out. The skill must **honor its crawl policy** and refuse to fetch (`PROTOCOL_DESIGN.md` §2.4) | None to fix — this is a respected membership class, not a failure. *"Strip the personal data and nothing useful remains."* A machine-readable feed of families plus payment channels is a phishing kit, and it has no timestamps or status field to publish honestly |
| 20 | **Encontrados.co** | people | Has a public API — *including people search* — documented in its own MIT repo (matrix row 19) | **L0/L1 link-out — permanent, by rule §7.1** | Not an effort question. *"The question is not whether Encontrados could emit a conforming feed … The question is whether it should, and the answer is no."* (`APP_encontrados.md`) | Nothing. The skill's deny-list names this class of source and refuses to consume it | Special-category personal data plus a biometric template; sequential person ids over a public biometric-linked corpus is *"the decisive re-identification argument"*. This is a normative exclusion, not a backlog item |

---

## 3. Waves

Refined from `APPS_MATRIX.md` §3. Week numbers are relative to the working group's
first message, not calendar commitments — **no external team has agreed to a date.**

| Wave | Window | Apps | Why this wave |
|---|---|---|---|
| **0 — the convener ships first** | Weeks 1–4 | **Corag** · plus the initiative's own artifacts (spec draft, validator, registry, skill, fixtures) · **SOS Terremoto** handled as the first wind-down case | You cannot ask nineteen teams to publish a format that its author has not published. Wave 0 also fixes Corag's own API incoherences *in public*, which is the cheapest possible credibility purchase |
| **1 — reference implementations + the first consumer** | Weeks 2–8 | **PereiraAyuda** · **Pereira Responde** · **AquíAyuda** · **Reporte CO** · **Mapa del Terremoto** · **Unidos por Pereira** | All six already publish or consume structured non-personal data. Five have `S` effort ratings; the sixth (`S–M`) already ships the feed. This is where the badge stops being a hypothesis |
| **2 — an afternoon with the skill** | Weeks 6–14 | **Pereira Unida** · **Alluda** · **PereiraVive** · **Encuentra tu Mascota** | `S–M` engineering, each gated by exactly one non-engineering decision (PII strip · freshness columns · contact withholding · who may licence). The skill carries the code; the group carries the decision |
| **3 — a decision, not code** | Months 3–6 | **ayuda.red** · **Terremoto Colombia** · **SismoVisión** · **Gogó** · **SOS Pereira** (structures) | Every blocker here is a policy, an approval, a licence or a security fix. Approaching them earlier wastes the group's credibility on a conversation the other side is not ready for |
| **Directory-only tier** | Any time | **Help Them Directly** (by choice) · **Gravitas** (blocked on identity) | L0/L1 forever, stated plainly and respected. The tier exists so that "not publishing" is a membership class rather than a failing grade |
| **Link-out only** | Permanent | **Encontrados.co** · **SOS Pereira** (people domain) | Normative exclusion, `PROTOCOL_DESIGN.md` §7.1. Not revisitable by a future RFC |

**Wave discipline, stated once:** a wave does not open because a date arrived. It opens
because the previous wave produced something the next wave can point at — a live feed,
a passing validator run, a badge on somebody's footer.

---

## 4. Early implementers — the three that matter most

The criterion is not enthusiasm. It is **leverage per hour of volunteer time**.

### 4.1 PereiraAyuda — the team that already wrote the argument

They published the case for this protocol before we drafted it. `/integraciones.html`
(probed 2026-08-16T04:06:14Z) says *"La interoperabilidad con otros tableros de la
emergencia nos interesa"*, *"El crédito de terceros no se borra"*, and — the sentence
that names the gap — *"Los nombres de campo, los valores posibles y los parámetros de
las herramientas salen del código."* A team that has publicly stated it wants interop
and publicly stated its contract is undocumented is not being recruited; it is being
answered.

**What they gain:** their eight MCP tools and their open-data licence stop being a
private convention and become the profile everyone else implements. Their existing
verification model (`ultima_validacion` + `confirmaciones_24h` +
`contradicciones_activas`) is already the spec's core §6 — adopting costs them almost
nothing because the spec was written from what they built.

**What the group gains:** the first non-Corag co-maintainer seat filled by the app with
the strongest claim to it, which is the fastest available answer to *"is this just
Corag's schema?"*

### 4.2 AquíAyuda — the only adoption that is a deletion

It maintains five bespoke adapters, a hand-rolled source registry
(`{id, nombre, tipo, quienPublica, url, capacidades[]}`), a verb+entity capability
vocabulary (`leer:centros`, `escribir:ofrecimiento`) and namespaced external ids when
writing to Corag. It has already built a worse version of this protocol, alone, and it
pays the maintenance bill today: *"five error namespaces, three foreign keys to
rotate"* (`APP_aquiayuda.md` §Adoption).

**What they gain:** four of five adapters are deleted rather than rewritten. Their
crosswalk tables — including the lossy joins they had to accept — become the spec's
input instead of their private technical debt.

**What the group gains:** the **first consumer**. A protocol with publishers and no
consumers is a schema, not a network. AquíAyuda at L3 is the first moment the phrase
*"nos alimentamos"* describes something that actually happened. It also supplies the
sharpest conformance lesson the group has: its own adapter registry *declares*
capabilities for Corag that ship empty implementations — which is why conformance is
measured by a validator, never self-declared.

### 4.3 Pereira Responde — the damage cluster's anchor, and the spec's first real test

API and MCP are live in its own OpenAPI 3.1 spec; effort is `S` on the feed and `S` on
the field mapping; *"Blockers: none technical."* Its three gaps — no `updated_at`, no
cursor, no licence anywhere — are precisely three things the spec exists to fix, so its
adoption doubles as the first honest test of whether the spec fixes them.

**What they gain:** *"the highest-value single change: add an `updatedAt` field plus a
cursor. Everything else the protocol wants is already there."* They get a specified
answer to a pagination problem they already have.

**What the group gains:** wave 1 stops being a Pereira-logistics club. Without a damage
app in the first wave, the protocol reads as a shelter-directory format and the six
damage apps arrive to a spec written without them.

### 4.4 Two runners-up, and why they are runners-up

- **Reporte CO** — open source (`crafter-station/reporte-co`), four serializers already
  shipping, and itself a fork of a Venezuela edition, which makes it living proof the
  format travels beyond one emergency. It is a runner-up only because its feed has not
  moved since 2026-08-10 and its data licence is still unwritten; both are one decision
  each. **Uniquely, the fixture PR can be written *for* them** — the repo is public.
- **Mapa del Terremoto** — the most metadata-mature participant (CC BY 4.0, DIVIPOLA,
  EDAN, 100 % sitemap `lastmod` coverage) and the source of the incremental-sync
  pattern the spec adopts. It is a runner-up because of the calendar, not the
  engineering: **maintenance is committed only through 2026-11-30**, with a stated
  commitment to leave the data permanently published afterwards. The right approach is
  to treat it as a wave-1 *conversation* with the §7.4 wind-down clause on the table
  from the first message.

---

## 5. Social sequencing

### 5.1 Working-group formation

| Item | Proposal | Why this and not the obvious alternative |
|---|---|---|
| **Channel** | One public, async, written channel (a GitHub Discussions space in the new neutral org), mirrored to whatever chat the teams already use for announcements only | Chat-first groups lose their decisions. A written archive is what makes the merge commit the record of consensus (`GOVERNANCE_AND_LICENSING.md` §3.3) |
| **Cadence** | **Async by default.** One optional 45-minute call per month, recorded in writing whether or not anyone attends | *"Any process with more than one required meeting per month will be abandoned by month three"* (§1 of the governance doc). Volunteers are working nights |
| **Roles** | Convener (runs the process, holds no casting vote) · maintainers (§2.3) · publishers · consumers · anyone, who may open an RFC | Deliberately thin. Every role beyond these is a role somebody has to volunteer to fill and nobody will |
| **First artifact** | The spec draft, the validator and the registry, published **before** the first invitation goes out | An invitation to review a real thing gets reviewed. An invitation to a kickoff meeting gets ignored |
| **Language** | Spanish is the working language; every normative document is bilingual | A protocol whose spec is English-only in this ecosystem has quietly chosen who may participate |

### 5.2 Co-maintainer recruitment — the two seats that unlock v1.0

The neutrality gate is a release blocker: **v1.0 cannot be tagged until at least two
maintainers represent apps other than Corag**, maximum two seats per organization, and
the criteria are shipping-based — a conforming feed plus two substantive contributions,
nominated by a maintainer, 7-day objection window (`GOVERNANCE_AND_LICENSING.md` §2.3).

**Candidates, in the order the evidence supports:**

| Candidate | The claim | Seat readiness |
|---|---|---|
| **PereiraAyuda** | Publicly invited interop before being asked; API + MCP + open-data licence; the verification model in §6 of the spec is theirs | **Strongest.** Meets criterion 1 the day their feed validates |
| **Pereira Responde** | API + MCP live in its own OpenAPI spec; anchors the damage cluster; `S` effort | **Strong**, once the licence question is answered — which is also their first substantive contribution |
| **AquíAyuda** | The consumer seat. It has implemented a proto-protocol in production and is the only team that has *lived* the maintenance cost the spec removes | **Strong for the consumer perspective**, which the council otherwise lacks entirely |
| **Reporte CO** | Open source, four serializers, portable across emergencies | Alternate — depends on the licence decision and on whether the dataset carries live traffic |
| **Mapa del Terremoto** | Most metadata-mature; the sync pattern is theirs | Alternate — the 2026-11-30 horizon makes a long maintainer commitment unrealistic to ask for |

**Sequencing rule:** do not offer a seat before the app's feed validates. Offering a
seat first converts a technical council into a diplomatic one, and the composition
limits stop meaning anything.

### 5.3 Who decides what

Reusing the established split (`GOVERNANCE_AND_LICENSING.md` §2.4) so nobody has to
invent it under pressure:

| Decision | Who | Mechanism |
|---|---|---|
| The **name** | **The group** (phase 0) | One vote per app, §5.4 |
| Governance model, licences, the neutrality gate | **The group**, by accepting RFC-0 | Explicit affirmative signature, not lazy consensus |
| Any schema field, enum, cardinality, required/optional status, conformance level | **RFC** | 10-day lazy consensus, 2 approvals from 2 different apps |
| Removing/renaming a field; anything that un-conforms a live feed; changing governance | **RFC, breaking tier** | 21 days, majority of maintainers, written migration note |
| Typos, examples, docs, CI, tests, website copy, translations | **Maintainers just do it** | 1 approval, merge |
| Adding an app to the registry | **Maintainers just do it** | PR against a data file, human review |
| A purely additive optional field during a declared emergency | **Maintainers, then retroactive RFC** | 2 approvals, 72 h window, RFC within 14 days |
| Anything touching personal data | **Nobody, alone** | Mandatory Privacy & PII review that can block on its own |

The line to hold: **maintainers move fast on everything that cannot hurt anyone, and
nothing else.** The moment the fast path is used for a normative change, the group has
returned to Model A wearing a costume.

### 5.4 The name vote

Five candidates from `BRAND_AND_NAMING.md` §5: **Cabuya** (recommended #1) ·
**Cardumen** · **Guadua** · **Convite** · **Trenzia**.

| Mechanic | Proposal |
|---|---|
| **Who votes** | One vote per **app**, not per person. Twenty apps, twenty possible votes — this is the first and cheapest demonstration that a large team does not outvote a small one |
| **Method** | **Approval voting** — vote for every name you could live with. A five-way plurality can crown a name that 70 % dislike; approval voting cannot |
| **Window** | 7 calendar days, async, public tally |
| **The ballot carries the weaknesses** | *"Estar en la cabuya"* means to be in a jam; **Convite A.C. is an established Venezuelan humanitarian NGO in our exact sector**; `cardumen.org` and `guadua.org` are taken; `trenzia` fails the spelling-from-hearing test. A ballot that hides the objections produces a decision that gets relitigated |
| **Availability re-check** | Re-run the domain / GitHub / npm sweep **on the day the vote opens**. Every verdict in `BRAND_AND_NAMING.md` is a dated snapshot, never a certainty |
| **Tie-break** | Runoff between the top two, 72 h. Still tied → maintainers choose the one with the cleaner availability sweep and **publish the reasoning**. No founder casting vote, here or anywhere |
| **After the vote** | Registration happens **only then**, and directly into shared custody (project alias, ≥ 3 holders from ≥ 2 apps, escrowed TOTP). Registering before the vote would make the vote theatre |

### 5.5 The neutrality tension — say it first

**The convener is also absorbing a peer.** Corag is drafting the protocol, and SOS
Terremoto has publicly announced its migration into Corag (farewell interstitial with a
45-second auto-forward, probed 2026-08-16T04:02:04Z; a record transfer is **unverified**).
Nineteen teams can read a homepage. If the group learns this from the site rather than
from RFC-0, every later act of good faith gets re-read as strategy.

So it goes in RFC-0, in the text, as its own article. And it is paired with mitigations
that cost the convener something real:

1. **The neutrality gate** — no `1.0` until two maintainers come from non-Corag apps,
   with max two seats per organization.
2. **The migration runs under the wind-down clause, in public** — final `last_updated`,
   `sunset_at`, and either a named custody transfer or a declared archive. The first
   app to be held to §7.4 is the convener's own acquisition. That is the cheapest
   available proof that the clause is not decorative.
3. **The first two normative RFCs after RFC-0 should be authored by non-Corag apps.**
   Corag's dossier already names the risk in its own words: *"if the protocol is drafted
   from Corag's shapes, other teams will read it as 'adopt Corag's schema'."*
4. **The conformance fixture set must include at least one non-Corag feed before v0.1
   is tagged** — otherwise the fixtures encode one app's assumptions as the definition
   of correct.
5. **No founder casting vote, no tiebreaker**, and a new neutral GitHub org rather than
   any existing one.

The honest framing to use, and not to soften: *federation and absorption are both real
options, they are happening at the same time, and the protocol only earns its case if
the apps that stay independent end up better off than the one that merged.*

### 5.6 Weeks 1–2 — the concrete list

Nothing here requires anyone's agreement. That is the point: the first two weeks are
the convener's work, done in public, so that the invitation arrives attached to
something real.

1. Create the **neutral GitHub org** with ≥ 3 owners from ≥ 2 apps, 2FA enforced, all
   repos public from the first commit.
2. Publish `spec` at `0.1.0-draft` with `GOVERNANCE.md`, `MAINTAINERS.md`,
   `ADOPTERS.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) and `TRADEMARK.md` —
   all bilingual.
3. Publish **RFC-0** (this plan's `RFC-0_draft.md`) as the first PR, open for signature.
4. Ship the **validator** as a CLI that runs offline against vendored schemas, with the
   soft-404 rule and the always-now-`last_updated` anti-pattern check implemented.
5. Ship the **registry** as a reviewed data file with `inclusión no es aval` printed on
   it, and every entry carrying its last validation timestamp and result.
6. **Corag publishes its own conforming place feed** and fixes its four API
   incoherences in the same week — in public, with the commits visible.
7. Open the **name vote** with the five-name ballot, the weaknesses printed, and a
   same-day availability re-check.
8. Send **one** message to the group channel (§6.1): short, no deck, links to a working
   validator and a live feed.
9. Open the three early-implementer conversations — **PereiraAyuda**, **AquíAyuda**,
   **Pereira Responde** — each as a concrete offer: *"here is your feed as a draft PR,
   here is what it validates as, here is what you would delete."*
10. Open the **Mapa del Terremoto** conversation early and separately, because
    2026-11-30 is a date and dates do not negotiate.
11. Start the wind-down documentation for **SOS Terremoto** under §7.4, publicly.
12. Find a **contact route for Pereira Unida**, which has no published channel — before
    assuming anything on their behalf.

### 5.7 Months 1–3

| Month | What has to be true by the end of it |
|---|---|
| **1** | Name chosen and registered into shared custody. RFC-0 signed by ≥ 3 apps. Corag's feed validating. Validator and registry live. Two early-implementer feeds in draft PR. |
| **2** | **Two non-Corag feeds validating in public** — the single most important milestone in this document, because it is the moment the spec stops being one app's proposal. AquíAyuda consuming ≥ 1 peer feed at L3. First badge on somebody's footer. First co-maintainer nomination opened. |
| **3** | Wave 2 in motion with the skill doing the work. ≥ 2 non-Corag maintainers seated → the v1.0 gate is unblocked. The v0.2 entity RFCs (damage, rental notice, need/offer, pet notice) opened and **authored by the apps that own those entities**. A published, dated list of what did *not* work. |

**The warm-consensus window.** Verbal agreement decays fast, and this one is competing
with an active emergency for the same volunteer hours. The window is measured in weeks,
and the thing that keeps it open is not enthusiasm — it is **one working artifact per
message**. Every communication in §6 links to something a developer can run.

---

## 6. Risk register

Likelihood and impact are **low / medium / high**. "Owner" is a **role**, never a
person — this register names no individuals, by plan rule.

| # | Risk | Type | Likelihood | Impact | Mitigation | Owner (role) |
|---|---|---|---|---|---|---|
| 1 | **Consensus decay** — verbal agreement evaporates as the emergency's news cycle ends and volunteer hours return to jobs | Social | **High** | **High** — the protocol never gets a second launch | Ship artifacts, not invitations (§5.6). RFC-0 signable in week 1. Every message carries something runnable. Wave 0 completes before wave 1 is asked for anything | Convener |
| 2 | **Founder bottleneck / benign capture** — the person doing the most work quietly becomes the person who decides | Social | **High** | **High** — nineteen teams disengage without ever saying why | Max 2 seats per org; no casting vote; v1.0 blocked until ≥ 2 non-Corag maintainers; first two normative RFCs authored elsewhere; 120-day auto-emeritus | Maintainer council |
| 3 | **Absorption-vs-federation optics** — the convener is also absorbing a peer app, and someone notices before we say it | Reputational | **High** (it is already public) | **High** — poisons every subsequent good-faith act | Disclosed in RFC-0 as its own article; the migration runs publicly under the §7.4 wind-down clause; the mitigations in §5.5 are written into the release process, not promised | Convener |
| 4 | **App shutdown mid-adoption** — the most metadata-mature participant commits to maintenance only through **2026-11-30** | Social / technical | **High** (it is a stated date) | **Medium** — a dead feed in the registry looks worse than an absent one | §7.4 wind-down: `sunset_at` in the manifest, final `last_updated`, custody transfer or declared archive; registry marks `archived`; ids never reassigned; approach them in wave 1, not wave 3 | Registry operator + publishing team |
| 5 | **Stale feeds erode trust faster than absent ones** — 86 % of one live map reads `viejo` by its own measure; one 226-record national set carries no recency signal at all | Technical | **High** | **High** — one person sent to a closed shelter costs more credibility than ten missing feeds | `last_confirmed_at` REQUIRED as a key with honest `null`; consumers MUST display age; `stale` state in the registry at 7× `ttl`; visual de-emphasis past 7 days or on active contradictions; never silently hide | Publishing + consuming teams |
| 6 | **PII incident via a consumer** — a consumer joins place data with a person-level source, or a publisher's free text carries a name | Reputational / legal | **Medium** | **Critical** — this ends the project, and deserves to | Join prohibition, not field omission (§7.1); entity-scoped grants; feeds carry `public_url`, never contact values; publishers strip personal data from free text; mandatory blocking Privacy & PII review on every RFC; validator flags person-shaped fields; the skill ships a deny-list | Working group (rule) + consuming team (act) |
| 7 | **Crawl-policy violation by an AI agent** — an agent using the skill fetches from a publisher that has reserved its content (`ai-train=no`, AI bots `Disallow`, EU DSM Art. 4) | Reputational / legal | **Medium** | **High** — it would discredit the group on consent, the exact issue the protocol claims to get right | `permitted_use` in the envelope, not robots dialects; registry records per-participant crawl policy; the skill MUST honor it and refuse; directory-only tier so non-publication is a supported state, not an obstacle to route around | Validator/skill maintainer |
| 8 | **Name-vote deadlock** — five candidates, twenty small teams, no majority | Social | **Medium** | **Low–Medium** — but it burns the warm window on the least important decision | Approval voting; 7-day window; runoff at 72 h; maintainers break a persistent tie on availability and publish the reasoning; the vote is time-boxed and the spec proceeds under `cabuya` if it slips | Working group |
| 9 | **"This is just Corag's schema"** — the spec is read as one app's model with a governance wrapper | Social / reputational | **Medium–High** | **High** — refusal without a stated reason, which is unrecoverable | The verification triple comes from three *other* apps and is credited; the path convention is adopted from three apps, not invented; fixture set must include a non-Corag feed before v0.1; crosswalks in both directions, never convergence-by-goodwill | Maintainer council |
| 10 | **Volunteer burnout** — the same people doing emergency response, their own app, and now a standard | Social | **High** | **Medium** — the council goes quiet and the fast path becomes the only path | Async by default, one optional call a month; auto-emeritus at 120 days with no drama and restorable on request; the skill exists precisely so adoption is agent-hours, not human-hours | Maintainer council |
| 11 | **Bad data federates at scale** — the same address published `Activo` by one app and closed by another, dirty municipality values, a campus duplicated three times | Technical | **High** (documented today) | **High** — federation multiplies the error instead of resolving it | Both records survive with their ages visible rather than one being silently overwritten; `same_as` claims are one-hop and non-authoritative; DIVIPOLA + accent-folded matching, never raw display strings; `contradictions_active` is first-class | Consuming teams |
| 12 | **Listing read as endorsement** — an app in the registry is taken as vouched-for | Reputational | **Medium** | **High** — a fraud incident attaches to the whole network | *"Inclusión no es aval"* printed on the registry and stated in RFC-0's non-goals; every entry shows its last validation timestamp and result; no rankings, no trust scores, no recommended lists — ever | Registry operator |
| 13 | **Discovery preconditions fail on real hosts** — SPA catch-alls return `200 + text/html` on every discovery path; one `robots.txt` returns HTML labelled `text/plain` | Technical | **High** (observed on multiple hosts) | **Medium** — adoption stalls at step 3 of an otherwise 2-hour job | Soft-404 rule with byte-size discrimination in the validator; the manifest may live at any declared stable path with a registry pointer; the skill ships the catch-all exclusion as a one-line framework config change per stack | Validator maintainer + publishing teams |
| 14 | **Conformance theatre** — apps declare capabilities they have not implemented | Technical / reputational | **Medium** (already observed in production) | **Medium** | Conformance = passing the published validator, never self-declaration; behaviour is tested, not manifests; badges are version-scoped, re-measured on schedule, and silently stop being true when a feed breaks | Validator maintainer |
| 15 | **Custody single point of failure** — domain in a personal account, one recovery email, one card | Social / technical | **Medium** | **High** — the exact failure the neutrality argument is about | Registrar account on a project alias with ≥ 3 holders from ≥ 2 apps; escrowed TOTP; auto-renew with 90/60/30-day human reminders; zone file exported to git; a written runbook rehearsed once a year; the 180-day continuity clause | Maintainer council |
| 16 | **Licence ambiguity blocks aggregation** — most apps declare no data licence; one aggregator's compilation licence does not cleanly cover its sources | Legal | **High** | **Medium–High** — a consumer's legal review is a silent, unappealable "no" | `license` REQUIRED for conformance; CC-BY-4.0 recommended default; share-alike discouraged with published aggregator rules; the spec distinguishes the licence of a compilation from the licence of each source assertion | Publishing teams + maintainer council |

---

## 7. Communication kit — outline

Three messages, Spanish, sober. **Outline only** — full copy is drafted when the name
exists and the artifacts are live. Rules for all three: no hype vocabulary
(*revolucionario*, *disruptivo*, *héroes*, *unificamos el ecosistema*), no figures we
cannot back, no CTA to a channel we do not run, every message links to something that
runs, and none of them implies any team has agreed to anything.

### 7.1 Message 1 — RFC-0 is open for signature

- **Asunto / opening line:** qué es, en una frase — un acuerdo de una página para que
  las apps se lean entre sí.
- **El problema, sin adornos:** el mismo albergue aparece en tres tableros con tres
  nombres y sin identificadores en común; en un caso, la misma dirección figura como
  abierta en un tablero y cerrada en otro.
- **Qué NO es:** no es fusionarse, no es ceder datos de personas, no es un ranking, no
  es un aval, no obliga a nadie a cambiar su producto.
- **Qué se firma:** el artículo fundacional y los no-objetivos; el alcance técnico va
  aparte y se discute por RFC.
- **Enlaces:** el borrador de RFC-0 · el borrador del spec · el validador · el feed que
  ya publica quien convoca.
- **Transparencia, en el cuerpo del mensaje y no en una nota al pie:** quién convoca y
  qué migración está en curso.
- **Cierre:** cómo firmar (un PR) y cómo objetar (el mismo PR). Sin fecha límite dura.

### 7.2 Message 2 — el validador está disponible

- **Una frase:** ya se puede medir, no solo leer.
- **Qué hace:** valida un feed contra el esquema, revisa descubrimiento, marca
  `last_updated` siempre-ahora y detecta el 200-con-HTML en rutas de descubrimiento.
- **Cómo se corre:** un comando, sin cuenta, sin registro, y **funciona sin red** con
  los esquemas vendorizados.
- **Lo importante:** conformidad se mide, no se declara. El validador falla también
  sobre el feed de quien convoca, y eso es el punto.
- **La oferta concreta:** *"díganos su repositorio y les abrimos el PR del feed en
  borrador"* — dirigida a los equipos cuyo código es público.
- **Enlaces:** validador · esquemas · dos ejemplos válidos y tres inválidos con la
  razón de cada fallo.

### 7.3 Message 3 — el primer feed conforme de otro equipo

- **El hecho, primero:** qué app, qué feed, qué nivel, con el resultado del validador y
  su fecha.
- **El crédito es de ellos**, y el mensaje lo dice en la primera línea. Quien convoca no
  aparece hasta el final.
- **Qué cambió en la práctica:** un consumidor lee ese feed y muestra la edad del dato y
  la atribución; adjuntar la captura o el enlace, no la promesa.
- **Cuánto costó de verdad:** horas reales, incluida la decisión humana que hubo que
  tomar. Si costó más de lo estimado, se dice.
- **El siguiente paso, sin presión:** quién sigue y qué necesitaría; el nivel L1 y el
  nivel «solo directorio» se nombran como resultados válidos, no como consuelo.
- **Sin superlativos.** Un feed que valida es un hecho; convertirlo en un hito épico es
  la manera más rápida de que el siguiente equipo no quiera participar.

---

*Produced under plan Rule-0: every app-level claim in this document cites
`APPS_MATRIX.md` or the app's dossier in `apps/`, with probe timestamps of
2026-08-16T04:00–04:12Z. `cabuya` resolves after the group's vote. This is a
proposal for the working group; nothing here commits any team.*
