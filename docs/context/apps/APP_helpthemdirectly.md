# APP_helpthemdirectly — Help Them Directly

**Inputs:** `src/content/ecosystem-apps/helpthemdirectly.yaml` · `PLAN_ecosystem_apps_network_page/analysis_results/{URL_PROBE.txt,ENRICHED_PROBE.json}` (batch-2 entry, flagged "verify geographic scope in Task 1") · live probing 2026-08-16T04:01:32Z–04:04:53Z.
**Probe agent string used:** `CoragEcosystemAnalysis/1.0 (protocol interop research; +https://corag.app/ecosystem)`.
**PII handling:** this site is a directory of **named individual and family fundraising campaigns**. Personal names appear in its page titles, headings and URL slugs. **No campaign name, slug, title, image, donation channel or case detail is reproduced in this dossier.** Only structural facts, counts, category labels and URL *patterns* are recorded. No individual campaign page was opened.

## TL;DR

- The seed's geographic flag resolves as follows: the site is **primarily Venezuela (135 campaigns) with a real and growing Colombia set (7 campaigns)**, both for 2026 earthquakes — so the YAML's "Principalmente Venezuela; formulario adicional para Colombia" is accurate but now understates Colombia, which has its own live campaign set, not just a form.
- It is the **structural outlier of the four matching apps**: it does not match needs to offers, it publishes a curated directory of *people fundraising for themselves* and links out. It explicitly does not touch the money.
- Stack: a **static site behind Cloudflare** (hand-rolled `/assets/css/site.css` + one `/assets/js/home-campaigns.js`, no framework fingerprint), plus a separate **credentialed backend at `api.helpthemdirectly.org`** used for media (`/api/uploads/{uuid}/file`).
- It is the **only app in the assigned set with an explicit, restrictive AI/crawler policy**: `Content-Signal: search=yes, ai-train=no, use=reference`, with `ClaudeBot`, `GPTBot`, `CCBot`, `Google-Extended`, `Bytespider`, `Amazonbot`, `Applebot-Extended`, `meta-externalagent` all `Disallow: /`.
- Intake is via **Google Forms** (two, one per country) — the lowest-tech intake in the ecosystem and the clearest signal of a volunteer, non-engineering-led operation.
- Feed-readiness: **L** — not because the engineering is hard, but because **its payload is intrinsically personal and it has publicly reserved its content against machine consumption.** For this app the correct protocol posture is directory-and-link-out (ladder rung 1), permanently.

## Identity

| Field | Value | Source |
|---|---|---|
| Name | Help Them Directly | `helpthemdirectly.yaml`; `<title>` "Help Them Directly" |
| Primary URL | `https://helpthemdirectly.org/en/` | `helpthemdirectly.yaml`; 200 at 2026-08-16T04:01:32Z |
| Category (YAML) | `matching` | `helpthemdirectly.yaml` |
| Featured / order | `featured: false`, `order: 30` | `helpthemdirectly.yaml` |
| Logo authorization | `public_favicon_only` | `helpthemdirectly.yaml` |
| Operator | "created by volunteers" — no legal entity named | footer, 2026-08-16T04:02:05Z |
| Org contact | `team@helpthemdirectly.org` (role alias, not a person) | footer, 2026-08-16T04:02:05Z |
| Social | one Instagram link in the footer | footer, 2026-08-16T04:02:05Z |
| Public stance | "We do not collect, receive, or manage donations. All donations are made directly to the individuals or families listed on this website through their own fundraising accounts or payment methods." | footer, 2026-08-16T04:02:05Z (published in EN and ES) |
| Nav | Campaigns · About · FAQ | 2026-08-16T04:02:05Z |
| Languages | EN and ES (footer is bilingual; `/en/` prefix implies a sibling locale tree) | 2026-08-16T04:02:05Z |

**YAML claims:** `publicApi: unknown`, `publicMcp: unknown`. **Re-verified, still accurate.** The `limits` field ("No es un recaudador de Corag. El sitio declara que no cobra ni administra donaciones") is confirmed verbatim by the site's own footer.

