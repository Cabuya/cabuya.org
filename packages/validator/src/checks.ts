/**
 * The check catalogue — the single source of truth for every check id the
 * validator can emit.
 *
 * Read by: the validator's passes, the `explain` command, the portal's
 * `/developers/validator/checks` pages, the `checks:catalogue` gate, and the
 * skill's error-code reference. Anything that lists checks generates from
 * here; nothing hand-maintains a second copy.
 *
 * **Ids are stable forever.** A check may be deprecated, never renumbered —
 * messages are quoted in issues, commits and agent transcripts. Checks not
 * yet implemented stay in the catalogue with `implemented: false` so their
 * ids are reserved, their documentation pages exist, and the backlog is
 * pre-specified work (the `good-first-issue:check` strategy) rather than an
 * empty, intimidating list.
 */

import type { Level, Severity } from './report.js';

/** Which pass owns a check — also the family of its id prefix. */
export type CheckFamily =
  | 'discovery'
  | 'envelope'
  | 'record'
  | 'pii'
  | 'behavior'
  | 'api'
  | 'write'
  | 'license';

export interface CheckDefinition {
  id: string;
  family: CheckFamily;
  severity: Severity;
  level: Level;
  /** One line, imperative-neutral: what the check asserts. */
  title: string;
  /** The requirement, as the finding's `rule` field will state it. */
  rule: string;
  /**
   * The general remedy, in the imperative.
   *
   * A finding may carry a more specific fix built from what it actually saw —
   * a pointer, a value class, a suggested patch. This is the one that holds
   * whatever the document contained, and it is what the catalogue page shows
   * to a reader who arrived from an error message.
   */
  fix: string;
  /** The normative anchor this check enforces. */
  specAnchor: string;
  /** False = id reserved and documented, logic not shipped yet. */
  implemented: boolean;
  /** The migration/roadmap note for unimplemented checks. */
  plannedIn?: string;
}

const SPEC = 'https://cabuya.org/developers/spec/0.1';
const DOCS = 'https://cabuya.org/developers/validator/checks';

/** Deep link to a check's documentation page. */
export function docsUrl(id: string): string {
  return `${DOCS}#${id}`;
}

