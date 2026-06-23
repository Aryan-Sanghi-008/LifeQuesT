---
name: age-up-trace
description: Debugs LifeQuesT age-up loop bugs by tracing store, engines, and persistence. Use when age up stalls, duplicates events, or stats behave incorrectly.
disable-model-invocation: true
---

# Age-Up Trace

## Guard conditions (`gameStore.ageUp`)
- `pendingDecision` must be null
- `isProcessing` must be false
- `character.isAlive` must be true

## Trace order
```
ageUp()
  → age++, stat decay
  → tickAnnualEconomy(character)
  → incrementCareerYear / career ticks
  → death check (health <= 0 or random)
  → getEligibleEvents(character, LIFE_EVENTS)
  → pickEvents(eligible, count)
  → apply auto events / set pendingDecision
  → _persist() → saveCharacterLocal + syncSaveToCloud
```

## Common bugs
| Symptom | Check |
|---------|-------|
| Button disabled forever | `pendingDecision` not cleared in `resolveDecision` |
| Double age-up | `isProcessing` guard missing or not reset in `finally` |
| Wrong events | Eligibility filters in `eventEngine.ts` |
| Stats not saved | `_persist` not called after `resolveDecision` |
| Cloud desync | `cloudSave.ts` guest uid skip (`local_guest_*`) |

## Debug steps
1. Log `getEligibleEvents` count at suspect age.
2. Unit test the specific engine function in isolation.
3. Verify `normalizeCharacter` on load if stats look corrupted.
