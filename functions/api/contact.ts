/**
 * `POST /api/contact` — the project's one inbox, bridged to DailyBot Forms.
 *
 * A standard needs an issue tracker and one honest place to write to. This is
 * the second thing. Everything about it is deliberately small: one form, one
 * upstream, no attachments, no database, no reply-tracking.
 *
 * ## What it keeps
 *
 * Nothing. The submission is validated, forwarded, and forgotten with the
 * request. The only thing written anywhere is an anonymous per-IP counter with
 * a one-hour TTL, which is the same control the validator endpoint uses and for
 * the same reason: to stop a script, not to build a record.
 *
 * That matters more here than it looks. The message field is free text, a
 * person writing to an aid protocol may put something sensitive in it, and the
 * safest place for that text is nowhere. It goes to the maintainers' workspace
 * and passes through here without being stored, logged or measured.
 *
 * ## When it is not configured
 *
 * A fork, a preview deployment, a laptop: no token, no form id. The endpoint
 * answers **503 `not-configured`** and the page renders the alternatives — the
 * issue tracker, the repository — rather than a form that silently swallows
 * what somebody wrote. A form that accepts a message and drops it is worse than
 * no form, because the person believes they have been heard.
 */
import type { KvReadWrite, PagesContext } from '../lib/pages-runtime';

import type {
  ContactFailureKind,
  ContactRequest,
} from '../../src/lib/contact-contract';
import {
  CONTACT_LIMITS,
  looksAutomated,
  validateContact,
} from '../../src/lib/contact-contract';

interface Env {
  /**
   * DailyBot API key, and the form and question ids of the target form.
   *
   * The question ids are configuration rather than code: they belong to a
   * workspace this repository does not own, and baking them in would mean a
   * fork inheriting identifiers pointing at somebody else's form. `QUESTIONS`
   * is a JSON object mapping our field names to question uuids.
   */
  DAILYBOT_API_KEY?: string;
  DAILYBOT_FORM_ID?: string;
  DAILYBOT_FORM_QUESTIONS?: string;
  /** The same namespace the validator's rate counters live in. */
  VALIDATE_RATE?: KvReadWrite;
}

const DAILYBOT_FORMS = 'https://api.dailybot.com/v1/forms';

/** A submission takes as long as it takes; the upstream call does not. */
const UPSTREAM_TIMEOUT_MS = 8_000;

const json = (
  body: unknown,
  status: number,
  extra: Record<string, string> = {}
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Nothing about a submission may be cached by anything.
      'Cache-Control': 'no-store',
      ...extra,
    },
  });

const failure = (
  kind: ContactFailureKind,
  status: number,
  field?: string,
  extra?: Record<string, string>
): Response => json({ ok: false, kind, field }, status, extra);

/**
 * Per-IP rate limit.
 *
 * The key is constructed inline from a fixed prefix, the same discipline the
 * validator endpoint follows: a key passed in as a variable is a key a grep
 * cannot verify, and a grep is what stops this endpoint quietly growing a
 * second thing it writes.
 */
async function checkRate(
  kv: KvReadWrite | undefined,
  ip: string
): Promise<boolean> {
  if (!kv) return true;

  const current = Number((await kv.get(`rate:ip:contact:${ip}`)) ?? '0');
  if (current >= CONTACT_LIMITS.perIpPerHour) return false;

  /*
   * The key is written out at the call rather than held in a variable. It
   * reads as duplication and is not: `retention:check` greps this file for KV
   * writes and can only verify a literal, so a variable key is exactly how a
   * write to somewhere else would slip past the gate. The validator endpoint
   * learned this the same way — by the gate refusing the tidier version.
   */
  await kv.put(`rate:ip:contact:${ip}`, String(current + 1), {
    expirationTtl: 3600,
  });
  return true;
}

/** The upstream payload: our field names mapped onto the form's question ids. */
function buildContent(
  input: ContactRequest,
  questions: Record<string, string>
): Record<string, unknown> {
  const content: Record<string, unknown> = {};
  const set = (field: string, value: unknown): void => {
    const uuid = questions[field];
    if (uuid && value !== undefined && value !== '') content[uuid] = value;
  };

  set('email', input.email.trim());
  set('message', input.message.trim());
  set('interest', input.interest);
  set('lang', input.lang);
  set('name', input.name?.trim());
  set('organization', input.organization?.trim());
  return content;
}

export const onRequestPost = async (
  context: PagesContext<Env>
): Promise<Response> => {
  const { request, env } = context;

  const token = env.DAILYBOT_API_KEY;
  const formId = env.DAILYBOT_FORM_ID;
  const questionsRaw = env.DAILYBOT_FORM_QUESTIONS;

  /*
   * The configuration check runs *before* the body is read. A deployment with
   * no form must not accept a message it cannot deliver, and reading the body
   * first would mean holding somebody's text in memory for no reason.
   */
  if (!token || !formId || !questionsRaw) {
    return failure('not-configured', 503);
  }

  let questions: Record<string, string>;
  try {
    questions = JSON.parse(questionsRaw) as Record<string, string>;
  } catch {
    // Our misconfiguration, not the sender's. It reads as unconfigured
    // because from the sender's side that is exactly what it is.
    return failure('not-configured', 503);
  }

  let input: Partial<ContactRequest>;
  try {
    input = (await request.json()) as Partial<ContactRequest>;
  } catch {
    return failure('invalid', 400, 'message');
  }

  /*
   * The honeypot and the timing check come before validation, and answer 200.
   * An error tells a script what to change; a success tells it nothing and
   * costs it a retry it will not make.
   */
  if (looksAutomated(input)) return json({ ok: true }, 200);

  const failures = validateContact(input);
  if (failures.length > 0) {
    return failure('invalid', 400, failures[0].field);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!(await checkRate(env.VALIDATE_RATE, ip))) {
    return failure('rate-limited', 429, undefined, { 'Retry-After': '3600' });
  }

  const submission = input as ContactRequest;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${DAILYBOT_FORMS}/${formId}/responses/`, {
      method: 'POST',
      headers: {
        'X-API-KEY': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: buildContent(submission, questions),
        automation: true,
      }),
      signal: controller.signal,
    });

    // 201 is the documented success. Anything else is reported as upstream
    // rather than swallowed: the sender needs to know their message did not
    // arrive, and the alternatives on the page are still there.
    if (response.status !== 201) return failure('upstream', 502);
    return json({ ok: true }, 200);
  } catch {
    return failure('upstream', 502);
  } finally {
    clearTimeout(timer);
  }
};

/** Anything but POST. Stated, rather than falling through to a 404. */
export const onRequest = async (
  context: PagesContext<Env>
): Promise<Response> => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return failure('invalid', 405, undefined, { Allow: 'POST' });
};
