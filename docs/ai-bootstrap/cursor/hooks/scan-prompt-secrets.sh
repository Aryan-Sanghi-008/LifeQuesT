#!/usr/bin/env bash
# Block prompts that appear to contain secrets or API keys
input=$(cat)
node -e "
const d = JSON.parse(process.argv[1] || '{}');
const prompt = (d.prompt || d.text || '').toString();
const deny = (msg) => {
  console.log(JSON.stringify({ continue: false, user_message: msg }));
  process.exit(0);
};
const allow = () => { console.log(JSON.stringify({ continue: true })); process.exit(0); };

if (/EXPO_PUBLIC_[A-Z_]+=\\S{8,}/.test(prompt)) deny('Prompt may contain env secrets. Remove values before sending.');
if (/AIza[0-9A-Za-z_-]{20,}/.test(prompt)) deny('Prompt may contain a Google API key.');
if (/-----BEGIN (RSA |EC )?PRIVATE KEY-----/.test(prompt)) deny('Prompt may contain a private key.');
if (/firebase-adminsdk.*\\.json/.test(prompt) && /\"private_key\"/.test(prompt)) deny('Prompt may contain service account JSON.');
allow();
" "$input"
