# KICKOFF_WEBSITE.md — Execution Brief for the `cabuya-website` Repo

> **Purpose:** self-contained brief to start the website repo. In the new repo,
> copy this whole `analysis_results/` folder to `tmp/cabuya-context/`, then run
> `/dwp-create` passing this file as full context. Everything referenced below
> travels inside the bundle — no access to the CoragWeb repo is required at
> execution time (its patterns are already extracted into `PRODUCTS_BLUEPRINT.md` §2).

## 1. What you are building

`cabuya.org` — the home of the **Cabuya Protocol**: a landing that tells the
initiative's story plus a `/developers` portal (quickstart, versioned spec,
schema reference, live validator, implementers registry with **measured**
badges, skill install page, changelog/RFC index). Bilingual (ES at `/`, EN at
`/en`). The repo also hosts the **spec** (bounded CC0 `spec/` directory) and
the **registry** (same contract), plus the validator package.

## 2. Decided facts (do not re-litigate — see `DECISIONS.md`)

- Name **Cabuya** · domains **cabuya.org** (canonical) + **cabuyaprotocol.org**
  (301 → .org) · repo name `cabuya-website` · npm scope `@cabuya`.
- Brand: assets in `brand/` (logo PNG + `PALETTE.md`). Tokens: Forest `#0B3D32`,
  Fique `#C79A4A`, Night `#082A24`, Ivory `#F6F3ED`, White `#FAF9F6`.
  **Hard rule:** Fique fails AA on light grounds (2.45:1 measured) — icons/
  large-display only; derive `--color-cabuya-fique-strong` (≥4.5:1 on `#FAF9F6`)
  for any accent text on light. Forest-on-White (11.5:1) and White-on-Night
  (14.6:1) are the body pairs.
- Licensing: `spec/` + `registry/` CC0-1.0; everything else Apache-2.0.
- Founding principle on the landing: «Crecemos juntos: no competimos, nos
  alimentamos». Badge language: «Compatible con Cabuya 1.0» (never "Powered by").
- Rule-0 applies to all site copy: no invented figures; emergency figures only
  with named sources (usable set in `DECISIONS.md` M7); listing ≠ endorsement;
  no CTAs to channels that don't exist.

## 3. Stack & architecture (from `PRODUCTS_BLUEPRINT.md` §1–2 — the authority)

Astro 7 SSG + Sätteri · Svelte 5 islands (`client:visible`) · Tailwind 4
`@theme` tokens · TypeScript 6 (pinned) + Biome 2 · pnpm workspaces
(`packages/validator`, later `packages/mcp-server`) · Vitest · Cloudflare
Pages + Functions · KV for badge state + monthly CC0 JSONL history ·
Cloudflare Web Analytics (cookieless).

