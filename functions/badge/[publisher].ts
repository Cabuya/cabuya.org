/**
 * `GET /badge/{publisher_id}.svg` — the measured state, as an image.
 *
 * The cheapest endpoint on the site and the one with the tightest budget: one
 * KV read, one string concatenation, no parsing beyond a single `JSON.parse` of
 * a four-field object. Budget is 50 ms p95 (`docs/PERFORMANCE.md`), and the
 * reason it matters is not the site — it is that this SVG loads inside other
 * people's READMEs, and a slow badge is a badge adopters quietly remove.
 *
 * ## What it will not do
 *
 * It will not compute anything. The state comes from KV exactly as the
 * revalidation cron wrote it, and if KV has nothing the answer is `unmeasured`,
 * never a guess. An endpoint that could derive a state under time pressure is
 * an endpoint that could derive a wrong one, and this badge's only value is
 * that it cannot flatter anybody.
 *
 * It will not 404 for an entry that has never been measured — that is a real
 * registry state with a real badge. It *will* 404 for an id that is not in the
 * registry at all, because "not yet measured" under the protocol's name reads
 * as "listed, pending", and minting that for an arbitrary string would let
 * anyone imply membership they do not have.
 *
 * ## Framing
 *
 * No `X-Frame-Options`, deliberately. The badge exists to be embedded in
 * documents on other origins; the header that would prevent that is the header
 * that would break the feature. It is safe to omit here for the reason it is
 * unsafe to omit elsewhere: the response is a static image with no session, no
 * credentials, and nothing a clickjack could steal. `Access-Control-Allow-
 * Origin: *` is set for the same reason, and `X-Content-Type-Options: nosniff`
 * stays on so the SVG cannot be coerced into being interpreted as anything else.
 */
import { badgeSvg } from '../../src/lib/badge';
import type { Language } from '../../src/lib/i18n';
import type {
  BadgeState,
  MeasuredStatus,
} from '../../src/lib/registry-loader';
import type { KvRead, PagesContext } from '../lib/pages-runtime';
import { REGISTRY_IDS } from '../lib/registry-ids';

interface Env {
  /**
   * Measured status per publisher. Typed read-only: this endpoint has no write
   * path to conformance state, and the type is where that is enforced first.
   */
  REGISTRY_STATUS?: KvRead;
}

/**
 * Spec version the badge names when KV does not say.
 *
 * Hard-coded rather than imported from the validator package: pulling the
 * package in would cost the endpoint its entire budget to read one string, and
 * the drift is covered by a test that compares this constant to `SPEC_VERSION`.
 */
const FALLBACK_VERSION = '0.1';

const VALID_STATES: ReadonlySet<string> = new Set<BadgeState>([
  'conforming',
  'stale',
  'unreachable',
  'failing',
  'unmeasured',
  'archived',
]);

/**
 * Cache policy.
 *
 * Fifteen minutes fresh, an hour of stale-while-revalidate. The cron runs every
 * six hours, so a viewer can be at most fifteen minutes behind a state change —
 * which is well inside the resolution the badge claims (it reports a timestamp,
 * not a live signal), and it keeps a README with forty badges from becoming
 * forty origin requests.
 */
const CACHE_CONTROL = 'public, max-age=900, stale-while-revalidate=3600';

function parseStatus(raw: string | null): MeasuredStatus | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MeasuredStatus>;
    if (typeof parsed.state !== 'string' || !VALID_STATES.has(parsed.state)) {
      return null;
    }
    return parsed as MeasuredStatus;
  } catch {
    // A malformed value is treated as absent. The alternative — throwing — would
    // turn one bad KV write into a broken image in every README that embeds it.
    return null;
  }
}

export const onRequestGet = async (
  context: PagesContext<Env>
): Promise<Response> => {
  const url = new URL(context.request.url);

  // The route param carries the extension: `/badge/example.svg` → `example.svg`.
  const raw = String(context.params.publisher ?? '');
  const publisherId = raw.replace(/\.svg$/i, '');

  if (!REGISTRY_IDS.has(publisherId)) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        // A short cache even on the miss: a typo'd badge in a README would
        // otherwise hit the origin on every page view forever.
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const lang: Language = url.searchParams.get('lang') === 'es' ? 'es' : 'en';
  const style = url.searchParams.get('style') === 'flat' ? 'flat' : 'default';

  const stored = context.env.REGISTRY_STATUS
    ? await context.env.REGISTRY_STATUS.get(`status:${publisherId}`)
    : null;
  const status = parseStatus(stored);

  const svg = badgeSvg({
    state: status?.state ?? 'unmeasured',
    version: status?.version ?? FALLBACK_VERSION,
    lang,
    style,
    publisherId,
  });

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      // The badge is not personalised and must not vary by anything except the
      // two query parameters, which are already part of the cache key.
      Vary: 'Accept-Encoding',
    },
  });
};
