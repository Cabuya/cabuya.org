import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { docsRoutes } from '@/lib/docs-routes';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';

/**
 * `{route}.md` for every prose page in the portal.
 *
 * The body is the source file, verbatim. These pages are Markdown already, so
 * a twin that re-serialized them from the rendered HTML would be a worse copy
 * of a file we already have — and a copy that could drift. Same argument as the
 * spec twins, where the twin *is* the source file.
 *
 * The front block is still added: an agent that fetched this without a
 * canonical URL and a language would have no way to cite it.
 */
export const getStaticPaths: GetStaticPaths = async () =>
  (await docsRoutes()).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) => {
  const page = params.page as string;
  const entries = await getCollection('docs');
  const entry = entries.find((item) => item.id === `en/${page}`);
  if (!entry) return new Response('Not found', { status: 404 });

  return new Response(
    serializeGenericToMarkdown({
      title: entry.data.title,
      description: entry.data.description,
      lang: 'en',
      canonical: `${SITE_URL}/developers/${page}`,
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
