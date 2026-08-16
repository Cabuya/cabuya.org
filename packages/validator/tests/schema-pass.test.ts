/**
 * The schema pass: Ajv errors re-authored under the seven message rules,
 * attributed to the catalogue check that owns the failing path.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { Engine, getCheck, type Report } from '../src/index.js';
import { schemaPass } from '../src/passes/schema.js';
import {
  feed,
  feedWith,
  type Json,
  place,
  without,
} from './fixtures/builders.js';

const SPEC = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'spec',
  'schemas',
  '0.1'
);

let schemas: Record<string, unknown>;
beforeAll(() => {
  schemas = {
    'place-feed.schema.json': JSON.parse(
      readFileSync(join(SPEC, 'place-feed.schema.json'), 'utf-8')
    ),
    'manifest.schema.json': JSON.parse(
      readFileSync(join(SPEC, 'manifest.schema.json'), 'utf-8')
    ),
  };
});

const run = async (document: Json): Promise<Report> =>
  new Engine({
    validatorVersion: 'test',
    specVersion: '0.1.0',
    target: 'inline',
    schemas,
    now: () => new Date('2026-08-16T00:00:00.000Z'),
  })
    .register(schemaPass)
    .run(document);

describe('the baseline fixture is clean', () => {
  it('a conforming feed produces no schema findings', async () => {
    const report = await run(feed());
    expect(report.findings).toEqual([]);
  });
});

describe('attribution to catalogue checks', () => {
  it('a missing licence is ENV003, not a generic schema error', async () => {
    const report = await run(without(feed(), 'license'));
    expect(report.findings.map((f) => f.id)).toContain('ENV003');
  });

  it('a missing confirmation key is REC001 and names the honest alternative', async () => {
    const report = await run(feed({}, [without(place(), 'last_confirmed_at')]));
    const finding = report.findings.find((f) => f.id === 'REC001');
    expect(finding).toBeDefined();
    // The designed message — an agent must not "fix" this by inventing a time.
    expect(finding?.message).toContain(
      'did you mean to publish last_confirmed_at: null?'
    );
    expect(finding?.suggested_patch).toEqual({
      op: 'add',
      path: '/data/places/0/last_confirmed_at',
      value: null,
    });
  });

  it('a missing public_url is REC006 and a missing source is REC009', async () => {
    const noUrl = await run(feed({}, [without(place(), 'public_url')]));
    expect(noUrl.findings.map((f) => f.id)).toContain('REC006');
    const noSource = await run(feed({}, [without(place(), 'source')]));
    expect(noSource.findings.map((f) => f.id)).toContain('REC009');
  });

  it('an out-of-enum place_kind is REC007 and lists the legal values', async () => {
    const report = await run(feedWith({ place_kind: 'not_a_kind' }));
    const finding = report.findings.find((f) => f.id === 'REC007');
    expect(finding).toBeDefined();
    expect(finding?.fix).toContain('shelter');
  });
});

describe('message quality (the seven rules)', () => {
  it('never leaks a raw Ajv message', async () => {
    const report = await run(without(feed(), 'license'));
    for (const finding of report.findings) {
      expect(finding.message).not.toMatch(/must have required property/);
    }
  });

  it('every finding carries pointer, rule, fix and both deep links', async () => {
    const report = await run(feed({}, [without(place(), 'last_confirmed_at')]));
    expect(report.findings.length).toBeGreaterThan(0);
    for (const finding of report.findings) {
      expect(finding.pointer).toBeDefined();
      expect(finding.rule).toBeTruthy();
      expect(finding.fix).toBeTruthy();
      expect(finding.spec).toMatch(
        /^https:\/\/cabuya\.org\/developers\/spec\//
      );
      expect(finding.docs).toBe(
        `https://cabuya.org/developers/validator/checks#${finding.id}`
      );
      expect(getCheck(finding.id)).toBeDefined();
    }
  });

  it('never blames, moralizes, or says "certified"', async () => {
    const report = await run(feedWith({ place_kind: 'nope' }));
    for (const finding of report.findings) {
      const text = `${finding.message} ${finding.fix}`.toLowerCase();
      for (const banned of [
        'certified',
        'certificado',
        'you failed',
        'invalid feed author',
      ]) {
        expect(text).not.toContain(banned);
      }
    }
  });
});

describe('extensibility (REC015) — the validator must not fail on unknown members', () => {
  it('accepts unknown envelope and record members', async () => {
    const report = await run(
      feed({ x_example_future: 'ok' }, [
        place({ x_example_app_note: 'ok', totally_unknown: 42 }),
      ])
    );
    expect(report.findings).toEqual([]);
  });
});

describe('reporting the harness honestly', () => {
  it('throws when a schema was not injected — a harness bug is not a publisher defect', async () => {
    const engine = new Engine({
      validatorVersion: 'test',
      specVersion: '0.1.0',
      target: 'inline',
      schemas: {},
    }).register(schemaPass);
    await expect(engine.run(feed())).rejects.toThrow(/was not injected/);
  });
});
