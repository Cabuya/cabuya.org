import type { APIRoute } from 'astro';

import { specSchema, specSchemas, specVersions } from '@/lib/spec-loader';
import { schemaMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths() {
  return specVersions().flatMap((version) =>
    specSchemas(version).map((schema) => ({
      params: { version, name: schema.name },
    }))
  );
}

export const GET: APIRoute = ({ params }) => {
  const schema = specSchema(params.version as string, params.name as string);
  if (!schema) return new Response('Not found', { status: 404 });

  return new Response(schemaMarkdown(schema, 'en'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
};
