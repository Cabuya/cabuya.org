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
import { checksSections } from '@/lib/validator-markdown';

/**
 * `/developers/validator/checks.md` — the whole catalogue in one fetch.
 *
 * This is the file an agent should read before it starts a fix loop: 62 ids,
 * each with its rule and remedy, instead of 62 anchor visits.
 */
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
      title: t.checks.title,
      description: t.checks.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/developers/validator/checks`,
      sections: checksSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
