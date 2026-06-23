---
name: regression-fix
description: Fixes LifeQuesT bugs using failing-test-first regression workflow. Use when fixing bugs, regressions, or reported incorrect behavior.
disable-model-invocation: true
---

# Regression Fix

## Process
1. **Reproduce** — minimal steps or failing test case.
2. **Write failing test** — engine unit test preferred; store integration if UI-adjacent.
3. **Fix** — smallest correct change in the right layer (engine not screen).
4. **Verify** — `npm run validate`.
5. **Commit** — fix + test together.

## Layer guide
| Bug in | Fix in |
|--------|--------|
| Wrong stat math | `src/engine/` |
| UI not updating | Store selector or action |
| Save lost | `persistence.ts` / `cloudSave.ts` |
| Purchase not granted | `iap.ts` + `verifyPurchase` function |

## Do not
- Patch symptoms in screens when engine is wrong.
- Skip test because "it's a small fix".

See `docs/workflows/QA_WORKFLOW.md`.
