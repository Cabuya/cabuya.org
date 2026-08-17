/**
 * The `/api/contact` contract, declared once and imported by both sides.
 *
 * Same argument as the validator's contract: the browser and the Pages
 * Function cannot drift, because a field renamed on one side stops compiling on
 * the other — and the validation rules are literally the same function, so the
 * form cannot accept something the server will reject or reject something it
 * would have accepted.
 *
 * ## What this form is, and what it is deliberately not
 *
 * One form. A standard needs an issue tracker and one honest inbox, and this is
 * the inbox. There is no conduct-report form: a report goes to the alias named
 * in the Code of Conduct, because a web form for that would put a report about
 * a maintainer through infrastructure the maintainers run.
 *
 * There is also no "we will reply within X" promise anywhere near it. The
 * 48-hour first-response target is stated for *issues*, where it is a
 * commitment the project made publicly and can be held to. Repeating it here
 * would extend a promise nobody made about email.
 */

/** Why someone is writing. Kept short — a long list is a list nobody reads. */
export const CONTACT_INTERESTS = [
  'implement',
  'consume',
  'contribute',
  'institutional',
  'other',
] as const;

export type ContactInterest = (typeof CONTACT_INTERESTS)[number];

export interface ContactRequest {
  /** Optional: somebody may prefer to write without naming themselves. */
  name?: string;
  /** Optional, and the more useful of the two — which application is asking. */
  organization?: string;
  email: string;
  message: string;
  interest: ContactInterest;
  lang: 'en' | 'es';
  /**
   * The honeypot. Named plausibly so a bot fills it and a person never sees it.
   * Any value at all means the submission is discarded — silently, with a 200,
   * because telling a bot it was caught is telling it how to try again.
   */
  website?: string;
  /**
   * Milliseconds between the form rendering and the submit.
   *
   * A person cannot read the labels, decide what to say and type a message in
   * under three seconds. A script can. This is not a security control — it is
   * free, and it removes the least sophisticated traffic before any of it
   * reaches the workspace of people trying to run an aid protocol.
   */
  elapsedMs?: number;
}

export type ContactFailureKind =
  /** A field is missing, too long, or not shaped like an email. */
  | 'invalid'
  /** Too many submissions from this address. */
  | 'rate-limited'
  /** No form is configured for this deployment — a fork, or local. */
  | 'not-configured'
  /** The upstream form service did not accept it. */
  | 'upstream'
  /** Ours. */
  | 'internal';

export type ContactResponse =
  | { ok: true }
  | { ok: false; kind: ContactFailureKind; field?: string };

export const CONTACT_ENDPOINT = '/api/contact';

/** Limits, in one place, so the form and the server enforce the same ones. */
export const CONTACT_LIMITS = {
  nameMax: 120,
  organizationMax: 120,
  emailMax: 254,
  messageMin: 20,
  messageMax: 2000,
  /** Below this, the submission is treated as automated. */
  minElapsedMs: 3_000,
  /** Per IP, per hour. Generous for a person, useless for a script. */
  perIpPerHour: 5,
} as const;

/**
 * Email shape, checked loosely on purpose.
 *
 * The only email validation that is correct is sending a message to it. A
 * strict pattern rejects real addresses — plus-addressing, new TLDs, unusual
 * local parts — and every rejection is somebody who wanted to reach us and
 * could not. This catches the typo and lets everything else through.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationFailure {
  field: keyof ContactRequest;
  /** A translation key, not a message: the copy lives with the other copy. */
  reason: 'required' | 'too-long' | 'too-short' | 'invalid';
}

/**
 * Validate a submission. Runs on both sides, unchanged.
 *
 * Returns every problem rather than the first, so a form can mark all the
 * fields at once instead of making somebody submit four times to learn four
 * things.
 */
export function validateContact(
  input: Partial<ContactRequest>
): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const trimmed = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

  const name = trimmed(input.name);
  if (name.length > CONTACT_LIMITS.nameMax) {
    failures.push({ field: 'name', reason: 'too-long' });
  }

  const organization = trimmed(input.organization);
  if (organization.length > CONTACT_LIMITS.organizationMax) {
    failures.push({ field: 'organization', reason: 'too-long' });
  }

  const email = trimmed(input.email);
  if (email.length === 0) {
    failures.push({ field: 'email', reason: 'required' });
  } else if (email.length > CONTACT_LIMITS.emailMax) {
    failures.push({ field: 'email', reason: 'too-long' });
  } else if (!EMAIL.test(email)) {
    failures.push({ field: 'email', reason: 'invalid' });
  }

  const message = trimmed(input.message);
  if (message.length === 0) {
    failures.push({ field: 'message', reason: 'required' });
  } else if (message.length < CONTACT_LIMITS.messageMin) {
    failures.push({ field: 'message', reason: 'too-short' });
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    failures.push({ field: 'message', reason: 'too-long' });
  }

  if (
    !input.interest ||
    !CONTACT_INTERESTS.includes(input.interest as ContactInterest)
  ) {
    failures.push({ field: 'interest', reason: 'invalid' });
  }

  return failures;
}

/**
 * Does this submission look automated?
 *
 * Separate from validation because the *response* differs. An invalid
 * submission gets told what to fix; an automated one gets a 200 and is
 * discarded, because an error message is feedback a script can iterate against.
 */
export function looksAutomated(input: Partial<ContactRequest>): boolean {
  if (typeof input.website === 'string' && input.website.trim().length > 0) {
    return true;
  }
  return (
    typeof input.elapsedMs === 'number' &&
    input.elapsedMs >= 0 &&
    input.elapsedMs < CONTACT_LIMITS.minElapsedMs
  );
}
