# Contributing to cabuya.org

*(En español: [CONTRIBUTING.es.md](CONTRIBUTING.es.md).)*

Thank you for helping build the Cabuya Protocol. This repository holds the
website, the normative spec (`spec/`), the publisher registry (`registry/`)
and the conformance validator (`packages/validator/`). All of it is open
source and all of it takes contributions.

The contributor this project is built for is a volunteer developer with two
free hours who already works on one of the aid applications this protocol is
trying to connect. Everything below is arranged around that person.

## Ground rules

1. **A first PR gets a review, not a redesign.** We review what you sent;
   we don't rewrite your approach in the comments. Maintainers aim to give a
   first response within **48 hours**.
2. **Rule-0 applies to every content change:** no figure we cannot back with a
   named source, no endorsement we cannot maintain, no CTA to a channel that
   does not exist. When something isn't ready, the copy says so.
3. **Zero PII, everywhere** — including fixtures, examples and docs. Contact
   values never appear in this repository; org-level role addresses published
   by their own organizations are the only exception.
4. **Conformance is measured, never declared.** Nothing you write may claim a
   conformance level the validator has not measured.
5. **Never weaken or delete a test to make a gate pass.** If a gate is wrong,
   fix the gate and say so in the PR. If it is right, it found something.

## Four ways in, roughly by effort

### 1. Open an issue

Something in the spec is ambiguous, a check message is wrong, a page says
something that is not true. **You do not need a fix to report a problem.** The
most valuable issues come from people who tried to implement something and hit
a wall — a wall is evidence about the specification, not only about the reader.

### 2. Publish a feed

The shortest path from reader to participant. The
[quickstart](https://cabuya.org/developers/quickstart) is two files and a
validator run — an afternoon for a small application, which is a design
constraint rather than a boast. You do not need permission and you do not need
to tell anyone first.

### 3. Open a registry pull request

Once your feed validates, add your entry to `registry/publishers/`. One JSON
file, reviewed by a human, merged. The measured state arrives afterwards from
the validator — the entry is a claim about who you are, never about how
conforming you are.

### 4. Join the working group

Show up to the discussion on normative changes.
[`GOVERNANCE.md`](GOVERNANCE.md) has the requirements for becoming a
maintainer; the first is that your application publishes a conforming feed,
because shipping qualifies and enthusiasm does not.

## Good first issues

The backlog is **pre-populated with well-specified work**, on purpose. An empty
issue tracker is intimidating in a way that has nothing to do with difficulty:
it asks a newcomer to invent the work as well as do it.

| Label | What it is | Why it is a good first issue |
|---|---|---|
| `good-first-issue:check` | Implement one validator check from the catalogue | Perfectly bounded — id, severity, message and fixture are already specified. One function and two tests. |
| `good-first-issue:stack` | Write the implementation guide for a stack you know | Needs *your* domain knowledge, not project knowledge. The highest-value thing an outsider can contribute on day one. |
| `good-first-issue:translation` | Translate a spec section, a check message or a page | Reviewable by anyone, and it keeps the bilingual promise real rather than aspirational. |
| `good-first-issue:example` | Add a valid or invalid example with a teaching `$comment` | Directly improves how implementable the protocol is by an agent. |
| `registry` | Add or correct a publisher entry | The lowest-effort path from reader to contributor. |
| `rfc` | Open or discuss a normative change | The governance on-ramp. |
| `help-wanted:probe` | Reproduce a behavioural failure against a real stack | Turns a bug report into a fixture, which is what makes it fixable. |

`good-first-issue:check` deserves the emphasis: every catalogued check that is
not yet implemented ships as an open issue with its id, rule, severity and fix
text already decided. There is nothing to design.

## Developer Certificate of Origin (DCO)

Every commit must be signed off:

```bash
git commit -s -m "type(scope): description"
```

The `-s` flag adds a `Signed-off-by:` line certifying you have the right to
submit the work under this repo's licenses (the
[Developer Certificate of Origin](https://developercertificate.org/)). It is
not a cryptographic signature and takes no setup — just remember the `-s`. A
bot checks it on every PR; a missing sign-off is the most common reason a
first PR fails CI, and it's fixed with `git commit --amend -s && git push -f`.

There is **no CLA**: there is no legal entity to assign rights to, and CLA
friction measurably deters exactly the drive-by contributions this project
depends on.

## Commits and branches

- **Conventional commits:** `type(scope): description` — types `feat`, `fix`,
  `docs`, `content`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`;
  English, imperative mood.
- Branch from `main`, open a PR against `main`. Keep PRs focused — one
  concern per PR.

## Language

Write in Spanish or English, whichever you think in. **Code, comments, commit
messages, check ids and JSON keys are English**, because the protocol is read
by people who share no other language. **Public content is both**, natively
written in each rather than machine-translated from the other. An issue in
Spanish gets an answer in Spanish.

## Running the checks locally

```bash
pnpm install
pnpm run biome:check     # lint + format
pnpm run astro:check     # types
pnpm run test            # unit tests
pnpm run build           # full build
# content gates
pnpm run md:check && pnpm run lang:check && pnpm run seo:check \
  && pnpm run parity:check && pnpm run redirects:check
```

The PR template lists which gates apply to which kind of change; the full
command list is in [`docs/DEVELOPMENT_COMMANDS.md`](docs/DEVELOPMENT_COMMANDS.md).

## Where to contribute

| I want to… | Start at |
|---|---|
| Fix a bug or improve the site | An issue, or a straight PR for small fixes |
| Propose a change to the **protocol** | An `rfc` issue — normative changes go through the RFC process, never a drive-by PR to `spec/` |
| Add or correct a **registry** entry | A `registry entry` issue or a PR to `registry/publishers/` |
| Implement a **validator check** | `good-first-issue:check` issues — each is fully specified (id, severity, message, fixture) |
| Translate | `good-first-issue:translation` issues |

## Code of Conduct

[The Contributor Covenant 2.1](CODE_OF_CONDUCT.md), plus two additions:
reports go to a role held by maintainers from two different applications,
never to an individual, and a maintainer who is the subject of a report takes
no part in handling it.
