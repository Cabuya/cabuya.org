/**
 * The registry loader and the status-resolution layer.
 *
 * The tests that matter here are about what the loader refuses to do. It has no
 * path by which a conformance level can come out of a file, and no fallback
 * that reads as a pass — those are the two ways a registry stops being a
 * measurement, and both are asserted rather than left to the code review that
 * introduced them.
 */
import { describe, expect, it } from 'vitest';

import {
  allPublishers,
  displayHost,
  type MeasuredStatus,
  officialSources,
  publisherById,
  publisherHistory,
  resolveStatus,
} from '@/lib/registry-loader';
import { measurementAge, STALE_AFTER_HOURS } from '@/lib/registry-status';

describe('publisher entries', () => {
  it('reads every entry in the tree, in a stable order', () => {
    const entries = allPublishers();
    expect(entries.length).toBeGreaterThan(0);
    const ids = entries.map((entry) => entry.publisher_id);
    expect([...ids].sort()).toEqual(ids);
  });

  it('carries no conformance level — the shape has nowhere to put one', () => {
    for (const entry of allPublishers()) {
      expect(entry).not.toHaveProperty('level');
      expect(entry).not.toHaveProperty('conformance');
      expect(entry).not.toHaveProperty('state');
      // `status` is a review state, and only ever one of the two.
      expect(['proposed', 'reviewed']).toContain(entry.status);
    }
  });

  it('carries notes in both languages when it carries them at all', () => {
    for (const entry of allPublishers()) {
      if (!entry.notes) continue;
      expect(entry.notes.en.length).toBeGreaterThan(10);
      expect(entry.notes.es.length).toBeGreaterThan(10);
      expect(entry.notes.en).not.toBe(entry.notes.es);
    }
  });

  it('finds one by id and renders its host', () => {
    const entry = allPublishers()[0];
    expect(publisherById(entry.publisher_id)).toEqual(entry);
    expect(displayHost(entry)).not.toContain('https://');
  });

  it('returns undefined for an id nobody registered', () => {
    expect(publisherById('not-a-publisher')).toBeUndefined();
  });
});

describe('official sources', () => {
  it('are bilingual and declare the language of their authority', () => {
    const sources = officialSources();
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(source.name.en.length).toBeGreaterThan(0);
      expect(source.name.es.length).toBeGreaterThan(0);
      // The institution's legal name is not translated, so whichever page shows
      // it has to mark the language for the screen reader.
      expect(source.authority_lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    }
  });

  it('are not publishers — no entry appears in both lists', () => {
    const publisherIds = new Set(
      allPublishers().map((entry) => entry.publisher_id)
    );
    for (const source of officialSources()) {
      expect(publisherIds.has(source.id)).toBe(false);
    }
  });
});

describe('status resolution', () => {
  const entry = allPublishers()[0];

  it('falls back to unmeasured, never to anything resembling a pass', () => {
    const resolved = resolveStatus(entry, null);
    expect(resolved.state).toBe('unmeasured');
    expect(resolved.level).toBeNull();
    expect(resolved.checked_at).toBe('');
  });

  it('returns the measured record untouched when there is one', () => {
    const measured: MeasuredStatus = {
      publisher_id: entry.publisher_id,
      state: 'conforming',
      level: 'L2',
      checked_at: '2026-08-17T00:00:00.000Z',
    };
    expect(resolveStatus(entry, measured)).toBe(measured);
  });

  it('treats undefined the same as null — an absent read is not a pass', () => {
    expect(resolveStatus(entry, undefined).state).toBe('unmeasured');
  });
});

describe('history', () => {
  it('is empty rather than an error for a publisher with no runs yet', () => {
    expect(publisherHistory('pereira-ayuda')).toEqual([]);
  });
});

describe('measurement age', () => {
  const now = new Date('2026-08-17T12:00:00Z');

  it('says never when nothing was measured', () => {
    expect(measurementAge('', now, 'en')).toBe('never');
    expect(measurementAge('', now, 'es')).toBe('nunca');
  });

  it('collapses everything inside a day, because the cron runs four times', () => {
    expect(measurementAge('2026-08-17T09:00:00Z', now, 'en')).toBe('today');
    expect(measurementAge('2026-08-17T02:00:00Z', now, 'en')).toBe('today');
  });

  it('counts days, then months', () => {
    expect(measurementAge('2026-08-16T09:00:00Z', now, 'en')).toBe('1 day ago');
    expect(measurementAge('2026-08-10T12:00:00Z', now, 'es')).toBe(
      'hace 7 días'
    );
    expect(measurementAge('2026-05-01T12:00:00Z', now, 'en')).toContain(
      'months ago'
    );
  });

  it('does not pretend to know what an unparseable timestamp means', () => {
    expect(measurementAge('not-a-date', now, 'en')).toBe('unknown');
  });

  it('sets the staleness threshold at a week', () => {
    expect(STALE_AFTER_HOURS).toBe(24 * 7);
  });
});
