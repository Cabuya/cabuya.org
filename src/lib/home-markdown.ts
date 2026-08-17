/**
 * The landing page's Markdown twin, built from the same translations the page
 * renders.
 *
 * The twin is not a summary. `md:check` measures coverage against the HTML and
 * fails below 0.85, which is the mechanism that keeps this from decaying into
 * a paragraph and a link — an agent reading `/index.md` gets the same argument
 * a person reading `/` does, including the parts we would rather compress.
 *
 * Diagrams appear as their `aria-label`: the label is written to state what the
 * diagram argues, so it is exactly the right stand-in for a reader who cannot
 * see it. A twin that silently dropped four diagrams would drop four beats.
 */
import type { Language } from '@/lib/i18n';
import { diagramLines } from '@/lib/markdown-for-agents';
import { displayHost, publishersForDisplay } from '@/lib/registry-loader';
import { getTranslations } from '@/lib/translations';

export interface TwinSection {
  heading: string;
  lines: string[];
}

export function homeSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  const publishers = publishersForDisplay();

  return [
    {
      heading: t.home.hero.eyebrow,
      lines: [t.home.hero.pitch, '', t.home.hero.pitchSecond],
    },
    {
      heading: t.home.thesis.kicker,
      lines: [
        `> ${t.home.thesis.principle}`,
        `> ${t.home.thesis.gloss}`,
        '',
        t.home.thesis.body,
        '',
        t.home.thesis.bodySecond,
        '',
        t.home.thesis.intentNote,
      ],
    },
    {
      heading: t.home.howItWorks.title,
      lines: [
        t.home.howItWorks.lead,
        ...diagramLines('quickstartPath', lang),
        '',
        ...t.home.howItWorks.steps.map(
          (step, index) => `${index + 1}. **${step.title}** — ${step.body}`
        ),
      ],
    },
    {
      heading: t.home.ladder.title,
      lines: [
        t.home.ladder.lead,
        ...diagramLines('conformanceLadder', lang),
        '',
        t.home.ladder.respectNote,
      ],
    },
    {
      heading: t.home.network.title,
      lines: [
        t.home.network.lead,
        ...diagramLines('networkFlow', lang),
        '',
        ...publishers.map(
          (entry) =>
            `- ${displayHost(entry)} — ${entry.entity_domains.join(', ')} — ${t.home.network.proposedLabel}`
        ),
        '',
        t.home.network.proposedExplainer,
        '',
        t.home.network.measuredNote,
      ],
    },
    {
      heading: `${t.home.horizon.title} (${t.home.horizon.ambitionLabel})`,
      lines: t.home.horizon.stages.map(
        (stage) => `- **${stage.title}** — ${stage.body}`
      ),
    },
    {
      heading: t.home.finalCta.title,
      lines: [t.home.finalCta.body],
    },
  ];
}
