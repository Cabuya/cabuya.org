import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { homeSections } from '@/lib/home-markdown';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/** `/index.md` — the home page as agent-readable Markdown (English, root). */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.home.hero.title,
      description: t.home.metaDescription,
      lang,
      canonical: `${SITE_URL}/`,
      sections: homeSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
