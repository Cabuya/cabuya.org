import type { APIRoute } from 'astro';

import { specSection, specSections, specVersions } from '@/lib/spec-loader';
import { specSectionMarkdown } from '@/lib/spec-markdown';

/**
 * `/developers/spec/{version}/{section}.md` — the source file itself.
 *
 * Not a serialization of the rendered page: the specification is already
 * Markdown, and an agent asking for it should get the normative text rather
 * than a description of it.
 */
export function getStaticPaths() {
  return specVersions().flatMap((version) =>
    specSections(version).map((section) => ({
      params: { version, section: section.slug },
    }))
  );
}

export const GET: APIRoute = ({ params }) => {
  const section = specSection(
    params.version as string,
    params.section as string
  );
  if (!section) return new Response('Not found', { status: 404 });

  return new Response(specSectionMarkdown(section, 'en'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
};
