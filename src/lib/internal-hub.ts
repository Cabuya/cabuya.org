/**
 * The internal hub's page registry.
 *
 * One list, three consumers: the sidebar in `InternalLayout`, the card grid on
 * `/internal`, and `tests/unit/lib/internal-hub.test.ts`, which asserts the
 * registry and the filesystem agree **in both directions**.
 *
 * That test is the point. The hub previously linked to `/internal/authors` and
 * `/internal/certificates` long after those pages were deleted — a dev-only
 * portal that 404s teaches contributors it is unmaintained, and then they stop
 * reading it. Hand-maintained navigation drifts; a registry the tests can check
 * against the filesystem does not.
 *
 * Adding a page: create the `.astro` file, add an entry here. Either alone
 * fails the test, with a message naming which side is missing.
 */

export type InternalSectionId = 'hub' | 'brand' | 'ui' | 'guide' | 'meta';

export interface InternalPage {
  /** Stable id; also the `section`/`subsection` value pages pass to the layout. */
  id: string;
  /** Route, always absolute and without a trailing slash (except `/internal`). */
  href: string;
  /** Path of the source file, relative to `src/pages/`. Checked by the test. */
  file: string;
  title: string;
  /** One line: what a contributor comes to this page to find out. */
  purpose: string;
  section: InternalSectionId;
  /** Shown in the sidebar's top level. Sub-pages appear under their section. */
  topLevel?: boolean;
  /** Monospace glyph used as the sidebar marker — no icon font, no payload. */
  icon?: string;
}