**Seed flag resolved.** `ENRICHED_PROBE.json` recorded: *"Meta description currently references Venezuela — Task 1 must verify scope vs Colombia/Pereira before publishing claims."* Resolution: the `<meta name="description">` is still Venezuela-only ("Send help directly to families and communities affected by the earthquake in Venezuela", 2026-08-16T04:02:05Z) and the H1 likewise, **but the home page carries two campaign sections** — a Colombia Earthquake 2026 set and a Venezuela Earthquake 2026 set — with `data-total-campaigns` of **7** and **135** respectively. The site's own metadata lags its content. **Colombia relevance is real but small and secondary; the ecosystem listing is justified, and the "primarily Venezuela" framing in the YAML should be kept.**

## Probe log

All requests `GET`, one each, no auth.

| URL | UTC timestamp | Status | Content-Type |
|---|---|---|---|
| `https://helpthemdirectly.org/en/` | 2026-08-16T04:01:32Z | 200 (100 638 B) | `text/html` |
| `https://helpthemdirectly.org/robots.txt` | 2026-08-16T04:01:34Z | **200** (1 836 B) | `text/plain; charset=utf-8` |
| `https://helpthemdirectly.org/sitemap.xml` | 2026-08-16T04:01:35Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/.well-known/` | 2026-08-16T04:01:36Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/api` | 2026-08-16T04:01:38Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/api/docs` | 2026-08-16T04:01:39Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/openapi.json` | 2026-08-16T04:01:40Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/mcp` | 2026-08-16T04:01:42Z | 404 (9 B) | `text/plain;charset=UTF-8` |
| `https://helpthemdirectly.org/en/` (body + headers capture) | 2026-08-16T04:02:05Z | 200 | `text/html` |
| `https://helpthemdirectly.org/robots.txt` (body capture) | 2026-08-16T04:02:07Z | 200 | `text/plain; charset=utf-8` |
| `https://api.helpthemdirectly.org/robots.txt` | 2026-08-16T04:04:51Z | 200 | `text/plain` (same Cloudflare-managed policy) |
| `https://api.helpthemdirectly.org/` | 2026-08-16T04:04:53Z | 404 (13 B) | `text/plain; charset=UTF-8` |

10 requests to `helpthemdirectly.org`, 2 to `api.helpthemdirectly.org`. **No individual campaign page was opened** — the ~142 campaign URLs discovered on the home page were counted and pattern-analyzed, never fetched.

### Crawl policy — recorded in full because it is protocol-relevant

`https://helpthemdirectly.org/robots.txt`, 2026-08-16T04:02:07Z (Cloudflare-managed block):

```
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: Amazonbot            Disallow: /
User-agent: Applebot-Extended    Disallow: /
User-agent: Bytespider           Disallow: /
User-agent: CCBot                Disallow: /
User-agent: ClaudeBot            Disallow: /
User-agent: CloudflareBrowserRenderingCrawler  Disallow: /
User-agent: Google-Extended      Disallow: /
User-agent: GPTBot               Disallow: /
User-agent: meta-externalagent   Disallow: /
```

The file's preamble states these are "EXPRESS RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790". `api.helpthemdirectly.org` serves the identical policy.

**How this probe complied:** the generic `User-agent: *` group is `Allow: /` with `use=reference`, which is what this analysis is — reading a small number of public pages for a reference document, not training and not bulk collection. The named AI-agent groups were not the identity used. Ten requests, no campaign pages, no media, no repeat crawling. **Any future automated consumption of this site must be opt-in from the team, never crawled.**

## Observable architecture

