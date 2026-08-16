/**
 * The golden corpus manifest.
 *
 * Every fixture derives from a real shape observed in the ecosystem's
 * founding analysis, **de-identified into fully synthetic values** — no real
 * publisher name, no real person, no real contact, ever. Each entry records
 * the shape it derives from so a reader can trace why the case exists
 * without the fixture carrying anything it shouldn't.
 *
 * The structural invariant (asserted in `corpus.test.ts`): every implemented
 * ERROR check has at least one must-fail fixture AND one near-miss that must
 * not fire it. A check that cannot be silenced is a check nobody trusts.
 */

export interface CorpusEntry {
  /** Fixture name, unique. */
  name: string;
  /** The check this case exercises. */
  check: string;
  /** 'fail' = must produce the check; 'near-miss' = must NOT. */
  kind: 'fail' | 'near-miss';
  /** The real-world shape this is derived from (no identifying detail). */
  derivedFrom: string;
}

export const CORPUS_NOTES = `
Derivation policy:
  - Shapes come from the 20-app analysis in docs/context/APPS_MATRIX.md and
    the per-app dossiers; values are invented.
  - Phone-shaped strings use the 3000000000 / +57 300 000 0000 all-zeros
    form; names use "Ejemplo"; domains use .invalid or example-app.org.
  - No fixture may contain a value that resolves to a real person or org.
`.trim();
