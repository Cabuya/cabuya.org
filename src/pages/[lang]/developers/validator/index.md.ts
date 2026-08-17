import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';
import { validatorSections } from '@/lib/validator-markdown';

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
      title: t.validator.title,
      description: t.validator.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/developers/validator`,
      sections: validatorSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
