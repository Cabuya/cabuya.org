/**
 * Inline Markdown → HTML, for text that arrives as a fragment.
 *
 * Changelog bullets and RFC index rows are Markdown, but they are not
 * documents: they are single lines pulled out of a file by a parser, and
 * running them through the full pipeline would mean rendering a document per
 * bullet.
 *
 * ## Escaped first, always
 *
 * The input is escaped before any construct is recognised, so nothing in the
 * source file can emit an element this function did not choose to emit. The
 * files are ours today, which is exactly the argument that stops being true
 * later — a changelog entry proposed in a pull request is text from a stranger,
 * and `set:html` on unescaped input would make merging one an XSS review.
 *
 * The supported subset is what the sources actually contain: inline code, bold,
 * italic, and links. Anything else survives as its own characters, which is the
 * correct outcome for a format nobody promised to render.
 */

/**
 * The stand-in a code span is parked under while emphasis is processed.
 *
 * A private-use codepoint, because the sentinel has to be something the input
 * cannot contain — and the input is arbitrary text from a Markdown file. An
 * earlier version used a word with spaces around it, which would have been
 * substituted inside any bullet that happened to contain it.
 */
const SENTINEL = '\uE000';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Only http(s) and site-relative targets become links.
 *
 * `javascript:` is the reason, and a scheme allowlist is the only version of
 * this check that is not a game of catching spellings.
 */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
  return null;
}

export function inlineMarkdownToHtml(markdown: string): string {
  let html = escapeHtml(markdown);

  // Code first: its contents must not then be read as emphasis.
  const codes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(code);
    return `${SENTINEL}${codes.length - 1}${SENTINEL}`;
  });

  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  /*
   * The target permits one level of nested parentheses. Without it a URL like
   * `…/Article_(disambiguation)` is cut at the first `)` and the remainder
   * leaks into the page as stray text — which is how a legitimate link becomes
   * a rendering bug rather than a broken one.
   */
  html = html.replace(
    /\[([^\]]+)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
    (_whole, text: string, href: string) => {
      const safe = safeHref(href);
      // A link we will not follow renders as its own text, not as a dead
      // anchor and not as nothing — dropping it would silently delete content.
      return safe
        ? `<a href="${safe}" class="underline underline-offset-2">${text}</a>`
        : text;
    }
  );

  return html.replace(
    /\uE000(\d+)\uE000/g,
    (_, index: string) => `<code>${codes[Number(index)]}</code>`
  );
}
