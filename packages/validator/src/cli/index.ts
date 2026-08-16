#!/usr/bin/env node
/**
 * The CLI harness.
 *
 * This is the surface most implementations will be written through, because
 * most implementations will be written by agents running a fix loop. Three
 * design notes worth keeping in view while editing:
 *
 *   - `explain` resolves a check id **without a network round-trip** — the
 *     catalogue ships inside the package, so an offline agent can still
 *     answer "what is REC001?".
 *   - `probe` exists because "my feed is fine locally but the badge is red"
 *     is a transport problem ~90% of the time, and proving that should take
 *     one command.
 *   - `init` exists so the quickstart's copy-paste block is generated from
 *     the same source as everything else, rather than a hand-maintained
 *     snippet that drifts away from the schema.
 *
 * Node APIs are allowed HERE (this is a harness); the core stays pure.
 */

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { CHECKS, getCheck } from '../checks.js';
import { Engine } from '../engine.js';
import {
  EXIT,
  EXIT_MEANING,
  type ExitCode,
  exitCodeFor,
} from '../exit-codes.js';
import { HttpFetcher } from '../fetcher.js';
import { ES, type OutputLanguage, translateFinding } from '../i18n.js';
import { SPEC_VERSION } from '../index.js';
import { parseJson } from '../locate.js';
import { makeBehaviorPass } from '../passes/behavior.js';
import { denyPass } from '../passes/deny.js';
import { schemaPass } from '../passes/schema.js';
import { semanticPass } from '../passes/semantic.js';
import type { Level, Profile, Report } from '../report.js';
import { type Format, render } from '../reporters.js';

const VERSION = '0.1.0';

// ── argument parsing (no dependency — see the README's dependency note) ──

export interface Options {
  command: string;
  target?: string;
  level?: Level;
  profile: Profile;
  format?: Format;
  strict: boolean;
  network: boolean;
  probeTwice: number;
  timeout: number;
  maxBytes: number;
  concurrency: number;
  userAgent?: string;
  lang: OutputLanguage;
  quiet: boolean;
  verbose: boolean;
  help: boolean;
  version: boolean;
  /** Passed to `init`. */
  framework?: string;
  publisherId?: string;
}

const LEVELS = new Set(['L1', 'L2', 'L3', 'L4']);
const FORMATS = new Set(['text', 'json', 'sarif', 'markdown']);

export class UsageError extends Error {}

export function parseArgs(argv: string[]): Options {
  const options: Options = {
    command: '',
    profile: 'core',
    strict: false,
    network: true,
    probeTwice: 3,
    timeout: 8000,
    maxBytes: 5_242_880,
    concurrency: 4,
    lang: 'en',
    quiet: false,
    verbose: false,
    help: false,
    version: false,
  };

  const positional: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] as string;
    const next = (): string => {
      const value = argv[index + 1];
      if (value === undefined) throw new UsageError(`${arg} needs a value`);
      index += 1;
      return value;
    };

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--version':
      case '-V':
        options.version = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--no-network':
        options.network = false;
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--level': {
        const value = next();
        if (!LEVELS.has(value))
          throw new UsageError(`unknown level "${value}"`);
        options.level = value as Level;
        break;
      }
      case '--profile': {
        const value = next();
        if (value !== 'core' && value !== 'extended') {
          throw new UsageError(`unknown profile "${value}"`);
        }
        options.profile = value;
        break;
      }
      case '--format': {
        const value = next();
        if (!FORMATS.has(value))
          throw new UsageError(`unknown format "${value}"`);
        options.format = value as Format;
        break;
      }
      case '--lang': {
        const value = next();
        if (value !== 'en' && value !== 'es') {
          throw new UsageError(`unknown language "${value}" (en|es)`);
        }
        options.lang = value;
        break;
      }
      case '--probe-twice':
        options.probeTwice = Math.max(2, Number(next()));
        break;
      case '--timeout':
        options.timeout = Number(next());
        break;
      case '--max-bytes':
        options.maxBytes = Number(next());
        break;
      case '--concurrency':
        options.concurrency = Number(next());
        break;
      case '--user-agent':
        options.userAgent = next();
        break;
      case '--framework':
        options.framework = next();
        break;
      case '--publisher-id':
        options.publisherId = next();
        break;
      default:
        if (arg.startsWith('-')) throw new UsageError(`unknown flag "${arg}"`);
        positional.push(arg);
    }
  }

  options.command = positional[0] ?? '';
  options.target = positional.slice(1).join(' ') || undefined;
  return options;
}

