/**
 * The bilingual audit's detector.
 *
 * This module decides whether a block of text on `/` is secretly Spanish, or a
 * block on `/es` secretly English — which is the whole mechanism behind the
 * `lang:check` gate. It is worth testing carefully for a reason its own
 * comments make plain: **almost every threshold in it exists because of a
 * specific false positive**, each one found on a real page, and each one
 * capable of making the gate unusable if it comes back.
 *
 * So the interesting tests here are not "detects Spanish". They are the four
 * documented near-misses:
 *
 *   · an English book title cited in a Spanish post
 *   · a venue name — `Universidad Tecnológica de Pereira, Bloque 13`
 *   · a language-code parenthetical, `(EN/ES)`, whose letters lowercase into
 *     two of the strongest Spanish stopwords
 *   · this project's own PII deny-list, which documents Spanish field names on
 *     an English page
 *
 * A test suite that only covered the happy path would let any of them return.
 */
import { describe, expect, it } from 'vitest';

import {
  analyzeDocument,
  CONFIDENT_MISMATCH_CONFIDENCE,
  capitalizedShare,
  detectLanguage,
  htmlToText,
  MIN_CONFIDENT_EVIDENCE,
  markdownToText,
  splitIntoBlocks,
  tokenize,
} from '@/lib/language-detect';

describe('tokenize', () => {
  it('lowercases and drops punctuation', () => {
    expect(tokenize('Hola, ¿qué tal?')).toEqual(['hola', 'qué', 'tal']);
  });

  it('keeps apostrophes and hyphens inside words', () => {
    expect(tokenize("don't re-run")).toEqual(["don't", 're-run']);
  });

  it('removes language-code parentheticals before lowercasing', () => {
    /*
     * The documented failure: `(EN/ES)` lowercases into "en" and "es", two of
     * the strongest Spanish stopwords. An English sentence carrying it scored
     * es=2, en=0, confidence 1.00 — a confident Spanish mismatch on an English
     * page, from a label about language.
     */
    expect(tokenize('language (EN/ES) matters')).toEqual([
      'language',
      'matters',
    ]);
    expect(tokenize('idioma (ES)')).toEqual(['idioma']);
    expect(tokenize('served (EN, PT)')).toEqual(['served']);
  });

  it('leaves lowercase parentheticals alone', () => {
    // Only the uppercase form is a language code. `(en la casa)` is prose.
    expect(tokenize('vive (en la casa)')).toContain('en');
  });

  it('returns nothing for empty or symbol-only input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('— … ///')).toEqual([]);
  });
});

describe('capitalizedShare', () => {
  it('is near zero for ordinary prose', () => {
    // Sentence-initial capitalisation is excluded, so prose scores ~0.
    expect(capitalizedShare('The feed is served over https every day')).toBe(0);
  });

  it('is high for a name string', () => {
    expect(
      capitalizedShare(
        'Universidad Tecnológica de Pereira, Bloque 13, Sala Magistral 1'
      )
    ).toBeGreaterThan(0.6);
  });

  it('is zero when there is nothing to compare', () => {
    expect(capitalizedShare('Pereira')).toBe(0);
    expect(capitalizedShare('')).toBe(0);
  });
});

