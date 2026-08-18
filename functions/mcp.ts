/**
 * `POST /mcp` — cabuya.org's own MCP server: the site's two public tools over
 * the standard Streamable HTTP transport.
 *
 * ## What this is, and what it is not
 *
 * This is the **site server**: the same two capabilities every page already
 * offers browser-side through WebMCP (`src/components/agents/WebMcpTools.astro`),
 * reachable by agents that connect over MCP instead of driving a browser —
 * validate a published feed, and read any page of this site as Markdown.
 *
 * It is **not** the network-level federation server `/developers/mcp`
 * describes (`list_publishers`, `search_places`, …). That one projects the
 * protocol's read/write surface over the registry and stays gated until at
 * least two live conforming feeds exist to federate over. Conflating the two
 * would let a utility endpoint quietly become the front door the design
 * refuses to build — so this file's tools never touch the registry and never
 * proxy another publisher.
 *
 * ## Reuse, not reimplementation
 *
 * The validate tool calls the real `/api/validate` handler **in-process**,
 * with a synthetic request that carries the original caller's IP — so the
 * SSRF guard, both rate buckets (per caller, per target host) and the
 * zero-retention posture live in exactly one file, and an MCP caller is
 * rate-limited as itself rather than as this worker.
 *
 * ## Stateless by design
 *
 * No sessions, no SSE stream, no state between calls: every request is a
 * complete JSON-RPC exchange answered with JSON. `GET` gets a 405 — the
 * Streamable HTTP spec allows a server not to offer a stream — and there is
 * deliberately no logging anywhere in this file (`retention:check` covers it).
 */
import { onRequestPost as validateHandler } from './api/validate';

import type { KvReadWrite, PagesContext } from './lib/pages-runtime';

interface Env {
  VALIDATE_RATE?: KvReadWrite;
}

/** Bumped with the tool surface, not with the site. */
const SERVER_VERSION = '0.1.0';

/** Protocol revisions this stateless server can answer honestly. */
const KNOWN_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const SERVER_INFO = {
  name: 'cabuya-org',
  title: 'cabuya.org site tools',
  version: SERVER_VERSION,
};

const TOOLS = [
  {
    name: 'validate_cabuya_feed',
    title: 'Validate a Cabuya manifest or feed',
    description:
      'Validate a published Cabuya manifest or place feed by URL and return the findings, each with a stable check id, the rule it comes from and the fix. Conformance is measured, never declared: this is the measurement. Public, no credentials, rate limited to 10 calls per minute per caller.',
    inputSchema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description:
            'Absolute https URL of a manifest (usually /.well-known/cabuya.json) or of a place feed.',
        },
        lang: {
          type: 'string',
          enum: ['en', 'es'],
          description:
            'Language for the human-readable parts. Check ids and pointers never translate.',
        },
      },
    },
  },
  {
    name: 'read_cabuya_page_as_markdown',
    title: 'Read a cabuya.org page as Markdown',
    description:
      'Read any page of cabuya.org as Markdown, including every section of the specification and the full check catalogue. Pass a site-relative path such as /developers/quickstart or /developers/spec/0.1/3-the-feed.',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description:
            'Site-relative path, with or without the .md suffix. Spanish pages live under /es.',
        },
      },
    },
  },
];

// ── JSON-RPC plumbing ─────────────────────────────────────

interface RpcRequest {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
}

const rpcResult = (id: RpcRequest['id'], result: unknown) =>
  json({ jsonrpc: '2.0', id: id ?? null, result });

const rpcError = (id: RpcRequest['id'], code: number, message: string) =>
  json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

const text = (value: string, isError = false) => ({
  content: [{ type: 'text', text: value }],
  isError: isError || undefined,
});

// ── The two tools ─────────────────────────────────────────

async function callValidate(
  context: PagesContext<Env>,
  args: Record<string, unknown>
): Promise<unknown> {
  /*
   * In-process call into the real handler. The synthetic request preserves
   * the caller's IP so the per-caller rate bucket bills the caller, not this
   * worker — an MCP path that widened the rate limit would be a bypass with
   * a friendly name.
   */
  const ip = context.request.headers.get('cf-connecting-ip') ?? 'unknown';
  const synthetic = new Request(new URL('/api/validate', context.request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-connecting-ip': ip,
    },
    body: JSON.stringify({
      url: args.url,
      lang: args.lang === 'es' ? 'es' : 'en',
    }),
  });
  const response = await validateHandler({
    ...context,
    request: synthetic,
  } as PagesContext<Env>);
  const report = await response.text();
  return text(report, !response.ok);
}

async function callReadMarkdown(
  context: PagesContext<Env>,
  args: Record<string, unknown>
): Promise<unknown> {
  const origin = new URL(context.request.url).origin;
  let target: URL;
  try {
    target = new URL(String(args.path ?? ''), origin);
  } catch {
    return text('Refused: `path` is not a valid site-relative path.', true);
  }
  /* Same-origin only. A tool that fetches arbitrary URLs on request is an
     open proxy, and refusing here is what keeps it a reader. */
  if (target.origin !== origin) {
    return text('Refused: this tool only reads pages on cabuya.org.', true);
  }
  const clean = target.pathname.replace(/\/$/, '') || '/index';
  const twin = clean.endsWith('.md') ? clean : `${clean}.md`;
  const response = await fetch(new URL(twin, origin), {
    headers: { Accept: 'text/markdown' },
  });
  if (!response.ok) {
    return text(`No Markdown twin at ${twin} (HTTP ${response.status}).`, true);
  }
  return text(await response.text());
}

// ── The endpoint ──────────────────────────────────────────

export const onRequestPost = async (
  context: PagesContext<Env>
): Promise<Response> => {
  let message: RpcRequest;
  try {
    message = (await context.request.json()) as RpcRequest;
  } catch {
    return rpcError(null, -32700, 'The request body is not JSON.');
  }

  /* Stateless single-message server: JSON-RPC batches would need partial
     failure semantics this transport does not promise. One message, one
     answer. */
  if (Array.isArray(message)) {
    return rpcError(null, -32600, 'Batch requests are not supported.');
  }

  const { id, method, params = {} } = message;

  switch (method) {
    case 'initialize': {
      const requested = String(params.protocolVersion ?? '');
      return rpcResult(id, {
        protocolVersion: KNOWN_PROTOCOL_VERSIONS.includes(requested)
          ? requested
          : KNOWN_PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions:
          'Two tools: validate a published Cabuya manifest or feed (the measurement, not a declaration), and read any cabuya.org page as Markdown. No authentication — there is none on this site, by design (https://cabuya.org/auth.md).',
      });
    }

    case 'notifications/initialized':
      /* A notification carries no id and expects no reply. */
      return new Response(null, { status: 202 });

    case 'ping':
      return rpcResult(id, {});

    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });

    case 'tools/call': {
      const name = String(params.name ?? '');
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      if (name === 'validate_cabuya_feed') {
        return rpcResult(id, await callValidate(context, args));
      }
      if (name === 'read_cabuya_page_as_markdown') {
        return rpcResult(id, await callReadMarkdown(context, args));
      }
      return rpcError(id, -32602, `Unknown tool: ${name}`);
    }

    default:
      return rpcError(id, -32601, `Method not found: ${String(method)}`);
  }
};

export const onRequest = async (
  context: PagesContext<Env>
): Promise<Response> => {
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Mcp-Protocol-Version',
      },
    });
  }
  /* No GET stream: this server is stateless and never pushes. The spec
     allows exactly this — a 405 tells a client not to wait for one. */
  return new Response(null, {
    status: 405,
    headers: { Allow: 'POST, OPTIONS' },
  });
};
