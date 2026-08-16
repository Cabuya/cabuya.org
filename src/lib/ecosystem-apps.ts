/**
 * Helpers for the /ecosystem complementary-apps directory.
 *
 * Sorting: featured first, then by `order` ascending, then by name.
 * Categories match the Zod enum in `content.config.ts`.
 */

export const ECOSYSTEM_CATEGORIES = [
  'matching',
  'damage',
  'logistics',
  'pets',
  'people',
] as const;

export type EcosystemCategory = (typeof ECOSYSTEM_CATEGORIES)[number];

export interface EcosystemAppFields {
  name: string;
  url: string;
  category: EcosystemCategory;
  featured?: boolean;
  order?: number;
  active?: boolean;
}

/** Stable sort for directory rendering. */
export function sortEcosystemApps<T extends EcosystemAppFields>(
  apps: T[]
): T[] {
  return [...apps].sort((a, b) => {
    const af = a.featured === true ? 0 : 1;
    const bf = b.featured === true ? 0 : 1;
    if (af !== bf) return af - bf;
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, 'en');
  });
}

/** Drop inactive entries. */
export function filterActiveEcosystemApps<T extends EcosystemAppFields>(
  apps: T[]
): T[] {
  return apps.filter((a) => a.active !== false);
}

/** Group sorted apps by category (category order fixed). */
export function groupEcosystemAppsByCategory<T extends EcosystemAppFields>(
  apps: T[]
): Record<EcosystemCategory, T[]> {
  const groups = Object.fromEntries(
    ECOSYSTEM_CATEGORIES.map((c) => [c, [] as T[]])
  ) as Record<EcosystemCategory, T[]>;
  for (const app of sortEcosystemApps(filterActiveEcosystemApps(apps))) {
    if (app.featured) continue;
    groups[app.category].push(app);
  }
  return groups;
}

/** The single featured app, if any. */
export function getFeaturedEcosystemApp<T extends EcosystemAppFields>(
  apps: T[]
): T | undefined {
  return filterActiveEcosystemApps(apps).find((a) => a.featured === true);
}
