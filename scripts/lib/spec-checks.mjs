/**
 * The testable core of the `spec:check` and `spec:boundary` gates.
 *
 * `check-spec.mjs` and `check-spec-boundary.mjs` are thin runners around
 * these functions; `tests/unit/scripts/spec-gates.test.ts` exercises them
 * against fixtures so a gate regression is a failing unit test, not a
 * production surprise.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// ── spec:check ────────────────────────────────────────────

/** The canonical $id shape (recorded in Task 9): absolute + version-matched. */
export function expectedSchemaId(version, filename) {
  return `https://cabuya.org/schemas/${version}/${filename}`;
}

export function newAjv() {
  const ajv = new Ajv2020({ strict: false, allErrors: true, $data: true });
  addFormats(ajv);
  return ajv;
}

/**
 * Decide which schema validates an example. Convention: manifests name
 * themselves via a `protocol` root member; feeds carry `data.places`.
 */
export function schemaKeyForExample(example) {
  if (example && typeof example === 'object') {
    if ('protocol' in example) return 'manifest.schema.json';
    if ('data' in example) return 'place-feed.schema.json';
  }
  return 'place-feed.schema.json';
}

/**
 * Validate one spec version directory. Returns a findings array; empty means
 * green. Pure with respect to process state — paths in, findings out.
 */
export function checkSpecVersion(specDir, version) {
  const findings = [];
  const schemaDir = join(specDir, 'schemas', version);
  const examplesDir = join(specDir, 'examples', version);

  const ajv = newAjv();
  const validators = {};

  for (const file of readdirSync(schemaDir).filter((f) =>
    f.endsWith('.json')
  )) {
    const path = join(schemaDir, file);
    let schema;
    try {
      schema = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (error) {
      findings.push({
        check: 'schema-parse',
        file: path,
        message: `does not parse: ${error.message}`,
      });
      continue;
    }
    const expected = expectedSchemaId(version, file);
    if (schema.$id !== expected) {
      findings.push({
        check: 'schema-id',
        file: path,
        message: `$id is "${schema.$id}", expected "${expected}" (B5: absolute + version-matched)`,
      });
    }
    try {
      validators[file] = ajv.compile(schema);
    } catch (error) {
      findings.push({
        check: 'schema-compile',
        file: path,
        message: `does not compile as JSON Schema 2020-12: ${error.message}`,
      });
    }
  }

  const validate = (example) => {
    const key = schemaKeyForExample(example);
    const validator = validators[key];
    if (!validator) return { ok: false, errors: [`no validator for ${key}`] };
    const ok = validator(example);
    return {
      ok,
      errors: (validator.errors ?? []).map(
        (e) => `${e.instancePath || '/'} ${e.message}`
      ),
    };
  };

  for (const [folder, mustBeValid] of [
    ['valid', true],
    ['invalid', false],
  ]) {
    const dir = join(examplesDir, folder);
    if (!existsSync(dir)) {
      findings.push({
        check: 'examples-missing',
        file: dir,
        message: 'examples folder missing',
      });
      continue;
    }
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const path = join(dir, file);
      let example;
      try {
        example = JSON.parse(readFileSync(path, 'utf-8'));
      } catch (error) {
        findings.push({
          check: 'example-parse',
          file: path,
          message: `does not parse: ${error.message}`,
        });
        continue;
      }
      const { ok, errors } = validate(example);
      if (mustBeValid && !ok) {
        findings.push({
          check: 'valid-example-fails',
          file: path,
          message: `valid example fails schema validation: ${errors.slice(0, 3).join('; ')}`,
        });
      }
      if (!mustBeValid) {
        // The invalid examples are designed to fail SOMEWHERE in the
        // validator pipeline — not necessarily at the schema pass. Semantic,
        // PII and behavioral violations legitimately pass the schema and are
        // caught by later passes (Task 16 asserts the exact check ids once
        // the validator exists). The schema-level contract here is therefore:
        //   fails the schema  OR  carries a $comment naming its designed
        //   violation for a later pass.
        const raw = JSON.stringify(example);
        const hasComment = raw.includes('"$comment"');
        if (!hasComment) {
          findings.push({
            check: 'invalid-example-no-comment',
            file: path,
            message:
              'invalid example carries no $comment teaching note (the designed message)',
          });
        } else if (ok && !/INVALID/.test(raw)) {
          findings.push({
            check: 'invalid-example-undeclared',
            file: path,
            message:
              'passes the schema and its $comment does not declare the designed violation (expected an "INVALID — WHY" note)',
          });
        }
      }
    }
  }

  return findings;
}

/** Enumerate versions in a spec dir (schemas/{v}/ presence is the marker). */
export function specVersions(specDir) {
  const dir = join(specDir, 'schemas');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((v) => statSync(join(dir, v)).isDirectory());
}

// ── spec:boundary (B1–B7) ─────────────────────────────────

