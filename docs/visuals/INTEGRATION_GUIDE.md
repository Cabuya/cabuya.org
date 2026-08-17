# Integration Guide — getting generated art into the repo

> What to do with a file once the image agent hands it back. Read
> [STYLE_GUIDE.md](./STYLE_GUIDE.md) first; this covers only the mechanics
> after generation.

---

## 1. Accept or reject

Check these before anything else. All four are cheap to verify and expensive to
discover later:

1. **Corner hex.** Sample all four corners of a filled asset. Light must be
   exactly `#FAF9F6`, dark exactly `#082A24`. Anything else leaves a visible
   rectangle on the page, and this is the failure that happens most.
2. **No text.** Zoom in. Generators add stray glyphs, signatures and half-formed
   letters in the margins with some regularity, and one asset serves every
   language — a word in the art breaks that permanently.
3. **One accent.** If you cannot point at the single gold strand, or if there
   are two, reject it.
4. **Reads at target size.** View it at the *displayed* size from §5 of the
   style guide, not at @2x. Most rejections are detail that only exists at 2×.

## 2. Convert

```bash
pnpm run images:optimize
```

Produces WebP at the responsive widths the site uses. The OG card is the
exception — it stays JPEG, because some crawlers do not negotiate WebP and a
share card that fails to render is worse than a larger file.

Target weights: hero under 120 KB, section illustrations under 80 KB, marks
under 15 KB, OG card under 300 KB.

## 3. Place

```
public/images/visuals/{area}/{slug}.webp
public/images/visuals/{area}/{slug}-dark.webp
```

Paths come from the entry, not from judgement. `{area}` ∈ `home` ·
`developers` · `registry` · `governance` · `marks`; the OG card lives at
`public/images/og-default*.jpg` where `getDefaultOgImage()` already looks.

## 4. Embed

```astro
<picture>
  <source
    srcset="/images/visuals/home/hero-cordage-dark.webp"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="/images/visuals/home/hero-cordage.webp"
    alt=""
    width="520"
    height="650"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</picture>
```

Non-negotiable:

- **`width` and `height` always.** A hero without them is the largest layout
  shift on the site.
- **`loading="lazy"` below the fold, `eager` above it.** The hero is the LCP
  candidate and also takes `fetchpriority="high"`.
- **`alt=""` for decorative art**, which is nearly all of it. An atmospheric
  illustration described in prose is noise in a screen reader, not access.
- **The dark source only for matched pairs.** A transparent asset takes a plain
  `<img>`; adding a `<source>` that points at a file which does not exist
  silently breaks the image in dark mode.

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
`generated` → `integrated`. `analysis_results/illustrations/INDEX.md` carries
the same statuses and is the at-a-glance view.
