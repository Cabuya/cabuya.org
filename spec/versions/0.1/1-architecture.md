---
version: "0.1"
status: draft
section: 1
order: 1
title: Architecture — the conformance ladder
---

# §1 — Architecture: the conformance ladder

The protocol is a **ladder, not a gate**. Every level is a respected
membership class; each level up unlocks more of the network's value. Levels
are cumulative.

## §1.1 The levels

| Level | Name | Requirements (summary) | Badge | Typical effort |
|---|---|---|---|---|
| **L0** | **Listed** | Appears in the registry with a reviewed entry: canonical URL, declared aliases, entity domains, crawl/reuse policy. | `listed` | One PR, minutes |
| **L1** | **Linked** | Publishes the **manifest** (§2) with identity, conformance target, `public_url` pattern, license, `permitted_use`, org-level contact. Links out to peers. | `linked` | ≤ 1 hour (a static JSON file) |
| **L2** | **Publishes** | Serves ≥ 1 conforming **place feed** (§3) passing the validator at profile `Core`. | `publishes` | **One afternoon** (small apps); days (medium) |
| **L3** | **Serves & consumes** | Serves the **read API** (§4.1) *or* live-refreshed feeds with sync signals (§4.4); **consumes** ≥ 1 peer feed under the consumption rules (§4.3). | `interop` | Days |
| **L4** | **Federates** | Accepts **writes** (§4.2) with `source`+`external_id` idempotency; optionally exposes MCP (§4.5). | `federates` | Per-app |
| — | **Directory-only** | For apps whose records are irreducibly personal, or who choose not to publish: L0/L1 forever, stated plainly, **respected**. | `listed` / `linked` | — |
| — | **Link-out-only** | People-domain apps: L0/L1 ceiling **by rule §7.1**, not by choice. | `listed` | — |

## §1.2 Preconditions for L2+

From observed production failures (the "discovery trap"):

- A real `robots.txt` (HTTP 200, `text/plain`).
- The manifest path **excluded from SPA catch-alls**. The validator treats
  `200 + text/html` at a discovery path as *absent* (the soft-404 rule), with
  byte-size equality against `/` as the discriminator.

## §1.3 The HXL/CSV on-ramp (below L2)

An HXL-tagged spreadsheet at a stable URL is an accepted **generator input**:
conversion tooling (the skill / the validator's `convert` mode) produces the
conforming JSON feed from it. One canonical schema still holds (§3.2);
conformance is measured on the **produced feed**. The converter MUST drop
contact columns (§7.2) unless declared institutional.

## §1.4 Design constraint: the afternoon bar

The floor for "publishes data" is deliberately **one afternoon of work with
exactly one human decision** (the PII gate). Normative changes that would
raise that bar require an RFC that names the cost explicitly (see Appendix A
for the walkthrough this bar is calibrated against).
