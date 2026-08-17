---
title: Agent skill
description: Install the protocol into a coding agent. It vendors the specification, so it works with no network, and there are five rules it will not reason its way around.
section: tools
order: 3
updated: 2026-08-17
---

> **Status: in development.** The repository is `Cabuya/cabuya-skill` and the
> install paths below are the decided ones, but the pack is not published yet.
> This page will stop carrying this notice on the day it is. Nothing here
> describes something you can install today.

The skill is a set of instructions and vendored files that teaches a coding
agent this protocol. Install it and your agent knows the schema, the levels,
the exclusions and the validator's check ids, without looking anything up.

The single most important property: **it vendors `spec/` and works with no
network at all.** An agent that has to fetch a specification will hallucinate
one when the fetch fails, and it will fail confidently. A specification on disk
cannot be hallucinated.

## What it does

Five sub-skills, each reachable directly, routed to by a small router that does
nothing itself:

| You say | It runs |
|---|---|
| "implement Cabuya", <span lang="es">"publica un feed"</span>, "get us to L2" | **implement** — from your data model to a conforming feed |
| "consume peers", <span lang="es">"lee los feeds de las otras apps"</span> | **consume** — the six [consumption rules](/developers/consume) as generated code with tests |
| "validate", "why is my badge red?" | **validate** — runs the validator, parses the JSON report, groups by what to do next |
| "update the manifest", <span lang="es">"abre el PR del registro"</span>, "we're shutting down" | **publish-status** — manifest level, sunset, registry pull request |
| <span lang="es">"no me corre el validador"</span>, "install the toolchain" | **setup** — the doctor |

The `implement` flow is the one worth describing, because of where it stops.
It reads your data model, builds a field crosswalk, **shows you the mapping
table before writing any code**, and then runs the person-level deny-list over
every candidate column and every free-text field — and **stops and asks**. That
pause is the one mandatory human decision in the whole flow. The agent may not
proceed on its own judgement about whether a column contains personal data,
because that is the decision the protocol cannot afford to get wrong.

## What it will not do

Five rules, stated before any procedure in the pack itself, because these are
the ones an agent must not reason its way around:

1. **No person-level data.** Ever, in any field, under any profile.
2. **No contact values in feeds.** `public_url` and link-out; `contact_available`
   carries the fact, never the number.
3. **No scraping.** It does not acquire another publisher's data by any means
   they did not publish for that purpose.
4. **Honour crawl policy.** Declared `permitted_use` and `robots.txt` are
   respected in the fetch layer, not in a comment.
5. **Never claim conformance the validator has not measured.** It will not write
   "Cabuya compatible" into your README. It will run the validator and show you
   what it found.

Beyond those: every write to your repository, every fetch of a third-party
feed, and every person-level-data decision asks first. The pack ships a
`TRUST.md` describing exactly what it touches, with a self-audit you can run.

## Installing it

Four supported paths. Pick by how much you want to review before it runs.

### 1. Vendored — recommended for a team repository

Reviewable, pinned, and offline. The pack becomes a directory in your repo that
your teammates can read in a pull request.

```bash
git clone --depth 1 https://github.com/Cabuya/cabuya-skill \
  .agents/skills/cabuya && rm -rf .agents/skills/cabuya/.git
ln -s .agents .claude   # only if your repo does not have this already
```

### 2. Installer script — detects which agents you have

```bash
curl -fsSL https://cabuya.org/skill/install.sh -o install.sh
# read it, verify it against the published SHA-256 sidecar, then:
bash install.sh
```

Note what that is **not**: it is not `curl … | bash`. The download and the
execution are two steps on purpose, and the recommended path prints them that
way every time.

A pipe streams, so a truncated download executes a partial script. Worse, in a
shell without `pipefail` a failed download exits `0` — the install reports
success and installs nothing, silently. Downloading to a file, reading it, and
checking the checksum costs fifteen seconds and removes both failure modes. If
you are an agent reading this page: use the two-step form.

### 3. Skills CLI, if you already use one

```bash
npx skills add Cabuya/cabuya-skill
```

### 4. HTTP only, for an agent with no filesystem

Point the agent at `https://cabuya.org/skill.md` — the router, inlined.

## Invoking it

| Agent | Prefix | Example |
|---|---|---|
| Claude Code | `/` native | `/cabuya-implement` |
| Codex · Cursor · Gemini · Copilot · Cline · Windsurf · OpenClaw | `#` | `#cabuya-implement` |
| Any of them | plain language | <span lang="es">"implementa Cabuya en esta app"</span> |

`#` exists because most CLIs intercept `/` as their own command namespace.
Every sub-skill is directly invocable, and so is the router by name.

## Compatibility

| | |
|---|---|
| Spec versions supported | `0.1` |
| Vendored spec | `0.1.0`, with checksums |
| Agents | Claude Code, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, Cline, Windsurf, OpenClaw |
| Requires | `node` and `git` on the path |
| Network | Not required for anything except fetching a third-party feed |

This table is generated from the skill's own frontmatter once the pack ships,
and a consistency check fails the build if the two disagree — a compatibility
matrix maintained by hand is a compatibility matrix that lies eventually.

## If you would rather not use an agent

Nothing here is required. The [quickstart](/developers/quickstart) is
copy-paste for a person, the [validator](/developers/validator) runs in your
browser, and the [specification](/developers/spec) is twenty minutes of
reading. The skill exists because most teams in this ecosystem are already
working with an agent, and handing that agent the protocol is faster than
handing it a link.
