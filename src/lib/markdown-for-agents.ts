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
import { getUrlPrefix, type Language } from '@/lib/i18n';
import { NAV_ENTRIES, navHref } from '@/lib/site-navigation';
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
  for (const entry of NAV_ENTRIES) {
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
