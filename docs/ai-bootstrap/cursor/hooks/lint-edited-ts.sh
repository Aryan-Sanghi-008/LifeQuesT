#!/usr/bin/env bash
# ESLint edited TypeScript files — fail on errors, allow warnings
input=$(cat)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 0

node -e "
const d = JSON.parse(process.argv[1] || '{}');
const path = d.file_path || d.path || '';
if (!/\\.(ts|tsx)\$/.test(path)) process.exit(0);
if (/node_modules|functions\\/lib|^docs\\//.test(path)) process.exit(0);
" "$input" || exit 0

FILE=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.file_path||d.path||'');" "$input")
[ -z "$FILE" ] && exit 0

TARGET="$FILE"
[ -f "$ROOT/$FILE" ] && TARGET="$ROOT/$FILE"
[ ! -f "$TARGET" ] && exit 0

if command -v npx >/dev/null 2>&1; then
  npx eslint "$TARGET" --max-warnings 999
  exit $?
fi
exit 0
