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

import type { RootDocId } from '@/lib/root-docs';
import { rootDoc } from '@/lib/root-docs';
import { specRfcs, specSections, specVersions } from '@/lib/spec-loader';

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
     * Structured data to emit for this page, when it has a shape worth
     * declaring. Only `faq` today, and it is generated from the page's own
     * headings rather than written — a second copy of the answers is a copy
     * that drifts, and the one that drifts is the one search engines read.
     */
    jsonld: z.enum(['faq']).optional(),
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

/**
 * The specification, as a collection — read through `spec-loader.ts`.
 *
 * A `glob()` loader aimed at the spec directory would be shorter and would
 * break B2: the
 * bounded directory must have exactly one site-side reader, so that lifting it
 * into another repository is a copy rather than an archaeology exercise. A
 * custom loader keeps the collection API (`getCollection`, `render`, the
 * heading list, Sätteri's plugins) while every file read still goes through the
 * adapter.
 *
 * `renderMarkdown` is the loader-context helper: it runs the same Markdown
 * pipeline configured in `astro.config.mjs`, which is how the spec's headings
 * get their §-numbered anchors and its MUSTs get marked.
 */
const specSectionsCollection = defineCollection({
  loader: {
    name: 'cabuya-spec',
    async load({ store, renderMarkdown, parseData }) {
      store.clear();
      for (const version of specVersions()) {
        for (const section of specSections(version)) {
          const id = `${version}/${section.slug}`;
          const data = await parseData({
            id,
            data: {
              version: section.version,
              slug: section.slug,
              number: section.number,
              title: section.title,
              status: section.status,
              order: section.order,
            },
          });
          store.set({
            id,
            data,
            body: section.body,
            rendered: await renderMarkdown(section.body),
          });
        }
      }
    },
  },
  schema: z.object({
    version: z.string(),
    slug: z.string(),
    number: z.string(),
    title: z.string(),
    status: z.enum(['draft', 'rc', 'normative', 'superseded']),
    order: z.number(),
  }),
});

/**
 * Repository-root governance documents, rendered as pages.
 *
 * `GOVERNANCE.md`, `TRADEMARK.md` and `CONTRIBUTING.md` are the source of truth
 * for what the project's rules *are* — a developer evaluating adoption reads
 * them on GitHub before they visit the site, and a fork carries them. The pages
 * are a second surface on the same text, never a second text.
 *
 * A custom loader rather than `glob()`, for the same reason the spec uses one:
 * the files are not in `src/content/`, they are where their readers look for
 * them, and one adapter (`src/lib/root-docs.ts`) is the only thing that knows
 * where that is.
 */
const rootDocsCollection = defineCollection({
  loader: {
    name: 'cabuya-root-docs',
    async load({ store, renderMarkdown, parseData }) {
      store.clear();
      const ids: RootDocId[] = ['GOVERNANCE', 'TRADEMARK', 'CONTRIBUTING'];
      for (const docId of ids) {
        for (const lang of ['en', 'es'] as const) {
          const doc = rootDoc(docId, lang);
          const id = `${lang}/${docId}`;
          const data = await parseData({
            id,
            data: { docId, lang, file: doc.file, title: doc.title },
          });
          store.set({
            id,
            data,
            body: doc.body,
            rendered: await renderMarkdown(doc.body),
          });
        }
      }
    },
  },
  schema: z.object({
    docId: z.enum(['GOVERNANCE', 'TRADEMARK', 'CONTRIBUTING']),
    lang: z.enum(['en', 'es']),
    file: z.string(),
    title: z.string(),
  }),
});

/**
 * RFCs, read through the spec loader.
 *
 * RFC-0001 is genuinely bilingual as authored — the founding agreement puts the
 * Spanish and the English side by side in one document, because it is a thing
 * people sign and both halves have to be signable. So the same entry serves
 * both language routes, and the RFC page carries a notice saying so rather than
 * pretending a translation exists or hiding the page from Spanish readers.
 */
const rfcsCollection = defineCollection({
  loader: {
    name: 'cabuya-rfcs',
    async load({ store, renderMarkdown, parseData }) {
      store.clear();
      for (const rfc of specRfcs()) {
        const data = await parseData({
          id: rfc.id,
          data: {
            id: rfc.id,
            number: rfc.number,
            slug: rfc.slug,
            title: rfc.title,
            status: rfc.status,
            tier: rfc.tier,
            opened: rfc.opened,
            decided: rfc.decided,
          },
        });
        store.set({
          id: rfc.id,
          data,
          body: rfc.body,
          rendered: await renderMarkdown(rfc.body),
        });
      }
    },
  },
  schema: z.object({
    id: z.string(),
    number: z.number(),
    slug: z.string(),
    title: z.string(),
    status: z.enum([
      'draft',
      'open',
      'accepted',
      'declined',
      'withdrawn',
      'superseded',
    ]),
    tier: z.string(),
    opened: z.string(),
    decided: z.string().nullable(),
  }),
});

export const collections = {
  rootDocs: rootDocsCollection,
  rfcs: rfcsCollection,
  docs,
  spec: specSectionsCollection,
};
