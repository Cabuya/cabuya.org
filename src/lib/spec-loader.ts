/**
 * The only door into `spec/`.
 *
 * Boundary rule B2, and the reason it exists: `spec/` is CC0 and designed to be
 * lifted whole by another organisation. Nothing in it may know this website
 * exists — no imports, no build files, no framework-specific frontmatter. So
 * the site reads it the way any other consumer would, through one adapter, and
 * `pnpm run spec:boundary` fails if anything else reaches in.
 *
 * ## What "rendered from the source" buys
 *
 * The HTML of a specification section is produced from the same Markdown file
 * that CI validates and that the skill vendors. There is no second copy to keep
 * in step, which means the site cannot publish a normative sentence the
 * repository does not contain. That is the whole design: drift is not
 * prevented by discipline, it is impossible.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SPEC = join(process.cwd(), 'spec');

export type SpecStatus = 'draft' | 'rc' | 'normative' | 'superseded';

export interface SpecSection {
  /** Spec version, e.g. `0.1`. */
  version: string;
  /** File slug without the extension, e.g. `1-architecture`. */
  slug: string;
  /** The §-number as written in the document. Appendices carry `a`, `b`, … */
  number: string;
  title: string;
  status: SpecStatus;
  order: number;
  /** The Markdown body, frontmatter removed. Byte-exact otherwise. */
  body: string;
  /** The whole file including frontmatter — what the `.md` twin serves. */
  raw: string;
}

export interface SpecVersion {
  version: string;
  status: SpecStatus;
  sections: SpecSection[];
}

// ── Frontmatter ───────────────────────────────────────────

/**
 * A deliberately small YAML reader.
 *
 * The spec's frontmatter is five scalar keys and nothing else, by design — it
 * has to stay readable to any consumer, including one that does not have a
 * YAML parser. Pulling in a parser here would also mean the site could accept
 * frontmatter the spec's own gate does not, which is the wrong direction for a
 * boundary to be permissive in.
 */
function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith('---\n')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of raw.slice(4, end).split('\n')) {
    const match = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!match) continue;
    data[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: raw.slice(end + 4).replace(/^\n/, '') };
}

function isStatus(value: string | undefined): value is SpecStatus {
  return (
    value === 'draft' ||
    value === 'rc' ||
    value === 'normative' ||
    value === 'superseded'
  );
}

// ── Versions and sections ─────────────────────────────────

/** Every version directory, newest first. */
export function specVersions(): string[] {
  return readdirSync(join(SPEC, 'versions'))
    .filter((entry) => /^\d+\.\d+$/.test(entry))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}

/**
 * The §-number a section carries, derived from its filename.
 *
 * `3-the-feed.md` → `3`; `appendix-a-design-decisions.md` → `a`. The number is
 * what anchors and validator messages are built from, so it comes from the
 * filename rather than from frontmatter: a file cannot be renamed without the
 * anchor changing, which is the coupling we want.
 */
export function sectionNumber(slug: string): string {
  const appendix = slug.match(/^appendix-([a-z])-/);
  if (appendix) return appendix[1];
  return slug.match(/^(\d+)-/)?.[1] ?? slug;
}

export function specSections(version: string): SpecSection[] {
  const dir = join(SPEC, 'versions', version);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, '');
      return {
        version,
        slug,
        number: sectionNumber(slug),
        title: data.title ?? slug,
        status: isStatus(data.status) ? data.status : 'draft',
        // Appendices sort after numbered sections regardless of their `order`.
        order: slug.startsWith('appendix')
          ? 1000 + (Number(data.order) || 0)
          : Number(data.order) || 0,
        body,
        raw,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function specSection(
  version: string,
  slug: string
): SpecSection | undefined {
  return specSections(version).find((section) => section.slug === slug);
}

export function specVersionSummary(version: string): SpecVersion {
  const sections = specSections(version);
  return {
    version,
    // The version's status is the status its sections carry. They are written
    // together and released together; a version with mixed statuses is a bug.
    status: sections[0]?.status ?? 'draft',
    sections,
  };
}

/** Previous and next section within a version, for the page footer. */
export function sectionNeighbours(
  version: string,
  slug: string
): { previous: SpecSection | null; next: SpecSection | null } {
  const sections = specSections(version);
  const index = sections.findIndex((section) => section.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? sections[index - 1] : null,
    next: index < sections.length - 1 ? sections[index + 1] : null,
  };
}

// ── Schemas ───────────────────────────────────────────────

export interface SpecSchema {
  version: string;
  /** Filename without `.schema.json`, e.g. `place-feed`. */
  name: string;
  /** The absolute versioned `$id` the schema declares. */
  id: string;
  title?: string;
  description?: string;
  schema: Record<string, unknown>;
  raw: string;
}

export function specSchemas(version: string): SpecSchema[] {
  const dir = join(SPEC, 'schemas', version);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith('.schema.json'))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf-8');
      const schema = JSON.parse(raw) as Record<string, unknown>;
      return {
        version,
        name: file.replace(/\.schema\.json$/, ''),
        id: String(schema.$id ?? ''),
        title: schema.title as string | undefined,
        description: schema.description as string | undefined,
        schema,
        raw,
      };
    });
}

