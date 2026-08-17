# Integration Guide — getting generated art into the repo

> What to do with a file once the image agent hands it back. Read
> [STYLE_GUIDE.md](./STYLE_GUIDE.md) first; this covers only the mechanics
> after generation.

---

## 1. Accept or reject

Check these before anything else. All four are cheap to verify and expensive to
discover later:

1. **Alpha, and clear edges.** Sample all four corners: every one must be
   fully transparent (alpha 0). A ground baked into the file shows as a
   rectangle in one of the two themes, and no lossy encode reproduces the page
   hex exactly anyway. Then check the borders: no ink may touch the left, right
   or bottom edge, and the clear margin should be ~8% of the canvas. (`HP-01`
   may cross the top edge; nothing else may cross any.) The OG card is the one
   filled asset — its four corners must sample to exactly `#FAF9F6`.
2. **No text.** Zoom in. Generators add stray glyphs, signatures and half-formed
   letters in the margins with some regularity, and one asset serves every
   language — a word in the art breaks that permanently.
3. **One accent.** If you cannot point at the single gold strand, or if there
   are two, reject it.
4. **Reads at target size.** View it at the *displayed* size from §5 of the
   style guide, not at @2x. Most rejections are detail that only exists at 2×.

## 2. Convert — one command, and it re-frames

```bash
pnpm run illustrations:build -- --masters=/path/to/masters      # every entry
pnpm run illustrations:build -- --masters=… --only=registry-net # one entry
pnpm run og:cards -- --masters=/path/to/ogimage                 # the share cards
```

`scripts/build-illustrations.mjs` does three things a resize does not:

1. **It re-frames.** The master is trimmed to the drawing's own bounding box and
   padded back out with transparency until the ink occupies at most 84% of each
   axis. Nothing is cropped, so the composition is untouched — but the delivered
   aspect ratio is the drawing's rather than the canvas the generator chose, and
   **the edges rule is satisfied by construction.** This is the accept-check in
   §1.1 turned into a build step: three assets shipped with a near-zero margin
   before it existed, and no fourth can.
2. **It sizes from the slot, not from the entry.** The `width` per entry is the
   widest box that surface ever renders. The nominal "displayed" figures in the
   entries predate the layouts and are wrong more often than right — `MK-01`'s
   1:1 160 × 160 would have rendered a 4.8:1 rope as a 30 px sliver.
3. **It searches for quality.** Alpha plus dense hatching is the most expensive
   thing this house style produces, so the encoder walks down a quality ladder
   until the file fits its budget, and prints what it used.

Budgets: hero under 96 KB, section illustrations under 80 KB, marks under 15 KB,
OG card under 300 KB, and 2x within 2.4× its 1x budget.
`tests/unit/lib/illustrations.test.ts` enforces every one of them.

The share cards stay JPEG, because some crawlers do not negotiate WebP and a card
that fails to render is worse than a larger file. `scripts/build-og-cards.mjs`
resizes to exactly 1200 × 630 and refuses a master carrying the fallback
generator's EXIF marker — the guard that keeps `prebuild` from overwriting real
artwork works in both directions.

## 3. Place

```
public/images/visuals/{area}/{slug}.webp        # 1x
public/images/visuals/{area}/{slug}-2x.webp     # always, from the same script
```

No `-dark` files: every asset is transparent and serves both themes. The unit
test fails if one appears, and it fails on an orphan too — a file under
`visuals/` that no registry entry claims is dead weight in the deploy.

Paths come from the entry, not from judgement. `{area}` ∈ `home` ·
`developers` · `registry` · `governance` · `marks`; the share cards live at
`public/images/og-default*.jpg` where `getDefaultOgImage()` already looks.

## 4. Embed — the registry and the one component

Declare the asset in `src/lib/illustrations.ts` (path, `srcset`, the intrinsic
size the script printed, and the `sizes` the slot actually renders), then place it:

```astro
---
import Illustration from '@/components/editorial/Illustration.astro';
---
<Illustration
  id="registry-net"
  loading="eager"
  class="mx-auto h-auto w-full max-w-[15rem] sm:max-w-xs lg:max-w-none"
/>
```

**Never a raw `<img>` for artwork.** The component is where the rules live:
`alt=""` (all of it is decorative), intrinsic `width`/`height`,
`decoding="async"`, and a plain `<img>` rather than a `<picture>` with a
`prefers-color-scheme` source — one transparent file serves both themes and a
`-dark` file does not exist to point at. It also stamps `data-illustration`,
which is how `illustrations:check` finds every drawing.

Still non-negotiable:

- **`loading="lazy"` below the fold, `eager` above it.** Only the landing hero
  takes `priority` (`fetchpriority="high"`); it is the LCP candidate.
- **A width switch is allowed; a theme switch is not.** The hero is the one entry
  with two framings — under the header its rope bleeds off the top edge and reads
  as descending out of the chrome, and below the copy on a phone the same bleed
  reads as trimmed. They are served through one `<picture>` with a `media` source
  so only one file is fetched, and the build gives them a matching aspect ratio so
  a single `width`/`height` pair is honest for both.
- **Every drawing renders on a phone.** The hero spent its first weeks
  `hidden lg:flex`, which meant the site's flagship image did not exist for most
  readers. `illustrations:check` fails on an illustration that is missing,
  invisible, clipped, distorted, or under 96 px wide — and on a phone, under a
  third of the content width.
- **Verify on both grounds.** Transparency makes one file legal, not legible.
  Composite against `#FAF9F6` and `#082A24` and look. The registry header and the
  closing panel add a third ground (`#0B3D32`).

## 5. The placeholder policy

**A page ships without its illustration rather than with a placeholder.**

Every layout in this repo must be correct when the art is absent — the grid
collapses to one column, the text takes the full width, and nothing looks
broken. That is a property worth having anyway (someone will block images), and
it means the thirteen prompts in this pack can be generated in any order, over any
timescale, without blocking a single page.

No grey boxes, no "image coming soon", no `min-height` reserving space for a
file that does not exist. An empty slot that nobody notices is strictly better
than a placeholder everybody does.

## 6. After integration

Update the entry's **Status** field in the prompt pack: `to-generate` →
`generated` → `integrated`, and record what actually shipped — the delivered
dimensions, the weights, and every deviation from the entry, with the reason.
[INDEX.md](./INDEX.md) carries the same statuses and is the at-a-glance view.

Then run the two gates, in this order, because the second needs a build:

```bash
pnpm run test                      # illustrations.test.ts: the registry vs the files
pnpm run build && pnpm run illustrations:check
```
