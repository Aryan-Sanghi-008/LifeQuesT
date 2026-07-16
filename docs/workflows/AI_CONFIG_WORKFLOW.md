# AI Config Maintenance Workflow

## Purpose
Keep Cursor (`.cursor/`) and Claude (`.claude/`) config aligned when project conventions, stacks, or workflows change.

**Source of truth:** `docs/ai-bootstrap/` (committed) → `setup.sh` → local `.cursor/` + `.claude/` (gitignored).

## Artifact decision matrix

| Requirement type | Create/update | Keep short? | Example |
|------------------|---------------|-------------|---------|
| Always-on constraint | **Rule** (`global` or dept `.mdc`/`.md`) | Yes (~50 lines) | "No `any` in TypeScript" |
| File-scoped constraint | **Rule** with `globs` | Yes | StyleSheet + `@theme` on screens |
| Multi-step procedure | **Skill** (`SKILL.md`) | ≤120 lines body | Add life event template |
| Must run every time | **Hook** (shell script) | N/A | Block `.env` commits |
| Deep encyclopedia | **Workflow doc** (`docs/workflows/`) | Any length | Architecture, balance curve |
| Slash shortcut | **Claude command** | 5–10 lines | `/new-event` |

**Never:** Duplicate workflow doc content inside rules. Rules point; skills procedure; docs encyclopedia.

## When to update (triggers)

Update AI config when ANY of these happen:
1. New recurring task pattern (3+ times expected)
2. New layer, service, or stack (e.g. leaderboard, push notifications)
3. Convention change (styling, imports, testing gate)
4. New enforcement need (secret scan, lint gate, dangerous command)
5. Roadmap phase adds a department or cross-cutting concern
6. Bug caused by missing AI guidance

## Sync procedure (mandatory)

1. Edit **`docs/ai-bootstrap/`** only (never edit `.cursor/` or `.claude/` directly).
2. Mirror changes in **both** `cursor/` and `claude/` subtrees:
   - Rules: `.mdc` (Cursor) + `.md` (Claude) — same content, format differs
   - Skills: identical `SKILL.md` in both `cursor/skills/` and `claude/skills/`
   - Hooks: same `.sh` in both `hooks/` folders; update both `hooks.json` and `settings.json`
3. Update `claude/SKILLS_INDEX.md` with keywords + workflow link.
4. Update `GLOBAL` routing table if new department rule.
5. Add Claude slash command if skill is high-frequency.
6. Append `docs/workflows/SKILLS_CHANGELOG.md`.
7. Run `./docs/ai-bootstrap/setup.sh`.
8. Run `./docs/ai-bootstrap/validate-ai-config.sh` — fix all errors before finishing.

## File templates

### New skill
```
docs/ai-bootstrap/cursor/skills/{dept}/{name}/SKILL.md
docs/ai-bootstrap/claude/skills/{dept}/{name}/SKILL.md  (copy identical)
```
Frontmatter: `name`, `description` (WHAT + WHEN), `disable-model-invocation: true`.

### New department rule
```
docs/ai-bootstrap/cursor/rules/{dept}.mdc   # globs + alwaysApply: false
docs/ai-bootstrap/claude/rules/{DEPT}.md
```
Add row to `GLOBAL` routing table in both `global.mdc` and `GLOBAL.md`.

### New hook
1. Script in `cursor/hooks/` and `claude/hooks/`
2. Register in `cursor/hooks.json`
3. Register in `claude/settings.json` under appropriate event
4. `chmod +x` scripts; `setup.sh` handles this

## Consistency checks

| Check | Command |
|-------|---------|
| Cursor/claude skill parity | `validate-ai-config.sh` |
| SKILLS_INDEX coverage | Every skill dir listed |
| Hook scripts exist | paths in hooks.json resolve |
| No secrets in bootstrap | no `.env` values in templates |

## Token budget rules

- `CLAUDE.md`: max 3 `@` includes (AGENTS, GLOBAL, SKILLS_INDEX).
- Department rules: lazy-loaded only.
- Skills: on-demand only (`disable-model-invocation: true`).
- Shrink rules by linking to workflow docs instead of inlining.
