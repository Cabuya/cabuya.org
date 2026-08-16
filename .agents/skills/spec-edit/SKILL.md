---
name: spec-edit
description: Change normative text in spec/ safely — RFC triage, boundary rules, CHANGELOG, example co-update, gates. Use whenever any file under spec/ must change.
model: sonnet
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
tier: 2
---

# Skill: spec-edit — changing the standard without breaking it

`spec/` is the normative Cabuya Protocol: CC0, bounded (B1–B7), versioned,
consumed by the validator, the portal renderer and the skill's vendored copy.
Changes here have a different blast radius than site changes.

## Procedure

1. **Triage: is this normative or editorial?**
   - **Editorial** (typo, clarity, formatting, a broken link): proceed
     directly — but the meaning of every MUST/SHOULD/MAY must be provably
     unchanged (diff review).
   - **Normative** (any change to a requirement, field, enum, level, or
     exclusion): STOP unless an accepted RFC is linked. Normative changes go
     through the RFC process (`spec/rfcs/0000-template.md`, `/rfcs`). Draft
     the RFC instead of the edit.
2. **Version discipline.** Published versions never mutate: a normative
   change targets the NEXT version directory. `spec/versions/0.1/` may change
   only while status is `draft`.
3. **Anchors are stable.** Never renumber `#N-M` anchors — validator
   messages and external links depend on them. New clauses take new numbers.
4. **Co-update the whole contract in one change:**
   - Schema change → the examples (valid AND invalid), the `$comment`
     teaching notes, the validator fixtures that snapshot them.
   - New/changed requirement → the check catalogue entry if a check enforces
     it (`packages/validator/src/checks.ts`) — or a note that none does.
   - Any change → `spec/CHANGELOG.md` (Keep-a-Changelog, under the version).
5. **Respect the boundary:** no imports, no build files, `.md`/`.json` only,
   absolute versioned `$id`s, zero PII (including examples).
6. **Validate:**
   ```bash
   pnpm run spec:check:strict && pnpm run spec:boundary && pnpm run test
   ```
7. If schemas changed, note in the PR that the skill repo needs a
   `sync-spec.sh` run (checksums will catch it regardless).

## Never

Rename/renumber a check id or an anchor · edit a superseded version ·
"fix" an invalid example so it passes · weaken an exclusion (§7 changes need
an RFC **and** the PII gate).
