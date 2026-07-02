---
name: maintain-ai-config
description: Creates or updates LifeQuesT Cursor/Claude rules, skills, hooks, and workflow docs when conventions change, new stacks are added, or recurring patterns emerge. Use when adding AI config, updating rules/skills/hooks, syncing bootstrap templates, or establishing new project conventions.
disable-model-invocation: true
---

# Maintain AI Config

Read `docs/workflows/AI_CONFIG_WORKFLOW.md` for full reference. Follow this checklist exactly.

## Step 1 — Classify the requirement

| Signal | Action |
|--------|--------|
| "Always do X" / "Never do Y" | Update or create **rule** |
| "How do I do X" (multi-step) | Create or update **skill** |
| "X must run every time" | Create or update **hook** |
| Long background / architecture | Update **workflow doc**; link from skill/rule |
| Frequent Claude shortcut | Add **command** in `claude/commands/` |

## Step 2 — Choose target department

| Dept | Rule glob / path | Skill prefix |
|------|------------------|--------------|
| Frontend | `src/screens/**`, components, navigation | `frontend/` |
| Engine | `src/engine/**`, data, store | `engine/` |
| Backend | services, functions, config | `backend/` |
| QA | tests, jest, eslint | `qa/` |
| Monetization | ads, iap, shop | `monetization/` |
| Types | `src/types/**` | — (usually rule only) |
| Theme | theme, tailwind | — (usually rule only) |
| Cross-cutting | `global.mdc` / `GLOBAL.md` | `meta/` |
| Release/ops | — | `release/` or `debug/` |

**Prefer updating** an existing rule/skill over creating duplicates. Search `SKILLS_INDEX.md` first.

## Step 3 — Edit bootstrap (source of truth)

All edits go under `docs/ai-bootstrap/`:

```
docs/ai-bootstrap/
├── cursor/rules/*.mdc
├── cursor/skills/**/SKILL.md
├── cursor/hooks.json + cursor/hooks/*.sh
├── claude/rules/*.md
├── claude/skills/**/SKILL.md   # must match cursor skills
├── claude/commands/*.md
├── claude/settings.json
└── claude/SKILLS_INDEX.md
```

### Update existing artifact
1. Open the skill/rule in `docs/ai-bootstrap/cursor/` and `claude/`.
2. Keep rules ≤50 lines; skills ≤120 lines body.
3. Remove stale guidance; link to workflow doc instead of copying.

### Create new skill
```markdown
---
name: kebab-name
description: [WHAT]. Use when [WHEN keywords].
disable-model-invocation: true
---

# Title
## Checklist
...
## See also
docs/workflows/RELEVANT_WORKFLOW.md
```
Copy to both `cursor/skills/{dept}/{name}/` and `claude/skills/{dept}/{name}/`.

### Create new rule (Cursor)
```yaml
---
description: One line
globs: path/pattern/**
alwaysApply: false
---
```
Mirror as `.claude/rules/NAME.md`. Add routing row to `global.mdc` + `GLOBAL.md`.

### Create new hook
1. Write `cursor/hooks/my-hook.sh` (executable, node for JSON stdin).
2. Copy to `claude/hooks/my-hook.sh`.
3. Register in `cursor/hooks.json` and `claude/settings.json`.
4. Use narrowest event: `beforeShellExecution`, `afterFileEdit`, `beforeReadFile`, `beforeSubmitPrompt`.

## Step 4 — Update index and changelog

1. Add row to `docs/ai-bootstrap/claude/SKILLS_INDEX.md` (keywords, path, workflow doc).
2. Append `docs/workflows/SKILLS_CHANGELOG.md`:
   `YYYY-MM-DD | [Dept] | Created/updated {artifact} — {why}`

## Step 5 — Sync and validate

```bash
./docs/ai-bootstrap/setup.sh
./docs/ai-bootstrap/validate-ai-config.sh
```

Fix all validation errors. Reload AI session after sync.

## Step 6 — Verify robustness

- [ ] Cursor and Claude skill trees identical
- [ ] SKILLS_INDEX lists new skill
- [ ] GLOBAL routing updated if new dept rule
- [ ] Hook scripts exist and are executable
- [ ] No workflow doc duplicated inside rule
- [ ] `disable-model-invocation: true` on new skills
- [ ] Convention change reflected in relevant **dept workflow doc** if behavioral

## Anti-patterns

- Editing `.cursor/` or `.claude/` directly (wiped on next `setup.sh`)
- 200-line rules (split into skill + short rule)
- Loading all dept rules in `CLAUDE.md`
- Skills without trigger keywords in description
- Hooks that duplicate skill logic (hooks enforce; skills guide)
