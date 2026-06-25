# Store Release — P0 Checklist (Android first)

Complete these steps when your Google Play Developer account is ready.

## Before first Play Console upload

- [ ] Copy `.firebaserc.example` to `.firebaserc` and set your Firebase project ID
- [ ] Deploy backend: `npm run deploy:backend`
- [ ] Deploy privacy policy: `npm run deploy:hosting`
- [ ] Set `EXPO_PUBLIC_PRIVACY_POLICY_URL` in EAS to your hosted URL (e.g. `https://YOUR_PROJECT.web.app/privacy-policy.html`)
- [ ] Set production AdMob IDs in EAS (`EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`, rewarded, interstitial)
- [ ] Rebuild preview/production: `eas build --profile preview --platform android`

## Firebase Functions secrets (IAP)

After Play Console + service account are configured:

```bash
firebase functions:secrets:set GOOGLE_PLAY_PACKAGE_NAME
# value: com.lifequest.app

firebase functions:secrets:set GOOGLE_PLAY_SERVICE_ACCOUNT
# paste full JSON from Google Cloud service account (Play Console → API access)

firebase deploy --only functions
```

Wire secrets to the function environment in `functions/src/index.ts` if using Firebase secret bindings, or map them to `process.env` in your deploy config.

**Local emulator only** (never production):

```bash
export IAP_ALLOW_UNVERIFIED=true
export FUNCTIONS_EMULATOR=true
```

## Play Console — In-app products

Create products matching `IAPProductId` in [`src/types/index.ts`](../src/types/index.ts):

| Product ID | Type |
|------------|------|
| `premium_monthly` | Subscription |
| `premium_yearly` | Subscription |
| `remove_ads` | One-time |
| `coins_small` / `coins_medium` / `coins_large` | Consumable |
| `gems_small` | Consumable |
| `luck_boost` | Consumable |
| `reincarnation_scroll` | Consumable |

## Play Console — Store listing

- [ ] Privacy policy URL (same as `EXPO_PUBLIC_PRIVACY_POLICY_URL`)
- [ ] Data safety form: declare Auth, Analytics, Ads, purchases
- [ ] Add license testers for sandbox IAP
- [ ] Complete content rating questionnaire

## Verify on device

1. Sign in with Google (not guest)
2. Complete a sandbox purchase — entitlement should apply only after server verification
3. Restore purchases from Shop — verified grants only
4. Firebase Console → Analytics → DebugView — confirm `age_up`, `create_character` events
5. Firestore rules simulator — confirm another user cannot read your saves

## P0 exit criteria

| Item | Status |
|------|--------|
| Firestore rules deployed | Owner-only; purchases not client-writable |
| IAP function | Android validation path; rejects without secrets |
| AdMob | Production app ID in EAS preview build |
| Analytics | Events in DebugView on preview build |
| Privacy policy | Hosted + in-app link works |
| Shop copy | No false premium claims |
| Restore purchases | Server verification required for signed-in users |

## After P0 — next phase

See project plan P1: bidirectional cloud save, entitlement hydration on login, engine test coverage.
