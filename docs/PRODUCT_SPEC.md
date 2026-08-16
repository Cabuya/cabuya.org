# Product Specification — cabuya.org

> The product definition for this repository: what cabuya.org is, who it
> serves, what it ships, and how success is measured. Derived from the
> founding record (`docs/context/` — especially `DECISIONS.md`,
> `PROTOCOL_DESIGN.md`, `PRODUCTS_BLUEPRINT.md`); where this document and the
> founding record disagree, the decision log
> ([`docs/DECISIONS.md`](./DECISIONS.md)) explains why.

---

## 1. Vision and mission

**Vision.** Aid applications — built by anyone, anywhere — publish and consume
the same data, so that in an emergency no volunteer team ever rebuilds a list
another team already maintains, and no citizen has to check five apps to find
one open collection point.

**Mission.** Publish and steward the **Cabuya Protocol**: an open, CC0
specification with a published validator, a reviewed registry, and an
installable agent skill, designed so a small team can reach conformance **in
an afternoon** without asking anyone for permission.

**The long horizon** — stated as ambition, never as achievement (Rule-0): an
emergency data network for Colombia's August 2026 response → a lasting
interoperability standard for aid apps → a seed for a regional technology
ecosystem. Any city, any country, should be able to adopt the protocol and the
method that produced it.

**The founding principle:** «Crecemos juntos: no competimos, nos alimentamos.»
Each app is a thread; the protocol is the rope.

## 2. What Cabuya is — and is not

| Cabuya IS | Cabuya is NOT |
|---|---|
| A **protocol**: one `place` schema, four transports (static feed ≡ read API ≡ write API ≡ MCP) | An aid application — publishing needs, offering help, tracking cases all happen in the member apps |
| A **validator** that measures conformance (`@cabuya/validator`) | A certification authority — nothing is "certified", things are *measured* |
| A **registry** of publishers with measured, falsifiable badges | A directory of "trustworthy organizations" — *inclusion is not endorsement*; a directory lists, a registry measures |
| An **agent skill** that teaches any coding agent the whole protocol offline | A hosted data platform — this project never stores anyone's aid records |
| Open source, CC0 spec, Apache-2.0 code, PR-governed | Owned by any single app or company — governance pre-commits to a multi-party council |

**The line that never moves:** this repository and everything it serves holds
**no person-level data** — no cases, names, personal phone numbers, or
personal media. The protocol excludes person-level data by a **join
prohibition**, not a field omission; people-domain needs converge to the
official channels (Cruz Roja RCF for missing persons, Registro Único de
Damnificados/UNGRD for affected people).

## 3. Audiences — who lands here and what they need first

| Audience | First visit needs | Primary surface |
|---|---|---|
| **Implementer developers (and their coding agents)** — the primary audience | "How do I publish a feed?" answered in one screen; copy-paste that works; a validator that tells them exactly what to fix | `/developers/quickstart` → `/developers/validator` |
| **App maintainers deciding whether to adopt** | What it costs (an afternoon), what it never demands (no id rewrite, no central permission), what happens if they shut down (orderly wind-down), the licence answer | `/developers/faq`, the ladder on the landing |
| **Institutional readers** (alcaldías, UNGRD, Cruz Roja context, mesa técnica) | That a verified registry of legitimate points exists and counters fraud; that people-domain data routes to official channels; who governs this | `/`, `/registry`, `/governance` |
| **International adopters** evaluating the method for their own city/country | The spec in English at stable URLs; the governance and adoption method documented well enough to fork | `/developers/spec`, `/governance`, `docs/context/` |
| **Contributors** (volunteer devs with two free hours) | A pre-specified first issue; gates they can run locally; a review, not a redesign | `/join`, `CONTRIBUTING.md` |

## 4. The product surface

| Surface | Job | Success looks like |
|---|---|---|
| **Landing** (`/`, `/es`) | Tell the story in the honest register; route to publish/verify | A stranger understands *what this is* in one screen and knows their next click |
| **`/developers` portal** | The narrow path from "never heard of this" to "my feed is green" | Quickstart → green validator run with no maintainer contact |
| **Spec reader** (`/developers/spec/{v}`) | Normative text at permanent URLs with stable anchors | Validator messages deep-link into it; versions never mutate |
| **Schema reference** | Field-by-field truth generated from the JSON Schemas | Zero drift possible — generated, not written |
| **Live validator** | Paste a URL or JSON → the same report the CLI gives | The most common real defect (missing CORS) is diagnosed correctly |
| **Registry** (`/registry`) | Who publishes what, with *measured* state | A badge click lands on the measurement behind it |
| **Skill page** (`/developers/skill`) | Install blocks per agent | An agent installs it and passes the offline knowledge test |
| **Governance surface** | The rules of the commons: RFC process, trademark/badge policy, wind-down, suspension | A team can predict every consequence before joining |

