/**
 * Pass 5 — SEMANTIC.
 *
 * The rules a JSON Schema cannot express. Each check is a small pure
 * function over the parsed document; the pass runs them all and concatenates
 * (no short-circuit — the fix loop wants the full list).
 *
 * Everything here is content-only: no transport, no probes. The behavioral
 * counterparts (soft-404, always-now, CORS) live in the behavior pass and
 * are skipped in degraded mode.
 */

import { getCheck } from '../checks.js';
import type { Pass, PassContext } from '../engine.js';
import { locatePointer, pointer } from '../locate.js';
import type { Finding, SuggestedPatch } from '../report.js';

// ── shared helpers ────────────────────────────────────────

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Build a finding from the catalogue + the per-instance detail. */
export function make(
  id: string,
  ptr: string,
  message: string,
  fix: string,
  raw?: string,
  patch?: SuggestedPatch
): Finding {
  const check = getCheck(id);
  if (!check) throw new Error(`unknown check id ${id}`);
  return {
    id,
    severity: check.severity,
    level: check.level,
    pointer: ptr,
    location: raw ? locatePointer(raw, ptr) : undefined,
    message,
    rule: check.rule,
    fix,
    ...(patch ? { suggested_patch: patch } : {}),
    spec: check.specAnchor,
    docs: `https://cabuya.org/developers/validator/checks#${id}`,
  };
}

/** Fold accents and case so vocabulary matching is not defeated by tildes. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Operational-state tokens that must never appear in a place `name` (CR-2).
 *
 * Observed verbatim in production feeds. Matched on folded word boundaries
 * so "Cerrado"/"cerrada"/"CERRADO" all fire and "Centro Cerrada del Norte"
 * — a proper name containing one — is still caught, which is intended: the
 * publisher should move the state, and a false positive here is cheap to
 * dismiss while a false negative ships a lie into every consumer's UI.
 */
export const STATE_TOKENS = [
  'cerrado',
  'cerrada',
  'lleno',
  'llena',
  'abierto',
  'abierta',
  'inactivo',
  'inactiva',
  'suspendido',
  'suspendida',
  'closed',
  'full',
  'open',
  'inactive',
  'paused',
] as const;

const SPDX_LIKE = /^[A-Za-z0-9.+-]+$/;
const SHARE_ALIKE = /(-SA\b|GPL|CC-BY-SA|ODbL)/i;
/** The highest spec MAJOR this build validates (spec §8.1's window). */
export const SUPPORTED_MAJOR = 0;

const PERMITTED_USE = new Set([
  'display',
  'aggregate',
  'redistribute',
  'ai_answer',
  'ai_train',
]);

// ── envelope checks ───────────────────────────────────────

export function envelopeChecks(doc: Json, raw?: string): Finding[] {
  const findings: Finding[] = [];

  const lastUpdated = doc.last_updated;
  if (
    typeof lastUpdated === 'string' &&
    !/(Z|[+-]\d{2}:\d{2})$/.test(lastUpdated)
  ) {
    findings.push(
      make(
        'ENV002',
        pointer('last_updated'),
        'envelope.last_updated has no UTC offset — the generation time is ambiguous',
        'Emit RFC 3339 with an explicit offset, e.g. "2026-08-16T04:00:00Z".',
        raw
      )
    );
  }

  const license = doc.license;
  if (typeof license === 'string') {
    if (!SPDX_LIKE.test(license) && !doc.license_url) {
      findings.push(
        make(
          'ENV004',
          pointer('license'),
          'envelope.license is not an SPDX identifier and no license_url accompanies it',
          'Use an SPDX id (e.g. "CC-BY-4.0"), or add "license_url" pointing at the licence text.',
          raw
        )
      );
    }
    if (SHARE_ALIKE.test(license)) {
      findings.push(
        make(
          'LIC001',
          pointer('license'),
          'envelope.license is share-alike, which restricts how aggregators may republish this data',
          'Prefer a permissive licence (CC-BY-4.0, CC0-1.0) so downstream aggregation stays possible; keep share-alike only if that restriction is intended.',
          raw
        )
      );
    }
  }

  const permitted = doc.permitted_use;
  if (permitted === undefined) {
    findings.push(
      make(
        'ENV005',
        '',
        'envelope.permitted_use is absent — consumers cannot tell what reuse you consent to',
        'Add "permitted_use": ["display", "aggregate"] (or the subset you intend).',
        raw,
        { op: 'add', path: '/permitted_use', value: ['display'] }
      )
    );
  } else if (Array.isArray(permitted)) {
    permitted.forEach((value, index) => {
      if (typeof value !== 'string' || !PERMITTED_USE.has(value)) {
        findings.push(
          make(
            'ENV005',
            pointer('permitted_use', index),
            'envelope.permitted_use contains a value outside the closed enum',
            'Use only: display | aggregate | redistribute | ai_answer | ai_train.',
            raw
          )
        );
      }
    });
  }

  // ENV006 — the supported-version window (two MAJORs, spec §8.1)
  const version = doc.version;
  if (typeof version === 'string') {
    const major = Number(version.split('.')[0]);
    if (!Number.isNaN(major) && major > SUPPORTED_MAJOR) {
      findings.push(
        make(
          'ENV006',
          pointer('version'),
          `envelope.version declares spec ${version}, which this validator does not support (it validates up to ${SUPPORTED_MAJOR}.x)`,
          `Publish a version this validator understands, or upgrade the validator — supported versions span at most two MAJORs.`,
          raw
        )
      );
    }
  }

  const ttl = doc.ttl;
  if (typeof ttl === 'number' && (ttl <= 0 || ttl > 86400)) {
    findings.push(
      make(
        'ENV008',
        pointer('ttl'),
        `envelope.ttl is implausible (${ttl}) — consumers derive their polling interval from it`,
        'Use a positive value in seconds, typically 60–3600 for live data.',
        raw
      )
    );
  }

  const places = placesOf(doc);
  if (places.length > 10000) {
    findings.push(
      make(
        'ENV009',
        pointer('data', 'places'),
        `feed carries ${places.length} records, beyond the 10 000-record guidance`,
        'Shard by DIVIPOLA municipality and declare the shards in the manifest feeds[].',
        raw
      )
    );
  }

  if (typeof doc.attribution !== 'string') {
    findings.push(
      make(
        'LIC002',
        '',
        'envelope carries no attribution string for aggregators to display',
        'Add "attribution": "<how you want to be credited>" so consumers can honor the attribution rule automatically.',
        raw
      )
    );
  }

  return findings;
}

