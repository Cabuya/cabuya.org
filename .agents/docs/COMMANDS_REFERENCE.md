# Commands Reference

> **Auto-maintained.** Update whenever a skill or command is added or removed.
> This repository (`cabuya.org`) is the Cabuya Protocol site: Astro, two
> languages (EN at `/`, ES at `/es`), the `spec/` + `registry/` bounded
> directories and the `@cabuya/validator` workspace.
> Detailed tiers and capabilities: [Skills & Agents Catalog](skills_agents_catalog.md).

---

## How to Invoke Commands

| Agent | Prefix | Example |
|-------|--------|---------|
| **Claude Code** | `/` (native) | `/quick-fix` |
| **OpenAI Codex / Cursor / Gemini / others** | `#` | `#quick-fix` |

> Most non-Claude CLIs intercept `/` as their own namespace; `#` avoids the
> interception. Plain text ("run quick-fix") also works.

When a command is invoked, the agent MUST: **read** the linked procedure file
completely, **follow** it exactly, and **never** improvise or skip steps —
the procedure file IS the spec.

---

## Slash commands (`.agents/commands/`)

| Command | Procedure file |
|---|---|
| `/agent-create` | [`.agents/commands/agent-create.md`](../commands/agent-create.md) |
| `/agent-list` | [`.agents/commands/agent-list.md`](../commands/agent-list.md) |
| `/branch` | [`.agents/commands/branch.md`](../commands/branch.md) |
| `/code-review` | [`.agents/commands/code-review.md`](../commands/code-review.md) |
| `/commit` | [`.agents/commands/commit.md`](../commands/commit.md) |
| `/design-system` | [`.agents/commands/design-system.md`](../commands/design-system.md) |
| `/dwp-create` | [`.agents/commands/dwp-create.md`](../commands/dwp-create.md) |
| `/dwp-execute` | [`.agents/commands/dwp-execute.md`](../commands/dwp-execute.md) |
| `/dwp-refine` | [`.agents/commands/dwp-refine.md`](../commands/dwp-refine.md) |
| `/dwp-resume` | [`.agents/commands/dwp-resume.md`](../commands/dwp-resume.md) |
| `/dwp-status` | [`.agents/commands/dwp-status.md`](../commands/dwp-status.md) |
| `/dwp-verify` | [`.agents/commands/dwp-verify.md`](../commands/dwp-verify.md) |
| `/lib-upgrade` | [`.agents/commands/lib-upgrade.md`](../commands/lib-upgrade.md) |
| `/pr` | [`.agents/commands/pr.md`](../commands/pr.md) |
| `/setup` | [`.agents/commands/setup.md`](../commands/setup.md) |
| `/skill-create` | [`.agents/commands/skill-create.md`](../commands/skill-create.md) |
| `/skill-list` | [`.agents/commands/skill-list.md`](../commands/skill-list.md) |

## Skills invoked as commands (`.agents/skills/*/SKILL.md`)

| Skill | Purpose |
|---|---|
| `/add-generated-artifact` | Add a file generated from a source of truth, with the `--check` that fails CI when the two drift |
| `/add-check` | Implement one validator check end-to-end — catalogue entry, logic, fixture pair, agent-optimized message, docs metadata, gates |
| `/add-component` | Create new Astro or Svelte components with correct patterns |
| `/add-page` | Create new pages with correct routing and MainLayout usage |
| `/audit-analytics` | Audit what the site measures against what it claims — beacon env gate, no custom events, no cookies, one third-party origin |
| `/audit-content-parity` | Audit whether the Spanish and English versions of the same entry carry the same content — same sources, same structure, same bilingual fields |
| `/audit-language-integrity` | Audit the sitewide language integrity of the build — Spanish URLs must render Spanish and English URLs English, in HTML and in the `.md` twin |
| `/doc-edit` | Update documentation files including README, comments, and inline docs |
| `/fix-lint` | Fix Biome linting/formatting errors in 1-3 files using auto-fix and minimal manual edits |
| `/git-commit-push` | Commit all staged/unstaged changes and push to remote |
| `/optimize-image` | Convert and optimize images to WebP with responsive sets for site imagery (brand, home, visuals) |
| `/pr-review-lite` | Quick checklist review of a PR for style, obvious bugs, and missing tests |
| `/quick-fix` | Fix small bugs and issues in 1-3 files following existing patterns |
| `/refactor-safe` | Safe refactor in bounded scope (1-10 files, no behavior change) |
| `/registry-review` | Review a registry publisher PR — schema, identity, uniqueness, org-level contact, crawl policy, no hand-written measured state |
| `/release-spec` | Release a spec version — SemVer decision, the RC-requires-a-shipping-publisher rule, CHANGELOG, tags, validator range, skill sync |
| `/security-check` | Quick security checklist for a PR or set of files (secrets, input, logging) |
| `/spec-edit` | Change normative text in spec/ safely — RFC triage, boundary rules, CHANGELOG, example co-update, gates |
| `/translate-sync` | Synchronize content between English and Spanish versions |
| `/type-fix` | Fix TypeScript type errors in 1-3 files (explicit types, prefer no any) |
| `/update-styles` | Update Tailwind styles with dark mode support |
| `/write-tests` | Add or expand unit/integration tests for existing code (when testing is configured) |

## Vendored pack commands

- **DeepWorkPlan:** `/dwp-create`, `/dwp-execute`, `/dwp-refine`,
  `/dwp-resume`, `/dwp-status`, `/dwp-verify` (aliases into the vendored
  `deepworkplan` skill).
- **DailyBot:** invoked by intent ("report this to Dailybot") — see the
  vendored pack's router.
- **AI Diff Reviewer:** "Review my current branch" (Flow A installed:
  `.review/extension.md`).
