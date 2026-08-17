# Documentation Guide — when and how docs change

> This repo runs **docs-lead-code**: contracts are written before the
> artifact exists (marked *(ships in Task N)*), and no artifact ships with
> stale docs behind it. AGENTS.md is the index; this guide is the policy.

---

## 1. The docs set and its owners

| Layer | Files | Changes when |
|---|---|---|
| Agent entry point | `AGENTS.md` (`CLAUDE.md` symlinks to it) | Structure, rules, gates, patterns change |
| Product & narrative | `PRODUCT_SPEC`, `MESSAGING`, `INFORMATION_ARCHITECTURE`, `WRITING_*` | Positioning, IA, voice decisions |
| Brand & design | `BRAND_GUIDE`, `DESIGN` | Palette, tokens, patterns (values must stay measured) |
| Engineering | `ARCHITECTURE`, `STANDARDS`, `I18N_GUIDE`, `TESTING_GUIDE`, `DEVELOPMENT_COMMANDS`, `PERFORMANCE`, `ACCESSIBILITY`, `SEO`, `SECURITY`, `ANALYTICS`, `LICENSING` | Their subsystems change |
| Decisions | `docs/DECISIONS.md` (live) · `docs/context/` (frozen founding record) | New decision → append to the live log. **Never edit the founding record** |
| Feature notes | `docs/features/` | A retained feature's mechanics change |
| AEO | `docs/aeo/` | The agent-content contract changes |
| Repository-root governance | `GOVERNANCE(.es).md`, `MAINTAINERS.md`, `TRADEMARK(.es).md`, `CONTRIBUTING(.es).md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` | **These are the source, not the pages.** `/governance`, `/trademark` and `/join` render them through `src/lib/root-docs.ts`; a change to the page is a change to the file. Governance and licensing edits are *breaking* under the decision rules: RFC, majority, 21 days |
| Generated | `docs/CONTRIBUTING-issues.md` | Never by hand — `pnpm run issues:day-one` regenerates it from the check registry, and a gate fails when it has drifted |

## 2. Update triggers (MANDATORY)

Update docs **in the same commit** when you: add/remove a route or collection
· change a schema or gate · add an npm script · change tokens or their
measured values · alter the security surface or a secret · make any decision
that overrides earlier guidance (→ `DECISIONS.md` entry) · establish a
pattern another contributor will need.

## 3. Rules

1. **One home per fact** — deep-explain once, link everywhere else (drift
   prevention; same rule as MESSAGING for content).
2. **Docs lead code:** a future contract is written with its *(ships in Task
   N)* marker; the shipping task removes the marker. Markers are inventoried
   before launch — none may survive it.
3. **Measured claims stay measured:** any number in BRAND_GUIDE/DESIGN/
   PERFORMANCE (a ratio, a budget) must match its enforcing test/gate. If you
   change one, change both.
4. **The founding record is read-only.** Corrections to history go in the
   live decision log, pointing at what they supersede.
5. **English for repo docs**; public content rules live in the voice guide.
6. Vendored packs (`.agents/skills/{deepworkplan,dailybot,ai-diff-reviewer}`)
   document themselves — never edit them here.

## 4. Adding a document

New docs join the AGENTS.md index table + `docs/README.md` in the same
commit, follow the house shape (a one-paragraph blockquote stating purpose
and authority, then numbered sections), and state their enforcement story
(what gate/test makes them true).
