import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

import { getPostSlug, isPostVisibleInProduction } from '@/lib/blog';
import { APP_URL, SITE_URL } from '@/lib/constances';
import {
  entityLine,
  mdHref,
  mdLabel,
  serializeGenericToMarkdown,
} from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/**
 * `/en.md` — the home page, as agent-readable Markdown.
 *
 * The rendered page is mostly dynamic, so the latest posts are appended from the
 * same collection the page renders and cannot go stale. Served by its own
 * endpoint rather than the pages-collection route, which skips `index`.
 */
export const GET: APIRoute = async () => {
  const lang = 'en';
  const L = (key: Parameters<typeof mdLabel>[1]) => mdLabel(lang, key);
  const t = getTranslations(lang);

  const pages = await getCollection('pages');
  const page = pages.find((p) => p.id === 'en/index');

  const allPosts = await getCollection('blog');
  const posts = allPosts
    .filter((p) => p.id.startsWith('en/') && isPostVisibleInProduction(p))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 5);

  const sections: { heading: string; lines: string[] }[] = [];

  sections.push({
    heading: 'The application',
    lines: [
      'Publishing a need, offering help, contributing and tracking a contribution all happen in Ayuda Directa, not on this site.',
      `  ${APP_URL}`,
    ],
  });

  if (posts.length > 0) {
    sections.push({
      heading: L('latestPosts'),
      lines: posts.map((p) =>
        entityLine(
          p.data.title,
          mdHref(lang, `blog/${getPostSlug(p.id)}`),
          p.data.pubDate.toISOString().split('T')[0],
          undefined,
          p.data.description
        )
      ),
    });
  }

  return new Response(
    serializeGenericToMarkdown({
      title: t.siteTitleFull,
      description: t.siteDescription,
      lang,
      canonical: `${SITE_URL}/en/`,
      body: page?.body ?? '',
      sections,
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
