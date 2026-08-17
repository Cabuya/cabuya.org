import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { rfcIndexSections } from '@/lib/governance-markdown';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);
  return new Response(
    serializeGenericToMarkdown({
      title: t.rfcs.title,
      description: t.rfcs.metaDescription,
      lang,
      canonical: `${SITE_URL}/rfcs`,
      sections: rfcIndexSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
