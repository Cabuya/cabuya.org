---
name: add-institutional-block
description: Add a new block kind to the institutional-page renderer. Use when a page under /how-it-works, /transparency, /emergencies, /leaders, /partners, /developers or /privacy needs a layout the existing block kinds cannot express.
# === Universal (Claude Code + Cursor + Codex) ===
disable-model-invocation: false
# === Claude Code specific ===
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
# === Documentation (ignored by tools, useful for humans) ===
tier: 2
intent: extend
max-files: 5
max-loc: 250
---

# Skill: Add Institutional Block

## Objective

Add a block kind to `InstitutionalBlock` and wire it through **all four**
places it must exist. Seven pages share one renderer and one copy object, and
the `.md` twin is serialized from that same object — which is what keeps the
twin from falling behind the page, and also what makes a half-finished block
kind fail in a way nobody sees until CI.

## Why this needs a procedure

The failure mode is silent. Before this was hardened, the serializer ended in
an `else` catch-all: a new kind would render correctly in HTML and serialize
as a **callout** in the twin. `md:check` measures coverage, so the twin still
passed while quietly saying something different from the page.

There is now a `never` check in the serializer that turns "unhandled kind"
into a type error — but only if you add the kind to the union first and the
serializer last. Follow the order below.

## Non-Goals

- Does NOT add pages (use `add-page`).
- Does NOT change page copy (that is a content edit in `translations/{es,en}.ts`).
- Does NOT apply to the home page, which has its own act system
  (`docs/DESIGN.md` §6).

## Procedure

### 1. The union — `src/lib/translations/types.ts`

Add the variant to `InstitutionalBlock`. Keep the shape small and declarative;
a block describes *what the content is*, never how it is styled. Reuse
`InstitutionalFigure` for anything with an image so the responsive set and the
caption contract come for free.

### 2. The renderer — `src/components/pages/InstitutionalPage.astro`

Add a `{block.kind === 'yourKind' && ( … )}` branch inside the block loop.

- Colour only from `--color-corag-*`; the `fill`/`on-fill` pair never flips.
- Images go through `InstitutionalFigure` (CSS frames, `width`/`height`,
  `srcset`, lazy below the fold).
- Add `data-reveal` for the shared scroll-reveal; never hide content by
  default.
- Grid and flex children that can hold long unbreakable strings need
  `min-w-0`, or a URL will widen the whole page on a phone.

### 3. The serializer — `src/lib/markdown-for-agents.ts`

Add a `case` to the switch in `serializeInstitutionalPageToMarkdown`. The
`never` default will fail the type check until you do.

Ask what an **agent reading the twin** needs in order to learn what a person
reading the page learns. A figure contributes its alt text *and its caption* —
for app screenshots the caption carries the live-data declaration, which is a
rule-0 obligation, not decoration.

### 4. The tests — `tests/unit/lib/institutional-pages.test.ts`

- Add the kind to the fixture copy object.
- Bump the `new Set(kinds).size` assertion.
- Add a marker for it to the "drops nothing" list.
- If it introduces a new serialized shape (a caption, a link, a nested
  figure), assert that shape directly.

## Validation

```bash
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
pnpm run md:check:strict && pnpm run parity:check:strict
pnpm run responsive:audit:quick     # catches the min-w-0 class of bug
```

`md:check` and `parity:check` are the ones that matter here: they prove the
twin still carries every page's content in both languages.

## Acceptance criteria

- [ ] Kind renders, serializes, and is covered by the fixture test.
- [ ] Breaking the serializer branch fails the suite (verify it, do not assume).
- [ ] No horizontal overflow at 280–390px on any page using the kind.
- [ ] Both locales and both twins consistent.

## Reference

- Block system and treatment tiers: `docs/DESIGN.md` §"Institutional page system".
- Worked example: the `figure`, `split` and `statPair` kinds, added together in
  commit `ac2d147`.
