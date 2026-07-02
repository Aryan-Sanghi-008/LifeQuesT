---
name: cloud-save
description: Debugs LifeQuesT cloud save sync between MMKV, AsyncStorage, and Firestore. Use when saves don't sync, slots conflict, or guest vs logged-in behavior differs.
disable-model-invocation: true
---

# Cloud Save Debug

## Priority
```
Local (MMKV native / AsyncStorage web) → authoritative for gameplay
Cloud (Firestore) → backup + cross-device when logged in
```

## Key files
- `src/services/persistence.ts` — slots, `normalizeCharacter`, migration
- `src/services/cloudSave.ts` — `syncSaveToCloud`, `pullCloudSaveIfNewer`
- `gameStore._persist()` — calls both

## Guest skip
- Uids starting with `local_guest_` skip cloud sync entirely.

## Common issues
| Issue | Fix area |
|-------|----------|
| Cloud never updates | `isFirebaseConfigured()`, auth state |
| Older cloud overwrites newer | `pullCloudSaveIfNewer` timestamp compare |
| Corrupt character | `normalizeCharacter()` defaults |
| Slot missing | `MAX_SAVE_SLOTS = 3`, `getActiveSlotId` |

## Test manually
1. Save locally → check MMKV key for slot.
2. Login → verify Firestore `users/{uid}/saves/{slotId}`.
3. Pull on second device → character matches.
