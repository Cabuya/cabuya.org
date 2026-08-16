/**
 * Shared helpers for POSTing form responses to the DailyBot Forms public API.
 *
 * Corag has three public intakes — contact, conduct report, and ecosystem app
 * request — each mapped to one DailyBot form in the Corag org. Form and
 * question UUIDs are baked in here; the only runtime secret is `DAILYBOT_API_KEY`.
 *
 * API contract:
 *   POST https://api.dailybot.com/v1/forms/{form_uuid}/responses/
 *   Header: X-API-KEY: ${DAILYBOT_API_KEY}
 *   Body:   { "content": { "<question_uuid>": <value> }, "automation": true }
 *
 * Multiple-choice note (verified Task 3 smoke): this org's GET payload returns
 * `choices[].value` equal to the label (e.g. "General"). POSTing the slugified
 * label ("general") fails with ["response is not valid"]. Choice lookups
 * therefore resolve aliases → canonical **label**, not slugify(label).
 */

// ────────────────────────────────────────────────────────────────────────────
// Form identifiers (Corag org — baked in; only the API key stays in env)
// ────────────────────────────────────────────────────────────────────────────

export interface DailyBotFormConfig {
  uuid: string;
  q: Record<string, string>;
}

export type IntakeForm = 'contact' | 'conduct' | 'ecosystem';

/** Corag — Contact (`a467e863-…`). */
export const CONTACT_FORM_UUID = 'a467e863-e808-4e7e-97f6-173ab512cb96';

/** Corag — Code of Conduct report (`cf0b575b-…`). */
export const CONDUCT_FORM_UUID = 'cf0b575b-8d49-4b3c-822a-4eafd9dbc3ee';

/** Corag — Ecosystem app request (`9b51bedd-…`). */
export const ECOSYSTEM_FORM_UUID = '9b51bedd-d8ef-428d-8c1b-36fc78d37336';

export const CONTACT_FORM: DailyBotFormConfig = {
  uuid: CONTACT_FORM_UUID,
  q: {
    NAME: '98e5abf3-d984-4177-8876-fdfceac55b0c',
    EMAIL: 'ddd1d374-54ab-4bb6-80a1-c805038c0548',
    TOPIC: '016c0453-4754-4154-ac32-22f0a1f66a13',
    SUBJECT: 'fa754422-6f49-4c02-8512-8b01e5c21a13',
    MESSAGE: '87a71695-0de4-4f30-89a1-8ca7a7cb31b9',
    LANG: '4f3172a3-7bb1-4103-aa87-0f01cb9317a3',
    PAGE_PATH: 'b1d7a7f9-803c-4cf7-a712-e81bcd1b0379',
  },
};

export const CONDUCT_FORM: DailyBotFormConfig = {
  uuid: CONDUCT_FORM_UUID,
  q: {
    INCIDENT: '4ac6b4e4-a11c-4e25-94a1-9cc6209b2bd1',
    WHEN: 'c12c9e6f-80b2-408e-bcfd-56733e475fdf',
    PEOPLE: '819259fd-f307-4e57-9cc9-96ae11a18790',
    ANONYMOUS: 'efbc4ca8-90f3-452b-a436-a38253aa1f61',
    REPORTER_NAME: '5d163446-3099-46ef-9daa-34af11300363',
    REPORTER_EMAIL: '2adb6f0f-2dfe-4041-a565-39e3c4bbd0bd',
    FOLLOWUP: '0884b869-aa00-40bc-9f2e-20e19c4c7e5f',
    LANG: '3b3663d7-6b6c-48f9-9d8a-0d990fd4e781',
    PAGE_PATH: '5f5badd2-66c2-488f-a2a4-e757bd5941ae',
  },
};

