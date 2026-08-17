/**
 * Which social card a route gets.
 *
 * Small, and worth pinning: it is the one place where a language prefix, a
 * trailing slash and a section prefix all have to agree, and every one of them
 * is easy to get subtly wrong in a way nothing else catches — a wrong card is
 * invisible in the browser and only shows up in somebody else's link preview.
 *
 * `SECTION_CARDS` is deliberately empty today, so the tests cover both the
 * behaviour that ships (every route falls back to its language default) and
 * the behaviour that will ship the moment somebody adds an entry.
 */
import { describe, expect, it } from 'vitest';

import { OG_CARDS, resolveOgImage, SECTION_CARDS } from '@/lib/og-image';

describe('the card inventory', () => {
  it('carries a default per language', () => {
    expect(OG_CARDS['default-en']).toBeDefined();
    expect(OG_CARDS['default-es']).toBeDefined();
  });

  it('ships every card at 1200×630', () => {
    // The prompt pack's crop guidance assumes it, and a card at another size
    // would be cropped differently by every platform.
    for (const [id, card] of Object.entries(OG_CARDS)) {
      expect(card.width, id).toBe(1200);
      expect(card.height, id).toBe(630);
      expect(card.path, id).toMatch(/^\//);
    }
  });

  it('has no section card pointing at a card that does not exist', () => {
    // Empty today. This is the assertion that matters when it is not.
    for (const entry of SECTION_CARDS) {
      expect(
        OG_CARDS[entry.card],
        `${entry.prefix} → ${entry.card}`
      ).toBeDefined();
    }
  });
});

describe('resolveOgImage', () => {
  it('gives an English route the English default', () => {
    expect(resolveOgImage('/', 'en')).toBe(OG_CARDS['default-en']);
    expect(resolveOgImage('/developers/quickstart/', 'en')).toBe(
      OG_CARDS['default-en']
    );
  });

  it('gives a Spanish route the Spanish default', () => {
    expect(resolveOgImage('/es/', 'es')).toBe(OG_CARDS['default-es']);
    expect(resolveOgImage('/es/developers/quickstart/', 'es')).toBe(
      OG_CARDS['default-es']
    );
  });

  it('honours an explicit card over any rule', () => {
    const card = resolveOgImage('/', 'en', '/images/og/special.png');
    expect(card.path).toBe('/images/og/special.png');
    expect(card.width).toBe(1200);
    expect(card.height).toBe(630);
  });

  it('treats a route the same with or without a trailing slash', () => {
    // Astro emits both shapes depending on config, and a card that changed
    // between them would be a difference nobody would think to look for.
    expect(resolveOgImage('/developers', 'en')).toEqual(
      resolveOgImage('/developers/', 'en')
    );
    expect(resolveOgImage('/es/developers', 'es')).toEqual(
      resolveOgImage('/es/developers/', 'es')
    );
  });

  it('strips the language prefix so one section rule covers both languages', () => {
    // `/es` and `/es/x` are prefixed; `/especificacion` is not, and a naive
    // `startsWith('/es')` would eat it.
    expect(resolveOgImage('/especificacion', 'en')).toBe(
      OG_CARDS['default-en']
    );
    expect(resolveOgImage('/estado', 'en')).toBe(OG_CARDS['default-en']);
  });

  it('never returns undefined, for any route shape', () => {
    for (const route of ['/', '/es', '/es/', '//', '/a/b/c/d/', '/es/a/b/']) {
      for (const lang of ['en', 'es'] as const) {
        const card = resolveOgImage(route, lang);
        expect(card, `${lang} ${route}`).toBeDefined();
        expect(card.path, `${lang} ${route}`).toBeTruthy();
      }
    }
  });
});
