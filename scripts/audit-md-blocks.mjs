/**
 * Block-level completeness of the agent-Markdown twins.
 *
 * `md:check` already measures coverage, and measures it honestly: content-word
 * overlap between a page's `<main>` and its `.md`, with per-page-type floors
 * derived from measurement rather than guessed. It reports a mean of 0.967.
 *
 * But it compares **sets of words**. A set is blind to the defect the contract
 * exists to prevent: a paragraph can vanish from the twin and the score barely
 * move, because the words it used appear elsewhere on the page. A twin that
 * dropped every third paragraph of a long section would still score high.
 *
 * This asks the stricter question — for every block of prose the page renders,
 * does that block appear in the twin **as a run of words, in order**? Inline
 * markup differs between the two (a link, a `<strong>`, an RFC-2119 span), so
 * the comparison is on the normalized word sequence, not the characters.
 *
 * Usage:
 *   node scripts/audit-md-blocks.mjs
 *   node scripts/audit-md-blocks.mjs --json
 *   node scripts/audit-md-blocks.mjs --strict     # exit 1 below the floor
 *   node scripts/audit-md-blocks.mjs --show 20    # sample missing blocks
 *
 * This is a measurement first. Whether it becomes a floor is a decision to
 * make after seeing what it reports, not before.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  checkMdExists,
  collectPages,
  DIST_DIR,
  htmlPathFor,
} from './lib/dist-pages.mjs';
import { mainOf, stripHtml } from './lib/md-completeness.mjs';

const JSON_OUT = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');
const SHOW = Number(
  process.argv.find((a) => a.startsWith('--show'))?.split('=')[1] ??
    process.argv[process.argv.indexOf('--show') + 1] ??
    8
);

/** A block shorter than this is a label, a badge or a table cell, not prose. */
const MIN_WORDS = 8;

/**
 * Blocks a twin is right not to carry, each matched by a distinctive phrase.
 *
 * Not a suppression list: a block is exempt only if its text still matches, and
 * an entry that stops matching is reported as stale, so the list cannot quietly
 * outlive its reason. Any *new* missing block on these same pages still fails.
 *
 * The alternative was lowering the floor to 0.85 to accommodate five pages,
 * which would have let a genuinely truncated twin through on the other
 * sixty-nine.
 */
const ACCEPTED = [
  {
    match: 'md on github the file this page renders',
    why: 'The link to the source file on GitHub. A twin that is the file has no use for a link to itself.',
  },
  {
    match: 'md en github el archivo que esta pagina renderiza',
    why: 'The same link, in Spanish.',
  },
  {
    match: 'does not conform invalid',
    why: "A code block's header on the schema pages: a conformance badge, the example's filename and the language chip, run together as one line. The twin carries every example in full, and states the same verdict, on separate lines.",
  },
  {
    match: 'no cumple invalid',
    why: 'The same header, in Spanish.',
  },
  {
    match: 'json copy',
    why: 'The same header where the copy button falls inside it.',
  },
  {
    match: 'json copiar',
    why: 'The same header with the copy button, in Spanish.',
  },
  {
    match: 'this form needs javascript to submit',
    why: "The form's no-JavaScript fallback. There is no form in a Markdown twin.",
  },
  {
    match: 'este formulario necesita javascript para enviarse',
    why: 'The same fallback, in Spanish.',
  },
  {
    match: 'open an issue public and the fastest route',
    why: 'A link label beside the form; the twin states the same route in prose.',
  },
  {
    match: 'abre un issue publico y la via mas rapida',
    why: 'The same label, in Spanish.',
  },
  {
    match: 'schemas 0 1 manifest schema json place feed schema json',
    why: 'A file-listing table on the changelog. The twin lists the same schemas as prose lines, so the row never matches as a run of words.',
  },
  {
    match: 'the source file spec rfcs 0001 founding agreement md',
    why: 'A path label above the RFC body, which the twin serves in full.',
  },
  {
    match: 'el archivo fuente spec rfcs 0001 founding agreement md',
    why: 'The same label, in Spanish.',
  },
  {
    match: 'implement cabuya publica un feed get us to l2',
    why: 'A routing table row pairing what a user might say, in either language, with the sub-skill it reaches. The twin carries every phrase, one per line, so no row matches contiguously.',
  },
  {
    match: 'consume peers lee los feeds de las otras apps',
    why: 'The same table, second row.',
  },
  {
    match: 'update the manifest abre el pr del registro',
    why: 'The same table, third row.',
  },
  {
    match: 'no me corre el validador install the toolchain',
    why: 'The same table, fourth row.',
  },
];

// ── Normalization ─────────────────────────────────────────

/** Lowercased, diacritics folded, punctuation dropped, single-spaced. */
const words = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

