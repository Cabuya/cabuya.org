/**
 * `resolvePostContext` — the loader that turns a post's entity references into
 * the plain data its agent-Markdown serializer needs.
 *
 * This is the half of the twin pipeline that had no coverage. It matters
 * because a blog post's HTML renders three blocks around its body — the author
 * byline, the series strip, and the related-articles list — and a short post is
 * mostly those blocks. Dropping them is what once put recap posts at 0.28
 * coverage on `md:check` despite a verbatim body: the twin held the whole
 * article and still failed, because the page held more than the article.
 *
 * The failure mode is silent in the other direction too. An author slug that
 * resolves to nothing produces a twin with no byline and no error.
 */
import { describe, expect, it, vi } from 'vitest';

const AUTHORS = [
  {
    data: {
      slug: 'corag',
      name: 'Equipo Corag',
      role: { en: 'Corag editorial team', es: 'Equipo editorial de Corag' },
      bio: {
        en: 'The people who coordinate aid.',
        es: 'Quienes coordinan la ayuda.',
      },
    },
  },
];

const SERIES = [
  {
    id: 'verifying-aid',
    data: { title: { en: 'Verifying aid', es: 'Verificar la ayuda' } },
  },
];

const post = (
  id: string,
  data: Record<string, unknown> = {}
): Record<string, unknown> => ({
  id,
  body: 'word '.repeat(400),
  data: {
    title: `Title for ${id}`,
    description: `Description for ${id}`,
    pubDate: new Date('2026-03-10T00:00:00.000Z'),
    tags: ['donations'],
    author: 'corag',
    ...data,
  },
});

const BLOG = [
  post('es/2026-03-10_a'),
  post('es/2026-03-13_b'),
  post('es/2026-03-17_c'),
  post('es/2026-03-20_d'),
  post('en/2026-03-10_a'),
  post('es/2026-04-01_chapter-one', {
    series: 'verifying-aid',
    seriesOrder: 1,
  }),
  post('es/2026-04-08_chapter-two', {
    series: 'verifying-aid',
    seriesOrder: 2,
  }),
  post('en/2026-04-01_chapter-one', {
    series: 'verifying-aid',
    seriesOrder: 1,
  }),
];

vi.mock('astro:content', () => ({
  getCollection: async (name: string) => {
    if (name === 'authors') return AUTHORS;
    if (name === 'series') return SERIES;
    if (name === 'blog') return BLOG;
    return [];
  },
}));

const { resolvePostContext } = await import('@/lib/agent-resolvers');

describe('resolvePostContext', () => {
  it('resolves the author with the language-correct role and bio', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.author).toEqual({
      slug: 'corag',
      name: 'Equipo Corag',
      role: 'Equipo editorial de Corag',
      bio: 'Quienes coordinan la ayuda.',
    });

    const enCtx = await resolvePostContext(BLOG[4] as never, 'en');
    expect(enCtx.author?.role).toBe('Corag editorial team');
  });

  it('returns no author rather than a broken one for an unknown slug', async () => {
    // A twin with no byline is recoverable. A twin with `undefined` in it is a
    // defect that ships.
    const orphan = post('es/2026-05-01_orphan', { author: 'nobody' });
    const ctx = await resolvePostContext(orphan as never, 'es');
    expect(ctx.author).toBeUndefined();
  });

  it('resolves related posts with their own slug, title and ISO date', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.related.length).toBeGreaterThan(0);
    for (const related of ctx.related) {
      // The date prefix belongs on disk, never in the URL.
      expect(related.slug).not.toMatch(/^\d{4}-\d{2}-\d{2}_/);
      expect(related.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(related.title).not.toBe('');
    }
  });

  it('never lists the post itself among its related posts', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.related.map((r) => r.slug)).not.toContain('a');
  });

  it('caps related posts at three, the count the page renders', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.related.length).toBeLessThanOrEqual(3);
  });

  it('reports a reading time derived from the body', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.readingMinutes).toBeGreaterThan(0);
  });

  it('resolves a series with its localized title, order and chapter total', async () => {
    const ctx = await resolvePostContext(BLOG[5] as never, 'es');
    expect(ctx.series).toEqual({
      slug: 'verifying-aid',
      title: 'Verificar la ayuda',
      order: 1,
      total: 2,
    });
  });

  it('counts chapters within one language, not across both', async () => {
    // English has one chapter of this series; Spanish has two. Counting the
    // whole collection would render "Chapter 1 of 3" on the English page.
    const ctx = await resolvePostContext(BLOG[7] as never, 'en');
    expect(ctx.series?.total).toBe(1);
  });

  it('omits the series block entirely for a standalone post', async () => {
    const ctx = await resolvePostContext(BLOG[0] as never, 'es');
    expect(ctx.series).toBeUndefined();
  });

  it('omits the series block when the slug matches no series entry', async () => {
    const dangling = post('es/2026-06-01_dangling', {
      series: 'series-that-was-deleted',
      seriesOrder: 1,
    });
    const ctx = await resolvePostContext(dangling as never, 'es');
    expect(ctx.series).toBeUndefined();
  });
});
