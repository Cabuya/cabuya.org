# PRIOR_ART.md — Standards Survey & Adopt / Adapt / Invent Verdicts

> **Task:** 3 — Prior-art & standards research
> **Plan:** `PLAN_unified_aid_protocol_analysis`
> **Author:** Standards researcher (AI agent)
> **Date:** 2026-08-16 · **All web sources accessed 2026-08-16 (UTC)** unless stated otherwise.
> **Status:** analysis only — nothing here is a commitment on behalf of any ecosystem team.

---

## TL;DR

1. **The closest structural prior art for our `place` entity is Open Referral HSDS; the closest *operational* prior art is GBFS.** HSDS tells us how to model a service directory correctly (10+ entities, provenance, profiles, semver, RFC 2119). GBFS tells us how volunteer-scale teams actually ship static JSON feeds that hundreds of consumers read. **We take HSDS's semantics and GBFS's mechanics.**
2. **Adopt GBFS's envelope almost verbatim** — `last_updated` / `ttl` / `version` / `data`, a `gbfs.json`-style auto-discovery index, and v3.0 localized strings (`{text, language}` with BCP 47). This single decision is the difference between "an afternoon" and "a quarter."
3. **Do not adopt HSDS wholesale.** It is English-only, its de-facto taxonomy (AIRS/211 LA County) is **proprietary and fee-licensed**, its spec is **CC BY-SA 4.0** (ShareAlike — a real constraint on a derived spec), and its 10-entity relational model is far past what volunteer teams will fill correctly in week one.
4. **Reject federation protocols (ActivityPub, AT Protocol) for v0.1** — both impose distributed-systems costs (HTTP Signatures, JSON-LD variance, relays/PDS) that would consume the entire adoption budget. Static files over HTTPS + a PR-based registry (the IATI/GBFS `systems.csv` model) gets 95% of the value at ~2% of the cost.
5. **Three things we must genuinely invent:** the freshness/verification triple (`verified_at` / `verified_by` / `verification_method`), the CC0 Spanish-first `place_kind` vocabulary, and the two-tier conformance profile. Everything else is borrowed, and we should say so loudly in the spec.
6. **License headline:** publish the spec **CC0-1.0** (or Apache-2.0 for schemas), keep data licensing **per-publisher and declared per-feed**, and never require an ODbL-encumbered or AIRS-licensed vocabulary. Two standards we studied carry ShareAlike terms that we must not inherit by copying text.

---

## 0. Inputs, Method, and Honesty Notes

**Inputs**

| Input | Use |
|-------|-----|
| `README.md` of this plan (5-layer ladder, agent-implementability bar, Rule-0) | Constraint frame for every verdict |
| Live web research (WebSearch + WebFetch), 2026-08-16 | All factual claims below |
| No dependency on Tasks 1–2 | This task ran in parallel |

**Constraints every verdict is judged against** (from the plan README):

- **C1 — Volunteer teams.** No paid standards staff; contributors work nights.
- **C2 — Static-JSON-feed-first.** A conforming publisher must be able to ship a file to a CDN. No mandatory server.
- **C3 — One-afternoon implementability by a coding agent.** If a competent agent + skill cannot produce a conforming feed in ~4 hours, the requirement is wrong.
- **C4 — Spanish-speaking context.** Spanish is the primary human language; English is the machine/token language.
- **C5 — People data permanently excluded.** No missing-persons, no beneficiary records, no PII. Ever.
- **C6 — v0.1 scope is one entity: `place`** (collection centers, shelters, hospitals, water points).
- **C7 — Adoption cost is the #1 protocol killer.** Every "MUST" is a tax on 20 teams.

**Honesty notes (Rule-0)**

- `hxlstandard.org` returned **HTTP 444** on every fetch attempt on 2026-08-16. This is consistent with — and corroborates — the Centre for Humanitarian Data's announcement that the HXL sites were retired as of **2026-01-31** (see §3.1). HXL claims below are therefore sourced from OCHA/Centre for Humanitarian Data pages and the HXL Proxy wiki, not from the primary site.
- `data.humdata.org/faq` returned **HTTP 403**; `www.open311.org` did not resolve on 2026-08-16. Open311 claims are sourced from `wiki.open311.org` and third-party analyses.
- Where a number could not be verified from a primary source, it is marked **`unverified`** rather than estimated.
- Adoption counts change; every count below carries its source and access date.

---

# PART I — THE SURVEY

Each section: **what it solves · maturity & adoption · license · what we take · why not wholesale · concrete borrowables.**

---

## 1. Service Directories

### 1.1 Open Referral / HSDS — the deepest dive

> This is the single most relevant prior art for a `place` entity that describes *where help is available*. It gets its own extended treatment.

#### 1.1.1 What it solves

HSDS (Human Services Data Specification) is "an exchange format for publishing machine-readable data about health, human, and social services." It exists to solve exactly our problem one layer up: many organizations each hold a partial directory of services, no two use the same fields, and every consumer app re-scrapes and re-cleans the same data.
Source: <https://docs.openreferral.org/en/latest/hsds/overview.html> (accessed 2026-08-16).

#### 1.1.2 The data model

HSDS 3.x is a relational model, not a flat record. Core objects and their **required** fields:

| Object | Required fields | Notable optional fields |
|--------|-----------------|-------------------------|
| `organization` | `id`, `name`, `description` | `alternate_name`, `email`, `website`, `parent_organization_id`, `locations`, `programs`, `phones`, `contacts` |
| `service` | `id`, `name`, `status` | `organization_id`, `description`, `url`, `email`, `eligibility_description`, `schedules`, `service_at_locations`, `phones` |
| `location` | `id`, `name` | `location_type`, `latitude`, `longitude`, `addresses`, `phones`, `schedules`, `accessibility`, `languages` |
| `service_at_location` | links a service to a location | `service_areas`, `schedules`, `phones`, `contacts` |
| `address` | `id`, `address_1`, `city` | `attention`, `address_2`, `region`, `state_province`, `postal_code`, `country`, `address_type` |
| `phone` | `id`, `number` | `extension`, `type`, `description`, `languages` |
| `schedule` | `id`, `dtstart` | RFC 5545 RRULEs; `opens_at`, `closes_at`, `freq`, `byday` |
| `service_area` | `id`, `name` | `extent`, `extent_type`, `uri` |
| `accessibility` | `id`, `description` | `details`, `url` |
| `attribute` | link between a service and a classification | — |
| `metadata` | record of changes / provenance | — |

Source: <https://docs.openreferral.org/en/latest/hsds/schema_reference.html> (accessed 2026-08-16).

**The single most important structural lesson:** HSDS separates `location` (a place in the world) from `service` (a thing offered) and joins them with `service_at_location`. This is not academic. A school building that is a shelter today and a food-collection point tomorrow is *one location, two services*. Our v0.1 `place` deliberately collapses this into one record — and we should record that collapse as **known technical debt with a named migration path**, not pretend it isn't there.

#### 1.1.3 Serialization, API, and conformance

- **JSON is primary since 3.0**, replacing the earlier CSV datapackage as the canonical form; the CSV/"JSON Tables" representation is retained as a legacy artefact. Rationale given: standardized API output, federation, better validation, per-record editing. Source: <https://docs.openreferral.org/en/latest/hsds/hsds_faqs.html> (accessed 2026-08-16).
- **The API spec is OpenAPI 3.1**, but the spec explicitly notes that "OpenAPI is designed for *describing individual APIs* rather than specifying the requirements for arbitrary APIs" and therefore layers **RFC 2119 keywords** on top to state what a conforming API MUST do.
- **Required endpoints:** `GET /` (API metadata + HSDS relationship), `GET /services/{id}` (fully nested), `GET /services` (paginated). **Optional:** `/taxonomies`, `/taxonomy_terms`, `/organizations`, `/service_at_locations`.
- **Pagination is mandatory** for list endpoints, with a `Page` schema (total items, total pages, page number, size, first/last flags, empty flag) and results in a `contents` array. Filters combine as boolean AND.
Source: <https://docs.openreferral.org/en/latest/hsds/api_reference.html> (accessed 2026-08-16).

#### 1.1.4 Profiles — the extension mechanism worth stealing

HSDS Profiles let a community (a country, a sector) tailor the spec without forking it:

- A Profile is **a set of files that modify canonical HSDS schema files** (`service.json`, `organization.json`, `openapi.json`), plus generated full schemas and a `datapackage.json`.
- Files **must resolve at publicly accessible URIs**, ideally under `/profile` and `/schema` endpoints.
- **Extensions may:** add new optional or required properties (non-overlapping with HSDS terms), tighten validation (make optional fields required), add new objects and endpoints, mandate specific taxonomies/value sets.
- **Overrides may:** remove properties or whole objects/endpoints by setting them to `null`, and replace constraints with stricter ones. Critically, removed items "MUST NOT then be replaced by alternative properties which have the same semantics."
- **Profiles SHOULD be versioned independently of HSDS**, with their own semver and governance.

Source: <https://docs.openreferral.org/en/latest/hsds/profiles.html> (accessed 2026-08-16).

This is a mature answer to the question every 20-app consortium eventually asks: *"can my app add three fields?"* Answer: yes, in a Profile, at a resolvable URL, versioned separately, and you may not silently rename our terms.

#### 1.1.5 Versioning and deprecation

HSDS uses **Semantic Versioning (MAJOR.MINOR.PATCH)**: MAJOR = backwards-incompatible, MINOR = compatible feature additions, PATCH = compatible bugfixes. Development branches carry a `-dev` suffix. MAJOR and MINOR go through the full review cycle; PATCH releases need only a one-week community notice window for objections. There is **no fixed cadence** — cycles run "when there is sufficient need and resources."

**Deprecation policy (excellent, and cheap to copy):** deprecated terms produce **warnings** in validation tooling for one release; obsolete terms produce **errors** and may not be used.
Source: <http://docs.openreferral.org/en/latest/about/specification-governance.html> (accessed 2026-08-16).

The changelog shows the real cost of getting a model wrong early: 2.0 renamed `service_taxonomy` → `service_attribute` and restructured taxonomy; 3.0 was substantially backwards-incompatible (renamed `accessibility_for_disabilities` → `accessibility`, merged `physical_address` + `postal_address` → `address`, merged `service_attribute` + `other_attribute` → `attribute`, removed `eligibility` and `payment_accepted`, standardized all IDs to UUID); 3.1 added `url`, `service_capacity`, `unit` compatibly.
Source: <https://docs.openreferral.org/en/latest/hsds/changelog.html> (accessed 2026-08-16). The repository's default branch is **3.2** as of 2026-08-16: <https://github.com/openreferral/specification>.

#### 1.1.6 Governance

| Role | Who / What |
|------|-----------|
| Lead Organizer | Greg Bloom — designs and facilitates activities, communications, fundraising |
| Fiscal Sponsor | Aspiration (501c3) — holds IP and funds in a restricted fund |
| Technical Steward | Open Data Services Cooperative — maintains repos, backlog, technical meetings |
| Technical Committee | Standing group of contributors; prioritizes changes; issues **binding recommendations** to the Technical Steward |

Change process: proposals arrive via GitHub issues / Community Forum / assemblies → Technical Steward synthesizes → **rough consensus** advances to the Technical Committee → approved changes enter a **two-week RFC period** → Steward implements → committee review → release. If consensus fails (rare), "Core Leadership reserves the right to make a direct decision."
Source: <http://docs.openreferral.org/en/latest/about/specification-governance.html> (accessed 2026-08-16).

Governance is also described at the initiative level as three activities: a semi-regular open **Assembly** video call, in-person **workshops**, and ad-hoc **workgroups**.
Source: <https://docs.openreferral.org/en/latest/hsds/profiles.html> and Open Referral governance pages (accessed 2026-08-16).

#### 1.1.7 Adoption story

- **2018:** AIRS (Alliance of Information and Referral Systems) endorsed HSDS, after which many 211 agencies began publishing HSDS datasets (California, New York, Texas cited). Source: <https://openreferral.org/airs-recommends-open-referral-for-resource-database-interoperability/> (accessed 2026-08-16).
- HSDS 3.0 has been adopted by **Findhelp, United Way 211, Unite Us** and others; there are Open Referral projects in the US, Canada, the UK ("Open Referral UK") and beyond. Source: <https://docs.openreferral.org/en/latest/hsds/hsds_faqs.html>; <https://openreferral.org/open-referral-in-ontario-a-big-step-forward/> (accessed 2026-08-16).
- A **precise global count of live HSDS publishers is `unverified`** — Open Referral publishes narrative adoption, not a machine-readable registry of conforming feeds. **This is itself a finding:** see §7.2 case study.

#### 1.1.8 License

> "The content of this documentation site, the HSDS schema files, and associated artefacts found in the specification repository are released under the **CC-BY-SA 4.0** license."
> Source: <https://docs.openreferral.org/en/latest/about/license.html> (accessed 2026-08-16).

HSDS v0.9 was **CC0**; the move to CC BY-SA 4.0 happened at 1.0, with the stated rationale of ensuring "any changes will preserve the openness of this format." Source: <https://github.com/openreferral/specification/issues/72> and <https://github.com/openreferral/specification> (accessed 2026-08-16).

**Consequence for us:** we may freely *read, cite, and be informed by* HSDS. If we **copy schema text or field definitions verbatim** into our spec, the ShareAlike term attaches and our spec must be CC BY-SA 4.0 — which conflicts with a CC0 goal and complicates downstream reuse. See §8.

