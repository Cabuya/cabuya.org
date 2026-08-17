/**
 * The registry's Markdown twins.
 *
 * These are the documents an agent reads to find out who publishes what, and
 * what has been measured about them — so the assertion that matters most is
 * the one about honesty: **a build with no measurement store must say
 * "not yet measured", not imply a measurement happened.**
 *
 * That is not hypothetical. Every local build and every fork's CI runs without
 * KV credentials, so the `live: false` path is the one most people will ever
 * see, and it is the one where a plausible-looking default would quietly
 * become a claim.
 */
import { describe, expect, it } from 'vitest';

import type { Language } from '@/lib/i18n';
import {
  allPublishers,
  officialSources,
  publisherById,
} from '@/lib/registry-loader';
import {
  publisherSections,
  registryIndexSections,
} from '@/lib/registry-markdown';
import type { MeasuredStatus } from '@/lib/registry-status';

const LANGUAGES: Language[] = ['en', 'es'];
const NOW = new Date('2026-08-18T12:00:00Z');
const ORIGIN = 'https://cabuya.org';

const entries = allPublishers();
const sources = officialSources();

const measured: MeasuredStatus = {
  state: 'conforming',
  level: 'L2',
  checked_at: '2026-08-17T06:00:00Z',
} as MeasuredStatus;

const flatten = (
  sections: Array<{ heading: string; lines: string[] }>
): string => sections.map((s) => [s.heading, ...s.lines].join('\n')).join('\n');

describe('registryIndexSections', () => {
  it('has publishers to render', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(LANGUAGES)('lists every publisher in %s', (lang) => {
    const text = flatten(
      registryIndexSections(lang, entries, sources, new Map(), NOW, false)
    );
    for (const entry of entries) {
      expect(text, entry.publisher_id).toContain(entry.publisher_id);
    }
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  it('says nothing was measured when there was no measurement store', () => {
    // The path every local build takes. An unmeasured entry that rendered as
    // anything other than unmeasured would be exactly the claim this project
    // exists to argue against.
    const text = flatten(
      registryIndexSections('en', entries, sources, new Map(), NOW, false)
    );
    expect(text.toLowerCase()).toMatch(/not yet measured|unmeasured/);
    expect(text).not.toContain('conforming');
  });

  it('reports a measured state when there is one', () => {
    const statuses = new Map([[entries[0].publisher_id, measured]]);
    const text = flatten(
      registryIndexSections('en', entries, sources, statuses, NOW, true)
    );
    expect(text).toContain('L2');
  });

  it('renders with no publishers at all', () => {
    // The shape a fork sees on day one.
    expect(() =>
      registryIndexSections('en', [], [], new Map(), NOW, false)
    ).not.toThrow();
  });

  it('says something different in each language', () => {
    const en = flatten(
      registryIndexSections('en', entries, sources, new Map(), NOW, false)
    );
    const es = flatten(
      registryIndexSections('es', entries, sources, new Map(), NOW, false)
    );
    expect(es).not.toBe(en);
  });
});

describe('publisherSections', () => {
  const entry = entries[0];

  it.each(LANGUAGES)('renders a publisher page in %s', (lang) => {
    const sections = publisherSections(lang, entry, undefined, NOW, ORIGIN);
    expect(sections.length).toBeGreaterThan(0);

    const text = flatten(sections);
    expect(text).toContain(entry.publisher_id);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  it('says never measured when there is no status', () => {
    const text = flatten(
      publisherSections('en', entry, undefined, NOW, ORIGIN)
    );
    expect(text.toLowerCase()).toMatch(/never|not yet/);
  });

  it('reports the measurement and its age when there is one', () => {
    const text = flatten(publisherSections('en', entry, measured, NOW, ORIGIN));
    expect(text).toContain('L2');
    expect(text).toContain('2026-08-17T06:00:00Z');
    // The coarse age, alongside the exact timestamp.
    expect(text).toContain('1 day ago');
  });

  it('lists failing checks by id when the measurement has them', () => {
    // The ids are what an implementer feeds to `explain`, so they have to
    // survive into the twin rather than being summarised as "3 failures".
    const failing = {
      ...measured,
      state: 'failing',
      failing_checks: ['REC001', 'ENV007'],
    } as MeasuredStatus;
    const text = flatten(publisherSections('en', entry, failing, NOW, ORIGIN));
    expect(text).toContain('REC001');
    expect(text).toContain('ENV007');
  });

  it('carries the badge embed snippets pointing at the given origin', () => {
    // The twin's snippets must be the ones on the page — a reader copying from
    // the Markdown should not get a different URL than a reader copying from
    // the HTML.
    const text = flatten(publisherSections('en', entry, measured, NOW, ORIGIN));
    expect(text).toContain(`${ORIGIN}/badge/${entry.publisher_id}`);
  });

  it('renders every publisher in the registry without throwing', () => {
    for (const each of entries) {
      for (const lang of LANGUAGES) {
        expect(
          () => publisherSections(lang, each, undefined, NOW, ORIGIN),
          `${each.publisher_id}/${lang}`
        ).not.toThrow();
      }
    }
  });

  it('resolves a publisher by id and renders it', () => {
    const found = publisherById(entries[0].publisher_id);
    expect(found).toBeDefined();
    expect(() =>
      publisherSections('en', found!, undefined, NOW, ORIGIN)
    ).not.toThrow();
  });
});
