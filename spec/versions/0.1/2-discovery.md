---
version: "0.1"
status: draft
section: 2
order: 2
title: Discovery — manifest and registry
---

# §2 — Discovery

**§2.1** A publisher MUST expose a **manifest**: a JSON document conforming to
[`manifest.schema.json`](https://cabuya.org/schemas/0.1/manifest.schema.json).

**§2.2 Location.** RECOMMENDED at `/.well-known/cabuya.json`. ACCEPTABLE: any
stable HTTPS path declared in the registry entry and advertised with
`<link rel="cabuya" href="…">` in the site's HTML head. The registry entry is
the authoritative pointer; the well-known path is the convention. (Some
volunteer hosts mangle dot-directories — the well-known path is never a MUST.)

**§2.3 Contents.** The manifest carries: `protocol` (name + `spec_version`),
`publisher{}` (registry `publisher_id`, canonical URL, declared aliases,
org-level contact), `conformance_target` (L0–L4), `feeds[]`
(`{name, url, entity, profile}` — auto-discovery style), `api{}` (base URL if
L3+), `mcp{}` (endpoint if any), `license`, `permitted_use[]`,
`crawl_policy_url`, `events[]` (registry event ids served), `languages[]`
(BCP 47).

**§2.4 Registry.** A git-tracked collection of publisher entries, updated by
pull request with human review. Keys are **canonical URL + declared aliases,
never slugs** (the same app has shipped under three names in production). The
registry records each publisher's crawl/reuse policy; **tooling — including
the agent skill — MUST honor it**: no fetching from a publisher whose policy
reserves reuse.

**§2.5 Why both mechanisms.** A registry outage must not break
publisher-to-publisher reads (so well-known paths exist); catch-all SPAs and
host limitations prevent a well-known-only rule (2 of 20 observed hosts could
not serve one honestly). Both, each doing the job it is good at.