// ── help ──────────────────────────────────────────────────

export function helpText(): string {
  return `cabuya-validator ${VERSION} — conformance for the Cabuya Protocol (spec ${SPEC_VERSION})

Conformance is measured, never declared.

Usage
  cabuya-validator <command> [target] [flags]

Commands
  validate <url|file|->     Full run: discovery → feed(s) → level determination
  feed <url|file|->         Validate a feed only (skip discovery)
  manifest <url|file|->     Validate a manifest only
  probe <url>               Transport diagnostics only — no schema pass
  explain <check-id>        Print the rule, the fix and the spec anchor (offline)
  checks                    List the whole catalogue
  init                      Emit a minimal manifest + feed skeleton

Flags
  --level L1|L2|L3|L4       Target level (default: the manifest's declared target)
  --profile core|extended   Default: core
  --format text|json|sarif|markdown   Default: text on a TTY, json otherwise
  --lang en|es              Language of message/rule/fix (ids never translate)
  --strict                  Warnings become exit code ${EXIT.WARNINGS_STRICT}
  --no-network              Schema + semantic + PII only; behavioral skipped
  --probe-twice <seconds>   Gap for the always-now probe (default 3, min 2)
  --timeout <ms>            Per request (default 8000)
  --max-bytes <n>           Body cap (default 5242880)
  --concurrency <n>         Across shards/feeds (default 4, per-host serial)
  --user-agent <string>     Override the probe User-Agent
  --framework <name>        init only: emit the SPA-exclusion one-liner
  --publisher-id <id>       init only: your registry publisher id
  --quiet | --verbose | --version | --help

Exit codes
${Object.entries(EXIT_MEANING)
  .map(([code, meaning]) => `  ${code}  ${meaning}`)
  .join('\n')}

Docs: https://cabuya.org/developers/validator
`;
}

// ── input resolution ──────────────────────────────────────

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
}

interface Loaded {
  raw: string;
  document: unknown;
  isUrl: boolean;
}

async function load(target: string, options: Options): Promise<Loaded> {
  if (target === '-') {
    const raw = await readStdin();
    return { raw, document: parseOrThrow(raw), isUrl: false };
  }
  if (/^https?:\/\//.test(target)) {
    const fetcher = new HttpFetcher({
      version: VERSION,
      userAgent: options.userAgent,
    });
    const result = await fetcher.fetch(target, {
      timeoutMs: options.timeout,
      maxBytes: options.maxBytes,
    });
    if (result.transportError) {
      throw new TransportError(result.transportError);
    }
    return {
      raw: result.body,
      document: parseOrThrow(result.body),
      isUrl: true,
    };
  }
  const raw = readFileSync(target, 'utf-8');
  return { raw, document: parseOrThrow(raw), isUrl: false };
}

export class TransportError extends Error {}

function parseOrThrow(raw: string): unknown {
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    throw new TransportError(
      `the response is not valid JSON${
        parsed.location ? ` (line ${parsed.location.line})` : ''
      }: ${parsed.error}`
    );
  }
  return parsed.value;
}

function loadSchemas(): Record<string, unknown> {
  // The core never reads from disk; the CLI harness supplies the schemas it
  // ships with. Resolved relative to this file so a global install works.
  const dir = new URL('../../schemas/', import.meta.url);
  const names = ['manifest.schema.json', 'place-feed.schema.json'];
  const schemas: Record<string, unknown> = {};
  for (const name of names) {
    try {
      schemas[name] = JSON.parse(readFileSync(new URL(name, dir), 'utf-8'));
    } catch {
      // Reported by the schema pass as a harness problem, not a feed defect.
    }
  }
  return schemas;
}

// ── commands ──────────────────────────────────────────────

