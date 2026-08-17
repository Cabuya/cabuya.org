/**
 * The gate-side copy of the normative-language rule.
 *
 * `src/lib/normative-language.ts` is the source; this is the `.mjs` the audit
 * scripts import, because they run under plain Node with no TypeScript
 * pipeline. `tests/unit/lib/normative-language.test.ts` asserts the two agree
 * — a duplicated rule that drifts is worse than one that is honestly shared.
 */

/** Route families whose body is the English normative text by design. */
const NORMATIVE_ROUTES = [
  /^developers\/spec(\/|$)/,
  /^developers\/schemas(\/|$)/,
  /^developers\/validator\/checks$/,
  /*
   * RFCs are the authors' documents, quoted whole. RFC-0001 is genuinely
   * bilingual as written — the founding agreement is a thing people sign, and
   * both halves have to be signable — so it renders as authored on both
   * language routes rather than being cut in half for either.
   */
  /^rfcs(\/|$)/,
  /*
   * The changelog's entries are quotations from the specification's own
   * changelog file, which is English by the repository language rule. A
   * translated quotation is not the record, and the record is what a reader
   * checking a release needs.
   */
  /^changelog$/,
];

export const NORMATIVE_NOTICE_MARKERS = [
  'normative text is published in English',
  'texto normativo se publica en inglés',
  // The check catalogue's own case: entries that are catalogued but not yet
  // implemented have no Spanish rule, because their rule is translated when
  // the check ships. Narrower than the spec's exemption and stated separately.
  'todavía no implementadas se muestran en inglés',
  'not yet implemented are shown in English',
  // RFCs, quoted as their authors wrote them.
  'as its authors wrote it',
  'como la escribieron sus autores',
  // The changelog, quoted from the repository.
  'entries are quoted from the repository',
  'se citan del repositorio',
];

function bare(pagePath) {
  return pagePath.replace(/^(es|en)\//, '').replace(/^\//, '');
}

export function isNormativeRoute(pagePath) {
  const path = bare(pagePath);
  return NORMATIVE_ROUTES.some((pattern) => pattern.test(path));
}

export function allowsEnglishBody(pagePath, content) {
  if (!isNormativeRoute(pagePath)) return false;
  return NORMATIVE_NOTICE_MARKERS.some((marker) => content.includes(marker));
}
