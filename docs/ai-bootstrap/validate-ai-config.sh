#!/usr/bin/env bash
# Validate LifeQuesT AI bootstrap parity and structure
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BOOTSTRAP="$(cd "$(dirname "$0")" && pwd)"
ERRORS=0

warn() { echo "WARN: $*" >&2; }
fail() { echo "ERROR: $*" >&2; ERRORS=$((ERRORS + 1)); }
ok()   { echo "OK: $*"; }

echo "Validating AI config bootstrap at $BOOTSTRAP"

# 1. Skill parity: cursor vs claude
CURSOR_SKILLS=$(find "$BOOTSTRAP/cursor/skills" -name SKILL.md 2>/dev/null | sort)
CLAUDE_SKILLS=$(find "$BOOTSTRAP/claude/skills" -name SKILL.md 2>/dev/null | sort)

while IFS= read -r cskill; do
  [ -z "$cskill" ] && continue
  rel="${cskill#$BOOTSTRAP/cursor/skills/}"
  claude_path="$BOOTSTRAP/claude/skills/$rel"
  if [ ! -f "$claude_path" ]; then
    fail "Missing Claude mirror: claude/skills/$rel"
  elif ! diff -q "$cskill" "$claude_path" >/dev/null 2>&1; then
    fail "Skill content mismatch: $rel (cursor vs claude)"
  fi
done <<< "$CURSOR_SKILLS"

while IFS= read -r cskill; do
  [ -z "$cskill" ] && continue
  rel="${cskill#$BOOTSTRAP/claude/skills/}"
  cursor_path="$BOOTSTRAP/cursor/skills/$rel"
  if [ ! -f "$cursor_path" ]; then
    fail "Missing Cursor mirror: cursor/skills/$rel"
  fi
done <<< "$CLAUDE_SKILLS"

# 2. Each skill has frontmatter name + description
while IFS= read -r skill; do
  [ -z "$skill" ] && continue
  if ! head -5 "$skill" | grep -q '^name:'; then
    fail "Missing name in frontmatter: $skill"
  fi
  if ! head -10 "$skill" | grep -q '^description:'; then
    fail "Missing description in frontmatter: $skill"
  fi
done <<< "$CURSOR_SKILLS"

# 3. Hook scripts referenced in hooks.json exist
HOOKS_JSON="$BOOTSTRAP/cursor/hooks.json"
if [ -f "$HOOKS_JSON" ]; then
  grep -oE '\.cursor/hooks/[a-zA-Z0-9_-]+\.sh' "$HOOKS_JSON" 2>/dev/null | sort -u | while read -r hookref; do
    script="${hookref#.cursor/}"
    if [ ! -f "$BOOTSTRAP/cursor/$script" ]; then
      fail "Hook script missing: cursor/$script"
    fi
    claude_script="$BOOTSTRAP/claude/${script#hooks/}"
    claude_script="$BOOTSTRAP/claude/hooks/$(basename "$script")"
    if [ ! -f "$claude_script" ]; then
      fail "Claude hook mirror missing: claude/hooks/$(basename "$script")"
    fi
  done
fi

# 4. SKILLS_INDEX mentions each skill directory
INDEX="$BOOTSTRAP/claude/SKILLS_INDEX.md"
if [ -f "$INDEX" ]; then
  while IFS= read -r skill; do
    [ -z "$skill" ] && continue
    # e.g. cursor/skills/engine/new-life-event/SKILL.md -> engine/new-life-event
    rel="${skill#$BOOTSTRAP/cursor/skills/}"
    rel="${rel%/SKILL.md}"
    if ! grep -qF "$rel" "$INDEX" 2>/dev/null; then
      warn "SKILLS_INDEX may not list: $rel"
    fi
  done <<< "$CURSOR_SKILLS"
fi

# 5. Required files
for f in setup.sh README.md cursor/rules/global.mdc claude/rules/GLOBAL.md claude/SKILLS_INDEX.md; do
  if [ ! -f "$BOOTSTRAP/$f" ]; then
    fail "Missing required file: $f"
  fi
done

# 6. No secret patterns in bootstrap
if grep -rE 'AIza[0-9A-Za-z_-]{20,}|EXPO_PUBLIC_[A-Z_]+=[^$\n]{8,}' "$BOOTSTRAP" --include='*.md' --include='*.mdc' --include='*.json' --include='*.sh' 2>/dev/null | grep -v '.example' | grep -q .; then
  fail "Possible secrets found in bootstrap templates"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Validation failed with $ERRORS error(s)."
  exit 1
fi

ok "All checks passed ($(( $(echo "$CURSOR_SKILLS" | grep -c SKILL || true) )) skills)"
exit 0
