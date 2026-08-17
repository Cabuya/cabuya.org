/**
 * `sectionSummary` — the meta description for every specification section.
 *
 * It is a small function with an unusual number of hard-won special cases, and
 * two of them are documented as having shipped wrong once:
 *
 *   · underscores are **not** stripped, because `last_updated` became
 *     `lastupdated` in a meta description — a word that appears nowhere in the
 *     protocol and nobody would ever search for;
 *   · short sections get their title prepended rather than being padded,
 *     because §6 opens with a single sentence and a 90-character description
 *     is a wasted search result.
 *
 * Both are the kind of behaviour a later simplification removes without
 * noticing, since the output stays plausible either way.
 */
import { describe, expect, it } from 'vitest';

import { sectionSummary, specSections } from '@/lib/spec-loader';

type Section = ReturnType<typeof specSections>[number];

const section = (body: string, overrides: Partial<Section> = {}): Section =>
  ({
    version: '0.1',
    slug: 'x-test',
    number: '9',
    title: 'A section',
    body,
    ...overrides,
  }) as Section;

describe('sectionSummary', () => {
  it('keeps underscores in field names', () => {
    // The documented regression: stripping them produced `lastupdated`.
    const summary = sectionSummary(
      section(
        '# §3\n\nThe `last_updated` field is the feed-level generation timestamp, ' +
          'and without it a consumer cannot distinguish a quiet feed from a dead ' +
          'pipeline anywhere in the network.'
      )
    );
    expect(summary).toContain('last_updated');
    expect(summary).not.toContain('lastupdated');
  });

  it('drops formatting that does not read as a sentence', () => {
    const summary = sectionSummary(
      section(
        '# §3 — Heading\n\n' +
          '| a | b |\n| --- | --- |\n' +
          '```json\n{"x": 1}\n```\n' +
          '> A quoted aside that should not appear.\n\n' +
          'The envelope carries five required fields, and each one exists because ' +
          'a consumer cannot do its job without it in some observed situation.'
      )
    );
    expect(summary).toContain('The envelope carries five required fields');
    expect(summary).not.toContain('|');
    expect(summary).not.toContain('```');
    expect(summary).not.toContain('quoted aside');
  });

  it('unwraps links to their text', () => {
    const summary = sectionSummary(
      section(
        '# §2\n\nThe manifest lives at [the well-known path](https://cabuya.org/x) ' +
          'and the registry entry is the authoritative pointer to it, which is what ' +
          'makes a host limitation survivable.'
      )
    );
    expect(summary).toContain('the well-known path');
    expect(summary).not.toContain('https://cabuya.org/x');
  });

  it('prepends the title when the prose is too short to stand alone', () => {
    // §6 opens with a single sentence; a 90-character description is wasted.
    const summary = sectionSummary(
      section('# §6\n\nThree teams invented this block independently.', {
        number: '6',
        title: 'Trust and verification',
      })
    );
    expect(summary).toContain('§6 — Trust and verification.');
    expect(summary).toContain('Three teams invented this block');
  });

  it('falls back to the title when there is no usable prose at all', () => {
    const summary = sectionSummary(
      section('# §7\n\n| only | a table |\n| --- | --- |', {
        number: '7',
        title: 'Normative exclusions',
      })
    );
    expect(summary).toBe('§7 — Normative exclusions.');
  });

  it('respects the length limit', () => {
    const long = 'The envelope carries the required fields. '.repeat(20);
    const summary = sectionSummary(section(`# §3\n\n${long}`), 155);
    expect(summary.length).toBeLessThanOrEqual(155);
  });

  it('cuts at a sentence boundary when one is in range', () => {
    // The boundary has to fall beyond character 90, or the cut is not worth
    // making — a 60-character description is the thing the floor exists to
    // prevent, so the function prefers a word cut over a very short sentence.
    const body =
      '# §3\n\n' +
      'The envelope carries five required fields and every one of them earns its ' +
      'place in the document by preventing a specific observed failure. The next ' +
      'sentence exists only to push the text past the limit.';
    const summary = sectionSummary(section(body), 155);
    expect(summary.endsWith('.')).toBe(true);
    expect(summary).not.toContain('…');
  });

  it('prefers a word cut over a sentence boundary that is too early', () => {
    // A sentence ending at character 40 would leave a description far below
    // the useful floor, so the word cut wins.
    const body =
      '# §3\n\n' +
      'A short opening sentence. ' +
      'Then a long continuation that carries the actual meaning and runs well ' +
      'past the display limit so the function has to choose where to stop.';
    const summary = sectionSummary(section(body), 155);
    expect(summary.endsWith('…')).toBe(true);
  });

  it('cuts at a word with an ellipsis when there is no sentence boundary', () => {
    // Distinct words, so a mid-word cut is detectable: every token in the
    // output must be one that appears whole in the input.
    const words = Array.from({ length: 60 }, (_, i) => `alpha${i}`);
    const summary = sectionSummary(section(`# §3\n\n${words.join(' ')}`), 155);

    expect(summary.endsWith('…')).toBe(true);

    const emitted = summary.slice(0, -1).trim().split(/\s+/);
    for (const token of emitted) {
      expect(words, `"${token}" was cut mid-word`).toContain(token);
    }
  });

  it('accumulates paragraphs until there is enough to be useful', () => {
    const summary = sectionSummary(
      section(
        '# §6\n\nA first paragraph that is over thirty characters long.\n\n' +
          'A second paragraph that carries the rest of the meaning and pushes the ' +
          'whole thing past the useful floor.'
      )
    );
    expect(summary).toContain('A first paragraph');
    expect(summary).toContain('A second paragraph');
  });

  it('produces a usable description for every real section, in range', () => {
    // The assertion the SEO gate depends on: no section may fall below the
    // useful floor or above the display limit.
    const sections = specSections('0.1');
    expect(sections.length).toBeGreaterThan(0);
    for (const each of sections) {
      const summary = sectionSummary(each);
      expect(summary.length, `${each.slug} too long`).toBeLessThanOrEqual(155);
      expect(summary.length, `${each.slug} too short`).toBeGreaterThan(30);
      expect(summary, each.slug).not.toContain('undefined');
    }
  });
});