#### 1.1.9 What we take · why not wholesale

**Take:** the `location` / `service` / `service_at_location` conceptual split (as documented debt); the field names `id`, `name`, `alternate_name`, `description`, `url`, `email`, `status`, `latitude`, `longitude`, `address_1`, `address_2`, `city`, `region`, `postal_code`, `country`, `accessibility`; the `metadata` provenance idea; the **Profiles** extension/override mechanism; the semver + deprecation policy; the RFC 2119 layer over OpenAPI; the "removed terms MUST NOT be replaced by same-semantics aliases" rule.

**Why not wholesale:**

| Blocker | Detail |
|---------|--------|
| **English-only** | "Currently Open Referral is in English, though they would welcome opportunities to support language localisation." Source: <https://openreferral.org/faq/> (accessed 2026-08-16). Violates **C4**. |
| **Taxonomy is proprietary** | The de-facto North American vocabulary is the **AIRS/211 LA County Taxonomy of Human Services**, which "is an intellectual property copyrighted by 211 LA County and available only to licensed subscribers," with per-organization fees. Source: <https://211la.wordpress.com/commonly-asked-questions/> (accessed 2026-08-16). Violates the CC0 goal outright. |
| **Model weight** | 10+ interlinked objects with UUID keys, RFC 5545 RRULE schedules and mandatory API pagination. Violates **C1**, **C2**, **C3**. |
| **ShareAlike** | CC BY-SA 4.0 on the schema files. See §8. |
| **API-first assumptions** | The conformance surface is an HTTP API with required endpoints and pagination. Our floor is a file on a CDN. Violates **C2**. |

---

## 2. Static-Feed Families (the mechanics we will actually copy)

### 2.1 GBFS — General Bikeshare Feed Specification ★ highest-value borrow

#### What it solves

A shared-mobility operator publishes a small set of static JSON files at stable URLs; any consumer (trip planners, city regulators, researchers) reads them without a contract or an API key. "GBFS is the open data standard for shared mobility that makes real-time data feeds in a uniform format publicly available online, with an emphasis on findability."
Source: <https://gbfs.org/documentation/faq/>, <https://gbfs.org/documentation/reference/> (accessed 2026-08-16).

**This is structurally identical to our problem.** Substitute "collection center" for "station" and "app" for "trip planner" and the shape is the same: many small publishers, many independent consumers, no central database, freshness matters, volunteers and small teams do the work.

#### The envelope (adopt nearly verbatim)

Every GBFS JSON file carries the same four top-level fields:

| Field | Type | Meaning |
|-------|------|---------|
| `last_updated` | Timestamp | "Indicates the last time data in the feed was updated" |
| `ttl` | Non-negative integer | "Number of seconds before the data in the feed will be updated again (0 if the data should always be refreshed)" |
| `version` | String | The GBFS version this file conforms to (e.g. `"3.0"`) |
| `data` | Object | The actual payload |

Source: <https://gbfs.org/documentation/reference/> (accessed 2026-08-16).

#### Auto-discovery: `gbfs.json`

```json
{
  "last_updated": "2023-07-17T13:34:13+02:00",
  "ttl": 300,
  "version": "3.1-RC",
  "data": {
    "feeds": [
      { "name": "system_information",
        "url": "https://www.example.com/gbfs/1/system_information" }
    ]
  }
}
```

The index `SHOULD` represent a single system or geographic area, `MUST NOT` link to `manifest.json` files (circular-reference guard), and each feed entry carries `name` (the canonical logical name) + `url` (which "MAY be published at a URL path or with an alternate name"). `manifest.json` exists for multi-dataset publishers (v3.0+).
Source: <https://gbfs.org/documentation/reference/>, <https://raw.githubusercontent.com/MobilityData/gbfs/master/gbfs.md> (accessed 2026-08-16).

**Why this design is right for us:** the logical name is decoupled from the URL. A publisher on Astro/Next/Hugo/Cloudflare Pages can put the file wherever their build system puts files; the index does the binding. That removes an entire class of "my static host won't let me do that" objections.

#### Localization (v3.0) — the answer to C4

```json
{ "text": "Centro de acopio La Badea", "language": "es" }
```

`Array<Localized String>` for translatable fields; `language` is an **IETF BCP 47** code; "Each supported language MUST be listed in the `languages` field in `system_information.json`" and "Translations MUST be provided for each supported language for all translateable fields." A parallel **Localized URL Object** handles per-language links.
Source: <https://gbfs.org/documentation/reference/> (accessed 2026-08-16).

Note the crucial asymmetry: **human-readable strings are localized arrays; machine tokens (enum values, field names) stay English snake_case.** GBFS enums such as `creditcard`, `paypass`, `applepay` are never translated. This is the correct pattern for us and is directly reusable.

#### Geo encoding

`station_information.json` requires `station_id`, `name` (localized array), `lat`, `lon` — as **separate named scalars**, with the note that "This field SHOULD have a precision of 6 decimal places (0.000001)". GeoJSON is used only where geometry is genuinely needed: `station_area` is a GeoJSON MultiPolygon for virtual stations, and takes precedence over the point in geofencing evaluation. `station_opening_hours` uses the **OSM `opening_hours` syntax**.
Source: <https://gbfs.org/documentation/reference/> (accessed 2026-08-16).

**This is the pragmatic compromise we should copy:** named `lat`/`lon` scalars for the common case (impossible to get backwards), GeoJSON where polygons are actually required.

#### Conformance & versioning policy

- RFC 2119/BCP 14/RFC 8174 keywords, adopted explicitly.
- "All endpoints within a data set SHOULD conform to the same MAJOR or MINOR version."
- "GBFS producers SHOULD provide endpoints that conform to the current MAJOR version release within **180 days** of a new MAJOR version release."
- Supported versions "SHALL NOT span more than two MAJOR versions."
- Files are **Required / Conditionally Required / Optional** — a lightweight de-facto conformance tier: `gbfs.json` and `system_information.json` Required; `station_information.json`, `station_status.json`, `vehicle_status.json`, `vehicle_types.json`, `manifest.json` Conditionally Required; `vehicle_availability.json` Optional.
Source: <https://gbfs.org/documentation/reference/>, <https://raw.githubusercontent.com/MobilityData/gbfs/master/gbfs.md> (accessed 2026-08-16).

#### Governance (a working model for a 20-team consortium)

- Open-source, **consensus-based**; NABSA chose **MobilityData** to govern and facilitate GBFS in 2019.
- Concrete voting rules: **PR discussion open a minimum of 7 calendar days; votes open 10 calendar days; anyone may vote; a successful vote needs at least 3 votes excluding the PR author; and a successful vote MUST include a vote from a GBFS producer *and* a GBFS consumer.**
- A passed proposal enters a **release candidate**; "when the release candidate has been successfully implemented in a public data set, it becomes an official release."
Source: <https://github.com/MobilityData/gbfs> (accessed 2026-08-16).

That last rule — *nothing becomes normative until someone has actually shipped it in production* — is the best anti-astronautics device we found in this entire survey.

#### Registry: `systems.csv`

"The systems.csv catalog is currently maintained by MobilityData and the GBFS community. The purpose of this catalog is to allow consumers of GBFS data to find multiple feeds in one place." Over **535 systems** are listed, and "All systems must have an entry in systems.csv to be compliant with GBFS." Publishers add themselves by **opening a pull request**.
Source: <https://gbfs.org/documentation/faq/>, <https://github.com/MobilityData/gbfs/blob/master/systems.csv> (accessed 2026-08-16).

**A CSV in a git repo, updated by PR, is the entire registry.** For 20 apps this is not merely sufficient — it is better than a database, because it is diff-able, reviewable, forkable, and free.

#### License

GBFS is released under **Creative Commons Attribution 3.0 Unported (CC BY 3.0)** — attribution required, **no ShareAlike**.
Source: <https://github.com/MobilityData/gbfs/blob/master/LICENSE> (accessed 2026-08-16).

#### What we take · why not wholesale

**Take:** the envelope (`last_updated`, `ttl`, `version`, `data`); auto-discovery index with `{name, url}` feed entries; Localized String / Localized URL objects with BCP 47; separate `lat`/`lon` scalars at 6-decimal precision; Required/Conditionally-Required/Optional file tiers; the 180-day / max-2-MAJOR version policy; the "must ship before it's normative" release-candidate rule; the producer+consumer voting quorum; the PR-based CSV registry.

**Not wholesale:** the domain vocabulary is bikes. Nothing in `vehicle_types.json` or `rental_methods` maps to shelters. We take the *chassis*, not the *body*.

### 2.2 GTFS — the origin story of the chassis

**What it solves:** transit schedules, published as a zip of CSVs, consumed by trip planners.

**Maturity:** the canonical success case in civic data. Born 2005 from a partnership between **Bibiana McHugh at TriMet (Portland)** and **Chris Harrelson at Google**, shipping the first Google Transit **less than five months** after their first meeting. Maintained since 2019 by the nonprofit **MobilityData**.
Source: <https://beyondtransparency.org/part-2/pioneering-open-data-standards-the-gtfs-story/>, <https://gtfs.org/about/> (accessed 2026-08-16).

**License:** gtfs.org content is **CC BY 3.0**; code samples **Apache 2.0**; GTFS Realtime is published under **Apache 2.0**.
Source: <https://gtfs.org/about/> (accessed 2026-08-16).

**Concrete borrowables (all strategic, see §7.1):** deliberate low-tech format so small agencies can participate ("view and edit using spreadsheet programs and text editors"); a **killer consuming app** as the adoption engine; and the rename from **G**oogle → **G**eneral Transit Feed Specification, which "dramatically reduced resistance from vendors, competing transit data advocates, and agencies." The four lessons the story draws: ground the standard in a real problem with demonstrable ROI; use publicity as an incentive; partner with a platform that shows scaled value fast; keep governance neutral of any single partner.

**Why not wholesale:** CSV-in-a-zip is worse than JSON for our consumers (all of whom are JS/TS web apps), and the domain is unrelated.

### 2.3 JSON Feed — the minimalism benchmark

**What it solves:** syndication without XML. Required top-level fields are exactly three: `version` (a URL identifying the format version), `title`, `items`. Everything else (`home_page_url`, `feed_url`, `description`, `icon`, `authors`, `language`, `hubs`) is optional. Design goal, in the authors' words: "For most developers, JSON is *far* easier to read and write than XML," and the format aims to be "self-documenting and difficult to do wrong." Forward compatibility is explicit: "A version 1 feed will be a valid version 2 feed."
Source: <https://www.jsonfeed.org/version/1.1/> (accessed 2026-08-16).

**License:** copyright Brent Simmons and Manton Reece, 2017–2020; **no open license is stated on the spec page** — a cautionary example of a spec that is widely implemented but legally under-specified.

**Take:** the three-required-fields discipline; `version` as a URL that doubles as documentation; the explicit forward-compatibility promise. **Not wholesale:** it is a syndication format, not a directory format.

### 2.4 Frictionless Data Package

**What it solves:** a `datapackage.json` descriptor that wraps a collection of data files with metadata. Only **one** property is strictly required (`resources`, with at least one entry); `name`, `licenses` (using Open Definition license IDs), and `profile` are recommended. Design philosophy: "a descriptor `MAY` include any number of properties in addition to those described," with community extension via profiles (e.g. Tabular Data Package).
Source: <https://specs.frictionlessdata.io/data-package/> (accessed 2026-08-16).

**Relevance:** HSDS's legacy CSV serialization uses `datapackage.json`, and HSDS Profiles ship one. **Take:** the `licenses` array using standard license IDs — we need exactly this on every feed so consumers can decide what they may legally re-publish. **Not wholesale:** the descriptor is designed for tabular bundles, not for a live directory.

### 2.5 Sitemaps + robots.txt — the discovery precedent

**What it solves:** telling a crawler what exists and when it changed, without an API. Required: `<urlset>` root, `<url>` entries, `<loc>`. Optional: `<lastmod>` (W3C Datetime), `<changefreq>` (explicitly "a hint, not a command"), `<priority>`. Limits: 50,000 URLs / 50MB per file, with a `<sitemapindex>` for more. Discovery via a `Sitemap:` line in `robots.txt`, direct submission, or ping.
Source: <https://www.sitemaps.org/protocol.html> (accessed 2026-08-16). **The page states no explicit license for the protocol.**

**Take:** the *index file* pattern (already arriving via GBFS), hard size limits stated in the spec, `lastmod` semantics, and the honesty of labelling `changefreq` a hint. The `ttl` field is the same idea with better teeth. **Not wholesale:** XML, and the semantics are "crawl me," not "here is my data."

---

## 3. Humanitarian Data Standards

### 3.1 HXL — Humanitarian Exchange Language

**What it solves:** making messy humanitarian spreadsheets machine-readable **without changing them**. You add one row of hashtags between the header row and the data rows. "HXL encourages organisations to add hashtags to their existing datasets, without requiring new skills or software tools, and interferes as little as possible in their current ways of working."
Source: <https://centre.humdata.org/learning-path/hxl/>, <https://knowledge.base.unocha.org/wiki/spaces/imtoolbox/pages/42502162/HXL+-+Humanitarian+Exchange+Language> (accessed 2026-08-16).

