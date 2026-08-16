import type { CollectionEntry } from 'astro:content';
import { APP_PATHS, appUrl, SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getUrlPrefix,
  isValidLanguage,
  type Language,
} from '@/lib/i18n';
import { navHref, navLabel, SITE_NAVIGATION } from '@/lib/site-navigation';
import { getTranslations } from '@/lib/translations';
import type {
  InstitutionalFigure,
  InstitutionalPageCopy,
} from '@/lib/translations/types';

/**
 * The Site Navigation block every agent-Markdown output ends with.
 *
 * Derived from `@/lib/site-navigation` — the same structure the footer renders —
 * so it cannot drift from the live site. It previously duplicated the structure
 * here and had gone stale: it linked `/talks` (a 301 to `/meetups/`) and was
 * missing `/communities`, `/calendar` and `/slides`.
 */
function generateSiteNavigation(lang: string): string {
  const heading = lang === 'es' ? 'Navegación del Sitio' : 'Site Navigation';
  const lines: string[] = ['', '---', '', `## ${heading}`, ''];

  for (const group of SITE_NAVIGATION) {
    lines.push(`**${group.title[lang] ?? group.title.en}:**`);
    for (const entry of group.entries) {
      lines.push(`- [${navLabel(entry, lang)}](${navHref(entry, lang)})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

interface PostSerializeOptions {
  slug: string;
  lang: string;
  /** Resolved author — the HTML renders a byline card, so the .md must too. */
  author?: { slug: string; name: string; role: string; bio: string };
  /** Resolved related posts, matching the "you might also like" block. */
  related?: Array<{
    slug: string;
    title: string;
    description: string;
    date: string;
  }>;
  /** Reading time in minutes, as shown in the HTML header. */
  readingMinutes?: number;
  /** Series context when the post belongs to one. */
  series?: {
    slug: string;
    title: string;
    order: number;
    total: number;
  };
}

interface BlogIndexEntry {
  title: string;
  slug: string;
  description: string;
  pubDate: Date;
  tags?: string[];
}

interface BlogIndexOptions {
  lang: string;
  title: string;
  description: string;
}

interface PageSerializeOptions {
  slug: string;
  lang: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * URL prefix for a language, derived from the i18n registry rather than
 * assuming which language sits at the root. Spanish is the default and is
 * served unprefixed; English lives under `/en`.
 */
function buildUrlPrefix(lang: string): string {
  return getUrlPrefix(isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE);
}

/**
 * Serialize a blog post to agent-friendly Markdown.
 * Returns clean Markdown with metadata header + original body.
 */
export function serializePostToAgentMarkdown(
  post: CollectionEntry<'blog'>,
  options: PostSerializeOptions
): string {
  const { slug, lang, author, related, readingMinutes, series } = options;
  const { title, description, pubDate, updatedDate, tags, heroImage } =
    post.data;
  const prefix = buildUrlPrefix(lang);
  const canonicalUrl = `${SITE_URL}${prefix}/blog/${slug}`;
  const L = (key: AgentMdLabelKey) => mdLabel(lang, key);

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');
  lines.push(`Published: ${formatDate(pubDate)}`);
  if (updatedDate) {
    lines.push(`Updated: ${formatDate(updatedDate)}`);
  }
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonicalUrl}`);
  if (tags && tags.length > 0) {
    lines.push(`Tags: ${tags.join(', ')}`);
  }
  if (heroImage) {
    lines.push(`Hero Image: ${SITE_URL}${heroImage}`);
  }
  if (author) {
    lines.push(`${lang === 'es' ? 'Autor' : 'Author'}: ${author.name}`);
  }
  if (typeof readingMinutes === 'number') {
    lines.push(
      `${lang === 'es' ? 'Lectura' : 'Reading time'}: ${readingMinutes} min`
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  if (post.body) {
    lines.push(post.body.trim());
    lines.push('');
  }

  if (heroImage) {
    lines.push(`## ${L('hero')}`);
    lines.push('');
    lines.push(imageLine(title, heroImage));
    lines.push('');
  }

  if (series) {
    lines.push(`## ${lang === 'es' ? 'Serie' : 'Series'}`);
    lines.push('');
    lines.push(
      entityLine(
        series.title,
        mdHref(lang, `blog/series/${series.slug}`),
        `${lang === 'es' ? 'Capítulo' : 'Chapter'} ${series.order} / ${series.total}`
      )
    );
    lines.push('');
  }

  if (author) {
    lines.push(`## ${lang === 'es' ? 'Autor' : 'Author'}`);
    lines.push('');
    lines.push(
      entityLine(author.name, mdHref(lang, 'contributors'), author.role)
    );
    if (author.bio) {
      lines.push('');
      lines.push(author.bio);
    }
    lines.push('');
  }

  if (related && related.length > 0) {
    lines.push(
      `## ${lang === 'es' ? 'Artículos relacionados' : 'Related articles'}`
    );
    lines.push('');
    for (const post of related) {
      lines.push(
        entityLine(
          post.title,
          mdHref(lang, `blog/${post.slug}`),
          post.description,
          post.date
        )
      );
    }
    lines.push('');
  }

  lines.push(generateSiteNavigation(lang));

  return `${lines.join('\n')}\n`;
}

/**
 * Serialize a blog index listing to agent-friendly Markdown.
 * Returns a list of posts with links to their .md versions.
 */
export function serializeBlogIndexToMarkdown(
  entries: BlogIndexEntry[],
  options: BlogIndexOptions
): string {
  const { lang, title, description } = options;
  const prefix = buildUrlPrefix(lang);
  const canonicalUrl = `${SITE_URL}${prefix}/blog`;

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonicalUrl}`);
  lines.push(`Total posts: ${entries.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  /*
   * The HTML renders a tag filter above the list, and the twin used to drop
   * it — which read as "this blog has no taxonomy" to anything consuming the
   * Markdown. Ordered by frequency, the way the filter itself is.
   */
  const tagCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  if (tagCounts.size > 0) {
    lines.push(lang === 'es' ? '## Temas' : '## Topics');
    lines.push('');
    const sorted = [...tagCounts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );
    for (const [tag, count] of sorted) {
      lines.push(`- [#${tag}](${prefix}/blog/tag/${tag}) — ${count}`);
    }
    lines.push('');
  }

  lines.push(
    lang === 'es'
      ? `## Todos los artículos (${entries.length} disponibles)`
      : `## All articles (${entries.length} available)`
  );
  lines.push('');

  for (const entry of entries) {
    const postMdUrl = `${prefix}/blog/${entry.slug}.md`;
    const date = formatDate(entry.pubDate);
    const tags = (entry.tags ?? []).map((tag) => `#${tag}`).join(' ');
    lines.push(
      `- [${entry.title}](${postMdUrl}) — ${entry.description} (${date})${tags ? ` ${tags}` : ''}`
    );
  }
  lines.push('');

  lines.push(generateSiteNavigation(lang));

  return `${lines.join('\n')}\n`;
}

interface SeriesIndexEntry {
  title: string;
  slug: string;
  description: string;
  seriesOrder: number;
}

interface SeriesIndexOptions {
  slug: string;
  seriesTitle: string;
  seriesDescription: string;
  lang: string;
}

/**
 * Serialize a series index listing to agent-friendly Markdown.
 * Returns an ordered list of chapters with links to their .md versions.
 */
export function serializeSeriesIndexToMarkdown(
  entries: SeriesIndexEntry[],
  options: SeriesIndexOptions
): string {
  const { slug, seriesTitle, seriesDescription, lang } = options;
  const prefix = buildUrlPrefix(lang);
  const canonicalUrl = `${SITE_URL}${prefix}/blog/series/${slug}`;

  const lines: string[] = [];

  lines.push(`# ${seriesTitle}`);
  lines.push('');
  if (seriesDescription) {
    lines.push(`> ${seriesDescription}`);
    lines.push('');
  }
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonicalUrl}`);
  lines.push(`Total chapters: ${entries.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Chapters');
  lines.push('');

  const sorted = [...entries].sort((a, b) => a.seriesOrder - b.seriesOrder);
  for (const entry of sorted) {
    const postMdUrl = `${prefix}/blog/${entry.slug}.md`;
    lines.push(
      `${entry.seriesOrder}. [${entry.title}](${postMdUrl}) — ${entry.description}`
    );
  }

  lines.push(generateSiteNavigation(lang));

  return `${lines.join('\n')}\n`;
}

interface SeriesListingEntry {
  slug: string;
  title: string;
  description: string;
  postCount: number;
  order: number;
}

interface SeriesListingOptions {
  lang: string;
  title: string;
  description: string;
}

/**
 * Serialize the series landing page (list of all series) to agent-friendly
 * Markdown. Returns an ordered list with links to each series' own .md index.
 */
export function serializeSeriesListingToMarkdown(
  entries: SeriesListingEntry[],
  options: SeriesListingOptions
): string {
  const { lang, title, description } = options;
  const prefix = buildUrlPrefix(lang);
  const canonicalUrl = `${SITE_URL}${prefix}/blog/series`;

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonicalUrl}`);
  lines.push(
    `${lang === 'es' ? 'Total de series' : 'Total series'}: ${entries.length}`
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  // The listing page's own prose. Without it the .md was a bare link list
  // against a page that explains what a series is — 0.29 coverage.
  lines.push(description);
  lines.push('');
  lines.push(`## ${lang === 'es' ? 'Series' : 'Series'}`);
  lines.push('');

  const sorted = [...entries].sort((a, b) => a.order - b.order);
  for (const entry of sorted) {
    const seriesMdUrl = `${prefix}/blog/series/${entry.slug}.md`;
    const chapterCount = `${entry.postCount} ${entry.postCount === 1 ? 'chapter' : 'chapters'}`;
    lines.push(
      `- [${entry.title}](${seriesMdUrl}) — ${entry.description} (${chapterCount})`
    );
  }

  lines.push(generateSiteNavigation(lang));

  return `${lines.join('\n')}\n`;
}

/**
 * Generic serializer used by every Corag v3 collection markdown endpoint
 * (meetups, speakers, talks, sponsors, contributors, verticals, PTDs).
 *
 * Produces a stable shape:
 *   # title
 *   > description
 *   Language: ...
 *   Canonical: ...
 *   <metadata key: value>
 *   ---
 *   <body>
 *   <sections>
 *   <site navigation>
 */
export interface GenericMarkdownSection {
  heading: string;
  lines: string[];
}

export interface GenericMarkdownOptions {
  title: string;
  description?: string;
  lang: string;
  canonical: string;
  metadata?: Array<[string, string]>;
  body?: string;
  sections?: GenericMarkdownSection[];
}

export function serializeGenericToMarkdown(
  options: GenericMarkdownOptions
): string {
  const { title, description, lang, canonical, metadata, body, sections } =
    options;
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  if (description) {
    lines.push(`> ${description}`);
    lines.push('');
  }
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonical}`);
  if (metadata) {
    for (const [key, value] of metadata) {
      if (value) lines.push(`${key}: ${value}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  if (body) {
    lines.push(body.trim());
    lines.push('');
  }

  if (sections) {
    for (const section of sections) {
      if (section.lines.length === 0) continue;
      lines.push(`## ${section.heading}`);
      lines.push('');
      for (const line of section.lines) {
        lines.push(line);
      }
      lines.push('');
    }
  }

  lines.push(generateSiteNavigation(lang));
  return `${lines.join('\n')}\n`;
}

/**
 * The `AppInvite` block, in Markdown.
 *
 * Pages that render that block must say the same thing in their twin, or the
 * completeness gate reads the extra HTML as content the `.md` lost. It is also
 * the honest thing to serve an agent: this site explains the model, and the
 * only place any of it can be acted on is the application.
 */
export function appInviteSection(lang: string): {
  heading: string;
  lines: string[];
} {
  const language: Language = isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  const t = getTranslations(language);
  const copy = t.appCta.invite;
  return {
    heading: copy.title,
    lines: [
      copy.body,
      '',
      linkLine(copy.primary, appUrl(APP_PATHS.contribute)),
      linkLine(copy.secondary, appUrl(APP_PATHS.home)),
      linkLine(copy.tertiary, appUrl(APP_PATHS.evidence)),
    ],
  };
}

/**
 * Entity-reference helpers.
 *
 * The completeness contract (docs/aeo/MARKDOWN_FOR_AGENTS.md) forbids bare
 * slugs: every reference to another entity must carry a human-readable label
 * and link to that entity's own `.md`. These helpers are the single place that
 * shape is built, so no endpoint can drift into printing a slug.
 */

/** `/en/speakers/sergio-florez.md` — the `.md` twin of an entity page. */
export function mdHref(lang: string, path: string): string {
  const prefix = buildUrlPrefix(lang);
  return `${prefix}/${path.replace(/^\/+/, '')}.md`;
}

/**
 * One list row: `- [Label](/en/speakers/x.md) — detail`.
 * `detail` segments that are empty are dropped, so a missing role never leaves
 * a dangling em dash.
 */
export function entityLine(
  label: string,
  href: string,
  ...detail: Array<string | null | undefined>
): string {
  const extras = detail.filter((d): d is string => Boolean(d?.trim()));
  const suffix = extras.length > 0 ? ` — ${extras.join(' · ')}` : '';
  return `- [${label}](${href})${suffix}`;
}

/** `![alt](src)`. Alt may be empty (decorative), but the image is never dropped. */
export function imageLine(alt: string, src: string): string {
  return `![${alt.trim()}](${src})`;
}

/** A labelled external/internal link row that is not an entity reference. */
export function linkLine(label: string, url: string): string {
  return `- [${label}](${url})`;
}

/**
 * Section headings and metadata keys, in the page's own language.
 *
 * The contract requires one language per page including metadata keys, so a
 * Spanish page reads `Fecha:` and an English one `Date:`. Keeping the map here
 * rather than in each endpoint is what stops the two from drifting.
 */
const AGENT_MD_LABELS = {
  en: {
    speakers: 'Speakers',
    talks: 'Talks',
    programs: 'Programs',
    sponsors: 'Sponsors',
    organizers: 'Organizers',
    schedule: 'Schedule',
    keynotes: 'Keynotes',
    lightningTalks: 'Lightning talks',
    gallery: 'Gallery',
    links: 'Links',
    relatedMeetups: 'Related meetups',
    relatedEvents: 'Related events',
    talkHistory: 'Talk history',
    socialLinks: 'Social links',
    photo: 'Photo',
    hero: 'Hero image',
    venue: 'Venue',
    faqs: 'FAQs',
    pricing: 'Registration',
    editions: 'Editions',
    channels: 'Channels',
    contact: 'Contact',
    date: 'Date',
    dates: 'Dates',
    mode: 'Mode',
    status: 'Status',
    role: 'Role',
    tier: 'Tier',
    year: 'Year',
    website: 'Website',
    recording: 'Recording',
    photos: 'Photos',
    slides: 'Slides',
    duration: 'Duration',
    type: 'Type',
    total: 'Total',
    upcoming: 'Upcoming',
    past: 'Past',
    abstract: 'Abstract',
    mission: 'Mission',
    leaders: 'Leaders',
    stats: 'Community stats',
    latestPosts: 'Latest posts',
    nextEvent: 'Next event',
  },
  es: {
    speakers: 'Ponentes',
    talks: 'Charlas',
    programs: 'Programas',
    sponsors: 'Patrocinadores',
    organizers: 'Organizadores',
    schedule: 'Agenda',
    keynotes: 'Keynotes',
    lightningTalks: 'Lightning talks',
    gallery: 'Galería',
    links: 'Enlaces',
    relatedMeetups: 'Meetups relacionados',
    relatedEvents: 'Eventos relacionados',
    talkHistory: 'Historial de charlas',
    socialLinks: 'Redes sociales',
    photo: 'Foto',
    hero: 'Imagen destacada',
    venue: 'Lugar',
    faqs: 'Preguntas frecuentes',
    pricing: 'Inscripción',
    editions: 'Ediciones',
    channels: 'Canales',
    contact: 'Contacto',
    date: 'Fecha',
    dates: 'Fechas',
    mode: 'Modalidad',
    status: 'Estado',
    role: 'Rol',
    tier: 'Nivel',
    year: 'Año',
    website: 'Sitio web',
    recording: 'Grabación',
    photos: 'Fotos',
    slides: 'Slides',
    duration: 'Duración',
    type: 'Tipo',
    total: 'Total',
    upcoming: 'Próximos',
    past: 'Pasados',
    abstract: 'Resumen',
    mission: 'Misión',
    leaders: 'Líderes',
    stats: 'Estadísticas de la comunidad',
    latestPosts: 'Últimas publicaciones',
    nextEvent: 'Próximo evento',
  },
} as const;

export type AgentMdLabelKey = keyof (typeof AGENT_MD_LABELS)['en'];

/** Section heading / metadata key in the page's own language. */
export function mdLabel(lang: string, key: AgentMdLabelKey): string {
  const table =
    AGENT_MD_LABELS[lang as 'en' | 'es'] ?? AGENT_MD_LABELS[DEFAULT_LANGUAGE];
  return table[key];
}

/**
 * Meetup detail — `/meetups/{slug}.md`.
 *
 * Pure: takes the resolved data from `resolveMeetupDetail` and returns the
 * string. Everything the HTML page renders appears here, with every entity
 * reference carrying a name and a link to its own `.md`.
 */
export function resolveI18n(
  value: string | { en?: string; es?: string } | undefined | null,
  lang: string
): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return value[lang as 'en' | 'es'] ?? value.en ?? value.es ?? '';
}

/**
 * Serialize a non-blog page to agent-friendly Markdown.
 * Returns clean Markdown with metadata header + page body.
 */
export function serializePageToAgentMarkdown(
  page: CollectionEntry<'pages'>,
  options: PageSerializeOptions
): string {
  const { slug, lang } = options;
  const { title, description } = page.data;
  const prefix = buildUrlPrefix(lang);
  const pagePath = slug === 'index' ? '' : `/${slug}`;
  const canonicalUrl = `${SITE_URL}${prefix}${pagePath}`;

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');
  lines.push(`Language: ${lang}`);
  lines.push(`Canonical: ${canonicalUrl}`);

  if ('lastUpdated' in page.data && page.data.lastUpdated instanceof Date) {
    lines.push(`Last Updated: ${formatDate(page.data.lastUpdated)}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  if (page.body) {
    lines.push(page.body.trim());
  }

  lines.push(generateSiteNavigation(lang));

  return `${lines.join('\n')}\n`;
}

/**
 * Serialize an institutional page from the same copy object the HTML renders.
 *
 * Both surfaces read one source, so the twin cannot fall behind the page —
 * which is exactly how the previous site ended up with `.md` files that were
 * summaries of pages rather than twins of them.
 */
/**
 * A figure in the Markdown twin: the image plus its caption, so an agent
 * reading the twin learns the same thing a person reading the page does.
 */
function figureToMarkdown(figure: InstitutionalFigure): string {
  const src = `${figure.srcBase}-${Math.max(...figure.widths)}.webp`;
  const image = `![${figure.alt}](${src})`;
  return figure.caption ? `${image}\n\n_${figure.caption}_` : image;
}

export function serializeInstitutionalPageToMarkdown(
  copy: InstitutionalPageCopy,
  options: { lang: string; canonical: string }
): string {
  const sections: GenericMarkdownSection[] = copy.sections.map((section) => {
    const lines: string[] = [];
    if (section.intro) {
      lines.push(section.intro, '');
    }
    /*
     * Exhaustive by construction: the `never` check below turns "a new block
     * kind was added to the union but not serialized" into a type error. It
     * used to be an `else` catch-all, which would have silently serialized any
     * new kind as a callout and quietly desynced the twin from the page.
     */
    for (const block of section.blocks) {
      switch (block.kind) {
        case 'prose':
          for (const paragraph of block.paragraphs) lines.push(paragraph, '');
          break;
        case 'steps':
          block.steps.forEach((step, index) => {
            lines.push(`${index + 1}. **${step.title}** — ${step.body}`);
            if (step.figure) lines.push(`   ${figureToMarkdown(step.figure)}`);
          });
          lines.push('');
          break;
        case 'cards':
          for (const card of block.cards) {
            lines.push(`- **${card.title}** — ${card.body}`);
          }
          lines.push('');
          break;
        case 'list':
          for (const item of block.items) lines.push(`- ${item}`);
          lines.push('');
          break;
        case 'callout':
          lines.push(`> **${block.title}** — ${block.body}`, '');
          break;
        case 'figure':
          lines.push(figureToMarkdown(block.figure), '');
          break;
        case 'split':
          for (const paragraph of block.paragraphs) lines.push(paragraph, '');
          lines.push(figureToMarkdown(block.figure), '');
          break;
        case 'statPair':
          for (const item of block.items) {
            lines.push(`- **${item.label}** — ${item.body}`);
          }
          lines.push('');
          break;
        default: {
          const exhaustive: never = block;
          throw new Error(
            `Unserialized institutional block kind: ${JSON.stringify(exhaustive)}`
          );
        }
      }
    }
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    return { heading: section.heading, lines };
  });

  const ctaLines = [copy.cta.body, ''];
  for (const link of [copy.cta.primary, copy.cta.secondary]) {
    if (link) ctaLines.push(`- [${link.label}](${link.href})`);
  }
  sections.push({ heading: copy.cta.title, lines: ctaLines });
  sections.push(appInviteSection(options.lang));

  /*
   * The hero figure belongs in the twin too: when it is an app screenshot it
   * carries the live-data declaration, and an agent reading the twin has to
   * learn that as surely as a person reading the page does.
   */
  const body = copy.heroFigure
    ? `${copy.lead}\n\n${figureToMarkdown(copy.heroFigure)}`
    : copy.lead;

  return serializeGenericToMarkdown({
    title: copy.title,
    description: copy.description,
    lang: options.lang,
    canonical: options.canonical,
    body,
    sections,
  });
}
