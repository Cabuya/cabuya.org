/**
 * The developers portal's sidebar.
 *
 * Order is the adoption journey, not the alphabet: a reader arrives wanting to
 * publish a feed, and the sidebar should read like the order in which they will
 * actually need things.
 *
 * Same `live`/`planned` contract as `site-navigation.ts`, for the same reason —
 * most of these routes ship in later tasks, and a sidebar that links to them
 * before they exist is a sidebar full of 404s. `planned` entries are not
 * rendered at all; they are the roster, and each names the task that lands it.
 * `tests/unit/lib/portal-nav.test.ts` fails if a live entry has no page, and
 * also if a page exists while its entry is still planned.
 */
import { getUrlPrefix, isValidLanguage, type Language } from '@/lib/i18n';

export type PortalStatus = 'live' | 'planned';

export interface PortalEntry {
  label: Record<string, string>;
  path: string;
  status: PortalStatus;
  /** The migration task that makes it live. Documentation, not logic. */
  ships?: string;
  /** One line for the portal home's card grid. */
  blurb?: Record<string, string>;
}

export interface PortalSection {
  id: string;
  label: Record<string, string>;
  entries: PortalEntry[];
}

export const PORTAL_SECTIONS: PortalSection[] = [
  {
    id: 'start',
    label: { en: 'Start here', es: 'Empieza aquí' },
    entries: [
      {
        label: { en: 'Overview', es: 'Panorama' },
        path: '/developers',
        status: 'live',
        blurb: {
          en: 'What the protocol is, and the shortest path through it.',
          es: 'Qué es el protocolo y el camino más corto para atravesarlo.',
        },
      },
      {
        label: { en: 'Quickstart', es: 'Guía rápida' },
        path: '/developers/quickstart',
        status: 'planned',
        ships: 'Task 24',
        blurb: {
          en: 'Publish your first feed. One afternoon for a small application.',
          es: 'Publica tu primer feed. Una tarde para una aplicación pequeña.',
        },
      },
    ],
  },
  {
    id: 'reference',
    label: { en: 'Reference', es: 'Referencia' },
    entries: [
      {
        label: { en: 'Specification', es: 'Especificación' },
        path: '/developers/spec',
        status: 'planned',
        ships: 'Task 25',
        blurb: {
          en: 'The normative text, versioned, with stable section anchors.',
          es: 'El texto normativo, versionado, con anclajes de sección estables.',
        },
      },
      {
        label: { en: 'Schemas', es: 'Esquemas' },
        path: '/developers/schemas',
        status: 'planned',
        ships: 'Task 25',
        blurb: {
          en: 'Every field, what it means, and which checks fire on it.',
          es: 'Cada campo, qué significa y qué verificaciones se disparan en él.',
        },
      },
      {
        label: { en: 'Profiles', es: 'Perfiles' },
        path: '/developers/profiles',
        status: 'planned',
        ships: 'Task 29',
      },
    ],
  },
  {
    id: 'tools',
    label: { en: 'Tools', es: 'Herramientas' },
    entries: [
      {
        label: { en: 'Validator', es: 'Validador' },
        path: '/developers/validator',
        status: 'planned',
        ships: 'Task 26',
        blurb: {
          en: 'Run it against a URL and read what it found.',
          es: 'Córrelo contra una URL y lee lo que encontró.',
        },
      },
      {
        label: { en: 'Checks', es: 'Verificaciones' },
        path: '/developers/validator/checks',
        status: 'planned',
        ships: 'Task 26',
      },
      {
        label: { en: 'Our probe', es: 'Nuestro sondeo' },
        path: '/developers/validator/probe',
        status: 'planned',
        ships: 'Task 27',
      },
      {
        label: { en: 'Agent skill', es: 'Skill para agentes' },
        path: '/developers/skill',
        status: 'planned',
        ships: 'Task 29',
        blurb: {
          en: 'Install the protocol into an agent; it works offline.',
          es: 'Instala el protocolo en un agente; funciona sin conexión.',
        },
      },
    ],
  },
  {
    id: 'consuming',
    label: { en: 'Consuming', es: 'Consumir' },
    entries: [
      {
        label: { en: 'Consumption rules', es: 'Reglas de consumo' },
        path: '/developers/consume',
        status: 'planned',
        ships: 'Task 29',
        blurb: {
          en: 'Six rules for reading someone else’s feed without harming them.',
          es: 'Seis reglas para leer el feed de otro sin hacerle daño.',
        },
      },
      {
        label: { en: 'MCP server', es: 'Servidor MCP' },
        path: '/developers/mcp',
        status: 'planned',
        ships: 'Task 29',
      },
      {
        label: { en: 'FAQ', es: 'Preguntas frecuentes' },
        path: '/developers/faq',
        status: 'planned',
        ships: 'Task 29',
      },
    ],
  },
];

/** Sections pruned to what exists today; empty sections drop out. */
export function livePortalSections(): PortalSection[] {
  return PORTAL_SECTIONS.map((section) => ({
    ...section,
    entries: section.entries.filter((entry) => entry.status === 'live'),
  })).filter((section) => section.entries.length > 0);
}

/** Every entry, live or not — the roster the nav test reads. */
export function allPortalEntries(): PortalEntry[] {
  return PORTAL_SECTIONS.flatMap((section) => section.entries);
}

/** Flat, ordered list of live entries — the sequence prev/next walks. */
export function portalOrder(): PortalEntry[] {
  return livePortalSections().flatMap((section) => section.entries);
}

export function portalHref(entry: PortalEntry, lang: Language): string {
  const language = isValidLanguage(lang) ? lang : 'en';
  return `${getUrlPrefix(language)}${entry.path}`;
}

/** Strip the language prefix so one comparison serves both languages. */
export function barePortalPath(pathname: string): string {
  const bare = pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return bare.length > 1 ? bare.replace(/\/$/, '') : bare;
}

export function isPortalActive(entry: PortalEntry, pathname: string): boolean {
  return barePortalPath(pathname) === entry.path;
}

/** The previous and next live entries around a path, for the page footer. */
export function portalNeighbours(pathname: string): {
  previous: PortalEntry | null;
  next: PortalEntry | null;
} {
  const order = portalOrder();
  const index = order.findIndex((entry) => isPortalActive(entry, pathname));
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? order[index - 1] : null,
    next: index < order.length - 1 ? order[index + 1] : null,
  };
}
