/**
 * Pass 6 — DENY (PII).
 *
 * The protocol's hardest line, made executable: person-level data never
 * federates, contact values never travel, free text is the third leak
 * channel (spec §7.1–7.3).
 *
 * **The non-echo rule is absolute.** A finding names the pointer and the
 * *pattern class* it matched — never the matched value. A PII finding that
 * echoed a phone number would leak it into a public CI log, an issue
 * tracker and an agent transcript, which is precisely the harm this pass
 * exists to prevent. Every message here is written to be useful without the
 * value, and a sentinel test asserts the value never appears in a
 * serialized report.
 *
 * The pattern set is exported because the agent skill vendors the same
 * semantics for its human-gated deny-list — one definition, two consumers.
 */

import type { Pass, PassContext } from '../engine.js';
import { pointer } from '../locate.js';
import type { Finding } from '../report.js';
import { make } from './semantic.js';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// ── the pattern set ───────────────────────────────────────

/** Field names that carry contact or person data, in both languages. */
export const DENY_KEYS: readonly string[] = [
  'name_person',
  'nombre',
  'nombres',
  'apellido',
  'apellidos',
  'phone',
  'telefono',
  'teléfono',
  'celular',
  'movil',
  'móvil',
  'whatsapp',
  'wa',
  'email',
  'correo',
  'mail',
  'cedula',
  'cédula',
  'documento',
  'dni',
  'nit_persona',
  'direccion_casa',
  'foto',
  'photo',
  'contacto',
  'contact_phone',
  'contact_email',
  'responsable',
  'encargado',
  'beneficiario',
  'beneficiary',
  'victima',
  'víctima',
  'desaparecido',
  'missing_person',
];

/** Value patterns. Each carries the CLASS name that appears in findings. */
export const DENY_PATTERNS: readonly { class: string; re: RegExp }[] = [
  {
    class: 'email-address',
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  },
  {
    class: 'colombian-mobile',
    re: /(?<!\d)(?:\+?57[\s.-]?)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/,
  },
  {
    class: 'intl-phone',
    re: /\+\d{1,3}[\s.-]?\d{2,4}[\s.-]?\d{3}[\s.-]?\d{3,4}/,
  },
  { class: 'whatsapp-link', re: /(?:wa\.me|api\.whatsapp\.com)\/[\d+]/i },
  {
    class: 'national-id',
    re: /(?<!\d)(?:C\.?C\.?|cédula|cedula)\s*[:#]?\s*\d{6,12}(?!\d)/i,
  },
];

/**
 * A personal name heuristic for FREE TEXT only: two or more consecutive
 * capitalized words that are not sentence-initial and not a known place
 * word. Deliberately conservative — it fires alongside a contact pattern
 * (name + phone proximity), never on capitalization alone, because a
 * false PII accusation against a publisher is its own kind of harm.
 */
const NAME_LIKE = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/;

/** The legal `confirmed_by` grammar (spec §6.1). */
export const ROLE_TOKEN =
  /^(team|volunteer|official_source|partner:[a-z0-9][a-z0-9-]{1,62}[a-z0-9])$/;

/** Keys whose values are person-level entities by definition. */
const PERSON_ENTITY_KEYS = [
  'missing_persons',
  'desaparecidos',
  'people',
  'personas',
  'beneficiaries',
  'beneficiarios',
  'cases',
  'casos',
  'victims',
  'victimas',
];

/** Fields that carry a foreign moderation verdict. */
const VERDICT_KEYS = [
  'moderation',
  'moderacion',
  'verdict',
  'veredicto',
  'informacion_falsa',
  'flagged_as',
];

/** Free-text fields the spec names as the third leak channel. */
const FREE_TEXT_FIELDS = [
  'description',
  'warning_text',
  'notes',
  'observaciones',
];

// ── helpers ───────────────────────────────────────────────

const normalizeKey = (key: string): string =>
  key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^x_[a-z0-9-]+_/, '') // look through namespaced extensions
    .replace(/[^a-z_]/g, '');

function matchClass(value: string): string | undefined {
  for (const { class: cls, re } of DENY_PATTERNS) {
    if (re.test(value)) return cls;
  }
  return undefined;
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

/** Walk every string in a record, yielding [pointerSegments, value]. */
function* strings(
  value: unknown,
  path: (string | number)[] = []
): Generator<[(string | number)[], string]> {
  if (typeof value === 'string') {
    yield [path, value];
  } else if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      yield* strings(item, [...path, index]);
  } else if (isObject(value)) {
    for (const [key, item] of Object.entries(value))
      yield* strings(item, [...path, key]);
  }
}

// ── the checks ────────────────────────────────────────────

