/**
 * The site's navigation surface, in one place.
 *
 * Before this module the structure existed three times — `Header.svelte` /
 * `MobileMenu.svelte`, `Footer.astro`, and a hand-maintained copy inside
 * `markdown-for-agents.ts` — and they had drifted apart. One source now.
 *
 * ⚠️ Every path here must resolve to a page that exists, and every new
 * top-level route needs its `src/middleware.ts` allowlist entry too — without
 * it the page works in dev and 404s in production.
 *
 * Paths are English in both languages, per the repo slug rule, and get their
 * language prefix from `navHref`.
 *
 * The footer and the agent-Markdown Site Navigation block are both derived from
 * here. The Svelte chrome keeps its own markup (see the Task 8 log) but its
 * paths are asserted against this module by
 * `tests/unit/lib/site-navigation.test.ts`, so an enforced copy cannot drift
 * silently.
 *
 * Part of PLAN_sitewide_language_seo_aeo_audit Task 8.
 */
import { APP_URL } from '@/lib/constances';
import { DEFAULT_LANGUAGE, getUrlPrefix, isValidLanguage } from '@/lib/i18n';

export interface NavEntry {
  label: Record<string, string>;
  /** Site-root-relative path, or an absolute URL when `external`. */
  path: string;
  external?: boolean;
  /**
   * True when the live header or mobile menu exposes this entry. The chrome
   * test asserts this set matches the components exactly.
   */
  inChrome?: boolean;
}

export interface NavGroup {
  title: Record<string, string>;
  entries: NavEntry[];
}

export const SITE_NAVIGATION: NavGroup[] = [
  {
    title: { en: 'Main', es: 'Principal' },
    entries: [
      { label: { en: 'Home', es: 'Inicio' }, path: '/', inChrome: true },
      {
        label: { en: 'About', es: 'Sobre Corag' },
        path: '/about',
        inChrome: true,
      },
      {
        label: { en: 'Contact', es: 'Contacto' },
        path: '/contact',
        inChrome: true,
      },
    ],
  },
  {
    title: { en: 'How Corag works', es: 'Cómo funciona Corag' },
    entries: [
      {
        label: { en: 'How it works', es: 'Cómo funciona' },
        path: '/how-it-works',
        inChrome: true,
      },
      {
        label: { en: 'Transparency', es: 'Transparencia' },
        path: '/transparency',
        inChrome: true,
      },
      {
        label: { en: 'Emergencies', es: 'Emergencias' },
        path: '/emergencies',
        inChrome: true,
      },
      {
        label: { en: 'Leaders', es: 'Líderes' },
        path: '/leaders',
        inChrome: true,
      },
      {
        label: { en: 'Partners', es: 'Aliados' },
        path: '/partners',
        inChrome: true,
      },
      {
        label: { en: 'Ecosystem', es: 'Ecosistema' },
        path: '/ecosystem',
        inChrome: true,
      },
      {
        label: { en: 'Developers', es: 'Desarrolladores' },
        path: '/developers',
        inChrome: true,
      },
    ],
  },
  {
    title: { en: 'Community', es: 'Comunidad' },
    entries: [
      {
        label: { en: 'Serving takes courage', es: 'Servir requiere coraje' },
        path: '/movement',
        inChrome: true,
      },
      {
        label: { en: 'Channels', es: 'Canales' },
        path: '/channels',
        inChrome: true,
      },
      {
        label: { en: 'Contributing', es: 'Cómo contribuir' },
        path: '/contributing',
        inChrome: true,
      },
      {
        label: { en: 'Governance', es: 'Gobernanza' },
        path: '/governance',
        inChrome: true,
      },
      {
        label: { en: 'Code of Conduct', es: 'Código de Conducta' },
        path: '/conduct',
        inChrome: true,
      },
      {
        label: { en: 'Privacy', es: 'Privacidad' },
        path: '/privacy',
        inChrome: true,
      },
    ],
  },
  {
    title: { en: 'Content', es: 'Contenido' },
    entries: [
      // Series listing omitted until series are published again.
      { label: { en: 'Blog', es: 'Blog' }, path: '/blog', inChrome: true },
    ],
  },
  {
    title: { en: 'Ayuda Directa', es: 'Ayuda Directa' },
    entries: [
      {
        /*
         * The application. Every transactional action lives there, so this is
         * the most important outbound link on the site — it belongs in the
         * navigation, not only in page CTAs.
         */
        label: { en: 'Go to the app', es: 'Ir a la aplicación' },
        path: APP_URL,
        external: true,
        inChrome: true,
      },
    ],
  },
];

/** Every internal path the navigation exposes, without a language prefix. */
export const internalNavPaths = (): string[] =>
  SITE_NAVIGATION.flatMap((group) =>
    group.entries.filter((e) => !e.external).map((e) => e.path)
  );

/** The subset the live header and mobile menu expose. */
export const chromeNavPaths = (): string[] =>
  SITE_NAVIGATION.flatMap((group) =>
    group.entries.filter((e) => e.inChrome).map((e) => e.path)
  );

const prefixFor = (lang: string): string =>
  getUrlPrefix(isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE);

/** A nav entry's href in a given language. Root stays `/` when unprefixed. */
export const navHref = (entry: NavEntry, lang: string): string => {
  if (entry.external) return entry.path;
  const prefix = prefixFor(lang);
  if (entry.path === '/') return prefix || '/';
  return `${prefix}${entry.path}`;
};

/** A nav entry's label in a given language, falling back to English. */
export const navLabel = (entry: NavEntry, lang: string): string =>
  entry.label[lang] ?? entry.label.en;

/** Resolved `{ label, href }` pairs for a group, by group title (English). */
export const navGroup = (
  titleEn: string,
  lang: string
): Array<{ label: string; href: string }> => {
  const group = SITE_NAVIGATION.find((g) => g.title.en === titleEn);
  if (!group) return [];
  return group.entries.map((entry) => ({
    label: navLabel(entry, lang),
    href: navHref(entry, lang),
  }));
};