## 5. The protocol's product model — the ladder, not a gate

Membership is a five-level conformance ladder (L0 listed → L1 linked → L2
publishes → L3 serves & consumes → L4 federates), **measured by the
validator, never self-declared**, with two *respected* non-publishing classes
(directory-only; link-out-only for people-domain apps). The floor for
"publishes data" is deliberately an afternoon of work.

**Adoption-ease is a golden rule:** whenever good architecture and easy
implementation tension, the tie-break is the adopter's afternoon. Complexity
lives on our side of the line (validator, probes, crosswalks, converter); the
adopter's diff stays small (a manifest, a serializer, a config one-liner).
Zero-coordination onboarding: ids need no central minting, the registry PR is
self-service, the badge is measured automatically.

## 6. Success metrics — all **targets**, none claimed

Per Rule-0, every number below is a goal we will measure publicly, not a
result we assert. Measurement source in parentheses.

| Metric | Target | Why it matters |
|---|---|---|
| Machine-readable sources in the ecosystem | from 2 → **10** (registry entries with measured L2+) | The mesa técnica's own adoption goal (M2) |
| Time from quickstart to green badge, no maintainer contact | ≤ **45 minutes** for the copy-paste path | The "done means" bar of the whole product |
| Implementation effort for a small app | ≤ **one afternoon**, exactly **one** human decision (the PII gate) | The walkthrough-proven adoption budget |
| Skill acceptance test | **10/10 + 3/3 offline, on two agent harnesses**, every release | "Install it and the agent knows the protocol" stays a test, not a slogan |
| Registry integrity | 100% of badges backed by a validator run ≤ 6h old (cron) | A falsifiable badge is the only kind worth wearing |
| First-response to contributions | ≤ **48 hours**, stated publicly | Volunteer contributors don't wait in silence |

## 7. Golden rules (product-level)

1. **Rule-0 — never publish a claim we cannot back.** No invented figures
   (citable emergency figures live in `docs/context/DECISIONS.md` M7), no
   endorsements we cannot maintain, no CTA to a channel we do not run, no
   conformance claim the validator has not measured. State the limit instead.
2. **Security.** The one dynamic surface (`/api/validate`) is treated as the
   attack surface it is (full SSRF control set, zero retention); no secrets in
   the repo; PII deny-patterns run over our own fixtures in CI.
3. **Scalability.** Static-first; one schema, four transports; registry as
   git-reviewed data + KV for measured state; no database, no custody problem.
4. **Performance.** Documentation ships 0 KB JS; landing ≤ 40 KB; budgets are
   CI gates (Lighthouse ≥ 95/100/100/95), not aspirations.
5. **Accessibility.** WCAG AA measured (the token system re-computes its own
   contrast); severity never color-alone; the badge speaks to screen readers.
6. **Bilingual parity.** EN canonical at `/`, ES first-class at `/es`, both
   written natively; parity is a build gate. The protocol's **feed-string
   baseline stays `es`** regardless of site topology.

## 8. Deliberately out of scope (v0.1)

The MCP server implementation (needs ≥2 live conforming feeds first) · L3/L4
validator checks beyond their documented catalogue entries · the Extended
profile · portal search · announcements/blog · feed sharding tooling ·
`ci-gate`/`mcp-bridge` skill addons. Each has a phase in the founding
execution plan; the site says "not yet" plainly wherever one is referenced.

## 9. Companion products

| Product | Repo | Relation |
|---|---|---|
| **Cabuya Skill** | `Cabuya/cabuya-skill` | Vendors this repo's `spec/` (checksummed); its acceptance test is the adoption thesis made falsifiable |
| **`@cabuya/validator`** | this repo, `packages/validator/` | One engine, four harnesses — CLI, CI, the portal's live checker, the registry cron |
| **Reference MCP server** | this repo, `packages/mcp-server/` (deferred) | Network-level read surface; never a proxy over member apps |
