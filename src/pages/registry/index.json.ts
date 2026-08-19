import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { allPublishers } from '@/lib/registry-loader';

/**
 * `/registry/index.json` — the registry, machine-readable.
 *
 * The consumption story starts with "resolve the registry", and both the
 * agent skill's doctor and its offline snapshot regeneration point here, so
 * this URL is part of the protocol's public contract, not a convenience.
 *
 * It carries exactly what the reviewed publisher entries carry —
 * org-level identity, entity domains, review status — and **never** measured
 * badge state: measurement lives in KV and is served per publisher, because a
 * static file that claimed to know a live measurement would be stale the hour
 * after it was built. The `measured_state` field says where to look instead
 * of pretending to know.
 */
export const GET: APIRoute = () => {
  const publishers = allPublishers().map((entry) => ({
    publisher_id: entry.publisher_id,
    canonical_url: entry.canonical_url,
    entity_domains: entry.entity_domains,
    status: entry.status,
    added: entry.added,
    page: `${SITE_URL}/registry/${entry.publisher_id}`,
  }));

  return new Response(
    JSON.stringify(
      {
        name: 'Cabuya registry',
        source: `${SITE_URL}/registry`,
        measured_state:
          'not in this file — measurement is served per publisher page, never as a static claim',
        publishers,
      },
      null,
      2
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