export function specSchema(
  version: string,
  name: string
): SpecSchema | undefined {
  return specSchemas(version).find((entry) => entry.name === name);
}

// ── Examples ──────────────────────────────────────────────

export interface SpecExample {
  version: string;
  /** `valid` or `invalid`, derived from the directory it lives in. */
  kind: 'valid' | 'invalid';
  name: string;
  /**
   * The `$comment` the example carries.
   *
   * The invalid examples state, in their own file, what they are demonstrating
   * — and the validator's message snapshots are asserted against these exact
   * strings. Rendering the comment verbatim is what keeps the page, the file
   * and the validator's output saying the same thing.
   */
  comment?: string;
  raw: string;
}

export function specExamples(version: string): SpecExample[] {
  const base = join(SPEC, 'examples', version);
  if (!existsSync(base)) return [];

  const out: SpecExample[] = [];
  for (const kind of ['valid', 'invalid'] as const) {
    const dir = join(base, kind);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()) {
      const raw = readFileSync(join(dir, file), 'utf-8');
      let comment: string | undefined;
      try {
        comment = (JSON.parse(raw) as { $comment?: string }).$comment;
      } catch {
        // A malformed example is the spec gate's problem, not the reader's:
        // it still renders, without a teaching note.
      }
      out.push({
        version,
        kind,
        name: file.replace(/\.json$/, ''),
        comment,
        raw,
      });
    }
  }
  return out;
}

/**
 * A one-line summary of a section, taken from its own opening prose.
 *
 * Search engines and the SEO gate want a 130–160 character description, and a
 * hand-written one per section is 10 strings to keep in step with a document
 * that is still changing. The section's first real sentence is both accurate
 * and free — and if the prose is rewritten, so is the description.
 *
 * Markdown is stripped rather than rendered: emphasis markers and links in a
 * meta description are noise, and a bare `[text](url)` shows up in search
 * results as exactly that.
 */
export function sectionSummary(section: SpecSection, maxLength = 155): string {
  const blocks = section.body
    // Drop the h1, tables, code fences, blockquotes and list markers — none of
    // them read as a sentence out of context.
    .replace(/^#.*$/gm, '')
    .replace(/^\|.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^>.*$/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Asterisks and backticks only. Underscores are part of field names here
    // (`last_updated`), and stripping them produced `lastupdated` in a meta
    // description — a word that appears nowhere in the protocol.
    .replace(/[*`]/g, '')
    // Leading § numbers read as noise out of context.
    .replace(/^§[\d.]+\s*/, '')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter((block) => block.length > 30);

  /*
   * Take paragraphs until there is enough to be useful. One short opening
   * paragraph is common in this document — §6 starts with a single sentence —
   * and a 90-character meta description is a wasted one.
   */
  let prose = '';
  for (const block of blocks) {
    prose = prose ? `${prose} ${block}` : block;
    if (prose.length >= 130) break;
  }

  if (!prose) return `§${section.number} — ${section.title}.`;

  /*
   * Short sections get their title prepended rather than padding: the gate's
   * 130-character floor exists because a two-line description is useless in a
   * search result, and the section's own title is the most useful thing to add.
   */
  const full =
    prose.length < 130
      ? `§${section.number} — ${section.title}. ${prose}`
      : prose;
  if (full.length <= maxLength) return full;
  const prose2 = full;

  // Cut at a sentence boundary when there is one in range, else at a word.
  const window = prose2.slice(0, maxLength);
  const sentence = window.lastIndexOf('. ');
  if (sentence > 90) return window.slice(0, sentence + 1);
  return `${window.slice(0, window.lastIndexOf(' '))}…`;
}
