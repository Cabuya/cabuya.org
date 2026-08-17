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

/**
 * Where a language's sections live.
 *
 * English is the normative text and sits at the version root. A translation
 * lives one level down, in a directory named for its language — informative,
 * versioned alongside the text it translates, and inside the bounded CC0
 * directory so an extracted copy carries it.
 *
 * `readdirSync(...).filter(endsWith('.md'))` at the root skips the directory
 * itself, so adding a translation cannot change what the English build reads.
 */
export function sectionsDir(version: string, lang = 'en'): string {
  const root = join(SPEC, 'versions', version);
  return lang === 'en' ? root : join(root, lang);
}

/** True when a translation of this version exists and is complete enough to serve. */
export function hasTranslation(version: string, lang: string): boolean {
  if (lang === 'en') return true;
  const translated = sectionsDir(version, lang);
  if (!existsSync(translated)) return false;
  const count = (dir: string) =>
    readdirSync(dir).filter((file) => file.endsWith('.md')).length;
  return count(translated) === count(sectionsDir(version));
}

export function specSections(version: string, lang = 'en'): SpecSection[] {
  const dir = hasTranslation(version, lang)
    ? sectionsDir(version, lang)
    : sectionsDir(version);
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

/**
 * A section's body with its own title line removed, for rendering inside a page.
 *
 * Each specification file opens with `# §3 — The feed`, which is correct for a
 * standalone Markdown document and wrong inside a page that already renders an
 * `<h1>`: assistive technology announces two document titles and the outline
 * says the page contains two documents. axe does not flag it; a heading-level
 * walk does.
 *
 * Only the rendered HTML is affected. The `.md` twin serves `body`, unchanged
 * and byte-exact, because the twin *is* the source file and a reader fetching
 * it should get the document rather than the document minus a line.
 */
export function specSectionForRender(section: SpecSection): string {
  // The body opens with a blank line (frontmatter is stripped, its newline is
  // not), so the anchor has to allow it — an earlier version used `^#` without
  // accounting for that and silently changed nothing.
  return section.body.replace(/^\s*#\s+[^\n]*\n+/, '');
}

export function specSection(
  version: string,
  slug: string,
  lang = 'en'
): SpecSection | undefined {
  return specSections(version, lang).find((section) => section.slug === slug);
}

export function specVersionSummary(version: string, lang = 'en'): SpecVersion {
  // The index lists section titles, so it follows the reader like the
  // sections themselves do.
  const sections = specSections(version, lang);
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
  slug: string,
  lang = 'en'
): { previous: SpecSection | null; next: SpecSection | null } {
  // The neighbour cards print section titles, so they follow the reader's
  // language: «Anterior · §1 Architecture — the conformance ladder» was the
  // page telling a Spanish reader where to go next, in English.
  const sections = specSections(version, lang);
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

/**
 * Spanish for the schema field descriptions.
 *
 * The descriptions live inside the JSON Schemas, which are normative and
 * machine-read; JSON Schema has no localization convention and inventing one
 * inside a normative artifact would make every consumer parse our dialect. So
 * the translation sits beside the schemas instead, keyed by the field path the
 * reference page builds — a renamed field loses its translation loudly.
 *
 * Informative, like the section translations: where the two differ, the
 * English in the schema governs.
 */
export function schemaDescriptions(
  version: string,
  lang: string
): Record<string, Record<string, string>> {
  if (lang === 'en') return {};
  const file = join(SPEC, 'schemas', version, lang, 'descriptions.json');
  if (!existsSync(file)) return {};
  const parsed = JSON.parse(readFileSync(file, 'utf-8')) as Record<
    string,
    unknown
  >;
  const out: Record<string, Record<string, string>> = {};
  for (const [schemaName, fields] of Object.entries(parsed)) {
    if (schemaName.startsWith('$') || typeof fields !== 'object' || !fields) {
      continue;
    }
    out[schemaName] = fields as Record<string, string>;
  }
  return out;
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

  /*
   * Cut at a sentence boundary when one lands inside the band, else at a word.
   *
   * The boundary has to clear 130, not merely 90: this took the *last* period
   * within the window, and when a section opened with one short sentence
   * followed by a long one, that period was the first one — producing a
   * 112-character description on a page whose floor is 130. Three sections
   * failed the SEO gate that way, and the text was not the problem.
   */
  const window = prose2.slice(0, maxLength);
  const sentence = window.lastIndexOf('. ');
  if (sentence + 1 >= 130) return window.slice(0, sentence + 1);
  return `${window.slice(0, window.lastIndexOf(' '))}…`;
}

// ── Changelog ─────────────────────────────────────────────

export interface ChangelogRelease {
  /** `0.1.0-draft`, or `Unreleased`. */
  version: string;
  /** ISO date, or null for the unreleased section. */
  date: string | null;
  /** Keep-a-Changelog groups, in the order they appear. */
  groups: Array<{ kind: string; entries: string[] }>;
  /** Any prose in the release that is not inside a group — a status line. */
  notes: string[];
}

/**
 * The specification's changelog, parsed from `spec/CHANGELOG.md`.
 *
 * Keep a Changelog is a convention, not a format with a parser, so this reads
 * the three shapes it actually uses: `## [version] — date` headings, `### Kind`
 * groups, and `- entry` bullets. Anything it does not recognise is carried
 * through as a note rather than dropped, because the one thing this file
 * currently says that matters most — *nothing is normative yet* — is a bold
 * paragraph and not a bullet.
 *
 * Parsed rather than hand-copied onto a page for the usual reason: a changelog
 * transcribed into HTML is a changelog that stops matching the repository, and
 * the release notes are exactly where that would be least forgivable.
 */
export function specChangelog(): ChangelogRelease[] {
  const path = join(SPEC, 'CHANGELOG.md');
  if (!existsSync(path)) return [];

  const releases: ChangelogRelease[] = [];
  let current: ChangelogRelease | null = null;
  let group: { kind: string; entries: string[] } | null = null;

  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const release = line.match(/^##\s+\[([^\]]+)\](?:\s*[—-]\s*(\S+))?/);
    if (release) {
      if (current) releases.push(current);
      current = {
        version: release[1],
        date: release[2] ?? null,
        groups: [],
        notes: [],
      };
      group = null;
      continue;
    }

    if (!current) continue;

    const kind = line.match(/^###\s+(.+)$/);
    if (kind) {
      group = { kind: kind[1].trim(), entries: [] };
      current.groups.push(group);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet && group) {
      group.entries.push(bullet[1].trim());
      continue;
    }

    // A continuation line of the previous bullet, wrapped by the formatter.
    if (group && group.entries.length > 0 && /^\s{2,}\S/.test(line)) {
      group.entries[group.entries.length - 1] += ` ${line.trim()}`;
      continue;
    }

    const prose = line.trim();
    if (prose.length > 0 && !prose.startsWith('#')) current.notes.push(prose);
  }

  if (current) releases.push(current);
  return releases;
}

// ── RFCs ──────────────────────────────────────────────────

export type RfcStatus =
  | 'draft'
  | 'open'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'superseded';

export interface SpecRfc {
  /** Zero-padded as in the filename: `0001`. */
  id: string;
  number: number;
  slug: string;
  title: string;
  status: RfcStatus;
  /** `governance`, `normative`, `breaking`. */
  tier: string;
  opened: string;
  decided: string | null;
  body: string;
  raw: string;
}

function isRfcStatus(value: string | undefined): value is RfcStatus {
  return (
    value === 'draft' ||
    value === 'open' ||
    value === 'accepted' ||
    value === 'declined' ||
    value === 'withdrawn' ||
    value === 'superseded'
  );
}

/**
 * Every numbered RFC, lowest first.
 *
 * `0000-template.md` is excluded: it is the form, not a proposal, and listing
 * it as RFC-0 would put a document nobody wrote at the top of the index.
 */
export function specRfcs(): SpecRfc[] {
  const dir = join(SPEC, 'rfcs');
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => /^\d{4}-.+\.md$/.test(file) && !file.startsWith('0000-'))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);
      const id = file.slice(0, 4);
      return {
        id,
        number: Number(data.number ?? id),
        slug: file.replace(/\.md$/, ''),
        title: data.title ?? file,
        // An RFC with no declared status is a draft. Defaulting the other way
        // would let a missing field read as acceptance.
        status: isRfcStatus(data.status) ? data.status : 'draft',
        tier: data.tier ?? 'normative',
        opened: data.opened ?? '',
        decided: data.decided ?? null,
        body,
        raw,
      };
    });
}

export function specRfc(id: string): SpecRfc | undefined {
  return specRfcs().find(
    (rfc) => rfc.id === id || rfc.id === id.padStart(4, '0')
  );
}
