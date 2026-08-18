/**
 * The `/start` page's Markdown twin, from the same translations the page
 * renders — the twin cannot drift into a summary.
 */

import type { Language } from '@/lib/i18n';
import type { MarkdownSection } from '@/lib/markdown-for-agents';
import { START_COMMANDS } from '@/lib/start-commands';
import { getTranslations } from '@/lib/translations';

export function startSections(lang: Language): MarkdownSection[] {
  const t = getTranslations(lang);

  return [
    {
      heading: t.start.installTitle,
      lines: [
        t.start.installBody,
        '',
        '```bash',
        START_COMMANDS.install,
        '# or, vendored into your repository:',
        START_COMMANDS.installVendored,
        '```',
      ],
    },
    {
      heading: t.start.sayTitle,
      lines: ['```', START_COMMANDS.invoke, '```', '', t.start.sayBody],
    },
    { heading: t.start.whatTitle, lines: [t.start.whatBody] },
    {
      heading: t.start.asksTitle,
      lines: [t.start.asksBody, '', t.start.asksDwp, '', t.start.asksPlanMode],
    },
    {
      heading: t.start.gateTitle,
      lines: [t.start.gateBody, '', t.start.gateCeiling],
    },
    { heading: t.start.questionsTitle, lines: [t.start.questionsBody] },
    {
      heading: t.start.refusesTitle,
      lines: t.start.refuses.map((r) => `- ${r}`),
    },
  ];
}
