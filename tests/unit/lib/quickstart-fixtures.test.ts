/**
 * The quickstart's snippets, run through the real validator.
 *
 * The quickstart teaches by example, and an example that does not conform is
 * worse than no example: the reader copies it, the validator rejects it, and
 * the first thing they learn about this protocol is that its own documentation
 * is wrong. So the two JSON blocks on that page are fixture files, and this
 * test runs the shipped validator over them.
 *
 * They are also compared against `cabuya-validator init`. Those are the two
 * places a newcomer gets a starting file from, and they disagreeing quietly is
 * exactly the kind of thing nobody notices for a year.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const FIXTURES = join(ROOT, 'tests', 'fixtures', 'quickstart');

const read = (name: string) => readFileSync(join(FIXTURES, name), 'utf-8');

/** The shipped schemas, injected — the validator core never reads from disk. */
function loadSchemas(): Record<string, unknown> {
  const dir = join(ROOT, 'spec', 'schemas', '0.1');
  return Object.fromEntries(
    ['place-feed.schema.json', 'manifest.schema.json'].map((file) => [
      file,
      JSON.parse(readFileSync(join(dir, file), 'utf-8')),
    ])
  );
}

describe('quickstart fixtures — conformance', () => {
  /**
   * Degraded mode on purpose: no fetcher means the transport passes are
   * skipped rather than run against nothing, and what remains is exactly what
   * a reader can control by editing the file the page shows them.
   */
  async function validate(name: string) {
    const { Engine, SPEC_VERSION, schemaPass, semanticPass, denyPass } =
      await import('@cabuya/validator');
    const raw = read(name);
    const engine = new Engine({
      validatorVersion: 'test',
      specVersion: SPEC_VERSION,
      target: `quickstart/${name}`,
      schemas: loadSchemas(),
    });
    engine.register(schemaPass, semanticPass, denyPass);
    return engine.run(JSON.parse(raw), raw);
  }

  it('the manifest is schema-valid with no errors', async () => {
    const report = await validate('manifest.json');
    expect(
      report.findings.filter((finding) => finding.severity === 'error'),
      'the quickstart would teach a non-conforming manifest'
    ).toEqual([]);
  });

  it('the feed is schema-valid with no errors', async () => {
    const report = await validate('feed.json');
    expect(
      report.findings.filter((finding) => finding.severity === 'error'),
      'the quickstart would teach a non-conforming feed'
    ).toEqual([]);
  });

  it('teaches the honest null rather than a fabricated confirmation', () => {
    // `last_confirmed_at: null` is the single most important thing the
    // quickstart models. A sample with a plausible timestamp in it teaches
    // every reader to invent one.
    const feed = JSON.parse(read('feed.json'));
    expect(feed.data.places[0].last_confirmed_at).toBeNull();
  });

  it('contains nothing that looks like person-level data', async () => {
    const { DENY_KEYS, DENY_PATTERNS } = await import('@cabuya/validator');
    const raw = `${read('manifest.json')}\n${read('feed.json')}`;
    const parsed = JSON.parse(read('feed.json'));

    const keys = new Set<string>();
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
          keys.add(key.toLowerCase());
          walk(child);
        }
      }
    };
    walk(parsed);
    expect([...keys].filter((key) => DENY_KEYS.includes(key))).toEqual([]);
    for (const { class: cls, re } of DENY_PATTERNS) {
      expect(re.test(raw), `fixture matches ${cls}`).toBe(false);
    }
  });
});

describe('quickstart fixtures — agreement with `init`', () => {
  it('are byte-identical to what the CLI generates', async () => {
    const { initOutput, parseArgs } = await import('@cabuya/validator/cli');
    const output = initOutput(
      parseArgs(['init', '--publisher-id', 'example-app'])
    );
    const blocks = [...output.matchAll(/^\{[\s\S]*?^\}/gm)].map((m) => m[0]);
    expect(blocks).toHaveLength(2);
    expect(`${blocks[0]}\n`).toBe(read('manifest.json'));
    expect(`${blocks[1]}\n`).toBe(read('feed.json'));
  });
});
