/**
 * Voice-guide audit — the mechanical half.
 *
 * `docs/WRITING_VOICE_GUIDE.md` is a good guide and an unenforced one. Its
 * §4 anti-slop shapes, §5 blocklist, §6 naming conventions, §7 language
 * accessibility rules and §8 placeholder ban are all stated as things a writer
 * checks by hand before publishing, which means they hold exactly as long as
 * somebody remembers to check.
 *
 * This checks the rules a machine can check, over every user-facing string:
 * the translation modules, the diagram copy and the portal prose, in both
 * languages. It deliberately does **not** try to judge register — a script
 * that claimed to measure whether prose sounds professional would be the kind
 * of unverifiable claim this project exists to argue against. What it does is
 * catch the specific shapes and words the guide already named, so a close read
 * can spend its attention on the part that needs judgement.
 *
 * Usage:
 *   node scripts/audit-content-voice.mjs
 *   node scripts/audit-content-voice.mjs --json
 *   node scripts/audit-content-voice.mjs --strict   # exit 1 on any finding
 *
 * `spec/` is out of scope: it is normative CC0 text that changes only through
 * an RFC, and it is written in a register the site prose is not.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STRICT = process.argv.includes('--strict');
const JSON_OUT = process.argv.includes('--json');
const ROOT = process.cwd();

// ── §5 Vocabulary blocklist ───────────────────────────────

/** Hype, savior and claim registers. Word-boundary matched, case-insensitive. */
const BLOCKLIST = [
  // Hype
  ['revolucionari|revolutionary', 'hype'],
  ['disruptiv', 'hype'],
  ['game.?changer', 'hype'],
  ['next.?generation', 'hype'],
  ['cutting.?edge', 'hype'],
  ['world.?class', 'hype'],
  ['state.of.the.art', 'hype'],
  ['sinergia|synergy', 'hype'],
  ['soluci[óo]n integral', 'hype'],
  ['empoderar|empower', 'hype'],
  ['unificamos el ecosistema', 'hype'],
  ['el est[áa]ndar definitivo|the definitive standard', 'hype'],
  // Savior
  ['salvamos vidas|save lives', 'savior'],
  ['h[ée]roes|heroes', 'savior'],
  ['beneficiarios|beneficiaries', 'savior'],
  ['los m[áa]s vulnerables', 'savior'],
  ['juntos podemos', 'savior'],
  ['manos que ayudan', 'savior'],
  ['dar voz a', 'savior'],
  // Claims — the doubly-banned one first
  ['certificad[oa]s?|certified', 'claim'],
  ['garantizad[oa]s?|guaranteed', 'claim'],
  ['powered by cabuya', 'claim'],
];

// ── §4 Anti-slop shapes ───────────────────────────────────

const SLOP = [
  ['en un mundo donde|in a world where', 'scaffolding'],
  ['no es solo .{1,30}, es |it.s not just .{1,30}, it.s ', 'scaffolding'],
  ['ya sea que .{1,40} o |whether you.re .{1,40} or ', 'scaffolding'],
  ['la clave est[áa] en|the key is to', 'scaffolding'],
  ['imagina un futuro|imagine a future', 'scaffolding'],
  ['\\bmoreover\\b|\\bfurthermore\\b', 'empty-transition'],
  [
    'es importante destacar|cabe destacar|vale la pena mencionar',
    'empty-transition',
  ],
  ['en resumen,|in summary,|in conclusion,', 'empty-transition'],
  ['el futuro es|the future is', 'cheerleading'],
];

// ── §8 Placeholders ───────────────────────────────────────

