/**
 * Precompile the JSON Schemas into standalone validator functions.
 *
 *   node scripts/build-standalone.mjs           # regenerate
 *   node scripts/build-standalone.mjs --check   # fail if out of date
 *
 * ## Why
 *
 * Ajv compiles a schema by building JavaScript source and calling
 * `new Function` on it. That is fast and correct, and it is forbidden by any
 * Content-Security-Policy without `'unsafe-eval'`.
 *
 * The site ships such a policy. Without this, the validator's browser paste
 * mode fails with "Error compiling schema" in the console and *nothing else* —
 * no visible error, no report, no CSP violation event. The page simply does
 * nothing when you press the button, which is the worst possible failure for
 * the one page whose entire purpose is to measure things honestly.
 *
 * The alternative was adding `'unsafe-eval'` to the policy. That would let any
 * injected string become executable code — on the page where users paste data
 * — to save a build step. Precompiling is the trade every CSP-constrained
 * project makes, and Ajv ships it for exactly this reason.
 *
 * ## The contract
 *
 * The generated module is committed, and `--check` fails CI when it no longer
 * matches the schemas it was generated from. A stale precompiled validator
 * would enforce yesterday's schema while the repository claims today's — which
 * is the same class of problem as a hand-edited vendored spec, and gets the
 * same treatment.
 *
 * Node keeps using runtime compilation: the CLI has no CSP, and falling back
 * there means one less thing that can be subtly stale in the harness people
 * use most.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE = join(HERE, '..');
const SPEC_SCHEMAS = join(PACKAGE, '..', '..', 'spec', 'schemas', '0.1');
const OUT_DIR = join(PACKAGE, 'src', 'generated');

const HEADER = `/**
 * GENERATED — do not edit.
 *
 * Written by scripts/build-standalone.mjs from spec/schemas/0.1/*.json.
 * Regenerate with:  node scripts/build-standalone.mjs
 *
 * An Ajv validator compiled ahead of time, so the browser build never calls
 * \`new Function\` — which a Content-Security-Policy without 'unsafe-eval'
 * forbids, and which otherwise makes the validator page fail silently.
 */