- **Edge:** **Cloudflare** — `server: cloudflare`, `cf-ray: a2bd8aa3bf270c14-BOG` (BOG = Bogotá edge PoP), `alt-svc: h3`, Cloudflare NEL/`report-to` reporting configured (2026-08-16T04:02:06Z).
- **Framework: none detectable.** No `generator` meta, no `/_next/`, no `/_astro/`, no `_nuxt`, no WordPress markers, no JSON-LD. One stylesheet `/assets/css/site.css`, one script `/assets/js/home-campaigns.js`. Hand-authored or generated by a static tool that leaves no fingerprint. The `/assets/…` layout and `/en/{set}/{campaign}/` trailing-slash URLs are consistent with a **static site generator** — `inferred`, not asserted.
- **Server-side logic exists despite the static appearance:** the home page sets two cookies (2026-08-16T04:02:06Z) — `htd_order_seed={uuid}; Path=/; SameSite=Lax` and `htd_last_project=sismos-ve-2026; Path=/; SameSite=Lax`. A per-visitor ordering seed means **campaign display order is randomized and pinned per visitor**, almost certainly a Cloudflare Worker or Pages Function. That is a deliberate fairness mechanism — campaigns are not ranked, so no family is systematically buried. `inferred` that a Worker implements it; the cookies themselves are directly observed.
- **No caching headers** (`cache-control`, `etag`, `age`) were returned on the home page — consistent with a Worker generating the response per request.
- **Separate backend host:** `api.helpthemdirectly.org`, referenced **142 times** in the home page, exclusively as `https://api.helpthemdirectly.org/api/uploads/upload_{uuid}/file` — one per campaign card image. Its root returns 404 `text/plain` with `vary: Origin` and **`access-control-allow-credentials: true`** (2026-08-16T04:04:53Z). A credentialed CORS API is by definition **not** an open public data API; it is an authenticated application/CMS backend that also serves uploaded media. Its framework is `unverified`.
- **Third-party dependencies:** Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Google Forms (`docs.google.com`, ×2), Instagram (×1). No analytics or map library observed.
- **No PWA manifest**, no `sitemap.xml`, no `.well-known`.
- Favicon/apple-touch-icon set under `/assets/images/` — matching the YAML's `logoAuthorization: public_favicon_only`.

## Entity inventory

Observed from `https://helpthemdirectly.org/en/` at 2026-08-16T04:02:05Z, structure only.

### Entity — Campaign (the only entity)

| Visible field | Evidence | Notes |
|---|---|---|
| Campaign set / project | Two sections, keyed `sismos-co-2026` and `sismos-ve-2026` (also the `htd_last_project` cookie value) | Functions as the emergency/event identifier — the analogue of Corag's `emergencySlug` |
| Numeric ID | leading integer in every campaign path | Stable per-campaign identifier; the only machine-usable key exposed |
| Title | `card-title` element, 142 instances | **Contains personal names** — not reproduced |
| Slug | trailing segment of the path | **Contains a personal given name** — not reproduced. Pattern only: `/{lang}/{campaign-set}/{numeric-id}-{personal-name-slug}/` |
| Image | `card-media` / `card-image-link`, sourced from `api.helpthemdirectly.org/api/uploads/upload_{uuid}/file` | 142 instances; media is UUID-addressed, not name-addressed |
| Categories | `card-category-tag`, 226 instances across 142 cards → **multi-valued** (~1.6 tags/campaign) | See enum below |
| Detail link | `card-read-more`, 144 instances | Every campaign has a detail page |
| Donation channels | Stated in the footer as belonging to the family, published on the campaign page | **Not inspected** — no campaign page was opened |
| Timestamps | **none** — no date, no "updated", no relative time anywhere on the home page | See freshness below |

### Category enum (5 observed values, with counts)

`Emergency Housing` (113) · `Grief & Memorial Fund` (57) · `Emergency Medical Care` (51) · `Meta Alcanzada` (4) · `On The Ground` (1).

Three observations that matter to the protocol:

1. **The vocabulary is English display text with one Spanish value mixed in** (`Meta Alcanzada` = "goal reached"). No slugs, no locale separation.
2. **`Meta Alcanzada` is a status, not a category.** Fulfilment state is encoded inside the tag vocabulary — the same axis-conflation problem found in Pereira Unida's status enum, in a different place.
3. `Grief & Memorial Fund` (57 campaigns, the second-largest class) is a **need class no other app in the 20 models at all**. Funeral and bereavement costs are a major real post-disaster need and the entire rest of the ecosystem is blind to it.

### Aggregate counts (2026-08-16T04:02:05Z)

`data-total-campaigns`: **7** (Colombia 2026 section) and **135** (Venezuela 2026 section); 142 campaign cards rendered, matching 7 + 135. A "and {n} more" affordance (`data-more-label`) paginates each section client-side via `home-campaigns.js`.

### Freshness signals — **none**

This is the notable negative finding. There is **no created date, no updated date, no "last verified" label, no relative time, and no campaign status field** (beyond the `Meta Alcanzada` tag) anywhere on the home page. A consumer cannot tell whether a campaign is a day old or a month old, nor whether it is still open. Compare Pereira Unida's `last_confirmed_at` and Corag's `generatedAt` + `timeline`.

For a directory whose whole function is to route money to people, **unverifiable freshness is the highest-consequence data-quality gap found in this batch** — a stale campaign sends donations to a need that may already be met, or to a channel that no longer works.

### Intake