**The design bet — "attributes over schemas":** rather than defining entities and required fields, HXL defines a vocabulary of hashtags (`#org`, `#loc`, `#geo`, `#sector`, `#affected`, `#adm1`, `#country`, `#date`, `#status`, `#meta`) refined by `+attributes` (`+name`, `+code`, `+lat`, `+f`, `+m`, `+children`, `+total`, `+origin`, `+reported`). Attributes begin with `+` and follow the hashtag. Tag patterns can also *exclude* attributes with `-`, and `#*` is a wildcard.
Sources: <https://github.com/HXLStandard/hxl-proxy/wiki/Tag-patterns>, <https://centre.humdata.org/learning-path/hxl/> (accessed 2026-08-16).

**Maturity & adoption — and the ending.** A crawl of HDX found **2,359 HXL data files** from 13 organizations across 233 locations; the top hashtags were `#affected` (10,124), `#country` (4,137), `#date` (3,312), `#meta` (2,205), `#loc` (1,572); top attributes `+f` (2,840), `+m` (2,840), `+children` (2,132), `+total` (1,963), `+origin` (1,950).
Source: <https://centre.humdata.org/what-hxl-hashtags-are-people-using/> (accessed 2026-08-16).
An HDX Tools survey found **56% of respondents aware of HXL, and 44% of those had used it** — high awareness, much lower action.
Source: <https://centre.humdata.org/part-1-results-from-the-hdx-tools-survey/> (accessed 2026-08-16).

**On 2026-01-21 the Centre for Humanitarian Data announced the retirement, as of 2026-01-31, of `hxlstandard.org`, `proxy.hxlstandard.org` and HDX Quick Charts, and stated that "the Centre will no longer be asking data contributors to add HXL tags to datasets shared on HDX."** The stated reason: HXL "was originally designed as a simple standard for messy data, with a primary focus on combining spreadsheets," and the ecosystem has moved on. HXL remains an open standard for internal use, and archives remain accessible.
Source: <https://centre.humdata.org/retiring-hxl-services/> (accessed 2026-08-16). Corroborated by `hxlstandard.org` returning HTTP 444 on 2026-08-16.

**License:** the Centre's site content is **CC BY 4.0**; a distinct license statement for the HXL standard itself could not be retrieved on 2026-08-16 because the primary site is retired — **`unverified`**.

**What we take:** the *philosophy of the minimum viable imposition* — meet publishers where they already are. The specific idea that a data provider should be able to become conformant by **adding**, not **rewriting**. Also the "one hashtag, refined by attributes" vocabulary compression is a good model for our `place_kind` + `place_kind_detail` split.

**Why not wholesale:** it is a tabular annotation layer; our publishers emit JSON from apps, not spreadsheets. And §7.3 explains the deeper lesson: HXL's very virtue (schema-lessness) is why it could be retired without breaking anything — and also why it never produced strong interoperability guarantees.

### 3.2 HDX — the platform, not the standard

HDX is OCHA's humanitarian data platform (`data.humdata.org`). It hosted the HXL tooling, provides "a machine-readable dataset of HXL hashtags and attributes, and an interactive, mobile-friendly app to help pick the appropriate hashtags" (HXL Tag Assist), and hosts 3W/4W datasets.
Source: <https://centre.humdata.org/learning-path/hxl/>, <https://tools.humdata.org/examples/hxl/> (accessed 2026-08-16). The HDX FAQ itself returned HTTP 403 on 2026-08-16, so per-dataset license options are **`unverified`**.

**Relevant policy — OCHA Data Responsibility Guidelines (revised January 2025):** they define **sensitive data** as including "personal data as well as 'non-personal data in a sensitive context'" — i.e. information that, "while not relating to an identified or identifiable natural person, may, by reason of its sensitive context, put certain individuals and groups at risk of harm."
Source: <https://centre.humdata.org/data-responsibility-guidelines-2025/>, <https://www.unocha.org/publications/report/world/data-responsibility-guidelines-january-2025> (accessed 2026-08-16).

**This is directly load-bearing for our C5 rule.** Excluding names and phone numbers is not sufficient. A feed of *shelter occupancy at a named building*, or *a collection point serving a specific displaced community*, can be non-personal and still sensitive. Our spec should adopt this two-part definition verbatim in its Security & Data Responsibility section and give publishers a concrete "do not publish" list.

### 3.3 OCHA 3W / 4W — Who does What Where (When)

**What it solves:** the coordination question, "who is operating where." A 3W collects "the most basic of information on who is doing what and where"; a 4W adds *when*. In cluster contexts an inter-cluster 3W template with standard vocabulary (admin data, activities) and a reporting schedule is agreed, with clusters extending it for their own detail and extracting back to the common template. Typical fields include `country code`, `sector`, `organization`, `type` (INGO, NNGO, UN, Undefined, Other), `3W date`.
Source: <https://knowledge.base.unocha.org/wiki/spaces/imtoolbox/pages/214499412/Who+does+What+Where+3W> (accessed 2026-08-16).

**What we take:** two things. (1) The **narrow-common-core + per-domain-extension** pattern is exactly HSDS Profiles arrived at from the operational side — strong convergent evidence that this is the right shape. (2) The `type` enum for organizations (a small, closed, boring list) is a good model for our `operator_type`.

**Why not wholesale:** 3W is a reporting practice with per-emergency templates, not a machine-readable spec with a schema and a validator. It is also organization-centric; we are place-centric.

### 3.4 IATI — the registry model

**What it solves:** aid transparency. Publishers emit IATI XML activity files **on their own websites**; the **IATI Registry holds only the metadata** about publishers and their file locations — "the files themselves stored in different places across the web." Over **1,500 organizations** publish, covering **over one million** activities.
Source: <https://iatistandard.org/en/iati-tools-and-resources/iati-registry/>, <https://www.unhcr.org/iati-international-aid-transparency-initiative> (accessed 2026-08-16).

**Governance:** a **Members' Assembly**, plus a **Technical Advisory Group (TAG)** that is "open to any interested organisation or individual, and not restricted to signatories," with functions to "discuss and provide proposals for the continued development and maintenance of the Standard." Current standard version 2.03 (released February 2018).
Sources: <https://iatistandard.org/en/governance/tag-documents/>, <https://iatistandard.org/en/iati-standard/203/>, <https://iatistandard.org/en/iati-standard/upgrades/how-we-manage-the-standard/versions/> (accessed 2026-08-16).

**License:** IATI's own standard license terms could not be confirmed from a primary page on 2026-08-16 — **`unverified`**. Note that IATI *data* is published under a range of licenses declared per-publisher; Code for IATI tracks the distribution, including CC BY-SA.
Source: <https://analytics.codeforiati.org/license/cc-by-sa.html> (accessed 2026-08-16).

**What we take:** the **registry-of-pointers architecture** — the registry holds `who publishes` + `where the file is` + `metadata`, never a copy of the data. This is precisely our Layer-4 design and it scales to 1,500 publishers on a shoestring. Also: **per-publisher declared data licenses**, which we need for §8.

**Why not wholesale:** XML with a heavy activity/transaction model; 2.03 has been stable since 2018, which is a different (slower) tempo than an active emergency; and the mandatory/recommended "Core" field split still assumes an organization with a data officer.

### 3.5 EDXL (OASIS) — and its one runaway success, CAP

**EDXL** is a suite of XML messaging standards for emergency information exchange between agencies:

| Standard | Status |
|----------|--------|
| EDXL-DE (Distribution Element) v1.0 | **OASIS Standard**, approved 2006-06-20; v2.0 published |
| EDXL-RM (Resource Messaging) | OASIS Standard (with approved errata) — requests for equipment, supplies and people |
| EDXL-HAVE (Hospital Availability Exchange) v2.0 | OASIS **Committee Specification** |

Sources: <https://www.oasis-open.org/standard/edxl-de-20/>, <https://www.oasis-open.org/standard/edxlrm/>, <https://www.oasis-open.org/news/announcements/emergency-data-exchange-language-edxl-hospital-availability-exchange-have-version/>, <https://wiki.oasis-open.org/emergency-adopt/What%20is%20EDXL> (accessed 2026-08-16).

**EDXL-HAVE is the closest formal prior art to "what is the current capacity/status of this facility?"** — our `capacity` / `status` problem, standardized. It is XML, committee-specified, and built for hospital IT departments with vendor software.

**CAP (Common Alerting Protocol)** is the family's breakout: an XML alert format adopted by ITU as **Recommendation X.1303 in 2007**, celebrated at its 20th anniversary by OASIS in 2024, and embraced by WMO, IFRC and UNDRR. The cited reasons for success: "driven by practitioners, reviewed by vendors, and adopted internationally"; it broke vendor silos by letting one input fan out over many networks.
Sources: <https://www.oasis-open.org/2024/10/07/oasis-celebrates-20th-anniversary-of-cap/>, <https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html> (accessed 2026-08-16).

**What we take:** CAP's success formula — *practitioners define it, implementers review it, one input fans out to many channels* — is our governance thesis in one line. From HAVE, the *concept inventory* of facility availability (bed counts, capacity status, service availability) as a checklist of what a `capacity` object eventually needs.

**Why not wholesale:** XML + OASIS process + vendor-scale assumptions is the opposite of C1/C3. EDXL-RM's request/response resource messaging would also drag us into transactional territory that v0.1 explicitly avoids.

### 3.6 Sahana Eden

**What it solves:** an open-source humanitarian management platform (not a wire format) — "the world's most popular open-source information management system for disaster and humanitarian aid management." Its **Organization Registry** module is "a database of organizations to help facilitate coordination," letting organizations record "their Offices, Warehouse and Field Sites including their locations so they can be mapped." First deployed publicly after the 2010 Haiti earthquake, including for WFP food distribution.
Sources: <https://sahanafoundation.org/eden/>, <https://live.osgeo.org/archive/10.5/en/overview/sahana_overview.html> (accessed 2026-08-16).

**Current state:** Eden ASP became an open project in 2024; **in May 2025 Eden ASP became the main branch and the previous codebase became "EDEN Legacy."** A 2025 update explicitly "reduced the complexity of the code so it would be more useful as a rapid deployment tool easily customizable by professional developers." Its central focus is **case management of individual beneficiaries**.
Source: <https://sahanafoundation.org/eden-legacy/> (accessed 2026-08-16).

**What we take:** the Office/Warehouse/Field-Site triple is a useful sanity check on our `place_kind` list. And the 2025 "reduce complexity to enable rapid deployment" pivot is corroborating evidence for our whole thesis.

**Why not wholesale:** it is an application, not an interchange format — and its centre of gravity is **individual case management**, which is the exact thing C5 forbids us to touch.

### 3.7 Ushahidi

**What it solves:** crowdsourced incident collection and mapping. Open source under **AGPL**; the v5 REST API exposes **Posts, Surveys, Categories**, with configurable custom surveys per deployment.
Sources: <https://github.com/ushahidi/platform>, <https://docs.ushahidi.com/v3-ushahidi-platform-rest-api-documentation/v5/overview> (accessed 2026-08-16).

**The Haiti lesson (2010):** the Ushahidi Haiti Project mapped reports of "trapped persons, medical emergencies, and specific needs, such as food, water, and shelter" from SMS and social media, plotted in real time by international volunteers. The independent evaluation's central finding: **"the most significant challenges arose in verifying and triaging the large volume of reports received,"** with reports carrying a binary `verified` / `unverified` label.
Sources: <https://reliefweb.int/report/haiti/independent-evaluation-ushahidi-haiti-project>, <https://www.ushahidi.com/about/blog/crisis-mapping-haiti-some-final-reflections> (accessed 2026-08-16).

**What we take (critical):** a **binary verified flag is not enough**. It answers "is this true?" without answering "who says so, how, and how long ago?" — the three questions a consuming app actually needs to decide whether to route a person to a place. This is the direct motivation for our invented verification triple (§6, concern **F**).

**Why not wholesale:** deployment-defined custom surveys mean two Ushahidi instances are not interoperable with each other, let alone with us. AGPL on the platform does not restrict our spec, but it does mean an app that embeds Ushahidi inherits AGPL obligations for that component.

### 3.8 PFIF — People Finder Interchange Format (studied only to be excluded)

PFIF is "a widely used open data standard for information about missing or displaced people," designed to let governments, relief organizations and survivor registries share records. Google Person Finder — built in January 2010 in direct response to the Haiti earthquake — implemented it, and press and NGOs contributed via the PFIF-based API. Google's stated privacy design: repositories are **intentionally temporary**; "several months after a crisis has subsided, Google takes down the Google Person Finder repository for that crisis and expires all the records."
Sources: <https://en.wikipedia.org/wiki/People_Finder_Interchange_Format>, <https://support.google.com/personfinder/answer/1628135?hl=en>, <https://support.google.com/personfinder/faq/1628221?hl=en> (accessed 2026-08-16).

**Verdict: study, cite, and do not implement.** PFIF exists, it works, and it is the reason our protocol can credibly say "we deliberately do not do this." Two things we *do* take from it:

1. **The expiry principle.** Even the most careful people-data system in the world treated *automatic expiry* as a core feature, not an afterthought. Our `place` feed should carry the same instinct in a milder form: a `ttl`, and an explicit `expires_at` for temporary places (a collection point that operates for nine days).
2. **The link-out boundary.** Ecosystem apps that handle missing persons (per the plan README) stay **link-out only**. Our spec should contain a normative `MUST NOT` naming person-level records, and the RFC-0 should explain *why* by pointing at PFIF: not because it's impossible, but because it requires a governance and takedown apparatus a volunteer consortium cannot staff.

---

## 4. Civic & Geo Standards

### 4.1 Open311 / GeoReport v2

