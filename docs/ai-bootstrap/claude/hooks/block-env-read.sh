#!/usr/bin/env bash
# Deny reading secret files
input=$(cat)
node -e "
const d = JSON.parse(process.argv[1] || '{}');
const path = (d.file_path || d.path || '').toString();
const deny = (msg) => {
  console.log(JSON.stringify({ permission: 'deny', user_message: msg }));
  process.exit(0);
};
if (/^\\.env\$|\\.env\\.local|google-services\\.json|GoogleService-Info\\.plist|firebase-adminsdk|serviceAccount.*\\.json/.test(path)) {
  deny('Reading secret files is blocked. Use .env.example for structure.');
}
console.log(JSON.stringify({ permission: 'allow' }));
" "$input"