export function denyChecks(doc: Json, raw?: string): Finding[] {
  const findings: Finding[] = [];
  const data = doc.data;
  const places =
    isObject(data) && Array.isArray(data.places)
      ? data.places.filter(isObject)
      : [];

  // PII004 — a person-level entity at the envelope level.
  for (const key of Object.keys(doc)) {
    if (PERSON_ENTITY_KEYS.includes(normalizeKey(key))) {
      findings.push(
        make(
          'PII004',
          pointer(key),
          `the feed carries a person-level collection ("${key}") — person data does not federate`,
          'Remove it. People-domain data is link-out only: point at the official channels (Cruz Roja RCF for missing persons, Registro Único/UNGRD for affected people) instead.',
          raw
        )
      );
    }
  }
  if (isObject(data)) {
    for (const key of Object.keys(data)) {
      if (PERSON_ENTITY_KEYS.includes(normalizeKey(key))) {
        findings.push(
          make(
            'PII004',
            pointer('data', key),
            `the feed carries a person-level collection ("${key}") — person data does not federate`,
            'Remove it. People-domain data is link-out only (spec §7.1).',
            raw
          )
        );
      }
    }
  }

  places.forEach((place, index) => {
    const at = (...rest: (string | number)[]) =>
      pointer('data', 'places', index, ...rest);

    // PII002 — confirmed_by must be a role token.
    const confirmedBy = place.confirmed_by;
    if (typeof confirmedBy === 'string' && !ROLE_TOKEN.test(confirmedBy)) {
      findings.push(
        make(
          'PII002',
          at('confirmed_by'),
          'must be a role token (team|volunteer|official_source|partner:{id}), never a personal name',
          'Replace it with the role that confirmed the place: team, volunteer, official_source, or partner:{publisher_id}.',
          raw,
          { op: 'replace', path: at('confirmed_by'), value: 'team' }
        )
      );
    }

    // PII006 — republished moderation verdicts.
    for (const key of Object.keys(place)) {
      if (VERDICT_KEYS.includes(normalizeKey(key))) {
        const source = isObject(place.source)
          ? place.source.source_id
          : undefined;
        const foreign = source !== undefined && source !== doc.publisher_id;
        if (foreign) {
          findings.push(
            make(
              'PII006',
              at(key),
              `a moderation verdict about another publisher's record is being republished ("${key}")`,
              'Omit suppressed records instead of labelling them. A foreign verdict republished without appeal is a defamation-shaped risk (spec §7.3).',
              raw
            )
          );
        }
      }
    }

    // PII001 / PII005 — contact values and deny-listed field names,
    // everywhere in the record INCLUDING namespaced extensions.
    for (const [path, value] of strings(place)) {
      const ptr = at(...path);
      const key = String(path[path.length - 1] ?? '');
      const normalized = normalizeKey(key);
      const isFreeText = FREE_TEXT_FIELDS.includes(normalized);
      // confirmed_by is PII002's business; free text is PII003's.
      if (normalized === 'confirmed_by' || isFreeText) continue;
      // public_url is the sanctioned link-out and never a violation.
      if (normalized === 'public_url' || normalized === 'source_url') continue;

      const cls = matchClass(value);
      if (cls) {
        findings.push(
          make(
            'PII001',
            ptr,
            `contact values MUST NOT travel in feeds (use contact_available + public_url) — matched pattern class: ${cls}, value not echoed`,
            'Remove the value. Publish contact_available: true and let public_url carry the reader to your own page, where contact is fetched on demand.',
            raw,
            { op: 'remove', path: ptr }
          )
        );
      } else if (DENY_KEYS.includes(normalized)) {
        findings.push(
          make(
            'PII005',
            ptr,
            `field name "${key}" is on the contact/person deny-list even though its current value looks clean`,
            'Rename or remove the field — a field named for contact data will eventually carry it.',
            raw
          )
        );
      }
    }

    // PII003 — free text: the third leak channel.
    for (const field of FREE_TEXT_FIELDS) {
      const value = plainText(place[field]);
      if (!value) continue;
      const cls = matchClass(value);
      const named = NAME_LIKE.test(value);
      if (cls && named) {
        findings.push(
          make(
            'PII003',
            at(field),
            'possible personal data detected (name+phone pattern) — strip before publishing',
            'Remove the person’s name and contact details from the free text; link out with public_url instead.',
            raw
          )
        );
      } else if (cls) {
        findings.push(
          make(
            'PII003',
            at(field),
            `possible contact data detected in free text (pattern class: ${cls}, value not echoed) — strip before publishing`,
            'Remove contact details from the free text; contact never travels in a feed (spec §7.2).',
            raw
          )
        );
      }
    }
  });

  return findings;
}

export const denyPass: Pass = {
  name: 'deny',
  run(context: PassContext): Finding[] {
    if (!isObject(context.document)) return [];
    if ('protocol' in context.document) return [];
    return denyChecks(context.document, context.raw);
  },
};
