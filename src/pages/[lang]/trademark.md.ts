import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import {
  rootDocSections,
  serializeGenericToMarkdown,
} from '@/lib/markdown-for-agents';
import { rootDoc, rootDocSummary } from '@/lib/root-docs';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Language;
  const doc = rootDoc('TRADEMARK', lang);
  return new Response(
    serializeGenericToMarkdown({
      title: doc.title,
      description: rootDocSummary(doc),
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/trademark`,
      body: doc.body,
      sections: rootDocSections(lang, {}),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