export const CHECKS: readonly CheckDefinition[] = [
  // ── Discovery (L1) ──────────────────────────────────────
  {
    id: 'DSC001',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'Manifest reachable over HTTPS as JSON',
    rule: 'The manifest MUST be served over HTTPS with Content-Type: application/json.',
    fix: 'Serve the manifest over HTTPS with a JSON content type, and check it from outside your network.',
    specAnchor: `${SPEC}/2-discovery#2-1`,
    implemented: false,
    plannedIn: 'Task 15 (behavioral probes)',
  },
  {
    id: 'DSC002',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'Soft-404: a discovery path answering 200 + text/html is absent',
    rule: 'A manifest is JSON. HTML at a discovery path means an SPA catch-all is answering — the manifest is absent, not present.',
    fix: 'Exclude the discovery path from your catch-all so the file is served instead of your app shell.',
    specAnchor: `${SPEC}/1-architecture#1-2`,
    implemented: true,
  },
  {
    id: 'DSC003',
    family: 'discovery',
    severity: 'warning',
    level: 'L1',
    title: 'robots.txt returns 200 text/plain',
    rule: 'L2+ preconditions include a real robots.txt.',
    fix: 'Serve a real robots.txt at the root with a text/plain content type.',
    specAnchor: `${SPEC}/1-architecture#1-2`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'DSC004',
    family: 'discovery',
    severity: 'warning',
    level: 'L1',
    title: 'Manifest at the RECOMMENDED path, or a <link rel> advertisement',
    rule: 'The manifest SHOULD live at /.well-known/cabuya.json, or be advertised with <link rel="cabuya">.',
    fix: 'Move the manifest to /.well-known/cabuya.json, or advertise its location with a <link rel="cabuya-manifest">.',
    specAnchor: `${SPEC}/2-discovery#2-2`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'DSC005',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'Manifest validates against manifest.schema.json',
    rule: 'The manifest MUST conform to its schema.',
    fix: 'Correct the manifest against the published schema; the finding names the failing property.',
    specAnchor: `${SPEC}/2-discovery#2-1`,
    implemented: true,
  },
  {
    id: 'DSC006',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'publisher.canonical_url matches the registry entry',
    rule: 'A registered publisher’s manifest MUST agree with its registry entry about its canonical URL.',
    fix: 'Make the canonical URL in the manifest match the one in your registry entry, or open a pull request to change the entry.',
    specAnchor: `${SPEC}/2-discovery#2-4`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'DSC007',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'Every feeds[].url is absolute HTTPS and reachable',
    rule: 'Declared feeds MUST resolve.',
    fix: 'Give every feed an absolute https URL that resolves from outside your network.',
    specAnchor: `${SPEC}/2-discovery#2-3`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'DSC008',
    family: 'discovery',
    severity: 'warning',
    level: 'L1',
    title: 'crawl_policy_url resolves',
    rule: 'The declared crawl/reuse policy SHOULD be fetchable — consumers must honor it.',
    fix: 'Point crawl_policy_url at a page that exists, or remove the field.',
    specAnchor: `${SPEC}/2-discovery#2-4`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'DSC009',
    family: 'discovery',
    severity: 'error',
    level: 'L1',
    title: 'conformance_target does not exceed the measured level',
    rule: 'conformance_target is a declaration; it MUST NOT claim more than this run measures. Reported as a mismatch, never as the level.',
    fix: 'Lower conformance_target to the level you actually reach, or fix what is blocking the level you claim. The target is an intention, not a claim.',
    specAnchor: `${SPEC}/8-versioning-and-conformance#8-3`,
    implemented: false,
    plannedIn: 'Task 13 (content side) + Task 15',
  },

  // ── Schema (generic fallback) ───────────────────────────
  {
    id: 'SCH001',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'The document does not conform to its published JSON Schema',
    rule: 'Every feed and manifest MUST validate against its versioned schema.',
    fix: 'Correct the value so it satisfies the schema. The finding gives the pointer and the expected shape.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
    plannedIn: undefined,
  },

  // ── Envelope (L2) ───────────────────────────────────────
  {
    id: 'ENV001',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'Envelope required fields present and well-typed',
    rule: 'last_updated, ttl, version, publisher_id and license are REQUIRED on every feed envelope.',
    fix: 'Add the missing envelope field. All five are required on every feed.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV002',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'last_updated is RFC 3339 with a UTC offset',
    rule: 'The generation timestamp MUST be unambiguous.',
    fix: 'Write last_updated as an RFC 3339 timestamp with an explicit UTC offset, e.g. 2026-08-17T14:02:00Z.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV003',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'license present',
    rule: 'An unlicensed feed does not conform — absence blocks every consumer’s legal review.',
    fix: 'Declare a licence. An unlicensed feed blocks every consumer’s legal review, which is a harder problem than a missing field.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV004',
    family: 'envelope',
    severity: 'warning',
    level: 'L2',
    title: 'license is an SPDX id, or license_url accompanies it',
    rule: 'A machine-resolvable licence SHOULD be used.',
    fix: 'Use an SPDX identifier, or keep the custom string and add license_url pointing at the terms.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV005',
    family: 'envelope',
    severity: 'warning',
    level: 'L2',
    title: 'permitted_use present, values within the closed enum',
    rule: 'Consent-to-reuse travels in the envelope: display | aggregate | redistribute | ai_answer | ai_train.',
    fix: 'Add permitted_use with values from the closed enum: display, aggregate, redistribute.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV006',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'version is a supported spec version',
    rule: 'Supported versions span at most two MAJORs.',
    fix: 'Set version to a supported spec version. Consumers use it to decide how to read the rest.',
    specAnchor: `${SPEC}/8-versioning-and-conformance#8-1`,
    implemented: true,
  },
  {
    id: 'ENV007',
    family: 'envelope',
    severity: 'error',
    level: 'L2',
    title: 'Access-Control-Allow-Origin: * present',
    rule: 'The one non-obvious MUST: without it every browser-based consumer needs a proxy.',
    fix: 'Send Access-Control-Allow-Origin: * on the feed. Without it a browser client cannot read you at all.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV008',
    family: 'envelope',
    severity: 'warning',
    level: 'L2',
    title: 'ttl is a positive, plausible integer (1–86400)',
    rule: 'ttl is the caching contract; implausible values break polling consumers.',
    fix: 'Set ttl to a positive number of seconds between 1 and 86400. It is the caching contract, not a hint.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV009',
    family: 'envelope',
    severity: 'warning',
    level: 'L2',
    title: 'Feed ≤ 5 MB and ≤ 10 000 records, or shards declared',
    rule: 'Beyond the size guidance, publishers SHOULD shard by municipality and declare shards in the manifest.',
    fix: 'Shard the feed and declare the shards, or reduce it below 5 MB and 10 000 records.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'ENV010',
    family: 'envelope',
    severity: 'info',
    level: 'L2',
    title: 'Content-Type: application/json, UTF-8',
    rule: 'Transport hygiene.',
    fix: 'Serve the feed as application/json with UTF-8. A text/plain feed is one many clients will refuse.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },

  // ── Records (L2) ────────────────────────────────────────
  {
    id: 'REC001',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'last_confirmed_at KEY present on every record (null is legal)',
    rule: 'The confirmation key is REQUIRED; null is the honest "never confirmed". Omission is not.',
    fix: 'Include last_confirmed_at on every record. If nobody has confirmed it, publish null — that is the honest answer and consumers know what to do with it. Never invent one.',
    specAnchor: `${SPEC}/6-trust-and-verification#6-1`,
    implemented: true,
  },
  {
    id: 'REC002',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'id matches the {publisher_id}:{local_id} shape',
    rule: 'Record identity is {publisher_id}:{local_id} — globally unique with zero coordination.',
    fix: 'Use the {publisher_id}:{local_id} form for the record id, with your own publisher id.',
    specAnchor: `${SPEC}/5-identifiers#5-1`,
    implemented: true,
  },
  {
    id: 'REC003',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'No minting in another publisher’s namespace',
    rule: 'A publisher MUST NOT mint ids in another publisher’s namespace.',
    fix: 'Mint ids only in your own namespace. Reference another publisher’s record with same_as instead.',
    specAnchor: `${SPEC}/5-identifiers#5-1`,
    implemented: true,
  },
  {
    id: 'REC004',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'Locator rule: address_text OR lat+lon present',
    rule: 'A place you cannot locate directs no one.',
    fix: 'Give the record an address_text, or a lat and lon pair, or both. A place nobody can find is not a place.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC005',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'Both locators present (RECOMMENDED)',
    rule: 'Address and coordinates together survive more consumer contexts than either alone.',
    fix: 'Add the second locator. Coordinates and an address answer different questions for a person on the ground.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC006',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'public_url present and absolute',
    rule: 'Link-out is the contact mechanism — contact values never travel.',
    fix: 'Add an absolute public_url pointing at your own page for this place, so a consumer can hand the reader back to you.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-2`,
    implemented: true,
  },
  {
    id: 'REC007',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'place_kind within the enum',
    rule: 'The shared vocabulary is what makes crosswalks possible; unknown kinds use other + a namespaced extension.',
    fix: 'Use a place_kind from the enum, and put your own vocabulary in place_kind_ext alongside it.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC008',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'municipality_code is a valid DIVIPOLA code',
    rule: 'Territorial coding is DIVIPOLA; publishers keep their raw string in municipality_text.',
    fix: 'Use the official DIVIPOLA code for the municipality. The shape is five digits.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC009',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'source{} present with source_id',
    rule: 'Provenance is structured, never prose — attribution and chains depend on it.',
    fix: 'Add source with a source_id, so attribution survives every hop the record makes.',
    specAnchor: `${SPEC}/4-api-surface#4-3`,
    implemented: true,
  },
  {
    id: 'REC010',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'CR-2: name contains no operational-state token',
    rule: 'Names MUST NOT encode operational state — state belongs in lifecycle_status / service_status.',
    fix: 'Take the operational state out of the name and put it in service_status. A name that says CLOSED is a name that is wrong the moment it reopens.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC011',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'name and status fields do not contradict each other',
    rule: 'A record that says two things about its own state is a record a consumer cannot render honestly.',
    fix: 'Reconcile the name and the status fields. When they disagree a consumer has to guess, and it will guess wrong half the time.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC012',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'CR-1: updated_at is not a reused last_confirmed_at',
    rule: 'An edit is not a confirmation; the two timestamps do not interconvert.',
    fix: 'Set updated_at to when the row changed and last_confirmed_at to when a human verified it. Reusing one for the other tells consumers a place was checked when it was only edited.',
    specAnchor: `${SPEC}/6-trust-and-verification#6-1`,
    implemented: true,
  },
  {
    id: 'REC013',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'expires_at set on inherently temporary place kinds',
    rule: 'Temporary places SHOULD declare when they stop being true.',
    fix: 'Set expires_at on a place that is temporary by nature, so consumers can stop showing it without asking you.',
    specAnchor: `${SPEC}/6-trust-and-verification#6-2`,
    implemented: true,
  },
  {
    id: 'REC014',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'same_as entries are fully-qualified and one-hop',
    rule: 'same_as is a one-hop, non-transitive claim — never a transitive chain.',
    fix: 'Write same_as entries as fully-qualified {publisher_id}:{id} references, one hop only, and never as an authority claim.',
    specAnchor: `${SPEC}/5-identifiers#5-2`,
    implemented: true,
  },
  {
    id: 'REC015',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'Unknown members are preserved, never rejected',
    rule: 'Extensibility applies to the validator first: an unknown member MUST NOT fail validation.',
    fix: 'Preserve unknown members rather than dropping them. A field you do not understand may be the one another consumer needs.',
    specAnchor: `${SPEC}/8-versioning-and-conformance#8-4`,
    implemented: true,
  },
  {
    id: 'REC016',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'x_ extensions are namespaced x_{publisher}_{field}',
    rule: 'Namespaced extensions prevent two publishers colliding on one private field name.',
    fix: 'Namespace the extension as x_{publisher}_{field}, so two publishers can extend the same record without colliding.',
    specAnchor: `${SPEC}/8-versioning-and-conformance#8-4`,
    implemented: true,
  },
  {
    id: 'REC017',
    family: 'record',
    severity: 'warning',
    level: 'L2',
    title: 'es baseline present for localized strings',
    rule: 'es is the REQUIRED baseline for human-readable strings; en is RECOMMENDED.',
    fix: 'Provide the es baseline for the localized string. Spanish is the floor every consumer can rely on.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'REC018',
    family: 'record',
    severity: 'error',
    level: 'L2',
    title: 'No duplicate id within one feed',
    rule: 'Two records with one id make every downstream dedupe wrong.',
    fix: 'Remove the duplicate id. Two records with one id make every consumer’s merge non-deterministic.',
    specAnchor: `${SPEC}/5-identifiers#5-1`,
    implemented: true,
  },

  // ── PII (any level) ─────────────────────────────────────
  {
    id: 'PII001',
    family: 'pii',
    severity: 'error',
    level: 'L2',
    title: 'A contact value appears in any field, extensions included',
    rule: 'Contact values MUST NOT travel in feeds — namespaced extensions do not exempt them.',
    fix: 'Remove the contact value. Use contact_available to say that contact exists, and public_url to send the reader to you for it.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-2`,
    implemented: true,
  },
  {
    id: 'PII002',
    family: 'pii',
    severity: 'error',
    level: 'L2',
    title: 'confirmed_by is a role token, never a personal name',
    rule: 'confirmed_by ∈ team | volunteer | official_source | partner:{publisher_id}.',
    fix: 'Replace the personal name in confirmed_by with a role token: team, volunteer, official_source, or partner:{publisher_id}.',
    specAnchor: `${SPEC}/6-trust-and-verification#6-1`,
    implemented: true,
  },
  {
    id: 'PII003',
    family: 'pii',
    severity: 'error',
    level: 'L2',
    title: 'Free text matches a personal-data pattern',
    rule: 'Free text is the third leak channel: publishers MUST strip personal data from description / warning_text.',
    fix: 'Remove the personal data from the free text. The finding names the field and the pattern class, never the value it matched.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-1`,
    implemented: true,
  },
  {
    id: 'PII004',
    family: 'pii',
    severity: 'error',
    level: 'L2',
    title: 'A person-level entity appears',
    rule: 'Person-level data never federates — this is a join prohibition, not a field omission.',
    fix: 'Remove the person-level entity. Cabuya carries places; a person’s situation stays inside the application that owns it.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-1`,
    implemented: true,
  },
  {
    id: 'PII005',
    family: 'pii',
    severity: 'warning',
    level: 'L2',
    title: 'A field name matches the deny-list even if the value looks clean',
    rule: 'A field named for contact data will eventually carry it.',
    fix: 'Rename the field. A deny-listed name signals person-level data even when today’s values look clean, and the next row may not be.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-2`,
    implemented: true,
  },
  {
    id: 'PII006',
    family: 'pii',
    severity: 'error',
    level: 'L2',
    title: 'A moderation verdict about a third party is republished',
    rule: 'Moderation verdicts do not federate; suppressed records are omitted, never labelled downstream.',
    fix: 'Remove the moderation verdict. Republishing a judgement about a third party spreads it beyond anyone who can correct it.',
    specAnchor: `${SPEC}/7-normative-exclusions#7-3`,
    implemented: true,
  },

  // ── Behavior (L2) ───────────────────────────────────────
  {
    id: 'BEH001',
    family: 'behavior',
    severity: 'error',
    level: 'L2',
    title: 'Feed reachable on two probes; content-type stable',
    rule: 'A feed that answers differently on two probes cannot be consumed reliably.',
    fix: 'Serve the feed consistently. Two probes returning different content types means a consumer cannot cache you at all.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'BEH002',
    family: 'behavior',
    severity: 'error',
    level: 'L2',
    title:
      'Always-now: last_updated advances with the probe clock on identical content',
    rule: 'last_updated MUST be generated at build/publish time, never per request — a per-request timestamp is worse than no signal.',
    fix: 'Set last_updated to when the content actually changed. A timestamp that follows the clock makes every consumer refetch identical bytes forever.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'BEH003',
    family: 'behavior',
    severity: 'warning',
    level: 'L2',
    title: 'last_updated older than 7 × ttl (the stale badge state)',
    rule: 'Staleness is information, not failure — but it must be visible.',
    fix: 'Regenerate the feed, or raise ttl to match how often you really update. Stale beyond seven times your own ttl is a promise you are not keeping.',
    specAnchor: `${SPEC}/8-versioning-and-conformance#8-3`,
    implemented: true,
  },
  {
    id: 'BEH004',
    family: 'behavior',
    severity: 'warning',
    level: 'L2',
    title: 'Per-shard lastmod present (the incremental-sync pattern)',
    rule: 'A per-shard lastmod is working incremental sync at zero cost.',
    fix: 'Publish a lastmod per shard so consumers can fetch only what changed.',
    specAnchor: `${SPEC}/4-api-surface#4-4`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'BEH005',
    family: 'behavior',
    severity: 'error',
    level: 'L2',
    title: 'Declared shards reachable and envelope-consistent',
    rule: 'A declared shard that disagrees with its siblings breaks every consumer that trusts the manifest.',
    fix: 'Make every declared shard reachable and consistent with the envelope that declares it.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: false,
    plannedIn: 'Task 15',
  },

  // ── API (L3) ────────────────────────────────────────────
  {
    id: 'API001',
    family: 'api',
    severity: 'error',
    level: 'L3',
    title: 'Read API base reachable; envelope shape identical to the feed',
    rule: 'One schema, four transports.',
    fix: 'Serve the read API at the declared base with the same envelope shape as the static feed.',
    specAnchor: `${SPEC}/4-api-surface#4-1`,
    implemented: false,
    plannedIn: 'v0.2 (L3 checks — deferred from the walking skeleton)',
  },
  {
    id: 'API002',
    family: 'api',
    severity: 'error',
    level: 'L3',
    title:
      'Static ≡ API: the same record is byte-compatible from both surfaces',
    rule: 'The equivalence rule is what lets one schema serve four transports.',
    fix: 'Return byte-compatible records from the API and the feed. A consumer must not have to know which one it read.',
    specAnchor: `${SPEC}/3-the-feed#3-2`,
    implemented: false,
    plannedIn: 'Task 15',
  },
  {
    id: 'API003',
    family: 'api',
    severity: 'error',
    level: 'L3',
    title: 'cursor pagination ordered on a server sequence, not a timestamp',
    rule: 'Timestamp cursors silently drop offline-composed records that arrive late.',
    fix: 'Paginate on a server-side sequence rather than a timestamp. Timestamps collide and records get skipped.',
    specAnchor: `${SPEC}/4-api-surface#4-1`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'API004',
    family: 'api',
    severity: 'warning',
    level: 'L3',
    title: 'Documented query parameters accepted',
    rule: 'municipality, kind, bbox, updated_since, limit, cursor.',
    fix: 'Accept the documented query parameters, or remove them from the documentation.',
    specAnchor: `${SPEC}/4-api-surface#4-1`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'API005',
    family: 'api',
    severity: 'error',
    level: 'L3',
    title: 'CORS * on the API; no auth required for reads',
    rule: 'Reads are public by design.',
    fix: 'Serve the API with CORS * and no authentication for reads. Public-interest data behind a key is not public.',
    specAnchor: `${SPEC}/4-api-surface#4-1`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'API006',
    family: 'api',
    severity: 'info',
    level: 'L3',
    title: 'Consumes ≥ 1 peer feed (partly self-declared)',
    rule: 'L3 requires consuming as well as serving — the one requirement a probe cannot fully measure, so it is reported as info with the limitation stated.',
    fix: 'Consume at least one peer feed. The level is about interoperating, not only about publishing.',
    specAnchor: `${SPEC}/4-api-surface#4-3`,
    implemented: false,
    plannedIn: 'v0.2',
  },

  // ── Write (L4) ──────────────────────────────────────────
  {
    id: 'WRT001',
    family: 'write',
    severity: 'error',
    level: 'L4',
    title: 'POST accepts the {source, external_id, place} envelope',
    rule: 'The write envelope is fixed.',
    fix: 'Accept the {source, external_id, place} envelope on POST.',
    specAnchor: `${SPEC}/4-api-surface#4-2`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'WRT002',
    family: 'write',
    severity: 'error',
    level: 'L4',
    title: 'Idempotency on (source, external_id): a replay does not duplicate',
    rule: 'Re-sending is an upsert of the sender’s own contribution, never a duplicate.',
    fix: 'Make writes idempotent on (source, external_id). A replay after a timeout must not create a second record.',
    specAnchor: `${SPEC}/4-api-surface#4-2`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'WRT003',
    family: 'write',
    severity: 'error',
    level: 'L4',
    title: '409 on an id conflict outside the sender’s namespace',
    rule: 'Namespace discipline is enforced at the write boundary.',
    fix: 'Return 409 when a sender tries to write an id outside its own namespace.',
    specAnchor: `${SPEC}/4-api-surface#4-2`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'WRT004',
    family: 'write',
    severity: 'error',
    level: 'L4',
    title:
      'In auth:none mode, a moderation state is echoed and rate limiting is observable',
    rule: 'Open writes REQUIRE mitigations: rate limiting, a moderation queue, and an echoed state.',
    fix: 'Echo the moderation state and make rate limiting observable, so an unauthenticated sender knows what happened to its write.',
    specAnchor: `${SPEC}/4-api-surface#4-2`,
    implemented: false,
    plannedIn: 'v0.2',
  },
  {
    id: 'WRT005',
    family: 'write',
    severity: 'error',
    level: 'L4',
    title: 'Republished records carry source.source_id = the original sender',
    rule: 'The sender’s identity travels with the record forever.',
    fix: 'Keep source.source_id as the original sender when republishing. Attribution is the thing that must survive the hop.',
    specAnchor: `${SPEC}/4-api-surface#4-2`,
    implemented: false,
    plannedIn: 'v0.2',
  },

  // ── Licence hygiene ─────────────────────────────────────
  {
    id: 'LIC001',
    family: 'license',
    severity: 'warning',
    level: 'L2',
    title: 'Declared licence is not share-alike',
    rule: 'Share-alike licences poison aggregation for downstream consumers.',
    fix: 'Choose a licence that is not share-alike. A viral licence makes every aggregator’s whole dataset derivative, which is why most will not read you.',
    specAnchor: `${SPEC}/3-the-feed#3-1`,
    implemented: true,
  },
  {
    id: 'LIC002',
    family: 'license',
    severity: 'info',
    level: 'L2',
    title: 'attribution string present for aggregators to display',
    rule: 'Attribution is a consumption MUST; an explicit string makes it easy to honor.',
    fix: 'Add an attribution string for aggregators to display. Credit that travels with the data is the point of the network.',
    specAnchor: `${SPEC}/4-api-surface#4-3`,
    implemented: true,
  },
] as const;

const BY_ID = new Map(CHECKS.map((c) => [c.id, c]));

export function getCheck(id: string): CheckDefinition | undefined {
  return BY_ID.get(id);
}

export function checkIds(): string[] {
  return CHECKS.map((c) => c.id);
}

export function implementedChecks(): CheckDefinition[] {
  return CHECKS.filter((c) => c.implemented);
}

export function checksByFamily(family: CheckFamily): CheckDefinition[] {
  return CHECKS.filter((c) => c.family === family);
}
