/**
 * The pages whose content is multilingual by nature, not by omission.
 *
 * This replaced a `normative-english` exemption that covered fifteen pages and
 * excused any English body behind a printed notice. Eleven of those were simply
 * untranslated, and the exemption is the reason nobody noticed for as long as
 * they did. They are translated now — `spec/versions/0.1/es/` for the normative
 * sections, `spec/schemas/0.1/es/descriptions.json` for the field
 * descriptions, and the validator package's `ES` table for every check.
 *
 * These two cannot be, and each says so on its own page:
 *
 *   changelog   quotes release entries from the repository verbatim. A
 *               translated quotation is not the record somebody came to check.
 *   rfcs/0001   is bilingual by design — it is a document people sign, and
 *               both halves have to be signable, so each language's page
 *               necessarily carries the other's half.
 *   rfcs/0002   follows 0001's convention: one normative proposal, both
 *               languages in one reviewable document, so each language's page
 *               carries the other's half.
 *
 * Listed one page at a time rather than by route family, so adding a third is
 * a decision somebody makes here with a reason, instead of a new page quietly
 * inheriting an exemption meant for two.
 *
 * Shared by `lang:check` and `md:check` for the reason `dist-pages.mjs` is
 * shared: two copies of a list like this drift, and the copy that drifts is
 * the one that stops failing.
 */

export const INHERENTLY_BILINGUAL = new Set([
  'changelog',
  'es/changelog',
  'rfcs/0001',
  'es/rfcs/0001',
  'rfcs/0002',
  'es/rfcs/0002',
]);

/** Is this page one of them? */
export function isInherentlyBilingual(pagePath) {
  return INHERENTLY_BILINGUAL.has(pagePath);
}
