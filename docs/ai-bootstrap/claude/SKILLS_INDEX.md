# LifeQuesT Skills Index

> Load a skill only when the task matches. Do not read all skills upfront.

| Keywords | Skill | Workflow doc |
|----------|-------|--------------|
| new screen, tab, route | `frontend/new-screen` | `docs/workflows/FRONTEND_WORKFLOW.md` |
| NativeWind, className, migrate StyleSheet | `frontend/migrate-nativewind` | `docs/workflows/FRONTEND_WORKFLOW.md` |
| new component, UI primitive | `frontend/new-component` | `docs/workflows/FRONTEND_WORKFLOW.md` |
| life event, gameData, event | `engine/new-life-event` | `docs/workflows/ENGINE_WORKFLOW.md` |
| balance, difficulty, tuning | `engine/balance-tune` | `docs/workflows/ENGINE_WORKFLOW.md` |
| age up bug, stuck, loop | `engine/age-up-trace` | `docs/workflows/ENGINE_WORKFLOW.md` |
| cloud function, callable, firebase function | `backend/cloud-function` | `docs/workflows/BACKEND_WORKFLOW.md` |
| firestore, schema, collection | `backend/firestore-schema` | `docs/workflows/BACKEND_WORKFLOW.md` |
| cloud save, sync, slot | `backend/cloud-save` | `docs/workflows/BACKEND_WORKFLOW.md` |
| IAP, product, SKU, purchase | `backend/iap-product` | `docs/workflows/MONETIZATION_WORKFLOW.md` |
| ad, interstitial, rewarded, AdMob | `monetization/ad-placement` | `docs/workflows/MONETIZATION_WORKFLOW.md` |
| unit test, jest, engine test | `qa/write-engine-test` | `docs/workflows/QA_WORKFLOW.md` |
| bug, regression, fix | `qa/regression-fix` | `docs/workflows/QA_WORKFLOW.md` |
| EAS, build, submit, release | `release/eas-build` | — |
| expo upgrade, SDK bump | `release/expo-upgrade` | `AGENTS.md` |
| save, load, MMKV, migration | `debug/persistence` | `docs/workflows/ARCHITECTURE.md` |
| rules, skills, hooks, AI config, bootstrap, convention | `meta/maintain-ai-config` | `docs/workflows/AI_CONFIG_WORKFLOW.md` |

**Paths:** `.cursor/skills/{path}/SKILL.md` or `.claude/skills/{path}/SKILL.md`

After using a skill, append one line to `docs/workflows/SKILLS_CHANGELOG.md`.

**Maintain config:** Edit `docs/ai-bootstrap/` only → `setup.sh` → `validate-ai-config.sh`.
