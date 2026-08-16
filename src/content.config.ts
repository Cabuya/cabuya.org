import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Reusable Zod helpers shared across collections.
 */

// String value or an {en, es} object. Collections accept either form. The
// string form is treated as language-neutral and rendered as-is in both
// languages.
const i18nString = z.union([
  z.string(),
  z.object({ en: z.string(), es: z.string() }),
]);

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/i, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    heroLayout: z
      .enum(['banner', 'side-by-side', 'minimal', 'none'])
      .default('banner')
      .optional(),
    tags: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    relatedSlide: z.string().optional(),
    author: z.string().default('sergio-florez'),
    draft: z.boolean().default(false).optional(),
  }),
});

const tags = defineCollection({
  loader: glob({ base: './src/content/tags', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    tier: z.enum(['primary', 'secondary', 'subtopic']).default('primary'),
    parent: z.string().optional(),
    order: z.number().default(0),
  }),
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(0),
    heroImage: z.string().optional(),
    heroImageEs: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/i, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.coerce.date().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.yaml' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    avatar: z.string(),
    role: z.object({
      en: z.string(),
      es: z.string(),
    }),
    bio: z.object({
      en: z.string(),
      es: z.string(),
    }),
    social: z
      .object({
        x: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
});

/**
 * NEW v3.0.0 COLLECTIONS
 */

const channels = defineCollection({
  loader: glob({ base: './src/content/channels', pattern: '**/*.yaml' }),
  schema: z.object({
    name: z.string(),
    platform: z.enum([
      'discord',
      'whatsapp',
      'telegram',
      'meetup-com',
      'luma',
      'youtube',
      'x',
      'linkedin',
      'instagram',
      'facebook',
      'github',
      'linktree',
      'newsletter',
      'website',
      'other',
    ]),
    url: z.url(),
    description: i18nString,
    audience: i18nString,
    isPrimary: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const contributors = defineCollection({
  // Distinct from `authors` (which stays the canonical author collection for
  // blog posts). Contributors include all kinds of community members:
  // organizers, vertical leads, mentors, volunteers, sponsor liaisons.
  loader: glob({ base: './src/content/contributors', pattern: '**/*.yaml' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.string(),
    roles: z
      .array(
        z.enum([
          'founding-organizer',
          'organizer',
          'vertical-lead',
          'mentor',
          'speaker',
          'contributor',
          'sponsor-liaison',
          'press-lead',
          'conduct-team',
          'alumni',
        ])
      )
      .min(1),
    primaryVertical: z.string().optional(),
    role: z.object({
      en: z.string(),
      es: z.string(),
    }),
    bio: z.object({
      en: z.string(),
      es: z.string(),
    }),
    social: z
      .object({
        x: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
        mastodon: z.string().optional(),
        bluesky: z.string().optional(),
      })
      .optional(),
    activeSince: z.coerce.date().optional(),
    inactiveSince: z.coerce.date().optional(),
    order: z.number().default(0),
  }),
});

/**
 * Allied communities and companies shown on /contributors alongside people.
 * Logos ship only with express authorization (see partners page copy).
 */
const allies = defineCollection({
  loader: glob({ base: './src/content/allies', pattern: '**/*.yaml' }),
  schema: z.object({
    name: z.string(),
    /** Horizontal wordmark for light backgrounds. */
    logo: z.string(),
    /** Optional horizontal wordmark for dark backgrounds. Falls back to `logo`. */
    logoDark: z.string().optional(),
    kind: z.enum(['community', 'company', 'organization']),
    role: z.object({
      en: z.string(),
      es: z.string(),
    }),
    bio: z.object({
      en: z.string(),
      es: z.string(),
    }),
    url: z.url().optional(),
    order: z.number().default(0),
  }),
});

/**
 * Complementary civic / emergency apps listed on /ecosystem.
 * Descriptive directory — not an endorsement ranking. Logos: local paths only;
 * `logoAuthorization` records how we may show them.
 */
const ecosystemI18n = z.object({ en: z.string(), es: z.string() });
const ecosystemI18nList = z.array(ecosystemI18n).max(12).default([]);
const ecosystemAvailability = z
  .enum(['yes', 'no', 'unknown'])
  .default('unknown');

const ecosystemApps = defineCollection({
  loader: glob({ base: './src/content/ecosystem-apps', pattern: '**/*.yaml' }),
  schema: z.object({
    name: z.string(),
    url: z.url(),
    aliases: z.array(z.string()).default([]),
    category: z.enum(['matching', 'damage', 'logistics', 'pets', 'people']),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    /** Site-root path to a local WebP, e.g. `/images/ecosystem/foo/logo.webp`. */
    logo: z.string().optional(),
    logoDark: z.string().optional(),
    logoAuthorization: z
      .enum([
        'authorized',
        'pending_contact',
        'public_favicon_only',
        'text_only',
      ])
      .default('text_only'),
    /** Initials / short mark when there is no logo file. */
    monogram: z.string().optional(),
    tagline: ecosystemI18n,
    what: ecosystemI18n,
    how: ecosystemI18n,
    /** Longer modal intro; falls back to `what` when omitted. */
    overview: ecosystemI18n.optional(),
    /** Concrete capabilities the public site describes. */
    features: ecosystemI18nList,
    /** Named tools / product surfaces (UI actions, MCP tools, etc.). */
    tools: ecosystemI18nList,
    audience: ecosystemI18n.optional(),
    coverage: ecosystemI18n.optional(),
    /** Honest limits — never invent capabilities. */
    limits: ecosystemI18n.optional(),
    /**
     * Integration surface as verified from public docs/sites.
     * `unknown` means we have not confirmed a public API or MCP — not a denial.
     */
    integrations: z
      .object({
        publicApi: ecosystemAvailability,
        publicMcp: ecosystemAvailability,
        apiDocsUrl: z.url().optional(),
        openApiUrl: z.url().optional(),
        mcpUrl: z.url().optional(),
        /** Absolute https URL or site path like `/developers`. */
        developersUrl: z
          .string()
          .refine(
            (v) => v.startsWith('/') || /^https?:\/\//i.test(v),
            'developersUrl must be a path or http(s) URL'
          )
          .optional(),
        notes: ecosystemI18n.optional(),
      })
      .default({ publicApi: 'unknown', publicMcp: 'unknown' }),
    /** Fallback when an entry still lists docs at the root (prefer integrations). */
    apiDocsUrl: z.url().optional(),
    active: z.boolean().default(true),
  }),
});

/**
 * Public Google Calendars for allied organizations.
 * IDs must be embeddable (public); no API keys.
 */

/**
 * Site-wide top notifications / alerts with date windows.
 * Plain strings only (no HTML) — rendered as text in the bar/modal.
 * CTA hrefs: internal paths or absolute http(s) only (blocks javascript:/data:).
 */
const notificationSafeHref = z
  .string()
  .regex(
    /^(\/(?!\/)|https?:\/\/)/,
    'ctaHref must be an internal path (starting with /) or an absolute http(s) URL'
  );

const notifications = defineCollection({
  loader: glob({
    base: './src/content/notifications',
    pattern: '**/*.{yaml,yml}',
  }),
  schema: z.object({
    severity: z
      .enum(['info', 'important', 'success', 'warning'])
      .default('info'),
    title: z.object({ en: z.string(), es: z.string() }),
    summary: z.object({ en: z.string(), es: z.string() }),
    body: z
      .object({ en: z.string().optional(), es: z.string().optional() })
      .optional(),
    /** Optional modal hero (e.g. PTD card art). Prefer landscape ~16:9. */
    image: z
      .object({
        /** String = both languages; `{ en, es }` when the art is localized. */
        src: i18nString,
        alt: z.object({ en: z.string(), es: z.string() }),
      })
      .optional(),
    ctaLabel: z.object({ en: z.string(), es: z.string() }).optional(),
    ctaHref: notificationSafeHref.optional(),
    modalEnabled: z.boolean().default(false),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    priority: z.number().int().default(0),
    active: z.boolean().default(true),
  }),
});

export const collections = {
  // Existing
  blog,
  tags,
  series,
  pages,
  authors,
  // v3.0.0 — community website model
  channels,
  contributors,
  allies,
  ecosystemApps,
  notifications,
};
