import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { allPublishers, officialSources } from '@/lib/registry-loader';
import { registryIndexSections } from '@/lib/registry-markdown';
import {
  fetchMeasuredStatuses,
  statusSourceIsLive,
} from '@/lib/registry-status';
import { getTranslations } from '@/lib/translations';

/** `/registry.md` — the whole index in one fetch, states included. */
export const GET: APIRoute = async () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);
  const entries = allPublishers();
  const statuses = await fetchMeasuredStatuses(
    entries.map((entry) => entry.publisher_id)
  );

  return new Response(
    serializeGenericToMarkdown({
      title: t.registry.title,
      description: t.registry.metaDescription,
      lang,
      canonical: `${SITE_URL}/registry`,
      sections: registryIndexSections(
        lang,
        entries,
        officialSources(),
        statuses,
        new Date(),
        statusSourceIsLive()
      ),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
