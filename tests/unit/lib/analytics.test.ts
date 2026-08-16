import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EVENTS,
  getAnalyticsContext,
  getPageSection,
  normalizePathname,
  PII_DENYLIST_KEYS,
  resetOutboundTracking,
  resetScrollDepthBinding,
  sanitizeEventData,
  setupOutboundTracking,
  shouldTrackScrollDepth,
  trackEvent,
  trackEventWithContext,
  trackScrollDepth,
  trackSearch,
} from '@/lib/analytics';

describe('analytics helpers', () => {
  beforeEach(() => {
    resetScrollDepthBinding();
    resetOutboundTracking();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as { umami?: unknown }).umami;
  });

  describe('getPageSection', () => {
    it('returns home for root paths', () => {
      expect(getPageSection('/')).toBe('home');
      expect(getPageSection('/en')).toBe('home');
      expect(getPageSection('/en/')).toBe('home');
    });

    it('returns first segment for nested routes', () => {
      expect(getPageSection('/blog/my-post')).toBe('blog');
      expect(getPageSection('/en/blog/tag/donations')).toBe('blog');
      expect(getPageSection('/how-it-works')).toBe('how-it-works');
    });
  });

  describe('getAnalyticsContext', () => {
    it('merges lang and section', () => {
      expect(getAnalyticsContext('es', '/blog/how-to-donate-safely')).toEqual({
        lang: 'es',
        section: 'blog',
      });
      expect(getAnalyticsContext('en', '/en/transparency')).toEqual({
        lang: 'en',
        section: 'transparency',
      });
    });
  });

  describe('normalizePathname', () => {
    it('strips /en prefix', () => {
      expect(normalizePathname('/en/blog')).toBe('/blog');
      expect(normalizePathname('/blog')).toBe('/blog');
    });
  });

  describe('shouldTrackScrollDepth', () => {
    it('enables on long-form routes', () => {
      expect(shouldTrackScrollDepth('/blog/how-to-donate-safely')).toBe(true);
      expect(shouldTrackScrollDepth('/en/blog/how-to-donate-safely')).toBe(
        true
      );
      expect(shouldTrackScrollDepth('/about')).toBe(true);
      expect(shouldTrackScrollDepth('/how-it-works')).toBe(true);
      expect(shouldTrackScrollDepth('/en/transparency')).toBe(true);
    });

    it('disables on listing pages', () => {
      expect(shouldTrackScrollDepth('/blog')).toBe(false);
      expect(shouldTrackScrollDepth('/blog/tag/donations')).toBe(false);
      expect(shouldTrackScrollDepth('/')).toBe(false);
    });
  });

  describe('sanitizeEventData', () => {
    it('strips PII-like keys', () => {
      const result = sanitizeEventData({
        slug: 'post',
        email: 'user@example.com',
        user_name: 'Jane',
        message_body: 'hello',
      });
      expect(result).toEqual({ slug: 'post' });
    });

    it('returns undefined when all keys are denied', () => {
      expect(sanitizeEventData({ email: 'a@b.c' })).toBeUndefined();
    });
  });

  describe('PII denylist coverage', () => {
    it('includes common PII field names', () => {
      expect(PII_DENYLIST_KEYS).toContain('email');
      expect(PII_DENYLIST_KEYS).toContain('name');
      expect(PII_DENYLIST_KEYS).toContain('message');
    });
  });

  describe('trackEvent', () => {
    it('no-ops when umami is not loaded', () => {
      expect(() =>
        trackEvent(EVENTS.NAV_CLICK, { item: 'blog' })
      ).not.toThrow();
    });

    it('calls umami.track with sanitized payload', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackEvent(EVENTS.CONTACT_FORM_SUBMIT, {
        reason: 'general',
        email: 'blocked@example.com',
      });

      expect(track).toHaveBeenCalledWith(EVENTS.CONTACT_FORM_SUBMIT, {
        reason: 'general',
      });
    });

    it('sends no payload at all when every key was PII', () => {
      // `{}` would still be a payload. Undefined is the honest shape.
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackEvent(EVENTS.CONTACT_FORM_SUBMIT, {
        email: 'a@example.com',
        fullName: 'Ada Lovelace',
      });

      expect(track).toHaveBeenCalledWith(EVENTS.CONTACT_FORM_SUBMIT, undefined);
    });
  });

  describe('trackEventWithContext', () => {
    it('merges lang and section into the payload', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackEventWithContext(
        EVENTS.BLOG_CARD_CLICK,
        { slug: 'how-to-donate-safely-in-colombia' },
        { lang: 'es', section: 'blog' }
      );

      expect(track).toHaveBeenCalledWith(EVENTS.BLOG_CARD_CLICK, {
        lang: 'es',
        section: 'blog',
        slug: 'how-to-donate-safely-in-colombia',
      });
    });

    it('strips PII from the merged payload too', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackEventWithContext(
        EVENTS.CONTACT_FORM_SUBMIT,
        { email: 'a@example.com' },
        { lang: 'en', section: 'contact' }
      );

      expect(track).toHaveBeenCalledWith(EVENTS.CONTACT_FORM_SUBMIT, {
        lang: 'en',
        section: 'contact',
      });
    });
  });

  describe('trackSearch', () => {
    it('debounces and drops a query under two characters', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackSearch('d', 0);
      vi.advanceTimersByTime(1200);
      expect(track).not.toHaveBeenCalled();
    });

    it('fires once for the last query in a burst of keystrokes', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackSearch('do', 9);
      trackSearch('don', 6);
      trackSearch('donar', 3);
      vi.advanceTimersByTime(1200);

      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith(EVENTS.BLOG_SEARCH, {
        query: 'donar',
        results: 3,
      });
    });

    it('truncates a very long query before it leaves the browser', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };

      trackSearch('x'.repeat(400), 0);
      vi.advanceTimersByTime(1200);

      const [, payload] = track.mock.calls[0] as [
        string,
        { query: string; results: number },
      ];
      expect(payload.query).toHaveLength(100);
    });
  });

  describe('setupOutboundTracking', () => {
    const clickOn = (html: string) => {
      document.body.innerHTML = html;
      const anchor = document.querySelector('a');
      anchor?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };

    it('reports the host and path of an external link, never the query', () => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };
      setupOutboundTracking();

      clickOn('<a href="https://ayuda.cabuya.org/aportar?ref=secret">Go</a>');

      expect(track).toHaveBeenCalledWith(EVENTS.OUTBOUND_CLICK, {
        url: 'ayuda.cabuya.org/aportar',
      });
    });

    it.each([
      ['<a href="/blog">Internal</a>', 'a root-relative path'],
      ['<a href="#top">Anchor</a>', 'a fragment'],
      ['<a href="mailto:a@example.org">Mail</a>', 'a mailto'],
      [
        '<a href="https://example.org" data-umami-event="x">Tagged</a>',
        'a link that tracks itself',
      ],
    ])('ignores %s (%s)', (html) => {
      const track = vi.fn();
      (window as { umami?: { track: typeof track } }).umami = { track };
      setupOutboundTracking();

      clickOn(html);

      expect(track).not.toHaveBeenCalled();
    });
  });

  describe('trackScrollDepth', () => {
    it('does not double-bind listeners', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        configurable: true,
        value: 2000,
      });
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 800,
      });
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        writable: true,
        value: 0,
      });

      const addSpy = vi.spyOn(window, 'addEventListener');
      trackScrollDepth();
      trackScrollDepth();
      expect(addSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('EVENTS catalog', () => {
    it('uses snake_case names only', () => {
      for (const value of Object.values(EVENTS)) {
        expect(value).toMatch(/^[a-z][a-z0-9_]*$/);
      }
    });
  });
});
