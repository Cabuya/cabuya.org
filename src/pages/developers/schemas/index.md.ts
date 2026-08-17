import type { APIRoute } from 'astro';

import { specSchemas, specVersions } from '@/lib/spec-loader';
import { schemaIndexMarkdown } from '@/lib/spec-markdown';

export const GET: APIRoute = () =>
  new Response(
    schemaIndexMarkdown(
      'en',
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
