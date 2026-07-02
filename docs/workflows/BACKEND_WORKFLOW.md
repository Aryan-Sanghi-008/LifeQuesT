# Backend Department Workflow

## Overview
Backend team owns: `src/services/`, `functions/`, Firebase config, Firestore security rules

## Service Responsibilities
| Service | Responsibility |
|---------|--------------|
| `auth.ts` | Firebase Auth (Google + anonymous), `AppUser` normalization |
| `persistence.ts` | MMKV on native; AsyncStorage + web fallback store on web/Expo Go |
| `cloudSave.ts` | Firestore character sync at `saves/{uid}/slots/{slotId}` |
| `userBootstrap.ts` | Single-read sign-in bootstrap (profile, entitlements, settings) |
| `settingsSync.ts` | Cloud-authoritative settings sync (theme, audio, notifications) |
| `liveOpsConfig.ts` | Fetch `liveops/current`, MMKV cache (1h TTL), hydrate `liveOpsEngine` |
| `remoteConfig.ts` | Firebase Remote Config defaults + typed getters |
| `analytics.ts` | Firebase Analytics event logging |
| `ads.ts` | Google Mobile Ads; death-flow interstitial + rewarded placements |
| `iap.ts` | react-native-iap product fetch + purchase flow |
| `leaderboard.ts` | Season-scoped leaderboard callables |

## Firestore Collections

```
users/{uid}/
  profile: { displayName, avatarUrl?, createdAt }
  settings: { colorScheme, appThemeId, notificationsEnabled, soundEnabled, ... }
  purchases/{transactionId}                # IAP idempotency (CF only write)
  activeSlotId, displayName, entitlements fields on user doc

saves/{uid}/slots/{slotId}               # character, version, checksum, lastSaved

leaderboard/{uid}                          # legacy flat entries (dual-write)
leaderboard/{seasonId}/entries/{uid}       # season-scoped leaderboard

liveops/current                            # active season config (read: auth)
liveops_history/{seasonId}                 # archived season snapshots (CF only write)
```

## Cloud Functions Deployed
| Function | Trigger | Purpose |
|----------|---------|---------|
| `verifyPurchase` | onCall | Verify IAP receipt with Google/Apple |
| `updateLeaderboard` | onCall | Submit score; dual-write flat + season entry |
| `getLeaderboard` | onCall | Query season entries; fallback to flat collection |
| `cleanupOldSaves` | Scheduled (24h) | Delete stale `saves/*/slots/*` older than 90 days |
| `archiveLiveOpsOnSeasonChange` | onWrite `liveops/current` | Archive prior season to `liveops_history/{seasonId}` |

## Remote Config Keys (client defaults)
| Key | Default | Consumer |
|-----|---------|----------|
| `interstitial_every_n_ageups` | `3` | Death-flow interstitial cadence |
| `starter_pack_enabled` | `true` | `shouldShowStarterOffer()` |
| `daily_reward_multiplier` | `1` | `claimLoginReward` coin grants |
| `featured_scenario_id` | `classic` | `ScenarioPickerScreen` fallback when LiveOps unset |

## Deployment Process
```bash
npm run deploy:backend
# equivalent: firebase deploy --only firestore:rules,firestore:indexes,functions

# Seed LiveOps: import scripts/seed-liveops-current.json → liveops/current
# Or run: .\scripts\seed-liveops.ps1

# Register Remote Config defaults in Firebase console before production
```

## Monitoring
- Firebase Console → Functions → Logs
- Analytics → Events
- Firestore → Usage
