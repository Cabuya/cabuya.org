/**
 * `FAQPage` structured data, extracted from the page itself.
 *
 * Generated rather than hand-written, for the reason every generated thing in
 * this repository is generated: a second copy of the answers, maintained by
 * hand, drifts — and the copy that drifts is the one search engines read and
 * nobody proofreads. If the page says one thing and its JSON-LD says another,
 * the wrong one is the one that ends up in a search result.
 *
 * Each `##` heading that is a question — it ends in a question mark — becomes
 * one entry, and everything until the next `##` is its answer. That is not a
 * convention imposed on the writer; it is what an FAQ page already looks like,
 * and a page that stops looking like one stops emitting the markup rather than
 * emitting something wrong.
 *
 * The question mark is the test rather than "every heading" because an FAQ page
 * usually ends with a *Anything else* section, and `FAQPage` promises a search
 * engine that every `mainEntity` is a question with an answer. A closing
 * pointer to the specification is neither.
 *
 * ## What gets stripped
 *
 * Markdown becomes plain text: link targets go, emphasis markers go, code
 * fences go. Search engines render this text directly, and `[the rules](/x)`
 * shown to a person in a result is worse than no rich result at all. Section
 * references survive as words because they are part of the answer.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Google's documented limit for an answer is generous, but a rich result shows
 * a couple of lines. Cutting at a sentence boundary near 900 characters keeps
 * the answer complete enough to stand alone and short enough that the whole of
 * it could plausibly be displayed.
 */
const MAX_ANSWER = 900;

function toPlainText(markdown: string): string {
  return (
    markdown
      // Blockquote markers, list bullets and heading hashes are structure.
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^>\s?/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/^#{1,6}\s+/gm, '')
      // Links keep their text and lose their target.
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Emphasis and inline code markers. Underscores are left alone: they are
      // part of field names here (`last_confirmed_at`), and stripping them
      // produced `lastconfirmedat` in an earlier version of this code.
      .replace(/[*`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function truncate(text: string): string {
  if (text.length <= MAX_ANSWER) return text;
  const window = text.slice(0, MAX_ANSWER);
  const sentence = window.lastIndexOf('. ');
  if (sentence > MAX_ANSWER / 2) return window.slice(0, sentence + 1);
  return `${window.slice(0, window.lastIndexOf(' '))}…`;
}

/**
 * Pull question/answer pairs out of a Markdown body.
 *
 * A heading with no prose under it is skipped rather than emitted with an
 * empty answer — an FAQ entry that answers nothing is worse than a missing
 * one, because it renders as a question a search engine promises to have
 * answered.
 */
export function faqEntries(body: string): FaqEntry[] {
  const sections = body.split(/^##\s+/m).slice(1);

  return sections
    .map((section) => {
      const newline = section.indexOf('\n');
      const question = section.slice(0, newline === -1 ? undefined : newline);
      const answer = newline === -1 ? '' : section.slice(newline);
      return {
        question: toPlainText(question),
        answer: truncate(toPlainText(answer)),
      };
    })
    .filter(
      (entry) =>
        // Works in both languages: Spanish opens with ¿ and closes with ? too.
        entry.question.endsWith('?') && entry.answer.length > 40
    );
}

/** The `FAQPage` graph, or null when the page has nothing to say. */
export function faqJsonLd(
  body: string,
  url: string,
  lang: string
): Record<string, unknown> | null {
  const entries = faqEntries(body);
  if (entries.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    inLanguage: lang,
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}
