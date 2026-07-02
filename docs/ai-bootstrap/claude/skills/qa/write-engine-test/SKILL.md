---
name: write-engine-test
description: Writes Jest unit tests for LifeQuesT pure engine functions. Use when adding tests to src/engine/ or testing game logic math.
disable-model-invocation: true
---

# Write Engine Test

## Location
`src/engine/__tests__/economyEngine.test.ts` (co-located pattern).

## Template
```ts
import { clamp, applyEffect, computeNetWorth } from '@engine/economyEngine';
import { CharacterStats } from '@types/index';

describe('clamp', () => {
  it('bounds value between 0 and 100', () => {
    expect(clamp(150)).toBe(100);
    expect(clamp(-5)).toBe(0);
  });
});

describe('applyEffect', () => {
  it('adds stat deltas and clamps', () => {
    const stats: CharacterStats = { health: 50, happiness: 50, /* ...defaults */ };
    const next = applyEffect(stats, { health: 10 });
    expect(next.health).toBe(60);
  });
});
```

## Config
Uses root `jest.config.js` with `moduleNameMapper` for `@engine/*`, `@types/*`.

## Run
```bash
npm test -- --testPathPattern=economyEngine
```

## Priority order
economyEngine → eventEngine → careerEngine → peopleEngine
