/**
 * Content collections for cabuya.org.
 *
 * Migration note (Task 7): the Corag collections (blog, pages, authors,
 * channels, contributors, tags, series, allies, ecosystem-apps,
 * notifications) were decommissioned with their surfaces. The Cabuya
 * collections land with their tasks:
 *   - `docs` (portal prose)            — Task 23 ✅
 *   - `specVersions`/`schemas`/
 *     `examples`/`rfcs`/`changelog`    — Task 25 (via spec-loader, B2)
 *   - `publishers`                     — Task 28 (via registry-loader, B2)
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 7 deprecates its own `z` re-export; the project depends on zod directly.
import { z } from 'zod';

/**
 * Portal prose.
 *
 * One file per page per language, under `src/content/docs/{lang}/`. The
 * language lives in the path rather than in frontmatter so a missing
 * translation is a missing file — visible in a directory listing and in the
 * parity gate, rather than a field somebody forgot to fill in.
 *
 * `order` and `section` mirror `src/lib/portal-nav.ts`. They are not the
 * sidebar's source of truth: the sidebar has to list routes that come from
 * loaders too (the spec sections, the schema reference), and those have no
 * Markdown file to carry frontmatter. They exist so a prose page can be sorted
 * within its section without editing the nav module.
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['start', 'reference', 'tools', 'consuming']),
    order: z.number().int().nonnegative(),
    /**
     * The date the content last changed, and it must be honest: the portal
     * renders it, and a stale "updated" is worse than none — it tells a reader
     * the page was checked when it was not.
     *
     * Coerced rather than typed as a string because YAML parses an unquoted
     * `2026-08-17` into a Date already, and requiring authors to quote it is a
     * rule that will be forgotten on the first page somebody adds in a hurry.
     */
    updated: z.coerce.date(),
    /** Hidden from the sidebar while a page is being written. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
