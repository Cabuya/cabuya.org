/**
 * The badge SVG, per state, per language.
 *
 * Snapshotted because this file's output ends up in other people's READMEs,
 * where it is copied once and never looked at again. A change to what it says
 * should be a change somebody chose, not one that arrived with a refactor — so
 * every state's rendering is pinned, and a diff to any of them shows up here
 * before it shows up in an adopter's repository.
 *
 * The assertions around the snapshots are the ones that are not about
 * appearance: the state as text, the accessible name, the version in the
 * subject, and the word that must never appear.
 */
import { describe, expect, it } from 'vitest';

import {
  badgeAccessibleName,
  badgeEmbedSnippets,
  badgeSubject,
  badgeSvg,
  STATE_DESCRIPTIONS,
  STATE_LABELS,
  STATE_TONE_CLASSES,
} from '@/lib/badge';
import type { BadgeState } from '@/lib/registry-loader';

const STATES: BadgeState[] = [
  'conforming',
  'stale',
  'unreachable',
  'failing',
  'unmeasured',
  'archived',
];

describe('badge SVG', () => {
  for (const state of STATES) {
    it(`renders ${state} identically to the pinned output`, () => {
      expect(
        badgeSvg({ state, version: '0.1', lang: 'en', publisherId: 'corag' })
      ).toMatchSnapshot();
    });
  }

  it('renders Spanish', () => {
    expect(
      badgeSvg({
        state: 'conforming',
        version: '0.1',
        lang: 'es',
        publisherId: 'corag',
      })
    ).toMatchSnapshot();
  });

  it('renders the flat variant without the gradient overlay', () => {
    const flat = badgeSvg({
      state: 'conforming',
      version: '0.1',
      lang: 'en',
      style: 'flat',
      publisherId: 'corag',
    });
    expect(flat).not.toContain('linearGradient');
    expect(flat).toMatchSnapshot();
  });
});

describe('what every badge must carry', () => {
  for (const state of STATES) {
    for (const lang of ['en', 'es'] as const) {
      const svg = badgeSvg({
        state,
        version: '0.1',
        lang,
        publisherId: 'corag',
      });

      it(`${state}/${lang}: says the state in words, not only in colour`, () => {
        expect(svg).toContain(STATE_LABELS[state][lang]);
      });

      it(`${state}/${lang}: carries a title and an accessible name`, () => {
        expect(svg).toContain('<title>');
        expect(svg).toContain('aria-label=');
        expect(svg).toContain('role="img"');
        expect(svg).toContain(
          badgeAccessibleName({
            state,
            version: '0.1',
            lang,
            publisherId: 'corag',
          })
        );
      });

      it(`${state}/${lang}: names the version`, () => {
        expect(svg).toContain('Cabuya 0.1');
      });

      it(`${state}/${lang}: never says certified`, () => {
        expect(svg.toLowerCase()).not.toContain('certif');
      });
    }
  }

  it('never says certified in any label or description either', () => {
    const everything = [
      ...Object.values(STATE_LABELS).flatMap((entry) => Object.values(entry)),
      ...Object.values(STATE_DESCRIPTIONS).flatMap((entry) =>
        Object.values(entry)
      ),
    ].join(' ');
    expect(everything.toLowerCase()).not.toContain('certif');
  });

  it('names the version in every language', () => {
    expect(badgeSubject('0.1')).toBe('Cabuya 0.1');
    expect(badgeSubject('1.0')).toBe('Cabuya 1.0');
  });
});

describe('the accessible name reads as a sentence in each language', () => {
  it('puts the adjective where the language puts it', () => {
    expect(
      badgeAccessibleName({ state: 'conforming', version: '1.0', lang: 'en' })
    ).toBe('Cabuya 1.0 compatible');
    expect(
      badgeAccessibleName({ state: 'conforming', version: '1.0', lang: 'es' })
    ).toBe('compatible con Cabuya 1.0');
  });

  it('names the publisher when there is one', () => {
    expect(
      badgeAccessibleName({
        state: 'failing',
        version: '0.1',
        lang: 'en',
        publisherId: 'corag',
      })
    ).toBe('corag — Cabuya 0.1: not passing');
  });

  it('never claims compatibility for a state that is not one', () => {
    for (const state of [
      'unreachable',
      'failing',
      'unmeasured',
      'archived',
    ] as BadgeState[]) {
      for (const lang of ['en', 'es'] as const) {
        const name = badgeAccessibleName({ state, version: '0.1', lang });
        expect(name).not.toMatch(/\bcompatible\b/);
      }
    }
  });
});

describe('escaping', () => {
  it('escapes a publisher id that contains markup', () => {
    const svg = badgeSvg({
      state: 'conforming',
      version: '0.1',
      lang: 'en',
      // Not a real id — the registry pattern forbids it — but the endpoint is
      // reachable with any string, and a template that interpolates one into
      // an SVG without escaping is an XSS in an image.
      publisherId: '<script>alert(1)</script>',
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});

describe('embed snippets', () => {
  const { markdown, html } = badgeEmbedSnippets(
    'https://cabuya.org',
    'corag',
    'en'
  );

  it('link the image to the page that justifies it', () => {
    expect(markdown).toBe(
      '[![Cabuya registry status for corag](https://cabuya.org/badge/corag.svg)](https://cabuya.org/registry/corag)'
    );
    expect(html).toContain('href="https://cabuya.org/registry/corag"');
    expect(html).toContain('src="https://cabuya.org/badge/corag.svg"');
  });

  it('carry alt text — a badge with none is a badge a screen reader skips', () => {
    expect(html).toMatch(/alt="[^"]+"/);
    expect(markdown).toMatch(/!\[[^\]]+\]/);
  });

  it('point Spanish readers at the Spanish page and the Spanish badge', () => {
    const es = badgeEmbedSnippets('https://cabuya.org', 'corag', 'es');
    expect(es.markdown).toContain('/es/registry/corag');
    expect(es.markdown).toContain('badge/corag.svg?lang=es');
  });
});

describe('page tones', () => {
  it('cover every state', () => {
    for (const state of STATES) {
      expect(STATE_TONE_CLASSES[state]).toBeTruthy();
    }
  });

  it('use tokens only — a raw grey here would fail the design contract', () => {
    for (const classes of Object.values(STATE_TONE_CLASSES)) {
      expect(classes).not.toMatch(/text-gray-|bg-gray-|#[0-9a-f]{3,6}/i);
      for (const token of classes.split(' ')) {
        expect(token).toMatch(/^(bg|text)-cabuya-/);
      }
    }
  });

  it('does not distinguish unreachable from failing by colour alone', () => {
    // They are different tones, but the point is that the label differs too:
    // colour is never the only carrier.
    expect(STATE_LABELS.unreachable.en).not.toBe(STATE_LABELS.failing.en);
    expect(STATE_LABELS.unreachable.es).not.toBe(STATE_LABELS.failing.es);
  });
});
