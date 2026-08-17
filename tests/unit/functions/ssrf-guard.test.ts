/**
 * The guard's bypass matrix.
 *
 * This is the test that matters most in the repository. The endpoint fetches a
 * URL a stranger supplies, and every row below is a real technique — each one
 * has been used against a real service, and most of them defeat a guard that
 * only checks for the string "localhost".
 *
 * Assertions are on the *reason*, not merely on rejection: a URL refused for
 * the wrong reason is a guard that happens to be right, and it will be wrong
 * on the next case.
 */
import { describe, expect, it } from 'vitest';

import {
  assertAllowedUrl,
  REJECTION_MESSAGES,
  type RejectionReason,
} from '../../../functions/lib/ssrf-guard';

const reject = (url: string, reason: RejectionReason) => {
  const result = assertAllowedUrl(url);
  expect(result.allowed, `${url} should be rejected`).toBe(false);
  expect(result.reason, `${url} rejected for the wrong reason`).toBe(reason);
};

const allow = (url: string) => {
  const result = assertAllowedUrl(url);
  expect(result.allowed, `${url} should be allowed`).toBe(true);
};

describe('ssrf guard — what it lets through', () => {
  it('allows ordinary public https URLs', () => {
    allow('https://example.org/.well-known/cabuya.json');
    allow('https://feeds.example.co.uk/places.json?page=2');
    allow('https://sub.domain.example.org:8443/feed.json');
  });

  it('allows an internationalised domain, punycoded by the parser', () => {
    allow('https://ayudá.example.org/feed.json');
  });
});

describe('ssrf guard — scheme and credentials', () => {
  it('refuses anything but https', () => {
    reject('http://example.org/feed.json', 'scheme');
    reject('file:///etc/passwd', 'scheme');
    reject('ftp://example.org/feed.json', 'scheme');
    reject('gopher://example.org/', 'scheme');
    // The classic: a scheme the URL parser accepts and fetch does not.
    reject('data:application/json,{}', 'scheme');
  });

  it('refuses credentials in the URL', () => {
    reject('https://user:pass@example.org/feed.json', 'credentials');
    reject('https://admin@example.org/feed.json', 'credentials');
  });

  it('is not fooled by credentials that look like a host', () => {
    // `https://example.org@169.254.169.254/` has host 169.254.169.254 —
    // the part before the @ is a username, which is the whole trick.
    reject('https://example.org@169.254.169.254/', 'credentials');
  });
});

describe('ssrf guard — loopback, in every spelling', () => {
  it('refuses the obvious forms', () => {
    reject('https://localhost/feed.json', 'metadata-host');
    reject('https://127.0.0.1/feed.json', 'loopback');
    reject('https://[::1]/feed.json', 'ip-literal');
    reject('https://0.0.0.0/feed.json', 'loopback');
  });

  it('refuses the encoded forms', () => {
    /*
     * All of these are 127.0.0.1 wearing a costume, and the WHATWG URL parser
     * unmasks them before the guard sees the hostname — `new URL('https://
     * 2130706433/')` has hostname `127.0.0.1`. So they land on the loopback
     * rule rather than the generic literal rule, which is the more precise
     * answer and the reason these are asserted on `loopback`.
     *
     * The generic IP-literal rule below is the backstop for anything the
     * parser does not normalise, and it is not redundant: a parser that
     * changed this behaviour would still not get a request through.
     */
    reject('https://2130706433/feed.json', 'loopback'); // dword
    reject('https://0x7f000001/feed.json', 'loopback'); // hex
    reject('https://017700000001/feed.json', 'loopback'); // octal
    reject('https://127.1/feed.json', 'loopback'); // short form
    reject('https://0x7f.1/feed.json', 'loopback');
    reject('https://0177.0.0.1/feed.json', 'loopback');
  });

  it('refuses a malformed address rather than passing it along', () => {
    /*
     * The parser refuses these outright — `1.2.3.4.5` is not a valid host at
     * all — so they arrive as `not-a-url`. That is the correct answer and the
     * reason to assert it: the failure mode to avoid is a malformed address
     * being treated as an ordinary hostname and handed to fetch.
     */
    reject('https://1.2.3.4.5/feed.json', 'not-a-url');
    reject('https://0xdeadbeef.0x1/feed.json', 'not-a-url');
    reject('https://999.1.1.1/feed.json', 'not-a-url');
  });

  it('refuses a two-part numeric host the parser expands', () => {
    // `12.34` becomes 12.0.0.34 — a public address, and still an IP literal.
    reject('https://12.34/feed.json', 'ip-literal');
  });

  it('refuses loopback aliases by name', () => {
    reject('https://localhost.localdomain/feed.json', 'metadata-host');
    reject('https://ip6-localhost/feed.json', 'metadata-host');
  });
});