**What it solves:** a common API for citizen service requests (potholes, graffiti) across cities. Six methods: GET service list, GET service definition, POST create request, GET requests, GET single request, GET service_request_id from token. **XML is mandatory; JSON support is advertised through the service discovery file.** A standard **service discovery file** routes clients between API versions and types. `jurisdiction_id` disambiguates multiple jurisdictions on one endpoint. Services with `metadata=true` require a second call to GET Service Definition to learn the form fields.
Source: <https://wiki.open311.org/GeoReport_v2/> (accessed 2026-08-16).

**Maturity:** "The spec has been frozen and finalized," finalized 2011-03-11. It reached Chicago, Toronto, San Francisco, Washington DC, Boston, New York, plus Commonwealth Connect (Massachusetts) and European uptake via Helsinki and CitySDK — but "there are currently over two dozen cities implementing the Open311 GeoReport v2 API," and a **GeoReport v2.1 draft has sat in development** rather than shipping.
Sources: <https://azavea.gitbooks.io/open-data-standards/content/standards/domain_specific_standards/open311.html>, <https://wiki.open311.org/GeoReport_v2/>, <http://wiki.open311.org/GeoReport_v2.1_Draft/> (accessed 2026-08-16). `www.open311.org` did not resolve on 2026-08-16.

**License:** not stated on the wiki pages retrieved — **`unverified`**.

**What we take:** the **service discovery file** (a third independent invention of the same pattern — GBFS `gbfs.json`, IATI Registry, Open311 discovery), and `jurisdiction_id` as a model for a `publisher_id` that lets one endpoint serve several municipalities (Pereira / Dosquebradas is exactly this case).

**Why not wholesale:** it is a *write* API (citizens submitting requests) with server-side state; we are read-only in v0.1. Mandatory XML with optional JSON was a bet that aged badly — see §7.4.

### 4.2 schema.org

**What it solves:** a shared vocabulary for structured data on web pages, consumed by search engines and increasingly by agents.

**Relevant types:**

- `Place` → `CivicStructure` — "a public structure, such as a town hall or concert hall." Adds `openingHours` (text, two-letter day codes + 24h times). 28 subtypes including **Hospital, FireStation, PoliceStation, GovernmentBuilding, PlaceOfWorship, Park, Campground, PublicToilet, EventVenue, Playground, Beach, Bridge**.
Source: <https://schema.org/CivicStructure> (accessed 2026-08-16).
- `EmergencyService` — "an emergency service, such as a fire station or ER"; parents `Organization → LocalBusiness` and `Place → LocalBusiness`; subtypes FireStation, Hospital, PoliceStation; inherits `telephone`, `email`, `address`, `geo`, `location`, `openingHours`, `openingHoursSpecification`. Usage reported as "1K – 10K Domains" (Google web-index aggregation, July 2026).
Source: <https://schema.org/EmergencyService> (accessed 2026-08-16).
- `SpecialAnnouncement` — added in the **fast-tracked schema.org 7.0 release (March 2020)** for COVID-19: "simple date-stamped textual updates," associating an announcement with a situation and providing URLs for school closures, public transport closures, quarantine guidelines, travel bans, testing info. `CovidTestingFacility` was added alongside. The White House OSTP announced adoption on 2020-04-15 and urged the private sector, state and local governments to follow.
Sources: <https://schema.org/SpecialAnnouncement>, <https://www.infodocket.com/2020/03/17/schema-org-7-0-published-includes-fast-tracked-new-vocabulary-to-assist-global-response-coronavirus-outbreak/>, <https://searchengineland.com/schema-org-adds-covid-19-related-structured-data-types-in-version-7-0-330831> (accessed 2026-08-16).

**Governance:** an independent project run through **W3C Community Groups**, managed by a small **steering group** that approves release candidates prepared by the webmaster, in public email review. "The project has never published a release without the unanimous agreement of the steering group." Proposals arrive via GitHub or `public-schemaorg@w3.org`; if no steering-group concerns arise within **10 business days**, the site updates. **`pending.schema.org`** is "a staging area for work-in-progress terms which have yet to be accepted into the core vocabulary," letting additive proposals get implementation feedback before formal acceptance. Several substantial releases per year, plus fast-tracked "Early Access Fixes."
Source: <https://schema.org/docs/howwework.html> (accessed 2026-08-16).

**License:** "The Sponsors' copyrights in the schema are licensed to website publishers and other third parties under the **Creative Commons Attribution-ShareAlike License (version 3.0)**," with the W3C Patent Policy applied and Essential Claims available under W3C RF licensing.
Source: <https://schema.org/docs/terms.html> (accessed 2026-08-16).

**What we take:** (a) **the `pending` staging area** — an officially blessed place for terms that are not yet normative, which is exactly what a 20-app consortium needs so that experimentation doesn't fork the spec; (b) **JSON-LD output as an optional, derived surface** — our spec can define a normative mapping from `place` → `schema.org/Place`-family JSON-LD so publishers get SEO and agent-discoverability for free; (c) the type names themselves as a sanity check on `place_kind`.

**Why not wholesale:** schema.org's model is deliberately loose (almost nothing is required, ranges are permissive) — good for annotating web pages, useless as a validation target for a directory. `openingHours` as a free-text micro-syntax is a parsing liability. And **CC BY-SA 3.0** means copying its term definitions into our spec attaches ShareAlike (§8).

### 4.3 GeoJSON — RFC 7946

**What it solves:** encoding geographic features in JSON. The normative bits that matter to us:

- **Coordinate order:** "The first two elements are longitude and latitude, or easting and northing, **precisely in that order** and using decimal numbers."
- **CRS is fixed:** "The coordinate reference system for all GeoJSON coordinates is a geographic coordinate reference system, using the **World Geodetic System 1984 (WGS 84)** datum, with longitude and latitude units of decimal degrees."
- **Feature** = `geometry` (Geometry or null) + `properties` (object or null) + optional `id` (string or number). **FeatureCollection** = a `features` array.
- **`bbox`** is optional; for 2D it is `[west, south, east, north]`.
- **Foreign members** "MAY be used in a GeoJSON document," with the caveat that tool support varies.

Source: <https://datatracker.ietf.org/doc/html/rfc7946> (accessed 2026-08-16). **License/IPR:** IETF Trust standard terms; RFCs are freely reproducible for implementation.

**What we take:** WGS 84 + decimal degrees, non-negotiable, stated normatively. `bbox` for the registry (so a consumer can filter feeds by region without downloading them). Optional GeoJSON `FeatureCollection` export as a *derived* representation, defined normatively so every app derives the same thing.

**Why not wholesale as the primary encoding:** `[longitude, latitude]` is the most reliably-inverted convention in software. Under **C1/C3** — volunteer teams, agent-generated code, no QA pipeline — a silently-swapped coordinate pair sends a person to the wrong side of the world with no error. GBFS's choice of named `lat` / `lon` scalars is empirically the safer default, and GBFS is not a naive project. We follow GBFS for the record shape and offer GeoJSON as a derived view.

### 4.4 OpenStreetMap + ODbL — the license landmine

**What it solves:** the base map and, increasingly, the base *place database* — many ecosystem apps will be tempted to seed their `place` list from OSM, and several probably already have.

**The terms:** OSM data is **ODbL 1.0**. "You are free to copy, distribute, transmit and adapt our data, as long as you credit OpenStreetMap and its contributors." "If you alter or build upon our data, you may distribute the result only under the same license." You must display an attribution notice and make clear the data is ODbL.
Source: <https://www.openstreetmap.org/copyright> (accessed 2026-08-16).

**The nuance that saves us:** the ODbL distinguishes a **Derivative Database** from a **Collective Database**. Per the OSMF guidelines, "the ODbL specifically allows aggregation of data via the concept of the 'Collective Database', only the OSM derived component of such a database needs to be ODbL licenced," and "an OSM dataset and a non-OSM dataset combined in a single database will be considered independent … so long as the data used for a particular data type is either all OSM or all non-OSM within the same regional cut." Conversely, "if raw OpenStreetMap data is mingled with raw third party data, and the result is used publicly, you are required to release the result under the same ODbL," and enriching your own records with OSM-derived values ("apply road surface tags from OSM to road vector data from a third party") makes the result derivative.
Sources: <https://wiki.openstreetmap.org/wiki/Collective_Database_Guideline>, <https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ> (accessed 2026-08-16).

**Consequence for the protocol — this is a real, concrete risk, not a theoretical one:**

- If an aggregator app merges OSM-sourced coordinates *into* records from Corag, Pereira Responde and others and republishes the merged set, that merged database is plausibly a **Derivative Database** and inherits ODbL share-alike.
- **Mitigation, and it must be in v0.1:** a **per-record `source` / `license` declaration** (Frictionless-style license IDs), so aggregators can keep OSM-derived records in a separately-licensed partition (Collective Database) rather than mingling. Plus one normative sentence: *a feed MUST declare the license of the data it contains, and MUST NOT relicense records it did not originate.*
- OSM **tagging** (`amenity=shelter`, `amenity=drinking_water`, `emergency=*`, and the `opening_hours` syntax GBFS reuses) is **facts and conventions, not copyrightable schema**, and is safe to draw vocabulary inspiration from.

---

## 5. Discovery, Transport, and the Agent Surface

### 5.1 `/.well-known/` — RFC 8615

Reserves the `/.well-known/` path prefix for `http`, `https`, `ws`, `wss` to hold site-wide metadata without colliding with an origin's own namespace. Registered names "MUST conform to the 'segment-nz' production in [RFC3986]," so no `/`. "Registered names for a specific application SHOULD be correspondingly precise; 'squatting' on generic terms is not encouraged." A registration must reference a specification defining the format and media type, name a change controller, and declare status. Well-known URIs exist **only at the top of the path hierarchy** — `/foo/.well-known/example` is not one. The RFC explicitly does **not** define discovery or scope; the application must.
Source: <https://datatracker.ietf.org/doc/html/rfc8615> (accessed 2026-08-16).

**Registry reality check:** the IANA well-known URI registry holds roughly 150+ entries with a **"Specification Required"** procedure, mixing permanent registrations (`acme-challenge` RFC 8555, `webfinger` RFC 7033, `security.txt` RFC 9116, `oauth-authorization-server` RFC 8414) with a substantial share of **provisional** ones (`did.json`, `change-password`, `nodeinfo`, `openid-federation`).
Source: <https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml> (accessed 2026-08-16).

**Verdict preview:** use `/.well-known/<suffix>` as the **RECOMMENDED** discovery location, pursue a **provisional** IANA registration once the name is settled (Task 5), but **do not make it a MUST** — many volunteer static hosts make dot-directories awkward, and blocking v0.1 on an IANA process would be absurd. Provide two fallbacks: a plain path (e.g. `/<name>/index.json`) and an HTML `<link rel="...">` pointer.

### 5.2 RSS / Atom / JSON Feed precedent

The lesson is one sentence long and worth the whole section: **the syndication format that won the developer mindshare of the 2010s–2020s was the one that dropped XML and required three fields.** See §2.3. Our `place` feed should be readable by a junior dev in 60 seconds without a schema in hand.

### 5.3 ActivityPub — what federation actually costs

W3C Recommendation; conceptually simple (JSON objects, HTTP GET/POST, URLs, collections). In practice: "Implementing the ActivityPub protocol from scratch introduces massive technical hurdles, including fragmented signature standards, unpredictable JSON-LD document variations, complex distributed systems engineering, and critical security vulnerabilities." Specific costs cited: HTTP Signatures key management and verification; "different ActivityPub servers interpret the specifications differently"; "silent failures like out-of-order message deliveries that cause permanently orphaned posts"; SSRF exposure; and interop testing described as "cross browser testing on steroids." The spec family runs to "hundreds of pages."
Sources: <https://hackers.pub/@fedify/2026/why-activitypub-is-hard>, <https://fedify.dev/why>, <https://www.w3.org/TR/activitypub/>, <https://swicg.github.io/activitypub-http-signature/> (accessed 2026-08-16).

**Verdict: reject for v0.1.** Push-based federation would consume 100% of a volunteer team's integration budget to solve a problem (real-time propagation) that a 5-minute `ttl` on a static file solves adequately for shelters and collection points.

### 5.4 AT Protocol — same conclusion, different architecture

ATProto separates storage (PDS), indexing (Relay) and product (AppView), where ActivityPub federates monolithic servers. Consequences: "Hosting your own Relay is possible, though bandwidth intensive… a fairly resource-demanding service"; "Creating or hosting your own AppView is possible, but resource intensive"; and "self-hosting the full stack is considerably harder than running a Mastodon instance." In practice "most users rely on a hosted PDS with few relays and AppViews."
Sources: <https://atproto.com/guides/self-hosting>, <https://docs.bsky.app/docs/advanced-guides/federation-architecture>, <https://fediview.com/articles/activitypub-vs-atproto-understanding-protocols/> (accessed 2026-08-16).

**Verdict: reject for v0.1.** Interesting for a hypothetical Layer-5 future; catastrophic as a v0.1 requirement.

### 5.5 MCP — the agent surface

**What it is:** an open protocol standardizing how LLM applications connect to external data and tools. JSON-RPC 2.0 messages; Hosts / Clients / Servers; servers expose **Resources, Prompts, Tools**; clients may offer **Sampling, Roots, Elicitation**. The spec adopts **BCP 14 / RFC 2119 / RFC 8174** keywords explicitly and is defined against a TypeScript schema. Versions are **date-stamped** (`2025-06-18`, `2026-07-28`).
Sources: <https://modelcontextprotocol.io/specification/2025-06-18>, <https://modelcontextprotocol.io/specification/2026-07-28/changelog> (accessed 2026-08-16).

