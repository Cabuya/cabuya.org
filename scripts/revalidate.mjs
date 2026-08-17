#!/usr/bin/env node

/**
 * The revalidation cron.
 *
 * Every six hours: read the registry, run the validator against each active
 * publisher, and write what it found to KV. This is the only thing in the
 * system that may write a conformance state, and the badge and the registry
 * pages read exactly what it wrote.
 *
 * ## What it will not do
 *
 * It will not decide anything on its own. Every state comes from
 * `scripts/lib/revalidation-state.mjs`, which is a pure function of the
 * previous record and one run's exit code, and which is unit-tested against
 * the transitions that matter — most importantly the two-strike rule that keeps
 * a single bad afternoon off a public badge.
 *
 * It will not hammer anybody. Concurrency 4 across publishers, serial per host,
 * a 30-second budget per publisher, and no retries. A validator that overloads
 * the infrastructure it is measuring has invalidated its own measurement.
 *
 * It will not write history continuously. The daily record is appended by a
 * single bot pull request, so the public record of who was conforming when has
 * a diff, a timestamp and a revert — properties a KV write does not have.
 *
 * ## Running it locally
 *
 *   node scripts/revalidate.mjs --dry-run
 *
 * Prints every transition it would make and writes nothing. With
 * `--fixtures <dir>` it reads run outcomes from a directory of JSON files
 * instead of the network, which is how the state machine is exercised end to
 * end in the test suite without touching anybody's server.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  describeTransition,
  issueAction,
  nextStatus,
  outcomeFromExitCode,
} from './lib/revalidation-state.mjs';

const ROOT = process.cwd();
const argv = process.argv.slice(2);

const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? null : argv[index + 1];
};

const DRY_RUN = flag('dry-run');
const FIXTURES = value('fixtures');
const ONLY = value('only');

/** Budgets. Deliberately conservative — see the header. */
const LIMITS = {
  concurrency: 4,
  perPublisherMs: 30_000,
};

// ── The registry ──────────────────────────────────────────

function activePublishers() {
  const dir = join(ROOT, 'registry/publishers');
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf-8')))
    .filter((entry) => entry.status !== 'archived')
    .filter((entry) => !ONLY || entry.publisher_id === ONLY)
    .sort((a, b) => a.publisher_id.localeCompare(b.publisher_id));
}

// ── Reading the current state ─────────────────────────────

/**
 * The Cloudflare KV REST API, read side.
 *
 * The cron holds a token scoped to write one namespace, which implies read on
 * the same namespace. It is the only credential in the workflow and it is
 * documented in `docs/SECURITY.md` with its scope and rotation note.
 */