export const INTERNAL_PAGES: InternalPage[] = [
  {
    id: 'hub',
    href: '/internal',
    file: 'internal/index.astro',
    title: 'Hub',
    purpose: 'Everything the dev-only portal holds, in one grid.',
    section: 'hub',
    topLevel: true,
    icon: '~',
  },

  // ── Brand book ────────────────────────────────────────────
  {
    id: 'brand',
    href: '/internal/brand',
    file: 'internal/brand/index.astro',
    title: 'Brand Book',
    purpose:
      'The story, the mark, and the rules the rest of the brand pages detail.',
    section: 'brand',
    topLevel: true,
    icon: '*',
  },
  {
    id: 'brand-colors',
    href: '/internal/brand/colors',
    file: 'internal/brand/colors.astro',
    title: 'Palette',
    purpose:
      'The five colors and the derived fique-strong, with contrast measured at build time.',
    section: 'brand',
  },
  {
    id: 'brand-logo',
    href: '/internal/brand/logo-usage',
    file: 'internal/brand/logo-usage.astro',
    title: 'Logo usage',
    purpose:
      'Every delivered asset rendered on both grounds; clear space and misuse.',
    section: 'brand',
  },
  {
    id: 'brand-assets',
    href: '/internal/brand/assets',
    file: 'internal/brand/assets.astro',
    title: 'Icons & assets',
    purpose:
      'Favicon set, PWA icons and manifest, rendered at true size so a broken one is visible.',
    section: 'brand',
  },
  {
    id: 'brand-typography',
    href: '/internal/brand/typography',
    file: 'internal/brand/typography.astro',
    title: 'Typography',
    purpose: 'Outfit for display, Poppins for body — specimens and the scale.',
    section: 'brand',
  },
  {
    id: 'brand-spacing',
    href: '/internal/brand/spacing-radius-motion',
    file: 'internal/brand/spacing-radius-motion.astro',
    title: 'Spacing · Radius · Motion',
    purpose:
      'The 4px base scale, radius tokens, and the reduced-motion contract.',
    section: 'brand',
  },
  {
    id: 'brand-iconography',
    href: '/internal/brand/iconography',
    file: 'internal/brand/iconography.astro',
    title: 'Iconography',
    purpose: 'Stroke weights, sizes, and when an icon needs a text label.',
    section: 'brand',
  },
  {
    id: 'brand-voice',
    href: '/internal/brand/voice-and-tone',
    file: 'internal/brand/voice-and-tone.astro',
    title: 'Voice & badge language',
    purpose:
      'The register, the banned vocabulary, and what the conformance badge may say.',
    section: 'brand',
  },

  // ── UI design system ──────────────────────────────────────
  {
    id: 'ui',
    href: '/internal/ui',
    file: 'internal/ui/index.astro',
    title: 'UI Design System',
    purpose:
      'Live specimens of every primitive, rendered with the real utilities.',
    section: 'ui',
    topLevel: true,
    icon: '#',
  },
  {
    id: 'ui-components',
    href: '/internal/ui/components',
    file: 'internal/ui/components.astro',
    title: 'Component contact sheet',
    purpose: 'Every primitive on one page, light and dark side by side.',
    section: 'ui',
  },
  {
    id: 'ui-colors',
    href: '/internal/ui/colors',
    file: 'internal/ui/colors.astro',
    title: 'Tokens (live)',
    purpose: 'Every token painted by its own utility, hex read at runtime.',
    section: 'ui',
  },
  {
    id: 'ui-brand',
    href: '/internal/ui/brand',
    file: 'internal/ui/brand.astro',
    title: 'Brand surfaces',
    purpose: 'The fill pair, brand grounds and how they behave across themes.',
    section: 'ui',
  },
  {
    id: 'ui-typography',
    href: '/internal/ui/typography',
    file: 'internal/ui/typography.astro',
    title: 'Type scale',
    purpose: 'Rendered heading and body scale with line-height and tracking.',
    section: 'ui',
  },
  {
    id: 'ui-buttons',
    href: '/internal/ui/buttons',
    file: 'internal/ui/buttons.astro',
    title: 'Buttons',
    purpose: 'Variants, sizes, states, and the focus ring.',
    section: 'ui',
  },
  {
    id: 'ui-cards',
    href: '/internal/ui/cards',
    file: 'internal/ui/cards.astro',
    title: 'Cards',
    purpose: 'Surface elevations and card composition.',
    section: 'ui',
  },
  {
    id: 'ui-forms',
    href: '/internal/ui/forms',
    file: 'internal/ui/forms.astro',
    title: 'Forms',
    purpose: 'Inputs, labels, help text, and error states.',
    section: 'ui',
  },
  {
    id: 'ui-badges',
    href: '/internal/ui/badges',
    file: 'internal/ui/badges.astro',
    title: 'Badges & status',
    purpose: 'Status pills and the conformance-badge specimens.',
    section: 'ui',
  },
  {
    id: 'ui-navigation',
    href: '/internal/ui/navigation',
    file: 'internal/ui/navigation.astro',
    title: 'Navigation',
    purpose: 'Header, breadcrumbs, and the disclosure pattern for dropdowns.',
    section: 'ui',
  },
  {
    id: 'ui-layouts',
    href: '/internal/ui/layouts',
    file: 'internal/ui/layouts.astro',
    title: 'Layouts',
    purpose: 'Page shells, section rhythm, and container widths.',
    section: 'ui',
  },
  {
    id: 'ui-spacing',
    href: '/internal/ui/spacing',
    file: 'internal/ui/spacing.astro',
    title: 'Spacing',
    purpose: 'The spacing scale rendered at size.',
    section: 'ui',
  },
  {
    id: 'ui-radius',
    href: '/internal/ui/radius',
    file: 'internal/ui/radius.astro',
    title: 'Radius',
    purpose: 'Corner radii and where each is used.',
    section: 'ui',
  },

  // ── Contributor guide ─────────────────────────────────────
  {
    id: 'guide',
    href: '/internal/guide',
    file: 'internal/guide/index.astro',
    title: 'Contributor Guide',
    purpose: 'How to work on this repository, and which gate answers what.',
    section: 'guide',
    topLevel: true,
    icon: '>',
  },
  {
    id: 'guide-tech-stack',
    href: '/internal/guide/tech-stack',
    file: 'internal/guide/tech-stack.astro',
    title: 'Tech stack',
    purpose: 'Astro 7, Sätteri, Svelte 5, Tailwind 4 — and why each is pinned.',
    section: 'guide',
  },
  {
    id: 'guide-file-structure',
    href: '/internal/guide/file-structure',
    file: 'internal/guide/file-structure.astro',
    title: 'File structure',
    purpose:
      'Where things live, including the bounded spec/ and registry/ trees.',
    section: 'guide',
  },
  {
    id: 'guide-content-collections',
    href: '/internal/guide/content-collections',
    file: 'internal/guide/content-collections.astro',
    title: 'Content collections',
    purpose: 'The Zod schemas behind every content type.',
    section: 'guide',
  },
  {
    id: 'guide-i18n',
    href: '/internal/guide/i18n',
    file: 'internal/guide/i18n.astro',
    title: 'i18n',
    purpose:
      'English at /, Spanish at /es, and the [lang] tree that makes N easy.',
    section: 'guide',
  },
  {
    id: 'guide-seo',
    href: '/internal/guide/seo',
    file: 'internal/guide/seo.astro',
    title: 'SEO & AEO',
    purpose: 'Metadata, structured data, and the Markdown twins agents read.',
    section: 'guide',
  },
  {
    id: 'guide-performance',
    href: '/internal/guide/performance',
    file: 'internal/guide/performance.astro',
    title: 'Performance',
    purpose: 'Hydration policy and the per-route JavaScript budgets.',
    section: 'guide',
  },
  {
    id: 'guide-analytics',
    href: '/internal/guide/analytics',
    file: 'internal/guide/analytics.astro',
    title: 'Analytics',
    purpose: 'What is measured, cookielessly, and what is deliberately not.',
    section: 'guide',
  },
  {
    id: 'guide-ai-skills',
    href: '/internal/guide/ai-skills',
    file: 'internal/guide/ai-skills.astro',
    title: 'Agents & skills',
    purpose: 'The .agents tree: skills, commands, and the agent definitions.',
    section: 'guide',
  },

  // ── Meta ──────────────────────────────────────────────────
  {
    id: 'sitemap',
    href: '/internal/sitemap',
    file: 'internal/sitemap.astro',
    title: 'Sitemap',
    purpose: 'Every public URL, generated from the route tree.',
    section: 'meta',
    topLevel: true,
    icon: '@',
  },
];

export const INTERNAL_SECTIONS: Array<{
  id: InternalSectionId;
  title: string;
  blurb: string;
}> = [
  {
    id: 'brand',
    title: 'Brand book',
    blurb:
      'The identity as it is actually implemented: story, mark, measured palette, type, voice.',
  },
  {
    id: 'ui',
    title: 'UI design system',
    blurb:
      'Live specimens. Every swatch and component is painted by the same utilities the site uses.',
  },
  {
    id: 'guide',
    title: 'Contributor guide',
    blurb:
      'How the repository is put together and which gate to run when something is unclear.',
  },
  {
    id: 'meta',
    title: 'Meta',
    blurb: 'Generated views over the site itself.',
  },
];

export function pagesIn(section: InternalSectionId): InternalPage[] {
  return INTERNAL_PAGES.filter((page) => page.section === section);
}

export function topLevelPages(): InternalPage[] {
  return INTERNAL_PAGES.filter((page) => page.topLevel);
}

export function pageById(id: string): InternalPage | undefined {
  return INTERNAL_PAGES.find((page) => page.id === id);
}
