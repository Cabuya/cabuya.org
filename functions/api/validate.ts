/**
 * `POST /api/validate` — the one endpoint that fetches a URL a stranger gave us.
 *
 * Read `functions/lib/ssrf-guard.ts` before changing anything here. That file
 * explains what this endpoint is for, why it cannot be done in a browser, and
 * exactly which part of the protection is structural and which part is the
 * platform's.
 *
 * ## What this stores
 *
 * Two integers. `rate:ip:{ip}` and `rate:host:{host}`, both with a TTL. No
 * feed bodies, no URLs, no findings, no analytics event carrying anything a
 * publisher submitted. A validator that quietly kept the documents people
 * checked would be a validator nobody in this network should use, and the
 * cheapest way to guarantee that is to have nowhere to put them.
 *
 * There is deliberately no logging in this file. `scripts/check-no-retention.
 * mjs` fails the build on a `console.*` call here, because the usual way a
 * zero-retention promise breaks is a debug line somebody left in.
 *
 * ## Politeness
 *
 * The validator is pointed at volunteers' servers, often during an emergency.
 * It sends a User-Agent that names the project and links to a page explaining
 * what it does, it sends no Referer, it caps itself at 60 requests per hour
 * per host, and it never retries. A tool that hammers the infrastructure it is
 * trying to help has failed at its own purpose.
 */
import {
  bundledSchemas,
  denyPass,
  Engine,
  schemaPass,
  semanticPass,
  SPEC_VERSION,
  summaryPhrase,
  translateFinding,
} from '@cabuya/validator';

import { assertAllowedUrl, REJECTION_MESSAGES } from '../lib/ssrf-guard';

interface Env {
  /** KV namespace holding only the two rate counters. */
  VALIDATE_RATE?: KVNamespace;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

interface PagesContext {
  request: Request;
  env: Env;
}

// ── Limits, all in one place ──────────────────────────────

const LIMITS = {
  /** Per fetch. A server that has not answered in 8 seconds is not going to. */
  requestTimeoutMs: 8_000,
  /** Per validation run, across every hop and feed. */
  runBudgetMs: 25_000,
  /** Hard cap on a fetched document. Streaming aborts past it. */
  maxBytes: 5 * 1024 * 1024,
  /** Redirects followed, each re-guarded. */
  maxRedirects: 3,
  /** Validations per minute, per caller. */
  perIpPerMinute: 10,
  /** Requests per hour to any single probed host, across all callers. */
  perHostPerHour: 60,
} as const;

const USER_AGENT =
  'CabuyaValidator/0.1 (+https://cabuya.org/developers/validator/probe)';

/** No caching, anywhere, ever. */
const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  /*
   * No Access-Control-Allow-Origin, on purpose.
   *
   * The protocol requires feeds to send `ACAO: *` so browsers can read them.
   * This endpoint is the opposite case: its only legitimate client is our own
   * page, and an open CORS policy would turn it into a free SSRF proxy for
   * any site that wanted one. The two rules point in opposite directions
   * because they are protecting different things.
   */
  'X-Content-Type-Options': 'nosniff',
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extra },
  });
}

function failure(
  kind: string,
  message: string,
  status = 400,
  extra: Record<string, string> = {}
) {
  return json({ ok: false, kind, message }, status, extra);
}

// ── Rate limiting ─────────────────────────────────────────

/**
 * A fixed-window counter, which is the honest thing to build on KV.
 *
 * A sliding window needs either a read-modify-write per request or a durable
 * object; KV is eventually consistent, so a burst arriving at two edges can
 * exceed the limit briefly. That is acceptable for a politeness control and it
 * is stated rather than implied — this exists to stop a volunteer's server
 * being hammered, not to stop a determined attacker, who has other options.
 */
