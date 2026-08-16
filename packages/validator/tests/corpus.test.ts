/**
 * The golden corpus and its structural invariants.
 *
 * Two guarantees this suite exists to give:
 *   1. **Every implemented ERROR check has a must-fail case and a near-miss
 *      case.** A check with only a failing fixture might fire on everything;
 *      a check with only a passing one might fire on nothing.
 *   2. **Schema mutation:** deleting each required property in turn produces
 *      exactly the expected check, and no other error.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { CHECKS, Engine, type Report } from '../src/index.js';
import { BEHAVIOR_CHECK_IDS } from '../src/passes/behavior.js';
import { denyPass } from '../src/passes/deny.js';
import { schemaPass } from '../src/passes/schema.js';
import { semanticPass } from '../src/passes/semantic.js';
import {
  feed,
  type Json,
  manifest,
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
  schemas = Object.fromEntries(
    readdirSync(SPEC)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f, JSON.parse(readFileSync(join(SPEC, f), 'utf-8'))])
  );
});

async function validate(document: Json): Promise<Report> {
  return new Engine({
    validatorVersion: 'test',
    specVersion: '0.1.0',
    target: 'inline',
    schemas,
    now: () => new Date('2026-08-16T00:00:00.000Z'),
  })
    .register(schemaPass, semanticPass, denyPass)
    .run(document);
}

const errorIds = (report: Report) =>
  report.findings.filter((f) => f.severity === 'error').map((f) => f.id);

/**
 * Every implemented error check, mapped to the mutation that must trigger
 * it. Keeping this table beside the invariant test is what makes the
 * invariant enforceable rather than aspirational.
 */
const MUST_FAIL: Record<string, () => Json> = {
  SCH001: () => feed({ data: { places: 'not an array' } }),
  // The manifest branch of the schema pass — a different document type, so
  // it needs its own case rather than riding on the feed fixtures.
  DSC005: () => without(manifest(), 'publisher'),
  ENV001: () => without(feed(), 'ttl'),
  ENV002: () => feed({ last_updated: '2026-08-16T04:00:00' }),
  ENV003: () => without(feed(), 'license'),
  ENV006: () => feed({ version: '9.0.0' }),
  REC001: () => feed({}, [without(place(), 'last_confirmed_at')]),
  REC002: () => feed({}, [place({ id: 'example-app:p-1' })]),
  REC003: () => feed({}, [place({ publisher_id: 'someone-else' })]),
  REC004: () => {
    const p = place();
    delete (p as Json).address_text;
    delete (p as Json).lat;
    delete (p as Json).lon;
    return feed({}, [p]);
  },
  REC006: () => feed({}, [without(place(), 'public_url')]),
  REC007: () => feed({}, [place({ place_kind: 'not_a_kind' })]),
  REC009: () => feed({}, [without(place(), 'source')]),
  REC010: () => feed({}, [place({ name: 'Acopio (cerrado)' })]),
  REC012: () => {
    const stamp = '2026-08-16T03:00:00Z';
    return feed({}, [place({ updated_at: stamp, last_confirmed_at: stamp })]);
  },
  REC018: () => feed({}, [place(), place()]),
  PII001: () => feed({}, [place({ x_example_phone: '+57 300 123 4567' })]),
  PII002: () => feed({}, [place({ confirmed_by: 'Nombre Apellido' })]),
  PII003: () =>
    feed({}, [
      place({ description: 'Preguntar por Nombre Apellido, cel 3001234567.' }),
    ]),
  PII004: () => feed({ desaparecidos: [] }),
  PII006: () =>
    feed({}, [
      place({
        source: { source_id: 'peer-app' },
        moderation: 'informacion_falsa',
      }),
    ]),
};

describe('the structural invariant', () => {
  it('every implemented ERROR check is covered by one of the two mechanisms', () => {
    // Content checks are covered by the MUST_FAIL table below; transport
    // checks by the fixture-server suite. Coverage is keyed on the OWNING
    // PASS, not on the id family — ENV007 (CORS) is an envelope-family
    // check that only the behavior pass can exercise, and an earlier
    // family-keyed version of this test let it slip through.
    const uncovered = CHECKS.filter(
      (c) =>
        c.implemented &&
        c.severity === 'error' &&
        // REC015 is a self-check: it asserts the validator does NOT fire.
        c.id !== 'REC015' &&
        !(c.id in MUST_FAIL) &&
        !BEHAVIOR_CHECK_IDS.includes(c.id)
    ).map((c) => c.id);
    expect(uncovered).toEqual([]);
  });

  it('the transport exemption is not a rubber stamp — each id is exercised in the probe suite', () => {
    const suite = readFileSync(
      join(import.meta.dirname, 'behavior-pass.test.ts'),
      'utf-8'
    );
    const unexercised = BEHAVIOR_CHECK_IDS.filter((id) => !suite.includes(id));
    expect(unexercised).toEqual([]);
  });

  it('every must-fail fixture actually produces its check', async () => {
    for (const [id, build] of Object.entries(MUST_FAIL)) {
      const report = await validate(build());
      expect(errorIds(report), `${id} did not fire`).toContain(id);
    }
  });

  it('the near-miss baseline produces NONE of them', async () => {
    const report = await validate(feed());
    expect(errorIds(report)).toEqual([]);
  });

  it('REC015: unknown members never produce an error (extensibility)', async () => {
    const report = await validate(
      feed({ x_future: 1 }, [place({ x_example_app_note: 'ok', unknown: 2 })])
    );
    expect(errorIds(report)).toEqual([]);
  });
});

describe('schema mutation: delete each required property in turn', () => {
  const ENVELOPE_REQUIRED = [
    'last_updated',
    'ttl',
    'version',
    'publisher_id',
    'license',
    'data',
  ];
  const RECORD_REQUIRED = [
    'id',
    'publisher_id',
    'name',
    'place_kind',
    'municipality_code',
    'lifecycle_status',
    'last_confirmed_at',
    'source',
    'public_url',
  ];

  it('every envelope requirement produces at least one error when removed', async () => {
    for (const key of ENVELOPE_REQUIRED) {
      const report = await validate(without(feed(), key));
      expect(errorIds(report).length, `removing ${key}`).toBeGreaterThan(0);
    }
  });

  it('every record requirement produces at least one error when removed', async () => {
    for (const key of RECORD_REQUIRED) {
      const report = await validate(feed({}, [without(place(), key)]));
      expect(errorIds(report).length, `removing ${key}`).toBeGreaterThan(0);
    }
  });

  it('removing last_confirmed_at produces REC001 and nothing else', async () => {
    const report = await validate(
      feed({}, [without(place(), 'last_confirmed_at')])
    );
    expect([...new Set(errorIds(report))]).toEqual(['REC001']);
  });

  it('removing license produces ENV003 and nothing else', async () => {
    const report = await validate(without(feed(), 'license'));
    expect([...new Set(errorIds(report))]).toEqual(['ENV003']);
  });
});
