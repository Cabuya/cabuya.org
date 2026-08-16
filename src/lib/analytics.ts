/**
 * Analytics utility for tracking custom events.
 * Uses Umami's event tracking API.
 * Gracefully degrades if analytics is not loaded.
 */

interface UmamiWindow extends Window {
  umami?: {
    track: (
      eventName: string,
      eventData?: Record<string, string | number>
    ) => void;
  };
}

/** Keys that must never appear in event payloads (PII guard). */
export const PII_DENYLIST_KEYS = [
  'email',
  'name',
  'message',
  'phone',
  'address',
  'password',
  'firstname',
  'lastname',
  'fullname',
] as const;

/**
 * Centralized event name catalog.
 * All event names are defined here to ensure consistency across the codebase.
 */
export const EVENTS = {
  NAV_CLICK: 'nav_click',
  /**
   * A click on any CTA that sends someone to the application.
   *
   * This is the site's conversion: everything here exists to move a visitor to
   * ayuda.cabuya.org. `surface` says which piece of the argument earned the
   * click (hero, closing, an institutional page's CTA…), which is the part a
   * plain nav_click cannot tell you.
   */
  APP_CTA_CLICK: 'app_cta_click',
  LANGUAGE_SWITCH: 'language_switch',
  MOBILE_MENU_TOGGLE: 'mobile_menu_toggle',
  THEME_TOGGLE: 'theme_toggle',
  BLOG_SEARCH: 'blog_search',
  TAG_FILTER: 'tag_filter',
  BLOG_CARD_CLICK: 'blog_card_click',
  PAGINATION_CLICK: 'pagination_click',
  SHARE_CLICK: 'share_click',
  COPY_LINK: 'copy_link',
  SERIES_NAV: 'series_nav',
  SERIES_INDICATOR_CLICK: 'series_indicator_click',
  LIGHTBOX_OPEN: 'lightbox_open',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  CONTACT_FORM_ERROR: 'contact_form_error',
  ECOSYSTEM_FORM_SUBMIT: 'ecosystem_form_submit',
  ECOSYSTEM_FORM_ERROR: 'ecosystem_form_error',
  ECOSYSTEM_APP_MODAL_OPEN: 'ecosystem_app_modal_open',
  NEWSLETTER_SUBSCRIBE: 'newsletter_subscribe',
  SOCIAL_CLICK: 'social_click',
  OUTBOUND_CLICK: 'outbound_click',
  SCROLL_DEPTH: 'scroll_depth',
  SCROLL_TO_TIMELINE: 'scroll_to_timeline',
  TIMELINE_CLICK: 'timeline_click',
  /*
   * Edge-fired events. These do not go through `trackEvent` — they are sent
   * server-side from `functions/_middleware.ts` straight to Umami's API, so a
   * bot that never runs JavaScript still gets counted. They live here because
   * this is the canonical name list: the middleware writes the string
   * literally, and this is what it has to match.
   */
  AI_BOT_VISIT: 'ai_bot_visit',
  UNKNOWN_BOT_VISIT: 'unknown_bot_visit',
  MARKDOWN_REQUEST: 'markdown_request',

  NOTIFICATION_CTA: 'notification_cta',
  NOTIFICATION_MODAL_OPEN: 'notification_modal_open',
  CONDUCT_REPORT_SUBMIT: 'conduct_report_submit',
} as const;

export type AnalyticsEventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface AnalyticsContext {
  lang: string;
  section: string;
}

/** Long-form routes where scroll_depth is meaningful (not listing pages). */
const SCROLL_DEPTH_PATH_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/(en\/)?blog\/[^/]+\/?$/,
  /^\/(en\/)?about\/?$/,
  /^\/(en\/)?how-it-works\/?$/,
  /^\/(en\/)?transparency\/?$/,
  /^\/(en\/)?emergencies\/?$/,
  /^\/(en\/)?leaders\/?$/,
  /^\/(en\/)?partners\/?$/,
  /^\/(en\/)?developers\/?$/,
  /^\/(en\/)?privacy\/?$/,
];

/**
 * Strip language prefix for section detection.
 */
export function normalizePathname(pathname: string): string {
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  if (pathname === '/en') return '/';
  return pathname;
}

