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
 * not live in git — it lives in KV, written by the validator cron (Task 28).
 * A loader that could return a level from a JSON file would be a loader that
 * lets someone hand-write one, and hand-written conformance is the single
 * thing this protocol exists to prevent. `status` here is a *review* state
 * (`proposed` / `reviewed`), never a measurement.
 */
import { readdirSync, readFileSync } from 'node:fs';
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
  notes?: string;
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
