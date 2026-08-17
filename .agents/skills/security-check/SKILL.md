---
name: security-check
description: Quick security checklist for a PR or set of files (secrets, input, logging). Use proactively for security reviews.
# === Universal (Claude Code + Cursor + Codex) ===
disable-model-invocation: false
# === Claude Code specific ===
allowed-tools: Read, Glob, Grep, Bash
model: haiku
# === Documentation (ignored by tools, useful for humans) ===
tier: 1
intent: review
---

# Skill: Security Check

## Objective

Run a quick, checklist-based security pass on changed files or a PR: no hardcoded secrets, proper input handling, no sensitive data in logs, no obvious OWASP issues. Lightweight; for deeper review escalate to **security-auditor** agent. Follow docs/SECURITY.md.

## Non-Goals

- Does NOT perform full security audit
- Does NOT fix code (review only; report findings)
- Does NOT assess infrastructure security
- Does NOT replace security-auditor for auth/crypto/data flows

## Tier Classification

**Tier: 1** - Light/Cheap

**Reasoning:** Checklist-based; read-only; pattern matching (secrets, sanitization). Escalate to security-auditor when issues found.

## Inputs

### Required Parameters

- `$TARGET`: PR diff, or list of files to check (e.g., paths or "current PR")

### Optional Parameters

- `$FOCUS`: Focus area (default: all) — e.g., "secrets", "input", "logging"

## Prerequisites

- [ ] Target files or PR diff are accessible

## Steps

### Step 1: Get Scope

- List changed files or read PR diff

### Step 2: Run Checklist

**Secrets & config:**
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] Secrets via environment variables (`.env`)
- [ ] No secrets in client-side code (Astro/Svelte)
- [ ] No secrets committed to repository

**Input & sanitization:**
- [ ] User input validated or sanitized where used
- [ ] No raw input in API responses without sanitization
- [ ] Search/filter inputs properly escaped

**Logging:**
- [ ] No sensitive data (tokens, PII) in log messages
- [ ] Console logs appropriate for static site context

**Static site considerations:**
- [ ] No sensitive data in build output
- [ ] API routes don't expose sensitive information
- [ ] Environment variables use proper PUBLIC_ prefix for client-side

**Obvious risks:**
- [ ] No eval() or unsafe dynamic code on user input
- [ ] No obvious XSS patterns in user-generated content

### Step 3: Report

- List findings by severity (blocking / suggestion)
- If any blocking or auth/data issues: recommend **security-auditor** agent

## Output Format

### Success Output

```
## ✅ Security Check Complete

### Scope
{Files or PR checked}

### Checklist
- Secrets: ✅
- Input/sanitization: ✅ / ⚠️ / ❌
- Logging: ✅ / ⚠️ / ❌
- Static site risks: ✅

### Findings
**Blocking:** {count} — {brief list}
**Suggestions:** {count} — {brief list}

### Recommendation
{Pass / Request changes / Escalate to security-auditor}
```

### Escalation

When sensitive data handling is involved and issues found:

```
## 🔄 Escalate to security-auditor

### Reason
{Why deeper review is needed}

### Findings so far
- {Finding 1}
- {Finding 2}

### Next step
Run security-auditor agent for full review (docs/SECURITY.md).
```

## Guardrails

### Scope Limits

- Read-only; no code changes
- Focus on checklist; for design/OWASP depth use security-auditor

### Stop Conditions

**Escalate to security-auditor** if:

- Auth or user data handling involved
- Any blocking finding on secrets
- Complex data flow requiring deeper analysis

## Definition of Done

- [ ] Checklist completed for target scope
- [ ] Findings listed with severity
- [ ] Clear recommendation (pass / request changes / escalate)

## This repository's specific checks

Four things two review passes actually caught here. Each is cheap to check and
each was missed by everything else.

### 1. The SSRF guard, attacked rather than read

`/api/validate` fetches URLs a stranger supplies. The guard is careful and
well-commented, and a **trailing dot defeated every hostname check in it** —
`metadata.google.internal.` resolves to the same host and was allowed, because
every check is a string comparison.

Attack it; do not read it:

```bash
node --experimental-strip-types -e "
import { assertAllowedUrl } from './functions/lib/ssrf-guard.ts';
for (const u of [
  'https://metadata.google.internal./', 'https://localhost./',
  'https://127.0.0.1./', 'https://2130706433/', 'https://0x7f000001/',
  'https://[::1]/', 'https://user@169.254.169.254/', 'https://example.org:6379/',
]) console.log(assertAllowedUrl(u).allowed ? 'ALLOWED ' + u : 'ok');
"
```

The regression cases live in `tests/unit/functions/ssrf-guard.test.ts`. Add any
new shape you try, whether or not it got through.

### 2. User-agent-conditional content

**Serving different bytes to a crawler, a scanner or a benchmark than to a
reader is a finding here**, whatever the intent. The middleware once rewrote
`robots.txt` for Lighthouse to keep an SEO score at 1.00 — cloaking, in a
repository whose argument is that measurements must be honest.

```bash
rg -n 'user-agent|userAgent' functions/ | rg -iv 'log|detect.*bot'
```

Any response that *varies* by user agent is blocking. Logging one is not.

### 3. Published documents describing things that do not exist

An `openapi.json` advertised five endpoints deleted three tasks earlier. A
manifest for endpoints you do not serve is exactly what this project measures
other people for.

```bash
pnpm run build && npx vitest run tests/unit/content/internal-links.test.ts
```

That walks every rendered `href`. It found twelve dead links the first time,
all on the agent-facing surface — the half nobody looks at.

### 4. The Functions actually build

Vitest imports Function modules directly and Playwright runs against
`astro preview`, which does not run Functions at all. **Neither would notice a
broken import**, and a Functions build failure is a failed deploy.

```bash
npx wrangler pages dev dist --kv VALIDATE_RATE --kv REGISTRY_STATUS
```

Run it for anything touching `functions/`. It caught a module deleted by an
earlier task and still imported by two endpoints.

### And the ordinary ones

1. **Secrets** — including added-then-removed in history, which is leaked:
   `git log -p <base>..HEAD | rg '^\+.*(api[_-]?key|token|secret)\s*[:=]'`
2. **Only `PUBLIC_*` reaches the client.** `DAILYBOT_API_KEY` and `CF_KV_*`
   are Function-environment only.
3. **Person-level data**, anywhere, including fixtures. Expect hits in the PII
   detector's own test fixtures; everything else is a finding.
4. **`no-store`** on anything that echoes user input.

## Related

- [security-auditor](../../agents/security-auditor.md) - Full security review
- [pr-review-lite](../pr-review-lite/SKILL.md) - General PR checklist
- docs/SECURITY.md - Security standards