/**
 * Derive stable page section from URL (first path segment after optional /en).
 */
export function getPageSection(pathname: string): string {
  const clean = normalizePathname(pathname);
  if (clean === '/' || clean === '') return 'home';
  return clean.split('/').filter(Boolean)[0] ?? 'home';
}

/**
 * Build analytics dimensions for event payloads.
 */
export function getAnalyticsContext(
  lang: string,
  pathname: string
): AnalyticsContext {
  return { lang, section: getPageSection(pathname) };
}

/**
 * Whether scroll_depth should fire on this pathname.
 */
export function shouldTrackScrollDepth(pathname: string): boolean {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;
  return SCROLL_DEPTH_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Remove PII-like keys from event payloads before sending.
 */
export function sanitizeEventData(
  data?: Record<string, string | number>
): Record<string, string | number> | undefined {
  if (!data) return undefined;

  const sanitized: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(data)) {
    const lower = key.toLowerCase();
    const isDenied = PII_DENYLIST_KEYS.some((denied) => lower.includes(denied));
    if (!isDenied) {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Track a custom event via Umami.
 * @param eventName - Name of the event (e.g., 'nav_click', 'blog_search')
 * @param eventData - Optional data payload (PII keys stripped automatically)
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number>
): void {
  const win = typeof window !== 'undefined' ? (window as UmamiWindow) : null;
  if (!win?.umami) return;

  const payload = sanitizeEventData(eventData);
  win.umami.track(eventName, payload);
}

/**
 * Track with page context dimensions merged into payload.
 */
export function trackEventWithContext(
  eventName: string,
  eventData: Record<string, string | number> | undefined,
  context: AnalyticsContext
): void {
  const merged: Record<string, string | number> = {
    lang: context.lang,
    section: context.section,
    ...eventData,
  };
  trackEvent(eventName, merged);
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%).
 * Each threshold fires only once per page load.
 * Uses a passive scroll listener for zero performance impact.
 * Guarded against double-binding (e.g. layout + page both calling).
 */
let scrollDepthBound = false;

export function trackScrollDepth(): void {
  if (typeof window === 'undefined' || scrollDepthBound) return;
  scrollDepthBound = true;

  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();

  function onScroll(): void {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const percent = Math.round((window.scrollY / docHeight) * 100);

    for (const threshold of thresholds) {
      if (percent >= threshold && !fired.has(threshold)) {
        fired.add(threshold);
        trackEvent(EVENTS.SCROLL_DEPTH, { depth: threshold });
      }
    }

    if (fired.size === thresholds.length) {
      window.removeEventListener('scroll', onScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Reset scroll binding guard (tests only). */
export function resetScrollDepthBinding(): void {
  scrollDepthBound = false;
}

/**
 * Track a blog search query with debouncing (1-second delay).
 * Only fires for queries of 2+ characters.
 */
let searchTimer: ReturnType<typeof setTimeout> | null = null;

export function trackSearch(query: string, resultCount: number): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (query.trim().length >= 2) {
      trackEvent(EVENTS.BLOG_SEARCH, {
        query: query.trim().slice(0, 100),
        results: resultCount,
      });
    }
  }, 1000);
}

/**
 * Set up global outbound link tracking via delegated click listener.
 * Fires 'outbound_click' for clicks on links pointing to external domains.
 * Skips links that already have data-umami-event attributes to avoid double-tracking.
 */
let outboundTrackingSetUp = false;

export function setupOutboundTracking(): void {
  if (typeof window === 'undefined' || outboundTrackingSetUp) return;
  outboundTrackingSetUp = true;

  document.addEventListener('click', (e: MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href]'
    );
    if (!link) return;

    if (link.hasAttribute('data-umami-event')) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('/') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:')
    )
      return;

    try {
      const url = new URL(href, window.location.origin);
      if (url.hostname !== window.location.hostname) {
        trackEvent(EVENTS.OUTBOUND_CLICK, {
          url: url.hostname + url.pathname,
        });
      }
    } catch {
      // Invalid URL, skip
    }
  });
}

/** Reset outbound binding guard (tests only). */
export function resetOutboundTracking(): void {
  outboundTrackingSetUp = false;
}
