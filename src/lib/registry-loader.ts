/**
 * The only door into `registry/`.
 *
 * Boundary rule B2: no site code reads that directory directly. Everything
 * goes through here, which is what lets the registry stay a CC0 tree another
 * organisation can lift whole — nothing in it knows this website exists.
 * `pnpm run spec:boundary` fails the build if anything else reaches in.
 *
 * ## What this deliberately cannot do
 *
 * It cannot return a measured conformance level, because measured state does
 * not live in git — it lives in KV, written by the revalidation cron and read
 * through `src/lib/registry-status.ts`.
 * A loader that could return a level from a JSON file would be a loader that
 * lets someone hand-write one, and hand-written conformance is the single
 * thing this protocol exists to prevent. `status` here is a *review* state
 * (`proposed` / `reviewed`), never a measurement.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REGISTRY = join(process.cwd(), 'registry');

/** Review state of an entry in the git tree. Never a conformance level. */
export type ReviewStatus = 'proposed' | 'reviewed';

export interface PublisherEntry {
  publisher_id: string;
  canonical_url: string;
  entity_domains: string[];
  events?: string[];
  status: ReviewStatus;
  added: string;
  /**
   * Free-text context, in both languages.
   *
   * Bilingual because the registry pages are: a note that existed only in
   * English would leave a Spanish reader with a blank where the caveat about
   * an unconfirmed entry should be — which is the one field on the page that
   * most needs to reach them.
   */
  notes?: { en: string; es: string };
  /** Present only once a team has confirmed their own entry. */
  confirmed?: string;
}

/**
 * Every publisher entry, sorted by id.
 *
 * Sorted rather than readdir-ordered: the order a page renders in should not
 * depend on the filesystem, and an unstable order makes a diff of the built
 * HTML unreadable. (The registry gate learned this the hard way when a
 * collision finding blamed whichever file readdir happened to reach first.)
 */
export function allPublishers(): PublisherEntry[] {
  const dir = join(REGISTRY, 'publishers');
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map(
      (file) =>
        JSON.parse(readFileSync(join(dir, file), 'utf-8')) as PublisherEntry
    );
}

/** Entries a given surface should show, in a stable order. */
export function publishersForDisplay(limit?: number): PublisherEntry[] {
  const all = allPublishers();
  return typeof limit === 'number' ? all.slice(0, limit) : all;
}

/**
 * The host, for display.
 *
 * The registry stores a canonical URL; a landing page teaser wants the domain.
 * Rendering the bare host also keeps the page honest about what the entry
 * actually is — a pointer at somebody else's site, not a profile we maintain.
 */
export function displayHost(entry: PublisherEntry): string {
  try {
    return new URL(entry.canonical_url).host;
  } catch {
    return entry.canonical_url;
  }
}

export function publisherCount(): number {
  return allPublishers().length;
}

// ── Official sources ──────────────────────────────────────

/**
 * An institution a link-out converges to. **Not a publisher.**
 *
 * The distinction is load-bearing and the registry page keeps them in separate
 * sections because of it: a publisher is an application that serves a feed and
 * can be measured; an official source is where person-level questions go
 * (spec §7.1), and it is listed so the network has somewhere to point rather
 * than because it has adopted anything. Rendering the two in one table would
 * imply the Red Cross had joined a protocol nobody has asked them about.
 */
export interface OfficialSource {
  id: string;
  name: { en: string; es: string };
  authority: string;
  /**
   * BCP-47 tag for the language `authority` is written in.
   *
   * Required, not defaulted: the name is rendered inside pages in both of the
   * site's languages and is translated into neither, so whichever page shows it
   * has to mark it — and there is no language that is the right guess for a
   * registry designed to hold sources from any country.
   */
  authority_lang: string;
  canonical_url: string;
  domain: string;
  notes?: { en: string; es: string };
}

export function officialSources(): OfficialSource[] {
  const dir = join(REGISTRY, 'official-sources');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map(
      (file) =>
        JSON.parse(readFileSync(join(dir, file), 'utf-8')) as OfficialSource
    );
}

// ── Measured status ───────────────────────────────────────

/**
 * What the validator last found, for one publisher.
 *
 * This never comes from git. It is written to KV by the revalidation cron and
 * read at request time, because a measured state in a file is a measured state
 * somebody can edit — and the one thing this protocol cannot allow is a
 * publisher declaring their own conformance.
 */
export type BadgeState =
  /** Measured, and passing at the recorded level. */
  | 'conforming'
  /** Measured and passing, but the feed has not been updated in a while. */
  | 'stale'
  /** The last run could not fetch it, twice, an hour apart. */
  | 'unreachable'
  /** Measured, and errors were found. */
  | 'failing'
  /** The entry exists; nothing has been measured yet. */
  | 'unmeasured'
  /** Withdrawn. The id is never reassigned. */
  | 'archived';

export interface MeasuredStatus {
  publisher_id: string;
  state: BadgeState;
  /** The level actually measured. Null when nothing was. */
  level: string | null;
  /** ISO timestamp of the run that produced this. */
  checked_at: string;
  /** Spec version the run measured against. Absent on older records. */
  version?: string;
  /** Ids of failing checks, for the publisher page to link. */
  failing_checks?: string[];
  /** Age of the feed's own `last_updated`, in hours, when known. */
  feed_age_hours?: number;
  /** Consecutive failed runs, for the two-strikes rule. */
  consecutive_failures?: number;
}

/**
 * The status a page should show for an entry.
 *
 * Falls back to `unmeasured` rather than to anything that could read as a
 * pass. A registry that showed a hopeful default while KV was unavailable
 * would be a registry that lies during exactly the incident when people are
 * relying on it.
 */
export function resolveStatus(
  entry: PublisherEntry,
  measured?: MeasuredStatus | null
): MeasuredStatus {
  if (measured) return measured;
  return {
    publisher_id: entry.publisher_id,
    state: 'unmeasured',
    level: null,
    checked_at: '',
  };
}

// ── History ───────────────────────────────────────────────

export interface HistoryPoint {
  /** ISO date. */
  date: string;
  state: BadgeState;
  level: string | null;
}

/**
 * A publisher's measurement history, one JSONL file per publisher.
 *
 * Appended by a daily bot pull request rather than written continuously: the
 * history is a public record, and a public record that changes without a diff
 * is not one. A missing file means no history yet, which is the normal state
 * for a new entry and not an error.
 */
export function publisherHistory(publisherId: string): HistoryPoint[] {
  const file = join(REGISTRY, 'history', `${publisherId}.jsonl`);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf-8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as HistoryPoint)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function publisherById(id: string): PublisherEntry | undefined {
  return allPublishers().find((entry) => entry.publisher_id === id);
}
