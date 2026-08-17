/**
 * Twins for the registry surfaces.
 *
 * The registry is the page most likely to be read by something that is not a
 * person. An agent deciding whether to consume a feed wants the state, the
 * timestamp and the failing check ids — not a table with filter controls above
 * it — and a consumer building a client wants the whole index in one fetch.
 *
 * So the twins carry the same facts as the pages, including the two sentences
 * about endorsement. Those are not decoration that can be dropped for brevity:
 * they are the terms the data is published under, and an agent that ingests the
 * list without them is exactly the reader most likely to treat inclusion as a
 * recommendation.
 *
 * Measured state is read the same way the pages read it, so the `.md` and the
 * HTML built in the same run cannot disagree.
 */

import {
  badgeEmbedSnippets,
  STATE_DESCRIPTIONS,
  STATE_LABELS,
} from '@/lib/badge';
import type { Language } from '@/lib/i18n';
import type {
  MeasuredStatus,
  OfficialSource,
  PublisherEntry,
} from '@/lib/registry-loader';
import { displayHost, publisherHistory } from '@/lib/registry-loader';
import { measurementAge } from '@/lib/registry-status';
import { getTranslations } from '@/lib/translations';
import type { TwinSection } from '@/lib/validator-markdown';

export function registryIndexSections(
  lang: Language,
  entries: PublisherEntry[],
  sources: OfficialSource[],
  statuses: Map<string, MeasuredStatus>,
  now: Date,
  /** False when this build had no measurement store, exactly as the page says. */
  live: boolean
): TwinSection[] {
  const t = getTranslations(lang);
  const domainLabel = (domain: string): string =>
    t.registry.domainLabels[domain] ?? domain;

  const rows = entries.map((entry) => {
    const status = statuses.get(entry.publisher_id);
    const state = status?.state ?? 'unmeasured';
    const checked = status?.checked_at
      ? measurementAge(status.checked_at, now, lang)
      : t.registry.neverMeasured;
    return `| \`${entry.publisher_id}\` | ${STATE_LABELS[state][lang]} | ${status?.level ?? '—'} | ${entry.entity_domains.map(domainLabel).join(', ')} | ${checked} |`;
  });

  return [
    {
      heading: t.registry.title,
      lines: [t.registry.lead],
    },
    {
      heading: t.registry.notEndorsementTitle,
      // The build-time caveat is carried too. An agent reading a `.md` built
      // without the measurement store must be told the same thing a person
      // reading the page is told, or it will ingest a wall of `unmeasured` as
      // a finding about the publishers.
      lines: live
        ? [t.registry.notEndorsement, '', t.registry.everyEntryMeasured]
        : [
            t.registry.notEndorsement,
            '',
            t.registry.everyEntryMeasured,
            '',
            t.registry.buildTimeOnlyNote,
          ],
    },
    {
      heading: t.registry.columnPublisher,
      lines: [
        `| ${t.registry.columnPublisher} | ${t.registry.columnState} | ${t.registry.columnLevel} | ${t.registry.columnDomains} | ${t.registry.columnChecked} |`,
        '| --- | --- | --- | --- | --- |',
        ...rows,
      ],
    },
    {
      // What the page's filter controls offer, stated as facets. An agent
      // cannot use a `<select>`, but it can use the knowledge that the registry
      // is indexed on these four dimensions.
      heading: t.registry.filterTitle,
      lines: [
        `${t.registry.filterSearch} · ${t.registry.filterState} · ${t.registry.filterDomain} · ${t.registry.filterReview} (${t.registry.filterAll})`,
      ],
    },
    {
      heading: t.registry.reviewTitle,
      lines: [t.registry.reviewBody],
    },
    {
      heading: t.registry.officialSourcesTitle,
      lines: [
        t.registry.officialSourcesBody,
        '',
        ...sources.flatMap((source) => [
          `- **${source.name[lang]}** — ${t.registry.officialAuthorityLabel}: ${source.authority}. <${source.canonical_url}>${source.notes ? ` ${source.notes[lang]}` : ''}`,
        ]),
      ],
    },
    {
      heading: t.registry.licenceTitle,
      lines: [t.registry.licenceBody],
    },
    {
      heading: t.registry.joinTitle,
      lines: [t.registry.joinBody],
    },
  ];
}

