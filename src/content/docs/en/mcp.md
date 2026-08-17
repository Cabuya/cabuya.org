---
title: MCP server
description: The reference MCP server is specified and not yet deployed. What it will expose, the boundary it must not cross, and the two-feed condition that gates it.
section: consuming
order: 1
updated: 2026-08-17
---

> **Status: specified, not deployed.** No endpoint exists yet. It ships when at
> least two live conforming feeds exist to federate over, and not before —
> [why below](#why-it-is-not-built-yet). Nothing on this page describes running
> software. It describes a contract we have committed to, so that anyone
> building against the protocol can see where the agent surface is going.

MCP is an **optional layer above the protocol, never the conformance floor**
([§4.5](/developers/spec/0.1/4-api-surface#4-5)). An application at L2 is
conforming whether or not it has anything to do with MCP; the reference server
is a convenience the initiative runs over the network, not a fifth thing to
implement.

## The boundary it must not cross

There are two kinds of MCP server in this ecosystem and confusing them would
undo the point of the protocol.

| | **Network-level MCP** (this one) | **Product-level MCP** (each app's own) |
|---|---|---|
| Owner | The initiative | Each application |
| Scope | Every registered publisher's public place data | That app's own product, including what the protocol does not model |
| Entities | `place` only in v0.1 | Whatever the app offers — matching, cases, workflows |
| Auth | None for reads | The app's own |
| Person-level data | **Impossible by construction** — the server speaks only the `place` schema | The app's own policy, outside this protocol |
| Tool names | English identifiers | May be Spanish; the registry records them as-is |

**The rule, stated once:** the network server **never** proxies a product MCP,
never aggregates a product's non-protocol endpoints, and never presents itself
as a substitute for one. It *lists* them — `list_publishers` returns each
publisher's declared `mcp{}` endpoint — so an agent can connect directly to the
app.

The reason is the same one behind the whole protocol. An initiative-run server
that quietly became the front door to twenty applications would recreate
exactly the centralisation this design exists to avoid, and it would do it
while wearing the language of interoperability. A directory that becomes a
gateway has changed what it is.

## The four tools

Each is a 1:1 projection of the read and write surfaces already specified in
[§4.1 and §4.2](/developers/spec/0.1/4-api-surface#4-1). Their input and output
schemas are **generated from the same JSON Schemas the validator uses**, not
hand-written — same schema, fourth transport.

| Tool | Input | Output |
|---|---|---|
| `list_publishers` | `{ level?, entity?, municipality?, event?, status? }` | Registry entries with measured status, badge state, last-validated timestamp, declared licence and `permitted_use`, and the `mcp{}` endpoint if there is one |
| `search_places` | `{ municipality?, kind?, q?, bbox?, updated_since?, limit?, cursor? }` | A feed envelope with `data.places[]` and `next_cursor`, plus `sources[]` and `unreachable[]` |
| `get_place` | `{ qualified_id }` | The record, its full provenance chain, and its freshness block |
| `publish_place` | `{ target_publisher, source, external_id, place }` | The publisher's echo response including moderation state — only against publishers whose manifest declares write support |

## Federation, and what it refuses to hide

The interesting design is not the fan-out. It is what the response says when
the fan-out does not fully succeed.

**Partial results are explicit.** Every response carries `sources[]` — who
answered, each with their `last_updated` — and `unreachable[]`, who did not and
why. Dropping a publisher silently would make the network look smaller and
fresher than it is, which is the same dishonesty the freshness rules exist to
prevent, committed by the layer that was supposed to enforce them.

**Consent is checked before the fetch.** A publisher whose `permitted_use`
excludes `ai_answer` is not queried for an agent, and the response says so in
`excluded_by_policy[]` rather than pretending they do not exist. Excluded is a
fact about permission; absent is a fact about existence, and an agent that
cannot tell them apart will report the wrong one to a person.

**Attribution travels and freshness is rendered.** Every returned record keeps
its `source{}` chain and the publisher's attribution string, and carries its
`last_confirmed_at` age and `contradictions_active`. The tool description tells
the calling agent it MUST display them — the
[consumption rules](/developers/consume) do not stop applying because the
consumer is a language model.

**Bounded by design.** Eight seconds and twelve publishers per request, ordered
by declared relevance, `ttl` honoured per publisher from their own envelope,
cache in memory and never written to disk.

## Person-level data is impossible, not forbidden

Three structural guarantees rather than three policies:

1. The server's only output schema is the `place` schema. There is no code path
   that can emit a person-level field because there is no type for one.
2. It accepts no query that could act as a person lookup. Free-text search runs
   against place `name` and `description` only, and `q` is length-capped.
3. It holds no write credential. `publish_place` passes the caller's own
   credential through per request and stores nothing — the initiative must
   never hold write access to another team's system.

This is the [join prohibition](/developers/spec/0.1/7-normative-exclusions#7-1)
expressed as architecture. A policy can be forgotten under deadline pressure; a
missing type cannot.

## Why it is not built yet

Because a federation server with one feed behind it is a proxy, and a proxy
that calls itself a network is a claim we cannot back.

The condition is **two live conforming feeds**, and the acceptance test is
concrete: an agent answers a real question over two publishers' data, with
attribution and ages intact. Until that is demonstrable, building the server
would mean shipping something whose whole value proposition is untested — and
publishing an endpoint that suggests a network exists when it does not is
precisely the kind of claim
[the project's first rule](/developers/spec/0.1/8-versioning-and-conformance#8-3)
forbids.

The specification exists now, ahead of the code, on purpose. Anyone building an
agent integration can see the tool names, the schemas and the guarantees, and
can tell us they are wrong before they are expensive to change.

## What to do in the meantime

An agent does not need this server to work with the protocol. It needs the
protocol, which is a document, and the [agent skill](/developers/skill) vendors
it — the skill works with no network at all, because the specification is text
and a schema is a file.

For reading live data today: the feeds are static JSON at stable URLs and the
[read API](/developers/spec/0.1/4-api-surface#4-1) is plain HTTP. There is no
transport in this protocol that requires a client library, which was one of the
design goals.
