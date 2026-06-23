# Backend Department Workflow

## Overview
Backend team owns: `src/services/`, `functions/`, Firebase config, Firestore security rules

## Service Responsibilities
| Service | Responsibility |
|---------|--------------|
| `auth.ts` | Firebase Auth (Google + anonymous), `AppUser` normalization |
| `persistence.ts` | MMKV + AsyncStorage save slot management |
| `cloudSave.ts` | Firestore character sync (non-critical path) |
| `analytics.ts` | Firebase Analytics event logging |
| `ads.ts` | Google Mobile Ads init + interstitial serving |
| `iap.ts` | react-native-iap product fetch + purchase flow |

## Firebase Project Structure
```
Firestore Collections:
  users/{uid}/
    saves/{slotId}         # Character save data (JSON string)
    profile/{uid}          # Display name, avatar (future leaderboard)
  leaderboard/{docId}      # Aggregated top scores (future)
  purchases/{transactionId} # Verified IAP records (idempotency)
```

## Cloud Functions Deployed
| Function | Trigger | Purpose |
|----------|---------|---------|
| `verifyPurchase` | onCall | Verify IAP receipt with Google/Apple |
| `updateLeaderboard` | onCall | Submit score after character death |
| `cleanupOldSaves` | Scheduled | Archive old inactive saves |

## Deployment Process
```bash
# Deploy all Cloud Functions
cd functions && npm run build && firebase deploy --only functions

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Full backend deploy
firebase deploy
```

## Monitoring
- Firebase Console → Functions → Logs (check for errors after deploy)
- Analytics → Events (verify events are firing from app)
- Firestore → Usage (monitor read/write costs)

## Future Backend Features
- Push notifications (FCM) — daily play reminders
- Leaderboard with aggregation Cloud Function
- A/B testing via Remote Config
- Dynamic event library from Firestore (no app update needed)
- Purchase receipt validation hardening (jailbreak detection)
- Daily reward Cloud Function (server-authoritative)
