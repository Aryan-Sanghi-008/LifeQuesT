# Backend

## Services
- No `store/` or `engine/` imports.
- Cloud save failures non-fatal.
- Auth via `subscribeAuth()` only.

## Functions
- `uid` from `context.auth`; idempotent IAP writes.
- Match `verifyPurchase` style in `functions/src/index.ts`.

## Secrets
- `EXPO_PUBLIC_*` only in client config. Never commit `.env`.

## Skills
- `backend/cloud-function`, `backend/firestore-schema`, `backend/cloud-save`, `backend/iap-product`
