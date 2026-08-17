/**
 * Where English normative text is allowed to appear on a Spanish route.
 *
 * The protocol's normative text is English. That is a stated decision, not an
 * accident of resourcing: MUST and SHOULD are terms of art whose meaning is
 * fixed by RFC 2119, a translation of a normative clause is a second document
 * that can disagree with the first, and a specification with two texts that
 * disagree has no text at all.
 *
 * So `/es/developers/spec/**` and `/es/developers/schemas/**` render the
 * English body with a notice above it saying exactly that. Everything around
 * the body — navigation, headings, labels, the notice itself — is Spanish.
 *
 * The language gates would otherwise be right to fail those pages, and the
 * temptation is to exempt "the spec pages" by hand and move on. Instead this
 * module makes the exemption conditional and narrow:
 *
 *   - it applies to two route families and nothing else, and
 *   - only when the page actually carries the notice.
 *
 * A Spanish page that quietly renders English **without** telling the reader
 * why still fails, which is the case worth catching.
 */

/** Route families whose body is the English normative text by design. */
const NORMATIVE_ROUTES = [
  /^developers\/spec(\/|$)/,
  /^developers\/schemas(\/|$)/,
];

/**
 * A phrase from the notice, in each language, that the gate can look for.
 *
 * Deliberately a fragment rather than the whole sentence: the notice is
 * editorial copy and will be reworded, and a gate that breaks on a comma is a
 * gate somebody disables.
 */
export const NORMATIVE_NOTICE_MARKERS = [
  'normative text is published in English',
  'texto normativo se publica en inglés',
];

/** Strip a language prefix, so one rule covers every language. */
function bare(pagePath: string): string {
  return pagePath.replace(/^(es|en)\//, '').replace(/^\//, '');
}

/** Is this route one whose body is normative English by design? */
export function isNormativeRoute(pagePath: string): boolean {
  const path = bare(pagePath);
  return NORMATIVE_ROUTES.some((pattern) => pattern.test(path));
}

/**
 * May this document render English on a non-English route?
 *
 * Only when it is a normative route **and** it carries the notice. The second
 * condition is the whole point: without it this would be a blanket exemption,
 * and a Spanish page that silently served English would pass.
 */
export function allowsEnglishBody(pagePath: string, content: string): boolean {
  if (!isNormativeRoute(pagePath)) return false;
  return NORMATIVE_NOTICE_MARKERS.some((marker) => content.includes(marker));
}
