# DNS for AI Discovery (DNS-AID)

> **Migration status (kept, retarget pending).** The mechanism applies to
> cabuya.org unchanged; the Corag host split below (`ayuda.cabuya.org`) is
> retired with Task 7, and the record set is finalized as a launch human
> action. Do not run the publish script until then.

Publish HTTPS/SVCB records under the `_agents` namespace so AI agents can
discover Corag before the first HTTP round-trip. This is the remaining gap in
[isitagentready.com](https://isitagentready.com/cabuya.org) Discoverability.

**Specs:** [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
· [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)
· [Scanner skill](https://isitagentready.com/.well-known/agent-skills/dns-aid/SKILL.md)

> **This cannot be fixed from the repository.** DNS records live in the
> Cloudflare zone, not in this codebase. The script below automates the change;
> someone with a Cloudflare token has to run it, or add the records by hand.

## What to publish, and where each one points

**One record today.** `_index._agents` points at this site, which is the
agent-readable index: `/llms.txt`, `/llms-full.txt`, `/auth.md`, the agent-skills
index and a complete `.md` twin of every page.

| Type | Name | Priority | Target | SvcParams |
|---|---|---|---|---|
| HTTPS | `_index._agents` | 1 | `cabuya.org` | `alpn="h2,h3" port=443` |

Use **ServiceMode** (priority ≥ 1), never AliasMode (priority 0).

### The `_mcp._agents` record, and why it is not published

An earlier version of this document and of the script both published
`_mcp._agents` → `ayuda.cabuya.org`, on the strength of a `tools/list` call that
once answered. **That host does not resolve today**, so the record pointed at
NXDOMAIN: an agent follows it, spends a lookup and a connection attempt, and gets
nothing. cabuya.org's own reference MCP server is
[specified and not deployed](https://cabuya.org/developers/mcp) — it ships when at
least two live conforming feeds exist to federate over.

So the script has no default MCP host any more. When a server exists:

```bash
DNS_AID_MCP_HOST='mcp.example.org' node scripts/publish-dns-aid.mjs
```

It resolves that host over DoH first and refuses to publish the record if the
name does not answer. A discovery record is a promise; this is the DNS form of not
publishing a claim you cannot back.

## Option A — the script

```bash
export CF_API_TOKEN='…'           # Zone.DNS Edit (+ Zone.DNSSEC Edit to enable DNSSEC)
export CF_ZONE_NAME='cabuya.org'    # or CF_ZONE_ID=…

DNS_AID_DRY_RUN=1 node scripts/publish-dns-aid.mjs   # preview, no API calls
node scripts/publish-dns-aid.mjs                     # publish
```

The script upserts both records (safe to re-run) and enables DNSSEC if the token
allows it.

## Option B — Cloudflare dashboard

The zone is on Cloudflare (`johnny.ns.cloudflare.com`, `selah.ns.cloudflare.com`),
so this is the same place the script writes to.

**cabuya.org** zone → DNS → Records → **Add record**:

| Field | Value |
|---|---|
| Type | `HTTPS` |
| Name | `_index._agents` |
| Priority | `1` |
| Target | `cabuya.org` |
| Value / SvcParams | `alpn="h2,h3" port=443` |
| TTL | Auto (or 3600) |
| Proxy | **DNS only** — a proxied record is not what a resolver sees |

Priority `1` is what makes it a **ServiceMode** record; priority `0` is AliasMode
and the scanner does not count it.

## DNSSEC

The zone is **not signed today** — `cabuya.org` has no DS record, and validating
resolvers return `AD: false`.

1. Cloudflare → DNS → Settings → enable **DNSSEC**. Cloudflare signs the zone
   and shows a DS record.
2. If the registrar is outside Cloudflare, copy that DS into the registrar's
   DNSSEC panel; if `cabuya.org` is registered through Cloudflare, the DS is
   published for you.
3. Allow time for the DS to appear at the `.org` registry — minutes to a few
   hours. `dig +short DS cabuya.org` returning nothing means it has not landed.

Without DNSSEC the scanner can still see the records, but `dnssecValidated`
stays false and the discovery data is unauthenticated.

## Verify

```bash
# The record resolves (expect a ServiceMode answer, not an empty Answer)
dig +short HTTPS _index._agents.cabuya.org

curl -s 'https://cloudflare-dns.com/dns-query?name=_index._agents.cabuya.org&type=HTTPS' \
  -H 'accept: application/dns-json' | jq '.Status, .Answer'

# DNSSEC is signing the zone (expect an Answer with a DS record, and AD: true)
curl -s 'https://dns.google/resolve?name=cabuya.org&type=DS' | jq '.Status, .AD, .Answer'

# Before advertising an MCP host, prove it answers MCP
curl -s -X POST https://<mcp-host>/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 200

# Re-scan
curl -s https://isitagentready.com/api/scan \
  -H 'content-type: application/json' \
  -d '{"url":"https://cabuya.org"}' | jq '.checks.discoverability.dnsAid'
```

Expect `status: "pass"` and at least one ServiceMode HTTPS/SVCB answer.
