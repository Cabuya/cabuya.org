/**
 * The URL guard for `/api/validate`.
 *
 * This is the highest-risk code in the repository. The endpoint exists so a
 * server can fetch a URL a stranger supplies — which is the definition of
 * server-side request forgery if it is not constrained — and it exists because
 * two of the most common real defects cannot be diagnosed any other way: a
 * browser cannot see whether a feed sends CORS headers (that is exactly what
 * CORS prevents), and it cannot byte-compare a discovery path against the
 * site's own index to catch a soft-404.
 *
 * ## What this can and cannot enforce
 *
 * A Cloudflare Worker cannot resolve DNS itself. There is no `dns.lookup`, and
 * `fetch` does the resolution inside the runtime after this code has run. So a
 * hostname that *resolves* to 127.0.0.1 or to a cloud metadata address cannot
 * be detected here by resolution — only by pattern.
 *
 * That limitation is stated rather than papered over, and it shapes the design:
 *
 *   1. **Structural denial** — every IP literal form, every loopback and
 *      private-range spelling, every known metadata hostname, in every encoding
 *      a parser might normalise differently.
 *   2. **Every redirect hop re-checked** — redirects are followed manually so a
 *      302 to `http://169.254.169.254/` is caught at the hop, not after it.
 *   3. **Platform egress controls** — Cloudflare blocks Worker requests to its
 *      own metadata endpoints and to loopback. Documented as a dependency, not
 *      assumed silently.
 *
 * The residual risk — a public hostname whose DNS answer is an internal address
 * — is recorded in `docs/SECURITY.md` with the reason it cannot be closed at
 * this layer. Someone reading that section should not have to infer it from
 * code.
 *
 * Every rejection reason is a distinct value so the tests can assert *why* a
 * URL was refused, not merely that it was.
 */

export type RejectionReason =
  | 'not-a-url'
  | 'scheme'
  | 'credentials'
  | 'ip-literal'
  | 'loopback'
  | 'private-range'
  | 'link-local'
  | 'metadata-host'
  | 'internal-tld'
  | 'no-dot'
  | 'port';

export interface GuardResult {
  allowed: boolean;
  reason?: RejectionReason;
  /** The normalised URL a caller should actually fetch. */
  url?: URL;
}

/**
 * Hostnames that are never fetched, whatever they resolve to.
 *
 * The metadata entries are the ones that turn an SSRF into a credential leak on
 * every major cloud, so they are denied by name as well as by address.
 */
const DENIED_HOSTS = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  // Cloud instance metadata, by the names each provider answers to.
  'metadata',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
  'metadata.azure.com',
]);

/** Suffixes that are internal by definition. */
const DENIED_SUFFIXES = [
  '.local',
  '.localhost',
  '.internal',
  '.intranet',
  '.private',
  '.corp',
  '.home',
  '.lan',
  '.test',
  '.example',
  '.invalid',
  '.onion',
];

/**
 * Ports we will not talk to.
 *
 * Not an allowlist of 443: a publisher on a non-standard HTTPS port is doing
 * something unusual but not wrong. These are the ports where a request means
 * something other than "fetch a document".
 */
const DENIED_PORTS = new Set([
  '22', '23', '25', '110', '143', '445', '3306', '5432', '6379', '9200',
  '11211', '27017',
]);

/** IPv4 dotted quad, in decimal. */
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Every other way a host can spell an IPv4 address.
 *
 * `http://2130706433/` and `http://0x7f.1/` and `http://017700000001/` all
 * reach 127.0.0.1 in a permissive resolver. A guard that only knows dotted
 * decimal is a guard with a documented bypass.
 */
const IPV4_ALTERNATE =
  /^(0x[0-9a-f]+|\d+)(\.(0x[0-9a-f]+|\d+)){0,3}$/i;

function isIpv6Literal(hostname: string): boolean {
  // URL parsing leaves brackets on: `[::1]` → hostname `[::1]`.
  return hostname.startsWith('[') && hostname.endsWith(']');
}

