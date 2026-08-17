import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { quickstartSections } from '@/lib/quickstart-markdown';
import { getTranslations } from '@/lib/translations';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Language;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.quickstart.title,
      description: t.quickstart.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/developers/quickstart`,
      sections: quickstartSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