export async function runValidation(
  options: Options,
  io: { out: (text: string) => void; err: (text: string) => void }
): Promise<ExitCode> {
  if (!options.target) {
    throw new UsageError(`${options.command} needs a target (url, file or -)`);
  }
  const { raw, document, isUrl } = await load(options.target, options);

  const fetcher =
    options.network && isUrl
      ? new HttpFetcher({ version: VERSION, userAgent: options.userAgent })
      : undefined;

  const engine = new Engine({
    validatorVersion: VERSION,
    specVersion: SPEC_VERSION,
    target: options.target,
    profile: options.profile,
    requestedLevel: options.level ?? null,
    schemas: loadSchemas(),
    fetcher,
  });

  if (options.command !== 'probe') {
    engine.register(schemaPass, semanticPass, denyPass);
  }
  if (fetcher) {
    engine.register(
      makeBehaviorPass({ probeTwiceSeconds: options.probeTwice })
    );
  }

  const report = await engine.run(document, raw);
  emit(report, options, io);
  return exitCodeFor(report, options.strict);
}

function emit(
  report: Report,
  options: Options,
  io: { out: (text: string) => void }
): void {
  const isTty = Boolean(process.stdout.isTTY);
  const format: Format = options.format ?? (isTty ? 'text' : 'json');
  // Translate the REPORT, not each renderer's output: the JSON format is
  // what CI and the agent skill parse, so a translation that only reached
  // the human-facing formats would leave half the consumers in English
  // while the terminal said otherwise.
  const localized: Report =
    options.lang === 'en'
      ? report
      : {
          ...report,
          findings: report.findings.map((f) =>
            translateFinding(f, options.lang)
          ),
        };
  io.out(
    render(localized, format, {
      color: isTty && format === 'text',
      quiet: options.quiet,
      verbose: options.verbose,
    })
  );
}

export function explain(id: string, lang: OutputLanguage): string {
  const check = getCheck(id.toUpperCase());
  if (!check) {
    const known = CHECKS.map((c) => c.id).filter((c) =>
      c.startsWith(id.slice(0, 3).toUpperCase())
    );
    return `Unknown check "${id}".${
      known.length > 0 ? ` Did you mean: ${known.slice(0, 6).join(', ')}?` : ''
    }\n`;
  }
  const es = ES[check.id];
  const rule = lang === 'es' ? (es?.rule ?? check.rule) : check.rule;
  const fix = lang === 'es' ? (es?.fix ?? '') : '';
  return [
    `${check.id} — ${check.title}`,
    '',
    `  severity: ${check.severity}    level: ${check.level}    family: ${check.family}`,
    `  status:   ${check.implemented ? 'implemented' : `catalogued (${check.plannedIn ?? 'planned'})`}`,
    '',
    `  rule: ${rule}`,
    ...(fix ? [`  fix:  ${fix}`] : []),
    '',
    `  spec: ${check.specAnchor}`,
    `  docs: https://cabuya.org/developers/validator/checks#${check.id}`,
    '',
  ].join('\n');
}

export function listChecks(): string {
  const lines = ['id      sev      level  status        title'];
  for (const check of CHECKS) {
    lines.push(
      `${check.id.padEnd(8)}${check.severity.padEnd(9)}${check.level.padEnd(7)}${(check.implemented ? 'implemented' : 'catalogued').padEnd(14)}${check.title}`
    );
  }
  lines.push('');
  lines.push(
    `${CHECKS.filter((c) => c.implemented).length}/${CHECKS.length} implemented — ids are stable forever; catalogued ones are reserved with a plan.`
  );
  return `${lines.join('\n')}\n`;
}

