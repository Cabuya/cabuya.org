/**
 * The origin page's Markdown twin.
 *
 * Composed from the same translation keys the page renders, so the twin cannot
 * drift into a summary: every section the reader sees has a section here, in
 * the same order, with the same sentences.
 *
 * The two idioms keep their Spanish in both languages, with the gloss beside
 * them — the same treatment the founding principle gets in the footer. A
 * translated idiom is not the idiom; the whole point of that section is that
 * the phrase already existed.
 */

import type { Language } from '@/lib/i18n';
import type { MarkdownSection } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export function aboutSections(lang: Language): MarkdownSection[] {
  const t = getTranslations(lang);

  return [
    {
      heading: t.about.fibreTitle,
      lines: [
        t.about.fibreBody,
        '',
        `> ${t.about.fibreSource}`,
        '',
        t.about.fibreSecond,
      ],
    },
    {
      heading: t.about.metaphorTitle,
      lines: [t.about.metaphorBody, '', t.about.metaphorSecond],
    },
    {
      heading: t.about.neutralTitle,
      lines: [t.about.neutralBody, '', t.about.neutralSecond],
    },
    { heading: t.about.verbTitle, lines: [t.about.verbBody] },
    { heading: t.about.downsideTitle, lines: [t.about.downsideBody] },
    {
      heading: t.about.outlivesTitle,
      lines: [t.about.outlivesBody, '', t.about.outlivesSecond],
    },
    {
      heading: t.about.ctaTitle,
      lines: [t.about.ctaBody],
    },
  ];
}
