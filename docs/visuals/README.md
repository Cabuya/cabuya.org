# docs/visuals — the illustration pack

Wordless generated artwork for cabuya.org. Anything with text is a diagram
component instead: `docs/DIAGRAM_COMPONENTS.md`.

| File | What it is |
|---|---|
| [INDEX.md](./INDEX.md) | Every entry, its delivered aspect ratio and its status, at a glance |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | The house style block, palette, edges rule, dimensions, and the prompt entry schema. Read first |
| [VISUAL_INVENTORY.md](./VISUAL_INVENTORY.md) | Every surface on the site, classified illustration / diagram / skip |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | What to do with a generated file: accept checks, conversion, embedding, the placeholder policy |
| `prompts/*.md` | One file per entry — `01-hp-*` landing, `02-dv-*` portal, `03-rg-*` registry and governance, `04-og-*` share cards, `05-mk-*` marks and ornament |

**Thirteen illustrations plus the share cards, ten skip decisions.** Each
**Prompt** field is self-contained: hand it to an image agent with no other
context and the result should be usable.

## Where the artwork lives, and how it gets in

The masters — the generated PNGs — are **not** in this repository: they are large,
they are the founder's to regenerate, and the pack is the brief rather than the
archive. What is committed is the derived WebP under
`public/images/visuals/{home,developers,registry,governance,marks}/`, produced by

```bash
pnpm run illustrations:build -- --masters=/path/to/masters   # WebP 1x + 2x
pnpm run og:cards -- --masters=/path/to/ogimage              # the share cards
```

and placed by one component, `src/components/editorial/Illustration.astro`,
reading one registry, `src/lib/illustrations.ts`. **Never a raw `<img>` for
artwork**: the component is where `alt=""`, the intrinsic dimensions, the
`decoding`, the `srcset` and the never-a-`prefers-color-scheme`-`<picture>` rule
are enforced, and where `illustrations:check` finds every drawing to measure it.

Two gates hold it together:

| Gate | What it proves |
|---|---|
| `pnpm run test` → `illustrations.test.ts` | Every declared dimension, aspect ratio, alpha channel, `srcset` and weight matches the file on disk; no `-dark` variant exists; no orphan file ships |
| `pnpm run illustrations:check` | Every drawing arrives on its surface — decoded, visible, unclipped, undistorted and large enough to read — at fifteen viewports in both themes |

`docs/visuals/` is the permanent home for this pack.
