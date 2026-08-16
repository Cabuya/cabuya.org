# The Cabuya Protocol specification (`spec/`)

This directory is the **normative Cabuya Protocol**: versioned specification
text, JSON Schemas, worked examples, profiles, the shared vocabulary, and the
RFC process. It is dedicated to the public domain under
**CC0-1.0** (see [`LICENSE`](./LICENSE)) so anyone can implement, mirror,
translate or fork the standard without a licence conversation.

Rendered at **https://cabuya.org/developers/spec** — versioned URLs are
permanent and never mutate. Schema `$id`s resolve at
`https://cabuya.org/schemas/{version}/{name}.schema.json`.

## Layout

| Path | What |
|---|---|
| `versions/{v}/` | Normative sections, one file per §, stable §-numbered anchors |
| `schemas/{v}/` | JSON Schemas (2020-12) with absolute versioned `$id`s |
| `examples/{v}/{valid,invalid}/` | Worked examples; the invalid ones carry **designed error messages** in `$comment` and are the validator's acceptance fixtures |
| `profiles/` | `Core` and `Extended` |
| `vocab/` | The equivalence dictionary (place-kind crosswalks, DIVIPOLA notes) |
| `rfcs/` | The RFC process: template, index, accepted/declined records |
| `CHANGELOG.md` | Keep-a-Changelog, SemVer |

## The boundary contract (B1–B7, CI-enforced)

1. **B1** — nothing here imports or references anything outside this
   directory.
2. **B2** — site code reads this directory only through
   `src/lib/spec-loader.ts`.
3. **B3** — this directory carries its own LICENSE, README, CHANGELOG and
   CODEOWNERS entry.
4. **B4** — no build step, no `package.json`, no generated files: Markdown
   and JSON only.
5. **B5** — schema `$id`s are absolute, versioned URLs, so a vendored copy
   resolves identically to the hosted one.
6. **B6** — (registry counterpart) data-only entries, nothing rendered
   unescaped.
7. **B7** — no personal data anywhere, examples included.

Violations fail CI (`spec:boundary`).

## The extraction path (pre-committed)

**The public surface of the standard is a set of URLs, not a repository
layout.** If governance ever requires the spec to live in its own repository,
the procedure is one afternoon: `git filter-repo --path spec/ --path
registry/` into a new repo (history preserved — B1/B4 guarantee no dangling
imports); the website consumes it as a pinned submodule/fetch with a one-file
change in `spec-loader.ts` (B2 guarantees one call site); URLs and `$id`s do
not change (B5). Triggers, any one of which opens the extraction PR: a
non-founding maintainer requests it via RFC and it passes; the spec gains a
second independent renderer; governance moves to its multi-party phase and
wants the standard held separately; the website repo needs a licence change
that would contaminate the CC0 boundary.

## Changing this directory

Normative changes go through the RFC process (`rfcs/0000-template.md`);
editorial changes may land directly but must provably not alter any
MUST/SHOULD/MAY. The repo skill `/spec-edit` is the procedure; `spec:check`
enforces schema/example integrity either way.
