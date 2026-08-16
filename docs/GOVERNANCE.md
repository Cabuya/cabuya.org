# Governance

> **Governance is content, not documentation.** It lives at
> [`src/content/pages/es/governance.md`](../src/content/pages/es/governance.md)
> and [`src/content/pages/en/governance.md`](../src/content/pages/en/governance.md),
> and renders as `/governance` and `/en/governance`.
>
> **Edit those files.** This page summarises the model for people reading the
> repository, and defers to them on every point of substance.

## The three levels

```text
Person            →  publishes a need, offers help, contributes
Responsable       →  coordinates, executes, records and accounts for resources
Administration    →  validates, moderates and verifies
```

None of these is a rank. They are different responsibilities carrying different
obligations.

## The critical dependency

The responsable validation system is the trust dependency the whole platform
rests on. Money moves by **direct transfer** to a verified account in the
responsable's own name — Corag never holds it — which removes the platform as a
single point of failure and moves the trust onto a named person instead.

That is why identity and territorial validation gate the role, and why evidence
is not optional. Failing to provide evidence is the most serious lapse, because
it breaks precisely what makes the model verifiable. The response is staged: a
reminder, then suspension of the ability to receive contributions, then removal
from the role.

## Evidence moderation

```text
Contribution → Responsable → Execution → Evidence uploaded
             → Administrative review → Approval → Publication
```

Only after review does an amount count as **used with evidence**. That is why
that figure differs from **received**, and why it is the one worth reading.

## Decisions about this repository

- Proposals arrive as pull requests and are reviewed like any other change.
- Changes affecting how people's data is displayed, published or stored are
  discussed before implementation, not after.
- The quality gates in [Development Commands](./DEVELOPMENT_COMMANDS.md) are not
  advisory. A change that breaks `parity:check` or `md:check` ships a page that
  lies to somebody in one language.

## What is not settled yet

Stated on the live page as well, because saying so is part of the transparency:
the formal appeals process when a role is removed, the maximum resources a
responsable may administer without additional review, and the composition of a
standing moderation committee.

## Related

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing](./CONTRIBUTING.md)
- [Product Spec](./PRODUCT_SPEC.md) — why the model is shaped this way
