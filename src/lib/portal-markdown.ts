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
import { diagramLines } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export interface TwinSection {
  heading: string;
  lines: string[];
}


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
        ...diagramLines('oneSchemaFourTransports', lang),
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
