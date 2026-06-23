# LifeQuest Cloud Functions

## Setup

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. Create or select a project: `firebase use --add`
4. From this directory: `npm install && npm run build`

## Deploy

```bash
cd functions
npm run deploy
```

The client calls the `verifyPurchase` callable after a successful IAP transaction (`src/services/iap.ts`).

## Production checklist

- Validate Android `purchaseToken` with Google Play Developer API
- Validate iOS receipts with App Store Server API
- Map subscription renewals and refunds
- Store product IDs that match `IAP_PRODUCTS` in the app
