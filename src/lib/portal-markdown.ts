/**
 * The portal home's Markdown twin.
 *
 * Same shape as the landing's: built from the translations the page renders, so
 * the twin cannot say something different from the page.
 *
 * The transports diagram appears as its `aria-label`. That label is written to
 * state what the diagram argues rather than to describe its shape, which makes
 * it exactly the right stand-in — a twin that dropped the diagram would drop
 * the section's whole point.
 */
import type { Language } from '@/lib/i18n';
import { getTranslations } from '@/lib/translations';

export interface TwinSection {
  heading: string;
  lines: string[];
}

/**
 * Kept in step with `OneSchemaFourTransports.astro` by
 * `tests/unit/lib/portal-nav.test.ts`, which compares this against the
 * component's own `ariaLabel` string.
 */
const TRANSPORTS_SUMMARY: Record<Language, string> = {
  en: 'One place record at the centre, feeding four equivalent transports: the static feed, which the validator measures today, and the read API, write API and MCP server, which are specified but not measured in version 0.1. All four carry the same schema.',
  es: 'Un registro place en el centro que alimenta cuatro transportes equivalentes: el feed estático, que el validador mide hoy, y la API de lectura, la API de escritura y el servidor MCP, que están especificados pero no se miden en la versión 0.1. Los cuatro llevan el mismo esquema.',
};

export function portalSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);

  return [
    {
      heading: t.portal.eyebrow,
      lines: [t.portal.lead],
    },
    {
      heading: t.portal.promiseTitle,
      lines: [t.portal.promiseBody],
    },
    {
      heading: t.portal.transportsTitle,
      lines: [
        t.portal.transportsLead,
        '',
        `> ${TRANSPORTS_SUMMARY[lang] ?? TRANSPORTS_SUMMARY.en}`,
      ],
    },
    {
      heading: t.portal.pathsTitle,
      lines: [
        t.portal.pathsLead,
        '',
        ...t.portal.paths.map(
          (path) => `- **${path.title}** — ${path.body} (${path.forWhom})`
        ),
      ],
    },
    {
      heading: t.portal.startTitle,
      lines: [t.portal.startBody],
    },
  ];
}