export function publisherSections(
  lang: Language,
  entry: PublisherEntry,
  status: MeasuredStatus | undefined,
  now: Date,
  /** Origin, so the embed snippets in the twin are the ones on the page. */
  origin: string
): TwinSection[] {
  const t = getTranslations(lang);
  const state = status?.state ?? 'unmeasured';
  const history = publisherHistory(entry.publisher_id);
  const embed = badgeEmbedSnippets(origin, entry.publisher_id, lang);

  const measured: string[] = [
    t.registry.measuredBody,
    '',
    `- **${t.registry.stateLabel}**: ${STATE_LABELS[state][lang]} — ${STATE_DESCRIPTIONS[state][lang]}`,
    `- **${t.registry.levelLabel}**: ${status?.level ?? '—'}`,
    `- **${t.registry.checkedLabel}**: ${
      status?.checked_at
        ? `${status.checked_at} (${measurementAge(status.checked_at, now, lang)})`
        : t.registry.neverMeasured
    }`,
  ];

  if (status?.failing_checks?.length) {
    measured.push(
      '',
      `**${t.registry.failingChecksTitle}**: ${status.failing_checks
        .map((id) => `\`${id}\``)
        .join(', ')}`
    );
  }

  const declared: string[] = [
    t.registry.declaredBody,
    '',
    `- **${t.registry.canonicalLabel}**: <${entry.canonical_url}> (${displayHost(entry)})`,
    `- **${t.registry.domainsLabel}**: ${entry.entity_domains
      .map((domain) => t.registry.domainLabels[domain] ?? domain)
      .join(', ')}`,
  ];
  if (entry.events?.length) {
    declared.push(
      `- **${t.registry.eventsLabel}**: ${entry.events.join(', ')}`
    );
  }
  declared.push(
    `- **${t.registry.addedLabel}**: ${entry.added} — ${
      entry.status === 'proposed'
        ? t.registry.reviewProposed
        : t.registry.reviewReviewed
    }`
  );
  if (entry.confirmed) {
    declared.push(`- **${t.registry.confirmedLabel}**: ${entry.confirmed}`);
  } else {
    declared.push('', t.registry.unconfirmedNote);
  }
  if (entry.notes) {
    declared.push('', `**${t.registry.notesLabel}**: ${entry.notes[lang]}`);
  }

  return [
    {
      heading: entry.publisher_id,
      lines: [t.registry.lead],
    },
    { heading: t.registry.measuredTitle, lines: measured },
    { heading: t.registry.declaredTitle, lines: declared },
    {
      heading: t.registry.historyTitle,
      // The explanation is printed whether or not there are points: it says why
      // the record is kept, which is as true of an empty one as of a full one.
      lines: [
        t.registry.historyBody,
        '',
        ...(history.length > 0
          ? history
              .slice(-30)
              .map(
                (point) =>
                  `- ${point.date} — ${STATE_LABELS[point.state][lang]}${
                    point.level ? ` (${point.level})` : ''
                  }`
              )
          : [t.registry.historyEmpty]),
      ],
    },
    {
      heading: t.registry.embedTitle,
      lines: [
        t.registry.embedBody,
        '',
        `${t.registry.embedMarkdown}:`,
        '',
        '```markdown',
        embed.markdown,
        '```',
        '',
        `${t.registry.embedHtml}:`,
        '',
        '```html',
        embed.html,
        '```',
      ],
    },
    {
      heading: t.registry.backToIndex,
      lines: [`${origin}${lang === 'es' ? '/es' : ''}/registry`],
    },
    {
      heading: t.registry.notEndorsementTitle,
      lines: [t.registry.notEndorsement],
    },
  ];
}
