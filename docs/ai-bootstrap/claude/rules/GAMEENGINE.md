# Game Engine

## Engine purity
- No React, Zustand, Firebase in `src/engine/`.
- `clamp()` for stat mutations.

## Store
- Immer: `set(s => {})`; `void get()._persist()` for async.
- New actions: guard → engine → Immer `set` → `void _persist()` → optional `logEvent`. Skill: `engine/new-store-action`.
- Age-up guards: `!pendingDecision`, `!isProcessing`, `isAlive`.

## Age-up order
Economy tick → career → death check → events → decision → persist.

## Skills
- `engine/new-life-event`, `engine/new-store-action`, `engine/age-up-trace`, `engine/balance-tune`
