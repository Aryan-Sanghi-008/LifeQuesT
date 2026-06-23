---
name: iap-product
description: Adds IAP products end-to-end for LifeQuesT — client SKU, server grants, store UI. Use when adding coins, premium, or remove-ads products.
disable-model-invocation: true
---

# IAP Product

## Touch points
1. `src/types/index.ts` — extend `IAPProductId` union.
2. `src/services/iap.ts` — product list, `requestPurchase`, `verifyPurchaseOnServer`.
3. `functions/src/index.ts` — `COIN_GRANTS` or entitlement logic in `verifyPurchase`.
4. `src/store/gameStore.ts` — `applyPurchaseToStore` mirrors server grants.
5. `src/screens/ShopScreen.tsx` — UI row for product.

## Server grant map (keep in sync)
```ts
// functions — COIN_GRANTS + isPremium/hasNoAds flags
// gameStore.applyPurchaseToStore — same productId → same effects
```

## Flow
```
requestPurchase(productId)
  → verifyPurchaseOnServer (callable)
  → applyPurchaseToStore
  → _persist()
```

## Rules
- Idempotent `transactionId` on server.
- Free core gameplay unchanged.
- Test with sandbox accounts on real devices.

See `docs/workflows/MONETIZATION_WORKFLOW.md`.
