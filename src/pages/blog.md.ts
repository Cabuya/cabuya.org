import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

import { getPostSlug, isPostVisibleInProduction } from '@/lib/blog';
import { serializeBlogIndexToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('blog');
  const posts = allPosts
    .filter(
      (post) => post.id.startsWith('es/') && isPostVisibleInProduction(post)
    )
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const entries = posts.map((post) => ({
    title: post.data.title,
    slug: getPostSlug(post.id),
    description: post.data.description,
    pubDate: post.data.pubDate,
    tags: post.data.tags,
  }));

  const markdown = serializeBlogIndexToMarkdown(entries, {
    lang: 'es',
    // Same strings the HTML renders, so the twin cannot drift from the page.
    title: `Blog de Corag \u2014 ${getTranslations('es').blogTitle}`,
    description: getTranslations('es').blogDescription,
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
