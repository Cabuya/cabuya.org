/**
 * The transport interface.
 *
 * Injectable for three reasons, all load-bearing:
 *   1. Tests inject a stub, so the suite never touches the network.
 *   2. `--no-network` is enforced STRUCTURALLY — the engine is handed a
 *      fetcher that throws, so a pass that tries to probe fails loudly
 *      instead of silently reaching the internet (asserted by a test).
 *   3. The Workers harness supplies its own runtime fetch with the SSRF
 *      guard wrapped around it; the core stays runtime-agnostic (no
 *      Node-only APIs anywhere in this package's core).
 */

export interface FetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  headers?: Record<string, string>;
}

export interface FetchResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  body: string;
  bytes: number;
  elapsedMs: number;
  /** Every hop, in order, when redirects were followed. */
  redirectChain?: string[];
  /** Set when the transport itself failed (DNS, TLS, timeout, cap). */
  transportError?: string;
}

export interface Fetcher {
  fetch(url: string, options?: FetchOptions): Promise<FetchResult>;
  /** How many requests this fetcher has made — the politeness budget. */
  requestCount(): number;
}

/** The no-network fetcher: any call is a programming error, loudly. */
export class OfflineFetcher implements Fetcher {
  private calls = 0;

  async fetch(url: string): Promise<FetchResult> {
    this.calls += 1;
    throw new Error(
      `network access attempted in --no-network mode (${url}). ` +
        'Behavioral checks must be skipped, not silently executed.'
    );
  }

  requestCount(): number {
    return this.calls;
  }
}

/**
 * A runtime-agnostic fetcher over the global `fetch`.
 *
 * Politeness (spec-adjacent, blueprint §4.8) is enforced here so every
 * harness inherits it: a per-host request ceiling, a project-identifying
 * User-Agent that links to an explanation page, and `Cache-Control:
 * no-cache` so a CDN-cached response cannot defeat the always-now probe.
 */
export class HttpFetcher implements Fetcher {
  private calls = 0;
  private perHost = new Map<string, number>();

  constructor(
    private readonly options: {
      version: string;
      maxRequestsPerHost?: number;
      userAgent?: string;
    }
  ) {}

  private ua(): string {
    return (
      this.options.userAgent ??
      `cabuya-validator/${this.options.version} (+https://cabuya.org/developers/validator/probe)`
    );
  }

  async fetch(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    const started = Date.now();
    const host = new URL(url).host;
    const used = this.perHost.get(host) ?? 0;
    const ceiling = this.options.maxRequestsPerHost ?? 6;
    if (used >= ceiling) {
      return {
        ok: false,
        status: 0,
        headers: {},
        body: '',
        bytes: 0,
        elapsedMs: 0,
        transportError: `politeness budget exhausted for ${host} (${ceiling} requests per run)`,
      };
    }
    this.perHost.set(host, used + 1);
    this.calls += 1;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 8000
    );

    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': this.ua(),
          'cache-control': 'no-cache',
          accept: 'application/json, text/plain;q=0.8, */*;q=0.5',
          ...options.headers,
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      const buffer = await response.arrayBuffer();
      const maxBytes = options.maxBytes ?? 5 * 1024 * 1024;
      if (buffer.byteLength > maxBytes) {
        return {
          ok: false,
          status: response.status,
          headers,
          body: '',
          bytes: buffer.byteLength,
          elapsedMs: Date.now() - started,
          transportError: `body exceeds the ${maxBytes}-byte cap`,
        };
      }

      return {
        ok: response.ok,
        status: response.status,
        headers,
        body: new TextDecoder().decode(buffer),
        bytes: buffer.byteLength,
        elapsedMs: Date.now() - started,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        headers: {},
        body: '',
        bytes: 0,
        elapsedMs: Date.now() - started,
        transportError: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  requestCount(): number {
    return this.calls;
  }
}
