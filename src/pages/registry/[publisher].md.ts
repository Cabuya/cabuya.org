import type { APIRoute, GetStaticPaths } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import type { PublisherEntry } from '@/lib/registry-loader';
import { allPublishers } from '@/lib/registry-loader';
import { publisherSections } from '@/lib/registry-markdown';
import { fetchMeasuredStatuses } from '@/lib/registry-status';
import { getTranslations } from '@/lib/translations';

export const getStaticPaths: GetStaticPaths = () =>
  allPublishers().map((entry) => ({
    params: { publisher: entry.publisher_id },
    props: { entry },
  }));

/**
 * `/registry/{id}.md` — the measurement, for something that is not a person.
 *
 * The most useful twin on the site for an agent: state, level, timestamp and
 * failing check ids, without a DOM in the way.
 */
export const GET: APIRoute = async ({ props }) => {
  const lang = 'en' as const;
  const t = getTranslations(lang);
  const entry = props.entry as PublisherEntry;
  const statuses = await fetchMeasuredStatuses([entry.publisher_id]);

  return new Response(
    serializeGenericToMarkdown({
      title: `${entry.publisher_id} — ${t.registry.title}`,
      description: t.registry.metaDescription,
      lang,
      canonical: `${SITE_URL}/registry/${entry.publisher_id}`,
      sections: publisherSections(
        lang,
        entry,
        statuses.get(entry.publisher_id),
        new Date(),
        SITE_URL
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
