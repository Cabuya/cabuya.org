/**
 * `POST /mcp` — the site's MCP server, exercised as JSON-RPC.
 *
 * Two properties carry the file: the tool surface matches the card and the
 * WebMCP component (one capability, three transports, zero drift), and the
 * validate tool reuses the real /api/validate handler with the caller's IP —
 * an MCP path that widened the rate limit would be a bypass with a friendly
 * name.
 */
import { describe, expect, it, vi } from 'vitest';

import { onRequest, onRequestPost } from '../../../functions/mcp';

type Context = Parameters<typeof onRequestPost>[0];

function makeContext(body: unknown, ip = '203.0.113.7'): Context {
  return {
    request: new Request('https://cabuya.org/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
      body: JSON.stringify(body),
    }),
    env: {},
  } as unknown as Context;
}

const rpc = (method: string, params: Record<string, unknown> = {}, id = 1) => ({
  jsonrpc: '2.0',
  id,
  method,
  params,
});

describe('the MCP endpoint', () => {
  it('initialize returns serverInfo, tools capability and a known protocol version', async () => {
    const response = await onRequestPost(
      makeContext(rpc('initialize', { protocolVersion: '2025-06-18' }))
    );
    const { result } = await response.json();
    expect(result.protocolVersion).toBe('2025-06-18');
    expect(result.serverInfo.name).toBe('cabuya-org');
    expect(result.capabilities.tools).toBeDefined();
  });

  it('an unknown protocol version gets our newest, not an invented echo', async () => {
    const response = await onRequestPost(
      makeContext(rpc('initialize', { protocolVersion: '2099-01-01' }))
    );
    const { result } = await response.json();
    expect(result.protocolVersion).toBe('2025-06-18');
  });

  it('tools/list serves exactly the two tools the card claims', async () => {
    const response = await onRequestPost(makeContext(rpc('tools/list')));
    const { result } = await response.json();
    expect(result.tools.map((tool: { name: string }) => tool.name)).toEqual([
      'validate_cabuya_feed',
      'read_cabuya_page_as_markdown',
    ]);
    for (const tool of result.tools) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.description.length).toBeGreaterThan(40);
    }
  });

  it('the read tool fetches the .md twin, same-origin only', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('# Quickstart', { status: 200 }));
    const response = await onRequestPost(
      makeContext(
        rpc('tools/call', {
          name: 'read_cabuya_page_as_markdown',
          arguments: { path: '/developers/quickstart' },
        })
      )
    );
    const { result } = await response.json();
    expect(result.content[0].text).toBe('# Quickstart');
    expect(String(fetchSpy.mock.calls[0][0])).toBe(
      'https://cabuya.org/developers/quickstart.md'
    );
    fetchSpy.mockRestore();
  });

  it('the read tool refuses another origin instead of proxying it', async () => {
    const response = await onRequestPost(
      makeContext(
        rpc('tools/call', {
          name: 'read_cabuya_page_as_markdown',
          arguments: { path: 'https://example.invalid/secrets' },
        })
      )
    );
    const { result } = await response.json();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('only reads pages on cabuya.org');
  });

  it('unknown methods and unknown tools are JSON-RPC errors, not crashes', async () => {
    const bad = await onRequestPost(makeContext(rpc('resources/list')));
    expect((await bad.json()).error.code).toBe(-32601);
    const badTool = await onRequestPost(
      makeContext(rpc('tools/call', { name: 'delete_everything' }))
    );
    expect((await badTool.json()).error.code).toBe(-32602);
  });

  it('a batch is refused — stateless single-message server', async () => {
    const response = await onRequestPost(makeContext([rpc('ping')]));
    expect((await response.json()).error.code).toBe(-32600);
  });

  it('GET gets a 405 with Allow, never a hang waiting for a stream', async () => {
    const response = await onRequest({
      request: new Request('https://cabuya.org/mcp'),
      env: {},
    } as unknown as Context);
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toContain('POST');
  });

  it('the validate tool forwards the caller IP into the real handler', async () => {
    /* The synthetic request must bill the caller's rate bucket. We spy on
       the validate handler's KV to observe which key the rate check uses. */
    const seenKeys: string[] = [];
    const env = {
      VALIDATE_RATE: {
        get: async (key: string) => {
          seenKeys.push(key);
          return null;
        },
        put: async () => {},
      },
    };
    const context = {
      request: new Request('https://cabuya.org/mcp', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'cf-connecting-ip': '203.0.113.7',
        },
        body: JSON.stringify(
          rpc('tools/call', {
            name: 'validate_cabuya_feed',
            /* A public-looking host: the SSRF guard (correctly) rejects
               `.invalid` before the rate check ever runs. */
            arguments: { url: 'https://feeds.example.org/cabuya.json' },
          })
        ),
      }),
      env,
    } as unknown as Context;
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await onRequestPost(context);
    expect(response.status).toBe(200);
    expect(seenKeys.some((key) => key.includes('203.0.113.7'))).toBe(true);
    fetchSpy.mockRestore();
  });
});
