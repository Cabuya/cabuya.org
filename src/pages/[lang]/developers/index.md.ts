import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { portalSections } from '@/lib/portal-markdown';
import { getTranslations } from '@/lib/translations';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

/** `/{lang}/developers.md` — the portal home for every non-default language. */
export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Language;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.portal.title,
      description: t.portal.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/developers`,
      sections: portalSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
