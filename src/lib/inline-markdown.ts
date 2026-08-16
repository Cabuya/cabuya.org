/**
 * Minimal inline-Markdown renderer for authored institutional copy.
 *
 * Institutional pages are copy objects, not Markdown files, so `**bold**` and
 * `` `code` `` inside those strings used to render as literal asterisks and
 * backticks (and long inline URLs pushed the page into horizontal scroll on
 * phones, because plain text has no wrap opportunity).
 *
 * This converts exactly those two inline forms and nothing else. HTML is
 * escaped first, so a stray `<` in the copy can never become markup — the
 * output is only ever safe to pass to `set:html` because every tag in it was
 * written here, not in the copy.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ESCAPES[character] as string);

/** `code` gets `break-words` so long endpoint URLs wrap instead of overflowing. */
const CODE_CLASS =
  'rounded bg-cabuya-primary-soft px-1.5 py-0.5 font-mono text-[0.9em] break-words text-cabuya';
const STRONG_CLASS = 'font-semibold text-cabuya';

export function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, `<code class="${CODE_CLASS}">$1</code>`)
    .replace(/\*\*([^*]+)\*\*/g, `<strong class="${STRONG_CLASS}">$1</strong>`);
}
