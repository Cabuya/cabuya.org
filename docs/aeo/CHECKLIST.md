# AEO Monthly Maintenance Checklist

**Purpose:** Repeatable checklist to maintain and improve Corag AEO (Answer Engine Optimization) health over time.

## 1. Content Freshness

- [ ] Check if `public/llms.txt` includes every recent blog post and institutional page
- [ ] Check if `public/llms-full.txt` has accurate descriptions and URLs
- [ ] Verify blog post count in llms files matches actual content (`ls src/content/blog/en/ | grep -v _demo | wc -l`)
- [ ] Verify the post count (`ls src/content/blog/es/*.md | wc -l`) matches the public catalogue and equals the English count
- [ ] If new blog posts were added, verify they have complete frontmatter (`title`, `description`, `pubDate`, `tags`, `heroImage`, `author`)
- [ ] If a new institutional page landed, verify it is in `src/middleware.ts` — otherwise it 404s in production only

## 2. Indexation Health

- [ ] Check Google Search Console for crawl errors: https://search.google.com/search-console
- [ ] Check Bing Webmaster Tools: https://www.bing.com/webmasters
- [ ] Verify indexed page count matches expected (institutional pages + blog posts + tag pages, in both languages)
- [ ] Check for any pages showing "Excluded" or "Not indexed" status

## 3. Sitemap & Robots

- [ ] Verify sitemap is accessible: `curl -s https://cabuya.org/sitemap-index.xml | head -5`
- [ ] Verify robots.txt is accessible: `curl -s https://cabuya.org/robots.txt | head -10`
- [ ] Confirm no accidental blocks in robots.txt for content pages
- [ ] Verify sitemap includes `<lastmod>` entries (automatically set at build time)
- [ ] Verify `/internal/*` pages are excluded from the sitemap

## 4. Schema Validation

- [ ] Run Rich Results Test on 2-3 pages:
  - Homepage: https://search.google.com/test/rich-results?url=https://cabuya.org/
  - A blog post: https://search.google.com/test/rich-results?url=https://cabuya.org/blog/how-to-tell-if-a-foundation-is-trustworthy/
  - About page: https://search.google.com/test/rich-results?url=https://cabuya.org/about/
- [ ] Verify JSON-LD is valid (no warnings or errors)
- [ ] Check that BlogPosting schema has: headline, description, datePublished, dateModified, author (with image), publisher

## 5. LLM Testing

Test 5 target queries from `docs/aeo/QUERIES.md` across AI engines:

- [ ] **ChatGPT**: Ask 5 queries. Note: Does it mention cabuya.org? Does it cite a specific URL?
- [ ] **Claude**: Same 5 queries. Note results.
- [ ] **Perplexity**: Same 5 queries. Note results (Perplexity shows sources explicitly).
- [ ] **Google AI Overview**: Search 3 queries on Google. Check if AI Overview cites the site.

Record results:

| Query | ChatGPT | Claude | Perplexity | Google AI |
|-------|---------|--------|------------|-----------|
| (query 1) | Cited? Y/N | Cited? Y/N | Cited? Y/N | Cited? Y/N |

## 6. Performance

- [ ] Run Lighthouse on homepage: `pnpm run lighthouse` (or Chrome DevTools)
- [ ] Confirm all scores remain at 100 (or 95+ minimum)
- [ ] Check Core Web Vitals in Google Search Console
- [ ] Verify no new JS was accidentally added (check bundle size with `pnpm run search:budgets`)

## 7. RSS & Feeds

- [ ] Verify Spanish RSS: `curl -s https://cabuya.org/rss.xml | head -20`
- [ ] Verify English RSS: `curl -s https://cabuya.org/en/rss.xml | head -20`
- [ ] Confirm latest posts appear in feeds

## 8. Markdown for Agents

