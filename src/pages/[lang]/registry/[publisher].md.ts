import type { APIRoute, GetStaticPaths } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import type { PublisherEntry } from '@/lib/registry-loader';
import { allPublishers } from '@/lib/registry-loader';
import { publisherSections } from '@/lib/registry-markdown';
import { fetchMeasuredStatuses } from '@/lib/registry-status';
import { getTranslations } from '@/lib/translations';

export const getStaticPaths: GetStaticPaths = () => {
  const languages = getSupportedLanguages().filter(
    (lang) => lang !== DEFAULT_LANGUAGE
  );
  return languages.flatMap((lang) =>
    allPublishers().map((entry) => ({
      params: { lang, publisher: entry.publisher_id },
      props: { entry },
    }))
  );
};

export const GET: APIRoute = async ({ params, props }) => {
  const lang = params.lang as Language;
  const t = getTranslations(lang);
  const entry = props.entry as PublisherEntry;
  const statuses = await fetchMeasuredStatuses([entry.publisher_id]);

  return new Response(
    serializeGenericToMarkdown({
      title: `${entry.publisher_id} — ${t.registry.title}`,
      description: t.registry.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/registry/${entry.publisher_id}`,
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
