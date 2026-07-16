---
name: persistence
description: Debugs LifeQuesT save/load, slot migration, and character normalization. Use when saves corrupt, slots empty, or legacy migration fails.
disable-model-invocation: true
---

# Persistence Debug

## Files
- `src/services/persistence.ts` — MMKV/AsyncStorage, 3 slots, `migrateLegacySaves`
- `src/services/cloudSave.ts` — optional cloud layer
- `gameStore._persist()` / hydration in `App.tsx`

## Slot model
- `MAX_SAVE_SLOTS = 3`
- Active slot: `getActiveSlotId()` / `setActiveSlotId()`
- List: `listLocalSlots()`

## normalizeCharacter
Ensures all required `Character` fields exist with defaults after load. If stats look wrong after load, check normalization first.

## Migration
`migrateLegacySaves()` — runs once for old key format. Don't remove until all users migrated.

## Debug checklist
1. Is `isHydrated` true before UI renders game?
2. MMKV available on native? AsyncStorage fallback on web?
3. Guest uid vs Firebase uid — different storage paths?
4. Compare local JSON vs Firestore doc for same slot.

See `docs/workflows/ARCHITECTURE.md` persistence section.
