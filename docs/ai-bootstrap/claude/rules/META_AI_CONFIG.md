# Meta AI Config

## Golden rule
**Source of truth:** `docs/ai-bootstrap/` → `setup.sh` → `.claude/` + `.cursor/`
Never edit `.claude/` or `.cursor/` directly.

## When to read this file
- Bootstrap, workflow, or AI template edits
- User wants new/updated rules, skills, or hooks
- Conventions or stack changed

## Required skill
`.claude/skills/meta/maintain-ai-config/SKILL.md`

## After every change
```bash
./docs/ai-bootstrap/setup.sh
./docs/ai-bootstrap/validate-ai-config.sh
```

See `docs/workflows/AI_CONFIG_WORKFLOW.md`.
