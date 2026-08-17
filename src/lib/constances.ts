/** Timezone for scheduled post detection — build and badge use this consistently */
export const SITE_TIMEZONE = 'America/Bogota';
/** Fixed offset for Colombia wall-clock times (UTC−5, no DST). */
export const SITE_TIMEZONE_OFFSET = '-05:00';

/**
 * Public site origin (no trailing slash).
 * Must match `astro.config.mjs` → `site` / `PUBLIC_SITE_URL`.
 */
export const SITE_URL: string = (
  import.meta.env.SITE || 'https://cabuya.org'
).replace(/\/$/, '');

/**
 * The Ayuda Directa application. Every transactional action — publicar una
 * necesidad, ofrecer ayuda, aportar, seguir un aporte, postularse como líder —
 * happens there, not here. Defined once so no component hardcodes the host.
 */
export const APP_URL: string = (
  import.meta.env.PUBLIC_APP_URL || 'https://ayuda.cabuya.org'
).replace(/\/$/, '');

/** Build a link into the application. */
export function appUrl(path = '/'): string {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * The application paths this site is allowed to link to.
 *
 * Every entry was requested and answered 200 before being written down. Linking
 * a path the application does not serve is the same failure as advertising a
 * DNS record that 404s: the visitor follows our invitation and lands nowhere.
 * Add a path here only after verifying it, and never deep-link a slug that
 * belongs to one emergency — those come and go, and a dead CTA in the site
 * chrome outlives the emergency that justified it.
 */
export const APP_PATHS = {
  /**
   * The dual door. Someone who needs help and someone who wants to give it
   * both belong here — the root lists the active emergencies and their help
   * points. The application has no dedicated "request help" route, so this is
   * the honest destination for that half of the audience; do not invent one.
   */
  home: '/',
  /** Contribute to an active need. The primary conversion. */
  contribute: '/aportar',
  /** Published progress — the evidence behind the argument. */
  evidence: '/avances',
  /** Follow where a contribution landed. */
  tracking: '/seguimiento',
} as const;

/**
 * The `category` enum of the public Ayuda Directa API, verbatim from the
 * OpenAPI 3.1 document (`/api/public/openapi.json`) and the `/developers`
 * page. API values — never translated.
 */
export const HELP_CATEGORIES = [
  'alimentos',
  'salud',
  'refugio',
  'transporte',
  'acopio',
  'rescate',
  'otro',
] as const;

/**
 * Site identity.
 *
 * The description is the ratified elevator pitch from `docs/MESSAGING.md`,
 * trimmed to a meta-description length. The full verbatim pitch belongs on the
 * landing page; this is the version a search result has room for.
 *
 * These are language-neutral defaults. Per-page and per-language titles come
 * from `getTranslations(lang)`; a page that falls back to this constant is a
 * page that has not been given its own title yet.
 */
export const SITE_TITLE: string =
  'Cabuya — the open aid interoperability protocol';
export const SITE_DESCRIPTION: string =
  'An open format that lets aid apps publish and read the same data: collection points, needs, capacities and deliveries. Conformance is measured, never declared.';

/** The project behind the protocol. Not a legal entity — there is no company. */
export const ORGANIZATION_NAME = 'Cabuya';

/**
 * Public contact address.
 *
 * Deliberately empty until a real mailbox is confirmed — an invented address
 * silently drops messages. While empty, every consumer must fall back to the
 * contact form.
 */
export const CONTACT_EMAIL = '';

/**
 * Accounts that represent the project.
 *
 * Only confirmed accounts belong here. The previous entries were the *other*
 * project's Facebook, Instagram and WhatsApp group — publishing those on
 * cabuya.org would have pointed readers at an organisation this one does not
 * speak for, and put them in a structured-data `sameAs` claiming they are the
 * same entity. Rule-0 covers accounts as much as it covers figures.
 *
 * Cabuya runs no social accounts today. The GitHub organisation is the only
 * confirmed presence; add others here as they are actually created.
 */
export interface SocialLink {
  /** Human label, also used as the accessible name. */
  label: string;
  href: string;
  /** Icon basename in `public/icons/` — `{icon}.svg` and `{icon}_white.svg`. */
  icon: string;
  /** Whether the account belongs in the JSON-LD `sameAs` array. */
  sameAs: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/Cabuya',
    icon: 'github',
    sameAs: true,
  },
];

/** Default Open Graph / Twitter share image (1200×630), by language. */
export const DEFAULT_OG_IMAGE_ES = '/images/og-default.jpg';
export const DEFAULT_OG_IMAGE_EN = '/images/og-default-en.jpg';

export function getDefaultOgImage(lang: string | undefined): string {
  return lang === 'en' ? DEFAULT_OG_IMAGE_EN : DEFAULT_OG_IMAGE_ES;
}

/**
 * Analytics configuration.
 *
 * **Cloudflare Web Analytics, and nothing else.** Cookieless, no consent
 * banner, no personal data, no identifier that survives a page load — so
 * there is nothing to disclose beyond the one sentence the footer carries, and
 * nothing to ask permission for.
 *
 * The token is env-gated and absent by default, which means a fork, a preview
 * and a local build send no beacon at all. That is the correct default for a
 * project whose contributors will run this on their own machines: nobody's
 * development traffic should land in our dashboard.
 *
 * Never Google Analytics. Not a preference — GA4 sets identifiers, requires a
 * consent banner in the jurisdictions this project operates in, and would make
 * the site's own privacy claims false.
 */
const cloudflareBeaconToken = (
  import.meta.env.PUBLIC_CF_BEACON_TOKEN || ''
).trim();

export const ANALYTICS = {
  cloudflare: {
    token: cloudflareBeaconToken,
    /**
     * Loaded in production when a token exists; locally only on request.
     *
     * The local opt-in is there so somebody can verify the beacon works
     * without deploying, not so it can be left on.
     */
    enabled:
      Boolean(cloudflareBeaconToken) &&
      (import.meta.env.PROD ||
        import.meta.env.PUBLIC_CF_BEACON_ENABLE === 'true'),
    scriptUrl: 'https://static.cloudflareinsights.com/beacon.min.js',
  },
  verification: {
    // Search Console is verified by DNS. A meta tag would be a second, weaker
    // claim on the same domain, and `seo:check` fails if one appears.
    bing: import.meta.env.PUBLIC_BING_SITE_VERIFICATION || '',
  },
} as const;

/**
 * Newsletter signup — currently disabled in UI (BlogPostPage).
 * No Google Forms backend. Re-enable only with a Dailybot (or other) API path.
 */
export const NEWSLETTER = {
  apiEndpoint: '',
} as const;

/**
 * Community intake forms → Cloudflare Pages Function → Dailybot Forms.
 *
 * Default endpoint is `/api/contact` so production never silently falls back
 * to a third-party form host. Override with `PUBLIC_CONTACT_API_ENDPOINT` when
 * needed. Server secrets: `DAILYBOT_API_KEY` (required); optional Resend ack
 * via `RESEND_API_KEY` + `CONTACT_FROM_EMAIL`.
 */
export const CONTACT_FORM = {
  apiEndpoint: (
    import.meta.env.PUBLIC_CONTACT_API_ENDPOINT || '/api/contact'
  ).trim(),
} as const;