async function checkRate(
  kv: KVNamespace | undefined,
  scope: 'ip' | 'host',
  subject: string,
  limit: number,
  ttlSeconds: number
): Promise<{ ok: boolean; retryAfter: number }> {
  if (!kv) return { ok: true, retryAfter: 0 };

  /*
   * The key is built here, from a two-value scope, rather than passed in as a
   * string. `retention:check` greps this file for KV writes and can only
   * verify a key it can see — a variable key is precisely how a write to
   * somewhere else would slip past it. Constructing it inline makes the
   * `rate:` prefix a property of the code rather than of the caller's
   * discipline.
   */
  const key = `rate:${scope}:${subject}`;
  const current = Number((await kv.get(key)) ?? '0');
  if (current >= limit) return { ok: false, retryAfter: ttlSeconds };

  await kv.put(`rate:${scope}:${subject}`, String(current + 1), {
    expirationTtl: ttlSeconds,
  });
  return { ok: true, retryAfter: 0 };
}

// ── Fetching, with every hop re-guarded ───────────────────

interface FetchOutcome {
  ok: boolean;
  status?: number;
  contentType?: string;
  body?: string;
  bytes?: number;
  /** Set when the fetch failed rather than the document being wrong. */
  transportError?: string;
  /** Set when a redirect hop was refused. */
  guardError?: string;
  headers?: Record<string, string>;
}

/**
 * Fetch a document, following redirects manually so each hop is re-guarded.
 *
 * `redirect: 'manual'` is the whole point. With automatic following, a 302 to
 * `https://169.254.169.254/` is followed inside `fetch` and the guard never
 * sees it — the check on the initial URL becomes decorative.
 */
