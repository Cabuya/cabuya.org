/**
 * Twins for the changelog and the RFC index.
 *
 * Both pages are generated from files an agent could read directly, so the
 * twins are thin: they restate the structure the page shows, in the order it
 * shows it, and point at the sources. What they add is the *status vocabulary*
 * — an agent reading an RFC file sees `status: draft` and has no way
 * to know that draft means nobody has agreed to anything, which is the one
 * thing about this index that must not be misread.
 */
import type { Language } from '@/lib/i18n';
import { inlineMarkdownToHtml } from '@/lib/inline-markdown';
import { specChangelog, specRfcs } from '@/lib/spec-loader';
import { getTranslations } from '@/lib/translations';
import type { TwinSection } from '@/lib/validator-markdown';

/** Strip the inline HTML the renderer would emit, back to plain text. */
const plain = (markdown: string): string =>
  inlineMarkdownToHtml(markdown)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

export function changelogSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  const releases = specChangelog();

  return [
    { heading: t.changelog.title, lines: [t.changelog.lead] },
    {
      heading: t.changelog.scopeTitle,
      // The notice is in the twin as well as on the page: the language gate
      // reads both, and an agent fetching only the Markdown deserves the same
      // explanation a person gets.
      lines: [t.changelog.scopeBody, '', t.changelog.quotedNotice],
    },
    ...releases.map((release) => ({
      heading: /^unreleased$/i.test(release.version)
        ? t.changelog.unreleased
        : `${release.version}${release.date ? ` — ${release.date}` : ''}`,
      lines:
        release.groups.length === 0 && release.notes.length === 0
          ? [t.changelog.nothingYet]
          : [
              ...release.groups.flatMap((group) => [
                `**${t.changelog.groupLabels[group.kind.toLowerCase()] ?? group.kind}**`,
                '',
                ...group.entries.map((entry) => `- ${plain(entry)}`),
                '',
              ]),
              ...release.notes.map((note) => plain(note)),
            ],
    })),
    {
      heading: t.changelog.otherTracksTitle,
      lines: [t.changelog.otherTracksBody],
    },
  ];
}

export function rfcIndexSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  const rfcs = specRfcs();

  return [
    { heading: t.rfcs.title, lines: [t.rfcs.lead, '', t.rfcs.quotedNotice] },
    {
      heading: t.rfcs.columnRfc,
      lines:
        rfcs.length === 0
          ? [t.rfcs.emptyIndex]
          : [
              `| ${t.rfcs.columnRfc} | ${t.rfcs.columnTitle} | ${t.rfcs.columnTier} | ${t.rfcs.columnStatus} | ${t.rfcs.columnOpened} | ${t.rfcs.columnDecided} |`,
              '| --- | --- | --- | --- | --- | --- |',
              ...rfcs.map(
                (rfc) =>
                  `| ${rfc.id} | ${rfc.title} | ${t.rfcs.tierLabels[rfc.tier] ?? rfc.tier} | ${t.rfcs.statusLabels[rfc.status] ?? rfc.status} | ${rfc.opened || '—'} | ${rfc.decided ?? t.rfcs.notDecided} |`
              ),
            ],
    },
    { heading: t.rfcs.processTitle, lines: [t.rfcs.processBody] },
    { heading: t.rfcs.whoTitle, lines: [t.rfcs.whoBody] },
    { heading: t.rfcs.privacyTitle, lines: [t.rfcs.privacyBody] },
  ];
}
