import type { APIRoute } from 'astro';

import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  type Language,
} from '@/lib/i18n';
import { specSchemas, specVersions } from '@/lib/spec-loader';
import { schemaIndexMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(
    schemaIndexMarkdown(
      params.lang as Language,
      specVersions().map((version) => ({
        version,
        schemas: specSchemas(version),
      }))
    ),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
