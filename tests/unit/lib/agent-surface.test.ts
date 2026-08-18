/**
 * The agent-facing surface, checked against the things it describes.
 *
 * `/auth.md`, `/.well-known/agent-skills/index.json` and the skill it points at
 * are generated (`pnpm run agents:generate`), and `agents:check` proves the
 * committed copies match the generator. That leaves the question the generator
 * cannot answer about itself: **is what it publishes true?**
 *
 * These files are read by agents, which do not sanity-check prose. A published
 * rate limit that is not the enforced one sends a well-behaved client into a 429
 * it was promised would not happen; a sha256 that does not match the skill makes
 * an agent distrust the file it just fetched; and a document claiming an OAuth
 * endpoint that does not exist is worse than no document. So each of those is a
 * test rather than a habit.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const read = (path: string): string => readFileSync(join(ROOT, path), 'utf-8');

const AUTH_MD = 'public/auth.md';
const INDEX = 'public/.well-known/agent-skills/index.json';
const SKILL = 'public/.well-known/agent-skills/publish-a-feed/SKILL.md';
const ADOPT_SKILL = 'public/.well-known/agent-skills/adopt-cabuya/SKILL.md';

describe('auth.md', () => {
  it('exists at the root, where the convention puts it', () => {
    expect(existsSync(join(ROOT, AUTH_MD))).toBe(true);
  });

  it('publishes the rate limits the function actually enforces', () => {
    /*
     * The numbers live in `functions/api/validate.ts` and are mirrored into the
     * generator. Mirrored, not imported: that file is a Cloudflare Pages Function
     * with its own runtime types, and importing it into a build script drags the
     * whole worker surface along. This is the seam that keeps the mirror honest.
     */
    const fn = read('functions/api/validate.ts');
    const number = (field: string): string => {
      const match = fn.match(new RegExp(`${field}:\\s*([0-9_]+)`));
      expect(match, `${field} not found in the function`).not.toBeNull();
      return (match?.[1] ?? '').replace(/_/g, '');
    };

    const auth = read(AUTH_MD);
    expect(auth).toContain(`${number('perIpPerMinute')}/minute per caller`);
    expect(auth).toContain(`${number('perHostPerHour')}/hour per probed host`);
    expect(auth).toContain(
      `following at most ${number('maxRedirects')} redirects`
    );
    expect(auth).toContain(`${Number(number('runBudgetMs')) / 1000} s per run`);
  });

  it('names every endpoint it offers, and no endpoint it does not', () => {
    const auth = read(AUTH_MD);
    for (const endpoint of [
      '/api/validate',
      '/badge/{publisher}.svg',
      '/openapi.json',
      '/.well-known/api-catalog',
      '/llms.txt',
    ]) {
      expect(auth, endpoint).toContain(endpoint);
    }
  });

  it('states the absence of OAuth rather than inventing it', () => {
    /*
     * The temptation this test exists to block: an agent-readiness scanner scores
     * four more points for publishing `openid-configuration`,
     * `oauth-authorization-server`, `oauth-protected-resource` and an MCP server
     * card. This site has none of those things — `/developers/mcp` says the
     * reference server is specified and not deployed — so the honest move is to
     * document the absence, and the dishonest one is a machine-readable file
     * pointing at endpoints that 404.
     */
    const auth = read(AUTH_MD);
    expect(auth).toContain('There is no authentication');
    for (const absent of [
      '/.well-known/openid-configuration',
      '/.well-known/oauth-authorization-server',
      '/.well-known/oauth-protected-resource',
      '/.well-known/mcp/server-card.json',
    ]) {
      expect(auth, absent).toContain(absent);
      expect(
        existsSync(join(ROOT, `public${absent}`)),
        `${absent} must not be served while the thing it describes does not exist`
      ).toBe(false);
    }
  });
});

