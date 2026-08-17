/**
 * The `/api/validate` contract, declared once and imported by both sides.
 *
 * The browser sends this shape and the Pages Function (Task 27) answers with
 * it. Writing it here rather than in the Function means the UI can be built and
 * tested against the contract before the Function exists — and, more usefully,
 * that the two cannot drift: a field renamed on one side stops compiling on the
 * other.
 *
 * ## The distinction the whole thing exists to preserve
 *
 * A response says either "we measured your document" or "we could not reach
 * it", and never blurs the two. The CLI encodes that as exit code 1 versus 3;
 * here it is the `ok` discriminant. An agent that treats a DNS failure as a
 * data error will rewrite correct records, and a person who sees "invalid" when
 * their host was briefly down will go looking for a bug that is not there.
 */
import type { Report } from '@cabuya/validator';

/** What the browser posts. */
export interface ValidateRequest {
  /** Absolute https URL of a manifest or a feed. */
  url: string;
  /**
   * What the caller believes it is. The server verifies rather than trusts —
   * this only decides which checks attribute their findings, and getting it
   * wrong should produce a clear message, not a wrong one.
   */
  kind?: 'manifest' | 'feed' | 'auto';
  /** Report language. Ids, pointers and links never translate. */
  lang?: 'en' | 'es';
}

/** A completed measurement. The document was fetched and checked. */
export interface ValidateSuccess {
  ok: true;
  report: Report;
}

/**
 * Why a run did not produce a measurement.
 *
 * Deliberately not merged into the report: an empty findings list means "we
 * looked and found nothing wrong", and a failed fetch must never be able to
 * render as that.
 */
export type ValidateFailureKind =
  /** DNS, TLS, timeout, connection refused, a redirect loop. */
  | 'transport'
  /** Reached it, and what came back is not JSON. */
  | 'parse'
  /** The URL is not something we will fetch — scheme, host, or private range. */
  | 'rejected'
  /** Too many requests from this caller. */
  | 'rate-limited'
  /** Our fault. */
  | 'internal';

export interface ValidateFailure {
  ok: false;
  kind: ValidateFailureKind;
  /** One sentence, already user-facing, in the requested language. */
  message: string;
  /** Present when the failure carries a status worth showing. */
  status?: number;
}

export type ValidateResponse = ValidateSuccess | ValidateFailure;

/** Where the Function lives. One string, so a move is one edit. */
export const VALIDATE_ENDPOINT = '/api/validate';

/**
 * Client-side URL screening.
 *
 * The server does this again, properly, and its version is the one that
 * matters — this is not a security boundary and must not be mistaken for one.
 * It exists so an obvious mistake gets an instant, specific answer instead of a
 * round trip and a generic one.
 */
export function screenUrl(
  input: string
): { ok: true } | { ok: false; reason: string } {
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: false, reason: 'empty' };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'not-a-url' };
  }

  if (url.protocol !== 'https:') return { ok: false, reason: 'not-https' };
  if (!url.hostname.includes('.')) return { ok: false, reason: 'not-a-host' };
  return { ok: true };
}

/** Type guard, so callers branch on the discriminant rather than on shape. */
export function isSuccess(
  response: ValidateResponse
): response is ValidateSuccess {
  return response.ok;
}
