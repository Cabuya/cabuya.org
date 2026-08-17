/**
 * Compute the script-src hashes for the shipped Content-Security-Policy.
 *
 *   node scripts/generate-csp.mjs          # rewrite dist/_headers
 *   node scripts/generate-csp.mjs --check  # fail if it is out of date
 *
 * ## Why this is generated rather than written
 *
 * The policy has to name a SHA-256 for every inline script the site actually
 * ships, and Astro emits inline bootstraps for islands whose contents change
 * whenever the island does. A hand-maintained list would be correct on the day
 * it was written and silently wrong afterwards — and "silently wrong" here
 * means either a broken site or a policy with `unsafe-inline` quietly restored
 * to make the breakage stop.
 *
 * So the hashes come from the built output. If the output changes, the policy
 * changes with it, and `--check` fails a build whose committed policy no longer
 * matches what it produced.
 *
 * ## Why not `unsafe-inline`
 *
 * Because the one thing a CSP is for is making an injected `<script>` inert,
 * and `unsafe-inline` is the setting that turns that off. A site whose central
 * argument is that claims should be verifiable does not get to ship the
 * security header that means "trust whatever is in the page".
 *
 * Note that a browser **ignores `unsafe-inline` when hashes are present**, so
 * leaving it in would not even be a fallback — it would be decoration that
 * reads as a safety net.
 *
 * ## What is deliberately not hashed
 *
 * `type="application/ld+json"` and `type="application/json"` blocks. They are
 * data, not executable, and CSP's script-src does not gate them. Hashing them
 * would add churn for no protection — their contents change with every
 * registry edit.
 *
 * `style-src` keeps `unsafe-inline`: Astro emits inline `<style>` for scoped
 * component CSS, and there is no injection path through a stylesheet that the
 * rest of this policy leaves open. Recorded as an accepted risk in
 * docs/SECURITY.md rather than left unexplained.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const HEADERS = join(DIST, '_headers');

/**
 * The third-party origins the policy allows, and the only ones.
 *
 * Both are analytics and both are env-gated in the page, so a deployment that
 * configures neither loads neither — the policy simply permits them.
 *
 * `UMAMI` appears in `connect-src` as well as `script-src`: the script loads
 * from that host and posts its page views back to `/api/send` on it. Allowing
 * only the load produces a script that runs and reports nothing, which is the
 * worst shape of broken analytics — it looks configured.
 */
const BEACON = 'https://static.cloudflareinsights.com';
const UMAMI = 'https://cloud.umami.is';

function htmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Every executable inline script in the built site, as CSP hash sources.
 *
 * Comments are stripped first. A `<!-- … src=… -->` inside a comment otherwise
 * matches the "has a src attribute" test and the real script beside it gets
 * skipped — which produces a policy that is short by exactly the scripts
 * somebody documented carefully.
 */
export function inlineScriptHashes(dist = DIST) {
  const hashes = new Set();

  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');

    for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      const [, attributes, body] = match;

      // External scripts are covered by the 'self' / beacon sources.
      if (/\bsrc\s*=/.test(attributes)) continue;
      // Data blocks are not executed, so script-src does not apply.
      if (/type\s*=\s*["'](application|text)\/(ld\+)?json["']/.test(attributes))
        continue;
      if (!body.trim()) continue;

      // The hash is over the element's exact text content, byte for byte —
      // no trimming, no normalisation. A browser hashes what is between the
      // tags, and so must this.
      hashes.add(createHash('sha256').update(body, 'utf-8').digest('base64'));
    }
  }

  return [...hashes].sort();
}

function policy(hashes) {
  const scriptSources = [
    "'self'",
    BEACON,
    UMAMI,
    ...hashes.map((hash) => `'sha256-${hash}'`),
  ].join(' ');

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    // Inline styles: Astro's scoped component CSS. See the note above.
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSources}`,
    `connect-src 'self' ${UMAMI}`,
    'upgrade-insecure-requests',
  ].join('; ');
}

function rewrite(headers, csp) {
  let replaced = false;
  const lines = headers.split('\n').map((line) => {
    if (/^\s*Content-Security-Policy:/.test(line)) {
      replaced = true;
      const indent = line.match(/^\s*/)[0];
      return `${indent}Content-Security-Policy: ${csp}`;
    }
    return line;
  });
  if (!replaced) {
    throw new Error('no Content-Security-Policy line in dist/_headers');
  }
  return lines.join('\n');
}

function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ does not exist — run the build first.');
    process.exit(1);
  }
  if (!existsSync(HEADERS)) {
    console.error('dist/_headers does not exist.');
    process.exit(1);
  }

  const hashes = inlineScriptHashes();
  const csp = policy(hashes);
  const current = readFileSync(HEADERS, 'utf-8');
  const updated = rewrite(current, csp);

  const check = process.argv.includes('--check');

  if (check) {
    if (current === updated) {
      console.log(
        `✅ CSP matches the build (${hashes.length} inline scripts hashed)`
      );
      return 0;
    }
    console.error('❌ The shipped CSP does not match the built output.');
    console.error('');
    console.error(
      '   An inline script changed and the policy did not follow, which'
    );
    console.error('   means the site is about to break under its own header.');
    console.error('   Run: node scripts/generate-csp.mjs');
    return 1;
  }

  writeFileSync(HEADERS, updated);
  console.log(`✅ wrote CSP with ${hashes.length} script hashes`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
