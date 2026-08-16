# AI Agent Onboarding

Quick start for AI coding assistants working on cabuya.org.

1. **Read [`AGENTS.md`](../AGENTS.md) first** — it is the single entry point
   (CLAUDE.md symlinks to it) and indexes everything else.
2. **Before any UI work:** [`docs/DESIGN.md`](./DESIGN.md) (the five hard
   rules; the token test re-computes contrast and will fail your build).
3. **Before any content work:** [`docs/WRITING_VOICE_GUIDE.md`](./WRITING_VOICE_GUIDE.md)
   + [`docs/MESSAGING.md`](./MESSAGING.md) (Rule-0 per section).
4. **Run the loop:** `pnpm run dev` (port 7777) · `pnpm run test` ·
   `pnpm run biome:check` · `pnpm run astro:check` — and the gates listed in
   [`docs/DEVELOPMENT_COMMANDS.md`](./DEVELOPMENT_COMMANDS.md).
5. **Traps:** the middleware allowlist (new route ⇒ update
   `src/middleware.ts`); Sätteri-only Markdown (no remark/rehype); TS pinned
   to 6.x; never edit vendored packs or `docs/context/`.
6. **Commits:** conventional, English, signed off (`git commit -s`).

Setup doctor: `/setup` (Claude Code) or `#setup` — scaffolds `.env`,
`.dev.vars`, devcontainer, verifies the toolchain.
