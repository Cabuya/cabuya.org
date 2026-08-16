import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { serializeInstitutionalPageToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export const GET: APIRoute = () => {
  const markdown = serializeInstitutionalPageToMarkdown(
    getTranslations('es').partnersPage,
    { lang: 'es', canonical: `${SITE_URL}/partners` }
  );

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
