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

/** `/{lang}.md` — the localized home page as agent-readable Markdown. */
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
      title: t.home.title,
      description: t.home.metaDescription,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/`,
      sections: [
        {
          heading: t.home.eyebrow,
          lines: [t.home.pitch, '', t.home.pitchSecond, '', t.home.statusNote],
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
