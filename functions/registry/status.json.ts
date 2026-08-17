/**
 * `GET /registry/status.json` — every publisher's measured state, live.
 *
 * The registry pages are static, so the states in their HTML are as old as the
 * deploy. This endpoint is what makes that acceptable: a ~1 KB script on those
 * pages reads it and patches anything that has moved since. Without JavaScript
 * the page still shows the baked-in states with their timestamps, which is
 * correct and merely older — the enhancement changes how fresh the page is,
 * never whether it works.
 *
 * The same numbers the badges serve, from the same KV keys, so a badge and the
 * page it links to cannot disagree.
 */
import type { MeasuredStatus } from '../../src/lib/registry-loader';
import type { KvRead, PagesContext } from '../lib/pages-runtime';
import { REGISTRY_IDS } from '../lib/registry-ids';

interface Env {
  /** Read-only, for the same reason the badge endpoint's binding is. */
  REGISTRY_STATUS?: KvRead;
}

/**
 * Same freshness window as the badge.
 *
 * Deliberately identical: if this were shorter, the page would correct itself
 * to a state the badge beside it was still serving from cache, and a reader
 * would see the registry contradict its own image.
 */
const CACHE_CONTROL = 'public, max-age=900, stale-while-revalidate=3600';

export const onRequestGet = async (
  context: PagesContext<Env>
): Promise<Response> => {
  const namespace = context.env.REGISTRY_STATUS;
  const ids = [...REGISTRY_IDS].sort();

  const entries = await Promise.all(
    ids.map(async (id) => {
      if (!namespace) return null;
      const raw = await namespace.get(`status:${id}`);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as MeasuredStatus;
        /*
         * The key decides who this is about, not the record's own field. A
         * record whose `publisher_id` disagrees with the key it was stored
         * under is a bad write, and trusting the field would let one bad write
         * attach a state to a publisher it was never measured against — which
         * on the page means patching the wrong row.
         */
        if (parsed.publisher_id && parsed.publisher_id !== id) return null;
        return [id, parsed] as const;
      } catch {
        // A malformed record is reported as absent rather than crashing the
        // whole document: one bad write must not blank the entire registry.
        return null;
      }
    })
  );

  const statuses: Record<string, MeasuredStatus> = {};
  for (const entry of entries) {
    if (entry) statuses[entry[0]] = entry[1];
  }

  return new Response(JSON.stringify({ statuses }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
      // Read by other tools as readily as by our own page. Everything here is
      // already published on the registry pages.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
