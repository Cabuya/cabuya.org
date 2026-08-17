import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  rootDocSections,
  serializeGenericToMarkdown,
} from '@/lib/markdown-for-agents';
import { rootDoc, rootDocSummary } from '@/lib/root-docs';

/**
 * `/trademark.md` — the root document, which is already Markdown.
 *
 * The body is the file, unchanged. Re-serializing a Markdown file from its own
 * rendered HTML would be a worse copy of something we already have.
 */
export const GET: APIRoute = () => {
  const doc = rootDoc('TRADEMARK', 'en');
  return new Response(
    serializeGenericToMarkdown({
      title: doc.title,
      description: rootDocSummary(doc),
      lang: 'en',
      canonical: `${SITE_URL}/trademark`,
      body: doc.body,
      sections: rootDocSections('en', {}),
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
