/**
 * Agent-friendly Markdown serialization.
 *
 * Every HTML page serves a complete `.md` twin (the completeness contract in
 * docs/aeo/MARKDOWN_FOR_AGENTS.md). This module holds the shared serializer;
 * per-surface serializers (spec sections, registry entries, the check
 * catalogue) are added by the tasks that ship those surfaces (Task 32
 * completes the layer).
 *
 * Migration note (Task 7): the blog/institutional serializers were retired
 * with their surfaces.
 */
import { SITE_URL } from '@/lib/constances';
import { DIAGRAM_COPY } from '@/lib/diagram-copy';
import { getUrlPrefix, type Language } from '@/lib/i18n';
import { agentNavEntries, navHref } from '@/lib/site-navigation';
import { getTranslations } from '@/lib/translations';

export interface MarkdownSection {
  heading: string;
  lines: string[];
}

export interface GenericMarkdownInput {
  title: string;
  description: string;
  lang: Language;
  canonical: string;
  /** Pre-rendered Markdown body (may be empty). */
  body?: string;
  sections?: MarkdownSection[];
}

/** The alternate-language URL for a route path ('' = home). */
export function alternateUrl(lang: Language, routePath: string): string {
  const other: Language = lang === 'es' ? 'en' : 'es';
  const prefix = getUrlPrefix(other);
  return `${SITE_URL}${prefix}${routePath === '/' ? '' : routePath}/`.replace(
    /\/+$/,
    '/'
  );
}

/** The shared "Site navigation" block every twin carries. */
export function siteNavigationBlock(lang: Language): string[] {
  const t = getTranslations(lang);
  const lines = [`## ${t.markdown.siteNavigation}`, ''];
  for (const entry of agentNavEntries()) {
    const href = entry.external
      ? entry.path
      : `${SITE_URL}${navHref(entry, lang)}`;
    lines.push(`- [${entry.label[lang] ?? entry.label.en}](${href})`);
  }
  return lines;
}

/**
 * Serialize a page to agent-friendly Markdown: front block (title,
 * description, canonical, language), body, extra sections, and the shared
 * Site navigation block.
 */
export function serializeGenericToMarkdown(
  input: GenericMarkdownInput
): string {
  const { title, description, lang, canonical, body, sections } = input;
  const lines: string[] = [
    `# ${title}`,
    '',
    description,
    '',
    `Canonical: ${canonical}`,
    `Language: ${lang}`,
    '',
  ];

  if (body?.trim()) {
    lines.push(body.trim(), '');
  }

  for (const section of sections ?? []) {
    lines.push(`## ${section.heading}`, '', ...section.lines, '');
  }

  lines.push(...siteNavigationBlock(lang), '');
  return lines.join('\n');
}

/**
 * A diagram, as a twin can carry it.
 *
 * The picture cannot travel, and neither can the eight SVGs this site draws.
 * What can travel is the description already written for a screen reader —
 * `ariaLabel` — plus the caption printed under the figure. A reader who cannot
 * see the diagram and an agent that cannot render it need the same sentences.
 *
 * Emitted as a blockquote so it is visibly not body prose: the twin should not
 * read as though the site said this in a paragraph.
 */
export function diagramLines(id: string, lang: Language): string[] {
  const copy = DIAGRAM_COPY[id]?.[lang];
  if (!copy) return [];
  const label = getTranslations(lang).docs.diagram;
  return ['', `> **${label}.** ${copy.caption}`, '>', `> ${copy.ariaLabel}`];
}

/**
 * What a root document's page says that the file itself does not.
 *
 * `/join`, `/governance` and `/trademark` render a repository file verbatim,
 * and their twins serve that file unchanged — re-serializing Markdown from its
 * own rendered HTML would be a worse copy of something we already have. But the
 * page wraps the file in two things the file cannot carry: where the source
 * lives, and, on `/join`, what happens to anything you send through the form.
 *
 * The second is the one that had to move. The page states that a message is not
 * stored, logged, measured or kept after the request; the twin said nothing, so
 * an agent asked how to reach the maintainers could not repeat the one sentence
 * that governs what it would be handing over.
 */
export function rootDocSections(
  lang: Language,
  options: { contact?: boolean } = {}
): MarkdownSection[] {
  const t = getTranslations(lang);
  const sections: MarkdownSection[] = [
    {
      heading: t.rootDocs.sourceHeading,
      lines: [t.rootDocs.sourceNote],
    },
  ];

  if (options.contact) {
    sections.push({
      heading: t.contact.title,
      lines: [t.contact.lead, '', t.contact.privacy],
    });
  }

  return sections;
}
