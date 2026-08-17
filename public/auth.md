# Authentication

**There is none, and that is the design.** cabuya.org has no accounts, no API
keys, no OAuth issuer and no registration step. Every endpoint below is public,
unauthenticated and rate-limited by politeness rather than by identity.

This file follows the `auth.md` convention so an agent can stop looking for a
credential it will not find.

## What you can call

| Endpoint | Method | What it does | Limits |
|---|---|---|---|
| [`/api/validate`](https://cabuya.org/developers/validator) | POST | Validates a manifest or feed and returns findings with stable check ids | 10/minute per caller · 60/hour per probed host |
| [`/badge/{publisher}.svg`](https://cabuya.org/registry) | GET | The measured badge for a registry entry | none |
| [`/openapi.json`](https://cabuya.org/openapi.json) | GET | OpenAPI 3.1 description of the above | none |
| [`/.well-known/api-catalog`](https://cabuya.org/.well-known/api-catalog) | GET | RFC 9727 link set for the same API | none |
| Any page + `.md` | GET | The complete Markdown twin of that page | none |
| [`/llms.txt`](https://cabuya.org/llms.txt) · [`/llms-full.txt`](https://cabuya.org/llms-full.txt) | GET | The site as one map, and as one file | none |

`Accept: text/markdown` on any page URL returns the twin, so the `.md` suffix is
a convenience rather than a requirement.

## What the validator does with your request

- It fetches the URL you name, following at most 3 redirects, each re-checked.
- It stops at 5 MB per document, 8 s per fetch and 25 s per run.
- It keeps nothing. No request body, no URL, no finding is written anywhere;
  the only state is two rate counters keyed by caller IP and probed host, and
  `scripts/check-no-retention.mjs` fails the build if a log line appears near
  that code.
- It identifies itself as `CabuyaValidator/0.1 (+https://cabuya.org/developers/validator/probe)`.

## Identify yourself

Send a `User-Agent` that names your agent and a URL a human can read. Nothing
is enforced and nothing is stored — it is how we would recognise a well-behaved
client if one of these endpoints ever needed defending.

## What is deliberately absent

These are the documents an agent-readiness scanner expects next, and why this
site does not serve them:

| Not published | Because |
|---|---|
| `/.well-known/openid-configuration` | No OpenID Provider exists. There is nothing to sign in to. |
| `/.well-known/oauth-authorization-server` | No OAuth authorization server exists. |
| `/.well-known/oauth-protected-resource` | Nothing here is a protected resource. Every byte is public. |
| `/.well-known/mcp/server-card.json` | The reference MCP server is [specified and not deployed](https://cabuya.org/developers/mcp). It ships when at least two live conforming feeds exist to federate over. |

Each of those would raise an automated score and would describe infrastructure
that does not exist. If any of them appears here later, it will be because the
thing itself does.

## The protocol, not this site

An application that *implements* Cabuya may well need authentication for its
own write surface — that is its business, and the protocol does not model it.
The specification's API surface section is [§4](https://cabuya.org/developers/spec/0.1/4-api-surface) ·
[Markdown](https://cabuya.org/developers/spec/0.1/4-api-surface.md).

Skills index: https://cabuya.org/.well-known/agent-skills/index.json
Español: https://cabuya.org/es
