/**
 * Allies directory helpers — communities and companies on /contributors.
 */
import { describe, expect, it, vi } from 'vitest';

const ALLIES = [
  {
    id: 'pereira-tech-talks',
    data: { name: 'Pereira Tech Talks', kind: 'community', order: 1 },
  },
  {
    id: 'dailybot',
    data: { name: 'DailyBot', kind: 'company', order: 2 },
  },
  {
    id: 'zeta-org',
    data: { name: 'Zeta Org', kind: 'organization', order: 2 },
  },
];

vi.mock('astro:content', () => ({
  getCollection: async (name: string) => {
    if (name === 'allies') return ALLIES;
    return [];
  },
}));

const ally = await import('@/lib/ally');

describe('ally directory', () => {
  it('sorts by order then name', async () => {
    const all = await ally.getAllies();
    expect(all.map((a) => a.id)).toEqual([
      'pereira-tech-talks',
      'dailybot',
      'zeta-org',
    ]);
  });

  it('filters by kind', async () => {
    const companies = await ally.getAlliesByKind('company');
    expect(companies.map((a) => a.id)).toEqual(['dailybot']);
  });
});
