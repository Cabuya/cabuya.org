/**
 * Client-side validation for the ecosystem join form.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 2000;
const MAX_NAME = 120;

export const ECOSYSTEM_JOIN_CATEGORIES = [
  'matching',
  'damage',
  'logistics',
  'pets',
  'people',
  'other',
] as const;

export type EcosystemJoinCategory = (typeof ECOSYSTEM_JOIN_CATEGORIES)[number];

export interface EcosystemJoinFields {
  appName: string;
  appUrl: string;
  what: string;
  how: string;
  category: string;
  name: string;
  email: string;
  notes: string;
}

export type EcosystemJoinErrors = Partial<
  Record<keyof EcosystemJoinFields, string>
>;

export function emptyEcosystemJoinErrors(): EcosystemJoinErrors {
  return {};
}

export function sanitizeJoinText(value: string, max = MAX_TEXT): string {
  return value.trim().slice(0, max);
}

export function validateEcosystemJoinForm(
  fields: EcosystemJoinFields,
  messages: {
    required: string;
    email: string;
    url: string;
    category: string;
  }
): EcosystemJoinErrors {
  const errors: EcosystemJoinErrors = {};
  const appName = sanitizeJoinText(fields.appName, MAX_NAME);
  const appUrl = sanitizeJoinText(fields.appUrl, 500);
  const what = sanitizeJoinText(fields.what);
  const how = sanitizeJoinText(fields.how);
  const category = sanitizeJoinText(fields.category, 64);
  const name = sanitizeJoinText(fields.name, MAX_NAME);
  const email = sanitizeJoinText(fields.email, 254).toLowerCase();

  if (!appName) errors.appName = messages.required;
  if (!what) errors.what = messages.required;
  if (!how) errors.how = messages.required;
  if (!name) errors.name = messages.required;
  if (!email) errors.email = messages.required;
  else if (!EMAIL_RE.test(email)) errors.email = messages.email;

  if (!appUrl) errors.appUrl = messages.required;
  else {
    try {
      const u = new URL(appUrl);
      if (u.protocol !== 'https:') errors.appUrl = messages.url;
    } catch {
      errors.appUrl = messages.url;
    }
  }

  if (
    !category ||
    !(ECOSYSTEM_JOIN_CATEGORIES as readonly string[]).includes(category)
  ) {
    errors.category = messages.category;
  }

  return errors;
}
