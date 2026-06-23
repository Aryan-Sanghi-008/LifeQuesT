#!/usr/bin/env bash
# Block dangerous shell commands and commits of secret files
input=$(cat)
node -e "
const d = JSON.parse(process.argv[1] || '{}');
const cmd = (d.command || '').trim();
const deny = (msg) => {
  console.log(JSON.stringify({ permission: 'deny', user_message: msg, agent_message: msg }));
  process.exit(0);
};
const allow = () => { console.log(JSON.stringify({ permission: 'allow' })); process.exit(0); };

if (/rm\s+-rf\s+\/(\\s|$)/.test(cmd)) deny('Blocked: rm -rf /');
if (/git\s+push\s+.*(-f|--force)/.test(cmd) && /(main|master)\b/.test(cmd)) {
  deny('Blocked: force push to main/master');
}
if (/git\s+commit/.test(cmd)) {
  const staged = (d.staged_files || []).join(' ');
  if (/\\.env\\b|google-services\\.json|GoogleService-Info\\.plist|serviceAccount/.test(staged)) {
    deny('Blocked: commit includes secret files (.env, Firebase configs)');
  }
}
allow();
" "$input"
