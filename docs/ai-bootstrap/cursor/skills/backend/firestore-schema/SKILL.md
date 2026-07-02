---
name: firestore-schema
description: Plans Firestore schema changes for LifeQuesT with service updates and security rules stubs. Use when adding collections, fields, or cloud data models.
disable-model-invocation: true
---

# Firestore Schema Change

## Current schema
```
users/{uid}
users/{uid}/saves/{slotId}     # Character object
users/{uid}/purchases/{txnId}  # IAP record
```

## Change process
1. Document new paths in `docs/workflows/BACKEND_WORKFLOW.md`.
2. Update read/write in `src/services/cloudSave.ts` or relevant service.
3. Add `firestore.rules` stub when repo adds `firebase.json`:
   ```
   match /users/{uid}/{document=**} {
     allow read, write: if request.auth.uid == uid;
   }
   ```
4. Migration: version field on documents if shape changes.

## Rules
- Services layer only — no store imports.
- Cloud failures non-fatal on client.
- Batch writes for multi-doc updates.