/** The skeleton the quickstart's copy-paste block is generated from. */
export function initOutput(options: Options): string {
  const publisher = options.publisherId ?? 'your-publisher-id';
  const manifest = {
    protocol: { name: 'cabuya', spec_version: SPEC_VERSION },
    publisher: {
      publisher_id: publisher,
      canonical_url: 'https://example.org',
    },
    conformance_target: 'L2',
    license: 'CC-BY-4.0',
    permitted_use: ['display', 'aggregate'],
    feeds: [
      {
        name: 'places',
        url: 'https://example.org/feeds/places.json',
        entity: 'place',
        profile: 'core',
      },
    ],
  };
  const feed = {
    last_updated: '2026-01-01T00:00:00Z',
    ttl: 300,
    version: SPEC_VERSION,
    publisher_id: publisher,
    license: 'CC-BY-4.0',
    permitted_use: ['display', 'aggregate'],
    attribution: 'Your App',
    data: {
      places: [
        {
          id: '1',
          publisher_id: publisher,
          name: 'Coliseo Municipal',
          place_kind: 'shelter',
          municipality_code: '66001',
          address_text: 'Avenida Ejemplo 12-34',
          lat: 4.8133,
          lon: -75.6961,
          lifecycle_status: 'active',
          service_status: 'open',
          // null is the honest "never confirmed" — never invent a timestamp.
          last_confirmed_at: null,
          source: { source_id: publisher },
          public_url: 'https://example.org/places/1',
        },
      ],
    },
  };

  const SPA_EXCLUSIONS: Record<string, string> = {
    nextjs:
      'Next.js: place the file at `public/.well-known/cabuya.json` — it is served before the catch-all.',
    vite: 'Vite/React SPA: place it at `public/.well-known/cabuya.json` and exclude `/.well-known/*` from your rewrite rule.',
    astro: 'Astro: place it at `public/.well-known/cabuya.json`.',
    laravel:
      'Laravel: register the route before the SPA fallback, or place the file under `public/.well-known/`.',
    django:
      'Django: add a static route for `/.well-known/` BEFORE the catch-all urlpattern.',
    static:
      'Static host: upload the file to `/.well-known/cabuya.json` (some hosts hide dot-directories — verify with a request).',
  };

  const lines = [
    '# 1. Save as public/.well-known/cabuya.json',
    JSON.stringify(manifest, null, 2),
    '',
    '# 2. Serve this shape at your feed URL',
    JSON.stringify(feed, null, 2),
    '',
    '# 3. Exclude the manifest path from your SPA catch-all',
  ];
  const hint = options.framework
    ? SPA_EXCLUSIONS[options.framework.toLowerCase()]
    : undefined;
  lines.push(
    hint
      ? `#    ${hint}`
      : `#    Pass --framework <${Object.keys(SPA_EXCLUSIONS).join('|')}> for the one-liner.`
  );
  lines.push('');
  lines.push('# 4. Check it');
  lines.push(
    '#    cabuya-validator validate https://example.org/.well-known/cabuya.json'
  );
  return `${lines.join('\n')}\n`;
}

// ── entry point ───────────────────────────────────────────

export async function main(
  argv: string[],
  io: { out: (t: string) => void; err: (t: string) => void } = {
    out: (t) => process.stdout.write(t),
    err: (t) => process.stderr.write(t),
  }
): Promise<ExitCode> {
  let options: Options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    io.err(`${(error as Error).message}\n\n${helpText()}`);
    return EXIT.USAGE;
  }

  if (options.version) {
    io.out(`${VERSION}\n`);
    return EXIT.OK;
  }
  if (options.help || !options.command) {
    io.out(helpText());
    return EXIT.OK;
  }

  try {
    switch (options.command) {
      case 'validate':
      case 'feed':
      case 'manifest':
      case 'probe':
        return await runValidation(options, io);
      case 'explain':
        if (!options.target) throw new UsageError('explain needs a check id');
        io.out(explain(options.target, options.lang));
        return EXIT.OK;
      case 'checks':
        io.out(listChecks());
        return EXIT.OK;
      case 'init':
        io.out(initOutput(options));
        return EXIT.OK;
      default:
        io.err(`unknown command "${options.command}"\n\n${helpText()}`);
        return EXIT.USAGE;
    }
  } catch (error) {
    if (error instanceof UsageError) {
      io.err(`${error.message}\n`);
      return EXIT.USAGE;
    }
    if (error instanceof TransportError) {
      // Transport, not content: the fix is deployment, not the data.
      io.err(`transport failure: ${error.message}\n`);
      return EXIT.TRANSPORT;
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      io.err(`cannot read ${basename(options.target ?? '')}: no such file\n`);
      return EXIT.USAGE;
    }
    io.err(
      `internal validator error: ${(error as Error).message}\nPlease report it: https://github.com/Cabuya/cabuya.org/issues\n`
    );
    return EXIT.INTERNAL;
  }
}

// Only self-execute when invoked as a binary, so tests can import freely.
if (process.argv[1] && /cabuya-validator|cli[/\\]index/.test(process.argv[1])) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
