/**
 * The site's navigation surface, in one place.
 *
 * The header, the mobile drawer, the footer, and the agent-Markdown "Site
 * navigation" block all derive from this module — one source, no drift.
 *
 * ## The `status` field, and why it exists
 *
 * `docs/INFORMATION_ARCHITECTURE.md` describes the finished site. The site is
 * being built in the open, so most of those routes do not exist yet. Two bad
 * options present themselves: link to them anyway (a header full of 404s, and
 * a direct Rule-0 violation — no CTA to something that does not exist), or
 * keep the nav in someone's head until the end.
 *
 * Instead, every route in the IA is listed here with a `status`. Only `live`
 * entries render in chrome; `planned` ones are the roster, carrying the task
 * that ships them. `tests/unit/lib/site-navigation.test.ts` holds both halves
 * honest: a `live` entry whose page does not exist fails, and a page that
 * exists while its entry says `planned` fails too. Flipping one word is the
 * whole ceremony for putting a route in the header.
 *
 * ⚠️ A new top-level route also needs its `src/middleware.ts` allowlist entry,
 * in the same commit — without it the page works in dev and 404s in production.
 */
import { getUrlPrefix, isValidLanguage, type Language } from '@/lib/i18n';

export const GITHUB_ORG = 'https://github.com/Cabuya';
export const GITHUB_URL = 'https://github.com/Cabuya/cabuya.org';
export const SKILL_REPO_URL = 'https://github.com/Cabuya/cabuya-skill';

/** `live` renders in chrome; `planned` is the roster with its shipping task. */
export type NavStatus = 'live' | 'planned';

export interface NavEntry {
  label: Record<string, string>;
  /** Site-root-relative path, or an absolute URL when `external`. */
  path: string;
  external?: boolean;
  status: NavStatus;
  /** The migration task that makes it live. Documentation, not logic. */
  ships?: string;
  /** Source file under `src/pages/`, checked by the nav test when live. */
  file?: string;
  /** Emitted once at the root; never prefixed with a language. */
  languageNeutral?: boolean;
  /** Short gloss for the mobile drawer and the footer's title attributes. */
  hint?: Record<string, string>;
}

export interface NavGroup {
  id: string;
  label: Record<string, string>;
  /** A group with a path is a direct link; with children, a disclosure. */
  path?: string;
  file?: string;
  /** Emitted once at the root; never prefixed with a language. */
  languageNeutral?: boolean;
  status: NavStatus;
  ships?: string;
  children?: NavEntry[];
}

/** The home route. Not in the header nav — the logo carries it. */
export const HOME_ENTRY: NavEntry = {
  label: { en: 'Home', es: 'Inicio' },
  path: '/',
  status: 'live',
  file: 'index.astro',
};

// ── Header ────────────────────────────────────────────────
// Five groups maximum, per the IA. Order is the reader's journey: what it is,
// how to build on it, who already did, who decides, how to join.

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'protocol',
    label: { en: 'Protocol', es: 'Protocolo' },
    // A group with no path of its own: it is a disclosure that opens onto its
    // children, and it is live once any child is.
    status: 'live',
    children: [
      {
        label: { en: 'Specification', es: 'Especificación' },
        path: '/developers/spec',
        status: 'live',
        hint: {
          en: 'The normative text, versioned',
          es: 'El texto normativo, versionado',
        },
      },
      {
        label: { en: 'Schemas', es: 'Esquemas' },
        path: '/developers/schemas',
        status: 'live',
        hint: {
          en: 'Field-by-field reference',
          es: 'Referencia campo por campo',
        },
      },
      {
        label: { en: 'RFCs', es: 'RFCs' },
        path: '/rfcs',
        status: 'live',
        hint: {
          en: 'How the protocol changes',
          es: 'Cómo cambia el protocolo',
        },
      },
      {
        label: { en: 'Changelog', es: 'Cambios' },
        path: '/changelog',
        status: 'live',
        hint: {
          en: 'Spec, validator and skill releases',
          es: 'Versiones de spec, validador y skill',
        },
      },
    ],
  },
  {
    id: 'developers',
    label: { en: 'Developers', es: 'Desarrolladores' },
    path: '/developers',
    status: 'live',
  },
  {
    id: 'registry',
    label: { en: 'Registry', es: 'Registro' },
    path: '/registry',
    status: 'live',
  },
  {
    /*
     * `About` rather than a seventh top-level entry.
     *
     * `/about`, `/governance` and `/trademark` answer the same question from
     * three angles — who this belongs to — and each was reachable only from
     * the footer or not at all. A seventh sibling would have crowded the row
     * on a laptop and buried the newest page at the end of it; a disclosure
     * keeps the row at six and gives the three a parent that names what they
     * have in common.
     *
     * The group's own `path` is `/about`, so the label is a link on touch,
     * where a hover disclosure has nothing to hover.
     */
    id: 'about',
    label: { en: 'About', es: 'Acerca de' },
    path: '/about',
    status: 'live',
    children: [
      {
        label: { en: 'Why Cabuya', es: 'Por qué Cabuya' },
        path: '/about',
        status: 'live',
        hint: {
          en: 'Where the name comes from',
          es: 'De dónde viene el nombre',
        },
      },
      {
        label: { en: 'Governance', es: 'Gobernanza' },
        path: '/governance',
        status: 'live',
        hint: {
          en: 'Who decides, and how',
          es: 'Quién decide, y cómo',
        },
      },
      {
        label: { en: 'Trademark & badge', es: 'Marca e insignia' },
        path: '/trademark',
        status: 'live',
        hint: {
          en: 'What you may call your implementation',
          es: 'Cómo puedes llamar tu implementación',
        },
      },
    ],
  },
  {
    id: 'join',
    label: { en: 'Join', es: 'Participar' },
    path: '/join',
    status: 'live',
  },
];

