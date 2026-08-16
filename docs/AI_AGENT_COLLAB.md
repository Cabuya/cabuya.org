# AI Agent Collaboration

Multiple AI agents (Claude Code, Cursor, Codex, Gemini, Copilot) work on this
repo. The coordination rules:

1. **One source of truth:** `.agents/` is canonical; `.claude` and `.cursor`
   are symlinks. Never edit through a symlink; never fork agent guidance into
   per-tool files.
2. **Guidance changes are mirrored:** a rule that changes in `AGENTS.md`
   updates the affected `docs/*` guide (and vice versa) in the same commit —
   `docs/DOCUMENTATION_GUIDE.md` §2 lists the triggers.
3. **Command invocation:** `/name` in Claude Code, `#name` elsewhere. The
   procedure file is the spec — read it fully, follow it exactly
   (`.agents/docs/COMMANDS_REFERENCE.md`).
4. **Plan-driven work** uses DeepWorkPlan (`.dwp/`, git-ignored):
   README checkboxes + PROGRESS.md + state.json are the handoff state — keep
   them current so any agent can resume from disk.
5. **Scratch space:** `tmp/` (git-ignored). Never leave temp artifacts in
   tracked paths.
6. **Team execution:** parallel groups only per a plan's Team Agents
   Configuration; mandatory final tasks always run sequentially under the
   lead. Reference: `docs/technical/TEAM_AGENTS_REFERENCE.md`.
