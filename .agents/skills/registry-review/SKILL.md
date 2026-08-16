---
name: registry-review
description: Review a registry publisher PR — schema, identity, uniqueness, org-level contact, crawl policy, no hand-written measured state. The reviewer's checklist.
model: sonnet
allowed-tools: Read, Grep, Glob, Bash
tier: 1
---

# Skill: registry-review — reviewing a publisher entry

The registry records what a publisher **claims** and what a reviewer checks
about **identity**. Conformance is written by the validator, never by hand.
*Inclusion is not endorsement.*

## Checklist (all must pass)

1. **Schema:** `pnpm run registry:check:strict` green.
2. **Identity:** the canonical URL serves the app it claims; aliases
   genuinely redirect/serve the same app; the PR author plausibly represents
   the publisher (their confirmation checkbox + any public signal).
3. **Uniqueness:** `publisher_id` unused AND never previously assigned
   (check `registry/history/` and git log — ids are never reassigned, even
   after archive); canonical URL + aliases collide with no existing entry.
4. **No measured fields by hand:** the diff must not touch anything the cron
   writes (KV state, history lines). `declared_target` is a claim — fine;
   any "level"/"badge" value in the entry is a rejection.
5. **Contact is org-level:** role addresses only (`equipo@`, `info@`,
   `team@`). A personal-looking local part → request a change; never merge
   personal contact data.
6. **Crawl policy:** `crawl_policy_url` resolves (200); note its reuse stance
   in the review (consumers must honor it).
7. **No HTML/PII in any field** (the gate checks; eyeball free text anyway).
8. **`proposed` status** for entries added on a team's behalf before their
   own confirmation — never `active` without the publisher's say-so.

## Merge message

State what was verified: "identity checked (canonical + N aliases), id
unique, contact org-level, policy resolves". The review IS the audit trail.
