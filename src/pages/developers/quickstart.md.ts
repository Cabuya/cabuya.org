import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { quickstartSections } from '@/lib/quickstart-markdown';
import { getTranslations } from '@/lib/translations';

/** `/developers/quickstart.md` — the page an agent reads to publish a feed. */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.quickstart.title,
      description: t.quickstart.metaDescription,
      lang,
      canonical: `${SITE_URL}/developers/quickstart`,
      sections: quickstartSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
