---
name: ci-github-actions
description: Sets up and maintains GitHub Actions CI for LifeQuesT with type-check, test, and lint gates. Use when adding CI, fixing pipeline, or matching local validate to GitHub.
disable-model-invocation: true
---

# CI — GitHub Actions

## Workflow file
`.github/workflows/ci.yml` — runs on push/PR to `main`.

## Gates
| Step | Required | Command |
|------|----------|---------|
| Type-check | Yes | `npm run type-check` |
| Tests | Yes | `npm test` |
| Lint | Advisory* | `npm run lint` |

*Lint uses `continue-on-error: true` until pre-existing ESLint errors are fixed. Flip to required when clean.

## Local parity
```bash
npm run validate   # type-check + lint + test
```

## Adding a new gate
1. Add script to `package.json`.
2. Add step to `.github/workflows/ci.yml`.
3. Document in `docs/workflows/QA_WORKFLOW.md`.
4. Update `qa/regression-fix` if bug-fix workflow changes.

## Node version
Match `package.json` engines (`>=22.13.0`) in CI `node-version`.

## See also
`docs/workflows/QA_WORKFLOW.md`, `qa/write-engine-test`
