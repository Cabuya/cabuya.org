---
name: add-generated-artifact
description: Add a file that is generated from a source of truth and committed, with the --check that fails CI when the two drift. Use when a fact would otherwise be written in two places.
# === Universal (Claude Code + Cursor + Codex) ===
disable-model-invocation: false
# === Claude Code specific ===
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
# === Documentation (ignored by tools, useful for humans) ===
tier: 2
intent: implement
---

# Skill: Add a generated artifact

## Objective

Encode a pattern this repository arrived at five separate times, each after
the same problem: **one fact, written in two places, drifting.**

The shape is always the same — a generator, a committed output, and a
`--check` mode that fails CI when the committed copy no longer matches what
the generator produces. Use it whenever you are about to write down something
that is derivable from somewhere else.

## Where it already is

| Artifact | Generated from | Checked by |
|---|---|---|
| `dist/_headers` CSP `script-src` | the hashes of every inline script in the built output | `csp:check` |
| `packages/validator/src/generated/**` | `spec/schemas/0.1/*.json`, compiled ahead of time so the browser never calls `new Function` | `schemas:check` |
| `public/llms.txt` | the site's own route and content inventory | `llms:check` |
| `spec/CHECKSUMS.txt` *(skill repo)* | every vendored file | `verify-integrity.sh` |
| `spec/SPA_EXCLUSIONS.md` *(skill repo)* | `packages/validator/src/spa-exclusions.ts` | the integrity check |

The last one is the clearest argument for the pattern. Those catch-all fixes
ship in four places — the validator CLI, the quickstart page, the vendored
copy, and the stack guides that quote it. The source file says what happens to
four copies: *one drifts, and the one that drifts is the one somebody follows.*

## When to reach for it

**Yes** when the fact has a single source and more than one consumer, when a
stale copy would look authoritative, or when the consumers are in different
repositories.

**No** when the "generation" is a formatting pass a linter already does, when
the output is not committed (a build artifact nobody reads), or when the source
of truth is the file itself.

## Procedure

### 1. Name the source of truth, out loud

Write it in the generator's header comment. If you cannot say in one sentence
where the truth lives, the artifact is not derived — it is authored, and this
pattern is the wrong one.

### 2. Write the generator

`scripts/<name>.mjs`, with:

- a **module docstring** saying what it generates, from what, and — this is
  the part people skip — **why it is generated rather than written**. Six
  months later that paragraph is what stops somebody hand-editing the output.
- a `--check` mode that regenerates in memory, compares, and **exits non-zero
  with the command to fix it**. Never write files in `--check`.
- **byte-stable output**: sort anything unordered. Otherwise every run is a
  diff nobody can review, and people stop reading them.

### 3. Make the output say it is generated

First line of the file, in whatever comment syntax it has:

```
GENERATED — do not edit. Written by scripts/<name>.mjs. Regenerate with: …
```

For a format with no comments (JSON), use a `$comment` key, or state it in the
adjacent documentation. Somebody *will* open the output and try to fix a typo
in it.

### 4. Wire both modes

```jsonc
"scripts": {
  "<name>:generate": "node scripts/<name>.mjs",
  "<name>:check": "node scripts/<name>.mjs --check"
}
```

If the artifact derives from the **build** rather than the source, run the
generator in `postbuild` and the check in CI after the build. That is what the
CSP does: the hashes cannot be known before the output exists.

### 5. Add the check to CI, next to related gates

Name the step so a failure explains itself. `Security gate — the CSP matches
what was built` tells a reader more than `csp:check`.

### 6. Exclude the output from tooling that would rewrite it

Formatters and linters will happily reformat generated code and break the
check. Biome's `files.includes` takes a `!path` entry; TypeScript's `exclude`
takes a glob. Both were needed for Ajv's output, which is minified machine
code.

### 7. Seed-test it

**Break the source, confirm the check goes red, restore.** A `--check` that
has never failed is a `--check` nobody has verified. Every generator listed
above was seed-tested this way, and one of them was wrong the first time.

## What goes wrong

**The check passes because it regenerates first.** If `--check` writes the
file and then compares it to itself, it can never fail. Compare in memory.

**The output is unstable.** Timestamps, object iteration order, absolute
paths, locale-dependent sorting. Each makes every run a diff.

**Nothing tells the reader it is generated**, so somebody hand-edits it, CI
fails on a change they did not understand, and the fastest way out is deleting
the check.

**The generator and the runtime disagree about the source.** The precompiled
validators are used only when the injected schema's `$id` matches the one they
were built from — otherwise they would enforce yesterday's schema while the
harness believes it supplied today's.

## Validation

```bash
pnpm run <name>:generate && git diff --exit-code   # generating changes nothing
pnpm run <name>:check                              # and the check agrees
# then break the source, confirm red, restore
```

## Related

- `docs/DEVELOPMENT_COMMANDS.md` § Generated artifacts — the table of them
- `.agents/skills/add-check/SKILL.md` — for a validator check rather than a
  generated file
