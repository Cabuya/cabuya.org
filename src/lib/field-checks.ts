/**
 * Which validator checks fire on which field.
 *
 * This is the cross-link that closes the agent loop. An agent reads a schema
 * reference row, sees `REC001`, follows it to the check page, and gets the rule
 * and the fix in the same vocabulary the validator's own output uses. Without
 * it, the reference tells you a field exists and the validator tells you it is
 * wrong, and nothing connects the two.
 *
 * ## Why a mapping and not a field on the check
 *
 * The checks catalogue lives in the validator package and is the source of
 * truth for ids, rules, severities and levels. It does not carry field paths,
 * because a check like ENV007 (CORS) is about a response header and has no
 * field at all — putting a nullable `field` on every check to serve one
 * consumer would be the website's concern leaking into the protocol's tooling.
 *
 * So: the ids come from the package, and the association is here. The test
 * asserts every id in this map is a real check, which is the half that actually
 * rots — a renamed id would otherwise leave a dead link on the reference page.
 */
import { CHECKS } from '@cabuya/validator';

/** Field path (as `schema-reference.ts` renders it) → check ids. */
const FIELD_CHECKS: Record<string, string[]> = {
  // ── Envelope ────────────────────────────────────────────
  last_updated: ['ENV001', 'ENV002'],
  ttl: ['ENV001', 'ENV006'],
  version: ['ENV001', 'ENV008'],
  publisher_id: ['ENV001', 'ENV009'],
  license: ['ENV001', 'ENV003', 'ENV004'],
  permitted_use: ['ENV005'],
  'data.places': ['ENV001'],

  // ── Record ──────────────────────────────────────────────
  'data.places[].id': ['REC002', 'REC003'],
  'data.places[].publisher_id': ['REC003'],
  'data.places[].name': ['REC010', 'REC012'],
  'data.places[].place_kind': ['REC004'],
  'data.places[].place_kind_ext': ['REC005'],
  'data.places[].municipality_code': ['REC006'],
  'data.places[].lat': ['REC007'],
  'data.places[].lon': ['REC007'],
  'data.places[].lifecycle_status': ['REC008'],
  'data.places[].service_status': ['REC009', 'REC011'],
  'data.places[].updated_at': ['REC013'],
  'data.places[].last_confirmed_at': ['REC001', 'REC014', 'BEH002'],
  'data.places[].confirmed_by': ['REC015', 'PII005'],
  'data.places[].source': ['REC016'],
  'data.places[].public_url': ['REC017'],
  /*
   * There is no `contact` field and no `notes` field, and their absence is the
   * protocol rather than an omission: §7 excludes person-level data by a join
   * prohibition, so the schema carries `contact_available` — a boolean saying
   * that contact exists behind the publisher's own link — and free text lives
   * in `description`, where the PII patterns scan for values that should not
   * have been put there.
   */
  'data.places[].contact_available': ['PII001', 'PII002'],
  'data.places[].description': ['PII003', 'PII004'],
  'data.places[].address_text': ['PII004'],

  // ── Manifest ────────────────────────────────────────────
  'protocol.name': ['DSC005'],
  'protocol.spec_version': ['DSC005'],
  'publisher.publisher_id': ['DSC005'],
  'publisher.canonical_url': ['DSC005'],
  conformance_target: ['DSC005'],
  feeds: ['DSC005'],
};

const KNOWN = new Set(CHECKS.map((check) => check.id));

/**
 * Check ids for a field, filtered to ids that exist.
 *
 * Filtering rather than throwing: a stale id here should not take the whole
 * reference page down, and the test below fails on it loudly enough. A dead
 * link is worse than a missing one, so the row simply shows fewer checks.
 */
export function checksForField(path: string): string[] {
  return (FIELD_CHECKS[path] ?? []).filter((id) => KNOWN.has(id));
}

/** Every id this module claims, for the guard test. */
export function mappedCheckIds(): string[] {
  return [...new Set(Object.values(FIELD_CHECKS).flat())].sort();
}

/** Every field path this module claims, for the guard test. */
export function mappedFieldPaths(): string[] {
  return Object.keys(FIELD_CHECKS).sort();
}

/** Where a check id is documented. Task 26 builds the page; the anchor is fixed. */
export function checkHref(id: string, prefix = ''): string {
  return `${prefix}/developers/validator/checks#${id}`;
}
