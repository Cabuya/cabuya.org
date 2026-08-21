/**
 * Pass 7 — BEHAVIOR (the transport probes).
 *
 * These are the checks that separate this validator from "a JSON Schema in
 * a trenchcoat". Each one exists because the founding analysis hit the
 * failure in production, and each is written to be **hard to false-positive
 * on**: a wrong finding here is an accusation against a volunteer team, not
 * a note.
 *
 * Everything in this module requires the network, so the whole pass is
 * skipped in degraded mode (the engine handles that) — it is never run
 * silently against a stub.
 */

import { getCheck } from '../checks.js';
import type { Pass, PassContext } from '../engine.js';
import type { Fetcher, FetchResult } from '../fetcher.js';
import type { Finding } from '../report.js';
import { make } from './semantic.js';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Probe tuning. Defaults match the CLI flags documented in §4.7. */
export interface ProbeOptions {
  /** Seconds between the two always-now probes. Minimum 2. */
  probeTwiceSeconds?: number;
  /** Tolerance, in seconds, for the always-now clock comparison. */
  toleranceSeconds?: number;
  /** Injectable clock + sleep so tests are fast and deterministic. */
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULTS = {
  probeTwiceSeconds: 3,
  toleranceSeconds: 1,
};

// ── hashing (crypto.subtle only — no Node APIs) ───────────

/** sha256 of a string, hex-encoded. Runs in every target runtime. */
export async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * The content hash used by the always-now probe: the body with the
 * `last_updated` value removed, so a feed whose ONLY change is its timestamp
 * hashes identically across two probes.
 */
export async function contentHashWithoutTimestamp(
  body: string
): Promise<string> {
  const stripped = body.replace(
    /"last_updated"\s*:\s*"[^"]*"/g,
    '"last_updated":"<stripped>"'
  );
  return sha256(stripped);
}

// ── soft-404 (DSC002) — the four-step algorithm ───────────

export type SoftFourOhFourVerdict =
  | { present: true }
  | {
      present: false;
      discriminator: 'status' | 'content-type' | 'byte-equality';
    };

/**
 * Decide whether a discovery path really serves a document, or whether an
 * SPA catch-all is answering. Pure — the caller supplies both responses.
 */
export function softFourOhFour(
  target: FetchResult,
  root?: FetchResult
): SoftFourOhFourVerdict {
  // 1. Not 200 → cleanly absent (and not a soft-404 at all).
  if (target.status !== 200) {
    return { present: false, discriminator: 'status' };
  }
  // 2. HTML at a discovery path → absent. A manifest is JSON.
  const type = target.headers['content-type'] ?? '';
  if (/text\/html/i.test(type)) {
    return { present: false, discriminator: 'content-type' };
  }
  // 3. JSON but suspicious → compare against `/`: identical bytes means the
  //    same catch-all document is being served at both paths.
  if (root && root.status === 200 && root.bytes === target.bytes) {
    if (root.body === target.body) {
      return { present: false, discriminator: 'byte-equality' };
    }
  }
  return { present: true };
}

const SPA_FIXES: Record<string, string> = {
  next: 'Next.js: put the file in `public/.well-known/` (it is served before the catch-all).',
  vite: 'Vite/React SPA: put the file in `public/.well-known/` and exclude the path from the rewrite (e.g. Vercel `routes`/`rewrites`, Netlify `_redirects` with a `!` exception).',
  astro:
    'Astro: put the file in `public/.well-known/` — no catch-all rewrite needed.',
  laravel:
    'Laravel: add a route before the SPA fallback, or place the file in `public/.well-known/`.',
  django:
    'Django: serve it with a `static` route registered before the catch-all urlpattern.',
};

/** Best-effort framework hint from response headers. Never guesses wildly. */
export function frameworkHint(
  headers: Record<string, string>
): string | undefined {
  const powered = (headers['x-powered-by'] ?? '').toLowerCase();
  const server = (headers.server ?? '').toLowerCase();
  const haystack = `${powered} ${server}`;
  for (const key of Object.keys(SPA_FIXES)) {
    if (haystack.includes(key)) return SPA_FIXES[key];
  }
  return undefined;
}

// ── always-now (BEH002) — the two-condition trigger ───────

export interface AlwaysNowProbe {
  lastUpdated: string | undefined;
  hash: string;
  /** Wall-clock ms when the probe was taken. */
  at: number;
}

/**
 * Fire ONLY when both conditions hold:
 *   (a) the content hash is identical across the two probes, and
 *   (b) `last_updated` advanced by approximately the elapsed wall time.
 *
 * Two conditions, because a genuinely busy feed CAN legitimately change in
 * three seconds. A false positive here would accuse a team of an
 * anti-pattern they do not have.
 */
