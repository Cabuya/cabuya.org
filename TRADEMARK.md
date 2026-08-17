# Name and badge policy

Everything in this project is open except two things: **the name and the
conformance badge**. That is deliberate, and it is what makes the badge worth
wearing. If anyone can claim compatibility, the claim carries no information.

This file is the source. `https://cabuya.org/trademark` renders it in both
languages; if the two ever disagree, this file is right.

The model is `Certified Kubernetes` — an open specification, an open test suite,
and a closed mark that only conformance unlocks — with **one deliberate
difference: there is no fee, ever, and that is written here rather than merely
intended.** Adopters here are volunteer teams building aid software at night. A
fee of any size would turn the badge from a mark of shared work into a filter on
who can afford to be legitimate.

---

## The marks

| Mark | Who may use it | How it is earned | Status |
|---|---|---|---|
| **«Compatible con Cabuya 1.0»** / **«Cabuya 1.0 compatible»** | Any application whose live feed passes the public validator | **Self-service and automatic.** Point the validator at your feed. It passes, the registry records the timestamp and the result, you display the badge. No application, no committee, no fee. | Active |
| **«Cabuya Certificado»** | — | — | **Reserved and unused.** |

The second row is a commitment, not an omission. **Do not create a certification
tier the project cannot staff.** An unstaffed certification is worse than none,
because it promises a review nobody performs. The word *certificado* appears
nowhere in the badge, the registry, the validator or the documentation, and a
test enforces that.

## What you may do without asking anyone

- **Say true things about your software.** Nominative, descriptive use needs no
  permission from anybody — in English or in Spanish, so *«implementa Cabuya»*
  and *«compatible con el Protocolo Cabuya»* are as free to write as their
  English equivalents.
- **Display the unmodified badge** while the registry shows a passing validation
  for a live feed.
- **Fork the specification and say so**, in either language — *«basado en el
  Protocolo Cabuya 1.0»* is a true statement and a permitted one. It is CC0;
  forking is a right, not a favour. What a fork may not do is call itself
  Cabuya.
- **Teach, write, present, criticise.** Talks, posts, courses, hostile reviews.
  A trademark policy that could be used to suppress criticism is a trademark
  policy being misused.

## What you may not do

- **Display the badge when validation fails, has never run, or names a version
  you do not implement.** Badges are **version-scoped**: `Cabuya 1.0` is a claim
  about 1.0 and nothing else.
- **Use the name as your identity** — `CabuyaApp`, `Cabuya Inc`,
  `cabuya.com.co`. Nominative use is fine; identity appropriation is not.
- **Modify the badge.** No recolouring, no redrawing, no removing the version,
  no adding your logo into it.
- **Imply endorsement, certification or partnership that does not exist.** This
  is the project's first rule restated as trademark policy: we do not endorse
  organisations we have not verified, and nobody may claim we did.

## The words that are never used

Not a style preference — each of these makes a claim the project cannot back:

| Word | Why not |
|---|---|
| *Certificado* / *certified* | Nobody certifies anything here. A validator measured a document at a moment. |
| *Powered by Cabuya* / *Impulsado por Cabuya* | The protocol does not power anything. The application does the work and speaks the format. |
| *Cabuya compatible*, unversioned | An unversioned claim survives the version it was measured against. That is how a badge becomes a lie by sitting still. |
| *Endorsed*, *partner*, *official* | Inclusion in the registry is not endorsement, and the registry page says so in both languages. |

## How this is enforced

At this project's size, enforcement is **social and evidentiary, not legal**, and
saying so plainly is more useful than implying a legal capability that does not
exist.

1. **The registry is the source of truth.** Anyone can check any badge against a
   public validation result and its timestamp. A false badge is not an
   accusation to litigate — it is a discrepancy anyone can see.
2. **Revalidation runs on a schedule.** A feed that breaks moves to `failing` in
   the registry with the date. The badge stops being true and the registry says
   so before anybody has to complain.
3. **Escalation is a conversation first.** Nearly every misuse will be a stale
   badge after a refactor. A maintainer opens an issue or writes an email, and
   almost all of it resolves there.
4. **Legal escalation is deferred**, because the project has no entity to hold a
   registered mark. Until then the name is held as an **unregistered common-law
   mark**, and this policy is published so the claim is at least on the record
   and dated.
5. **Formal registration follows the move to a fiscal host**, not before — see
   [`GOVERNANCE.md`](GOVERNANCE.md#what-automatically-opens-the-migration).
   Registering in Colombia (SIC) and possibly the United States (USPTO) is a
   task for whoever can legally own a mark. Costs have not been quoted and are
   deliberately not estimated here.

## Trademark status, stated honestly

No formal clearance search has been performed. A web search in August 2026 found
no software company, product or brand using the name, but **a web search is not
a clearance search**, and no register — SIC Colombia, USPTO, EUIPO — has been
queried. The name is used as an unregistered common-law mark on that basis.

If you hold a conflicting mark, please open an issue or write to the project
alias. Finding out early is better for everyone than finding out in a letter.

## If the badge is on your README

You are the person this policy is written for, and there is nothing you need to
do. Your badge reads the live measurement; if your feed breaks, the badge
changes and the registry explains why. It cannot say something about your
software that the validator has not found.
