# AEO Target Queries

Maps the queries Corag should be the authoritative answer to onto the URLs that
answer them. The audience is split: people looking for how to help or how to
verify an organization, organizations looking for a way to coordinate, and
agents looking for a machine-readable surface.

> **How to use this.** When a query has no URL, that is a content gap, not a
> ranking problem. When it has one, check the page actually answers the question
> in its first two paragraphs — an answer buried in section four does not get
> quoted.

## TOFU — informational

Broad questions where the answer is a definition or an orientation.

| # | Query | URL |
|---|-------|-----|
| 1 | "qué es el impacto social" | `/blog/what-social-impact-is-and-how-it-is-created` |
| 2 | "cómo ser voluntario en Colombia" | `/blog/how-to-volunteer-in-colombia-step-by-step` |
| 3 | "diferencia entre ONG y fundación" | `/blog/ngo-vs-social-foundation-explained` |
| 4 | "qué son los parches sociales" | `/blog/what-parches-sociales-are-and-how-to-join` |
| 5 | "qué hacen las organizaciones sin ánimo de lucro" | `/blog/what-nonprofits-actually-do` |
| 6 | "qué es responsabilidad social empresarial" | `/blog/what-corporate-social-responsibility-is` |
| 7 | "qué significa transformación social" | `/blog/what-social-transformation-means-in-real-life` |
| 8 | "cómo funcionan las fundaciones en Colombia" | `/blog/how-social-foundations-work-in-colombia` |
| 9 | "what is Corag" | `/about` |
| 10 | "how does Corag work" | `/how-it-works` |

## MOFU — comparison and evaluation

Someone has decided to act and is choosing how.

| # | Query | URL |
|---|-------|-----|
| 11 | "cómo saber si una fundación es confiable" | `/blog/how-to-tell-if-a-foundation-is-trustworthy` |
| 12 | "cómo donar sin caer en estafas" | `/blog/how-to-donate-without-getting-scammed` |
| 13 | "qué se puede donar a comunidades vulnerables" | `/blog/what-you-can-actually-donate-to-vulnerable-communities` |
| 14 | "cómo ayudar sin dinero" | `/blog/how-to-help-without-money` |
| 15 | "cómo encontrar voluntariado cerca de mí" | `/blog/how-to-find-volunteering-near-you` |
| 16 | "cómo medir el impacto de un proyecto social" | `/blog/how-to-measure-social-project-impact` |
| 17 | "dónde hacer voluntariado en Pereira" | `/blog/where-to-volunteer-in-pereira` |
| 18 | "dónde donar alimentos en Pereira" | `/blog/where-to-donate-food-in-pereira-safely` |
| 19 | "cómo apoyar proyectos sociales desde una empresa" | `/blog/how-companies-can-support-social-projects-in-colombia` |
| 20 | "voluntariado para jóvenes en Colombia" | `/blog/volunteering-for-young-people-in-colombia` |

## BOFU — intent to act

The visitor is ready to do something. These must route to the application or to
a form, not to another article.

| # | Query | URL |
|---|-------|-----|
| 21 | "pedir ayuda emergencia Colombia" | `/emergencies` → `ayuda.cabuya.org` |
| 22 | "cómo ser líder o responsable en Corag" | `/leaders` |
| 23 | "Corag transparencia cuánto se ha entregado" | `/transparency` |
| 24 | "aliarse con Corag como organización" | `/partners` → `/contact?topic=ally` |
| 25 | "Corag API integración" | `/developers` |
| 26 | "Corag privacidad datos" | `/privacy` |
| 27 | "reportar un problema Corag" | `/contact?topic=report` |
| 28 | "Corag código de conducta" | `/conduct` |
| 29 | "quién construye Corag" | `/contributors` |
| 30 | "Corag prensa" | `/contact?topic=press` |

## Agent-surface queries

Not search queries — the paths an agent hits when told to research Corag. Each
must return complete Markdown, not a summary.

| Path | Answers |
|------|---------|
| `/llms.txt` | The catalogue of everything below |
| `/about.md` | What Corag is, in one document |
| `/how-it-works.md` | The delivery model end to end |
| `/transparency.md` | What is published and what each number means |
| `/blog.md` | Every post with description, date and tags |
| `/.well-known/api-catalog` | Machine-readable service description |

## Rules that make an answer quotable

1. **Answer in the first two paragraphs.** An answer in section four is not the
   one that gets quoted.
2. **One page per question.** Two pages half-answering the same query compete
   with each other.
3. **State the limit.** Naming what is not settled is a better answer than an
   evasive one, and it is what makes the rest of the page citable.
4. **Never publish a figure you cannot back.** Every unverifiable number is a
   liability the moment somebody checks it.