/** Is this dotted-decimal IPv4 in a range we refuse? */
function ipv4Reason(hostname: string): RejectionReason | undefined {
  const match = hostname.match(IPV4);
  if (!match) return undefined;
  const octets = match.slice(1, 5).map(Number);
  if (octets.some((value) => Number.isNaN(value) || value > 255)) {
    return 'ip-literal';
  }
  const [a, b] = octets;

  if (a === 127) return 'loopback';
  if (a === 0) return 'loopback';
  if (a === 10) return 'private-range';
  if (a === 172 && b >= 16 && b <= 31) return 'private-range';
  if (a === 192 && b === 168) return 'private-range';
  if (a === 169 && b === 254) return 'link-local'; // includes 169.254.169.254
  if (a === 100 && b >= 64 && b <= 127) return 'private-range'; // CGNAT
  if (a >= 224) return 'private-range'; // multicast and reserved
  // A public IP literal is still refused: a conforming publisher has a name.
  return 'ip-literal';
}

/**
 * Decide whether a URL may be fetched.
 *
 * Called on the initial URL and again on every redirect hop — a 302 is a new
 * URL from an untrusted party, and treating it as already-checked is the
 * classic way this control is defeated.
 */
export function assertAllowedUrl(input: string): GuardResult {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { allowed: false, reason: 'not-a-url' };
  }

  if (url.protocol !== 'https:') return { allowed: false, reason: 'scheme' };

  // Credentials in a URL are how a fetch gets aimed at an authenticated
  // internal service, and no feed needs them.
  if (url.username || url.password) {
    return { allowed: false, reason: 'credentials' };
  }

  if (url.port && DENIED_PORTS.has(url.port)) {
    return { allowed: false, reason: 'port' };
  }

  /*
   * Lowercase, and let the URL parser have already applied punycode: an
   * internationalised hostname that renders as `lоcalhost` with a Cyrillic o
   * becomes `xn--lcalhost-6cg`, which does not match anything below — and does
   * not resolve to loopback either.
   */
  const hostname = url.hostname.toLowerCase();

  if (isIpv6Literal(hostname)) {
    // Every IPv6 literal is refused. Distinguishing ::1 and fe80:: from a
    // public v6 address means reimplementing address parsing for a case no
    // conforming publisher needs.
    return { allowed: false, reason: 'ip-literal' };
  }

  const v4 = ipv4Reason(hostname);
  if (v4) return { allowed: false, reason: v4 };

  // Hex, octal, dword and short forms — anything that is only digits and dots
  // or 0x-prefixed groups is an address wearing a costume.
  if (IPV4_ALTERNATE.test(hostname)) {
    return { allowed: false, reason: 'ip-literal' };
  }

  if (DENIED_HOSTS.has(hostname)) {
    return { allowed: false, reason: 'metadata-host' };
  }

  for (const suffix of DENIED_SUFFIXES) {
    if (hostname === suffix.slice(1) || hostname.endsWith(suffix)) {
      return { allowed: false, reason: 'internal-tld' };
    }
  }

  // A public hostname has a dot. This also catches bare container and service
  // names on an internal network — `redis`, `db`, `metadata`.
  if (!hostname.includes('.')) return { allowed: false, reason: 'no-dot' };

  return { allowed: true, url };
}

/** Human-readable, already user-facing. Used verbatim in the response. */
export const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  'not-a-url': 'That is not a URL we can parse.',
  scheme:
    'Only https is fetched. A feed served over plain http can be modified in transit by anyone on the path between you and your readers.',
  credentials: 'Remove the username and password from the URL.',
  'ip-literal':
    'Point the validator at a hostname rather than an IP address. A conforming publisher has a name that consumers can resolve.',
  loopback: 'That address is this machine, which is not where your feed is.',
  'private-range':
    'That is a private address. The validator fetches from the public internet, which is where your consumers will be.',
  'link-local':
    'That is a link-local address. The validator will not fetch it.',
  'metadata-host': 'That hostname is not one the validator will fetch.',
  'internal-tld':
    'That looks like an internal hostname. Give the validator the URL a consumer would use.',
  'no-dot':
    'That hostname has no domain. Give the validator the URL a consumer would use.',
  port: 'That port is not one the validator will fetch.',
};
