#!/usr/bin/env bash
# Auto-sync .cursor/.claude when bootstrap templates are edited
input=$(cat)
FILE=$(node -e "const d=JSON.parse(process.argv[1]||'{}'); console.log(d.file_path||d.path||'');" "$input" 2>/dev/null || echo "")

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

case "$FILE" in
  docs/ai-bootstrap/*)
    if [ -x "$ROOT/docs/ai-bootstrap/setup.sh" ]; then
      "$ROOT/docs/ai-bootstrap/setup.sh" >/dev/null 2>&1 || true
      echo "AI config synced: ran docs/ai-bootstrap/setup.sh after editing $FILE" >&2
    fi
    if [ -x "$ROOT/docs/ai-bootstrap/validate-ai-config.sh" ]; then
      "$ROOT/docs/ai-bootstrap/validate-ai-config.sh" >&2 || true
    fi
    ;;
esac
exit 0