const PLACEHOLDER = /\[TODO:|\[TBD\]|\[AUTHOR:|lorem ipsum|XXX|FIXME/i;

// ── §6 Naming ─────────────────────────────────────────────

const NAMING = [
  ['CABUYA', 'Cabuya is not an acronym; never all-caps in prose'],
  ['el feed de Cabuya', 'the feed belongs to the app: «un feed Cabuya»'],
  ['compatible con Cabuya(?!\\s+\\d)', 'badge language must be version-scoped'],
  ['Cabuya[- ]compatible(?!\\s+\\d)', 'badge language must be version-scoped'],
  [
    'compatible with Cabuya(?!\\s+\\d)',
    'badge language must be version-scoped',
  ],
];

// ── Terminology ───────────────────────────────────────────

/**
 * One concept, one word — across the translations, the diagram copy and the
 * portal prose alike.
 *
 * These are the Spanish calques the register pass replaced. They were fixed in
 * the translation modules and left standing in the portal Markdown, which is
 * how a vocabulary decision becomes a vocabulary suggestion. Each carries the
 * term to use instead, so the finding says what to do.
 *
 * `allow` is not a suppression: it names the contexts where the word is
 * correct rather than a lapse — «por construcción» is *by design*, not a
 * build, and the routing tables quote what a user might actually type, which
 * is colloquial on purpose.
 */
const TERMS = [
  {
    pattern: '\\bcorre\\b|\\bcorrer\\b|\\bcorrida\\b|\\bcorriendo\\b',
    use: '«ejecutar» / «ejecución»',
    allow: [/«[^»]*»\s*(?:,|\|)/, /\|\s*«/, /corre(?:r|)\s+(?:el\s+)?riesgo/i],
  },
  {
    pattern: '\\btrae\\b|\\btraer\\b|\\btrayendo\\b',
    use: '«descargar» for HTTP, «incluir» for vendoring',
    allow: [/«[^»]*»\s*(?:,|\|)/, /\|\s*«/],
  },
  {
    pattern: '\\barreglar\\b|\\barreglable\\b|\\barreglarlo\\b',
    use: '«corregir» / «corrección»',
    allow: [/«[^»]*»\s*(?:,|\|)/, /\|\s*«/],
  },
  {
    pattern: '\\bconstrucci[óo]n\\b',
    use: '«compilación» for a build',
    allow: [/por construcci[óo]n/i, /en construcci[óo]n/i],
  },
];

// ── §7 Meta descriptions ──────────────────────────────────

/**
 * 130–160 characters, per the guide.
 *
 * Not a style preference: a search result truncates past roughly 160, so the
 * clause a writer put last — usually the one that distinguishes this page from
 * the next — is the clause nobody reads. Four descriptions had drifted past it.
 *
 * The portal's collection index is exempt: its body is never served and its
 * description labels a nav section rather than a page.
 */
const META_MIN = 130;
const META_MAX = 160;

function metaDescriptions() {
  const out = [];
  for (const lang of ['en', 'es']) {
    const dir = join('src/content/docs', lang);
    for (const name of readdirSync(join(ROOT, dir))) {
      if (!name.endsWith('.md') || name === 'index.md') continue;
      const file = join(dir, name);
      const text = readFileSync(join(ROOT, file), 'utf-8');
      const match = text.match(/^description:\s*(.+)$/m);
      if (match) {
        out.push({ file, line: 1, text: match[1].trim() });
      }
    }
  }
  for (const module of [
    'src/lib/translations/en.ts',
    'src/lib/translations/es.ts',
  ]) {
    const text = readFileSync(join(ROOT, module), 'utf-8');
    const lines = text.split('\n');
    for (const match of text.matchAll(
      /metaDescription:\s*\n?\s*'((?:[^'\\]|\\.)+)'/g
    )) {
      const line = text.slice(0, match.index).split('\n').length;
      out.push({ file: module, line, text: match[1] });
    }
    void lines;
  }
  return out;
}

// ── Collecting the strings ────────────────────────────────

/** Every quoted string in a translation-shaped module, with its line. */
function stringsFrom(path) {
  const out = [];
  const text = readFileSync(join(ROOT, path), 'utf-8');
  text.split('\n').forEach((line, index) => {
    // Skip comment lines: the guide governs what readers see, not what
    // maintainers write to each other about it.
    if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
    for (const match of line.matchAll(/'((?:[^'\\]|\\.){12,})'/g)) {
      out.push({ file: path, line: index + 1, text: match[1] });
    }
  });
  return out;
}

/**
 * Portal prose, as paragraphs rather than lines.
 *
 * The unit has to be the paragraph: this Markdown is hard-wrapped at 80
 * columns, so a sentence and the clause that negates it routinely sit on
 * different lines. Checking line by line reported the sentence promising the
 * skill *will not* write a bare compatibility claim as a violation of the rule
 * against bare compatibility claims.
 *
 * Front matter is included — a description ships in the page head.
 */
function proseFrom(path) {
  const out = [];
  const text = readFileSync(join(ROOT, path), 'utf-8');
  let buffer = [];
  let start = 0;
  let inFence = false;

  const flush = () => {
    if (buffer.length > 0)
      out.push({ file: path, line: start, text: buffer.join(' ') });
    buffer = [];
  };

  text.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      inFence = !inFence;
      flush();
      return;
    }
    if (inFence) return;
    if (!line.trim()) {
      flush();
      return;
    }
    if (buffer.length === 0) start = index + 1;
    buffer.push(line.trim());
  });
  flush();
  return out;
}

