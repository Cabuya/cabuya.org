#!/usr/bin/env node

/**
 * `retention:check` — the validator endpoint must not keep anything.
 *
 * The promise on `/developers/validator` and in `docs/SECURITY.md` is that a
 * document submitted for validation is fetched, checked, and forgotten. That
 * promise is worth exactly as much as the code behind it, and the usual way it
 * breaks is not a design change — it is a `console.log` somebody added while
 * debugging and did not remove, quietly writing publisher URLs into a log
 * retained by the platform.
 *
 * So this greps the Function for the ways state escapes:
 *
 *   - any `console.*` call,
 *   - KV writes to keys other than the two rate counters,
 *   - any other storage binding,
 *   - an analytics call.
 *
 * A grep, and honest about it: it cannot prove the absence of retention, only
 * the absence of its common shapes. The design argument — there is nowhere to
 * put a document — lives in the file's own header, and this stops that
 * argument being quietly falsified.
 *
 * Usage: node scripts/check-no-retention.mjs [--strict]
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const strict = process.argv.includes('--strict');

/**
 * Files that carry the zero-retention promise.
 *
 * `contact.ts` matters here as much as the validator does, and arguably more:
 * its message field is free text, somebody writing to an aid protocol may put
 * something sensitive in it, and the safest place for that text is nowhere.
 */
const GUARDED = [
  'functions/api/validate.ts',
  'functions/mcp.ts',
  'functions/lib/ssrf-guard.ts',
  'functions/api/contact.ts',
];

/** The only keys the endpoint may write. */
const ALLOWED_KEY_PREFIXES = ['rate:ip:', 'rate:host:'];

const findings = [];

console.log('🔍 retention:check — the validator keeps nothing\n');

for (const relative of GUARDED) {
  const path = join(ROOT, relative);
  if (!existsSync(path)) {
    findings.push(`${relative}: file not found`);
    continue;
  }
  const source = readFileSync(path, 'utf-8');
  const lines = source.split('\n');

  lines.forEach((line, index) => {
    const at = `${relative}:${index + 1}`;
    // Comments are where the reasoning lives; they are not code.
    const code = line.replace(/^\s*(\/\/|\*|\/\*).*$/, '');

    if (/\bconsole\.\w+\(/.test(code)) {
      findings.push(`${at}: console call — logs are retention`);
    }
    if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(code)) {
      findings.push(`${at}: browser storage in a server function`);
    }
    if (/\b(D1|R2|DURABLE|Durable|\.bucket|\.database)\b/.test(code)) {
      findings.push(`${at}: a storage binding other than the rate counters`);
    }
    if (/trackEvent|umami|analytics/i.test(code)) {
      findings.push(`${at}: analytics in the validation path`);
    }

    // Every KV write must target an allowed key.
    const put = code.match(/\.put\(\s*[`'"]?([^`'",)]*)/);
    if (put) {
      const key = put[1];
      const templated = key.includes('${') || key.startsWith('rate:');
      const allowed =
        ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
        (templated && key.startsWith('rate:'));
      if (!allowed) {
        findings.push(
          `${at}: KV write to "${key}" — only rate counters allowed`
        );
      }
    }
  });

  // The response must forbid caching: an intermediary holding a report is
  // retention by a different party.
  if (
    /(validate|contact)\.ts$/.test(relative) &&
    !source.includes("'Cache-Control': 'no-store'")
  ) {
    findings.push(`${relative}: responses must set Cache-Control: no-store`);
  }
}

if (findings.length === 0) {
  console.log(
    `  ✓ ${GUARDED.length} file(s) clean — no logging, no storage beyond the two rate counters`
  );
  console.log('\n✅ retention:check clean');
  process.exit(0);
}

for (const finding of findings) console.error(`  ✗ ${finding}`);
console.error(`\n❌ retention:check found ${findings.length} problem(s)`);
process.exit(strict ? 1 : 0);
