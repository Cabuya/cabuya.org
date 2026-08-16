/**
 * Loaders that resolve a page's entity references into the plain data its
 * agent-Markdown serializer needs.
 *
 * Split deliberately from `markdown-for-agents.ts`: the serializers there are
 * pure (data in, string out) and therefore unit-testable without the content
 * layer, while everything async lives here and reuses the existing collection
 * helpers rather than re-querying collections ad hoc.
 *
 * The contract these feed is `docs/aeo/MARKDOWN_FOR_AGENTS.md`.
 */
import { type CollectionEntry, getCollection } from 'astro:content';

import {
  getPostSlug,
  getReadingTimeFromContent,
  getRelatedPosts,
} from '@/lib/blog';
import type { Language } from '@/lib/i18n';
import { resolveI18n } from '@/lib/markdown-for-agents';

const isoDate = (d: Date): string => d.toISOString().split('T')[0];

export interface ResolvedPostContext {
  author?: { slug: string; name: string; role: string; bio: string };
  related: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
  }>;
  readingMinutes: number;
  series?: { slug: string; title: string; order: number; total: number };
}

/**
 * The blocks a blog post's HTML renders around its body: the author byline
 * card, the series strip, and the related-articles list. Short posts are
 * mostly these blocks, which is why omitting them put recap posts at 0.28
 * coverage despite a verbatim body.
 */
export const resolvePostContext = async (
  post: CollectionEntry<'blog'>,
  lang: Language
): Promise<ResolvedPostContext> => {
  const authors = await getCollection('authors');
  const authorEntry = authors.find((a) => a.data.slug === post.data.author);

  const relatedPosts = await getRelatedPosts({
    currentPostId: post.id,
    tags: post.data.tags ?? [],
    lang,
    limit: 3,
  });

  let series: ResolvedPostContext['series'];
  if (post.data.series) {
    const allSeries = await getCollection('series');
    const seriesEntry = allSeries.find((s) => s.id === post.data.series);
    const chapters = (await getCollection('blog')).filter(
      (p) => p.id.startsWith(`${lang}/`) && p.data.series === post.data.series
    );
    if (seriesEntry) {
      series = {
        slug: post.data.series,
        title: resolveI18n(seriesEntry.data.title, lang),
        order: post.data.seriesOrder ?? 0,
        total: chapters.length,
      };
    }
  }

  return {
    author: authorEntry
      ? {
          slug: authorEntry.data.slug,
          name: authorEntry.data.name,
          role: resolveI18n(authorEntry.data.role, lang),
          bio: resolveI18n(authorEntry.data.bio, lang),
        }
      : undefined,
    related: relatedPosts.map((p) => ({
      slug: getPostSlug(p.id),
      title: p.data.title,
      description: p.data.description,
      date: isoDate(p.data.pubDate),
    })),
    readingMinutes: getReadingTimeFromContent(post.body ?? ''),
    series,
  };
};
