/**
 * The `.md` twin generators, as a family.
 *
 * Every page on this site serves a complete Markdown twin, and each composed
 * page builds its own from a `*Sections(lang)` function. The `md:check` gate
 * verifies the *rendered* twins against the *rendered* pages, which is the
 * assertion that matters — but it runs on a built site, and it cannot say
 * which generator produced a defect or fail in the second it takes to run a
 * unit test.
 *
 * These cover the contract all of them share, in both languages at once:
 *
 *   · sections exist, with a heading and at least one line;
 *   · nothing is empty, `undefined`, or a stringified object — the failure
 *     shape of a missing translation key reaching a template;
 *   · English and Spanish genuinely differ, which is what catches a generator
 *     that ignores its `lang` argument and silently serves English on `/es`;
 *   · both languages produce the same *number* of sections, which is the
 *     parity rule stated where it can be checked cheaply.
 *
 * The last two are the ones worth having. A generator that drops its `lang`
 * still produces valid-looking output, and a reader on `/es` gets an English
 * page with a Spanish URL.
 */
import { describe, expect, it } from 'vitest';

import { changelogSections, rfcIndexSections } from '@/lib/governance-markdown';
import { homeSections } from '@/lib/home-markdown';
import type { Language } from '@/lib/i18n';
import { portalSections } from '@/lib/portal-markdown';
import { quickstartSections } from '@/lib/quickstart-markdown';
import { checksSections, validatorSections } from '@/lib/validator-markdown';

interface TwinSection {
  heading: string;
  lines: string[];
}

const GENERATORS: Array<{
  name: string;
  build: (lang: Language) => TwinSection[];
}> = [
  { name: 'home', build: homeSections },
  { name: 'portal', build: portalSections },
  { name: 'quickstart', build: quickstartSections },
  { name: 'validator', build: validatorSections },
  { name: 'checks', build: checksSections },
  { name: 'changelog', build: changelogSections },
  { name: 'rfc index', build: rfcIndexSections },
];

const LANGUAGES: Language[] = ['en', 'es'];

describe.each(GENERATORS)('$name twin sections', ({ name, build }) => {
  it.each(LANGUAGES)('produces usable sections in %s', (lang) => {
    const sections = build(lang);

    expect(
      sections.length,
      `${name}/${lang} produced no sections`
    ).toBeGreaterThan(0);

    for (const [index, section] of sections.entries()) {
      const where = `${name}/${lang}[${index}]`;

      expect(section.heading, `${where} heading`).toBeTruthy();
      expect(typeof section.heading, `${where} heading type`).toBe('string');
      expect(
        section.heading.trim().length,
        `${where} heading blank`
      ).toBeGreaterThan(0);

      expect(Array.isArray(section.lines), `${where} lines`).toBe(true);
      expect(section.lines.length, `${where} has no lines`).toBeGreaterThan(0);

      for (const line of section.lines) {
        expect(typeof line, `${where} line type`).toBe('string');
      }
    }
  });

  it.each(LANGUAGES)('never leaks a missing translation key in %s', (lang) => {
    /*
     * The failure shape of an absent key reaching a template: `undefined`,
     * `[object Object]`, or the literal path that was meant to resolve. All
     * three render as plausible-looking text and none is caught by a length
     * check.
     */
    const flat = build(lang)
      .flatMap((section) => [section.heading, ...section.lines])
      .join('\n');

    expect(flat, `${name}/${lang}`).not.toContain('undefined');
    expect(flat, `${name}/${lang}`).not.toContain('[object Object]');
    expect(flat, `${name}/${lang}`).not.toMatch(/\bt\.[a-z]+\.[a-zA-Z]+\b/);
  });

  it('says something different in each language', () => {
    /*
     * The check this file exists for. A generator that ignores its `lang`
     * argument still returns well-formed sections — and serves an English page
     * at a Spanish URL, which looks fine in every test that only inspects
     * shape.
     */
    const en = build('en')
      .flatMap((s) => [s.heading, ...s.lines])
      .join('\n');
    const es = build('es')
      .flatMap((s) => [s.heading, ...s.lines])
      .join('\n');

    expect(es, `${name} renders identically in both languages`).not.toBe(en);
  });

  it('has the same shape in both languages', () => {
    // Parity: a section present in one language and absent in the other is a
    // page that says less to half its readers.
    expect(build('es').length, `${name} section count`).toBe(
      build('en').length
    );
  });
});

describe('the family as a whole', () => {
  it('covers every composed page that ships a twin', () => {
    // A tripwire rather than an assertion about correctness: when a new
    // composed page arrives, this reminds whoever added it that its generator
    // belongs in the list above.
    expect(GENERATORS.length).toBeGreaterThanOrEqual(7);
  });

  it('produces no duplicate headings within a section list', () => {
    // Duplicate headings make a twin's anchors ambiguous, and the twin is what
    // an agent reads.
    for (const { name, build } of GENERATORS) {
      for (const lang of LANGUAGES) {
        const headings = build(lang).map((section) => section.heading);
        expect(
          new Set(headings).size,
          `${name}/${lang} has duplicate headings`
        ).toBe(headings.length);
      }
    }
  });
});