Two Google Forms linked from the home page under "Si sabes de alguna persona o familia afectada que esté intentando recaudar fondos, por favor completa uno de estos formularios:" — one labelled "Terremotos en Venezuela", one "Terremoto en Colombia" (2026-08-16T04:02:05Z). Submissions are therefore **human-reviewed and manually published**; there is no self-service publishing path. That is a moderation strength and a throughput ceiling at the same time.

## Integration surface

**publicApi: `unknown`**

- `/api`, `/api/docs`, `/openapi.json` → 404 `text/plain` (2026-08-16T04:01:38Z–04:01:40Z). No documentation, no developer page, no descriptor.
- `api.helpthemdirectly.org` **exists and is in active use**, but its observed role is media delivery (`/api/uploads/{uuid}/file`) and its root returns 404 with `access-control-allow-credentials: true` — a credentialed backend, not an open read API. Whether it also exposes a public read route is **`unknown`; it was not enumerated, and enumerating another team's backend is out of scope.**
- Correct statement: *no public data API is documented or advertised; an authenticated application backend exists at a separate host and serves campaign media.*

**publicMcp: `unknown`** — `/mcp` 404 (2026-08-16T04:01:42Z). No MCP reference. No positive evidence either way.

**Machine-readable discovery:** none. **`sitemap.xml` is 404 and `robots.txt` declares no `Sitemap:` line** — so even the permitted `search=yes` use has no index to work from. The 142 campaign URLs are only discoverable by parsing the home page.

**Crawl/AI policy: the most restrictive in the assigned set, and it is a stated legal reservation, not a hint.** `ai-train=no`, `use=reference`, and a `Disallow: /` for every major AI crawler including `ClaudeBot`. **Any protocol integration with this app must be push-based and opt-in from the team. Pull-based federation of this site is off the table, and an agent skill that crawls it would violate a published reservation of rights.**

**Licensing / terms:** no content licence observed beyond the robots.txt rights reservation. No terms-of-use page in the nav (Campaigns · About · FAQ). `unverified` whether the About/FAQ pages contain terms — they were not opened, to keep the request count low on a host that has asked AI agents to stay out.

## Adoption effort estimate

**L (large) — and the size is policy and ethics, not code.**

The engineering alone would be S–M: a static-site generator plus a Worker plus a CMS backend can emit a JSON file trivially; they already generate 142 structured cards from structured source data.

What makes it L:

1. **The payload is irreducibly personal.** A Help Them Directly record *is* a named family and a donation channel. Strip the personal data and nothing useful remains — unlike Pereira Unida, where a need ("50 blankets in Dosquebradas") survives de-identification. There is no privacy-preserving projection of this entity.
2. **They have publicly reserved their content against machine collection** (`ai-train=no`, AI crawlers `Disallow`). Building a pull integration against a site that has said this — even a technically permitted one — would poison the working group's credibility on the exact issue (consent) that the protocol is supposed to get right.
3. **Fraud surface.** A machine-readable feed of "families + payment channels" is a phishing kit. Any consumer could clone the directory and swap the donation links. Their per-visitor randomized ordering shows the team already thinks about how this data gets used; a feed removes every one of those controls.
4. **No timestamps and no status field** means a feed would export unverifiable records — the protocol would be laundering staleness into other apps' UIs.
5. **Volunteer, non-engineering-led operation** (Google Forms intake, no team page, no repo, no license). The realistic ask is small and manual, not an API commitment.

**Recommended protocol posture — and this is a finding, not a hedge:** Help Them Directly is the concrete case proving the protocol needs a **first-class "directory-only participant" tier** (ladder rung 1) that is a full, respected membership class rather than a waiting room. What they should publish is a tiny, non-personal **manifest**: app identity, coverage geography, event/campaign-set identifiers, category vocabulary, aggregate counts, contact, and a link-out URL pattern. Zero personal data, zero fraud surface, high directory value — and achievable in an afternoon. Everything below that line stays link-out, permanently and by design.

This mirrors, for a money-adjacent app, exactly the rule the plan already fixed for people data.

## Overlap map