const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.txt', '.jsonl']);
const ALLOWED_BARE = new Set(['LICENSE', 'CODEOWNERS', '.gitkeep']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** B4: extension allowlist. */
export function checkExtensions(dir) {
  const findings = [];
  for (const file of walk(dir)) {
    const name = basename(file);
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
    if (ALLOWED_BARE.has(name)) continue;
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      findings.push({
        check: 'B4-extension',
        file,
        message: `disallowed file type "${ext || name}" inside a bounded directory`,
      });
    }
    if (name === 'package.json') {
      findings.push({
        check: 'B4-build-file',
        file,
        message: 'bounded directories carry no build configuration',
      });
    }
  }
  return findings;
}

/**
 * B1: no imports / requires / @/ references. Markdown code fences and JSON
 * string values legitimately *mention* import syntax when teaching — the scan
 * therefore targets only unambiguous module-resolution forms.
 */
const B1_PATTERNS = [
  /^\s*import\s.+\sfrom\s+['"]/m,
  /\brequire\(\s*['"]/,
  /from\s+['"]@\//,
];

export function checkNoImports(dir) {
  const findings = [];
  for (const file of walk(dir)) {
    if (!file.endsWith('.md')) continue; // JSON cannot import
    const content = readFileSync(file, 'utf-8');
    // Strip fenced code blocks — teaching examples may show code.
    const stripped = content.replace(/```[\s\S]*?```/g, '');
    for (const pattern of B1_PATTERNS) {
      if (pattern.test(stripped)) {
        findings.push({
          check: 'B1-import',
          file,
          message: `module reference outside a code fence (${pattern})`,
        });
        break;
      }
    }
  }
  return findings;
}

/**
 * B2: site code references bounded dirs only through the loader modules.
 * `allowedFiles` are repo-relative paths permitted to match.
 */
export function checkLoaderBoundary(
  srcDirs,
  boundedNames,
  allowedFiles,
  root = process.cwd()
) {
  const findings = [];
  const pattern = new RegExp(
    `['"\`](?:\\.\\./)*(?:${boundedNames.join('|')})/`,
    ''
  );
  for (const srcDir of srcDirs) {
    if (!existsSync(join(root, srcDir))) continue;
    for (const file of walk(join(root, srcDir))) {
      if (!/\.(ts|mjs|js|astro|svelte)$/.test(file)) continue;
      const rel = relative(root, file);
      if (allowedFiles.includes(rel)) continue;
      const content = readFileSync(file, 'utf-8');
      if (pattern.test(content)) {
        findings.push({
          check: 'B2-loader',
          file: rel,
          message: `references a bounded directory directly — only ${allowedFiles.join(', ')} may`,
        });
      }
    }
  }
  return findings;
}

/** B3: required files present; CODEOWNERS covers the directory. */
export function checkRequiredFiles(dir, codeownersPath, ownedPath) {
  const findings = [];
  for (const required of ['LICENSE', 'README.md']) {
    if (!existsSync(join(dir, required))) {
      findings.push({
        check: 'B3-file',
        file: join(dir, required),
        message: 'required file missing',
      });
    }
  }
  if (existsSync(codeownersPath)) {
    const codeowners = readFileSync(codeownersPath, 'utf-8');
    if (!codeowners.includes(ownedPath)) {
      findings.push({
        check: 'B3-codeowners',
        file: codeownersPath,
        message: `no CODEOWNERS entry for ${ownedPath}`,
      });
    }
  } else {
    findings.push({
      check: 'B3-codeowners',
      file: codeownersPath,
      message: 'CODEOWNERS file missing',
    });
  }
  return findings;
}

// ── B7: PII deny patterns ─────────────────────────────────

/**
 * Findings quote file + JSON-pointer-ish location, NEVER the matched value —
 * the same non-echo rule the validator itself obeys.
 */
const PII_PATTERNS = [
  {
    name: 'email-address',
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    name: 'colombian-mobile',
    re: /(?<!\d)3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g,
  },
  {
    name: 'intl-phone',
    re: /\+\d{1,3}[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{4}/g,
  },
  { name: 'whatsapp-link', re: /wa\.me\/\d+/g },
];

/**
 * Allowlist for *designed* synthetic fixtures: the invalid teaching examples
 * exist to demonstrate PII violations and use obviously fictitious values.
 */
const PII_FILE_ALLOWLIST = /invalid-2-contact-and-personal-data\.json$/;

/** Org-level role addresses documented as publishable. */
const ORG_LOCAL_PARTS =
  /^(info|team|equipo|contacto|contact|hola|hello|hi|soporte|support|admin|maintainers|security|conduct|press|prensa)@/i;

export function checkPii(dir) {
  const findings = [];
  for (const file of walk(dir)) {
    if (PII_FILE_ALLOWLIST.test(file)) continue;
    const content = readFileSync(file, 'utf-8');
    for (const { name, re } of PII_PATTERNS) {
      re.lastIndex = 0;
      for (const match of content.matchAll(re)) {
        if (name === 'email-address' && ORG_LOCAL_PARTS.test(match[0])) {
          continue;
        }
        const line = content.slice(0, match.index).split('\n').length;
        findings.push({
          check: 'B7-pii',
          file,
          message: `${name} pattern at line ${line} (value not echoed)`,
        });
      }
    }
  }
  return findings;
}
