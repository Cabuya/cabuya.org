/**
 * The top-level FAQ's shared content plumbing.
 *
 * The page, its `.md` twin and its `FAQPage` JSON-LD are all built from the
 * same translation entries, through this module — one source, three renders,
 * nothing to drift. `faqBody()` reassembles the entries as `## question`
 * Markdown specifically so the existing `faq-jsonld.ts` generator (heading
 * ends in `?`, answer over 40 characters, sentence-boundary truncation) can
 * police this page under exactly the rules it polices `/developers/faq`.
 */
import type { TwinSection } from '@/lib/home-markdown';
import { getUrlPrefix, type Language } from '@/lib/i18n';
import { getTranslations } from '@/lib/translations';

/** The FAQ as `## question` Markdown — the input `faqJsonLd()` expects. */
export function faqBody(lang: Language): string {
  const t = getTranslations(lang);
  return t.faq.items.map((item) => `## ${item.q}\n\n${item.a}\n`).join('\n');
}

/** The `.md` twin's sections: one per question, plus the developer pointer. */
export function faqSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);

  const items: TwinSection[] = t.faq.items.map((item) => ({
    heading: item.q,
    lines: item.more
      ? [item.a, '', `→ [${item.more.label}](${prefix}${item.more.path})`]
      : [item.a],
  }));

  return [
    ...items,
    {
      heading: t.faq.devFaqTitle,
      lines: [
        t.faq.devFaqBody,
        '',
        `→ [${t.faq.devFaqLink}](${prefix}/developers/faq)`,
      ],
    },
  ];
}