**Current state (important for Task 6):** the **2026-07-28** specification is the current release, bringing "a stateless protocol core, Multi Round-Trip Requests, header-based routing, cacheable list results, authorization hardening, a formal extensions framework, and updated Tier 1 SDKs." On **2025-12-09** Anthropic transferred stewardship of MCP to the **Agentic AI Foundation (AAIF)**, a directed fund under the **Linux Foundation**, with a community-elected Technical Steering Committee and Anthropic holding one non-veto seat. Contributions are under **Apache License 2.0**, documentation under **CC BY 4.0**.
Sources: <https://blog.modelcontextprotocol.io/posts/2026-07-28/>, <https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/>, <https://aaif.io/projects/model-context-protocol/> (accessed 2026-08-16).

**What we take:** MCP is the **read surface for agents**, layered *above* the feeds — a reference MCP server that reads conforming feeds and exposes `search_places`, `get_place`, `list_publishers` as Tools. Its date-based versioning is a good model for a fast-moving companion artifact (the skill, the MCP server) even while the *data spec* uses semver. Its security principles section (explicit user consent, data-privacy limits, tool-safety warnings, "descriptions of tool behavior… should be considered untrusted") is a ready-made template for our agent-surface security text.

**Why not wholesale / why not as the protocol:** MCP standardizes *agent-to-tool* plumbing, not *publisher-to-publisher* data semantics. A `place` still needs a schema. Also: neutrality. Making a vendor-adjacent protocol the mandatory substrate for a civic consortium repeats the mistake GTFS had to undo by renaming (§7.1). MCP is an **optional, strongly-supported surface**, never the conformance floor.

### 5.6 `llms.txt` — cheap, unproven, worth doing anyway

Proposed by Jeremy Howard in September 2024: a plain-text file at the domain root, like `robots.txt`, compiling what you want LLMs to find. Adoption estimates for 2026 range from **2.13%** (with 39.6% of those being plugin stubs) to **10.13%** across a 300,000-domain study. Google's John Mueller stated in June 2025 that "no AI system currently uses llms.txt" and that server logs show AI bots are not fetching it; a 2026 analysis of 300,000 domains found "no measurable effect of llms.txt presence on AI citation likelihood." **But:** "IDE agents fetch llms.txt routinely. Cursor, Windsurf, Claude Code, GitHub Copilot, Cline, Aider — they all look for /llms.txt and /llms-full.txt when pointed at a documentation site."
Sources: <https://ai.aeo.press/the-state-of-llms-txt-in-2026>, <https://organikpi.com/blog/distribution/llms-txt-adoption-impact/>, <https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained> (accessed 2026-08-16).

**Verdict:** publish `llms.txt` and `llms-full.txt` on the protocol's developer portal — the audience that *does* fetch it is exactly the audience we are targeting (coding agents implementing the spec). Do **not** make it part of the data-discovery path, and do not claim SEO benefit.

---

## 6. Spec Craft, Schema, and Governance Machinery

### 6.1 RFC 2119 + RFC 8174 (BCP 14)

**Definitions to use verbatim:** MUST = "an absolute requirement of the specification"; MUST NOT = "an absolute prohibition"; SHOULD = "there may exist valid reasons in particular circumstances to ignore a particular item, but the full implications must be understood and carefully weighed before choosing a different course"; SHOULD NOT = the mirror; MAY = "truly optional."
Source: <https://datatracker.ietf.org/doc/html/rfc2119> (accessed 2026-08-16).

**The discipline that matters most to us:** RFC 2119 itself warns these imperatives "must be used with care and sparingly," appropriate "only where … actually required for interoperation or to limit behavior which has potential for causing harm," and not to impose implementation methods where interoperability doesn't require it. **For a protocol whose #1 risk is adoption cost (C7), every MUST must be defended.** A useful working rule for the v0.1 editor: *if a MUST cannot be validated by a script, it should probably be a SHOULD.*

**RFC 8174** narrows the scope: the keywords carry their special meaning **only when written in all capitals**. Use the standard boilerplate:

> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals, as shown here.

Source: <https://datatracker.ietf.org/doc/html/rfc8174> (accessed 2026-08-16).

**Note for C4:** the Spanish rendition of the spec must keep these keywords **in English and uppercase** (`MUST`, `SHOULD`, `MAY`) with a translated gloss, exactly as MCP, GBFS and HSDS do. Translating them ("DEBE", "DEBERÍA") destroys the normative reference. This is a real i18n decision, and it should be stated in RFC-0.

### 6.2 JSON Schema 2020-12

The current version is **2020-12**, split into **Core** and **Validation** parts with vocabulary-specific meta-schemas (Core, Applicator, Validation, …). Notable 2020-12 changes: `items`/`additionalItems` replaced by `prefixItems` + redefined `items` "to help lower the learning curve"; `$dynamicRef` / `$dynamicAnchor`; official guidance for bundling embedded schemas into compound documents; `format` and `unevaluated*` split into separate vocabularies.
Sources: <https://json-schema.org/specification>, <https://json-schema.org/draft/2020-12/release-notes> (accessed 2026-08-16). **The specification's own license/IPR status was not stated on the pages retrieved — `unverified`.** (JSON Schema has historically been published as IETF Internet-Drafts; the exact IPR terms should be confirmed by whoever writes the LICENSE file.)

**Why it is the right choice anyway:** universal tooling in every language our 20 apps use (`ajv`, `python-jsonschema`, `jsonschema-rs`), and it is what **OpenAPI 3.1** aligns to — meaning one schema serves both the static-file validator and any future API description. It is also what a coding agent already knows how to generate.

### 6.3 OpenAPI 3.1

3.1 aligns data types with **JSON Schema Draft 2020-12** ("Data types in the OAS are based on the types supported by the JSON Schema Specification Draft 2020-12") and adds the `webhooks` field for describing incoming requests. The specification document is licensed **Apache License 2.0**.
Source: <https://spec.openapis.org/oas/v3.1.0.html> (accessed 2026-08-16).

**Verdict:** defer to v0.2+. v0.1 has no required API. When we add one, use OpenAPI 3.1 **plus** an RFC 2119 conformance chapter — exactly the HSDS pattern, and for exactly the reason HSDS gives: OpenAPI describes *an* API, it does not specify requirements for *arbitrary* APIs.

### 6.4 Semantic versioning for a specification

SemVer maps meaning onto the version string: MAJOR = backwards-incompatible, MINOR = backwards-compatible additions, PATCH = backwards-compatible fixes. Standard breaking-change hygiene: deprecate in a minor, remove in the next major; notify well in advance. The known weakness: SemVer "provides no mechanism to enforce" its rules — adherence depends on discipline and review.
Source: <https://zuplo.com/learning-center/semantic-api-versioning>, <https://semver.org/> (accessed 2026-08-16).

**Both of our closest models use it, with published enforcement mechanics** — HSDS (semver + `-dev` branches + deprecation warnings-then-errors) and GBFS (semver + 180-day migration window + max two concurrent MAJORs + release candidates that require a live implementation). We should copy the *mechanics*, since SemVer alone provides none.

### 6.5 Governance models compared

| Model | Decision body | Change path | Speed | Fit for 20 volunteer apps |
|-------|---------------|-------------|-------|---------------------------|
| **W3C Community Group** | Any 5 people may found a CG; CG Reports; Final Specification Agreement; Contributor License Agreement governs IPR; specs may feed a Working Group with IPR continuity. Source: <https://www.w3.org/community/about/process/> | Formal, CLA-bound | Slow | **Later.** Good destination once the protocol matters beyond Pereira; heavy for month one. |
| **schema.org** | Small steering group; unanimity; 10-business-day silence = accept; `pending` staging area. Source: <https://schema.org/docs/howwework.html> | Lightweight, public | Fast | **Borrow the `pending` area and the silence-is-consent clock.** |
| **Open Referral** | Lead Organizer + Fiscal Sponsor + Technical Steward + Technical Committee; rough consensus → 2-week RFC → release. Source: <http://docs.openreferral.org/en/latest/about/specification-governance.html> | Structured, 4 roles | Medium | **Borrow the 2-week RFC window and the deprecation policy.** Four named roles is more org than we have. |
| **GBFS / MobilityData** | Consensus; 7-day PR discussion; 10-day vote; ≥3 votes excluding author; **must include a producer and a consumer**; RC must be implemented in a public dataset before release. Source: <https://github.com/MobilityData/gbfs> | Rules-based, in-repo | Fast | **★ Best fit.** Runs entirely on GitHub, needs no legal entity, and its quorum rule structurally prevents either consumers or publishers capturing the spec. |
| **IATI** | Members' Assembly + open Technical Advisory Group. Source: <https://iatistandard.org/en/governance/tag-documents/> | Membership-based | Slow | Borrow the *open* TAG idea (non-members may participate). |
| **MCP / AAIF** | Linux Foundation directed fund; community-elected TSC; original steward holds one non-veto seat. Source: <https://aaif.io/projects/model-context-protocol/> | Foundation | Medium | **The template for the "seed → neutral" transition** the plan's north-star vision needs. |

**Synthesis (input to Task 5):** start with **GBFS's in-repo rules** (they cost nothing and are demonstrably sufficient), add **schema.org's `pending` staging area** and **Open Referral's deprecation policy**, and hold **W3C CG or a Linux-Foundation-style neutral home** as the documented graduation path. Copy GTFS's naming lesson from day one: **no company name in the protocol name.**

### 6.6 Identifiers — RFC 9562 (UUID)

RFC 9562 defines UUIDv1 (time), v3 (MD5 name-based), v4 (random), v5 (SHA-1 name-based), v6 (reordered time), v7 (Unix-epoch time-ordered), v8 (custom). Guidance: "Implementations SHOULD utilize UUIDv7 instead of UUIDv1 and UUIDv6 if possible"; "If UUIDs are required for use with any security operation … then UUIDv4 SHOULD be utilized"; "Where possible, UUIDv5 SHOULD be used in lieu of UUIDv3."
Source: <https://datatracker.ietf.org/doc/html/rfc9562> (accessed 2026-08-16).

**Relevance:** HSDS 3.0 standardized all ID fields to UUID. That is right for a single authoritative database and **wrong for a federation of 20 independent publishers**, because it creates the illusion that two UUIDs for the same shelter are two different shelters — or worse, invites teams to invent a shared UUID-minting authority nobody will run. See concern **C** in the verdict table.

### 6.7 Time and language primitives

- **Timestamps:** RFC 3339 profile of ISO 8601, UTC, e.g. `2026-08-16T14:03:00Z`. GBFS's own example uses an offset form (`2023-07-17T13:34:13+02:00`) — we should **require `Z` (UTC)** to eliminate an entire class of comparison bugs in volunteer code. Source (for the format): <https://datatracker.ietf.org/doc/html/rfc7946> style conventions and <https://gbfs.org/documentation/reference/> (accessed 2026-08-16).
- **Language tags:** **BCP 47 / RFC 5646** — `[Language]-[Script]-[Region]-[Variant]…`; `es` = Spanish, `es-CO` = Spanish as used in Colombia, `en` = English; guidance is to use the shortest tag that carries distinguishing value, omitting subtags that "add no distinguishing value."
Source: <https://datatracker.ietf.org/doc/html/rfc5646> (accessed 2026-08-16).
**Practical consequence:** default to `es` and `en`, **not** `es-CO`, unless a genuinely Colombia-specific rendition exists. Over-specific tags fragment matching in consumer apps.

### 6.8 Colombian legal context (C5's legal floor)

**Ley Estatutaria 1581 de 2012** develops the constitutional right of every person to know, update and rectify information held about them, and binds public and private entities alike. **Sensitive data** ("datos sensibles") is data whose treatment can generate discrimination; its processing is **generally prohibited** except in enumerated cases — explicit consent, protection of the data subject's **vital interests**, processing by a non-profit for its members, legal proceedings, or historical/statistical/scientific purposes. Where processing sensitive data is indispensable — including emergencies and vital-interest situations — those processing it carry **reinforced responsibility**.
Sources: <https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=49981>, <https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/ley_1581_2012.htm> (accessed 2026-08-16). *This is a research summary, not legal advice; the working group should obtain Colombian counsel before any change to the people-data exclusion.*

**Why this belongs in a standards document:** it converts C5 from a design preference into a legal position. The spec can state, accurately and without dramatics: *this protocol carries no personal data; publishers therefore incur no `dato sensible` obligations under Ley 1581 by conforming to it.* That sentence is an adoption feature — it is the reason a municipal office can say yes quickly.

**Related national context:** MinTIC's **Marco de Interoperabilidad para Gobierno Digital** defines interoperability across político-legal, organizational, semantic and technical domains and promotes open standards, with a **Lenguaje Común** for information exchange between public entities.
Sources: <https://gobiernodigital.mintic.gov.co/portal/Iniciativas/Marco-de-Interoperabilidad/>, <https://lenguaje.mintic.gov.co/> (accessed 2026-08-16). Relevant later as an alignment target if municipal entities publish feeds; **out of scope for v0.1** — its semantic layer is built for inter-agency government exchange, not volunteer civic apps.

---

# PART II — THE VERDICT TABLE

Twelve protocol concerns. Each verdict is stated as `adopt X` / `adapt X` / `invent (because …)` and justified against C1–C7.

