/**
 * The top-level FAQ's contracts, as tests.
 *
 * Three things must stay true in both languages: every entry survives the
 * JSON-LD generator's rules (a dropped entry is a silent SEO regression),
 * the honesty framing holds (v0.2 is proposed, never shipped; listing is
 * never endorsement; the banned vocabulary stays out), and the `.md` twin
 * carries every question the page renders.
 */
import { describe, expect, it } from 'vitest';

import { faqEntries } from '@/lib/faq-jsonld';
import { faqBody, faqSections } from '@/lib/faq-markdown';
import { LANGUAGE_CODES } from '@/lib/language-codes';
import { JSONLD_MATRIX, requiredTypesFor } from '@/lib/structured-data';
import { getTranslations } from '@/lib/translations';

describe.each(LANGUAGE_CODES)('the top-level FAQ (%s)', (lang) => {
  const t = getTranslations(lang);

  it('feeds every question through the FAQPage generator intact', () => {
    const entries = faqEntries(faqBody(lang));
    expect(entries).toHaveLength(t.faq.items.length);
    // The set the user asked for: at least a dozen, and each one a real
    // question with a substantive answer.
    expect(t.faq.items.length).toBeGreaterThanOrEqual(12);
    for (const item of t.faq.items) {
      expect(item.q.endsWith('?'), `not a question: ${item.q}`).toBe(true);
      expect(item.a.length, `thin answer for: ${item.q}`).toBeGreaterThan(40);
    }
  });

  it('frames v0.2 as proposed and endorses nobody', () => {
    const copy = JSON.stringify(t.faq).toLowerCase();
    for (const word of [
      'certificad',
      'certified',
      'garantizad',
      'guaranteed',
    ]) {
      expect(copy, `banned word "${word}"`).not.toContain(word);
    }
    // The v0.2 answer must carry the proposed/RFC framing in each language.
    const roadmap = t.faq.items.find((item) =>
      item.more?.path.includes('/rfcs/')
    );
    expect(
      roadmap,
      'the requests/donations answer lost its RFC link'
    ).toBeDefined();
    expect(roadmap?.a.toLowerCase()).toMatch(/propuest|proposed/);
  });

  it('carries every question in the .md twin, plus the developer pointer', () => {
    const sections = faqSections(lang);
    for (const item of t.faq.items) {
      expect(sections.some((s) => s.heading === item.q)).toBe(true);
    }
    const twin = sections.flatMap((s) => s.lines).join('\n');
    expect(twin).toContain('/developers/faq');
  });
});

describe('the JSON-LD matrix', () => {
  it('requires FAQPage on /faq and /es/faq', () => {
    expect(requiredTypesFor('/faq')?.required).toContain('FAQPage');
    expect(requiredTypesFor('/es/faq')?.required).toContain('FAQPage');
    // The row exists on its own — the portal FAQ's row must survive too.
    expect(
      JSONLD_MATRIX.filter((row) => row.required.includes('FAQPage')).length
    ).toBeGreaterThanOrEqual(2);
  });
});