| Overlap dimension | Apps that collide | Nature |
|---|---|---|
| **Needs/offers matching** | `corag`, `pereiraunida`, `sostremoto` (its YAML category) | **Weak — the categorization is arguably wrong.** The other three run request/offer boards; this is a curated one-way directory with no offer side and no matching. It belongs in a `direct_aid` / `fundraising` class, which is what the seed's `suggestedCategory: direct_aid` proposed. Worth revisiting when the protocol defines participant classes. |
| **Geography** | Colombia set overlaps `corag` (`eje-cafetero`), `pereiraunida`, `pereiraayuda`, `pereiravive`, `unidosporpereira`, `alluda`, `gogo` | **Small (7 campaigns) but real.** Its Venezuela set (135) overlaps **nothing** in the ecosystem — this is the only app in the 20 covering a second country, which forces an early protocol question: is the network Colombia-scoped or event-scoped? Its `sismos-co-2026` / `sismos-ve-2026` keys argue convincingly for **event-scoped**. |
| **Financial / direct donation** | none in the assigned set; `ayudared` lists "canales de donación verificados" per seed | Near-unique. Corag models contributions with delivery evidence; this models pointing a donor at a family's own channel. **Two fundamentally different trust models for money**, and the protocol should not pretend they are one entity. |
| **Housing** | `pereiraunida` (`Arriendos`), `sostremoto` (`Alojamiento`), logistics apps' albergues | `Emergency Housing` is its largest category (113/142). Four apps, four incompatible treatments of shelter: rental supply, shelter demand, albergue places, and housing fundraising. |
| **Medical** | `corag` (`salud`, `medicamentos`), `pereiraunida` (`medicinas`, `skill: medico`), `sostremoto` (`Atención médica`, `Medicamentos`) | `Emergency Medical Care` (51) — the one category class all four matching apps share, and even here the four vocabularies differ. |
| **Grief / memorial** | **none** | 57 campaigns, zero coverage elsewhere in the 20 apps. A genuine ecosystem blind spot surfaced by this analysis. |
| **People data** | `encontrados`, `sospereira` | Adjacent but distinct: those apps search for missing people; this one publishes named survivors seeking funds. **Both classes are personal data and both must stay link-out only.** Help Them Directly should be handled under the same rule as the missing-persons apps even though its category says `matching`. |

## Risks & notes

1. **Personal names in URL slugs** (`/{set}/{id}-{given-name}/`). Beyond privacy, this is a durable interoperability defect: names are unstable, non-unique, and locale-dependent identifiers. **Protocol rule to propose: record identifiers MUST be opaque and MUST NOT embed personal data.** The numeric prefix they already have is the right key; the name suffix is the problem.
2. **No timestamps anywhere.** No consumer — human or machine — can assess whether a campaign is current. Highest-consequence data-quality gap in this batch, given the payload routes money.
3. **Fraud/impersonation surface.** A directory of families plus their own payment channels, with no per-record verification metadata visible, is a high-value target for cloning. This is a strong argument for the protocol never carrying payment channel data in any feed at any tier.
4. **Site metadata contradicts site content.** `<meta name="description">` and the H1 say Venezuela only, while a Colombia section with 7 campaigns is rendered above it. A machine reading only the metadata (as the seed did) will mis-scope the app — which is precisely what happened, and is a good argument for a machine-readable manifest over metadata inference.
5. **Two Google Forms as the only intake path** means throughput is bounded by volunteer review capacity. A protocol that asks them for real-time data would be asking for something their operating model cannot produce.
6. **Dependency on `docs.google.com`, `fonts.googleapis.com` and Instagram** — third-party availability is part of their uptime story, and the Google Fonts dependency has known EU privacy sensitivities for a site handling personal data. Noted, not assessed.
7. **`access-control-allow-credentials: true` on the API host** confirms an authenticated surface. It was probed exactly twice (robots + root) and **not enumerated**. Nobody continuing this work should enumerate it.
8. **Cloudflare AI-crawler reservation is a legal statement**, invoking EU DSM Article 4. Treat it as binding. Record it in the registry so no future agent skill crawls this participant.
9. **Not probed, deliberately:** every individual campaign page (142 of them), `/en/about/`, `/en/faq/`, the Spanish locale tree, all media URLs, and any route on the API host beyond `/robots.txt` and `/`. The About/FAQ omission is a small known gap — team/legal details may live there — and is flagged rather than filled with a guess.
10. **Category-in-YAML correction to propose (out of scope to apply here, per plan guideline 7):** `category: matching` does not describe this app; the seed's `direct_aid` is the better fit and should be revisited when the protocol fixes its participant taxonomy.