const units = [
  ...stringsFrom('src/lib/translations/en.ts'),
  ...stringsFrom('src/lib/translations/es.ts'),
  ...stringsFrom('src/lib/diagram-copy.ts'),
];

for (const lang of ['en', 'es']) {
  const dir = join('src/content/docs', lang);
  for (const name of readdirSync(join(ROOT, dir))) {
    if (name.endsWith('.md')) units.push(...proseFrom(join(dir, name)));
  }
}

// ── The checks ────────────────────────────────────────────

const findings = [];
const record = (type, unit, detail) =>
  findings.push({
    type,
    file: unit.file,
    line: unit.line,
    detail,
    text: unit.text.slice(0, 120),
  });

/**
 * Contexts where a banned word is the point rather than a violation.
 *
 * The site says *«nunca dice certificado»* in several places, and a check that
 * flagged the sentence forbidding the word would be a check nobody keeps.
 */
const NEGATED = [
  /never says? certified/i,
  /nunca dice certificad/i,
  /doubly banned/i,
  /the word .certified./i,
  /no (?:decimos|usamos) la palabra/i,
  /never the word/i,
  /refuses to say/i,
  /se niega a decir/i,
  /no va a escribir/i,
  /will not write/i,
  /nunca escribir[áa]/i,
];

for (const unit of units) {
  const { text } = unit;

  for (const [pattern, register] of BLOCKLIST) {
    if (new RegExp(`\\b(?:${pattern})`, 'i').test(text)) {
      if (NEGATED.some((exception) => exception.test(text))) continue;
      record(`blocklist:${register}`, unit, `matches /${pattern}/`);
    }
  }

  for (const [pattern, shape] of SLOP) {
    if (new RegExp(pattern, 'i').test(text)) {
      record(`slop:${shape}`, unit, `matches /${pattern}/`);
    }
  }

  if (PLACEHOLDER.test(text)) record('placeholder', unit, 'placeholder marker');

  for (const [pattern, why] of NAMING) {
    if (!new RegExp(pattern).test(text)) continue;
    if (NEGATED.some((exception) => exception.test(text))) continue;
    record('naming', unit, why);
  }

  if (
    /\/es\/|translations\/es\.ts/.test(unit.file) ||
    /^\s*es:/.test(unit.text)
  ) {
    for (const term of TERMS) {
      if (!new RegExp(term.pattern, 'i').test(text)) continue;
      if (term.allow.some((exception) => exception.test(text))) continue;
      record('terminology', unit, `use ${term.use}`);
    }
  }

  // §7 — link text must describe its destination.
  if (
    /\[(?:aqu[íi]|here|click here|haz clic aqu[íi]|read more|leer m[áa]s)\]/i.test(
      text
    )
  ) {
    record('link-text', unit, 'link text does not describe the destination');
  }
}

for (const meta of metaDescriptions()) {
  const length = meta.text.length;
  if (length < META_MIN || length > META_MAX) {
    record(
      'meta-length',
      meta,
      `${length} characters — the guide asks for ${META_MIN}–${META_MAX}`
    );
  }
}

// ── Report ────────────────────────────────────────────────

const byType = new Map();
for (const finding of findings) {
  if (!byType.has(finding.type)) byType.set(finding.type, []);
  byType.get(finding.type).push(finding);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ units: units.length, findings }, null, 2));
} else {
  console.log('\n✍️  Voice-guide audit — the mechanical half\n');
  console.log(
    `   ${units.length} user-facing strings and prose lines checked\n`
  );
  if (findings.length === 0) {
    console.log('✅ No blocklisted vocabulary, no anti-slop shapes, no');
    console.log('   placeholders, no naming violations, no bare link text.\n');
    console.log(
      '   Register itself is not measured here — see the close read.\n'
    );
  } else {
    for (const [type, list] of [...byType].sort(
      (a, b) => b[1].length - a[1].length
    )) {
      console.log(`\n### ${type}  (${list.length})\n`);
      for (const finding of list.slice(0, 10)) {
        console.log(`   ${finding.file}:${finding.line}  ${finding.detail}`);
        console.log(`      "${finding.text}"`);
      }
      if (list.length > 10) console.log(`   … and ${list.length - 10} more`);
    }
    console.log(
      `\n❌ ${findings.length} finding(s) across ${byType.size} class(es)\n`
    );
  }
}

process.exit(STRICT && findings.length > 0 ? 1 : 0);
