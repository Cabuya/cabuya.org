/**
 * Table-of-contents extraction.
 *
 * Astro's `render()` returns a heading list already, but pages assembled from
 * a loader (the spec sections, the schema reference) have no Markdown pipeline
 * behind them and build their own. Both paths end up here, so the TOC on a
 * generated page behaves exactly like the TOC on a prose page.
 */

export interface TocEntry {
  depth: number;
  slug: string;
  text: string;
}

/**
 * GitHub-style slug: lowercase, spaces to hyphens, punctuation dropped,
 * diacritics folded.
 *
 * The folding matters more here than it looks. Spanish headings carry accents,
 * and an anchor of `#configuración` works until it is pasted into a system that
 * percent-encodes it differently — so the slug is ASCII and the heading keeps
 * its accents.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Keep h2 and h3, and make every slug unique.
 *
 * Two sections called "Example" is normal in a specification, and duplicate ids
 * silently break every link to the second one.
 */
export function buildToc(
  headings: Array<{ depth: number; text: string; slug?: string }>
): TocEntry[] {
  const seen = new Map<string, number>();
  return headings
    .filter((heading) => heading.depth === 2 || heading.depth === 3)
    .map((heading) => {
      const base = heading.slug ?? slugify(heading.text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        depth: heading.depth,
        text: heading.text,
        slug: count === 0 ? base : `${base}-${count}`,
      };
    });
}
