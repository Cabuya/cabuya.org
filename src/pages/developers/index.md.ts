import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { portalSections } from '@/lib/portal-markdown';
import { getTranslations } from '@/lib/translations';

/** `/developers.md` — the portal home as agent-readable Markdown (English). */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.portal.title,
      description: t.portal.metaDescription,
      lang,
      canonical: `${SITE_URL}/developers`,
      sections: portalSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