| # | Concern | Verdict | Source standard | Justification against our constraints |
|---|---------|---------|-----------------|----------------------------------------|
| **A** | **Geo encoding** | **Adapt GBFS + adopt RFC 7946's CRS rule.** Feed records carry named scalars `lat` and `lon` (decimal degrees, WGS 84, SHOULD have 6-decimal precision). A GeoJSON `FeatureCollection` export is **OPTIONAL** and normatively derived. `bbox` (RFC 7946 order `[west, south, east, north]`) is used in the registry for coarse filtering. | GBFS `station_information`; RFC 7946 | **C1/C3:** `[lon, lat]` ordering is the highest-frequency silent bug in civic geo data; named scalars make it unrepresentable. **C2:** both forms are static files. WGS 84 is adopted verbatim because there is no reason to differ and every reason not to. |
| **B** | **Entity vocabulary** (`place_kind`) | **Invent a small CC0 vocabulary, informed by schema.org + OSM + Sahana.** ~10 values for v0.1: `collection_center`, `shelter`, `hospital`, `health_post`, `water_point`, `food_point`, `distribution_point`, `warehouse`, `info_point`, `other`. Values are **English snake_case machine tokens**; Spanish/English display labels ship as a separate published label table. Extension via a `place_kind_ext` namespaced string. | schema.org `CivicStructure`/`EmergencyService` subtypes; OSM `amenity=*`; Sahana Office/Warehouse/Field Site; HSDS `location_type` | **Invent, because every mature option is unusable:** the AIRS/211 taxonomy is **fee-licensed proprietary IP**; schema.org's vocabulary is **CC BY-SA 3.0** and models buildings, not aid functions; OSM tags are apt but ODbL-adjacent in perception and not aid-shaped. **C6/C7:** ten values is memorizable; a 200-term taxonomy is not. |
| **C** | **Identifiers** | **Invent `{publisher_id}:{local_id}`; reject mandatory UUIDs; adopt an optional `same_as[]` array.** `publisher_id` is assigned once in the registry (PR-reviewed, human-readable, e.g. `corag`, `pereira-responde`). `local_id` is whatever the publisher's DB already uses. `same_as` holds other publishers' fully-qualified IDs as **claims**, never as authority. UUIDv7 permitted for `local_id` but never required. | Adapts Open311 `jurisdiction_id`; rejects HSDS 3.0's all-UUID rule; RFC 9562 informs the optional path | **C1/C3:** requiring UUID minting forces a migration on every app that already has integer PKs — a pure tax with no consumer benefit. **C7:** a globally unique ID that requires no coordination is the cheapest possible design. Deduplication is a *consumer* problem, and `same_as` gives consumers the hints without pretending a central authority exists. |
| **D** | **Feed format** | **Adopt the GBFS envelope.** Every file: `{ "last_updated": <RFC 3339 UTC>, "ttl": <int seconds>, "version": "<semver>", "data": { … } }`. JSON, UTF-8, `Content-Type: application/json`, CORS `Access-Control-Allow-Origin: *` REQUIRED. | GBFS common fields; JSON Feed's minimalism | **C2/C3:** proven at 535+ publishers; a static file plus four keys. **C7:** `ttl` gives consumers a caching contract without any server negotiation. CORS is our one non-obvious MUST — without it, every browser-based ecosystem app needs a proxy, which is the difference between an afternoon and a sprint. |
| **E** | **Discovery** | **Adapt GBFS `gbfs.json` + RFC 8615.** A publisher exposes an index listing `{name, url}` feed entries. Location: **RECOMMENDED** `/.well-known/<suffix>` (provisional IANA registration pursued post-naming); **also acceptable**: a documented plain path, advertised via `<link rel>` in the site's HTML. Registry-level discovery uses the IATI/GBFS model. | GBFS auto-discovery; RFC 8615; Open311 service discovery; IATI Registry | **C2:** logical-name-to-URL indirection means any static host works. **C1:** making `/.well-known/` a MUST would exclude publishers on hosts that mangle dot-directories, for zero interoperability gain. RFC 8615 explicitly leaves discovery to the application — so we must define it, and we do. |
| **F** | **Freshness & verification** | **`last_updated`/`ttl`: adopt GBFS. Verification: INVENT a triple** — `verified_at` (RFC 3339 UTC), `verified_by` (a publisher-scoped role/actor token, **never a person's name**), `verification_method` (closed enum: `in_person`, `phone`, `official_source`, `partner_report`, `user_report`, `unverified`). Plus `expires_at` (OPTIONAL) for temporary places. | Freshness from GBFS; provenance concept from HSDS `metadata`; expiry principle from PFIF/Person Finder; the *failure* from Ushahidi Haiti | **Invent, because no surveyed standard answers "how do you know?" in a machine-readable way.** Ushahidi Haiti's binary verified/unverified flag was the documented pain point. HSDS `metadata` records *change* provenance, not *field-verification* provenance. `verified_by` is a **role token, not a name** — C5 applies to volunteers too. This field trio is the protocol's actual moral content: it lets a consuming app show "confirmado en sitio hace 2 horas" instead of a bare pin. |
| **G** | **Conformance** | **Adopt RFC 2119/8174 keywords + adapt GBFS's file tiers into two named profiles.** `Core` (the index + one `places` file with the required field set) and `Extended` (capacity, needs, schedules, media). Conformance is asserted by **passing a published validator**, not by self-declaration. Editorial rule: **a MUST that cannot be validated by a script SHOULD be a SHOULD.** | RFC 2119/8174; GBFS Required/Conditionally-Required/Optional; HSDS's RFC 2119-over-OpenAPI layering | **C3/C7:** two tiers is the most a 20-team consortium will hold in its head. RFC 2119 itself warns to use imperatives "sparingly" and only where required for interoperation — a rule we should quote *in* the spec as a constraint on its own editors. |
| **H** | **Extensibility** | **Adapt HSDS Profiles, simplified.** Unknown members MUST be preserved by consumers and MUST NOT cause validation failure (GeoJSON foreign-member philosophy). Namespaced extensions `x_<publisher>_<field>` are always allowed. A **Profile** — a versioned set of schema modifications at a public URI — is the path for a group of apps that need shared extra fields. Removed terms MUST NOT be replaced by same-semantics aliases. | HSDS Profiles; RFC 7946 foreign members; Frictionless "MAY include any number of properties" | **C7:** the question "can my app add three fields?" arrives in week two, every time. Answering it up front prevents the fork. HSDS's full Profile machinery (generated schemas, `datapackage.json`, `/profile` endpoints) is trimmed to: a JSON file, a semver, a public URL. |
| **I** | **Versioning** | **Adopt SemVer + GBFS's enforcement mechanics + HSDS's deprecation policy.** `version` in every file. Producers SHOULD conform to a new MAJOR within **180 days**; supported versions SHALL NOT span more than two MAJORs. A release candidate becomes normative **only after at least one publisher has shipped it publicly**. Deprecated terms → validator **warning** for one release; obsolete terms → validator **error**. | SemVer; GBFS versioning policy; HSDS deprecation policy | SemVer alone "provides no mechanism to enforce" itself — GBFS and HSDS supply exactly the missing mechanics, already field-tested. **C7:** the "must be shipped before it's normative" rule is the cheapest available defence against a spec that outruns its implementers. |
| **J** | **i18n of labels** | **Adopt GBFS v3 Localized Strings; adapt the language policy for a Spanish-first ecosystem.** Human-readable fields are `Array<{text, language}>` with **BCP 47** tags; the publisher declares `languages` in its publisher file. **Spanish (`es`) is the REQUIRED baseline**; English (`en`) is RECOMMENDED. Machine tokens — field names, enum values, RFC 2119 keywords — remain **English, uppercase/snake_case, never translated**; a published label table carries their `es`/`en` display forms. | GBFS Localized String/URL objects; BCP 47; the MCP/GBFS/HSDS convention of untranslated normative keywords | **C4** is the constraint HSDS fails outright (it "is in English" and has no localization mechanism). **C3:** translating enum values would break every parser and is the classic i18n trap. Prefer `es` over `es-CO` per RFC 5646's shortest-useful-tag guidance. |
| **K** | **Federation / transport** | **Invent nothing; adopt "static files + a PR registry"; explicitly reject ActivityPub and AT Protocol for v0.1.** Consumers poll per `ttl`. The registry is a git-tracked file of publishers, updated by pull request. | IATI Registry; GBFS `systems.csv`; ActivityPub/ATProto studied and rejected | **C1/C3/C7:** ActivityPub costs HTTP Signatures, JSON-LD variance and cross-implementation interop testing; ATProto costs relays and AppViews described in its own docs as "resource intensive." Neither buys anything a 300-second `ttl` doesn't. A CSV/JSON in a git repo is diff-able, reviewable, free, and forkable — a real governance feature, not a compromise. |
| **L** | **Agent surface** | **Adopt MCP as an OPTIONAL layer above the feeds** (reference server exposing `search_places`, `get_place`, `list_publishers`), pinned to a dated spec version; publish `llms.txt` on the developer portal. MCP is **never** the conformance floor. | MCP 2026-07-28 (Linux Foundation / AAIF; Apache-2.0 code, CC BY 4.0 docs); llms.txt | **C3/C7:** the agent surface is the *reward* for conforming, not a second implementation burden — one shared reference server serves all 20 apps. Keeping it optional preserves neutrality (the GTFS renaming lesson) and means the protocol survives any change in the agent-tooling landscape. |

**Deliberate non-decisions for v0.1** (recorded so they are not re-litigated as oversights): opening hours (RRULE vs OSM `opening_hours` vs a simple weekly array), capacity/occupancy semantics (EDXL-HAVE is the reference to revisit), a needs/requests entity, and any write path. Each is Extended-profile or v0.2 work.

---

# PART III — LESSONS LEARNED (case studies)

## 7.1 GTFS — the success we should copy most deliberately

**What happened.** In 2005 Bibiana McHugh (TriMet, Portland) approached Google; Chris Harrelson had been prototyping transit search. The first Google Transit launched **under five months later**. The format was CSV — criticized as "technically old-fashioned and brittle" — chosen deliberately so that small agencies could "view and edit using spreadsheet programs and text editors." Adoption was pulled, not pushed: the public response was overwhelming, agencies saw peers getting positive press, and department heads began asking "How can we be next?" A pivotal governance move was renaming **Google** Transit Feed Specification → **General** Transit Feed Specification, which "dramatically reduced resistance from vendors, competing transit data advocates, and agencies." Since 2019 the nonprofit MobilityData has been the steward.
Source: <https://beyondtransparency.org/part-2/pioneering-open-data-standards-the-gtfs-story/> (accessed 2026-08-16); <https://gtfs.org/about/>.

**Implications for us**

1. **Ship a killer consumer before, or with, the spec.** The plan already contains the right candidate: a **unified map/directory** that renders every conforming feed. Nothing recruits publisher #7 like seeing publishers #1–6 on a map they aren't on. *This should be sequenced as a Task 6 product, not an afterthought.*
2. **Choose the boring format on purpose, and say so in the spec.** Our equivalent of "editable in a spreadsheet" is "a JSON file your static host already serves, and a coding agent can generate in one pass."
3. **The name must not belong to any one app.** Corag is the convenor; the protocol must not be `corag-*` in name, namespace, domain, or default field prefix. GTFS had to spend credibility undoing this. (Direct input to Task 5.)
4. **Publicity is a legitimate incentive.** A public conformance badge and a registry listing are, empirically, adoption levers.

## 7.2 Open Referral / HSDS — right model, high friction, and a missing feedback loop

**What happened.** HSDS has run for a decade with serious governance (Technical Committee, Technical Steward, two-week RFC windows), earned an **AIRS endorsement in 2018** that triggered 211-agency publishing, and is used by Findhelp, United Way 211 and Unite Us. It also went through **two backwards-incompatible major versions** (2.0 restructured taxonomy; 3.0 renamed and merged core entities and switched all IDs to UUID) before stabilizing at 3.x. Its de-facto classification vocabulary remains **proprietary and fee-licensed**. It is **English-only**. A machine-readable, authoritative list of conforming live feeds could not be located on 2026-08-16.
Sources: <https://docs.openreferral.org/en/latest/hsds/changelog.html>, <https://openreferral.org/airs-recommends-open-referral-for-resource-database-interoperability/>, <https://openreferral.org/faq/>, <https://211la.wordpress.com/commonly-asked-questions/> (accessed 2026-08-16).

**Implications for us**

1. **Get the entity model wrong cheaply, not expensively.** HSDS's 2.0 and 3.0 breaks are the cost of designing a rich model before the data existed. Our answer: **one entity, ten fields, in the field, this month** — then let real feeds tell us what's missing.
2. **Never make a licensed vocabulary the path of least resistance.** If our `place_kind` list is CC0 and complete enough for 90% of cases, nobody reaches for an encumbered one.
3. **Build the registry on day one.** HSDS's hardest question to answer in 2026 is "who is actually publishing?" A `publishers.json` in git answers it permanently, for free, and doubles as the adoption metric — the thing the working group will be asked about in every meeting.
4. **Ship the localization mechanism in v0.1, not v2.** Retrofitting i18n into a deployed schema is a MAJOR version. GBFS proves it: localized strings arrived in **v3.0**, a breaking release.

## 7.3 HXL — the most instructive failure mode, because it looks like a success

**What happened.** HXL made an elegant bet: **attributes over schemas.** Don't ask anyone to restructure anything; ask for one extra row. It earned real usage (2,359 HXL files on HDX, 13 organizations, 233 locations) and high awareness (**56% aware; 44% of those had used it**). Then, on **2026-01-21**, the Centre for Humanitarian Data announced that as of **2026-01-31** it was retiring `hxlstandard.org`, the HXL Proxy and HDX Quick Charts, and "will no longer be asking data contributors to add HXL tags to datasets shared on HDX" — because the standard "was originally designed as a simple standard for messy data, with a primary focus on combining spreadsheets" and the ecosystem had advanced. Notably, the retirement broke nothing: "there is also no risk that the pipelines will break after removing HXL tags."
Sources: <https://centre.humdata.org/retiring-hxl-services/>, <https://centre.humdata.org/what-hxl-hashtags-are-people-using/>, <https://centre.humdata.org/part-1-results-from-the-hdx-tools-survey/> (accessed 2026-08-16). Corroborated by `hxlstandard.org` HTTP 444 on 2026-08-16.

**Implications for us — four, and they are uncomfortable**

1. **Low imposition buys adoption but not durability.** If conforming is nearly free *and* removing conformance breaks nothing, the standard has no load-bearing role and can be switched off. **Our protocol must make itself load-bearing:** consuming apps should *depend* on the feed, so that turning it off is visibly costly. That is an argument for the shared map/registry being genuinely useful, not decorative.
2. **A standard whose canonical home is one organization's website dies when that organization's strategy changes.** The primary spec site went dark and the URLs stopped resolving. **Mitigation:** the spec lives in a git repository under a neutral org, mirrored, with a permanent versioned URL scheme, and every normative document has a stable archived copy. Domain ownership is a governance question (Task 5), not an ops detail.
3. **56% aware / 44% converted is roughly the ceiling for a voluntary standard with no consumer pull.** Our 20 apps have already *agreed*, which is a far stronger starting position — but the agreement decays. Convert it to shipped feeds within weeks, not quarters.
4. **The vocabulary-compression idea survives the platform.** `#hashtag` + `+attribute` was good design; adopt its spirit in `place_kind` + a small attribute set, not its syntax.

## 7.4 Open311 — frozen at a local maximum

**What happened.** GeoReport v2 was finalized on **2011-03-11**, adopted by major North American cities and European programs via Helsinki/CitySDK, and then… stopped. "The spec has been frozen and finalized"; a **v2.1 draft has remained a draft**; adoption is characterized as "over two dozen cities." XML was mandatory and JSON was advertised as a capability through the discovery file — a defensible 2011 choice that reads as a barrier in 2026. The main `www.open311.org` domain did not resolve on 2026-08-16. The broader civic-standards critique is blunt: the community "is still searching for the right model to craft standards that will be widely adopted," and GTFS-style success required "clearly linking the standard to a real-life problem to articulate real ROI for adoption."
Sources: <https://wiki.open311.org/GeoReport_v2/>, <http://wiki.open311.org/GeoReport_v2.1_Draft/>, <https://azavea.gitbooks.io/open-data-standards/content/standards/domain_specific_standards/open311.html>, <https://civic.io/2013/02/26/on-data-standards-for-cities/> (accessed 2026-08-16).

**Implications for us**

1. **A frozen spec is a spec whose governance stopped.** Freezing sounds like stability; in practice v2.1 sat in draft while the world moved to JSON. Our governance must have a **default cadence and a low-ceremony minor-release path**, or v0.1 becomes permanent by neglect.
2. **Do not build in a format concession you will regret.** Open311's XML-first/JSON-maybe split forced every consumer to implement two paths. **Our spec defines exactly one wire format: JSON.** Other representations (GeoJSON, JSON-LD, CSV) are OPTIONAL, normatively-derived views — never alternative sources of truth.
3. **`jurisdiction_id` was right and worth keeping.** Multi-municipality reality (Pereira / Dosquebradas / Santa Rosa) is our normal case, and a publisher-scoping key handles it cleanly.

## 7.5 schema.org's COVID-19 fast-track — a crisis-time governance precedent that worked

**What happened.** In **March 2020**, schema.org shipped release **7.0** with fast-tracked vocabulary for the pandemic: `SpecialAnnouncement` (date-stamped textual updates tied to a situation, with URLs for school closures, transport closures, quarantine guidelines, travel bans, testing info), `CovidTestingFacility`, and `eventAttendanceMode`. On **2020-04-15** the White House OSTP announced adoption and urged the private sector, state and local governments, and academia to follow; Google and Bing supported it in rich results.
Sources: <https://www.infodocket.com/2020/03/17/schema-org-7-0-published-includes-fast-tracked-new-vocabulary-to-assist-global-response-coronavirus-outbreak/>, <https://searchengineland.com/schema-org-adds-covid-19-related-structured-data-types-in-version-7-0-330831>, <https://schema.org/SpecialAnnouncement> (accessed 2026-08-16).

**Implications for us**

1. **Emergencies are compatible with real governance if the process has a documented fast path.** schema.org already had `pending` + a small steering group + a 10-business-day clock. It didn't improvise; it *used* its process at speed. Our v0.1 should define its emergency path **now**, in peacetime, with an explicit ceiling on what may be fast-tracked (additive-only, never breaking).
2. **`SpecialAnnouncement` is the right shape for our future `notice` entity** — a date-stamped, situation-linked, URL-bearing update — and mapping to it gives publishers search-engine visibility at no extra modelling cost.
3. **Endorsement is an adoption instrument.** AIRS's endorsement moved HSDS; OSTP's moved `SpecialAnnouncement`; NABSA's hosting "was key" to GBFS. For us the analogous asks are a municipal/departmental risk-management office and the university/dev community that produced these 20 apps. Worth planning for; **never claimable before it exists** (Rule-0).

## 7.6 Ushahidi Haiti + PFIF — the verification and people-data boundary, learned at cost

**What happened.** After the 2010 Haiti earthquake, the Ushahidi Haiti Project mapped SMS and social-media reports of trapped persons, medical emergencies, and needs for food, water and shelter, plotted in real time by international volunteers. It is credited as "an impressive proof of concept," and it propelled the crisis-mapping field. The independent evaluation's central finding was that "**the most significant challenges arose in verifying and triaging the large volume of reports received**," with reports labelled simply `verified` or `unverified`. In parallel, Google Person Finder (January 2010) implemented **PFIF** for missing-persons data — and built in **automatic expiry**: repositories are taken down and records expired several months after a crisis subsides.
Sources: <https://reliefweb.int/report/haiti/independent-evaluation-ushahidi-haiti-project>, <https://www.ushahidi.com/about/blog/crisis-mapping-haiti-some-final-reflections>, <https://support.google.com/personfinder/faq/1628221?hl=en>, <https://en.wikipedia.org/wiki/People_Finder_Interchange_Format> (accessed 2026-08-16).

**Implications for us**

1. **Verification is a *data model* problem, not a moderation problem.** A binary flag pushes the whole burden onto humans. `verified_at` + `verified_by` + `verification_method` lets a consuming app compute trust (recency × method) and lets a person decide. This is our single most defensible original contribution.
2. **Volume is the enemy of verification, and unverified data at scale is worse than less data.** Our spec should let publishers say `unverified` **explicitly and without shame** — an honest `verification_method: "unverified"` beats an implied claim, and it is the same instinct as Rule-0.
3. **PFIF proves people-data can be done and shows what it costs:** takedown machinery, expiry policy, an operator with legal capacity. A volunteer consortium has none of these. **C5 is therefore not squeamishness; it is a correct capability assessment**, and the spec should say so plainly — one paragraph, no moralizing, pointing at PFIF and Google's expiry policy as the standard of care we would have to meet and cannot.
4. **Borrow the expiry instinct anyway.** `expires_at` for temporary places is PFIF's lesson applied where it is safe.

---

# PART IV — LICENSE COMPATIBILITY ANALYSIS

## 8.1 The two layers, kept strictly separate

A recurring failure in this space is conflating **the license of the specification** with **the license of the data published under it**. They are different objects with different audiences:

| Layer | Object | Recommendation |
|-------|--------|----------------|
| **L1 — Specification** | Prose, field definitions, JSON Schemas, examples, the validator | **CC0-1.0** for prose + **Apache-2.0** for schemas/code/reference implementations |
| **L2 — Data** | Each publisher's `place` records | **Declared per feed** by the publisher, from a closed list of standard IDs; the spec never dictates it |

## 8.2 Per-standard license status and what it implies

| Standard | License | Constrains us? | Handling |
|----------|---------|----------------|----------|
| **HSDS / Open Referral** | **CC BY-SA 4.0** (docs, schema files, artefacts). Earlier versions were CC0. Source: <https://docs.openreferral.org/en/latest/about/license.html>, <https://github.com/openreferral/specification/issues/72> | **YES — ShareAlike.** Copying HSDS schema text or field definitions verbatim would attach BY-SA to our spec. | **Read, learn, cite, attribute. Do not paste.** Field *names* (`id`, `name`, `description`, `latitude`) are short functional identifiers, not creative expression, and are used across dozens of unrelated schemas — safe. Definition prose is not: write our own. If the working group ever *wants* BY-SA, that is a deliberate choice, not an accident. |
| **schema.org** | **CC BY-SA 3.0**, plus W3C Patent Policy / RF licensing on Essential Claims. Source: <https://schema.org/docs/terms.html> | **YES — ShareAlike**, for copied definitions. Patent posture is favourable (royalty-free). | Same handling. A **mapping table** (`our_field → schema.org term URL`) is a reference, not a derivative of their text — safe and valuable. |
| **GBFS** | **CC BY 3.0** — attribution, **no ShareAlike**. Source: <https://github.com/MobilityData/gbfs/blob/master/LICENSE> | **NO.** Attribution only. | **This is why GBFS is our primary structural source.** Adapting the envelope, the discovery pattern and the localized-string design requires only that we credit GBFS/MobilityData — which we should do prominently anyway, as a matter of good standards citizenship. |
| **GTFS** | gtfs.org content **CC BY 3.0**; code samples **Apache-2.0**; GTFS Realtime **Apache-2.0**. Source: <https://gtfs.org/about/> | **NO.** | Attribute where we borrow. |
| **MCP** | Code **Apache-2.0**, docs **CC BY 4.0**; project under Linux Foundation / AAIF. Source: <https://aaif.io/projects/model-context-protocol/> | **NO.** Apache-2.0 includes an express patent grant. | Safe to build a reference MCP server on. Pin the dated spec version in our docs. |
| **OpenAPI 3.1** | **Apache-2.0**. Source: <https://spec.openapis.org/oas/v3.1.0.html> | **NO.** | Safe when we add an API description. |
| **IETF RFCs** (2119, 7946, 8174, 8615, 5646, 9562, 3339) | IETF Trust terms; free to implement and to quote for implementation. | **NO.** | Cite by number; quote the standard BCP 14 boilerplate verbatim (that is its intended use). |
| **JSON Schema 2020-12** | **`unverified`** — no license statement found on the pages retrieved 2026-08-16. Historically published as IETF Internet-Drafts. Source: <https://json-schema.org/specification> | Unlikely, but **confirm before shipping a LICENSE file.** | **Action item for Task 5/8:** confirm the IPR terms. We depend on the *format*, which is not itself copyrightable; risk is low but should not be assumed. |
| **OpenStreetMap data** | **ODbL 1.0** — attribution + share-alike on Derivative Databases; Collective Databases are carved out. Source: <https://www.openstreetmap.org/copyright>, <https://wiki.openstreetmap.org/wiki/Collective_Database_Guideline> | **YES — for DATA, not for the spec.** The real exposure sits with apps that seed places from OSM and with any aggregator that merges feeds. | **Three concrete requirements for v0.1:** (1) every feed MUST declare a data license; (2) records MAY carry a `source` and a per-record `license` when they differ from the feed default; (3) the spec includes a short, non-legal-advice note on Collective vs Derivative Databases, so aggregators partition rather than mingle. |
| **AIRS / 211 LA County Taxonomy** | **Proprietary, copyrighted, fee-licensed per subscribing organization.** Source: <https://211la.wordpress.com/commonly-asked-questions/> | **YES — this is the one standard whose license actively blocks a design we might otherwise have chosen.** | **Do not reference, embed, or map to it in any normative artifact.** It is the reason concern **B** is an *invent* verdict. |
| **Ushahidi platform** | **AGPL.** Source: <https://github.com/ushahidi/platform> | **NO** for the spec; **YES** for any app embedding it. | Note in the adoption playbook so teams aren't surprised. |
| **HXL** | Centre site content **CC BY 4.0**; standard's own license **`unverified`** (primary site retired 2026-01-31). | Low. We take philosophy, not text. | Cite the Centre's pages, not the retired site. |
| **Open311 GeoReport v2** | **`unverified`** — no license on the wiki pages retrieved. | Low. We take one architectural idea (`jurisdiction_id`, discovery file). | Attribute in prose. |
| **Sitemaps protocol** | No explicit license stated on sitemaps.org. Source: <https://www.sitemaps.org/protocol.html> | Low — we take a pattern, not text. | No action. |
| **JSON Feed** | Copyright Simmons & Reece; **no open license stated**. Source: <https://www.jsonfeed.org/version/1.1/> | Low — we take a design discipline. | A cautionary example: **our spec ships an explicit LICENSE file from commit one.** |

## 8.3 Why CC0 for the specification

1. **Maximum downstream reuse.** Municipal offices, universities, and companies can embed the spec in procurement documents and internal standards with zero legal review. Legal review is a hidden adoption tax, and **C7** says adoption cost is the thing that kills protocols.
2. **No ShareAlike deadlock.** ShareAlike clauses on specs create the compatibility problems documented across CC/GPL analyses; CC0 has none. Open Referral moved *away* from CC0 for a defensible mission reason (preserving openness) — we should note that they chose differently and say why we don't: our risk is not enclosure, it is **irrelevance through non-adoption**.
3. **Precedent exists in this exact family.** HSDS itself was CC0 through v0.9.
4. **Pair with Apache-2.0 for code and schemas** (validator, reference MCP server, agent skill, JSON Schema files) to get the express patent grant that CC0 does not provide — the same split MCP and GTFS use.

**One caveat to put in front of the working group:** CC0 means a company can build a closed product on the spec and contribute nothing back. That is the deal. GTFS made it and it produced a global ecosystem; it is also, arguably, why GTFS *has* a global ecosystem.

## 8.4 Data licensing recommendation (L2)

- Every feed **MUST** declare a data license via a `license` field using a standard identifier (SPDX-style or an Open Definition ID, following the Frictionless `licenses` convention).
- **RECOMMENDED default: CC BY 4.0** for aid-place data — attribution keeps volunteer contributors visible, which matters for morale and for the ecosystem's credibility, and it does not encumber aggregators.
- **Explicitly permitted:** CC0-1.0, CC BY 4.0, ODbL-1.0 (for OSM-derived sets). **Explicitly discouraged in the spec's guidance** (not forbidden): NonCommercial and NoDerivatives terms, because they make a shared map legally awkward for anyone who might one day charge for hosting.
- **Consumers MUST honour the declared license and MUST NOT relicense records they did not originate.** One sentence, and it prevents the aggregation-laundering problem that ODbL exists to police.

---

# PART V — WHAT WE ARE ACTUALLY INVENTING (and the honest cost)

Being precise about the invented surface is a Rule-0 obligation: it is the part with no field evidence behind it.

| Invention | Why nothing existing works | Risk we are accepting |
|-----------|---------------------------|------------------------|
| **The verification triple** (`verified_at`, `verified_by`, `verification_method`) | No surveyed standard models field-verification provenance. HSDS `metadata` records change history; Ushahidi's binary flag was the documented failure point. | Volunteers may fill it inconsistently, or default everything to `user_report`. Mitigation: the closed enum is short, the validator checks it, and the reference UI *shows* the method — visibility disciplines input. |
| **The CC0 `place_kind` vocabulary** | The mature option (AIRS/211) is fee-licensed; schema.org's is BY-SA and models buildings, not aid functions. | Ten values will be wrong at the edges within a month. Mitigation: `other` + `place_kind_ext` + the schema.org `pending`-style staging area for proposed values. |
| **Two-tier conformance (Core / Extended)** | GBFS's Required/Conditionally-Required/Optional is file-level; HSDS Profiles are heavier. We need a named tier a team can claim in one word. | Teams may claim Core without passing the validator. Mitigation: conformance is **asserted by passing the published validator**, and the registry records the validator result, not the claim. |
| **`{publisher_id}:{local_id}` identity + `same_as` claims** | HSDS mandates UUIDs (imposes migration); nothing surveyed models cross-publisher identity claims without an authority. | Duplicate places across feeds will be common and `same_as` will be sparse. Mitigation: accept it — dedup is a consumer feature in v0.1, and the registry gives consumers a stable `publisher_id` to reason with. |

Everything else in the verdict table is adopted or adapted from a standard with field evidence behind it. **That ratio — four inventions, twelve concerns — is the number to defend in RFC-0.**

---

# PART VI — OPEN QUESTIONS FOR THE WORKING GROUP

These are decisions this research can inform but not make. They belong in RFC-0 as explicit questions, not as silent assumptions.

1. **Spec license: CC0-1.0 or CC BY-SA 4.0?** §8.3 recommends CC0 with Apache-2.0 for code. Open Referral chose the opposite and had reasons. This is a values question, not a technical one.
2. **`/.well-known/` suffix name, and whether to pursue provisional IANA registration.** Blocked on naming (Task 5). Registration is "Specification Required" and provisional entries are common — achievable, but not a v0.1 blocker.
3. **Does `place` collapse `location` + `service`, or do we ship the HSDS split in v0.1?** This document recommends collapsing with documented debt, on **C3/C6** grounds. The working group should ratify that trade knowingly, because un-collapsing it later is a MAJOR version.
4. **Opening hours:** RRULE (HSDS), OSM `opening_hours` (GBFS reuses it), or a simple weekly array? Recommend deferring to Extended; if forced, the simple array — RRULE and `opening_hours` are both parser-dependent micro-languages.
5. **Do we require CORS `*`?** Recommended as one of very few MUSTs, because without it every browser app needs a proxy. Needs a sanity check against the ecosystem's actual hosting reality (Task 1 output).
6. **Governance home and the graduation path.** GBFS-style in-repo rules now; W3C CG or a Linux-Foundation-style neutral fund later. Task 5 owns this; §6.5 supplies the comparison.
7. **Recommended data license default.** §8.4 proposes CC BY 4.0. Publishers with existing terms may differ, and the spec must accommodate that rather than override it.

---

# APPENDIX — Source Index

All URLs accessed **2026-08-16 (UTC)**. Fetch failures are recorded honestly.

**Service directories / HSDS**
1. <https://docs.openreferral.org/en/latest/hsds/overview.html>
2. <https://docs.openreferral.org/en/latest/hsds/schema_reference.html>
3. <https://docs.openreferral.org/en/latest/hsds/api_reference.html>
4. <https://docs.openreferral.org/en/latest/hsds/profiles.html>
5. <https://docs.openreferral.org/en/latest/hsds/changelog.html>
6. <https://docs.openreferral.org/en/latest/hsds/hsds_faqs.html>
7. <https://docs.openreferral.org/en/latest/about/license.html>
8. <http://docs.openreferral.org/en/latest/about/specification-governance.html>
9. <https://github.com/openreferral/specification>
10. <https://github.com/openreferral/specification/issues/72>
11. <https://openreferral.org/faq/>
12. <https://openreferral.org/airs-recommends-open-referral-for-resource-database-interoperability/>
13. <https://openreferral.org/open-referral-in-ontario-a-big-step-forward/>
14. <https://211la.wordpress.com/commonly-asked-questions/> — AIRS/211 LA taxonomy licensing

**Static-feed families**
15. <https://gbfs.org/documentation/reference/>
16. <https://raw.githubusercontent.com/MobilityData/gbfs/master/gbfs.md>
17. <https://gbfs.org/documentation/faq/>
18. <https://github.com/MobilityData/gbfs>
19. <https://github.com/MobilityData/gbfs/blob/master/LICENSE>
20. <https://github.com/MobilityData/gbfs/blob/master/systems.csv>
21. <https://beyondtransparency.org/part-2/pioneering-open-data-standards-the-gtfs-story/>
22. <https://gtfs.org/about/>
23. <https://www.jsonfeed.org/version/1.1/>
24. <https://specs.frictionlessdata.io/data-package/>
25. <https://www.sitemaps.org/protocol.html>

**Humanitarian**
26. <https://centre.humdata.org/retiring-hxl-services/> — HXL retirement, published 2026-01-21, effective 2026-01-31
27. <https://centre.humdata.org/what-hxl-hashtags-are-people-using/>
28. <https://centre.humdata.org/learning-path/hxl/>
29. <https://centre.humdata.org/part-1-results-from-the-hdx-tools-survey/>
30. <https://knowledge.base.unocha.org/wiki/spaces/imtoolbox/pages/42502162/HXL+-+Humanitarian+Exchange+Language>
31. <https://github.com/HXLStandard/hxl-proxy/wiki/Tag-patterns>
32. <https://knowledge.base.unocha.org/wiki/spaces/imtoolbox/pages/214499412/Who+does+What+Where+3W>
33. <https://centre.humdata.org/data-responsibility-guidelines-2025/>
34. <https://www.unocha.org/publications/report/world/data-responsibility-guidelines-january-2025>
35. <https://iatistandard.org/en/iati-tools-and-resources/iati-registry/>
36. <https://iatistandard.org/en/governance/tag-documents/>
37. <https://iatistandard.org/en/iati-standard/203/>
38. <https://www.unhcr.org/iati-international-aid-transparency-initiative>
39. <https://analytics.codeforiati.org/license/cc-by-sa.html>
40. <https://www.oasis-open.org/standard/edxl-de-20/>
41. <https://www.oasis-open.org/standard/edxlrm/>
42. <https://www.oasis-open.org/news/announcements/emergency-data-exchange-language-edxl-hospital-availability-exchange-have-version/>
43. <https://wiki.oasis-open.org/emergency-adopt/What%20is%20EDXL>
44. <https://www.oasis-open.org/2024/10/07/oasis-celebrates-20th-anniversary-of-cap/>
45. <https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html>
46. <https://sahanafoundation.org/eden/>
47. <https://sahanafoundation.org/eden-legacy/>
48. <https://live.osgeo.org/archive/10.5/en/overview/sahana_overview.html>
49. <https://github.com/ushahidi/platform>
50. <https://docs.ushahidi.com/v3-ushahidi-platform-rest-api-documentation/v5/overview>
51. <https://reliefweb.int/report/haiti/independent-evaluation-ushahidi-haiti-project>
52. <https://www.ushahidi.com/about/blog/crisis-mapping-haiti-some-final-reflections>
53. <https://en.wikipedia.org/wiki/People_Finder_Interchange_Format>
54. <https://support.google.com/personfinder/answer/1628135?hl=en>
55. <https://support.google.com/personfinder/faq/1628221?hl=en>

**Civic / geo**
56. <https://wiki.open311.org/GeoReport_v2/>
57. <http://wiki.open311.org/GeoReport_v2.1_Draft/>
58. <https://azavea.gitbooks.io/open-data-standards/content/standards/domain_specific_standards/open311.html>
59. <https://civic.io/2013/02/26/on-data-standards-for-cities/>
60. <https://schema.org/CivicStructure>
61. <https://schema.org/EmergencyService>
62. <https://schema.org/SpecialAnnouncement>
63. <https://schema.org/docs/howwework.html>
64. <https://schema.org/docs/terms.html>
65. <https://www.infodocket.com/2020/03/17/schema-org-7-0-published-includes-fast-tracked-new-vocabulary-to-assist-global-response-coronavirus-outbreak/>
66. <https://searchengineland.com/schema-org-adds-covid-19-related-structured-data-types-in-version-7-0-330831>
67. <https://datatracker.ietf.org/doc/html/rfc7946>
68. <https://www.openstreetmap.org/copyright>
69. <https://wiki.openstreetmap.org/wiki/Collective_Database_Guideline>
70. <https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ>

**Discovery / transport / agents**
71. <https://datatracker.ietf.org/doc/html/rfc8615>
72. <https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml>
73. <https://www.w3.org/TR/activitypub/>
74. <https://hackers.pub/@fedify/2026/why-activitypub-is-hard>
75. <https://fedify.dev/why>
76. <https://swicg.github.io/activitypub-http-signature/>
77. <https://atproto.com/guides/self-hosting>
78. <https://docs.bsky.app/docs/advanced-guides/federation-architecture>
79. <https://fediview.com/articles/activitypub-vs-atproto-understanding-protocols/>
80. <https://modelcontextprotocol.io/specification/2025-06-18>
81. <https://modelcontextprotocol.io/specification/2026-07-28/changelog>
82. <https://blog.modelcontextprotocol.io/posts/2026-07-28/>
83. <https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/>
84. <https://aaif.io/projects/model-context-protocol/>
85. <https://ai.aeo.press/the-state-of-llms-txt-in-2026>
86. <https://organikpi.com/blog/distribution/llms-txt-adoption-impact/>
87. <https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained>

**Spec craft / governance / legal**
88. <https://datatracker.ietf.org/doc/html/rfc2119>
89. <https://datatracker.ietf.org/doc/html/rfc8174>
90. <https://datatracker.ietf.org/doc/html/rfc5646>
91. <https://datatracker.ietf.org/doc/html/rfc9562>
92. <https://json-schema.org/specification>
93. <https://json-schema.org/draft/2020-12/release-notes>
94. <https://spec.openapis.org/oas/v3.1.0.html>
95. <https://semver.org/>
96. <https://zuplo.com/learning-center/semantic-api-versioning>
97. <https://www.w3.org/community/about/process/>
98. <https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=49981> — Ley 1581 de 2012
99. <https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/ley_1581_2012.htm>
100. <https://gobiernodigital.mintic.gov.co/portal/Iniciativas/Marco-de-Interoperabilidad/>
101. <https://lenguaje.mintic.gov.co/>

**Fetch failures recorded (2026-08-16)**
- `https://hxlstandard.org/standard/1-1final/dictionary/`, `https://hxlstandard.org/standard/1-1final/tagging/`, `https://hxlstandard.org/standard/dictionary/` — **HTTP 444** (consistent with the 2026-01-31 retirement)
- `https://data.humdata.org/faq` — **HTTP 403**
- `https://www.open311.org/...` — **DNS resolution failure**
- `https://dev.hxlstandard-org.ahconu.org/how-it-works/` — **DNS resolution failure**
- `https://centre.humdata.org/learning-path/hxl/hashtags-attributes/` — **HTTP 404**

---

*End of `PRIOR_ART.md`. Produced under the plan's Rule-0: every factual claim carries a source and an access date; unverifiable items are marked `unverified` rather than estimated. Nothing in this document commits any ecosystem team to anything — all verdicts are proposals for the working group.*
