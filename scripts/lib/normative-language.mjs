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
];

export const NORMATIVE_NOTICE_MARKERS = [
  'normative text is published in English',
  'texto normativo se publica en inglés',
  // The check catalogue's own case: entries that are catalogued but not yet
  // implemented have no Spanish rule, because their rule is translated when
  // the check ships. Narrower than the spec's exemption and stated separately.
  'todavía no implementadas se muestran en inglés',
  'not yet implemented are shown in English',
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
