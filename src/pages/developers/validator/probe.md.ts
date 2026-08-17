import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';
import { probeSections } from '@/lib/validator-markdown';

export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);
  return new Response(
    serializeGenericToMarkdown({
      title: t.probe.title,
      description: t.probe.metaDescription,
      lang,
      canonical: `${SITE_URL}/developers/validator/probe`,
      sections: probeSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
