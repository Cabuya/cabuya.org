/**
 * The slice of the Cloudflare Pages runtime this site actually uses.
 *
 * Hand-declared rather than pulled from `@cloudflare/workers-types`. The
 * package models the whole platform — D1, R2, Durable Objects, queues, the
 * cache API — and every one of those is something these Functions must not
 * touch. Declaring the four members we need means the type system says so too:
 * `retention:check` greps for storage bindings, and this file makes the same
 * argument to the compiler, which is harder to forget than a grep.
 *
 * The trade is that a runtime feature has to be declared here before it can be
 * used, which is exactly the friction we want on this surface.
 */

/** A KV namespace, read side. */
export interface KvRead {
  get(key: string): Promise<string | null>;
}

/** A KV namespace with the one write shape the rate counters need. */
export interface KvReadWrite extends KvRead {
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

/** What a Pages Function handler receives. */
export interface PagesContext<Env> {
  request: Request;
  env: Env;
  /** Route parameters, from the `[bracket]` segments of the filename. */
  params: Record<string, string | string[] | undefined>;
}
