# Governance & Licensing — the unified aid-data protocol

> **TL;DR**
> **Governance:** a **multi-app maintainer council** — not a benevolent dictator, not a foundation yet. The hard neutrality gate is that **v1.0 cannot be tagged until at least two maintainers come from apps other than Corag**, and no single app may hold more than two of the seats. Normative changes go through a lightweight GitHub-PR RFC with a 10-day lazy-consensus window; ties default to *declined*.
> **Escape hatch:** the spec is CC0, every maintainer holds a full git mirror, and a written continuity clause says that if the domain lapses or the org goes dark for 180 days, any two maintainers from two different apps may declare the successor repo. **The spec must be able to outlive any company, any domain and any founder — including this one.**
> **Licensing:** spec text and schemas **CC0-1.0** · all code (validator, skill, MCP server, SDKs) **Apache-2.0** for its express patent grant · contributions via **DCO**, not a CLA · each app declares its own data licence in its manifest, with **CC-BY-4.0** recommended as the default and share-alike discouraged because it poisons aggregation.
> **Brand:** the name and the conformance badge are the **only** things that are not open — gated on passing the public validator, free forever, and revocable, modelled on `Certified Kubernetes` but with **no participation fee**.
> **Cost:** a new neutral GitHub org (free), shared-custody domains, and roughly **USD 50–100 in year one, all of it domains**.
> **Everything here is a proposal for the working group to approve. No team has agreed to anything, and nothing has been registered.**

