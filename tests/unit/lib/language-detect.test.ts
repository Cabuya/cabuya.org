/**
 * Language detection — the part the `lang:check` gate depends on.
 *
 * The gate reads both an HTML page and its Markdown twin and must reach the
 * same verdict about the same content. These cover the extraction step, which
 * is where the two paths can silently diverge.
 */
import { describe, expect, it } from 'vitest';

import { htmlToText } from '@/lib/language-detect';

describe('htmlToText — code is not prose', () => {
  /**
   * Protocol vocabulary is deliberately Spanish-looking in places: the
   * validator's deny-list rejects `nombre`, `apellidos` and `teléfono`, so the
   * English page documenting that list scored as Spanish on the strength of
   * the very words it warns against. Code is identifiers, not prose, and the
   * Markdown path already excluded it — this keeps the two paths agreeing.
   */
  it('drops inline code and pre blocks', () => {
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

  it('still reads the prose around them', () => {
    const html = '<p>Antes de <code>publish</code> revisa los campos.</p>';
    expect(htmlToText(html)).toContain('Antes de');
    expect(htmlToText(html)).toContain('revisa los campos');
  });
});