Inherited patterns (13, with their rules): page-wrapper (thin ES/EN wrappers +
`*Page.astro`), English route slugs, exhaustive translation types, Content
Collections + Zod, `.md` twins + `Accept: text/markdown` negotiation,
`llms.txt`/`llms-full.txt`, middleware allowlist, token discipline +
`/internal/ui/colors` + declared≡shown test, internal dev-only hub, quality
gates (`md:check`, `lang:check`, `seo:check`, `parity:check` + `:strict`),
`.agents/` + `.claude` symlink, image discipline (dimensions, WebP, lazy).
Named exclusions (do NOT build): institutional-pages engine, blog, DailyBot
intake, contributors/authors/channels collections, notifications machinery,
ecosystem directory (the registry replaces it: "a directory lists, a registry
measures").

## 4. The spec directory (populate from this bundle)

- `spec/` ← `PROTOCOL_DESIGN.md` (v0.1 normative, incl. Addendum A) split into
  versioned pages; `spec/schemas/0.1/` ← `schemas/*.schema.json` (already carry
  `$id: https://cabuya.org/schemas/0.1/…`); `spec/schemas/0.1/examples/` ← the
  5 examples (2 valid, 3 invalid-with-designed-errors — they are the
  validator's acceptance fixtures); `spec/vocab/` ← the equivalence dictionary
  (crosswalks from `ENTITY_MODEL.md` §4.2, published standalone per the mesa
  técnica roadmap step 1); `spec/rfcs/` ← RFC template from
  `GOVERNANCE_AND_LICENSING.md` §3.4 + `RFC-0_draft.md`.
- Boundary rules: own CHANGELOG, no imports from site code, CODEOWNERS,
  extraction procedure published (`PRODUCTS_BLUEPRINT.md` §1.4).

## 5. The validator (heart of the portal — `PRODUCTS_BLUEPRINT.md` §4)

One TypeScript engine (no Node-only APIs), four harnesses: CLI (`@cabuya/validator`,
exit codes 0–5, `explain`, `probe`, **`convert` for the HXL/CSV on-ramp** — see
`MESA_TECNICA_ALIGNMENT.md` §2.1, contact columns dropped on convert), CI
action, `/api/validate` Pages Function (SSRF control set §2.7 — re-verify at
implementation, flagged by `SECURITY_REVIEW.md`), scheduled registry
re-validation (6h cron, 2 consecutive failures → `unreachable`). Error format:
stable check ids + JSON Pointer + rule + fix + minimal patch (agent fix-loop
optimized). Passes: schema · semantic (locator rule, id namespace) · PII
deny-patterns · behavioral (soft-404 byte-equality, always-now double-probe,
CORS). The 3 invalid examples' `$comment` strings are the designed error
messages — acceptance fixtures.

## 6. Registry

`registry/` JSON entries keyed by canonical URL + declared aliases (never slug);
crawl/reuse policy per publisher (tooling MUST honor it); badge states
`conforming | stale | unreachable | suspended | archived`; wave-0 seed
publishers = corag, pereira-responde, pereira-ayuda, reporte-co (evidence in
`APPS_MATRIX.md`); official channels (Cruz Roja RCF, Registro Único/UNGRD, CAP
endpoints) listed as `official_source` entries. The registry doubles as a
**fraud countermeasure** (verified legitimate points — institutional argument,
`MESA_TECNICA_ALIGNMENT.md` §2.4).

## 7. Suggested DWP task shape (build order = blueprint §7.2 P0–P4)

1. P0 scaffold: repo, licences, CI skeleton, inherited patterns, brand tokens
   (+ derive `fique-strong` with a measured test).
2. P1 validator core (schema/semantic/PII passes, golden corpus = the 5
   examples) → npm publish.
3. P2 behavioral probes + CLI polish + fixture server (4 traps).
4. P3 site v0.1: landing + quickstart + spec rendering + schema ref + `.md`
   twins + `llms.txt` + gates green.
5. P4 live validator + registry + badges + cron.
6. Mandatory finals (Security Review — SSRF set is the named focus — Skills
   Discovery, Executive Report).

**Exit ("done"):** a stranger lands on the quickstart, installs the skill, and
45 minutes later has a green badge at `/registry/{their_id}` a stranger can
verify — no maintainer message in between. Gates: the 3 invalid fixtures fail
with exactly their designed messages; the 2 valid pass; `md:check:strict`,
`lang:check:strict`, `parity:check:strict` green.

## 8. Bundle map (what to read when)

| Need | File |
|---|---|
| Every ratified decision | `DECISIONS.md` |
| Normative spec source | `PROTOCOL_DESIGN.md` + `schemas/` |
| Field semantics & rationale | `ENTITY_MODEL.md` |
| Full product architecture | `PRODUCTS_BLUEPRINT.md` |
| Brand | `brand/PALETTE.md` + PNG |
| Governance/licenses/RFC process | `GOVERNANCE_AND_LICENSING.md` |
| Who adopts when | `ADOPTION_PLAYBOOK.md` |
| Institutional context | `MESA_TECNICA_ALIGNMENT.md` |
| Standards rationale | `PRIOR_ART.md` |
| Ecosystem evidence | `APPS_MATRIX.md` + `apps/` |
