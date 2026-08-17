# Skills & Agents Catalog — cabuya.org

> The single source of truth for what's available. Regenerate when anything
> under `.agents/skills/` or `.agents/agents/` changes (see AGENTS.md).
> Invocation: `/name` in Claude Code, `#name` elsewhere.

## Repo skills

| Skill | Model | Tier | Description |
|---|---|---|---|
| [`add-check`](../skills/add-check/SKILL.md) | sonnet | 2 | Implement one validator check end-to-end — catalogue entry, logic, fixture pair, agent-optimized message, docs metadata, gates. The good-first-issue:check procedure. |
| [`add-component`](../skills/add-component/SKILL.md) | haiku | 1 | Create new Astro or Svelte components with correct patterns. Use proactively when creating new UI components. |
| [`add-generated-artifact`](../skills/add-generated-artifact/SKILL.md) | sonnet | 2 | Add a file generated from a source of truth and committed, with the `--check` that fails CI when the two drift. The pattern this repo arrived at five times: one fact, two places, drifting. |
| [`add-page`](../skills/add-page/SKILL.md) | haiku | 1 | Create new pages with correct routing and MainLayout usage. Use proactively when creating new pages. |
| [`audit-analytics`](../skills/audit-analytics/SKILL.md) | sonnet | 2 | Audit what the site measures against what it claims — the beacon's env gate, the absence of custom events, no cookies, one third-party origin. Rewritten after Umami was removed. |
| [`audit-content-parity`](../skills/audit-content-parity/SKILL.md) | sonnet | 2 | Audit whether the Spanish and English versions of the same entry carry the same content — same sources, same structure, same bilingual fields. Runs the parity scanner, triages its six classes, and fixes them in the order that avoids re-work. Use after a content drop, a translation pass, or before a release. |
| [`audit-language-integrity`](../skills/audit-language-integrity/SKILL.md) | sonnet | 2 | Audit the sitewide language integrity of the build — Spanish URLs must render Spanish and English URLs English, in HTML and in the `.md` twin. Runs the scanner, triages its two-tier output, and orders the fixes. Use proactively after a content drop, a serializer change, or before a release. |
| [`doc-edit`](../skills/doc-edit/SKILL.md) | haiku | 1 | Update documentation files including README, comments, and inline docs. Use proactively for documentation updates. |
| [`fix-lint`](../skills/fix-lint/SKILL.md) | haiku | 1 | Fix Biome linting/formatting errors in 1-3 files using auto-fix and minimal manual edits. Use proactively for lint issues. |
| [`git-commit-push`](../skills/git-commit-push/SKILL.md) | haiku | 1 | Commit all staged/unstaged changes and push to remote. Use proactively for committing and pushing changes. |
| [`optimize-image`](../skills/optimize-image/SKILL.md) | haiku | 1 | Convert and optimize images to WebP with responsive sets for site imagery (brand, home, visuals). Use proactively when adding images. |
| [`pr-review-lite`](../skills/pr-review-lite/SKILL.md) | haiku | 1 | Quick checklist review of a PR for style, obvious bugs, and missing tests. Use proactively for lightweight PR reviews. |
| [`quick-fix`](../skills/quick-fix/SKILL.md) | haiku | 1 | Fix small bugs and issues in 1-3 files following existing patterns. Use proactively for simple bug fixes. |
| [`refactor-safe`](../skills/refactor-safe/SKILL.md) | sonnet | 2 | Safe refactor in bounded scope (1-10 files, no behavior change). Use proactively for safe, bounded refactoring tasks. |
| [`registry-review`](../skills/registry-review/SKILL.md) | sonnet | 1 | Review a registry publisher PR — schema, identity, uniqueness, org-level contact, crawl policy, no hand-written measured state. The reviewer's checklist. |
| [`release-spec`](../skills/release-spec/SKILL.md) | sonnet | 2 | Release a spec version — SemVer decision, the RC-requires-a-shipping-publisher rule, CHANGELOG, tags, validator range, skill sync. Use for any spec version transition. |
| [`security-check`](../skills/security-check/SKILL.md) | haiku | 1 | Quick security checklist for a PR or set of files (secrets, input, logging). Use proactively for security reviews. |
| [`spec-edit`](../skills/spec-edit/SKILL.md) | sonnet | 2 | Change normative text in spec/ safely — RFC triage, boundary rules, CHANGELOG, example co-update, gates. Use whenever any file under spec/ must change. |
| [`translate-sync`](../skills/translate-sync/SKILL.md) | haiku | 1 | Synchronize content between English and Spanish versions. Use proactively when content needs multilingual synchronization. |
| [`type-fix`](../skills/type-fix/SKILL.md) | haiku | 1 | Fix TypeScript type errors in 1-3 files (explicit types, prefer no any). Use proactively for TypeScript type issues. |
| [`update-styles`](../skills/update-styles/SKILL.md) | haiku | 1 | Update Tailwind styles with dark mode support. Use proactively for styling updates. |
| [`write-tests`](../skills/write-tests/SKILL.md) | sonnet | 2 | Add or expand unit/integration tests for existing code (when testing is configured). Use proactively when tests need to be added or expanded. |

## Vendored packs (upstream — never edit here)

| Pack | What |
|---|---|
| [`deepworkplan`](../skills/deepworkplan/SKILL.md) | DWP methodology: create/execute/refine/resume/status/verify + onboarding |
| [`dailybot`](../skills/dailybot/SKILL.md) | Team reporting, messages, check-ins, forms, chat via the DailyBot CLI |
| [`ai-diff-reviewer`](../skills/ai-diff-reviewer/SKILL.md) | Local branch review + extension + PR authoring (Flow A installed: `.review/extension.md`) |

## Agents

| Agent | Model | Description |
|---|---|---|
| [`architect`](../agents/architect.md) | opus | Planning-only architect for system design, architecture decisions, and complex planning. Use proactively for architectural decisions and system design. |
| [`content-writer`](../agents/content-writer.md) | sonnet | Bilingual (EN/ES) content writer for cabuya.org — portal prose, landing copy, institutional pages — in the Cabuya register. Use proactively for writing or revising site content in either language. |
| [`executor`](../agents/executor.md) | sonnet | Plan execution specialist that follows defined plans strictly without deviation. Use proactively for executing predefined task plans. |
| [`i18n-guardian`](../agents/i18n-guardian.md) | sonnet | Translation quality specialist and multilingual consistency enforcer. Use proactively for multilingual content audits and translation quality reviews. |
| [`reviewer`](../agents/reviewer.md) | sonnet | Thorough code review specialist focused on quality, maintainability, and best practices. Use proactively after code changes for quality review. |
| [`security-auditor`](../agents/security-auditor.md) | sonnet | Security-focused reviewer for static sites, API routes, secrets, and input validation. Use proactively for security reviews of PRs and code changes. |

## Policy

- The four protocol skills (`spec-edit`, `add-check`, `registry-review`,
  `release-spec`) are MANDATORY procedure for their surfaces — do not
  improvise changes to `spec/`, the check catalogue, or `registry/`.
- Keep this catalog and `.agents/docs/COMMANDS_REFERENCE.md` current in the
  same commit as any skill/agent change.