export function alwaysNowFires(
  first: AlwaysNowProbe,
  second: AlwaysNowProbe,
  toleranceSeconds = DEFAULTS.toleranceSeconds
): boolean {
  if (first.hash !== second.hash) return false;
  if (!first.lastUpdated || !second.lastUpdated) return false;
  const t0 = Date.parse(first.lastUpdated);
  const t1 = Date.parse(second.lastUpdated);
  if (Number.isNaN(t0) || Number.isNaN(t1)) return false;
  const declaredDelta = (t1 - t0) / 1000;
  if (declaredDelta <= 0) return false;
  const elapsed = (second.at - first.at) / 1000;
  return Math.abs(declaredDelta - elapsed) <= toleranceSeconds;
}

// ── the pass ──────────────────────────────────────────────

function headerFinding(
  id: string,
  ptr: string,
  message: string,
  fix: string
): Finding {
  // The behavior pass reports against transport, not document text, so no
  // raw source is available for line/column — pointers stay logical.
  return make(id, ptr, message, fix);
}

/** One declared feed, with the array position its JSON Pointer needs. */
export interface DeclaredFeed {
  index: number;
  url: string;
}

/**
 * Extract the feed URLs a manifest declares, keeping each one's position.
 *
 * The index travels because the pointer does: a manifest declaring six
 * municipality shards needs `/feeds/4/url`, not "one of your feeds".
 * Entries whose `url` is missing or not a string are left out — the schema
 * pass already owns that failure, and reporting it twice under two ids is
 * how a report stops being trusted.
 */
export function declaredFeedUrls(manifest: unknown): DeclaredFeed[] {
  if (!isObject(manifest) || !Array.isArray(manifest.feeds)) return [];
  return manifest.feeds
    .map((feed, index) => ({ index, feed }))
    .filter((entry): entry is { index: number; feed: Json } =>
      isObject(entry.feed)
    )
    .map(({ index, feed }) => ({ index, url: feed.url }))
    .filter((entry): entry is DeclaredFeed => typeof entry.url === 'string');
}

/**
 * Loopback is exempt from the HTTPS requirement.
 *
 * A publisher checks their work against `http://localhost:3000` before they
 * ship, and a validator that calls their dev server non-conforming is a
 * validator they stop running at exactly the moment it was useful. Nothing
 * outside the machine can reach these hosts, so the requirement HTTPS exists
 * for — a transport somebody else can read — does not apply.
 */
function isLoopback(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host === '::1' ||
    host.endsWith('.localhost')
  );
}

/** Why a declared feed does not resolve, or `ok` when it does. */
type FeedVerdict =
  | { kind: 'ok' }
  | { kind: 'not_absolute' }
  | { kind: 'bad_scheme'; scheme: string }
  | { kind: 'insecure' }
  | { kind: 'unreachable'; detail: string };

/**
 * The static half of DSC007: everything decidable from the string alone.
 *
 * Runs before any fetch, so a malformed URL costs the publisher's server
 * nothing and can never be mistaken for their server being down.
 */
export function feedUrlShape(raw: string): FeedVerdict {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // Relative URLs are the common case here, and they are a real failure:
    // a consumer resolving the manifest from the registry has no base to
    // resolve them against.
    return { kind: 'not_absolute' };
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { kind: 'bad_scheme', scheme: parsed.protocol.replace(':', '') };
  }
  if (parsed.protocol === 'http:' && !isLoopback(parsed.hostname)) {
    return { kind: 'insecure' };
  }
  return { kind: 'ok' };
}

const FEED_MESSAGES: Record<
  Exclude<FeedVerdict['kind'], 'ok'>,
  (detail: string) => { message: string; fix: string }
> = {
  not_absolute: () => ({
    message: 'the declared feed URL is not absolute',
    fix: 'Declare the feed with a full https URL. A consumer reads this manifest from the registry and has nothing to resolve a relative path against.',
  }),
  bad_scheme: (scheme) => ({
    message: `the declared feed URL uses the "${scheme}" scheme`,
    fix: 'Declare the feed over https. The protocol moves public-interest data over one transport consumers can verify.',
  }),
  insecure: () => ({
    message: 'the declared feed URL is http, not https',
    fix: 'Serve the feed over https. Browser consumers on an https page cannot read it otherwise, whatever the CORS header says.',
  }),
  unreachable: (detail) => ({
    message: `the declared feed did not resolve (${detail})`,
    fix: 'Give every feed a URL that resolves from outside your network — a manifest pointing at a feed that is not there is worse than a manifest with no feeds, because a consumer trusts it.',
  }),
};