const BLOCK =
  /<(p|li|h[1-6]|blockquote|dd|dt|figcaption|td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const BLOCK_OPEN = /<(p|li|h[1-6]|blockquote|dd|dt|figcaption|td|th)\b/i;

/**
 * The page's prose blocks, and the chrome blocks behind them.
 *
 * Split on the closing tag of every block-level element that carries prose, so
 * a paragraph is one unit and a list is one unit per item. Headings are
 * included: a twin that keeps the prose but drops the headings has lost the
 * document's structure, which is most of what an agent reads it for.
 */
function blocksOf(html) {
  const out = [];
  for (const [, , inner] of mainOf(html).matchAll(BLOCK)) {
    if (BLOCK_OPEN.test(inner)) continue;
    const w = words(stripHtml(inner));
    if (w.length >= MIN_WORDS) out.push({ words: w });
  }
  return out;
}

/** The twin as one normalized word string, link targets removed. */
function twinWords(markdown) {
  return ` ${words(markdown.replace(/\]\([^)]*\)/g, ']')).join(' ')} `;
}

// ── The audit ─────────────────────────────────────────────

const pages = collectPages().checkable;

if (pages.length === 0) {
  console.error('\n❌ No pages in dist/. Run `pnpm run build` first.\n');
  process.exit(1);
}

const results = [];
const matchedAcceptances = new Set();

for (const path of pages) {
  const html = readFileSync(htmlPathFor(path), 'utf-8');
  const twin = checkMdExists(path);
  if (!twin.found) {
    results.push({ path, error: 'no twin' });
    continue;
  }
  const markdown = readFileSync(join(DIST_DIR, twin.mdPath), 'utf-8');

  const haystack = twinWords(markdown);
  const prose = blocksOf(html);
  const has = (b) => haystack.includes(` ${b.words.join(' ')} `);
  const notInTwin = prose.filter((b) => !has(b));
  const missing = notInTwin.filter((b) => {
    const text = b.words.join(' ');
    const accepted = ACCEPTED.find((a) => text.includes(a.match));
    if (accepted) matchedAcceptances.add(accepted.match);
    return !accepted;
  });

  results.push({
    path,
    blocks: prose.length,
    missing: missing.length,
    accepted: notInTwin.length - missing.length,
    ratio: prose.length ? (prose.length - missing.length) / prose.length : 1,
    samples: missing.slice(0, 4).map((b) => b.words.join(' ').slice(0, 110)),
  });
}

const missingTwins = results.filter((r) => r.error);
if (missingTwins.length > 0) {
  console.error(
    `\n❌ ${missingTwins.length} page(s) resolved to no twin. md:check says` +
      ' every page has one, so this is a bug in this script, not a finding.\n'
  );
  process.exit(1);
}

const measured = results.filter((r) => r.blocks > 0);
/*
 * Any block missing from a twin fails, unless the ledger above accounts for
 * it. A ratio floor was the first design and it was too weak to support the
 * claim this gate makes: one dropped paragraph on a twenty-block page measures
 * exactly 95%, which a 0.95 floor lets through. A seed test caught it —
 * deleting a real sentence from a twin left the gate green. With an explicit
 * ledger for furniture, a percentage says less than a count.
 */
const below = measured
  .filter((r) => r.missing > 0)
  .sort((a, b) => b.missing - a.missing);
const totalBlocks = measured.reduce((n, r) => n + r.blocks, 0);
const totalMissing = measured.reduce((n, r) => n + r.missing, 0);

if (JSON_OUT) {
  console.log(JSON.stringify({ totalBlocks, totalMissing, results }, null, 2));
} else {
  console.log('\n📄 Markdown twins — block-level completeness\n');
  console.log(
    `   ${measured.length} pages measured, ${totalBlocks} prose blocks`
  );
  const accepted = measured.reduce((n, r) => n + (r.accepted ?? 0), 0);
  console.log(
    `   ${totalBlocks - totalMissing - accepted} reproduced verbatim, ` +
      `${accepted} accepted as page furniture, ${totalMissing} missing`
  );
  console.log(
    `   ${(((totalBlocks - totalMissing) / totalBlocks) * 100).toFixed(1)}% ` +
      'of prose accounted for'
  );
  console.log('   every block not in the ledger must appear in its twin\n');

  if (below.length === 0) {
    console.log(
      '✅ Every page reproduces its prose block for block. No twin is'
    );
    console.log('   a summary.\n');
  } else {
    console.log(
      `❌ ${below.length} page(s) with prose missing from the twin:\n`
    );
    for (const r of below.slice(0, SHOW)) {
      console.log(
        `   ${r.path}  —  ${r.missing} of ${r.blocks} blocks missing`
      );
      for (const s of r.samples) console.log(`        · "${s}…"`);
    }
    if (below.length > SHOW)
      console.log(`   … and ${below.length - SHOW} more`);
    console.log();
  }
}

const stale = ACCEPTED.filter((a) => !matchedAcceptances.has(a.match));
if (stale.length > 0) {
  console.log(`\n⚠️  ${stale.length} accepted residual(s) no longer match:\n`);
  for (const a of stale) console.log(`   "${a.match}"\n      ${a.why}`);
  console.log('   Remove them — an exemption without a subject hides the next');
  console.log('   regression on that page.\n');
}

process.exit(STRICT && (below.length > 0 || stale.length > 0) ? 1 : 0);
