/**
 * The directory helpers the `.md` twins and their meta descriptions read.
 *
 * `contributors.md` lists the team, `slides.md` the decks, and the speaker and
 * sponsor twins are built from these joins — so a change in their filtering or
 * ordering silently reshapes agent output. All three sat well under the repo's
 * coverage target because every function is `getCollection`-backed.
 *
 * Part of PLAN_sitewide_language_seo_aeo_audit Task 11.
 */
import { describe, expect, it, vi } from 'vitest';

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const CONTRIBUTORS = [
  {
    id: 'sergio-florez',
    data: { name: 'Sergio Florez', roles: ['founding-organizer'], order: 1 },
  },
  {
    id: 'eliana-osorio',
    data: { name: 'Eliana Osorio', roles: ['organizer', 'mentor'], order: 2 },
  },
  {
    id: 'alumni-person',
    data: {
      name: 'Alumni Person',
      roles: ['organizer'],
      order: 3,
      inactiveSince: day('2020-01-01'),
    },
  },
  {
    id: 'zoe-mentor',
    data: { name: 'Zoe Mentor', roles: ['mentor'], order: 2 },
  },
];

const SLIDES = [
  {
    id: 'en/2026-04-25_demo-revealjs-features',
    data: {
      title: 'Demo deck',
      description: 'A demo.',
      pubDate: day('2026-04-25'),
      type: 'native',
      draft: false,
    },
  },
  {
    id: 'en/2025-01-10_older-deck',
    data: {
      title: 'Older deck',
      description: 'Older.',
      pubDate: day('2025-01-10'),
      type: 'external',
      externalUrl: 'https://deck.test/older',
      provider: 'Speaker Deck',
      draft: false,
    },
  },
  {
    id: 'es/2026-04-25_demo-revealjs-features',
    data: {
      title: 'Deck de demostración',
      description: 'Una demo.',
      pubDate: day('2026-04-25'),
      type: 'native',
      draft: false,
    },
  },
];

vi.mock('astro:content', () => ({
  getEntry: async (_collection: string, id: string) =>
    SLIDES.find((d) => d.id === id),
  getCollection: async (name: string) => {
    if (name === 'contributors') return CONTRIBUTORS;
    if (name === 'slides') return SLIDES;
    return [];
  },
}));

const contributor = await import('@/lib/contributor');

describe('contributor directory', () => {
  it('sorts by declared order, then by name', async () => {
    const all = await contributor.getContributors();
    expect(all.map((c) => c.id)).toEqual([
      'sergio-florez',
      'eliana-osorio',
      'zoe-mentor',
      'alumni-person',
    ]);
  });

  it('splits active from alumni on `inactiveSince`', async () => {
    expect(
      (await contributor.getActiveContributors()).map((c) => c.id)
    ).not.toContain('alumni-person');
    expect((await contributor.getPastContributors()).map((c) => c.id)).toEqual([
      'alumni-person',
    ]);
  });

  it('filters by role, from the active set only', async () => {
    const mentors = await contributor.getContributorsByRole('mentor');
    expect(mentors.map((c) => c.id)).toEqual(['eliana-osorio', 'zoe-mentor']);
  });

  it('treats founding organizers as organizers', async () => {
    const organizers = await contributor.getOrganizers();
    expect(organizers.map((c) => c.id)).toEqual([
      'sergio-florez',
      'eliana-osorio',
    ]);
  });

  it('resolves slugs in the caller order and drops unknown ones', async () => {
    // Edition `organizers` arrays are ordered deliberately; an unknown slug
    // must vanish rather than render as raw text.
    const resolved = await contributor.getContributorsBySlugs([
      'zoe-mentor',
      'nope',
      'sergio-florez',
    ]);
    expect(resolved.map((c) => c.id)).toEqual(['zoe-mentor', 'sergio-florez']);
  });

  it('builds the Equipo page split the page actually renders', async () => {
    const current = await contributor.getCurrentTeamOrganizers();
    const collaborators = await contributor.getPublishedCollaborators();
    const past = await contributor.getPastTeamMembers();
    expect(current.map((c) => c.id)).toEqual([
      'sergio-florez',
      'eliana-osorio',
    ]);
    expect(collaborators.map((c) => c.id)).toEqual(['zoe-mentor']);
    expect(past.map((c) => c.id)).toEqual(['alumni-person']);
  });

  it('does not reorder the array it was given', async () => {
    const input = [...CONTRIBUTORS] as never[];
    contributor.sortContributors(input);
    expect(input.map((c: { id: string }) => c.id)).toEqual(
      CONTRIBUTORS.map((c) => c.id)
    );
  });
});
