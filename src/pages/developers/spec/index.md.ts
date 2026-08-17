import type { APIRoute } from 'astro';

import { specVersionSummary, specVersions } from '@/lib/spec-loader';
import { specIndexMarkdown } from '@/lib/spec-markdown';

export const GET: APIRoute = () =>
  new Response(
    specIndexMarkdown(
      'en',
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
