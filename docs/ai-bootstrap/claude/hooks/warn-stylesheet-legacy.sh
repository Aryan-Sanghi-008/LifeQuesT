#!/usr/bin/env bash
# Warn when legacy StyleSheet is used for layout (non-shadow) in UI files
input=$(cat)
FILE=$(node -e "const d=JSON.parse(process.argv[1]||'{}'); console.log(d.file_path||d.path||'');" "$input" 2>/dev/null || echo "")

case "$FILE" in
  src/screens/*|src/components/*)
    ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
    TARGET="$ROOT/$FILE"
    [ ! -f "$TARGET" ] && exit 0
    if grep -q 'StyleSheet\.create' "$TARGET" && ! grep -q 'SHADOWS' "$TARGET"; then
      echo "WARN: Legacy StyleSheet in $FILE — migrate via frontend/migrate-nativewind skill" >&2
    fi
    ;;
esac
exit 0
