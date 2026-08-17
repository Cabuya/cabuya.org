/**
 * Sätteri HAST plugins (Astro 7).
 *
 * Sätteri — the Rust-powered Markdown/MDX compiler that is the default in
 * Astro 7 — does not run remark/rehype plugins. These plugins replace the
 * former `rehype-external-links` dependency and the in-repo
 * `rehype-image-defaults.mjs` transform, ported to Sätteri's HAST plugin API
 * (registered via `markdown.processor: satteri({ hastPlugins: [...] })`).
 *
 * The node/context shapes below are intentionally hand-rolled so we avoid
 * pulling in `@types/hast`. They mirror Sätteri's public
 * `HastPluginDefinition` / `HastVisitorContext` types closely enough to
 * register and to keep the visitors type-safe.
 */

/** Minimal HAST element shape — enough for these transforms. */
export interface HastElement {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: unknown[];
}

/**
 * Subset of Sätteri's `HastVisitorContext` used by the plugins below. Mutations
 * are applied through the context (not by reaching into the tree directly) so
 * the Rust side can mirror them back into the arena.
 */
export interface HastVisitorContext {
  setProperty(node: HastElement, key: string, value: unknown): void;
}

/** Shape accepted by `satteri({ hastPlugins })`. */
export interface SatteriHastPlugin {
  name: string;
  element: {
    filter: string[];
    visit(node: HastElement, ctx: HastVisitorContext): void;
  };
}

/**
 * Opens external (http/https) links in a new tab with safe `rel` attributes.
 * Sätteri replacement for `rehype-external-links`.
 */
export function satteriExternalLinks(): SatteriHastPlugin {
  return {
    name: 'external-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href === 'string' && /^https?:\/\//i.test(href)) {
          ctx.setProperty(node, 'target', '_blank');
          ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
        }
      },
    },
  };
}

/**
 * Adds responsive-image defaults to every `<img>` in Markdown/MDX content that
 * doesn't already specify them:
 *
 * - `loading="lazy"` (when absent) — defers below-fold image loading
 * - `decoding="async"` (when absent) — decodes off the main thread
 *
 * Images authored with explicit attributes (e.g. heroes that want
 * `loading="eager"` + `fetchpriority="high"`) are left untouched. Sätteri port
 * of the former `rehypeImageDefaults` transform.
 */
export function satteriImageDefaults(): SatteriHastPlugin {
  return {
    name: 'image-defaults',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        if (node.properties?.loading === undefined) {
          ctx.setProperty(node, 'loading', 'lazy');
        }
        if (node.properties?.decoding === undefined) {
          ctx.setProperty(node, 'decoding', 'async');
        }
      },
    },
  };
}

/**
 * Stable §-numbered ids on specification headings.
 *
 * Validator findings deep-link to `/developers/spec/0.1/3-the-feed#3-1`, and
 * so do the messages an agent reads. Those anchors have to survive editorial
 * changes to the heading text, which a slugified title does not: fixing a typo
 * in "§3.1 The envelope" would move `#3-1-the-envelope` and break every
 * message that already shipped.
 *
 * So the id comes from the number the heading itself declares. `## §3.1 The
 * envelope` becomes `#3-1` — derived from the document's own numbering, which
 * is the thing the specification promises to keep stable.
 *
 * Headings without a § number keep whatever id the renderer gave them; this
 * plugin only claims the numbered ones.
 */
export function satteriSpecAnchors(): SatteriHastPlugin {
  return {
    name: 'spec-anchors',
    element: {
      filter: ['h1', 'h2', 'h3', 'h4'],
      visit(node, ctx) {
        const text = collectText(node);
        // §3.1 · §7.2.1 · Appendix A.2 — the number, however deep.
        const match = text.match(/§\s*([0-9]+(?:\.[0-9]+)*)/);
        if (!match) return;
        ctx.setProperty(node, 'id', match[1].replace(/\./g, '-'));
      },
    },
  };
}

/**
 * Marks RFC 2119 keywords so they read as normative rather than as emphasis.
 *
 * In a specification MUST and SHOULD are terms of art, and the difference
 * between them is the difference between conforming and not. Rendered as plain
 * uppercase they look like shouting; wrapped in `<b class="rfc2119">` they get
 * small-caps and a letterspace, which is how printed standards have signalled
 * this for decades.
 *
 * A plugin rather than authored markup: the spec files are CC0 and vendored by
 * the skill, and they must stay readable as plain Markdown. Presentation
 * belongs to whoever renders them.
 */
export function satteriRfc2119(): SatteriHastPlugin {
  const KEYWORDS =
    /\b(MUST NOT|SHALL NOT|SHOULD NOT|MUST|SHALL|SHOULD|REQUIRED|RECOMMENDED|MAY|OPTIONAL)\b/g;

  return {
    name: 'rfc-2119',
    element: {
      filter: ['p', 'li', 'td'],
      visit(node, ctx) {
        const children = node.children as unknown[];
        let changed = false;

        const next = children.flatMap((child) => {
          if (!isTextNode(child)) return [child];
          const value = child.value;
          if (!KEYWORDS.test(value)) return [child];
          KEYWORDS.lastIndex = 0;

          const parts: unknown[] = [];
          let cursor = 0;
          for (const match of value.matchAll(KEYWORDS)) {
            const start = match.index ?? 0;
            if (start > cursor) {
              parts.push({ type: 'text', value: value.slice(cursor, start) });
            }
            parts.push({
              type: 'element',
              tagName: 'b',
              properties: { className: ['rfc2119'] },
              children: [{ type: 'text', value: match[0] }],
            });
            cursor = start + match[0].length;
          }
          if (cursor < value.length) {
            parts.push({ type: 'text', value: value.slice(cursor) });
          }
          changed = true;
          return parts;
        });

        if (changed) ctx.setProperty(node, 'children', next);
      },
    },
  };
}

/** A HAST text node. */
interface HastText {
  type: 'text';
  value: string;
}

function isTextNode(node: unknown): node is HastText {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as { type?: string }).type === 'text' &&
    typeof (node as { value?: unknown }).value === 'string'
  );
}

/** Concatenate the text content of a node tree. */
function collectText(node: unknown): string {
  if (isTextNode(node)) return node.value;
  if (
    typeof node === 'object' &&
    node !== null &&
    Array.isArray((node as { children?: unknown[] }).children)
  ) {
    return (node as { children: unknown[] }).children.map(collectText).join('');
  }
  return '';
}
