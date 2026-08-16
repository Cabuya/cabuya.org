import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/** `/en.md` — the home page as agent-readable Markdown (English). */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.home.title,
      description: t.home.metaDescription,
      lang,
      canonical: `${SITE_URL}/en/`,
      sections: [
        {
          heading: t.home.eyebrow,
          lines: [t.home.pitch, '', t.home.pitchSecond, '', t.home.statusNote],
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
