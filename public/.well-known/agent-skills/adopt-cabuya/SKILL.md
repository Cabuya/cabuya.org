---
name: adopt-cabuya
description: Adopt the Cabuya Protocol with a guided, resumable flow — install the cabuya-skill pack, say /cabuya, and the agent orients, asks who plans the work, and runs the adoption task by task. Use when asked to adopt Cabuya, get started with the protocol, or implement it end to end.
version: 0.1
license: CC0-1.0
---

# Adopt Cabuya

Two lines. The pack teaches any coding agent the whole protocol — schema,
levels, exclusions, validator — and works offline, because the specification
is vendored inside it, checksummed.

```bash
npx skills add Cabuya/cabuya-skill
# or, vendored into the repository:
git clone --depth 1 https://github.com/Cabuya/cabuya-skill .agents/skills/cabuya
```

Then say `/cabuya` (or, in words: "adopt Cabuya").

## What happens, in four lines

1. **If the team already has a spec-driven methodology**, the pack briefs it
   with the full context — ordered tasks, acceptance criteria, validation
   commands — and that methodology plans. Theirs outranks anything the pack brings.
2. **If DeepWorkPlan is installed**, the adoption renders as a reviewable plan
   on disk and `/dwp-execute cabuya_adoption` runs it.
3. **Otherwise the pack offers to install DeepWorkPlan (with onboarding), and a
   "no" is final**: the agent plans in its own plan mode over the same task list.
4. **Whoever plans, one thing stays fixed**: the PII decision is made by a
   human, and the level is whatever the validator measures — never a declaration.

## Where everything lives

- The installable pack: https://github.com/Cabuya/cabuya-skill
- The page for your human: https://cabuya.org/start
- The validator this ends at: https://cabuya.org/developers/validator
