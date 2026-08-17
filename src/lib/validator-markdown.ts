/**
 * Twins for the validator surfaces.
 *
 * The checks twin matters more than most: it is the whole catalogue in one
 * fetch, which is exactly what an agent wants before it starts a fix loop —
 * every id, rule and remedy, without following 62 anchors.
 */
import { CHECKS, ES } from '@cabuya/validator';

import type { Language } from '@/lib/i18n';
import { getTranslations } from '@/lib/translations';
import { URL_MODE_AVAILABLE } from '@/lib/validate-api-contract';

export interface TwinSection {
  heading: string;
  lines: string[];
}

export function validatorSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  return [
    {
      heading: t.validator.title,
      lines: [t.validator.lead],
    },
    {
      heading: t.validator.urlModeTitle,
      // The twin says what the page says. Reading the same flag is the only
      // way that stays true without somebody remembering to check.
      lines: URL_MODE_AVAILABLE
        ? [t.validator.urlModeLead]
        : [
            t.validator.urlModeLead,
            '',
            `${t.validator.unavailableTitle}. ${t.validator.unavailableBody}`,
          ],
    },
    {
      heading: t.validator.pasteModeTitle,
      lines: [t.validator.pasteModeLead, '', t.validator.pastePrivacy],
    },
    {
      heading: t.validator.resultTitle,
      lines: [
        `${t.validator.blockersTitle} · ${t.validator.errorsTitle} · ${t.validator.warningsTitle} · ${t.validator.notesTitle}`,
        '',
        t.validator.degradedNote,
        '',
        t.validator.transportBody,
      ],
    },
  ];
}

export function checksSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  const implemented = CHECKS.filter((check) => check.implemented).length;
  /** Spanish title, rule and fix from the package's own table; ids never translate. */
  const localized = (
    id: string,
    field: 'title' | 'rule' | 'fix'
  ): string | undefined => (lang === 'es' ? ES[id]?.[field] : undefined);

  const sections: TwinSection[] = [
    {
      heading: t.checks.title,
      lines: [
        t.checks.lead,
        '',
        `${CHECKS.length} ${t.checks.countSummary} · ${implemented} ${t.checks.implementedLabel}.`,
        '',
        t.checks.stableNote,
      ],
    },
  ];

  const families = [...new Set(CHECKS.map((check) => check.family))];
  for (const family of families) {
    const group = CHECKS.filter((check) => check.family === family);
    sections.push({
      heading: t.checks.familyLabels[family] ?? family,
      lines: group.flatMap((check) => [
        `### ${check.id} — ${localized(check.id, 'title') ?? check.title}`,
        '',
        `- ${t.checks.severityLabel}: ${check.severity} · ${t.checks.levelLabel}: ${check.level} · ${
          check.implemented
            ? t.checks.implementedLabel
            : `${t.checks.plannedLabel}${check.plannedIn ? ` (${check.plannedIn})` : ''}`
        }`,
        `- ${t.checks.ruleLabel}: ${localized(check.id, 'rule') ?? check.rule}`,
        `- ${t.checks.fixLabel}: ${localized(check.id, 'fix') ?? check.fix}`,
        `- ${t.checks.specLabel}: ${check.specAnchor}`,
        '',
      ]),
    });
  }

  return sections;
}

export function probeSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  return [
    { heading: t.probe.title, lines: [t.probe.lead] },
    {
      heading: t.probe.uaTitle,
      lines: [
        t.probe.uaBody,
        '',
        '```',
        'CabuyaValidator/0.1 (+https://cabuya.org/developers/validator/probe)',
        '```',
      ],
    },
    {
      heading: t.probe.whatTitle,
      lines: t.probe.whatItems.map((item) => `- ${item}`),
    },
    {
      heading: t.probe.politenessTitle,
      lines: t.probe.politenessItems.map((item) => `- ${item}`),
    },
    { heading: t.probe.retentionTitle, lines: [t.probe.retentionBody] },
    {
      heading: t.probe.optOutTitle,
      lines: [
        t.probe.optOutBody,
        '',
        '```',
        'User-agent: CabuyaValidator',
        'Disallow: /',
        '```',
      ],
    },
  ];
}
