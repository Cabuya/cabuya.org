# cabuya.org — the Cabuya Protocol

**Cabuya** is an open interoperability protocol that lets emergency-aid
applications publish and consume the same data. One schema, four transports —
a static JSON feed, a read API, a write API and an MCP surface are projections
of the same `place` record — with conformance **measured by a published
validator, never self-declared**. It was born from Colombia's August 2026
seismic emergency, where 20+ independently built response apps could not read
each other's data; it is designed so that any city, anywhere, can adopt it.

> **«Crecemos juntos: no competimos, nos alimentamos.»**
> *We grow together: we don't compete, we feed each other.*
> La cabuya es la fibra con la que se amarra lo que nadie puede cargar solo —
> cada app es un hilo y el protocolo es la cuerda.

The protocol specification is in **draft (0.1)**. Nothing on this site claims
adoption, traction or conformance that the public record cannot back — that
honesty rule ([Rule-0](docs/context/README.md#integrity-rules-that-travel-with-this-record))
is the project's founding argument.

## What this repository contains

| Artifact | Path | License |
|---|---|---|
| The website (`cabuya.org`) — landing + `/developers` portal, bilingual (EN at `/`, ES at `/es`) | `src/`, `functions/`, `public/` | Apache-2.0 |
| The normative **spec** — versioned protocol text, JSON Schemas, worked examples, RFCs | [`spec/`](spec/README.md) | CC0-1.0 |
| The publisher **registry** — reviewed entries, measured badge states, validation history | [`registry/`](registry/README.md) | CC0-1.0 |
| The conformance **validator** — one engine, four harnesses (CLI, CI, live web, cron) | `packages/validator/` | Apache-2.0 |
| The founding record — ratified decisions, protocol design, evidence base | [`docs/context/`](docs/context/README.md) | CC0-per-bundle terms |

> **This repository is not an aid application.** It never holds a real
> person's situation, case, name or phone number. Person-level data is
> excluded from the protocol by a join prohibition, not a field omission.

The companion repository **[`Cabuya/cabuya-skill`](https://github.com/Cabuya/cabuya-skill)**
packages the protocol as an installable agent skill: any coding agent that
installs it knows the whole protocol offline and can take an app to a
conforming feed.

## Development

```bash
pnpm install
pnpm run dev          # http://localhost:7777
pnpm run build        # astro check && astro build
pnpm run test         # unit tests (Vitest)
pnpm run biome:check  # lint + format
```

Quality gates (all run in CI): `md:check`, `lang:check`, `seo:check`,
`parity:check`, `redirects:check`, `langlinks:check`, `mdblocks:check`,
`voice:check`, `spec:check`, `spec:boundary`, `registry:check`,
`checks:catalogue` and `a11y:check`. Full command reference: [`docs/DEVELOPMENT_COMMANDS.md`](docs/DEVELOPMENT_COMMANDS.md).

## Documentation

Start at [`AGENTS.md`](AGENTS.md) (the single entry point for humans and AI
agents alike), then `docs/`. The licensing split is explained in
[`docs/LICENSING.md`](docs/LICENSING.md).

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) (EN/ES).
Every commit needs a DCO sign-off (`git commit -s`). A first PR gets a review,
not a redesign.

## License

Apache-2.0 for code (see [`LICENSE`](LICENSE));
`spec/` and `registry/` are CC0-1.0. Details: [`docs/LICENSING.md`](docs/LICENSING.md).
