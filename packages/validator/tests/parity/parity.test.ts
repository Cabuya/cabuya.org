/**
 * Runtime parity — the property that makes conformance trustworthy.
 *
 * "One engine, four harnesses" is only true if the SAME bundle produces the
 * SAME report everywhere. A publisher who fixes what the CLI said must have
 * fixed what the badge measures; if the two runtimes could disagree, the
 * badge would be a different claim from the report, and the whole
 * measured-not-declared argument would rest on a coincidence.
 *
 * The harness is documented in `workers-sandbox.mjs`: it strips Node's
 * runtime surface before importing the core, which is the failure mode that
 * can actually break the property. workerd's isolate semantics are out of
 * scope and stated as such.
 */
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { Engine, type Report } from '../../src/index.js';
import { denyPass } from '../../src/passes/deny.js';
import { schemaPass } from '../../src/passes/schema.js';
import { semanticPass } from '../../src/passes/semantic.js';
import { feed, type Json, place, without } from '../fixtures/builders.js';

const SPEC = join(import.meta.dirname, '..', '..', '..', '..', 'spec');
const SANDBOX = join(import.meta.dirname, 'workers-sandbox.mjs');

let schemas: Record<string, unknown>;
beforeAll(() => {
  const dir = join(SPEC, 'schemas', '0.1');
  schemas = Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f, JSON.parse(readFileSync(join(dir, f), 'utf-8'))])
  );
});

/** The corpus both runtimes see: the real examples plus mutation cases. */
function corpus(): { name: string; document: Json }[] {
  const cases: { name: string; document: Json }[] = [];
  for (const folder of ['valid', 'invalid']) {
    const dir = join(SPEC, 'examples', '0.1', folder);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      cases.push({
        name: `${folder}/${file}`,
        document: JSON.parse(readFileSync(join(dir, file), 'utf-8')),
      });
    }
  }
  cases.push(
    { name: 'synthetic/clean', document: feed() },
    { name: 'synthetic/no-license', document: without(feed(), 'license') },
    {
      name: 'synthetic/no-confirmation',
      document: feed({}, [without(place(), 'last_confirmed_at')]),
    },
    {
      name: 'synthetic/pii',
      document: feed({}, [
        place({
          x_example_phone: '+57 300 123 4567',
          confirmed_by: 'Nombre Apellido',
        }),
      ]),
    },
    {
      name: 'synthetic/state-in-name',
      document: feed({}, [place({ name: 'Acopio (cerrado)' })]),
    },
    { name: 'synthetic/duplicates', document: feed({}, [place(), place()]) }
  );
  return cases;
}

async function runInNode(cases: { name: string; document: Json }[]) {
  const results = [];
  for (const testCase of cases) {
    const report = await new Engine({
      validatorVersion: 'parity',
      specVersion: '0.1.0',
      target: testCase.name,
      schemas,
      now: () => new Date('2026-08-16T00:00:00.000Z'),
    })
      .register(schemaPass, semanticPass, denyPass)
      .run(testCase.document);
    results.push({ name: testCase.name, report });
  }
  return results;
}

async function runInSandbox(
  cases: { name: string; document: Json }[]
): Promise<{
  results: { name: string; report: Report }[];
  strippedGlobals: string[];
}> {
  const payload = JSON.stringify(cases.map((c) => ({ ...c, schemas })));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SANDBOX], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => {
      out += d;
    });
    child.stderr.on('data', (d) => {
      err += d;
    });
    child.on('close', (code) => {
      if (code !== 0)
        return reject(new Error(`sandbox exited ${code}: ${err}`));
      try {
        resolve(JSON.parse(out));
      } catch (error) {
        reject(new Error(`sandbox output was not JSON: ${out.slice(0, 200)}`));
      }
    });
    child.stdin.end(payload);
  });
}

describe('Node ↔ Workers-shaped runtime parity', () => {
  it('the sandbox really removes the Node surface', async () => {
    const { strippedGlobals } = await runInSandbox([
      { name: 'probe', document: feed() },
    ]);
    expect(strippedGlobals).toEqual(
      expect.arrayContaining(['process', 'Buffer'])
    );
  });

  it('produces byte-identical reports for the whole corpus', async () => {
    const cases = corpus();
    const [nodeResults, sandbox] = await Promise.all([
      runInNode(cases),
      runInSandbox(cases),
    ]);

    expect(sandbox.results).toHaveLength(nodeResults.length);
    for (const [index, nodeResult] of nodeResults.entries()) {
      const other = sandbox.results[index];
      expect(other?.name, `case ${index}`).toBe(nodeResult.name);
      // Byte-identical: serialize both and compare strings, so key ORDER
      // counts too — a report whose fields reorder between runtimes would
      // break diffing and snapshotting for every downstream consumer.
      expect(
        JSON.stringify(other?.report),
        `report mismatch for ${nodeResult.name}`
      ).toBe(JSON.stringify(nodeResult.report));
    }
  }, 30000);

  it('the corpus actually exercises errors, warnings and clean runs', async () => {
    const results = await runInNode(corpus());
    const totals = results.reduce(
      (acc, r) => ({
        errors: acc.errors + r.report.summary.errors,
        warnings: acc.warnings + r.report.summary.warnings,
        clean: acc.clean + (r.report.summary.errors === 0 ? 1 : 0),
      }),
      { errors: 0, warnings: 0, clean: 0 }
    );
    expect(totals.errors).toBeGreaterThan(3);
    expect(totals.warnings).toBeGreaterThan(3);
    expect(totals.clean).toBeGreaterThan(1);
  });
});
