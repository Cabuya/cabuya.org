import type { APIRoute } from 'astro';

import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  type Language,
} from '@/lib/i18n';
import { specSection, specSections, specVersions } from '@/lib/spec-loader';
import { specSectionMarkdown } from '@/lib/spec-markdown';

export function getStaticPaths() {
  return getSupportedLanguages()
    .filter((lang) => lang !== DEFAULT_LANGUAGE)
    .flatMap((lang) =>
      specVersions().flatMap((version) =>
        specSections(version).map((section) => ({
          params: { lang, version, section: section.slug },
        }))
      )
    );
}

export const GET: APIRoute = ({ params }) => {
  const section = specSection(
    params.version as string,
    params.section as string
  );
  if (!section) return new Response('Not found', { status: 404 });

  return new Response(specSectionMarkdown(section, params.lang as Language), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
    },
  });
};
