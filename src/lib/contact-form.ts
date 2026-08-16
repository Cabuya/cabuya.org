/**
 * Shared contact / CFS / sponsorship intake validators and helpers.
 * Used by Svelte forms and mirrored by functions/api/contact.ts allowlists.
 */

export const MAX_SUBJECT_LENGTH = 140;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 120;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Canonical topic values (dropdown + API allowlist). */
export const CANONICAL_TOPICS = [
  'general',
  /** A foundation, company, municipality or community org offering capacity. */
  'organization',
  /** Institutional partnership. */
  'ally',
  'press',
  /** A problem with published information — wrong data, a delivery that does not add up. */
  'report',
  'conduct',
  'other',
] as const;

export type CanonicalTopic = (typeof CANONICAL_TOPICS)[number];

/** Legacy / alternate query values → canonical topic. */
export const TOPIC_ALIASES: Record<string, CanonicalTopic> = {
  general: 'general',
  organization: 'organization',
  org: 'organization',
  ally: 'ally',
  partner: 'ally',
  alliance: 'ally',
  press: 'press',
  media: 'press',
  report: 'report',
  conduct: 'conduct',
  coc: 'conduct',
  other: 'other',
  /*
   * Legacy values from the previous site. Kept so an old bookmarked link still
   * lands on a real topic instead of falling through to an empty selection.
   */
  sponsor: 'ally',
  sponsorship: 'ally',
  collaboration: 'ally',
  project: 'general',
  speaker: 'general',
  'tech-talk': 'general',
  cfs: 'general',
};

export interface ContactFormFields {
  name: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
  website?: string;
}

export interface ContactFormErrors {
  name: string;
  email: string;
  reason: string;
  subject: string;
  message: string;
}

export interface ConductReportFormFields {
  incidentDescription: string;
  incidentDate?: string;
  peopleInvolved?: string;
  anonymous: boolean;
  name?: string;
  email?: string;
  preferredFollowup?: string;
  website?: string;
}

export interface ConductReportFormErrors {
  incidentDescription: string;
  email: string;
}

export const emptyContactFormErrors = (): ContactFormErrors => ({
  name: '',
  email: '',
  reason: '',
  subject: '',
  message: '',
});

export function sanitizeContactText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function isValidContactEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/**
 * Normalize query/API topic strings. Accepts legacy `reason` aliases.
 */
export function normalizeTopic(raw: string | null | undefined): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return TOPIC_ALIASES[key] ?? key;
}

export function isCanonicalTopic(value: string): value is CanonicalTopic {
  return (CANONICAL_TOPICS as readonly string[]).includes(value);
}

export function resolveTopicFromSearchParams(
  params: URLSearchParams,
  allowed: Set<string>
): string {
  const raw = params.get('topic') ?? params.get('reason') ?? '';
  const normalized = normalizeTopic(raw);
  if (normalized && allowed.has(normalized)) return normalized;
  return '';
}

export function validateContactForm(
  fields: ContactFormFields,
  allowedReasons: Set<string>,
  messages: {
    requiredField: string;
    invalidEmail: string;
  }
): { valid: boolean; errors: ContactFormErrors } {
  const errors = emptyContactFormErrors();
  let valid = true;
  const reason = normalizeTopic(fields.reason);

  if (!fields.name.trim()) {
    errors.name = messages.requiredField;
    valid = false;
  }
  if (!fields.email.trim()) {
    errors.email = messages.requiredField;
    valid = false;
  } else if (!isValidContactEmail(fields.email)) {
    errors.email = messages.invalidEmail;
    valid = false;
  }
  if (!fields.subject.trim()) {
    errors.subject = messages.requiredField;
    valid = false;
  }
  if (!reason || !allowedReasons.has(reason)) {
    errors.reason = messages.requiredField;
    valid = false;
  }
  if (!fields.message.trim()) {
    errors.message = messages.requiredField;
    valid = false;
  }
  if (fields.website?.trim()) {
    valid = false;
  }

  return { valid, errors };
}

export function validateConductReportForm(
  fields: ConductReportFormFields,
  messages: { requiredField: string; invalidEmail: string }
): { valid: boolean; errors: ConductReportFormErrors } {
  const errors: ConductReportFormErrors = {
    incidentDescription: '',
    email: '',
  };
  let valid = true;

  if (
    !fields.incidentDescription.trim() ||
    fields.incidentDescription.trim().length < 20
  ) {
    errors.incidentDescription = messages.requiredField;
    valid = false;
  }

  if (!fields.anonymous) {
    const email = (fields.email || '').trim();
    if (!email) {
      errors.email = messages.requiredField;
      valid = false;
    } else if (!isValidContactEmail(email)) {
      errors.email = messages.invalidEmail;
      valid = false;
    }
  } else if (
    fields.email?.trim() &&
    !isValidContactEmail(fields.email.trim())
  ) {
    errors.email = messages.invalidEmail;
    valid = false;
  }

  if (fields.website?.trim()) {
    valid = false;
  }

  return { valid, errors };
}

