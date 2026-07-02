#!/usr/bin/env bash
# Copy AI config templates into gitignored .cursor/ and .claude/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BOOTSTRAP="$(cd "$(dirname "$0")" && pwd)"

echo "LifeQuesT AI config setup"
echo "  Root: $ROOT"

# Cursor
mkdir -p "$ROOT/.cursor"
rsync -a --delete "$BOOTSTRAP/cursor/" "$ROOT/.cursor/"
chmod +x "$ROOT/.cursor/hooks/"*.sh 2>/dev/null || true

# Claude
mkdir -p "$ROOT/.claude"
rsync -a --delete "$BOOTSTRAP/claude/" "$ROOT/.claude/"
chmod +x "$ROOT/.claude/hooks/"*.sh 2>/dev/null || true

# Optional: Husky + lint-staged (install once: npm i -D husky lint-staged && npx husky init)
if [ -d "$BOOTSTRAP/husky" ]; then
  mkdir -p "$ROOT/.husky"
  cp "$BOOTSTRAP/husky/"* "$ROOT/.husky/" 2>/dev/null || true
  chmod +x "$ROOT/.husky/"* 2>/dev/null || true
  if [ -f "$BOOTSTRAP/lint-staged.config.js" ]; then
    cp "$BOOTSTRAP/lint-staged.config.js" "$ROOT/lint-staged.config.js"
  fi
  echo "  Husky hooks copied (requires: npm i -D husky lint-staged && npx husky init)"
fi

echo "Done. Installed:"
echo "  $ROOT/.cursor/"
echo "  $ROOT/.claude/"
echo ""
echo "CLAUDE.md references .claude/rules/ — reload your AI session."

# Validate bootstrap parity
if [ -x "$BOOTSTRAP/validate-ai-config.sh" ]; then
  "$BOOTSTRAP/validate-ai-config.sh" || echo "  Warning: validate-ai-config.sh reported issues" >&2
fi
