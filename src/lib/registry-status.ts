/**
 * Reading measured status at build time.
 *
 * The registry pages are static. The states they show are not — they are
 * written to KV every six hours by the revalidation cron. Those two facts do
 * not fit together on their own, and the way they are made to fit is the whole
 * design of this module and of the small script that accompanies the pages:
 *
 *   1. **At build time** this reads KV through the Cloudflare REST API and
 *      bakes the states into the HTML, so the page is complete and correct with
 *      JavaScript disabled, in a scraper, and in a `.md` twin.
 *   2. **At view time** a ~1 KB script re-reads `/registry/status.json` and
 *      patches any state that has moved since the deploy.
 *
 * Both paths print the timestamp of the run they are showing. A conformance
 * state without the moment it was measured is a claim about the present made
 * from evidence about the past, which is exactly the kind of statement this
 * project exists to stop making.
 *
 * ## When there are no credentials
 *
 * Local development, a fork's CI, a contributor's laptop: no token, no KV, and
 * the build must still work. It falls back to an empty map, every entry renders
 * as `not yet measured`, and the page says so honestly rather than inventing a
 * plausible state. Falling back to *nothing measured* rather than to a cached
 * optimistic value is deliberate — the failure mode of a registry must never be
 * a pass.
 */
import type { MeasuredStatus } from './registry-loader';

/**
 * The three environment variables that unlock the build-time read.
 *
 * A read-only token, scoped to one namespace. It is not a secret in the sense
 * that leaking it would expose anything private — everything in the namespace
 * is published on the site — but it is scoped narrowly anyway, because a token
 * that can only do the one thing it is for cannot be repurposed.
 */
interface KvCredentials {
  accountId: string;
  namespaceId: string;
  token: string;
}

function credentials(): KvCredentials | null {
  const accountId = process.env.CF_ACCOUNT_ID;
  const namespaceId = process.env.CF_REGISTRY_KV_ID;
  const token = process.env.CF_KV_READ_TOKEN;
  if (!accountId || !namespaceId || !token) return null;
  return { accountId, namespaceId, token };
}

/** Whether this build had a KV read path at all — printed on the page. */
export function statusSourceIsLive(): boolean {
  return credentials() !== null;
}

const isState = (value: unknown): value is MeasuredStatus['state'] =>
  value === 'conforming' ||
  value === 'stale' ||
  value === 'unreachable' ||
  value === 'failing' ||
  value === 'unmeasured' ||
  value === 'archived';

/**
 * Fetch every publisher's measured status.
 *
 * One request per publisher rather than a bulk read: the KV REST API has no
 * bulk *get*, and the registry is measured in dozens of entries, not thousands.
 * When it stops being, this becomes a single value holding the whole map — the
 * shape the pages consume is already a map, so that change would not reach
 * them.
 *
 * A failed read is a missing entry, never a thrown build. A network blip during
 * a deploy should cost one publisher its measured state on the page, and get
 * patched back within the minute by the client-side refresh — it should not
 * take the site down.
 */
export async function fetchMeasuredStatuses(
  publisherIds: string[]
): Promise<Map<string, MeasuredStatus>> {
  const creds = credentials();
  const out = new Map<string, MeasuredStatus>();
  if (!creds) return out;

  const base = `https://api.cloudflare.com/client/v4/accounts/${creds.accountId}/storage/kv/namespaces/${creds.namespaceId}/values`;

  await Promise.all(
    publisherIds.map(async (id) => {
      try {
        const response = await fetch(`${base}/status:${id}`, {
          headers: { Authorization: `Bearer ${creds.token}` },
        });
        if (!response.ok) return;
        const parsed = JSON.parse(await response.text()) as MeasuredStatus;
        if (isState(parsed.state)) out.set(id, parsed);
      } catch {
        // Treated as unmeasured. See the note above on why this does not throw.
      }
    })
  );

  return out;
}

/**
 * How old a measurement is, in the reader's language.
 *
 * Rendered as a coarse age rather than a precise duration because precision
 * here would be false: the cron runs every six hours, so "3 hours ago" and "5
 * hours ago" describe the same run. Anything under a day says "today", and the
 * exact ISO timestamp is always available in the `<time datetime>` attribute
 * for anyone who needs it.
 */
export function measurementAge(
  checkedAt: string,
  now: Date,
  lang: 'en' | 'es'
): string {
  if (!checkedAt) return lang === 'es' ? 'nunca' : 'never';
  const then = new Date(checkedAt);
  if (Number.isNaN(then.getTime())) {
    return lang === 'es' ? 'desconocido' : 'unknown';
  }

  const hours = Math.floor((now.getTime() - then.getTime()) / 3_600_000);
  if (hours < 24) return lang === 'es' ? 'hoy' : 'today';

  const days = Math.floor(hours / 24);
  if (days === 1) return lang === 'es' ? 'hace 1 día' : '1 day ago';
  if (days < 30) {
    return lang === 'es' ? `hace ${days} días` : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months === 1) return lang === 'es' ? 'hace 1 mes' : '1 month ago';
  return lang === 'es' ? `hace ${months} meses` : `${months} months ago`;
}

/**
 * When a passing measurement becomes `stale`.
 *
 * Seven days: long enough that a directory which genuinely has no new places
 * this week is not scolded for it, short enough that a feed whose pipeline
 * silently broke shows it before anyone relies on the stale data. The threshold
 * lives here rather than in the cron so the page and the badge agree on the
 * word without agreeing by coincidence.
 */
export const STALE_AFTER_HOURS = 24 * 7;
