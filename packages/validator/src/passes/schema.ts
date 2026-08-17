/**
 * Pass 4 — SCHEMA.
 *
 * Compiles the injected JSON Schemas (2020-12) and maps Ajv errors into
 * findings. **No Ajv message ever reaches a finding raw**: Ajv says
 * `must have required property 'license'`, which tells an implementer
 * nothing about why or what to do. Every error is re-authored under the
 * seven message rules — located, ruled, fixed imperatively, with a minimal
 * patch where the fix is mechanical.
 *
 * Errors are attributed to the most specific catalogue check that owns the
 * failing path (ENV003 for a missing licence, REC001 for a missing
 * confirmation key, …) so the report's ids match the documentation and the
 * fix loop can look them up. Anything unmapped falls back to SCH001.
 */

import type { ErrorObject, ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { getCheck } from '../checks.js';
import type { Pass, PassContext } from '../engine.js';
// Generated. See scripts/build-standalone.mjs.
import { PRECOMPILED } from '../generated/index.js';
import { locatePointer } from '../locate.js';
import type { Finding, Level, Severity } from '../report.js';

/** Which schema validates the document at hand. */
export function schemaNameFor(document: unknown): string {
  if (document && typeof document === 'object') {
    if ('protocol' in document) return 'manifest.schema.json';
  }
  return 'place-feed.schema.json';
}

/**
 * Map a failing instance path + keyword to the catalogue check that owns it.
 *
 * The mapping is deliberately explicit rather than clever: an implementer
 * reading `ENV003` in CI must find exactly that id on the docs page, and a
 * silent regex drift would break that contract without failing a test.
 */
export function checkIdForSchemaError(
  error: ErrorObject,
  documentKind: 'feed' | 'manifest' = 'feed'
): string {
  const path = error.instancePath;
  const missing =
    error.keyword === 'required'
      ? (error.params as { missingProperty?: string }).missingProperty
      : undefined;

  // A manifest failure is DSC005 wherever it occurs. Without this branch a
  // missing `publisher` would be reported as ENV001 — a FEED envelope check
  // id — which is exactly the kind of mislabelling that makes an
  // implementer distrust the whole report. (Caught by the corpus
  // completeness test rather than by a reader in production.)
  if (documentKind === 'manifest') return 'DSC005';

  // Envelope-level requirements
  if (path === '' && missing) {
    switch (missing) {
      case 'license':
        return 'ENV003';
      case 'last_updated':
      case 'ttl':
      case 'version':
      case 'publisher_id':
      case 'data':
        return 'ENV001';
      default:
        return 'ENV001';
    }
  }
  if (/^\/(last_updated)$/.test(path)) return 'ENV002';
  if (/^\/(ttl)$/.test(path)) return 'ENV008';
  if (/^\/(version)$/.test(path)) return 'ENV006';
  if (/^\/(license)$/.test(path)) return 'ENV003';
  if (/^\/(permitted_use)/.test(path)) return 'ENV005';
  if (/^\/(publisher_id)$/.test(path)) return 'ENV001';

  // Record-level requirements
  if (/^\/data\/places\/\d+$/.test(path) && missing) {
    switch (missing) {
      case 'last_confirmed_at':
        return 'REC001';
      case 'public_url':
        return 'REC006';
      case 'place_kind':
        return 'REC007';
      case 'source':
        return 'REC009';
      case 'id':
      case 'publisher_id':
        return 'REC002';
      default:
        return 'SCH001';
    }
  }
  if (/\/last_confirmed_at$/.test(path)) return 'REC001';
  if (/\/public_url$/.test(path)) return 'REC006';
  if (/\/place_kind$/.test(path)) return 'REC007';
  if (/\/municipality_code$/.test(path)) return 'REC008';
  if (/\/source(\/|$)/.test(path)) return 'REC009';
  if (/\/same_as(\/|$)/.test(path)) return 'REC014';
  if (/\/(lat|lon|address_text)$/.test(path)) return 'REC004';
  if (/\/id$/.test(path)) return 'REC002';

  return 'SCH001';
}

/**
 * Re-author an Ajv error as a human (and agent) actionable message.
 * Returns `{ message, fix, patch }` — the `rule` comes from the catalogue.
 */
export function authorMessage(error: ErrorObject): {
  message: string;
  fix: string;
  patch?: Finding['suggested_patch'];
} {
  const path = error.instancePath || '(document root)';
  const params = error.params as Record<string, unknown>;

  switch (error.keyword) {
    case 'required': {
      const property = String(params.missingProperty);
      // The single most important message in the whole validator: it names
      // the honest alternative so an agent cannot "fix" the error by
      // inventing a confirmation timestamp.
      if (property === 'last_confirmed_at') {
        return {
          message: `${path}: required property 'last_confirmed_at' is missing (did you mean to publish last_confirmed_at: null?)`,
          fix: 'Add "last_confirmed_at": null, or the timestamp of the last real confirmation. Never invent one.',
          patch: {
            op: 'add',
            path: `${error.instancePath}/last_confirmed_at`,
            value: null,
          },
        };
      }
      return {
        message: `${path}: required property '${property}' is missing`,
        fix: `Add "${property}" to this object.`,
      };
    }

    case 'enum': {
      const allowed = (params.allowedValues as unknown[]) ?? [];
      return {
        message: `${path}: value is outside the allowed set`,
        fix: `Use one of: ${allowed.map((v) => JSON.stringify(v)).join(' | ')}.`,
      };
    }

    case 'type':
      return {
        message: `${path}: wrong type (expected ${String(params.type)})`,
        fix: `Emit this member as ${String(params.type)}.`,
      };

    case 'pattern':
      return {
        message: `${path}: value does not match the required shape`,
        fix: `Match the documented pattern: ${String(params.pattern)}.`,
      };

    case 'format':
      return {
        message: `${path}: not a valid ${String(params.format)}`,
        fix: `Emit an RFC-conformant ${String(params.format)} value.`,
      };

    case 'minimum':
    case 'maximum':
      return {
        message: `${path}: value out of range (${error.message ?? ''})`.trim(),
        fix: 'Bring the value inside the documented range.',
      };

    default:
      return {
        message: `${path}: ${error.message ?? 'schema violation'}`,
        fix: 'Correct the value so it satisfies the schema.',
      };
  }
}

const FALLBACK: { severity: Severity; level: Level; rule: string } = {
  severity: 'error',
  level: 'L2',
  rule: 'The document MUST conform to its published JSON Schema.',
};

/** Convert one Ajv error into a Finding. */
export function findingFor(
  error: ErrorObject,
  raw?: string,
  documentKind: 'feed' | 'manifest' = 'feed'
): Finding {
  const id = checkIdForSchemaError(error, documentKind);
  const check = getCheck(id);
  const { message, fix, patch } = authorMessage(error);
  const pointer = error.instancePath || '';

  return {
    id,
    severity: check?.severity ?? FALLBACK.severity,
    level: check?.level ?? FALLBACK.level,
    pointer,
    location: raw ? locatePointer(raw, pointer) : undefined,
    message,
    rule: check?.rule ?? FALLBACK.rule,
    fix,
    ...(patch ? { suggested_patch: patch } : {}),
    spec:
      check?.specAnchor ??
      'https://cabuya.org/developers/spec/0.1/3-the-feed#3-1',
    docs: `https://cabuya.org/developers/validator/checks#${id}`,
  };
}

/**
 * Resolve a validator for a schema, without calling `new Function` when we can
 * avoid it.
 *
 * Ajv compiles by generating JavaScript source and evaluating it. That is
 * forbidden by any Content-Security-Policy without `'unsafe-eval'`, and this
 * engine runs in the browser on the validator page — where it failed with
 * "Error compiling schema" in the console and nothing visible on the page.
 *
 * So the precompiled validators (`scripts/build-standalone.mjs`) are preferred,
 * and runtime compilation remains the fallback for two cases that are both
 * legitimate: a harness injecting a schema this build did not precompile, and
 * Node, which has no CSP.
 *
 * The `$id` match is what makes the preference safe. A precompiled validator
 * for a *different* version of the schema would enforce yesterday's rules while
 * the harness believes it injected today's — so it is used only when the
 * injected schema is the one it was built from.
 */
function compile(
  schemas: Record<string, unknown>,
  name: string
): ValidateFunction | undefined {
  const schema = schemas[name];
  if (!schema) return undefined;

  const precompiled = PRECOMPILED[name];
  const injectedId = (schema as { $id?: string }).$id;
  if (precompiled && injectedId && precompiled.$id === injectedId) {
    return precompiled.validate as ValidateFunction;
  }

  const ajv = new Ajv2020({ strict: false, allErrors: true, $data: true });
  addFormats(ajv);
  return ajv.compile(schema as object);
}

export const schemaPass: Pass = {
  name: 'schema',
  run(context: PassContext): Finding[] {
    const name = schemaNameFor(context.document);
    const validate = compile(context.schemas, name);
    if (!validate) {
      // A missing schema is a harness bug, not a publisher defect — say so
      // rather than reporting a false conformance failure.
      throw new Error(
        `schema "${name}" was not injected into the engine — the harness must supply it`
      );
    }
    if (validate(context.document)) return [];
    const documentKind = name === 'manifest.schema.json' ? 'manifest' : 'feed';
    return (validate.errors ?? []).map((error) =>
      findingFor(error, context.raw, documentKind)
    );
  },
};