describe('the agent-skills index', () => {
  const index = JSON.parse(read(INDEX));

  it('follows the discovery RFC shape', () => {
    expect(index.$schema).toMatch(/^https:\/\//);
    expect(Array.isArray(index.skills)).toBe(true);
    expect(index.skills.length).toBeGreaterThan(0);
    for (const skill of index.skills) {
      expect(skill.name).toBeTypeOf('string');
      expect(skill.type).toBeTypeOf('string');
      expect(skill.description.length).toBeGreaterThan(40);
      expect(skill.url).toMatch(/^https:\/\/cabuya\.org\//);
      expect(skill.sha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('lists exactly the two skills this site teaches', () => {
    expect(index.skills.map((entry: { name: string }) => entry.name)).toEqual([
      'adopt-cabuya',
      'publish-a-cabuya-feed',
    ]);
  });

  it('digests the bytes it actually serves, per skill', () => {
    const byName = new Map(
      index.skills.map((entry: { name: string; sha256: string }) => [
        entry.name,
        entry.sha256,
      ])
    );
    for (const [name, file] of [
      ['publish-a-cabuya-feed', SKILL],
      ['adopt-cabuya', ADOPT_SKILL],
    ] as const) {
      const digest = createHash('sha256')
        .update(read(file), 'utf-8')
        .digest('hex');
      expect(byName.get(name), name).toBe(digest);
    }
  });

  it('points only at skills this site serves', () => {
    for (const skill of index.skills) {
      const path = new URL(skill.url).pathname;
      expect(existsSync(join(ROOT, 'public', path)), path).toBe(true);
    }
  });
});

describe('the skill', () => {
  const skill = read(SKILL);

  it('carries the frontmatter a skill runner reads', () => {
    expect(skill.startsWith('---\n')).toBe(true);
    expect(skill).toMatch(/\nname: [a-z0-9-]+\n/);
    expect(skill).toMatch(/\ndescription: .{60,}\n/);
  });

  it('teaches the five rules, the join prohibition first', () => {
    expect(skill).toContain('No person-level data');
    expect(skill).toContain('join prohibition');
    expect(skill).toContain('measured, never declared');
  });

  it('inlines the fixtures the validator itself is run against', () => {
    /*
     * The manifest and feed in the skill are the quickstart fixtures, which
     * `tests/unit/lib/quickstart-fixtures.test.ts` puts through the real
     * validator. A skill that teaches a non-conforming example is worse than no
     * skill, and this is what stops the two copies from drifting.
     */
    for (const fixture of ['manifest.json', 'feed.json']) {
      const contents = read(`tests/fixtures/quickstart/${fixture}`).trim();
      expect(skill, fixture).toContain(contents);
    }
  });

  it('claims no conformance level for anybody', () => {
    /* Rule-0: the validator measures, the skill explains. */
    expect(skill).not.toMatch(/is (now )?conforming/i);
    expect(skill).not.toMatch(/certified|certificad/i);
  });
});

describe('WebMCP', () => {
  const source = read('src/components/agents/WebMcpTools.astro');

  it('is feature-detected, so it is inert in every browser that lacks it', () => {
    expect(source).toContain('navigator.modelContext');
    expect(source).toMatch(
      /if \(!mc \|\| typeof mc\.provideContext !== 'function'\) return;/
    );
  });

  it('declares tools with a schema, which is what makes them callable', () => {
    expect(source).toContain('provideContext');
    expect(source).toContain('inputSchema');
    expect(source).toContain('validate_cabuya_feed');
    expect(source).toContain('read_cabuya_page_as_markdown');
  });

  it('refuses to fetch off-origin, so the tool is not an open proxy', () => {
    /*
     * `read_cabuya_page_as_markdown` runs in the visitor's browser with the
     * visitor's cookies. A version of it that fetched any URL an agent named
     * would be an SSRF proxy with a friendly description.
     */
    expect(source).toContain('target.origin !== location.origin');
    expect(source).toContain('Refused');
  });

  it('is inline, because the landing page has a JS budget', () => {
    expect(source).toContain('<script is:inline>');
  });
});

describe('the adopt skill', () => {
  const skill = read(ADOPT_SKILL);

  it('quotes only the commands pinned against the install proof', () => {
    /* The same strings `/start` renders — one proof, three surfaces. */
    expect(skill).toContain('npx skills add Cabuya/cabuya-skill');
    expect(skill).toContain(
      'git clone --depth 1 https://github.com/Cabuya/cabuya-skill .agents/skills/cabuya'
    );
    expect(skill).toContain('`/cabuya`');
  });

  it('is the entry, not a copy of the pack', () => {
    /* Under 60 lines by design: it routes to the pack and to /start rather
       than duplicating a flow that would rot here. */
    expect(skill.split('\n').length).toBeLessThan(60);
    expect(skill).toContain('https://github.com/Cabuya/cabuya-skill');
    expect(skill).toContain('https://cabuya.org/start');
  });

  it('states the precedence and the human gate', () => {
    expect(skill).toContain('Theirs outranks anything the pack brings');
    expect(skill).toContain('PII decision is made by a');
    expect(skill).toContain('never a declaration');
  });

  it('links only to routes this site serves', () => {
    /* Against the middleware allowlist rather than dist/ — unit tests run
       before the build in CI, and a route outside KNOWN_PATHS 404s in
       production whatever dist contains. */
    const middleware = readFileSync(join(ROOT, 'src/middleware.ts'), 'utf-8');
    const known = new Set(
      [...middleware.matchAll(/^\s*'([a-z0-9-]*)',$/gm)].map(
        (match) => match[1]
      )
    );
    const urls = skill.match(/https:\/\/cabuya\.org[a-zA-Z0-9/._-]*/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const target of urls) {
      const [first = ''] = new URL(target).pathname.split('/').filter(Boolean);
      expect(known.has(first), `${target} is outside KNOWN_PATHS`).toBe(true);
    }
  });
});