// ── Footer ────────────────────────────────────────────────
// Four columns, per the IA. External entries are always live: they are not
// our routes, so nothing here can 404 on a page we have not built.

export interface FooterColumn {
  id: string;
  label: Record<string, string>;
  entries: NavEntry[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'protocol',
    label: { en: 'Protocol', es: 'Protocolo' },
    entries: [
      {
        label: { en: 'Specification', es: 'Especificación' },
        path: '/developers/spec',
        status: 'live',
      },
      {
        label: { en: 'Schemas', es: 'Esquemas' },
        path: '/developers/schemas',
        status: 'live',
      },
      {
        label: { en: 'RFCs', es: 'RFCs' },
        path: '/rfcs',
        status: 'live',
      },
      {
        label: { en: 'Changelog', es: 'Cambios' },
        path: '/changelog',
        status: 'live',
      },
      {
        label: { en: 'FAQ', es: 'Preguntas frecuentes' },
        path: '/faq',
        status: 'live',
      },
    ],
  },
  {
    id: 'developers',
    label: { en: 'Developers', es: 'Desarrolladores' },
    entries: [
      {
        label: { en: 'Get started', es: 'Primeros pasos' },
        path: '/start',
        status: 'live',
      },
      {
        label: { en: 'Quickstart', es: 'Guía rápida' },
        path: '/developers/quickstart',
        status: 'live',
      },
      {
        label: { en: 'Validator', es: 'Validador' },
        path: '/developers/validator',
        status: 'live',
      },
      {
        label: { en: 'Registry', es: 'Registro' },
        path: '/registry',
        status: 'live',
      },
      {
        label: { en: 'Agent skill', es: 'Skill para agentes' },
        path: '/developers/skill',
        status: 'live',
      },
    ],
  },
  {
    id: 'governance',
    label: { en: 'Governance', es: 'Gobernanza' },
    entries: [
      {
        label: { en: 'Why Cabuya', es: 'Por qué Cabuya' },
        path: '/about',
        status: 'live',
      },
      {
        label: { en: 'Governance model', es: 'Modelo de gobernanza' },
        path: '/governance',
        status: 'live',
      },
      {
        label: {
          en: 'Name and badge policy',
          es: 'Política de nombre y sello',
        },
        path: '/trademark',
        status: 'live',
      },
      {
        label: { en: 'Code of conduct', es: 'Código de conducta' },
        path: `${GITHUB_URL}/blob/main/CODE_OF_CONDUCT.md`,
        external: true,
        status: 'live',
      },
      {
        label: { en: 'Security policy', es: 'Política de seguridad' },
        path: `${GITHUB_URL}/blob/main/SECURITY.md`,
        external: true,
        status: 'live',
      },
      {
        label: { en: 'Licensing', es: 'Licencias' },
        path: `${GITHUB_URL}/blob/main/docs/LICENSING.md`,
        external: true,
        status: 'live',
      },
      {
        label: { en: 'Contribute', es: 'Contribuir' },
        path: '/join',
        status: 'live',
      },
      {
        label: { en: 'Contact', es: 'Contacto' },
        path: '/join#contact',
        status: 'live',
      },
      {
        label: { en: 'RFCs', es: 'RFC' },
        path: '/rfcs',
        status: 'live',
      },
    ],
  },
  {
    id: 'meta',
    label: { en: 'Elsewhere', es: 'En otra parte' },
    entries: [
      {
        label: { en: 'GitHub', es: 'GitHub' },
        path: GITHUB_ORG,
        external: true,
        status: 'live',
      },
      {
        label: { en: 'Agent skill repository', es: 'Repositorio de la skill' },
        path: SKILL_REPO_URL,
        external: true,
        status: 'live',
      },
      {
        label: { en: 'llms.txt', es: 'llms.txt' },
        path: '/llms.txt',
        status: 'live',
        file: 'llms.txt',
        // One file, not one per language — `/es/llms.txt` does not exist.
        languageNeutral: true,
      },
      {
        label: { en: 'Founding record', es: 'Registro fundacional' },
        path: `${GITHUB_URL}/tree/main/docs/context`,
        external: true,
        status: 'live',
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────

/** Prefix a site-relative path for a language (external URLs pass through). */
export function navHref(
  entry: Pick<NavEntry, 'path' | 'external' | 'languageNeutral'>,
  lang: Language
): string {
  if (entry.external) return entry.path;
  // A single artifact serving both languages — `llms.txt`, and anything else
  // emitted once at the root. Prefixing it produces a 404 on `/es`.
  if (entry.languageNeutral) return entry.path;
  const language = isValidLanguage(lang) ? lang : 'en';
  const prefix = getUrlPrefix(language);
  if (entry.path === '/') return prefix || '/';
  return `${prefix}${entry.path}`;
}

/**
 * The two repositories, as a header disclosure.
 *
 * Deliberately not a member of `NAV_GROUPS`: the IA caps the header at five
 * groups and the nav test checks every entry against a file under
 * `src/pages/`, neither of which should bend for two outbound links. The
 * header appends this after the live groups so it renders with the same
 * disclosure markup, the same keyboard behaviour and the same panel styling.
 *
 * One group rather than two bare marks — the point is that these are two
 * different repositories, and the same icon twice says the opposite.
 */
export const REPO_GROUP: NavGroup = {
  id: 'github',
  label: { en: 'GitHub', es: 'GitHub' },
  status: 'live',
  children: [
    {
      label: { en: 'Website repository', es: 'Repositorio del sitio' },
      path: GITHUB_URL,
      external: true,
      status: 'live',
      hint: {
        en: 'This site, the specification and the validator',
        es: 'Este sitio, la especificación y el validador',
      },
    },
    {
      label: { en: 'Skill repository', es: 'Repositorio de la skill' },
      path: SKILL_REPO_URL,
      external: true,
      status: 'live',
      hint: {
        en: 'The installable agent skill',
        es: 'La skill instalable para agentes',
      },
    },
  ],
};

/** Header groups that have something to show today. */
export function liveGroups(): NavGroup[] {
  return NAV_GROUPS.filter(
    (group) =>
      group.status === 'live' ||
      (group.children?.some((child) => child.status === 'live') ?? false)
  ).map((group) => ({
    ...group,
    children: group.children?.filter((child) => child.status === 'live'),
  }));
}

/** Footer columns with at least one live entry, pruned to those entries. */
export function liveFooterColumns(): FooterColumn[] {
  return FOOTER_COLUMNS.map((column) => ({
    ...column,
    entries: column.entries.filter((entry) => entry.status === 'live'),
  })).filter((column) => column.entries.length > 0);
}

/**
 * The flat list of live destinations, for the agent-Markdown twin.
 *
 * An agent reading a `.md` twin has no header to look at, so the twin carries
 * this block instead. It lists what a reader can actually reach today — the
 * same set the header shows, plus home and the repository.
 */
export function agentNavEntries(): NavEntry[] {
  const fromGroups = NAV_GROUPS.flatMap((group) => {
    const self: NavEntry[] =
      group.path && group.status === 'live'
        ? [{ label: group.label, path: group.path, status: group.status }]
        : [];
    const children = (group.children ?? []).filter(
      (child) => child.status === 'live'
    );
    return [...self, ...children];
  });
  const meta =
    FOOTER_COLUMNS.find((column) => column.id === 'meta')?.entries.filter(
      (entry) => entry.status === 'live' && entry.external
    ) ?? [];
  return [HOME_ENTRY, ...fromGroups, ...meta];
}

/** Every entry the IA declares, live or not — the roster the nav test reads. */
export function allEntries(): Array<NavEntry | NavGroup> {
  return [
    ...NAV_GROUPS,
    ...NAV_GROUPS.flatMap((group) => group.children ?? []),
    ...FOOTER_COLUMNS.flatMap((column) => column.entries),
  ];
}

/**
 * The same route in the other language.
 *
 * URL-first, per D-W1: this maps the path and nothing else. No persistence, no
 * redirect on the next visit, no guessing from `Accept-Language` — a URL a
 * reader shares must land the recipient on the language it names.
 *
 * `/`        ⇄ `/es`
 * `/foo/bar` ⇄ `/es/foo/bar`
 */
/**
 * Routes that exist once, for every language.
 *
 * The 404 page is emitted as a single `404.html` and served by the host for
 * any unmatched path, including under `/es`. Prefixing it produced a switcher
 * on the 404 page linking to `/es/404`, which is not a file — a broken link on
 * the page a reader reaches *because* something was already broken.
 *
 * The switcher sends them to that language's home instead, which is the
 * useful destination from a page that does not exist.
 */
const LANGUAGE_NEUTRAL_ROUTES = new Set(['/404']);

export function switchLanguagePath(pathname: string, target: Language): string {
  const prefix = getUrlPrefix(target);
  // Strip any known language prefix, leaving a root-relative route.
  const bare = pathname.replace(/^\/(es)(?=\/|$)/, '') || '/';
  const withoutTrailing = bare !== '/' ? bare.replace(/\/$/, '') : '/';
  if (withoutTrailing === '/') return prefix || '/';
  if (LANGUAGE_NEUTRAL_ROUTES.has(withoutTrailing)) return prefix || '/';
  return `${prefix}${withoutTrailing}`;
}