/**
 * DSC007 — every declared feed resolves.
 *
 * The check that stops a manifest from being taken at its word. Without it a
 * publisher can declare a feed that has never existed and nothing downstream
 * notices: the manifest validates, the ladder finds no error to stop at, and
 * "measured" starts meaning "declared" — which is the one thing §8.3 says
 * this validator exists to prevent.
 *
 * Deliberately conservative about what counts as resolving, because the
 * severity is `error` and a wrong one here accuses a volunteer team:
 *
 *   - A redirect counts. It resolves for a consumer, and following the chain
 *     spends the politeness budget on a hop we did not declare. (The
 *     fetcher's `redirectChain` is where the stricter version will live.)
 *   - Our own budget never counts. When it runs out the remaining feeds are
 *     left unprobed rather than reported — see `budgetExhausted`.
 */
export async function probeDeclaredFeeds(
  manifest: unknown,
  fetcher: Fetcher
): Promise<Finding[]> {
  const findings: Finding[] = [];
  let budgetGone = false;

  for (const { index, url } of declaredFeedUrls(manifest)) {
    const pointer = `/feeds/${index}/url`;
    const shape = feedUrlShape(url);
    if (shape.kind !== 'ok') {
      const detail = shape.kind === 'bad_scheme' ? shape.scheme : '';
      const { message, fix } = FEED_MESSAGES[shape.kind](detail);
      findings.push(make('DSC007', pointer, message, fix));
      continue;
    }

    // One feed already exhausted the budget: stop probing rather than
    // reporting every remaining feed as unreachable on our own account.
    if (budgetGone) continue;

    const result = await fetcher.fetch(url);
    if (result.budgetExhausted) {
      budgetGone = true;
      continue;
    }
    if (result.transportError) {
      const { message, fix } = FEED_MESSAGES.unreachable(result.transportError);
      findings.push(make('DSC007', pointer, message, fix));
      continue;
    }
    if (result.status >= 400) {
      const { message, fix } = FEED_MESSAGES.unreachable(
        `HTTP ${result.status}`
      );
      findings.push(make('DSC007', pointer, message, fix));
    }
  }

  return findings;
}

