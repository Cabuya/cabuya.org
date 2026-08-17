import type { APIRoute } from 'astro';

import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  type Language,
} from '@/lib/i18n';
import { specVersionSummary, specVersions } from '@/lib/spec-loader';
import { specVersionMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths() {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .flatMap((lang) =>
      specVersions().map((version) => ({ params: { lang, version } }))
    );
}

export const GET: APIRoute = ({ params }) => {
  const summary = specVersionSummary(
    params.version as string,
    params.lang as string
  );
  return new Response(
    specVersionMarkdown(
      params.lang as Language,
      summary.version,
      summary.status,
      summary.sections
    ),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