export const ECOSYSTEM_FORM: DailyBotFormConfig = {
  uuid: ECOSYSTEM_FORM_UUID,
  q: {
    APP_NAME: '76c53af1-cdd2-4dca-8375-f2cd165e2eeb',
    APP_URL: 'd140ab1b-e4f0-4d49-9fcb-568526f54a2a',
    WHAT: '71359860-43ee-476e-866d-d9c8362ace5f',
    HOW: '51b7f190-c2c8-495c-a54f-b519a9ba0d0d',
    CATEGORY: '4144639d-5c2d-4642-baca-2c61aa231964',
    CONTACT_NAME: 'f1d55b91-273d-497f-aec7-b978b8414912',
    CONTACT_EMAIL: '58b6e36f-1285-4c22-b2e8-fcbcdb8cc521',
    NOTES: '57d567f1-5695-4f14-8543-71c32aa38cd9',
    LANG: '1d0375a2-3394-47be-9d84-40475c49f691',
    PAGE_PATH: '0cf25afc-cab2-4f55-bddb-3cf22ac282b4',
  },
};

const INTAKE_FORMS: Record<IntakeForm, DailyBotFormConfig> = {
  contact: CONTACT_FORM,
  conduct: CONDUCT_FORM,
  ecosystem: ECOSYSTEM_FORM,
};

/** Return the baked-in DailyBot form + question map for an intake. */
export function getFormConfig(form: IntakeForm): DailyBotFormConfig {
  return INTAKE_FORMS[form];
}

// ────────────────────────────────────────────────────────────────────────────
// Page path normalization
// ────────────────────────────────────────────────────────────────────────────

const PAGE_PATH_MAX_LEN = 200;

export function normalizePagePath(input: unknown): string {
  if (typeof input !== 'string') return '/';
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > PAGE_PATH_MAX_LEN) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Slugify (kept for tests / cross-org docs; Corag MC POSTs use labels)
// ────────────────────────────────────────────────────────────────────────────

export function slugify(label: string): string {
  const lower = label.normalize('NFKC').toLowerCase();
  const stripped = lower.replace(/[^\p{L}\p{N}\s_-]/gu, '');
  const collapsed = stripped.replace(/[-\s]+/g, '-');
  return collapsed.replace(/^[-_]+|[-_]+$/g, '');
}

// ────────────────────────────────────────────────────────────────────────────
// Choice lookups — aliases → canonical DailyBot value (label for this org)
// ────────────────────────────────────────────────────────────────────────────

interface ChoiceGroup {
  readonly aliases: readonly string[];
}

