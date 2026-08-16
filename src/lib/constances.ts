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

export const SITE_TITLE: string = 'Corag — El ecosistema de impacto social';
export const SITE_DESCRIPTION: string =
  'Conectamos a quienes quieren ayudar con quienes más lo necesitan. Corag une gobiernos, organizaciones y personas para que la ayuda sea transparente, medible y constante.';

/** Legal entity behind the project. */
export const ORGANIZATION_NAME = 'Corag';

/**
 * Public contact address.
 *
 * Deliberately empty until a real mailbox is confirmed — an invented address
 * silently drops messages from people asking for help. While empty, every
 * consumer must fall back to the contact form at `/contacto`.
 */
export const CONTACT_EMAIL = '';

/**
 * Official Corag accounts, in one place. The footer, the contact section and the
 * Organization JSON-LD `sameAs` all render from this list, so an account is
 * added or removed once.
 *
 * Only confirmed accounts belong here — a fabricated `sameAs` is a
 * structured-data error, not a placeholder.
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
    label: 'Facebook',
    href: 'https://www.facebook.com/appcorag',
    icon: 'facebook',
    sameAs: true,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/app.corag/',
    icon: 'instagram',
    sameAs: true,
  },
  {
    // A group invite, not a profile — useful to link, but not an identity for
    // `sameAs`, which is meant for pages that represent the organization.
    label: 'WhatsApp',
    href: 'https://chat.whatsapp.com/LtP2Cb1oS99BWNf1CFEtV5?s=cl&p=i&ilr=2',
    icon: 'whatsapp',
    sameAs: false,
  },
];
export const BLOG_PAGE_SIZE: number = 30;

/** Default Open Graph / Twitter share image (1200×630), by language. */
export const DEFAULT_OG_IMAGE_ES = '/images/og-default.jpg';
export const DEFAULT_OG_IMAGE_EN = '/images/og-default-en.jpg';

export function getDefaultOgImage(lang: string | undefined): string {
  return lang === 'en' ? DEFAULT_OG_IMAGE_EN : DEFAULT_OG_IMAGE_ES;
}

const umamiWebsiteId = (import.meta.env.PUBLIC_UMAMI_WEBSITE_ID || '').trim();
const umamiScriptOverride = (
  import.meta.env.PUBLIC_UMAMI_SCRIPT_URL || ''
).trim();
const umamiUseProxy = import.meta.env.PUBLIC_UMAMI_USE_PROXY !== 'false';

// Analytics configuration — scripts load only when IDs are provided
export const ANALYTICS = {
  umami: {
    websiteId: umamiWebsiteId,
    /** Load tracker in production when website ID is set; opt-in locally via PUBLIC_UMAMI_ENABLE=true */
    enabled:
      Boolean(umamiWebsiteId) &&
      (import.meta.env.PROD || import.meta.env.PUBLIC_UMAMI_ENABLE === 'true'),
    scriptUrl:
      umamiScriptOverride ||
      (umamiUseProxy
        ? '/api/umami/script.js'
        : 'https://cloud.umami.is/script.js'),
    /** Same-origin collect endpoint when first-party proxy is enabled */
    hostUrl: umamiUseProxy ? '/api/umami' : '',
  },
  verification: {
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