describe('detectLanguage', () => {
  it('calls a real Spanish paragraph Spanish', () => {
    const result = detectLanguage(
      'La aplicación publica un feed con los albergues de la ciudad, y también ' +
        'permite que otras aplicaciones lo lean sin pedir permiso a nadie.'
    );
    expect(result.lang).toBe('es');
    expect(result.esScore).toBeGreaterThan(result.enScore);
  });

  it('calls a real English paragraph English', () => {
    const result = detectLanguage(
      'The publisher serves a feed of the shelters in the city, and any other ' +
        'application can read it without asking for permission from anyone.'
    );
    expect(result.lang).toBe('en');
    expect(result.enScore).toBeGreaterThan(result.esScore);
  });

  it('treats a venue name as a name, not as Spanish prose', () => {
    // The documented false positive. Institution and room names are proper
    // nouns that must not be translated, and every venue on the site would
    // have produced the same finding.
    const result = detectLanguage(
      'Universidad Tecnológica de Pereira, Bloque 13, Sala Magistral 1'
    );
    expect(result.lang).toBe('unknown');
  });

  it('says unknown for a block too short to judge', () => {
    expect(detectLanguage('the feed').lang).toBe('unknown');
  });

  it('says unknown when the evidence is evenly balanced', () => {
    // One marker each way: nothing to choose between them.
    const result = detectLanguage('the registry y el registro published feed');
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.lang).toBe('unknown');
  });

  it('says unknown for text with no function words at all', () => {
    const result = detectLanguage(
      'shelter collection_center water_point food_point warehouse info_point'
    );
    expect(result.lang).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('counts Spanish orthography as evidence on its own', () => {
    const withAccents = detectLanguage(
      'La configuración del módulo también añade validación automática según ' +
        'la especificación técnica publicada'
    );
    expect(withAccents.lang).toBe('es');
    // Diacritics weigh more than a bare stopword, so the score exceeds the
    // number of stopwords present.
    expect(withAccents.esScore).toBeGreaterThan(3);
  });

  it('reports density and token count so a caller can judge for itself', () => {
    const result = detectLanguage(
      'the quick brown fox jumps over the lazy dog'
    );
    expect(result.tokenCount).toBe(9);
    expect(result.density).toBeGreaterThan(0);
    expect(result.density).toBeLessThanOrEqual(1);
  });
});

describe('htmlToText', () => {
  it('keeps block boundaries as newlines', () => {
    // So a Spanish paragraph inside an English page stays its own unit rather
    // than being averaged into the page around it.
    const text = htmlToText('<p>First block</p><p>Second block</p>');
    expect(text).toMatch(/First block\s*\n\s*Second block/);
  });

  it('drops scripts, styles and comments', () => {
    const text = htmlToText(
      '<p>visible</p><script>const hidden = 1;</script><style>.x{}</style><!-- note -->'
    );
    expect(text).toContain('visible');
    expect(text).not.toContain('hidden');
    expect(text).not.toContain('.x{}');
    expect(text).not.toContain('note');
  });

  it('drops code and pre, because protocol vocabulary looks Spanish', () => {
    /*
     * The deny-list this project ships rejects field names like `nombre` and
     * `teléfono`. An English page documenting that list scores as Spanish on
     * the strength of the very words it is warning against.
     */
    const text = htmlToText(
      '<p>The validator rejects these field names:</p>' +
        '<code>nombre, apellidos, teléfono, dirección</code>'
    );
    expect(text).not.toContain('nombre');
    expect(text).not.toContain('teléfono');
    expect(detectLanguage(text).lang).not.toBe('es');
  });

  it('drops a pre block holding a sample record', () => {
    // Kept from the original suite: the sample carries a phone-shaped string,
    // and `telefono` is one of the strongest markers the detector has.
    const html =
      '<p>The validator rejects these field names.</p>' +
      '<p><code>nombre</code> <code>apellidos</code> <code>teléfono</code></p>' +
      '<pre>{"telefono": "300 000 0000"}</pre>';
    const text = htmlToText(html);
    expect(text).toContain('The validator rejects these field names.');
    expect(text).not.toContain('nombre');
    expect(text).not.toContain('apellidos');
    expect(text).not.toContain('telefono');
  });

  it('still reads the prose around dropped code', () => {
    const html = '<p>Antes de <code>publish</code> revisa los campos.</p>';
    expect(htmlToText(html)).toContain('Antes de');
    expect(htmlToText(html)).toContain('revisa los campos');
  });

  it('respects an explicit lang on a phrase element', () => {
    // Marking an institution's name `lang="es"` is what the HTML spec asks
    // for, so a screen reader pronounces it correctly. Content the author
    // declared is a declaration, not a defect.
    const text = htmlToText(
      '<p>Reported to the <span lang="es">Unidad Nacional para la Gestión ' +
        'del Riesgo de Desastres</span> every day.</p>'
    );
    expect(text).not.toContain('Gestión');
    expect(text).toContain('Reported to the');
  });

  it('does not honour lang on the document element', () => {
    // Honouring `<html lang>` here would delete every page.
    const text = htmlToText(
      '<html lang="es"><body><p>contenido visible</p></body></html>'
    );
    expect(text).toContain('contenido visible');
  });
});

describe('markdownToText', () => {
  it('drops fenced code and inline code', () => {
    // The Markdown and HTML paths must agree: the audit reads both and should
    // not reach different verdicts about the same content.
    const text = markdownToText(
      'Reject these names:\n\n```json\n{"nombre": "x", "teléfono": "y"}\n```\n\n' +
        'Also `apellidos` inline.'
    );
    expect(text).not.toContain('nombre');
    expect(text).not.toContain('apellidos');
    expect(text).toContain('Reject these names');
  });

  it('agrees with the HTML path about the same content', () => {
    const fromMarkdown = markdownToText(
      'The list rejects `nombre` and `teléfono`.'
    );
    const fromHtml = htmlToText(
      '<p>The list rejects <code>nombre</code> and <code>teléfono</code>.</p>'
    );
    expect(detectLanguage(fromMarkdown).lang).toBe(
      detectLanguage(fromHtml).lang
    );
  });
});

describe('splitIntoBlocks', () => {
  it('splits on blank lines and drops empties', () => {
    expect(splitIntoBlocks('one\n\ntwo\n\n\n\nthree')).toEqual([
      'one',
      'two',
      'three',
    ]);
  });

  it('returns nothing for whitespace', () => {
    expect(splitIntoBlocks('   \n\n  \n')).toEqual([]);
  });
});

describe('analyzeDocument', () => {
  it('finds no mismatch in a document that is what it claims', () => {
    const verdict = analyzeDocument(
      'The publisher serves a feed of the shelters in the city.\n\n' +
        'Any other application can read it without asking for permission.',
      'en'
    );
    expect(verdict.confident).toHaveLength(0);
    expect(verdict.flagged).toBe(false);
    expect(verdict.matched).toBeGreaterThan(0);
  });

  it('finds a Spanish paragraph on an English page', () => {
    const verdict = analyzeDocument(
      'The publisher serves a feed of the shelters in the city.\n\n' +
        'La aplicación publica un feed con los albergues de la ciudad y también ' +
        'permite que otras aplicaciones lo lean sin pedir permiso.',
      'en'
    );
    expect(verdict.flagged).toBe(true);
    expect(verdict.confident.length).toBeGreaterThan(0);
    expect(verdict.confident[0].score.lang).toBe('es');
    // The English block is still counted as matching, so the report says
    // "one block is wrong" rather than "this page is wrong".
    expect(verdict.matched).toBeGreaterThan(0);
  });

  it('puts a single-marker block in the review tier, not the confident one', () => {
    /*
     * The documented failure this rule exists for: an English book title cited
     * in a Spanish post scored a "confident" English mismatch off one stopword
     * in eight tokens. `confidence` measures lopsidedness, so one marker with
     * nothing opposing it scores 1.00 — which is why evidence is counted too.
     *
     * A paragraph genuinely in the other language carries many markers; one
     * marker is a citation, a product name, or a borrowed term.
     */
    const verdict = analyzeDocument(
      'Recomiendo mucho el libro “Cracking the Coding Interview” para preparar ' +
        'la entrevista técnica de cualquier empresa grande.',
      'es'
    );
    expect(verdict.confident).toHaveLength(0);
    expect(verdict.flagged).toBe(false);
  });

  it('exposes the thresholds it judges by', () => {
    // A gate that cannot explain its own bar is a gate people override.
    expect(CONFIDENT_MISMATCH_CONFIDENCE).toBeGreaterThan(0.5);
    expect(CONFIDENT_MISMATCH_CONFIDENCE).toBeLessThanOrEqual(1);
    expect(MIN_CONFIDENT_EVIDENCE).toBeGreaterThanOrEqual(2);
  });

  it('handles an empty document without throwing', () => {
    const verdict = analyzeDocument('', 'en');
    expect(verdict.confident).toEqual([]);
    expect(verdict.mismatches).toEqual([]);
    expect(verdict.flagged).toBe(false);
  });
});
