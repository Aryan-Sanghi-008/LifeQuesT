---
name: new-store-action
description: Adds a new Zustand store action to LifeQuesT gameStore with engine integration, Immer, and persistence. Use when adding store methods, game features, player actions, or extending useGameStore.
disable-model-invocation: true
---

# New Store Action

## Pattern (follow existing actions in `src/store/gameStore.ts`)

```ts
myAction: (arg: string) => {
  const { character, isProcessing } = get();
  if (!character?.isAlive || isProcessing) return { success: false, message: 'Cannot act now' };

  const result = someEngineFn(character, arg); // engine only — no React

  set(s => {
    if (!s.character) return;
    // mutate via Immer
    s.character.stats.health = clamp(s.character.stats.health + result.delta);
  });

  void get()._persist();
  void logEvent('my_action', { arg });
  return { success: true, message: result.message };
},
```

## Checklist
1. Add to `GameStore` interface in `gameStore.ts`.
2. Logic in `src/engine/` if reusable/pure; keep orchestration in store.
3. Guard: `character`, `isAlive`, `pendingDecision`, `isProcessing` as needed.
4. Stat changes via `clamp()` / `applyEffect()` from `economyEngine`.
5. `void get()._persist()` after mutations (never await in `set`).
6. Wire screen: granular selector + call action only.
7. Add engine unit test if new pure logic.

## Anti-patterns
- Game math in screen components
- `await` inside Immer `set`
- Forgetting `_persist` after state change

## See also
`docs/workflows/ENGINE_WORKFLOW.md`, `engine/new-life-event`
