import { describe, expect, it } from 'vitest';
import type { EcosystemAppFields } from '@/lib/ecosystem-apps';
import {
  filterActiveEcosystemApps,
  getFeaturedEcosystemApp,
  groupEcosystemAppsByCategory,
  sortEcosystemApps,
} from '@/lib/ecosystem-apps';

const sample: EcosystemAppFields[] = [
  {
    name: 'Zebra Aid',
    url: 'https://example.com/z',
    category: 'logistics',
    order: 2,
  },
  {
    name: 'Corag',
    url: 'https://ayuda.cabuya.org',
    category: 'matching',
    featured: true,
    order: 0,
  },
  {
    name: 'Alpha Map',
    url: 'https://example.com/a',
    category: 'damage',
    order: 1,
    active: false,
  },
  {
    name: 'Beta Help',
    url: 'https://example.com/b',
    category: 'matching',
    order: 1,
  },
];

describe('ecosystem-apps helpers', () => {
  it('filters inactive apps', () => {
    expect(filterActiveEcosystemApps(sample)).toHaveLength(3);
  });

  it('sorts featured first then by order then name', () => {
    const sorted = sortEcosystemApps(filterActiveEcosystemApps(sample));
    expect(sorted.map((a) => a.name)).toEqual([
      'Corag',
      'Beta Help',
      'Zebra Aid',
    ]);
  });

  it('returns the featured app', () => {
    expect(getFeaturedEcosystemApp(sample)?.name).toBe('Corag');
  });

  it('groups non-featured active apps by category', () => {
    const groups = groupEcosystemAppsByCategory(sample);
    expect(groups.matching.map((a) => a.name)).toEqual(['Beta Help']);
    expect(groups.damage).toEqual([]);
    expect(groups.logistics.map((a) => a.name)).toEqual(['Zebra Aid']);
  });
});
