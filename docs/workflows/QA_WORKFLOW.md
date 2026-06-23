# QA Department Workflow

## Overview
QA team owns: `**/__tests__/`, `.eslintrc.js`, `tsconfig.json`, `jest.config.js`

## Testing Pyramid
```
         [Manual]
        Smoke Tests
       /           \
   [Integration]   [E2E - Future]
   Store Actions
      /
 [Unit]
Engine Functions
```

## Test Coverage Goals
| Layer | Target Coverage |
|-------|----------------|
| `src/engine/` | 90%+ — pure functions, easy to test |
| `src/store/` | 70%+ — integration tests for key actions |
| `src/services/` | 50%+ — mock Firebase, test transformation logic |
| `src/components/` | Snapshot tests for key components |
| `src/screens/` | Smoke tests only (manual) |

## Running Tests
```bash
npm test                                    # All tests
npm test -- --watch                         # Watch mode
npm test -- --coverage                      # Coverage report
npm test -- --testPathPattern=careerEngine  # Single file
```

## Test Priority Queue
When capacity is limited, prioritize tests in this order:
1. `economyEngine` — core math, used everywhere
2. `eventEngine` — eligibility logic, complex conditions
3. `careerEngine` — promotion/raise/job roll logic
4. `persistence` — save/load with migration
5. `gameStore.ageUp` — integration test for the main loop

## Regression Testing Process
When a bug is found:
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test now passes
4. Commit both fix and test together

## Pre-Release Checklist
```bash
npm run type-check   # Must: 0 errors
npm run lint         # Must: 0 errors (warnings ok)
npm test             # Must: all pass
```
Manual on iOS sim → Android emulator → real device (for IAP/ads)

## CI (GitHub Actions)
Workflow: `.github/workflows/ci.yml` — runs on push/PR to `main`.

| Step | Required in CI |
|------|----------------|
| `npm run type-check` | Yes |
| `npm test` | Yes |
| `npm run lint` | Advisory (`continue-on-error` until lint debt cleared) |

Local parity: `npm run validate`

Skill: `qa/ci-github-actions`

## Future QA Improvements
- Detox E2E tests for critical flows (character creation, age up loop)
- Flip CI lint to required when ESLint errors are fixed
- Visual regression testing for UI components
- Performance benchmarks for ageUp() execution time
- Automated balance testing (simulate 100 lives, check stat distribution)
