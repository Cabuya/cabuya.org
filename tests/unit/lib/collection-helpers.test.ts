/**
 * The small collection helpers the audit tooling depends on.
 *
 * `channel.ts` is `getCollection`-backed and the Markdown-twin serializers
 * read it, so a silent change in its filtering or ordering would reshape the
 * `.md` output without any page visibly breaking.
 */
import { describe, expect, it, vi } from 'vitest';

const CHANNELS = [
  {
    id: 'linkedin',
    data: {
      name: 'LinkedIn',
      platform: 'linkedin',
      isPrimary: false,
      order: 3,
    },
  },
  {
    id: 'luma',
    data: { name: 'Luma', platform: 'luma', isPrimary: true, order: 1 },
  },
  {
    id: 'github',
    data: { name: 'GitHub', platform: 'github', isPrimary: false, order: 2 },
  },
];

vi.mock('astro:content', () => ({
  getCollection: async (name: string) => (name === 'channels' ? CHANNELS : []),
}));

const { getChannels, getPrimaryChannels, getChannelsByPlatform } = await import(
  '@/lib/channel'
);

describe('channels', () => {
  it('sorts by declared order, not by id', async () => {
    expect((await getChannels()).map((c) => c.id)).toEqual([
      'luma',
      'github',
      'linkedin',
    ]);
  });

  it('isolates the primary channel', async () => {
    const primary = await getPrimaryChannels();
    expect(primary.map((c) => c.id)).toEqual(['luma']);
  });

  it('filters by platform', async () => {
    expect((await getChannelsByPlatform('github')).map((c) => c.id)).toEqual([
      'github',
    ]);
    expect(await getChannelsByPlatform('discord')).toEqual([]);
  });
});