describe('ssrf guard — private and link-local ranges', () => {
  it('refuses RFC 1918', () => {
    reject('https://10.0.0.5/feed.json', 'private-range');
    reject('https://172.16.0.1/feed.json', 'private-range');
    reject('https://172.31.255.254/feed.json', 'private-range');
    reject('https://192.168.1.1/feed.json', 'private-range');
  });

  it('does not over-reject the 172 block', () => {
    // 172.15 and 172.32 are public. Rejecting them would be a different bug.
    reject('https://172.15.0.1/feed.json', 'ip-literal');
    reject('https://172.32.0.1/feed.json', 'ip-literal');
  });

  it('refuses carrier-grade NAT and multicast', () => {
    reject('https://100.64.0.1/feed.json', 'private-range');
    reject('https://239.255.255.250/feed.json', 'private-range');
  });

  it('refuses link-local, including the metadata address', () => {
    reject('https://169.254.1.1/feed.json', 'link-local');
    // The one that turns an SSRF into stolen cloud credentials.
    reject('https://169.254.169.254/latest/meta-data/', 'link-local');
  });
});

describe('ssrf guard — metadata endpoints by name', () => {
  it('refuses the provider hostnames', () => {
    reject(
      'https://metadata.google.internal/computeMetadata/v1/',
      'metadata-host'
    );
    reject('https://metadata/computeMetadata/', 'metadata-host');
    reject('https://instance-data/latest/', 'metadata-host');
  });
});

describe('ssrf guard — internal names', () => {
  it('refuses internal suffixes', () => {
    reject('https://printer.local/feed.json', 'internal-tld');
    reject('https://api.internal/feed.json', 'internal-tld');
    reject('https://db.corp/feed.json', 'internal-tld');
    reject('https://thing.onion/feed.json', 'internal-tld');
  });

  it('refuses a bare service name', () => {
    // Container and service names on an internal network have no dot.
    reject('https://redis/feed.json', 'no-dot');
    reject('https://kubernetes/api/', 'no-dot');
  });

  it('does not reject a public host that merely contains a denied word', () => {
    allow('https://localhost.example.org/feed.json');
    allow('https://metadata-service.example.org/feed.json');
    allow('https://internal.example.org/feed.json');
  });
});

describe('ssrf guard — ports', () => {
  it('refuses ports where a request means something else', () => {
    reject('https://example.org:22/feed.json', 'port');
    reject('https://example.org:6379/feed.json', 'port');
    reject('https://example.org:27017/feed.json', 'port');
  });

  it('allows an unusual but plausible https port', () => {
    allow('https://example.org:8443/feed.json');
  });
});

describe('ssrf guard — every reason has a message', () => {
  it('so a rejection can always be explained to the person who caused it', () => {
    const reasons: RejectionReason[] = [
      'not-a-url',
      'scheme',
      'credentials',
      'ip-literal',
      'loopback',
      'private-range',
      'link-local',
      'metadata-host',
      'internal-tld',
      'no-dot',
      'port',
    ];
    for (const reason of reasons) {
      expect(REJECTION_MESSAGES[reason], reason).toBeTruthy();
      expect(REJECTION_MESSAGES[reason].length).toBeGreaterThan(20);
    }
  });

  it('explains rather than scolds', () => {
    // A publisher who pasted an http URL made an ordinary mistake and should
    // learn why it matters, not be told off.
    expect(REJECTION_MESSAGES.scheme).toContain('modified in transit');
  });
});
