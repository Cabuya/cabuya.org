---
name: release-spec
description: Release a spec version — SemVer decision, the RC-requires-a-shipping-publisher rule, CHANGELOG, tags, validator range, skill sync. Use for any spec version transition.
model: sonnet
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
tier: 2
---

# Skill: release-spec — versioning the standard

## The rules that bind releases

- **SemVer** on the spec. Supported versions span ≤ 2 MAJORs; producers get
  180 days on MAJOR bumps; deprecated terms warn one release, then error.
- **A release candidate becomes normative only after ≥ 1 publisher ships it
  publicly** (registry-verifiable). The spec never outruns its implementers.
- Published versions are immutable; "latest" is a pointer, never a canonical
  URL.

## Procedure

1. **Decide the bump** from the accepted RFCs since the last release:
   breaking normative change → MAJOR · additive → MINOR · editorial →
   PATCH.
2. **Status ladder:** `draft` → `rc` → `normative`. The `rc → normative`
   transition requires linking the registry entry of a publisher measured
   against the RC. No publisher, no release — say so plainly.
3. **Materialize:** new `spec/versions/{v}/` + `spec/schemas/{v}/` (new
   absolute `$id`s) + examples; the previous version's status becomes
   `superseded` only per the 2-MAJOR window.
4. **CHANGELOG:** the release section lists every RFC by number.
5. **Validator:** supported-version window updated (`ENV006`); new checks per
   the RFCs (via `/add-check`); package version bumped per its own SemVer;
   `pnpm run validator:pack` reviewed.
6. **Gates:** `spec:check:strict`, `checks:catalogue`, full test suite,
   content gates (the spec pages regenerate).
7. **Tag** `spec-v{v}` (+ npm publish flow per release automation).
8. **Downstream notes:** the skill repo must `sync-spec.sh` to the tag
   (its V1–V7 rules decide ITS version bump); `/changelog` regenerates;
   `/developers/spec` index shows the new status.

## Never

Mutate a published version · release an rc as normative without the shipping
publisher · translate or renumber check ids · skip the 180-day window on a
MAJOR.