// ── record checks ─────────────────────────────────────────

function placesOf(doc: Json): Json[] {
  const data = doc.data;
  if (!isObject(data)) return [];
  const places = data.places;
  return Array.isArray(places) ? places.filter(isObject) : [];
}

/** Localized strings may be a plain string (= es) or a [{text, language}] array. */
function hasEsBaseline(value: unknown): boolean {
  if (typeof value === 'string') return true;
  if (!Array.isArray(value)) return true; // absent/other shapes: not our check
  return value.some(
    (entry) =>
      isObject(entry) &&
      typeof entry.language === 'string' &&
      entry.language.toLowerCase().startsWith('es')
  );
}

function plainText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .filter(isObject)
      .map((entry) => (typeof entry.text === 'string' ? entry.text : ''))
      .join(' ');
  }
  return '';
}

export function recordChecks(doc: Json, raw?: string): Finding[] {
  const findings: Finding[] = [];
  const places = placesOf(doc);
  const envelopePublisher =
    typeof doc.publisher_id === 'string' ? doc.publisher_id : undefined;
  const seenIds = new Map<string, number>();

  places.forEach((place, index) => {
    const at = (...rest: (string | number)[]) =>
      pointer('data', 'places', index, ...rest);

    // REC001 — the confirmation key (schema catches omission; this catches
    // the subtler case of an empty string standing in for null).
    if (place.last_confirmed_at === '') {
      findings.push(
        make(
          'REC001',
          at('last_confirmed_at'),
          'last_confirmed_at is an empty string, which is neither a timestamp nor an honest null',
          'Use null for "never confirmed", or the timestamp of the last real confirmation.',
          raw,
          { op: 'replace', path: at('last_confirmed_at'), value: null }
        )
      );
    }

    // REC002/REC003 — identity and namespace
    const recordPublisher = place.publisher_id;
    if (typeof recordPublisher === 'string' && envelopePublisher) {
      if (recordPublisher !== envelopePublisher) {
        findings.push(
          make(
            'REC003',
            at('publisher_id'),
            `record claims publisher "${recordPublisher}" inside a feed published by "${envelopePublisher}"`,
            'A publisher MUST NOT mint ids in another publisher’s namespace. Republish foreign records with your own id and keep the origin in source{}.',
            raw
          )
        );
      }
    }
    const id = place.id;
    if (typeof id === 'string') {
      const qualified = `${String(recordPublisher ?? envelopePublisher ?? '')}:${id}`;
      const previous = seenIds.get(qualified);
      if (previous !== undefined) {
        findings.push(
          make(
            'REC018',
            at('id'),
            `duplicate record id — the same qualified id also appears at index ${previous}`,
            'Give every record a distinct local id; two records with one id make every downstream dedupe wrong.',
            raw
          )
        );
      } else {
        seenIds.set(qualified, index);
      }
      if (id.includes(':')) {
        findings.push(
          make(
            'REC002',
            at('id'),
            'record id contains ":" — the qualifier is composed from publisher_id + id, not embedded in it',
            'Store only your local id here; consumers build {publisher_id}:{id} themselves.',
            raw
          )
        );
      }
    }

    // REC004/REC005 — the locator rule
    const hasAddress =
      typeof place.address_text === 'string' &&
      place.address_text.trim() !== '';
    const hasCoords =
      typeof place.lat === 'number' && typeof place.lon === 'number';
    if (!hasAddress && !hasCoords) {
      findings.push(
        make(
          'REC004',
          at(),
          'record has neither address_text nor lat+lon — a place nobody can locate directs nobody',
          'Add address_text, or lat and lon (both are RECOMMENDED).',
          raw
        )
      );
    } else if (!hasAddress || !hasCoords) {
      findings.push(
        make(
          'REC005',
          at(),
          `record carries only ${hasCoords ? 'coordinates' : 'an address'} — consumers that need the other cannot render it`,
          'Publish address_text AND lat+lon; both are RECOMMENDED.',
          raw
        )
      );
    }

    // REC008 — DIVIPOLA
    if (place.municipality_code === null && !place.municipality_text) {
      findings.push(
        make(
          'REC008',
          at('municipality_code'),
          'municipality_code is null and no municipality_text accompanies it',
          'Publish the DIVIPOLA code, or keep your raw string in municipality_text so the territory is at least stated.',
          raw
        )
      );
    }

    // REC010 — CR-2: state must not live in the name
    const name = plainText(place.name);
    const folded = fold(name);
    const token = STATE_TOKENS.find((t) =>
      new RegExp(`\\b${t}\\b`).test(folded)
    );
    if (token) {
      findings.push(
        make(
          'REC010',
          at('name'),
          `operational state token detected in name ('${token}') — move it to service_status/lifecycle_status (CR-2)`,
          'Keep names stable and human; publish state in lifecycle_status (active|closed|planned|unknown) and service_status (open|full|paused|unknown).',
          raw
        )
      );

      // REC011 — the name and the status fields disagreeing outright
      const closedish = [
        'cerrado',
        'cerrada',
        'closed',
        'inactivo',
        'inactiva',
      ];
      if (closedish.includes(token) && place.lifecycle_status === 'active') {
        findings.push(
          make(
            'REC011',
            at(),
            'the name says the place is closed while lifecycle_status says "active"',
            'Make the record say one thing: fix the status, or remove the state from the name.',
            raw
          )
        );
      }
    }

    // REC012 — CR-1: an edit is not a confirmation
    if (
      typeof place.updated_at === 'string' &&
      typeof place.last_confirmed_at === 'string' &&
      place.updated_at === place.last_confirmed_at
    ) {
      findings.push(
        make(
          'REC012',
          at('last_confirmed_at'),
          'last_confirmed_at is byte-identical to updated_at — an edit is not a confirmation (CR-1)',
          'Set last_confirmed_at only when someone actually confirmed the place; leave it null otherwise.',
          raw
        )
      );
    }

    // REC013 — temporary kinds should expire
    const temporary = ['collection_center', 'distribution_point', 'info_point'];
    if (
      typeof place.place_kind === 'string' &&
      temporary.includes(place.place_kind) &&
      place.expires_at === undefined
    ) {
      findings.push(
        make(
          'REC013',
          at(),
          `a ${place.place_kind} is inherently temporary but carries no expires_at`,
          'Set expires_at so consumers stop showing it when it stops being true.',
          raw
        )
      );
    }

    // REC014 — same_as is one-hop and fully qualified
    if (Array.isArray(place.same_as)) {
      place.same_as.forEach((claim, claimIndex) => {
        if (typeof claim !== 'string') return;
        if (!claim.includes(':')) {
          findings.push(
            make(
              'REC014',
              at('same_as', claimIndex),
              'same_as entry is not a fully-qualified {publisher_id}:{id} claim',
              'Use the fully-qualified form; same_as claims are one-hop and non-transitive.',
              raw
            )
          );
        }
        if (
          envelopePublisher &&
          claim.startsWith(`${envelopePublisher}:`) &&
          claim === `${envelopePublisher}:${String(place.id)}`
        ) {
          findings.push(
            make(
              'REC014',
              at('same_as', claimIndex),
              'same_as points at the record itself',
              'Remove the self-reference; same_as links to a peer’s record.',
              raw
            )
          );
        }
      });
    }

    // REC016 — extension namespacing
    for (const key of Object.keys(place)) {
      if (key.startsWith('x_') && key.split('_').length < 3) {
        findings.push(
          make(
            'REC016',
            at(key),
            `extension "${key}" is not namespaced as x_{publisher}_{field}`,
            `Rename it to x_${envelopePublisher ?? '{publisher}'}_${key.slice(2)} so two publishers cannot collide on one private field.`,
            raw
          )
        );
      }
    }

    // REC017 — the es baseline
    for (const field of ['name', 'description'] as const) {
      if (place[field] !== undefined && !hasEsBaseline(place[field])) {
        findings.push(
          make(
            'REC017',
            at(field),
            `localized ${field} carries no "es" entry — es is the REQUIRED baseline`,
            'Add an {text, language: "es"} entry (en is RECOMMENDED alongside).',
            raw
          )
        );
      }
    }
  });

  return findings;
}

export const semanticPass: Pass = {
  name: 'semantic',
  run(context: PassContext): Finding[] {
    if (!isObject(context.document)) return [];
    // Manifests are validated by the schema pass at this stage; the semantic
    // rules below are feed rules (the manifest's own semantic checks are
    // transport-dependent and live in the behavior pass).
    if ('protocol' in context.document) return [];
    return [
      ...envelopeChecks(context.document, context.raw),
      ...recordChecks(context.document, context.raw),
    ];
  },
};