- [ ] Verify `.md` endpoints are generated: `find dist -name "*.md" | wc -l` (should be 100+)
- [ ] Spot-check a blog post `.md` endpoint: `cat dist/blog/how-to-tell-if-a-foundation-is-trustworthy.md | head -15`
- [ ] Verify content-type is set in endpoint source: `grep "text/markdown" src/pages/blog/\[slug\].md.ts`
- [ ] Check page endpoints exist: `ls dist/about.md dist/contact.md dist/en/about.md`
- [ ] Verify blog index: `cat dist/blog/index.md | head -20`
- [ ] Ensure `llms.txt` references Markdown endpoints: `grep "\.md" public/llms.txt`
- [ ] Verify content negotiation middleware: `grep "text/markdown" functions/_middleware.ts`
- [ ] **Sync check:** Compare page `.md` files against HTML content — no major sections missing
- [ ] **Bilingual sync:** EN and ES `.md` files cover the same sections (`ls src/content/pages/en/ src/content/pages/es/`)
- [ ] **Analytics:** nothing to verify here. Both providers measure page views
      and referrers and neither records a custom event, so the `markdown_request`
      events these two lines used to check do not exist. Twin usage is not
      measured, and that is a decision rather than a gap — see `docs/ANALYTICS.md`
- [ ] Full docs: [Markdown for Agents](MARKDOWN_FOR_AGENTS.md)

## 8b. Agent-readiness (isitagentready.com)

What the scanner asks for, and what this site answers. The four "not published"
rows are decisions, not gaps: each would raise the score and describe
infrastructure that does not exist.

**Published**

- [ ] `/auth.md` → `200`, states there is no authentication, and lists every
      public endpoint with the limits `functions/api/validate.ts` enforces
- [ ] `/.well-known/agent-skills/index.json` → `200`, RFC v0.2.0 shape, and
      every `sha256` matches the skill it points at
- [ ] `/.well-known/agent-skills/publish-a-feed/SKILL.md` → `200`
- [ ] `/.well-known/agent-skills/adopt-cabuya/SKILL.md` → `200`, quotes only
      commands proven in the pack's release transcript
- [ ] WebMCP: `navigator.modelContext.provideContext()` declares
      `validate_cabuya_feed` and `read_cabuya_page_as_markdown` on every page
      (`src/components/agents/WebMcpTools.astro`, inline + feature-detected)
- [ ] `/.well-known/api-catalog` → `200` (RFC 9727) and `/openapi.json` → `200`
- [ ] `/llms.txt`, `/llms-full.txt`, and a `.md` twin for every page
- [ ] DNS-AID: an HTTPS record for `_index._agents` — `pnpm run dns:aid:dry-run`
      first, then `dns:aid:publish` with `CF_API_TOKEN`. See [DNS_AID.md](DNS_AID.md)

**Not published, on purpose**

| Asked for | Why not |
|---|---|
| `/.well-known/openid-configuration` | No OpenID Provider. Nothing to sign in to. |
| `/.well-known/oauth-authorization-server` | No authorization server, and no `agent_auth` block to put in it. |
| `/.well-known/oauth-protected-resource` | Nothing here is protected. Every byte is public. |
| `/.well-known/mcp/server-card.json` | The reference MCP server is specified and **not deployed** (`/developers/mcp`). It ships when two live conforming feeds exist. |
| `_mcp._agents` DNS record | Same reason: there is no MCP host to point it at. The publisher script resolves the host first and refuses if it does not answer. |

Each row becomes a row in the first list on the day the thing itself exists —
`auth.md` carries the same table, so an agent reads the decision rather than
inferring it from a 404.

- [ ] Re-scan: `curl -s https://isitagentready.com/api/scan -H 'content-type: application/json' -d '{"url":"https://cabuya.org"}'`
- [ ] Gate: `pnpm run agents:check` (the generated files match the repository)

## 9. Quick Local Validation

Run these commands before deploying:

```bash
# Full validation suite
pnpm run biome:check && pnpm run astro:check && pnpm run build && pnpm run test

# Check llms.txt files are in build output
ls -la dist/llms.txt dist/llms-full.txt

# Verify sitemap has lastmod
grep "lastmod" dist/sitemap-0.xml | head -3

# Check schema in a built blog post
grep "BlogPosting" dist/blog/how-to-tell-if-a-foundation-is-trustworthy/index.html | head -1

# Verify Markdown endpoints generated
find dist -name "*.md" | wc -l

# Verify per-edition theme on the latest Tech Day page
grep 'BreadcrumbList' dist/how-it-works/index.html
```

## Schedule

| Frequency | Tasks |
|-----------|-------|
| Every deploy | Section 9 (local validation) |
| Monthly | Sections 1-8 (full checklist) |
| Quarterly | Full audit refresh — re-run a fresh AEO audit (see `docs/aeo/AUDIT.md` template) |