export function makeBehaviorPass(options: ProbeOptions = {}): Pass {
  const gap = Math.max(
    2,
    options.probeTwiceSeconds ?? DEFAULTS.probeTwiceSeconds
  );
  const tolerance = options.toleranceSeconds ?? DEFAULTS.toleranceSeconds;
  const now = options.now ?? (() => Date.now());
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  return {
    name: 'behavior',
    requiresNetwork: true,
    async run(context: PassContext): Promise<Finding[]> {
      const fetcher = context.fetcher as Fetcher | undefined;
      const url = context.url;
      if (!fetcher || !url) return [];

      const findings: Finding[] = [];
      const first = await fetcher.fetch(url);

      context.probes.bytes = first.bytes;
      context.probes.elapsed_ms = first.elapsedMs;

      // Transport failure is not a conformance verdict — the engine's caller
      // maps it to exit code 3. Report it and stop probing.
      if (first.transportError) {
        findings.push(
          headerFinding(
            'BEH001',
            '',
            `the feed could not be fetched (${first.transportError})`,
            'Fix deployment, DNS or routing — this is a transport problem, not a data problem.'
          )
        );
        return findings;
      }

      // ── DSC002 — soft-404 on a discovery path ────────────
      const isDiscoveryPath = /\/\.well-known\/|\.json$/.test(url);
      const firstDoc = safeParse(first.body);
      if (isDiscoveryPath) {
        let root: FetchResult | undefined;
        const type = first.headers['content-type'] ?? '';
        // "Suspicious" means: this does not look like the document the path
        // promises. HTML obviously; but ALSO a body that does not parse as
        // JSON, or parses without either root member the protocol defines —
        // which is exactly how a catch-all serving HTML under an
        // `application/json` header slips past a content-type check. That
        // case is why the byte-equality discriminator exists.
        const looksLikeDocument =
          isObject(firstDoc) && ('protocol' in firstDoc || 'data' in firstDoc);
        const suspicious = first.status === 200 && !looksLikeDocument;
        if (suspicious || /text\/html/i.test(type)) {
          root = await fetcher.fetch(new URL('/', url).toString());
        }
        const verdict = softFourOhFour(first, root);
        context.probes.soft_404 = verdict.present ? 'pass' : 'fail';
        if (!verdict.present) {
          const hint = frameworkHint(first.headers);
          findings.push(
            headerFinding(
              'DSC002',
              '',
              `nothing is served at this discovery path — a catch-all is answering (discriminator: ${verdict.discriminator})`,
              `Exclude this path from your SPA catch-all so the file itself is served.${hint ? ` ${hint}` : ''}`
            )
          );
        }
      }

      // ── DSC007 — every feed the manifest declares resolves ──
      //
      // Manifest only: a feed document declares no feeds, and running this
      // against one would fetch nothing while looking like it had.
      if (isObject(firstDoc) && 'protocol' in firstDoc) {
        findings.push(...(await probeDeclaredFeeds(firstDoc, fetcher)));
      }

      // ── ENV007 — CORS on the real GET ────────────────────
      const acao = first.headers['access-control-allow-origin'];
      context.probes.cors = acao === '*' ? 'present' : 'missing';
      if (acao !== '*') {
        findings.push(
          headerFinding(
            'ENV007',
            '',
            'the response carries no `Access-Control-Allow-Origin: *` header — every browser-based consumer needs a proxy without it',
            'Add the header verbatim: `Access-Control-Allow-Origin: *`'
          )
        );
      }

      // ── ENV010 — content type ────────────────────────────
      const contentType = first.headers['content-type'] ?? '';
      if (!/application\/json/i.test(contentType)) {
        findings.push(
          headerFinding(
            'ENV010',
            '',
            `the response Content-Type is "${contentType || '(absent)'}" rather than application/json`,
            'Serve the feed as `Content-Type: application/json; charset=utf-8`.'
          )
        );
      }

      // ── BEH002 — always-now double probe ─────────────────
      //
      // Both probes come from THIS pass's own fetches. Using the caller's
      // already-parsed document would compare a timestamp captured at an
      // unknown earlier moment against a fresh one, which is how a probe
      // ends up accusing a healthy feed (or missing a sick one).
      const feedDoc = isObject(firstDoc) ? firstDoc : undefined;
      const isFeed = feedDoc !== undefined && 'data' in feedDoc;
      if (isFeed) {
        const firstProbe: AlwaysNowProbe = {
          lastUpdated:
            typeof feedDoc.last_updated === 'string'
              ? feedDoc.last_updated
              : undefined,
          hash: await contentHashWithoutTimestamp(first.body),
          at: now(),
        };
        await sleep(gap * 1000);
        const second = await fetcher.fetch(url);
        if (!second.transportError) {
          const secondDoc = safeParse(second.body);
          const secondProbe: AlwaysNowProbe = {
            lastUpdated:
              isObject(secondDoc) && typeof secondDoc.last_updated === 'string'
                ? secondDoc.last_updated
                : undefined,
            hash: await contentHashWithoutTimestamp(second.body),
            at: now(),
          };
          const fires = alwaysNowFires(firstProbe, secondProbe, tolerance);
          context.probes.always_now = fires ? 'fail' : 'pass';
          context.probes.content_hash = `sha256:${firstProbe.hash}`;
          if (fires) {
            findings.push(
              headerFinding(
                'BEH002',
                '/last_updated',
                'value advanced with the probe clock on identical content — generate at build/publish time, not per request',
                'Stamp `last_updated` when you generate the feed and store it; a per-request timestamp is worse than no signal because consumers can never detect real change.'
              )
            );
          }
          // BEH001 — stability across the two probes.
          const firstType = first.headers['content-type'] ?? '';
          const secondType = second.headers['content-type'] ?? '';
          if (second.status !== first.status || secondType !== firstType) {
            findings.push(
              headerFinding(
                'BEH001',
                '',
                `the feed answered differently on two probes (status ${first.status}→${second.status}, type "${firstType}"→"${secondType}")`,
                'Serve the feed deterministically; consumers poll it and cannot handle a surface that changes shape between requests.'
              )
            );
          }
        }

        // ── BEH003 — staleness against 7 × ttl ─────────────
        const ttl = typeof feedDoc.ttl === 'number' ? feedDoc.ttl : undefined;
        const lastUpdated =
          typeof feedDoc.last_updated === 'string'
            ? Date.parse(feedDoc.last_updated)
            : Number.NaN;
        if (ttl && !Number.isNaN(lastUpdated)) {
          const ageSeconds = (now() - lastUpdated) / 1000;
          if (ageSeconds > ttl * 7) {
            findings.push(
              headerFinding(
                'BEH003',
                '/last_updated',
                `the feed is ${Math.round(ageSeconds / 3600)}h old, beyond 7 × ttl (${Math.round((ttl * 7) / 3600)}h) — the registry will show it as stale`,
                'Re-generate the feed, or raise `ttl` to describe your real refresh cadence. Staleness is information, not failure — but it must be honest.'
              )
            );
          }
        }
      }

      return findings;
    },
  };
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** The default-configured behavior pass. */
export const behaviorPass = makeBehaviorPass();

/** Exposed for the catalogue gate and docs generation. */
export const BEHAVIOR_CHECK_IDS = [
  'BEH001',
  'BEH002',
  'BEH003',
  'DSC002',
  'DSC007',
  'ENV007',
  'ENV010',
].filter((id) => getCheck(id) !== undefined);
