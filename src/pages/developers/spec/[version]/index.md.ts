import type { APIRoute } from 'astro';

import { specVersionSummary, specVersions } from '@/lib/spec-loader';
import { specVersionMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths() {
  return specVersions().map((version) => ({ params: { version } }));
}

export const GET: APIRoute = ({ params }) => {
  const summary = specVersionSummary(params.version as string);
  return new Response(
    specVersionMarkdown(
      'en',
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
