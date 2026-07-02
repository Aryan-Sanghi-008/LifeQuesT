---
name: cloud-function
description: Adds Firebase callable Cloud Functions for LifeQuesT following verifyPurchase patterns. Use when creating server endpoints, IAP verification, or scheduled jobs.
disable-model-invocation: true
---

# Cloud Function

## File
`functions/src/index.ts` — export new `functions.https.onCall`.

## Template (match existing v1 style)
```ts
export const myFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }
  const uid = context.auth.uid;
  // validate data
  // idempotent Firestore writes
  return { ok: true };
});
```

## Rules
- Never trust client `uid` — use `context.auth.uid`.
- Idempotent writes for purchases/grants.
- No game simulation — entitlements and aggregation only.
- Build: `cd functions && npm run build`

## Deploy
```bash
cd functions && npm run deploy
```

See `docs/workflows/BACKEND_WORKFLOW.md` for planned: `updateLeaderboard`, `cleanupOldSaves`.