`;

/**
 * Ajv's `esm: true` emits `export`, but its runtime helpers still arrive
 * through CommonJS `require` calls — which throw in a real ES module, so the
 * generated file would fail on import rather than work.
 *
 * There are two in practice (`ajv-formats/dist/formats` and
 * `ajv/dist/runtime/ucs2length`), and which ones appear depends on the schema:
 * the manifest needs only formats, the feed needs both. So this converts every
 * one it finds rather than a hard-coded list — a list would have been correct
 * for the first schema and silently wrong for the second, which is exactly
 * what happened while writing it.
 */
function toEsm(code) {
  const imports = new Map();
  let index = 0;

  const converted = code.replace(/require\((["'])([^"']+)\1\)/g, (_match, _quote, path) => {
    if (!imports.has(path)) {
      imports.set(path, `_cjs${index++}`);
    }
    return imports.get(path);
  });

  const header = [...imports]
    .map(([path, name]) => {
      // Node's ESM resolver needs the extension that CommonJS inferred.
      const specifier = /\.[a-z]+$/.test(path) ? path : `${path}.js`;
      return `import * as ${name}_ns from '${specifier}';\nconst ${name} = _interop(${name}_ns);`;
    })
    .join('\n');

  // `require(x)` returns the exports object, and the two runtimes this code has
  // to work in disagree about where that ends up:
  //
  //   Node  — `ns.default` is the exports object, so `ns.default.default` is
  //           the function ucs2length exports.
  //   Vite  — interop unwraps it, so `ns.default` *is* the function.
  //
  // Binding either one directly works in one runtime and fails in the other
  // with "func1 is not a function" — at validation time, long after the module
  // loaded cleanly. This picks whichever shape actually holds the members the
  // generated code goes on to read.
  const interop = [
    'function _interop(ns) {',
    '  const inner = ns.default;',
    '  if (inner && typeof inner === \'object\' && !Array.isArray(inner)) return inner;',
    '  return ns;',
    '}',
  ].join('\n');

  return header ? `${header}\n${interop}\n${converted}` : converted;
}

function schemaFiles() {
  return readdirSync(SPEC_SCHEMAS)
    .filter((name) => name.endsWith('.schema.json'))
    .sort();
}

/**
 * One module per schema, plus an index.
 *
 * Not one concatenated file: Ajv's generated code declares module-scoped
 * names like `validate20` and `schema48`, and two schemas' output collide on
 * them. Concatenation produced a file that parsed and then referenced an
 * identifier before its definition — broken in a way that looked like a
 * bundler problem.
 */
function generate() {
  const modules = new Map();
  const entries = [];

  for (const file of schemaFiles()) {
    const schema = JSON.parse(readFileSync(join(SPEC_SCHEMAS, file), 'utf-8'));

    // Same options as the runtime path in passes/schema.ts. If these diverge,
    // the browser and the CLI disagree about what conforms — asserted equal by
    // a test rather than kept in step by memory.
    const ajv = new Ajv2020({
      strict: false,
      allErrors: true,
      $data: true,
      code: { source: true, esm: true },
    });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const moduleName = file.replace(/\.json$/, '.js');
    modules.set(moduleName, HEADER + toEsm(standaloneCode(ajv, validate)));

    entries.push({ file, moduleName, id: schema.$id });
  }

  const index = [
    HEADER,
    ...entries.map(
      ({ moduleName }, i) =>
        `import validate${i} from './${moduleName}';`
    ),
    '',
    '/** Keyed by schema filename, with the $id the validator was built from. */',
    'export const PRECOMPILED = {',
    ...entries.map(
      ({ file, id }, i) =>
        `  ${JSON.stringify(file)}: { $id: ${JSON.stringify(id)}, validate: validate${i} },`
    ),
    '};',
    '',
  ].join('\n');

  modules.set('index.js', index);

  // A hand-written .d.ts would be a third thing to keep in step. This one is
  // generated with the code it describes.
  modules.set(
    'index.d.ts',
    [
      HEADER,
      "import type { ValidateFunction } from 'ajv';",
      '',
      'export interface PrecompiledValidator {',
      '  /** The $id of the schema this was built from. Checked before use. */',
      '  $id: string;',
      '  validate: ValidateFunction;',
      '}',
      '',
      '/** Keyed by schema filename. */',
      'export declare const PRECOMPILED: Record<string, PrecompiledValidator | undefined>;',
      '',
    ].join('\n')
  );

  return modules;
}

function main() {
  if (!existsSync(SPEC_SCHEMAS)) {
    console.error(`no schemas at ${SPEC_SCHEMAS}`);
    return 1;
  }

  const generated = generate();
  const check = process.argv.includes('--check');

  if (check) {
    const stale = [];
    for (const [name, content] of generated) {
      const path = join(OUT_DIR, name);
      const current = existsSync(path) ? readFileSync(path, 'utf-8') : '';
      if (current !== content) stale.push(name);
    }
    if (stale.length === 0) {
      console.log(`✅ precompiled validators match ${schemaFiles().length} schema(s)`);
      return 0;
    }
    console.error(`❌ stale: ${stale.join(', ')}`);
    console.error('   A schema changed and the precompiled validator did not follow,');
    console.error('   so the browser would enforce a different schema than the CLI.');
    console.error('   Run: node packages/validator/scripts/build-standalone.mjs');
    return 1;
  }

  // `tsc` does not copy plain .js through, so the compiled package would
  // import a `generated/` directory that is not there — which surfaces as the
  // CLI exiting 5 (internal error) on every invocation. Mirror into dist when
  // asked, after the compile.
  const targets = [OUT_DIR];
  if (process.argv.includes('--dist')) {
    targets.push(join(PACKAGE, 'dist', 'generated'));
  }

  for (const dir of targets) {
    mkdirSync(dir, { recursive: true });
    for (const [name, content] of generated) {
      writeFileSync(join(dir, name), content);
    }
  }

  console.log(
    `✅ precompiled ${schemaFiles().length} schema(s) → ${targets
      .map((dir) => dir.replace(PACKAGE + '/', ''))
      .join(', ')}`
  );
  return 0;
}

process.exit(main());
