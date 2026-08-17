import type { APIRoute } from 'astro';

import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  type Language,
} from '@/lib/i18n';
import { specVersionSummary, specVersions } from '@/lib/spec-loader';
import { specIndexMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths(): { params: { lang: Language } }[] {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(
    specIndexMarkdown(
      params.lang as Language,
      specVersions().map((version) => {
        const summary = specVersionSummary(version);
        return {
          version,
          status: summary.status,
          sections: summary.sections.length,
        };
      })
    ),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
