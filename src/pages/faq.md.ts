import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import { faqSections } from '@/lib/faq-markdown';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/** `/faq.md` — the general-audience FAQ, for an agent. */
export const GET: APIRoute = () => {
  const lang = 'en' as const;
  const t = getTranslations(lang);

  return new Response(
    serializeGenericToMarkdown({
      title: t.faq.title,
      description: t.faq.lead,
      lang,
      canonical: `${SITE_URL}/faq`,
      sections: faqSections(lang),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
