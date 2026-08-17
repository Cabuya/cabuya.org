import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { docsRoutes } from '@/lib/docs-routes';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await docsRoutes();
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .flatMap((lang) => pages.map((page) => ({ params: { lang, page } })));
};

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Language;
  const page = params.page as string;
  const entries = await getCollection('docs');
  const entry = entries.find((item) => item.id === `${lang}/${page}`);
  if (!entry) return new Response('Not found', { status: 404 });

  return new Response(
    serializeGenericToMarkdown({
      title: entry.data.title,
      description: entry.data.description,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/developers/${page}`,
      body: entry.body,
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
