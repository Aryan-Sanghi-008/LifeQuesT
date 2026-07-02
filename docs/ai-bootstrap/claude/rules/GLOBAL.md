# LifeQuesT Global

## TypeScript
- Strict mode always. No `any`, no `@ts-ignore` without comment.
- Extend types in `src/types/index.ts` — do not duplicate interfaces.

## Layer boundaries (enforce strictly)
| Layer | May import | Must NOT import |
|-------|-----------|-----------------|
| `engine/` | `types/`, `data/` | `store/`, `services/`, `screens/`, `components/` |
| `store/` | `engine/`, `services/`, `types/`, `data/`, `utils/` | `screens/`, `components/` |
| `services/` | `types/`, `config/`, Firebase SDK | `store/`, `engine/` |
| `screens/` | `store/`, `components/`, `types/`, `navigation/` | `engine/` directly |
| `components/` | `types/`, `theme/`, `constants/` | `store/` (use props) |

## Imports
- Use path aliases when touching a file.
- **Alias parity:** new alias → update `tsconfig.json`, `babel.config.js`, and `jest.config.js` together.

## Expo
- SDK **56** only. Read https://docs.expo.dev/versions/v56.0.0/ before writing Expo/RN code.

## Token efficiency
- Do NOT load `docs/workflows/*` unless the task requires that department.
- Use `SKILLS_INDEX.md` to find playbooks.

## AI config maintenance
When conventions change → `.claude/skills/meta/maintain-ai-config/SKILL.md`
Edit `docs/ai-bootstrap/` only; run `setup.sh` + `validate-ai-config.sh`.

## Department routing (read file only when task matches)
| Task | Read |
|------|------|
| Screens, components, navigation | `.claude/rules/FRONTEND.md` |
| Engine, gameData, store | `.claude/rules/GAMEENGINE.md` |
| Services, functions, config | `.claude/rules/BACKEND.md` |
| Tests, lint, jest | `.claude/rules/QA.md` |
| Ads, IAP, shop | `.claude/rules/MONETIZATION.md` |
| Types, nav params | `.claude/rules/TYPES.md` |
| Theme, tailwind | `.claude/rules/THEME.md` |
| App entry, boot order | `.claude/rules/APP_BOOT.md` |
| Rules, skills, hooks, AI templates | `.claude/rules/META_AI_CONFIG.md` |
