import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { allPublishers, officialSources } from '@/lib/registry-loader';
import { registryIndexSections } from '@/lib/registry-markdown';
import {
  fetchMeasuredStatuses,
  statusSourceIsLive,
} from '@/lib/registry-status';
import { getTranslations } from '@/lib/translations';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

/** `/{lang}/registry.md` — the index for every non-default language. */
export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Language;
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
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/registry`,
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
