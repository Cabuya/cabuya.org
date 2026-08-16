/**
 * Client-safe ecosystem view types and pure helpers.
 * Keep `astro:content` out of this module — Svelte islands import it.
 */

import type { EcosystemCategory } from '@/lib/ecosystem-apps';
import type { Language } from '@/lib/i18n';

export type EcosystemAvailability = 'yes' | 'no' | 'unknown';

/** Serializable card + modal payload for the client island. */
export interface EcosystemAppView {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  category: EcosystemCategory;
  featured: boolean;
  logo?: string;
  logoAuthorization: string;
  monogram?: string;
  tagline: string;
  what: string;
  how: string;
  overview: string;
  features: string[];
  tools: string[];
  audience?: string;
  coverage?: string;
  limits?: string;
  integrations: {
    publicApi: EcosystemAvailability;
    publicMcp: EcosystemAvailability;
    apiDocsUrl?: string;
    openApiUrl?: string;
    mcpUrl?: string;
    developersUrl?: string;
    notes?: string;
  };
}

/**
 * Human-readable host (+ path when meaningful) for card display.
 * Strips protocol, `www.`, and a trailing slash.
 */
export function formatEcosystemDisplayUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./i, '');
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
    return `${host}${path}`;
  } catch {
    return rawUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

/** Resolve developers links that may be site-relative. */
export function resolveEcosystemDevelopersUrl(
  raw: string | undefined,
  urlPrefix: string
): string | undefined {
  if (!raw) return undefined;
  if (raw.startsWith('/')) {
    return `${urlPrefix}${raw}`;
  }
  return raw;
}

export function pickEcosystemI18n(
  value: { en: string; es: string } | undefined,
  lang: Language
): string | undefined {
  if (!value) return undefined;
  return value[lang];
}
