# LifeQuesT AI Config Bootstrap

Local-only Cursor and Claude configuration for this project. Active config lives in gitignored `.cursor/` and `.claude/` at the repo root.

## One-time setup

```bash
./docs/ai-bootstrap/setup.sh
```

Re-run after editing templates in `docs/ai-bootstrap/cursor/` or `docs/ai-bootstrap/claude/`.

## What gets installed

| Path | Purpose |
|------|---------|
| `.cursor/rules/` | Glob-scoped constraints (token-efficient) |
| `.cursor/skills/` | On-demand task playbooks |
| `.cursor/hooks.json` | Shell/file/prompt enforcement |
| `.claude/rules/` | Claude department rules (lazy-loaded via GLOBAL routing) |
| `.claude/skills/` | Same playbooks for Claude Code |
| `.claude/commands/` | Slash command shortcuts |
| `.claude/settings.json` | Hooks + Expo plugin |

## Token strategy

- **Always on:** `AGENTS.md` + `GLOBAL` rule + `SKILLS_INDEX.md` (via slim `CLAUDE.md`)
- **On demand:** Department rules (Cursor globs / Claude routing table)
- **Procedures:** Skills — load only when task matches
- **Deep reference:** `docs/workflows/` — linked from skills, never inlined in rules
- **Zero tokens:** Hooks (lint, secret scan, dangerous shell block)

## Maintenance

1. Edit files under `docs/ai-bootstrap/`
2. Run `./docs/ai-bootstrap/setup.sh`
3. Run `./docs/ai-bootstrap/validate-ai-config.sh`
4. Append to `docs/workflows/SKILLS_CHANGELOG.md` when adding skills

### Self-maintaining AI config
When conventions or stacks change, use skill `meta/maintain-ai-config` or Claude command `/maintain-ai-config`.
The `sync-ai-bootstrap` hook auto-runs `setup.sh` after bootstrap edits.
