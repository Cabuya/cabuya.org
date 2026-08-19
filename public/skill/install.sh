#!/usr/bin/env bash
# Cabuya skill installer — the two-step path documented at
# https://cabuya.org/developers/skill
#
# This script is meant to be DOWNLOADED, READ, and only then run:
#
#   curl -fsSL https://cabuya.org/skill/install.sh -o install.sh
#   # read it, verify it against install.sh.sha256, then:
#   bash install.sh [target-directory]
#
# What it does, in order — and nothing else:
#   1. Clones Cabuya/cabuya-skill (depth 1) into ./vendor/cabuya-skill
#      (or the directory you pass as the first argument).
#   2. Verifies the pack's vendored specification against its checksums
#      using the pack's OWN verifier — a tampered pack refuses to link.
#   3. Runs the pack's setup.sh, which symlinks (never copies) the skill
#      into every coding agent it detects on this machine.
#
# It writes only inside the target directory and your agents' skills
# directories. It sends nothing anywhere. Deleting the target directory
# and the symlinks removes everything it did.

set -euo pipefail

REPO_URL="https://github.com/Cabuya/cabuya-skill"
TARGET="${1:-vendor/cabuya-skill}"

if ! command -v git >/dev/null 2>&1; then
  echo "error: git is required" >&2
  exit 1
fi

if [ -e "$TARGET" ]; then
  echo "error: $TARGET already exists — remove it or pass another directory" >&2
  exit 1
fi

echo "→ cloning $REPO_URL into $TARGET"
git clone --depth 1 "$REPO_URL" "$TARGET"

echo "→ verifying the vendored specification against its checksums"
bash "$TARGET/skills/cabuya/scripts/verify-integrity.sh"

echo "→ linking the skill into the agents on this machine"
bash "$TARGET/setup.sh"

echo "✓ installed. Say /cabuya (Claude Code) or #cabuya (other agents) to start."
