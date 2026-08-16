# KICKOFF_SKILL.md — Execution Brief for the `cabuya-skill` Repo

> **Purpose:** self-contained brief to start the skill repo. In the new repo,
> copy this whole `analysis_results/` folder to `tmp/cabuya-context/`, then run
> `/dwp-create` passing this file as full context. The two reference skill
> packs (DailyBot, DeepWorkPlan) live in the CoragWeb repo at
> `.agents/skills/{dailybot,deepworkplan}/` — their conventions are already
> extracted into `PRODUCTS_BLUEPRINT.md` §3, but if the repo is reachable,
> reading them directly is the best style guide.

## 1. What you are building

The **Cabuya agent skill**: install it in any coding agent (Claude Code `/`,
Codex/Cursor/Gemini `#`) and the agent already knows the whole protocol —
**offline**. It takes any app to conformance by generating its feed/manifest
and running the bundled validator in a loop until green.

**The acceptance test IS the product** (`PRODUCTS_BLUEPRINT.md` §3.8): a scored,
offline, CI-run test — agent + skill, no network: 10/10 protocol questions
answered correctly from vendored content + 3/3 implementation exercises
producing validator-green output, on **two different agent harnesses**, before
any MINOR release. If this test is only ever asserted, the adoption thesis is
untested.

## 2. Decided facts (see `DECISIONS.md`)

Name **Cabuya** · repo `cabuya-skill` · manifest path `/.well-known/cabuya.json` ·
validator `@cabuya/validator` (built in the website repo's `packages/`) ·
skill code Apache-2.0 · badge «Compatible con Cabuya 1.0» · founding principle
«Crecemos juntos: no competimos, nos alimentamos» · person-data join
prohibition is absolute (skill MUST refuse to touch people-domain data and
MUST honor per-publisher crawl/reuse policy from the registry).

## 3. Structure (conventions extracted from the DailyBot + DeepWorkPlan packs)

```
cabuya-skill/
├── SKILL.md              # router: intent table → sub-skills; version floor;
│                         #   non-blocking rule; trust model
├── implement/SKILL.md    # take an app to L2/L3: read stack → map fields →
│                         #   generate feed/manifest → validator loop to green.
│                         #   Inputs: JSON app, HXL/CSV sheet (convert mode,
│                         #   contact columns dropped), Supabase/SQL schema
├── consume/SKILL.md      # discover manifests, read network data, dedupe by
│                         #   same_as + accent-folded address matching,
│                         #   attribution + freshness display rules (the 6
│                         #   consumption rules are the checklist)
├── validate/SKILL.md     # run bundled validator locally; explain check ids
├── publish-status/SKILL.md # update manifest/conformance level; registry PR
├── setup/SKILL.md        # doctor: env, validator install, registry reachability
├── shared/               # context.sh, spec-paths.md, error-codes.md
├── spec/                 # VENDORED read-only copy of the Cabuya spec +
│                         #   schemas + 5 examples (checksummed — drift check V6)
├── guides/               # per-stack guides: nextjs-supabase.md, php-ssr.md
│                         #   (the two most common ecosystem stacks per APPS_MATRIX)
└── tests/acceptance/     # §3.8 scored test (offline, 2 harnesses, CI)
```

Conventions that carry over from the reference packs: frontmatter
(`name`, `description`, `version`, `documentation_url`, `user-invocable`,
`allowed-tools`) · intent-routing table in the router · "read the sub-skill's
SKILL.md to execute, don't improvise" rule · consent-first for anything that
writes outside the repo · non-blocking rule (skill failure never blocks the
developer's primary work) · version floor pinned to spec versions
(skill MAJOR tracks spec MAJOR).

## 4. The `implement` flow (the adoption engine — walkthrough proven in `PROTOCOL_DESIGN.md` §11)

1. Detect stack + data source (framework fingerprints; Supabase/SQL/sheet).
2. Map fields → `place` schema using `ENTITY_MODEL.md` semantics; category →
   `place_kind` via the vendored equivalence dictionary; municipality → DIVIPOLA.
3. **PII gate (human-in-the-loop):** deny-list flags contact/name columns —
   excluded by default; the ONE decision surfaced to the human.
4. Generate: feed serializer (route handler or build-time static) + manifest at
   `/.well-known/cabuya.json` + SPA catch-all exclusion.
5. Validator loop until green (schema → semantic → PII → behavioral probes).
6. Open the registry PR.
   Target: ≈2h agent time, 1 human decision — the "afternoon" bar, calibrated
   against the real Pereira Unida profile.

## 5. Suggested DWP task shape

1. Scaffold + router + `setup` doctor (conventions above).
2. Vendor the spec + schemas + examples (checksummed) + equivalence dictionary.
3. `implement` flow + the two stack guides.
4. `validate` + bundled validator invocation (uses `@cabuya/validator`).
5. §3.8 acceptance test, offline, wired to CI, run on 2 harnesses.
6. `consume` + `publish-status` (phase 4 per `EXECUTION_PLAN.md` — may be a
   follow-up plan).
7. Mandatory finals (Security Review: the PII deny-list and crawl-policy honor
   are the named focus).

**Exit:** the §3.8 test green on 2 harnesses in CI; a fresh agent with only this
skill takes a fixture app (provided in `tests/`) to a green validator run with
zero network access to cabuya.org.

## 6. Bundle map

Same index as `KICKOFF_WEBSITE.md` §8. Most-used here: `PROTOCOL_DESIGN.md`
(the contract), `ENTITY_MODEL.md` (field semantics), `schemas/` (vendor these),
`APPS_MATRIX.md` (real stacks the guides must cover), `MESA_TECNICA_ALIGNMENT.md`
§2.1 (HXL converter requirements).