async function guardedFetch(
  initialUrl: URL,
  deadline: number
): Promise<FetchOutcome> {
  let target = initialUrl;

  for (let hop = 0; hop <= LIMITS.maxRedirects; hop += 1) {
    if (Date.now() > deadline) {
      return { ok: false, transportError: 'The run took too long.' };
    }

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(LIMITS.requestTimeoutMs, deadline - Date.now())
    );

    let response: Response;
    try {
      response = await fetch(target.href, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json, text/plain;q=0.5, */*;q=0.1',
          // No Referer: where the request came from is nobody's business, and
          // it would leak that a specific publisher is being checked.
        },
      });
    } catch (error) {
      clearTimeout(timer);
      return {
        ok: false,
        transportError:
          error instanceof Error && error.name === 'AbortError'
            ? 'The request timed out.'
            : 'The request failed before any response arrived.',
      };
    }
    clearTimeout(timer);

    // A redirect: re-guard the destination before going anywhere near it.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        return { ok: false, transportError: 'A redirect with no destination.' };
      }
      const next = new URL(location, target.href).href;
      const guard = assertAllowedUrl(next);
      if (!guard.allowed || !guard.url) {
        return {
          ok: false,
          guardError:
            REJECTION_MESSAGES[guard.reason ?? 'not-a-url'] ??
            'That redirect goes somewhere the validator will not follow.',
        };
      }
      target = guard.url;
      continue;
    }

    // Read with a hard byte cap, aborting the stream rather than buffering
    // whatever a host decides to send.
    const reader = response.body?.getReader();
    if (!reader) {
      return {
        ok: true,
        status: response.status,
        contentType: response.headers.get('content-type') ?? undefined,
        body: '',
        bytes: 0,
        headers: headerMap(response),
      };
    }

    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > LIMITS.maxBytes) {
        await reader.cancel();
        return {
          ok: false,
          transportError:
            'The document is larger than 5 MB. Shard the feed and declare the shards.',
        };
      }
      chunks.push(value);
    }

    const merged = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return {
      ok: true,
      status: response.status,
      contentType: response.headers.get('content-type') ?? undefined,
      body: new TextDecoder().decode(merged),
      bytes,
      headers: headerMap(response),
    };
  }

  return {
    ok: false,
    transportError: `More than ${LIMITS.maxRedirects} redirects.`,
  };
}

/** The response headers the behaviour checks care about. Nothing else is kept. */
function headerMap(response: Response): Record<string, string> {
  const wanted = [
    'content-type',
    'access-control-allow-origin',
    'cache-control',
    'etag',
    'last-modified',
  ];
  const out: Record<string, string> = {};
  for (const name of wanted) {
    const value = response.headers.get(name);
    if (value) out[name] = value;
  }
  return out;
}

// ── The handler ───────────────────────────────────────────

export const onRequestPost = async (
  context: PagesContext
): Promise<Response> => {
  const started = Date.now();
  const deadline = started + LIMITS.runBudgetMs;

  let payload: { url?: string; lang?: string };
  try {
    payload = (await context.request.json()) as typeof payload;
  } catch {
    return failure('parse', 'The request body is not JSON.', 400);
  }

  const guard = assertAllowedUrl(payload.url ?? '');
  if (!guard.allowed || !guard.url) {
    return failure(
      'rejected',
      REJECTION_MESSAGES[guard.reason ?? 'not-a-url'],
      400
    );
  }

  // Per-caller, then per-host. The second one protects the publisher, and it
  // applies across all callers rather than per caller — a hundred people
  // checking one feed is still a hundred requests to that feed.
  const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown';
  const perIp = await checkRate(
    context.env.VALIDATE_RATE,
    'ip',
    ip,
    LIMITS.perIpPerMinute,
    60
  );
  if (!perIp.ok) {
    return failure(
      'rate-limited',
      'Too many validations from here in the last minute. Try again shortly.',
      429,
      { 'Retry-After': String(perIp.retryAfter) }
    );
  }

  const perHost = await checkRate(
    context.env.VALIDATE_RATE,
    'host',
    guard.url.hostname,
    LIMITS.perHostPerHour,
    3600
  );
  if (!perHost.ok) {
    return failure(
      'rate-limited',
      'That host has been checked many times in the last hour. The validator limits itself so it never becomes a burden on the server it is inspecting.',
      429,
      { 'Retry-After': String(perHost.retryAfter) }
    );
  }

  const outcome = await guardedFetch(guard.url, deadline);

  if (outcome.guardError) {
    return failure('rejected', outcome.guardError, 400);
  }
  if (!outcome.ok) {
    return failure(
      'transport',
      outcome.transportError ??
        'The request failed. This says nothing about your data.',
      502
    );
  }

  // ── Measure ─────────────────────────────────────────────
  let document: unknown;
  try {
    document = JSON.parse(outcome.body ?? '');
  } catch {
    return failure(
      'parse',
      'The document was fetched, but it is not valid JSON, so no checks ran.',
      422
    );
  }

  /*
   * The document kind is not taken from the request. The schema pass infers it
   * from the document's own shape — a `protocol` key means a manifest — which
   * is the fix Task 15 made after manifest errors were being reported with
   * feed-envelope check ids. A caller that mislabels its document would
   * otherwise be sent to the wrong documentation for every finding.
   */
  const engine = new Engine({
    validatorVersion: 'api',
    specVersion: SPEC_VERSION,
    target: guard.url.href,
    schemas: bundledSchemas(),
    /*
     * No fetcher is passed, so the engine runs in degraded mode and skips the
     * transport passes rather than running them against nothing. The transport
     * observations this endpoint *can* make — CORS, content type — arrive with
     * the behaviour pass in a later change; reporting a measured level without
     * them would be exactly the overclaim the whole project exists to avoid.
     */
  });
  engine.register(schemaPass, semanticPass, denyPass);

  const raw = await engine.run(document, outcome.body);
  const lang = payload.lang === 'es' ? 'es' : 'en';
  const report =
    lang === 'es'
      ? {
          ...raw,
          findings: raw.findings.map((finding) =>
            translateFinding(finding, 'es')
          ),
        }
      : raw;

  return json({
    ok: true,
    report,
    summary: summaryPhrase(report),
    /*
     * What we saw at the transport layer, for the page to show. Deliberately
     * not stored: it is computed, returned, and forgotten with the request.
     */
    transport: {
      status: outcome.status,
      contentType: outcome.contentType,
      bytes: outcome.bytes,
      cors: outcome.headers?.['access-control-allow-origin'],
    },
  });
};

/** Anything but POST. Stated, rather than a silent 404. */
export const onRequest = async (
  context: PagesContext
): Promise<Response> => {
  if (context.request.method === 'POST') return onRequestPost(context);
  return failure('rejected', 'This endpoint accepts POST.', 405, {
    Allow: 'POST',
  });
};
