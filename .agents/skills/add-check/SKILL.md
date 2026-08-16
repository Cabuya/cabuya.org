---
name: add-check
description: Implement one validator check end-to-end — catalogue entry, logic, fixture pair, agent-optimized message, docs metadata, gates. The good-first-issue:check procedure.
model: sonnet
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
tier: 2
---

# Skill: add-check — one validator check, completely

Every check ships as a bounded unit: id + logic + fixtures + message + docs.
The catalogue (`packages/validator/src/checks.ts`) is the single source; ids
are stable forever and never renumbered.

## Procedure

1. **Locate the catalogue entry.** Unimplemented checks already exist with
   `implemented: false` (id, severity, level, spec anchor). If the check is
   genuinely new: it needs a spec clause first (see `/spec-edit`) and the
   next free id in its family (`DSC/ENV/REC/PII/BEH/API/WRT/LIC`).
2. **Write the fixture pair FIRST** under `packages/validator/tests/fixtures/`:
   - one **must-fail** fixture that triggers exactly this check;
   - one **near-miss** that looks similar and must NOT trigger it.
   The structural invariant test requires both for every `E` check.
3. **Implement** in `src/passes/{family}/` — a small function reading the
   parsed document (or probe results) and returning findings.
4. **Write the message per the seven rules** (blueprint §4.5): JSON Pointer
   location · state the rule · name the fix imperatively · minimal
   RFC 6902 patch where mechanical · one violation per message · stable id +
   docs URL · never blame, never "certified". **PII checks never echo the
   matched value** (pointer + pattern class only — sentinel-tested).
5. **Snapshot the message**; add ES translations of `message`/`rule`/`fix`
   to the package translation table (completeness is test-enforced).
6. **Flip `implemented: true`**; docs metadata (title, fix text) complete —
   the checks page (`/developers/validator/checks#ID`) generates from it.
7. **Validate:**
   ```bash
   pnpm --filter @cabuya/validator test && pnpm run checks:catalogue
   ```

## Never

Reuse an id · fire on unknown members (REC015: extensibility applies to the
validator first) · merge two violations into one message · let a PII finding
quote the value.