async function readStatus(publisherId) {
  const { CF_ACCOUNT_ID, CF_REGISTRY_KV_ID, CF_KV_TOKEN } = process.env;
  if (!CF_ACCOUNT_ID || !CF_REGISTRY_KV_ID || !CF_KV_TOKEN) return null;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_REGISTRY_KV_ID}/values/status:${publisherId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_KV_TOKEN}` },
  });
  if (!response.ok) return null;
  try {
    return JSON.parse(await response.text());
  } catch {
    return null;
  }
}

async function writeStatus(publisherId, status) {
  const { CF_ACCOUNT_ID, CF_REGISTRY_KV_ID, CF_KV_TOKEN } = process.env;
  if (!CF_ACCOUNT_ID || !CF_REGISTRY_KV_ID || !CF_KV_TOKEN) {
    throw new Error('KV credentials are not configured');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_REGISTRY_KV_ID}/values/status:${publisherId}`;
  const body = new FormData();
  body.set('value', JSON.stringify(status));
  body.set('metadata', '{}');

  const response = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${CF_KV_TOKEN}` },
    body,
  });
  if (!response.ok) {
    throw new Error(`KV write failed for ${publisherId}: ${response.status}`);
  }
}

// ── Running the validator ─────────────────────────────────

/**
 * One publisher, one run.
 *
 * The CLI is spawned rather than imported so the cron measures the same binary
 * an adopter runs — including its exit codes, which are the contract the state
 * machine reads. Importing the engine would let the two drift, and the drift
 * would be invisible until a badge said something the CLI does not.
 */
function runValidator(entry) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        join(ROOT, 'packages/validator/dist/cli/index.js'),
        'validate',
        entry.canonical_url,
        '--format',
        'json',
        '--timeout',
        '8000',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stdout = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    // stderr is drained and discarded: it carries progress, and keeping it
    // would mean logging publisher URLs into a CI transcript for no benefit.
    child.stderr.resume();

    const timer = setTimeout(
      () => child.kill('SIGKILL'),
      LIMITS.perPublisherMs
    );

    child.on('close', (code) => {
      clearTimeout(timer);
      let report = null;
      try {
        report = JSON.parse(stdout);
      } catch {
        // A run that produced no parseable report is a transport outcome if the
        // exit code says so, and our bug otherwise.
      }
      resolve({ code: code ?? 5, report });
    });
  });
}

/** A fixture stands in for a run, so the state machine can be exercised offline. */
function readFixture(publisherId) {
  const path = join(ROOT, FIXTURES, `${publisherId}.json`);
  if (!existsSync(path)) return { code: 5, report: null };
  return JSON.parse(readFileSync(path, 'utf-8'));
}

/**
 * How old the feed says its own data is.
 *
 * Read from the report rather than computed here, because the validator has
 * already parsed the envelope and knows which of possibly several feeds is the
 * oldest. Absent when the run never got far enough to see one.
 */
function feedAgeHours(report, now) {
  const lastUpdated = report?.feed?.last_updated ?? report?.last_updated;
  if (!lastUpdated) return undefined;
  const then = Date.parse(lastUpdated);
  if (!Number.isFinite(then)) return undefined;
  return Math.max(0, (now - then) / 3_600_000);
}

function failingChecks(report) {
  const findings = report?.findings ?? [];
  return [
    ...new Set(
      findings
        .filter((finding) => finding.severity === 'error')
        .map((finding) => finding.check)
        .filter(Boolean)
    ),
  ].sort();
}

// ── Concurrency ───────────────────────────────────────────

/**
 * Run `worker` over `items`, at most `limit` at a time.
 *
 * Per-host serialisation falls out of this for free: the registry has one entry
 * per host, so limiting publishers limits hosts. If that ever stops being true
 * this needs a host-keyed queue, and the assertion is stated here rather than
 * assumed silently.
 */
async function mapLimited(items, limit, worker) {
  const results = [];
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    })()
  );

  await Promise.all(runners);
  return results;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const entries = activePublishers();
  const at = new Date().toISOString();
  const nowMs = Date.parse(at);

  console.log(
    `🔁 revalidate — ${entries.length} publisher(s)${DRY_RUN ? ' (dry run)' : ''}\n`
  );

  const specVersion = JSON.parse(
    readFileSync(join(ROOT, 'packages/validator/package.json'), 'utf-8')
  )
    .version.split('.')
    .slice(0, 2)
    .join('.');

  const transitions = await mapLimited(
    entries,
    LIMITS.concurrency,
    async (entry) => {
      const previous = FIXTURES ? null : await readStatus(entry.publisher_id);
      const { code, report } = FIXTURES
        ? readFixture(entry.publisher_id)
        : await runValidator(entry);

      const next = nextStatus(previous, {
        publisherId: entry.publisher_id,
        kind: outcomeFromExitCode(code),
        level: report?.level ?? null,
        failingChecks: failingChecks(report),
        feedAgeHours: feedAgeHours(report, nowMs),
        version: specVersion,
        at,
      });

      return { entry, previous, next, action: issueAction(previous, next) };
    }
  );

  for (const { entry, previous, next, action } of transitions) {
    const label = describeTransition(previous, next);
    const suffix = action === 'none' ? '' : `  [issue: ${action}]`;
    console.log(`  ${entry.publisher_id.padEnd(20)} ${label}${suffix}`);
  }

  if (DRY_RUN) {
    console.log('\n✅ dry run — nothing written');
    return;
  }

  let written = 0;
  for (const { entry, next } of transitions) {
    if (!next) continue;
    await writeStatus(entry.publisher_id, next);
    written += 1;
  }

  /*
   * The history lines are printed rather than committed. Appending them is the
   * job of the workflow's second step, which opens one pull request a day — a
   * public record needs a diff and a reviewer, and a script with a write token
   * has neither.
   */
  console.log('\n--- history ---');
  for (const { entry, next } of transitions) {
    if (!next) continue;
    console.log(
      `${entry.publisher_id}\t${JSON.stringify({
        date: at.slice(0, 10),
        state: next.state,
        level: next.level,
      })}`
    );
  }

  /*
   * The transitions that need a tracker entry, for the workflow's last job. It
   * only opens or comments when this list is non-empty — a job that runs
   * unconditionally would file an issue every six hours saying nothing changed.
   */
  console.log('\n--- issues ---');
  for (const { entry, action } of transitions) {
    if (action === 'none') continue;
    console.log(`${entry.publisher_id}\t${action}`);
  }

  console.log(`\n✅ ${written} status record(s) written`);
}

main().catch((error) => {
  console.error(`❌ revalidate failed: ${error.message}`);
  process.exit(1);
});
