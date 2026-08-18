# Auth.md

**There is no authentication required to read anything, and that is the design.**
cabuya.org has no accounts and no OpenID provider. Every endpoint below works
anonymously, rate-limited by politeness rather than by identity.

**One optional credential exists, and it buys exactly one thing:** a higher
`/api/validate` rate tier for registered agents (`validate:extended`) — useful
for bulk validation runs, and nothing else. It gates quota, never content.

## Agent registration, in three calls

```bash
curl -X POST https://cabuya.org/oauth/register          # → client_id + client_secret
curl -X POST https://cabuya.org/oauth/token \
  -d 'grant_type=client_credentials&client_id=…&client_secret=…'
curl -X POST https://cabuya.org/api/validate -H 'Authorization: Bearer …' \
  -H 'Content-Type: application/json' -d '{"url":"…"}'
```

Registration is open, anonymous and collects nothing — no name, no email. The
honest particulars, stated up front:

- **Nothing is stored about you.** Client secrets are HMAC-derived from the
  client id and verified by recomputation. There is no client table to leak.
- **Therefore no per-client revocation.** Rotating the signing key revokes
  every client at once; that is the only lever, and for a credential whose
  only power is a bigger rate bucket, it is enough.
- Discovery: [`/.well-known/oauth-authorization-server`](https://cabuya.org/.well-known/oauth-authorization-server) ·
  [`/.well-known/oauth-protected-resource`](https://cabuya.org/.well-known/oauth-protected-resource) ·
  [`/.well-known/jwks.json`](https://cabuya.org/.well-known/jwks.json). Grant: `client_credentials` only —
  there are no users to authorize.

## What you can call

| Endpoint | Method | What it does | Limits |
|---|---|---|---|
| [`/api/validate`](https://cabuya.org/developers/validator) | POST | Validates a manifest or feed and returns findings with stable check ids | 10/minute anonymous, 60/minute with a bearer token · 60/hour per probed host |
| [`/mcp`](https://cabuya.org/developers/mcp) | POST | MCP server (Streamable HTTP, stateless): the validate tool and the read-as-Markdown tool over JSON-RPC | same limits as `/api/validate` for the validate tool |
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

| Not published | Because |
|---|---|
| `/.well-known/openid-configuration` | No OpenID Provider exists. The authorization server above is pure OAuth 2.0 (RFC 8414), `client_credentials` only — there is nobody to sign in as. |

A document here would describe infrastructure that does not exist. When one
leaves this table, it is because the thing itself shipped — as happened with
the MCP server card and the OAuth documents, each on the day its machinery
deployed.

## The protocol, not this site

An application that *implements* Cabuya may well need authentication for its
own write surface — that is its business, and the protocol does not model it.
The specification's API surface section is [§4](https://cabuya.org/developers/spec/0.1/4-api-surface) ·
[Markdown](https://cabuya.org/developers/spec/0.1/4-api-surface.md).

Skills index: https://cabuya.org/.well-known/agent-skills/index.json
Español: https://cabuya.org/es