**Inputs:** plan README (strategic priors, Rule-0, zero-PII rule) · `5.task_governance_naming_licensing.md` · `BRAND_AND_NAMING.md` (this task's companion; `Cabuya` is used as the working name throughout — substitute whatever the group votes for) · live research on Open Referral/HSDS, the Matrix.org Foundation, CNCF conformance and the Open Web Foundation Agreements, all 2026-08-16 UTC.

---

## 1. The reality this has to fit

Governance documents fail when they are written for the organization someone wishes existed. This one is written for the one that does:

| Fact | Consequence for the model |
|---|---|
| Twenty apps; **eighteen have no confirmed public integration surface** | Governance cannot presume technical commitment from anyone. Seats must be earned by shipping a feed, not by attending. |
| Everyone is a **volunteer**; several are students or working nights | Any process with more than one required meeting per month will be abandoned by month three. **Asynchronous by default, or it dies.** |
| **One highly motivated founder** (Corag) with the most capacity | The single biggest governance risk is *benign capture*: the person doing the most work quietly becomes the person who decides. The rules must constrain the most active participant hardest. |
| A **live emergency** creates time pressure | Fast paths must exist for non-normative changes, or people will route around the process entirely. |
| **No legal entity, no bank account, no money** | A foundation is not available in year one. Anything requiring incorporation, fees or signed agreements is out. |
| The protocol touches **people in bad situations** | A privacy review is not an optional RFC section. It is a required one, and it can block. |

**Design principle:** *make the neutral thing the easy thing*. Every rule below is chosen so that the low-effort path — open a PR, wait, merge — is also the path that keeps the spec out of any one organization's hands.

---

## 2. Governance model

### 2.1 The three models compared

| | **A — Single-maintainer benevolent (BDFL)** | **B — Multi-app maintainer council** | **C — Fiscal-host / foundation-backed** |
|---|---|---|---|
| **Shape** | Corag owns the repo, the domain and the final word. Others contribute. | 3–5 maintainers drawn from distinct apps. Lazy consensus; RFC for normative change. | A legal home (Open Collective + fiscal host, Software Freedom Conservancy, Linux Foundation, or a Colombian *entidad sin ánimo de lucro*) holds trademark, domains and funds. |
| **Time to stand up** | Hours | Days | **Months** |
| **Cost** | Zero | Zero | Fees, paperwork, often a % of funds; requires someone to do administration nobody volunteers for |
| **Speed under emergency pressure** | Highest | High — fast path for non-normative changes | Lowest |
| **Bus factor** | **1** | 3–5 | High |
| **Perceived neutrality by the other 19 teams** | **Fails.** This is the exact concern already on the table: a domain registered to one person is not neutrality. | **Passes**, if and only if the non-Corag seats are real and visibly filled | Passes strongest |
| **Can hold a trademark / money / contracts** | Only in a person's name — which is the problem | No | **Yes** |
| **Failure mode** | Founder burns out or is perceived as an owner; adoption stalls on politics, not technology | Council goes quiet and the fast path becomes the only path — *de facto* drift back to A | Process cost exceeds the project's total energy; the spec never ships |
| **Real-world reference** | Many single-vendor "open" specs | Open Referral (lead organizer + technical steward + Technical Committee, [governance doc](http://docs.openreferral.org/en/latest/about/specification-governance.html)) | Matrix.org Foundation — Spec Core Team + Guardians, **deliberately spun out of the company Element** to fix a spec owned by one vendor ([MSC1779](https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/1779-open-governance.md), [Matrix Foundation](https://matrix.org/foundation/about/)) |

### 2.2 Recommendation — **Model B now, Model C pre-committed**

Adopt the **multi-app maintainer council**, and write the upgrade to a fiscal host into the governance document *now*, with named triggers, so that moving to Model C later is an administrative step rather than a political negotiation.

**Why not A.** The stated concern is already correct: *a domain registered to one person is not neutrality*. Nineteen teams are being asked to put a badge on their own product; not one of them should have to trust a single individual's continued goodwill to do it. Model A also carries a bus factor of one in a project whose entire value is durability.

**Why not C yet.** Matrix's Foundation is the right destination and the wrong starting point — it exists because a spec had already succeeded and needed protecting from its own commercial sponsor. Incorporating first would spend the group's scarce energy on bylaws during the exact weeks when a working feed format is what people need.

**Pre-committed triggers for moving to Model C.** Written into `GOVERNANCE.md` at launch so nobody has to argue about it later. Any **one** of these opens the migration RFC automatically:

1. **Eight or more** independently operated conforming implementations in the registry, **or**
2. the project needs to **receive or hold money** (a grant, a sponsorship, an infrastructure bill), **or**
3. someone needs to **own the trademark** as a legal person in order to defend the badge, **or**
4. **two or more** maintainers request it.

Candidate hosts to evaluate at that point: Open Collective with a fiscal host, Software Freedom Conservancy, an existing Colombian *entidad sin ánimo de lucro* willing to act as steward, or the Linux Foundation for a mature spec. **Selecting one is out of scope today** and would be a fabricated commitment if stated as decided.

### 2.3 Co-maintainer criteria

**The neutrality gate — the single most important rule in this document:**

> **`Cabuya 1.0` cannot be tagged until at least two maintainers represent apps other than Corag.** Until then the spec stays at `0.x` and every artefact says `draft`. This is non-negotiable and it is stated publicly, because it converts neutrality from a promise into a release blocker.

**To become a maintainer, all of the following:**

1. **Your app publishes a conforming feed that the public validator passes.** Intent, meeting attendance and enthusiasm do not qualify. Shipping does.
2. **Two or more substantive contributions** — an accepted RFC, a reviewed schema change, a validator or skill contribution, or a documented interop test against another app's feed.
3. **Nominated by an existing maintainer**, confirmed by lazy consensus with a **7-day** objection window.
4. **Agrees to the Code of Conduct** and to the licensing terms in §4.

**Composition limits:**

- **Maximum two maintainers per app or organization**, counting anyone employed by, contracting for, or founding that app. A council of five with three Corag seats is Model A wearing a costume.
- **Target 3–5 maintainers.** Fewer than three is not a council; more than five makes lazy consensus slow without making it more legitimate.
- Maintainers are listed in `MAINTAINERS.md` with the app they represent, so the composition limit is auditable by anyone.

**Emeritus and removal.** A maintainer inactive for **120 days** moves to emeritus automatically (no vote, no drama, restorable on request). Removal for cause requires a Code of Conduct finding or a supermajority of the remaining maintainers, and is recorded publicly with a reason.

### 2.4 Decision rules

Three tiers. Lazy consensus throughout: **silence is assent, an objection must be reasoned, and the burden is on the change.**

| Tier | Scope | Requirement | Window |
|---|---|---|---|
| **Fast path** | Typos, examples, docs, non-normative prose, CI, tests, website copy | **1 maintainer approval**, merge immediately | none |
| **Normative** | Any change to a schema field, cardinality, enum, required/optional status, conformance level, or the meaning of a defined term | **RFC** + **2 approvals from maintainers representing 2 different apps** | **10 calendar days** lazy consensus |
| **Breaking** | Removing or renaming a field, changing a type, changing conformance so an existing conforming feed stops conforming, changing governance or licensing | **RFC** + **majority of all maintainers**, and a written migration note | **21 calendar days** lazy consensus |

**Objections.** A reasoned objection from any maintainer pauses the clock. The objection must state what would resolve it. An objection with no proposed resolution path expires after 14 days.

**Deadlock.** If a normative or breaking RFC is unresolved **30 days** after its window opened, it is **declined by default** and may be reopened with new information. Bias toward *no* is deliberate: an unshipped field costs far less than a field that twenty implementations have to live with forever.

**The founder does not get a casting vote.** There is no tiebreaker, precisely because the person most likely to be handed one is the person the composition limits exist to constrain.

**Emergency clause.** During a declared active emergency, the fast path additionally covers **purely additive, optional** fields — new optional properties that no conforming implementation is required to read or emit — merged on 2 approvals with a **72-hour** window, and **automatically converted into a retroactive RFC within 14 days**. If that RFC is declined, the field is deprecated in the next release. This exists so nobody routes around the process when a feed is needed on Tuesday; it cannot be used for anything that changes existing behaviour.

### 2.5 The escape hatch — the spec outlives any company, domain or founder

This is the clause that makes it safe for nineteen teams to say yes, and it belongs in `GOVERNANCE.md` verbatim, not as an implied understanding.

1. **The licence is the foundation of the escape hatch.** CC0 on the spec means anyone may fork, republish and continue it — legally, forever, without permission. No governance failure can take the spec away from the people using it.
2. **The canonical source is a git repository, and every maintainer holds a complete clone.** `git clone` *is* the backup. The maintainer list therefore doubles as a distributed archive with a floor of three copies.
3. **Identity must not depend on a resolving URL.** Schema `$id` values are versioned URLs, but the validator and every SDK must work fully offline from a vendored copy of the schemas. **A conforming implementation must never require a network call to `cabuya.org` to validate.** Concretely: schemas ship inside the tagged GitHub release and inside the npm package, and both are content-addressable and mirrored by everyone who has ever installed them.
4. **Continuity clause, stated in advance.** *If the canonical domain lapses, or the organization publishes nothing and merges nothing for 180 consecutive days, any two maintainers representing two different apps may publish a successor repository, announce it in the registry and on the last-known channels, and the community follows it. The successor inherits the version numbering and the obligations of this document.* Naming this before it is needed is the point — it converts a future crisis into a procedure.
5. **Domains and org accounts are held in shared custody, never personally** — see §6.3. Registrant contact is a project alias, not a person's name and home address.
6. **Nothing in the protocol may require a central service.** No mandatory registry lookup, no mandatory API key, no mandatory callback. The registry is a convenience and a discovery aid; a feed is valid whether or not the registry knows it exists. **This is what actually makes the spec ownerless** — a protocol with a required central endpoint is owned by whoever runs that endpoint, regardless of what the governance file says.

### 2.6 Code of Conduct

Adopt the **Contributor Covenant 2.1** verbatim at the organization level (`.github/CODE_OF_CONDUCT.md`, inherited by every repo). Two project-specific additions:

- **Reporting goes to a role alias** (`conducta@` / `conduct@`) monitored by **at least two maintainers from two different apps**, never to a single named individual — otherwise reporting a maintainer means reporting them to themselves.
- **A stated recusal rule:** a maintainer who is the subject of a report takes no part in handling it, and if the alias-holders are conflicted the remaining maintainers appoint a temporary handler.

`docs/CODE_OF_CONDUCT.md` in the Corag repository is a useful reference for tone, but the protocol needs **its own**, at the protocol organization, because a code of conduct that lives inside one member app's repo is one more thing the other nineteen teams have to trust.

---

## 3. RFC process

### 3.1 What needs one

| Needs an RFC | Does not |
|---|---|
| Any normative or breaking change (§2.4) | Typos, formatting, examples, tests, CI |
| A new entity, field, enum value or conformance level | Clarifying prose that does not change meaning |
| A change to governance, licensing, or the brand policy | Website copy, translations, tooling internals |
| Anything touching personal data, even indirectly | Adding a new app to the registry (that is a PR against a data file) |

### 3.2 Who may open one

**Anyone.** No membership requirement, no invitation, no app of your own. The reviewers are maintainers; the authors are the world. Lowering the barrier to *proposing* while keeping it meaningful to *decide* is the entire design.

### 3.3 Lifecycle

```
Draft ──► Proposed ──► (lazy-consensus window) ──► Accepted ──► Implemented
   │           │                                       │
   └──►    Withdrawn                              Declined ──► (reopenable with new information)
```

- **Draft** — a PR adding `rfcs/0000-short-slug.md`. Discussion happens in the PR.
- **Proposed** — an author or maintainer marks it ready; a maintainer assigns the number and **starts the clock** (10 days normative / 21 days breaking), announced in the repo's discussion channel.
- **Accepted** — approvals per §2.4, no unresolved reasoned objections; the `## Decision` block is filled in and the RFC is merged. **The merge commit is the record of consensus**, which is why the decision is written into the file rather than left in a thread that a platform migration can delete.
- **Declined / Withdrawn** — merged *anyway*, with the decision and reasoning recorded. **Declined RFCs are part of the spec's memory.** A directory of only the accepted ones loses the more useful half: why the obvious thing was not done.
- **Implemented** — updated once the change lands in a tagged release, with a link to it.

### 3.4 RFC template sketch

```markdown
# RFC-NNNN: {title}

- **Status:** Draft | Proposed | Accepted | Declined | Withdrawn | Implemented
- **Author(s):** {name} ({app or "independent"})
- **Created:** YYYY-MM-DD
- **Tier:** normative | breaking | governance
- **Target release:** {version}
- **Discussion:** {PR link}

## Summary
One paragraph. What changes, in plain language.

## Motivation
The concrete problem. Which app hit it, with what data. Rule-0 applies:
cite a real feed or a real failure, or mark the motivation `hypothetical`.

## Non-goals
What this deliberately does not do. Prevents scope drift during review.

## Specification
The normative text, written so it could be pasted into the spec as-is.
Include the schema diff and at least one full worked example.

## Conformance impact
- Does an existing conforming feed stop conforming? (yes/no — if yes, this is `breaking`)
- New conformance level, or a change to an existing one?
- What does the validator have to check that it does not check today?

## Privacy & PII review  (MANDATORY — may block on its own)
- Does this field, alone or joined with any other public feed, identify a person?
- Could it identify someone's location, health status, immigration status,
  household composition, or the fact that they needed help?
- Does it move any person-level data across an app boundary?
  **If yes, the RFC is declined. Person-level data does not federate — link out instead.**
- Retention and correction: how is this field corrected or withdrawn once published?

## Migration & backwards compatibility
Upgrade path for existing publishers and consumers. Deprecation window.

## Reference implementation
Link to a working branch, a validator test case, or a live feed.
An RFC with no implementation is reviewable but not acceptable.

## Alternatives considered
Including "do nothing", and why it loses.

## Open questions

## Decision  (filled in by a maintainer at merge)
- **Outcome:** Accepted | Declined
- **Date:** YYYY-MM-DD
- **Window:** opened YYYY-MM-DD, closed YYYY-MM-DD
- **Approvals:** {maintainer} ({app}), {maintainer} ({app})
- **Objections raised and how resolved:**
- **Notes:**
```

### 3.5 How RFC-0 fits

**RFC-0 is the founding agreement** — the one RFC that is not a change to the spec but the act of creating it. It is drafted bilingually (ES + EN, per the plan's global guidelines) and carries: the scope and non-goals of the protocol; the entity set; the five-layer integration ladder; the **person-data never federates** rule as a foundational constraint rather than a policy that a later RFC could relax; the governance model in this document; the licensing scheme in §4; and the brand policy in §5.

**RFC-0 is the only RFC whose acceptance is by explicit affirmative agreement rather than lazy consensus** — teams sign on by opening a PR that adds their app to `ADOPTERS.md`. Silence cannot be assent for the document that establishes what silence means. Full drafting is Task 7's deliverable; this document supplies the governance and licensing sections it will incorporate.

---

## 4. Licensing

### 4.1 The specification text and schemas — **CC0-1.0**

| Option | For | Against | Verdict |
|---|---|---|---|
| **CC0-1.0** (public domain dedication) | Maximum reuse with zero bookkeeping. An implementer can paste normative text into their own docs, their code comments, their government procurement annex, a printed handout. No attribution chain to maintain across twenty apps in two languages. Removes every legal question an adopter's lawyer might raise. | No guaranteed attribution. No patent grant. | **Recommended** |
| **CC-BY-4.0** | Keeps attribution, which feels fairer to contributors. | Attribution obligations propagate into every derived document and embedded fragment. For a spec whose selling point is *"implement it in an afternoon"*, that is friction at exactly the wrong moment. | Acceptable second choice |
| **CC-BY-SA-4.0** | Attribution plus share-alike. **Note:** Open Referral's HSDS moved from CC0 at v0.9 to CC BY-SA — this debate is live in our exact domain. | Share-alike on a *specification* can deter commercial and government adopters whose legal review flags viral terms, and it complicates embedding spec fragments into differently-licensed docs. | Not recommended |
| **OWFa 1.0** (Open Web Foundation Agreement) | The only option that does what CC licences do not: an explicit **patent** grant covering implementations of the whole specification, with defensive termination — genuinely best-in-class for a standard. | Requires **signatories**. Contributors sign agreements; the grants attach to signers. That is an administrative process with legal review, and it would stop an all-volunteer project in month one. | Right idea, wrong scale — **the patent concern is answered in §4.2 instead** |

**Recommendation: CC0-1.0** for spec prose, schemas, examples and the RFC archive.

**On the attribution objection.** CC0 gives up the *legal* right to require credit. It does not give up credit: the conformance badge (§5) is trademark-gated, so anyone claiming compatibility names the project by name, and the registry publishes who implements what. **Attribution is enforced by the mark, not by the copyright** — which is both more effective at this scale and enforceable by a project with no lawyer.

**On the patent objection.** CC0 supplies no patent grant, and this is a real gap. It is closed where it actually bites — in running code (§4.2). The residual risk is a patent claim against the *design* rather than an implementation; for a JSON feed format describing collection points and material needs, that risk is remote, and the mitigation is a **prior-art record**: publish dated RFCs, tag releases, and keep the public discussion archive. If the group later wants the full belt-and-braces answer, adopting OWFa 1.0 Patent-Only alongside CC0 at v1.0 is the natural upgrade and is compatible with everything above.

### 4.2 Code — **Apache-2.0**

Covers the validator, the agent skill, the MCP server, SDKs, the registry application, the website and all tooling.

| | **MIT** | **Apache-2.0** |
|---|---|---|
| Length / readability | ~170 words; anyone can read it | ~10 pages; nobody reads it, everybody's lawyer recognizes it |
| Patents | **Silent.** No express grant; an implicit grant is arguable but untested | **§3: express, royalty-free, irrevocable patent licence** from every contributor, plus **patent-retaliation termination** — sue over the patents and your licence ends |
| Trademark | Silent | **§6: explicitly does not grant trademark rights** — which is exactly what we need for the badge |
| Contributor attribution | Copyright notice only | `NOTICE` file, explicit contribution terms in §5 |
| Enterprise / government adoption | Fine | The safer answer when an institution's legal review asks about patents |
| Cost | None | A `NOTICE` file and header discipline |

**Recommendation: Apache-2.0.** Two decisive reasons. First, **the express patent grant is the thing the CC0 spec cannot supply**, and running code is where a patent claim would actually land. Second, **§6's explicit trademark carve-out** means the code licence and the brand policy do not contradict each other — with MIT, the relationship between "you may do anything with this code" and "you may not use this name" is left to be argued.

**Honest counter-argument, for the vote.** MIT is shorter, more familiar to volunteer contributors, and imposes no `NOTICE` discipline. If the group prefers MIT, the concrete loss is the express patent grant and the explicit trademark carve-out. That is a defensible trade for a small project, and it should be made knowingly rather than by default.

**Where the two licences meet.** The JSON Schema files are **part of the specification** and therefore CC0 — so they can be vendored into any codebase under any licence with no obligations at all. The tooling that consumes them is Apache-2.0. Each repository states this in its `README` and carries the right `LICENSE` file; the `spec` repository carries both, scoped by directory, with a one-paragraph explanation.

### 4.3 Contributions — **DCO, not a CLA**

Contributors sign off commits (`git commit -s`) under the [Developer Certificate of Origin 1.1](https://developercertificate.org/), enforced by a CI check.

A **CLA is rejected**: it requires a legal entity to assign rights *to*, which does not exist (§2.2), and CLA friction measurably reduces drive-by contributions from exactly the volunteer contributors this project depends on. The DCO gives the provenance assurance that matters — *the contributor has the right to contribute this* — with no paperwork and no counterparty.

### 4.4 Per-app data licensing — declared in the manifest

Each publisher declares the licence of **their own data** in their manifest. The protocol does not set it; the protocol **requires it to be stated**.

```jsonc
{
  "publisher": { "name": "...", "url": "..." },
  "license": "CC-BY-4.0",                       // REQUIRED. SPDX id, or a URL for non-SPDX terms.
  "attribution": "Datos de {app}",              // OPTIONAL. What an aggregator should display.
  "license_url": "https://example.org/terminos" // OPTIONAL. Human-readable terms.
}
```

**`license` is REQUIRED, and a feed without it does not conform.** An unlicensed feed is not "open by default" — it is a legal question mark that no responsible aggregator can consume, which quietly kills the aggregation the protocol exists to enable.

| Option | For an aggregator | For the publishing team | Verdict |
|---|---|---|---|
| **CC0-1.0** | Frictionless: mix freely, no per-record bookkeeping | Many teams will not accept losing all credit for work they did during an emergency | Great if a team chooses it; **wrong as the default** — it asks for a concession teams resent |
| **CC-BY-4.0** | Workable: attribute the source app, which the manifest already carries per record | Keeps credit, which is most of what teams actually want | **Recommended default** |
| **CC-BY-SA-4.0 / ODbL** | **Poisons the well.** Share-alike terms cannot be cleanly combined with CC-BY or CC0 feeds; an aggregator mixing them may be forced to relicense the whole derived dataset, or must partition by licence | Feels protective | **Recommended against** — the spec should say so plainly and explain why |
| **Custom / proprietary terms** | Requires a human to read them, per app | Sometimes unavoidable (a government data source) | Permitted, `license_url` then required |

**Aggregator guidance to ship in the spec** (normative where marked):

1. Aggregators **MUST** carry the source app's `license` and `attribution` through to any derived dataset, per record.
2. Aggregators **MAY** freely combine CC0 and CC-BY feeds.
3. Aggregators **MUST NOT** silently merge share-alike feeds with CC0/CC-BY feeds; they must partition, or relicense the combination, or exclude.
4. Aggregators **MUST** publish which feeds they consume and under which licence — the same transparency the protocol asks of publishers.
5. The registry displays each app's declared licence, so an aggregator can filter **before** writing any code.

> **The rule that overrides every licence above.** **No person-level data federates. Ever.** Missing-persons records, beneficiary identities, case details, phone numbers, photographs and household situations stay inside the app that holds them, and cross-app references are **link-outs only**. A `license` field authorizes reuse of *resource* data — collection points, material needs, capacities, deliveries in aggregate. It **never** authorizes publishing a person. This is stated in RFC-0 as a foundational constraint, it is in the required Privacy & PII review of every RFC (§3.4), the validator flags any field that looks person-shaped, and **no licence declaration and no future RFC can override it.**

### 4.5 Registry data — **CC0-1.0**

The registry is a list of apps, endpoints, declared licences and validation results — facts about public services. CC0 keeps it maximally mirrorable, which is itself part of the escape hatch (§2.5): a registry anyone may copy is a registry nobody can hold hostage.

Two things must be printed on the registry itself: **inclusion is not endorsement** (Rule-0 — we publish the method for verifying an organization, never a list of trustworthy ones), and **each entry shows the last validation timestamp and result**, so the registry states what it has actually checked rather than implying trust it has not earned.

---

## 5. Brand and badge licensing

**The name and the badge are the only assets in this project that are not open. That is deliberate, and it is what makes the badge worth wearing.** If anyone can claim compatibility, the claim carries no information and the badge is decoration.

### 5.1 The model, and its precedent

The reference is **`Certified Kubernetes`**: the Kubernetes and Certified Kubernetes marks are trademarks of The Linux Foundation, usable **only** by implementations that pass the CNCF conformance programme, with published usage rules governing how the mark may appear. The mechanism is exactly right — an **open specification, an open test suite, and a closed mark that only conformance unlocks**.

**One deliberate divergence: the CNCF programme charges a participation fee. Ours must be free, permanently, and that must be written into the policy rather than merely intended.** Our adopters are volunteer teams building aid software at night. A fee — of any size — would convert the badge from a mark of shared work into a filter on who can afford to be legitimate.

### 5.2 The marks

| Mark | Who may use it | How it is earned | Status at launch |
|---|---|---|---|
| **`Compatible con Cabuya 1.0`** / **`Cabuya 1.0 compatible`** | Any app whose live feed passes the public validator | **Self-service and automatic.** Point the public validator at your feed. It passes, the registry records the timestamp and result, you may display the badge. No application, no committee, no fee. | **Active** |
| **`Cabuya Certificado`** | — | — | **Reserved and unused.** Do not create a certification tier the project cannot staff. An unstaffed certification is worse than none, because it promises review that nobody performs. |

### 5.3 Permitted without asking anyone

- **Descriptive, nominative use of the name**: *"implementa Cabuya"*, *"lee feeds Cabuya"*, *"compatible con el Protocolo Cabuya"*. Nobody needs permission to say true things about what their software does.
- **Displaying the unmodified badge** while the registry shows a passing validation for a live feed.
- **Forking the spec** and saying so — *"basado en Protocolo Cabuya 1.0"* — under CC0. What a fork may **not** do is call itself Cabuya.
- **Teaching, writing, presenting, criticising.** Talks, posts, courses, hostile reviews.

### 5.4 Not permitted

- Displaying the badge when validation **fails**, has never run, or refers to a version you do not implement. **Badges are version-scoped**: `Cabuya 1.0` is a claim about `1.0`.
- Using the name in **your** product name, company name or domain in a way that implies you are the project — `CabuyaApp`, `Cabuya Inc`, `cabuya.com.co`. Nominative use is fine; identity appropriation is not.
- **Modifying the badge** — recolouring, redrawing, removing the version, adding your logo into it.
- Implying **endorsement, certification or partnership** that does not exist. This is Rule-0 restated as trademark policy: we do not endorse organizations we have not verified, and nobody may claim we did.

### 5.5 Enforcement, honestly scaled

At this project's size, **enforcement is social and evidentiary, not legal**. The mechanism that actually works:

1. **The registry is the source of truth.** Anyone can check any badge against a public validation result and its timestamp. A false badge is not an accusation to litigate — it is a discrepancy anyone can see.
2. **Revalidation runs on a schedule** (weekly is sufficient). A feed that breaks moves to `failing` in the registry with the date; the badge silently stops being true, and the registry says so before anyone has to.
3. **Escalation is a conversation first.** Nearly every misuse will be a stale badge after a refactor. A maintainer opens an issue or sends an email; almost all of it resolves there.
4. **Legal escalation is deferred**, because the project has no entity to hold a registered mark. Until then the name is held as an **unregistered common-law mark**, and the policy is published so the claim is at least on the record and dated.
5. **Formal registration is a Model-C task, not a year-one one.** When there is an entity to own it (§2.2), register in Colombia (SIC) and consider the US (USPTO). Approximate order of magnitude is a few hundred USD per class per jurisdiction plus professional fees — **unverified figures, to be confirmed before budgeting**, and explicitly **not** part of the year-one estimate in §6.4.

### 5.6 Where the brand policy lives

`TRADEMARK.md` at the organization root, linked from every repository README and from the badge page on the website, in **Spanish and English**, at the same URL structure as the rest of the site. A trademark policy in one language is a policy for half the ecosystem.

---

## 6. Organization surface and custody

### 6.1 GitHub organization — **a new neutral org**

| | **New neutral org (`cabuya`)** | **`pereira-tech-talks`** |
|---|---|---|
| Signals | Owned by the protocol, by all of it | Owned by a city's meetup community |
| Neutrality to the other 19 teams | **Passes** | Fails on the same axis as a personally-registered domain |
| Phase-3 fit ("regional tech movement", beyond Pereira) | Scales | **City-locked by name** — the exact constraint `BRAND_AND_NAMING.md` §1.3 disqualifies names for |
| URL aesthetics | `github.com/cabuya/spec` | `github.com/pereira-tech-talks/cabuya-spec` |
| Setup cost | Minutes | Zero |
| Migration cost later | — | Repo transfers, broken links, stale clones, package renames |

**Recommendation: a new organization**, named for whatever the group votes. `github.com/cabuya` came back **likely available** at `2026-08-16T04:08:05Z`; `cabuya-protocol` is **likely available** as a fallback. Verdicts are dated snapshots — re-check on the day.

`pereira-tech-talks` keeps its real and valuable role as **the community and events home**, and is the right place for the meetup that launches the protocol. It is the wrong place for the protocol to *live*, for the same reason the domain should not sit in one person's account.

### 6.2 Repository layout

| Repo | Contents | Licence |
|---|---|---|
| `spec` | Normative text, `schemas/`, examples, `rfcs/`, `GOVERNANCE.md`, `MAINTAINERS.md`, `ADOPTERS.md` | **CC0-1.0** |
| `validator` | Conformance checker: CLI, library, hosted endpoint | **Apache-2.0** |
| `registry` | Who publishes what; validation results; app metadata | Code Apache-2.0 · **data CC0-1.0** |
| `skill` | The agent skill that implements or consumes a feed | **Apache-2.0** |
| `mcp-server` | Reference MCP server | **Apache-2.0** |
| `website` | Landing + developer portal (`cabuya.org`, `cabuya.dev`) | **Apache-2.0**, content CC0 |
| `.github` | Org profile, `CODE_OF_CONDUCT.md`, `TRADEMARK.md`, `SECURITY.md`, issue/PR templates | — |

**Org settings from day one:** **at least three owners, from at least two different apps** (an org with one owner is Model A again, whatever `GOVERNANCE.md` says) · **2FA required org-wide** · branch protection on `spec@main` requiring the approvals in §2.4 · DCO check required · all repos public from the first commit.

### 6.3 Domain custody

**The specific failure being designed against:** a domain registered in one person's personal account, renewing to one person's card, recoverable only through one person's email. That is the concern already on the table, and it is correct.

**Requirements:**

1. **Registrar account owned by a project alias**, never a personal address — e.g. `dominios@{domain}` as a group/alias with **three or more** members from **two or more** different apps.
2. **Registrar choice: Cloudflare Registrar** (at-cost renewals, no first-year-teaser pricing, no transfer games) **or Porkbun**. Avoid registrars with aggressive renewal markups — this bill gets paid by volunteers for ten years, and a quiet price escalation is a real continuity risk.
3. **TOTP seed escrowed** with at least two maintainers, stored in a shared password manager, so account recovery never depends on one person's phone.
4. **Auto-renew ON**, a payment method that is **not** a personal card if at all possible (a project card or a small prepaid balance), and calendar reminders at **90 / 60 / 30 days** before expiry to humans, not just to an inbox nobody reads.
5. **Registrant contact = the organization or the alias.** If a natural person must be listed before an entity exists, record that in `OPERATIONS.md` as a **known risk with a named owner and a resolution trigger** (it is resolved at Model C), rather than leaving it undocumented.
6. **DNS at Cloudflare with three or more admins**, and the zone file exported to the `spec` repo so it is reconstructible from git.
7. **A written runbook** in `spec/OPERATIONS.md`: who holds what, how renewal happens, who to contact, and how to execute the continuity clause in §2.5. Untested runbooks fail — one dry run per year, logged.

### 6.4 Year-one cost estimate

> **Estimates, unverified today.** Registrar list prices move and vary by promotion. Confirm at the registrar before budgeting.

| Item | Year-1 cost (USD, approx.) | Note |
|---|---|---|
| `cabuya.org` — canonical | **10–14** | Non-negotiable |
| `cabuya.dev` — developer portal | **12–16** | HSTS-preloaded; TLS mandatory by construction |
| `cabuya.co` — regional defensive | **25–35** | Colombian ccTLD; priced higher. 301 to `.org` |
| `cabuya.app` — defensive / validator | **14–20** | Optional in year one |
| `cabuya.net` — typo defence | 12–16 | **Skip** unless the group wants it |
| `cabuya.io` | 35–60 | **Skip** — expensive, adds nothing |
| GitHub organization, public repos, Actions | **0** | Free for public repositories |
| Hosting: site, validator, registry | **0** | Cloudflare Pages + Functions free tier is sufficient at this scale |
| npm publishing | **0** | Free for public packages |
| Project email alias | **0** | Cloudflare Email Routing; a Workspace/Zoho seat would be ~USD 0–72/yr if the group wants a real mailbox |
| Code of Conduct, licences, DCO | **0** | Off-the-shelf documents |
| Trademark registration | **deferred** | Model-C task (§5.5). **Not** a year-one cost |

**Recommended year-one basket: `.org` + `.dev` + `.co` ≈ USD 50–65.** Adding `.app` brings it to ≈ **USD 65–85**.

> **Domains are the only cost, which is the point.** A protocol whose year-one budget is under a hundred dollars cannot be captured by whoever is funding it, and cannot die because a grant ended. Keep it that way for as long as possible — the moment there is money, there is a Model-C conversation, and that conversation should happen because the project grew, not because someone bought infrastructure the project could not otherwise afford.

---

## 7. What the group has to decide

| # | Decision | Prepared recommendation |
|---|---|---|
| 1 | Governance model | **Multi-app maintainer council**, with the fiscal-host upgrade pre-committed and trigger-based |
| 2 | The neutrality gate | **v1.0 is not tagged until ≥ 2 maintainers represent non-Corag apps**; max 2 seats per organization |
| 3 | Decision rules | Fast path / normative (10 days) / breaking (21 days); lazy consensus; deadlock → declined; **no founder casting vote** |
| 4 | Escape hatch | CC0 + distributed git mirrors + offline-valid schemas + a written 180-day continuity clause + **no mandatory central service** |
| 5 | RFC process | GitHub PRs into `rfcs/`; anyone may open; **mandatory Privacy & PII section that can block**; declined RFCs are archived, not deleted |
| 6 | Spec licence | **CC0-1.0** (CC-BY-4.0 the acceptable alternative; OWFa Patent-Only as a v1.0 upgrade if patents worry anyone) |
| 7 | Code licence | **Apache-2.0** for the patent grant and the trademark carve-out (MIT is a defensible but lossier vote) |
| 8 | Contributions | **DCO**, no CLA |
| 9 | Data licence | Publisher-declared, **`license` REQUIRED for conformance**, **CC-BY-4.0** recommended default, share-alike discouraged with published aggregator rules |
| 10 | Brand & badge | Trademark-gated, validator-earned, **free forever**, version-scoped, revocable; `Certificado` tier reserved and unused |
| 11 | Org surface | **New neutral GitHub org**; `pereira-tech-talks` stays the community/events home |
| 12 | Custody | Shared registrar account on a project alias, ≥3 holders from ≥2 apps, escrowed TOTP, written and annually rehearsed runbook |
| 13 | Budget | **≈ USD 50–85 in year one, all domains** |

> **Standing frame.** Every item above is a **proposal drafted for the working group to approve**. No team has agreed to anything, no organization has been contacted, no domain or handle has been registered, and no commitment has been made on anyone's behalf.

---

## Sources

- [Open Referral — Specification Governance](http://docs.openreferral.org/en/latest/about/specification-governance.html) · [openreferral/specification](https://github.com/openreferral/specification) · [HSDS licence discussion — CC0 → CC BY-SA](https://github.com/openreferral/specification/issues/72)
- [Matrix.org Foundation — About](https://matrix.org/foundation/about/) · [MSC1779 — Open governance for Matrix.org](https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/1779-open-governance.md) · [NGI Commons — Matrix.org and the fight to build sustainable digital commons](https://commons.ngi.eu/2025/05/07/matrix-org-and-the-fight-to-build-sustainable-digital-commons/)
- [CNCF — Certified Kubernetes Software Conformance](https://www.cncf.io/training/certification/software-conformance/) · [Certified Kubernetes Terms & Conditions](https://github.com/cncf/k8s-conformance/blob/master/terms-conditions/Certified_Kubernetes_Terms.md) · [Kubernetes blog — Introducing software certification for Kubernetes](https://kubernetes.io/blog/2017/10/software-conformance-certification/) · [Linux Foundation trademark usage](https://www.linuxfoundation.org/trademark-usage)
- [Open Web Foundation — OWFa 1.0](https://www.openwebfoundation.org/the-agreements/the-owf-1-0-agreements-granted-claims/owfa-1-0) · [OWFa 1.0 Patent-Only](https://www.openwebfoundation.org/the-agreements/the-owf-1-0-agreements-granted-claims/owfa-1-0-patent-only) · [OWF CLA 1.0 & OWFa 1.0 FAQ](https://www.openwebfoundation.org/faqs/open-web-foundation-cla-1-0-owfa-1-0-faq)
- [Developer Certificate of Origin 1.1](https://developercertificate.org/) · [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
- Companion document: `BRAND_AND_NAMING.md` (this plan's `analysis_results/`)
