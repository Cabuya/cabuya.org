---
version: "0.1"
status: draft
section: 0
order: 0
title: Introduction
---

# §0 — Introduction

**This document is a DRAFT (0.1) under working-group review.** Every normative
statement is a proposal until adopted through the RFC process
([`/rfcs`](/rfcs)); nothing here commits any team. A release candidate becomes
normative only after at least one publisher ships it publicly (§8).

## §0.1 What the Cabuya Protocol is

Cabuya is an open interoperability protocol for aid applications. It defines:

1. **One schema, four transports.** A static JSON feed (L2), a read API (L3),
   a write API (L4) and an MCP surface are projections of the **same**
   `place` record — a static feed is a degenerate read API and vice versa.
2. **A discovery mechanism** — a manifest at a well-known path plus a
   PR-reviewed registry (§2).
3. **A conformance ladder** (L0–L4), **measured by a published validator,
   never self-declared** (§1, §8).
4. **Normative exclusions that do not move** — person-level data never
   travels; contact values never travel; data enters by publication, never by
   scraping (§7).

The founding principle, normative where the spec can carry it:
**«Crecemos juntos: no competimos, nos alimentamos»** — feeds exist so apps
feed each other.

## §0.2 Conventions

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD
NOT**, **RECOMMENDED**, **MAY** and **OPTIONAL** are to be interpreted as
described in RFC 2119 and RFC 8174 when, and only when, they appear in all
capitals.

Machine identifiers (field names, `place_kind` tokens, check ids, level
names) are never translated. Human-readable strings in feeds follow §3's
localization rule, with **`es` as the REQUIRED baseline**.

## §0.3 Document map

| Section | Contents |
|---|---|
| [§1](/developers/spec/0.1/1-architecture) | The conformance ladder L0–L4 |
| [§2](/developers/spec/0.1/2-discovery) | Manifest, well-known path, the registry |
| [§3](/developers/spec/0.1/3-the-feed) | The feed envelope and the `place` record |
| [§4](/developers/spec/0.1/4-api-surface) | Read/write APIs, consumption rules, sync, MCP |
| [§5](/developers/spec/0.1/5-identifiers) | Record and place identity |
| [§6](/developers/spec/0.1/6-trust-and-verification) | The verification block; threat posture |
| [§7](/developers/spec/0.1/7-normative-exclusions) | The lines that don't move |
| [§8](/developers/spec/0.1/8-versioning-and-conformance) | SemVer, profiles, measured conformance |
| [Appendix A](/developers/spec/0.1/appendix-a-design-decisions) | Non-normative: decision log + the implementability walkthrough |

Schemas: [`manifest.schema.json`](https://cabuya.org/schemas/0.1/manifest.schema.json)
· [`place-feed.schema.json`](https://cabuya.org/schemas/0.1/place-feed.schema.json)
— with five worked examples (two valid, three invalid with designed error
messages) in [`examples/`](/developers/schemas).