function normalizeLabel(label: string): string {
  return label
    .normalize('NFKC')
    .replace(/[–—―]/g, '-')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build alias → canonical DailyBot value map.
 * First alias is the GET `choices[].value` / label for this org.
 */
function buildChoiceLookup(
  groups: readonly ChoiceGroup[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of groups) {
    const canonical = group.aliases[0];
    for (const alias of group.aliases) {
      out[normalizeLabel(alias)] = canonical;
    }
  }
  return out;
}

export function lookupChoice(
  label: string | undefined,
  lookup: Record<string, string>
): string | undefined | null {
  if (!label) return undefined;
  const value = lookup[normalizeLabel(label)];
  return value ?? null;
}

/** Map site `lang` (`es`/`en`) and labels to DailyBot Language choices. */
export const LANG_VALUES = buildChoiceLookup([
  { aliases: ['Spanish', 'es', 'español', 'espanol'] },
  { aliases: ['English', 'en', 'inglés', 'ingles'] },
]);

/**
 * Corag's contact topics. The labels must match the choices configured on the
 * DailyBot form exactly — this org's API rejects slugified labels.
 */
export const CONTACT_TOPIC_VALUES = buildChoiceLookup([
  { aliases: ['General', 'general'] },
  { aliases: ['Organization', 'organization', 'org', 'organización'] },
  { aliases: ['Ally', 'ally', 'partner', 'alliance', 'aliado', 'alianza'] },
  { aliases: ['Press', 'press', 'media', 'prensa'] },
  { aliases: ['Report', 'report', 'reporte'] },
  { aliases: ['Conduct', 'conduct', 'coc', 'código de conducta', 'codigo de conducta'] },
  { aliases: ['Other', 'other', 'otro'] },
]);

/** Ecosystem join-form categories — labels must match the DailyBot choices. */
export const ECOSYSTEM_CATEGORY_VALUES = buildChoiceLookup([
  {
    aliases: [
      'Direct aid matching',
      'matching',
      'ayuda directa',
      'direct aid',
    ],
  },
  {
    aliases: [
      'Damage and reports',
      'damage',
      'daños',
      'danos',
      'damage and reports',
    ],
  },
  {
    aliases: [
      'Collection and logistics',
      'logistics',
      'acopio',
      'collection and logistics',
    ],
  },
  { aliases: ['Pets', 'pets', 'mascotas'] },
  {
    aliases: [
      'People reunification',
      'people',
      'personas',
      'people reunification',
    ],
  },
  { aliases: ['Other', 'other', 'otro'] },
]);

/**
 * Boolean Dailybot questions require JSON `true` / `false` (not "Yes"/"No").
 * Verified against the DailyBot conduct form (2026-08 audit).
 */
export function booleanToDailyBot(
  value: boolean | string | undefined
): boolean {
  if (typeof value === 'boolean') return value;
  const n = normalizeLabel(String(value ?? ''));
  if (['yes', 'true', '1', 'si', 'sí'].includes(n)) return true;
  if (['no', 'false', '0'].includes(n)) return false;
  return false;
}

// ────────────────────────────────────────────────────────────────────────────
// Fetch wrapper
// ────────────────────────────────────────────────────────────────────────────

export type DailyBotSubmissionError =
  | 'AUTH'
  | 'INVALID_CHOICE'
  | 'MISSING_REQUIRED'
  | 'UNREACHABLE'
  | 'UNKNOWN';

export type DailyBotSubmissionResult =
  | { ok: true; uuid: string }
  | {
      ok: false;
      error: DailyBotSubmissionError;
      status: number;
      detail?: string;
    };

export interface DailyBotEnv {
  DAILYBOT_API_KEY?: string;
}

const BASE_URL = 'https://api.dailybot.com/v1/forms/';

/**
 * POST a form response to DailyBot. Never logs `apiKey`.
 * Always submits with `automation: true`.
 */
export async function submitFormResponse(
  formUuid: string,
  content: Record<string, unknown>,
  env: DailyBotEnv
): Promise<DailyBotSubmissionResult> {
  const apiKey = env.DAILYBOT_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'AUTH', status: 503, detail: 'missing_api_key' };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${formUuid}/responses/`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, automation: true }),
    });
  } catch (err) {
    console.error('[dailybot] network error', err);
    return { ok: false, error: 'UNREACHABLE', status: 502 };
  }

  if (response.status === 201) {
    const data = (await response.json().catch(() => ({}))) as { uuid?: string };
    if (!data.uuid) {
      return {
        ok: false,
        error: 'UNKNOWN',
        status: 502,
        detail: 'missing_uuid_in_response',
      };
    }
    return { ok: true, uuid: data.uuid };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: 'AUTH', status: 502 };
  }

  const rawBody = await response.text().catch(() => '');
  const detail = classifyDailyBotError(rawBody);

  if (detail === 'INVALID_CHOICE' || detail === 'MISSING_REQUIRED') {
    return { ok: false, error: detail, status: 400 };
  }

  // Do not log response bodies — Dailybot may echo submitted content (incl. CoC).
  console.error('[dailybot] unexpected error', response.status, detail);
  return { ok: false, error: 'UNKNOWN', status: 502 };
}

function classifyDailyBotError(
  rawBody: string
): DailyBotSubmissionError | null {
  if (!rawBody) return null;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (Array.isArray(parsed) && parsed.includes('response is not valid')) {
      return 'INVALID_CHOICE';
    }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as { code?: string }).code === 'all_responses_are_required'
    ) {
      return 'MISSING_REQUIRED';
    }
  } catch {
    // Non-JSON error body
  }
  return null;
}
