import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { startSections } from '@/lib/start-markdown';
import { getTranslations } from '@/lib/translations';

/** `/start.md` — the two lines and what they set in motion, for an agent. */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.start.title,
      description: t.start.lead,
      lang,
      canonical: `${SITE_URL}/start`,
      sections: startSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
