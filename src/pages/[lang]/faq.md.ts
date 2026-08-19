import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { faqSections } from '@/lib/faq-markdown';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
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
      title: t.faq.title,
      description: t.faq.lead,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/faq`,
      sections: faqSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