/** Compose a CFS message body for legacy inbox / ack helpers. */
export type AckLang = 'en' | 'es';

export function pickAckCopy(
  topic: string,
  lang: AckLang
): { subject: string; text: string } {
  const t = normalizeTopic(topic) || 'general';

  if (lang === 'es') {
    const subjects: Record<string, string> = {
      organization: 'Recibimos tu mensaje — Corag',
      ally: 'Recibimos tu propuesta de alianza — Corag',
      press: 'Recibimos tu consulta de prensa — Corag',
      report: 'Recibimos tu reporte — Corag',
      conduct: 'Recibimos tu reporte — Corag',
      general: 'Recibimos tu mensaje — Corag',
    };
    const bodies: Record<string, string> = {
      organization:
        'Gracias por escribirnos. Te contactamos para entender qué puede aportar tu organización y cómo coordinarlo.\n\n— Corag',
      ally: 'Gracias por escribirnos. Te contactamos para hablar de la alianza y los siguientes pasos.\n\n— Corag',
      press:
        'Gracias por escribirnos. Revisamos tu consulta y respondemos lo antes posible.\n\n— Corag',
      report:
        'Gracias por reportarlo. Revisamos lo que nos cuentas.\n\nSi se trata de algo urgente que afecta a alguien ahora mismo, repórtalo también en la aplicación: https://ayuda.cabuya.org\n\n— Corag',
      conduct:
        'Gracias por escribirnos. Tu mensaje se trata de forma confidencial.\n\nSi hay riesgo inmediato para la integridad de alguien, contacta primero a las autoridades locales: este canal no es un servicio de emergencia.\n\n— Corag',
      general:
        'Gracias por escribirnos. Te respondemos tan pronto como podamos.\n\nSi lo que necesitas es pedir ayuda o aportar, eso ocurre en la aplicación: https://ayuda.cabuya.org\n\n— Corag',
    };
    return {
      subject: subjects[t] || subjects.general,
      text: bodies[t] || bodies.general,
    };
  }

  const subjects: Record<string, string> = {
    organization: 'We received your message — Corag',
    ally: 'We received your partnership enquiry — Corag',
    press: 'We received your press enquiry — Corag',
    report: 'We received your report — Corag',
    conduct: 'We received your report — Corag',
    general: 'We received your message — Corag',
  };
  const bodies: Record<string, string> = {
    organization:
      'Thanks for writing. We will get in touch to understand what your organization can offer and how to coordinate it.\n\n— Corag',
    ally: 'Thanks for writing. We will get in touch to discuss the partnership and next steps.\n\n— Corag',
    press:
      'Thanks for reaching out. We will review your enquiry and reply as soon as possible.\n\n— Corag',
    report:
      'Thanks for reporting it. We will review what you told us.\n\nIf this is urgent and affects someone right now, please also report it in the application: https://ayuda.cabuya.org\n\n— Corag',
    conduct:
      'Thanks for writing. Your message is handled confidentially.\n\nIf anyone is in immediate danger, contact your local emergency services first — this channel is not an emergency service.\n\n— Corag',
    general:
      'Thanks for writing. We will get back to you as soon as we can.\n\nIf what you need is to ask for help or contribute, that happens in the application: https://ayuda.cabuya.org\n\n— Corag',
  };
  return {
    subject: subjects[t] || subjects.general,
    text: bodies[t] || bodies.general,
  };
}

/** Simple sliding-window rate limit helper (pure; store is injected). */
export function checkRateLimit(
  store: Map<string, number[]>,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSec: number } {
  const cutoff = now - windowMs;
  const prior = (store.get(key) || []).filter((ts) => ts > cutoff);
  if (prior.length >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((prior[0] + windowMs - now) / 1000)
    );
    store.set(key, prior);
    return { allowed: false, retryAfterSec };
  }
  prior.push(now);
  store.set(key, prior);
  return { allowed: true, retryAfterSec: 0 };
}

export function looksLikeSpamPayload(fields: {
  name: string;
  message: string;
  website?: string;
}): boolean {
  if (fields.website?.trim()) return true;
  const urlPattern = /https?:\/\//gi;
  if (fields.name.match(urlPattern)?.length) return true;
  if ((fields.message.match(urlPattern) || []).length > 6) return true;
  return false;
}
