import type { APIRoute } from 'astro';

import { aboutSections } from '@/lib/about-markdown';
import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/** `/about.md` — why the protocol is called Cabuya, for an agent. */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.about.title,
      description: t.about.lead,
      lang,
      canonical: `${SITE_URL}/about`,
      sections: aboutSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
