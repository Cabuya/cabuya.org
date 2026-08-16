/**
 * The Workers-shaped sandbox harness.
 *
 * **Why this and not workerd.** The parity property worth protecting is:
 * *the same core bundle produces the same report in Node and in the Workers
 * runtime*, because that is what makes "the badge measures what the CLI
 * said" true. The ideal harness is `workerd` (via wrangler/miniflare), but
 * it is a large, platform-specific native dependency that this repository
 * does not otherwise need — adding it for one test would tax every clone
 * and every CI run.
 *
 * So this harness reproduces the part of workerd that can actually break
 * the property: **the absence of Node's runtime surface**. It does its
 * Node-side work first (read stdin, capture stdout), then makes
 * `process`, `Buffer`, `require`, `__dirname` and `__filename` throw on
 * access, and only THEN imports the built core. If the core silently
 * depended on any Node API, it throws here rather than in production.
 *
 * Explicitly NOT reproduced: workerd's V8 isolate semantics, CPU/memory
 * limits, or its own `fetch` implementation. Those are out of scope for
 * this harness and stated rather than implied. Combined with the
 * build-output purity grep (static) and byte-identical report comparison
 * (behavioral), this is the strongest evidence available without the
 * dependency. When the Pages Function ships (Task 27), the upgrade path is
 * to point this same corpus at `wrangler dev --local` and keep the
 * assertions unchanged.
 *
 * Protocol: a JSON array of cases on stdin → `{results, strippedGlobals}`
 * on stdout. The sandbox never touches the filesystem — fixtures arrive on
 * stdin, because a sandbox that could read files would not be testing the
 * constraint it claims to test.
 */

// ── phase 1: Node-side I/O, captured before the surface is removed ──
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = Buffer.concat(chunks).toString('utf-8');
// Capture the STREAM OBJECT, not a reference to `process` — a closure that
// dereferences `process` at call time would trip the very trap installed
// below. (It did, on the first run: the harness caught its own harness.)
const stdout = process.stdout;
const write = (text) => stdout.write(text);

// ── phase 2: remove the Node surface ──
const NODE_GLOBALS = [
  'process',
  'Buffer',
  'require',
  '__dirname',
  '__filename',
];
const stripped = [];
for (const name of NODE_GLOBALS) {
  try {
    Object.defineProperty(globalThis, name, {
      get() {
        throw new Error(
          `the validator core touched Node-only global "${name}" — the core must run unchanged in Workers`
        );
      },
      configurable: true,
    });
    stripped.push(name);
  } catch {
    // Non-configurable globals cannot be trapped here; the static purity
    // grep in purity.test.ts covers those. Recorded, not silently ignored.
  }
}

// ── phase 3: run the corpus through the core ──
const cases = JSON.parse(input);
const { Engine } = await import('../../dist/index.js');
const { schemaPass } = await import('../../dist/passes/schema.js');
const { semanticPass } = await import('../../dist/passes/semantic.js');
const { denyPass } = await import('../../dist/passes/deny.js');

const results = [];
for (const testCase of cases) {
  const report = await new Engine({
    validatorVersion: 'parity',
    specVersion: '0.1.0',
    target: testCase.name,
    schemas: testCase.schemas,
    now: () => new Date('2026-08-16T00:00:00.000Z'),
  })
    .register(schemaPass, semanticPass, denyPass)
    .run(testCase.document, testCase.raw);
  results.push({ name: testCase.name, report });
}

write(JSON.stringify({ results, strippedGlobals: stripped }));
