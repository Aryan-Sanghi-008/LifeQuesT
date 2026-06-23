---
name: eas-build
description: Runs EAS builds and submits LifeQuesT to app stores. Use for release builds, TestFlight, internal distribution, or production submit.
disable-model-invocation: true
---

# EAS Build

## Profiles (`eas.json`)
| Profile | Environment | Use |
|---------|-------------|-----|
| `development` | `development` | Dev client, internal |
| `preview` | `preview` | Internal QA |
| `production` | `production` | Store release, autoIncrement |

## Prerequisites
- `eas.json` + `app.config.ts` with EAS `projectId` in `extra.eas`.
- Local (gitignored): `google-services.json`, `GoogleService-Info.plist` in project root.
- EAS **file** env vars (required for cloud builds — EAS only uploads git-tracked files):

```bash
# Android — upload your local google-services.json (repeat --environment per env)
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type file \
  --value ./google-services.json \
  --environment development --environment preview --environment production \
  --visibility secret

# iOS — download from Firebase Console → iOS app → GoogleService-Info.plist
eas env:create --scope project --name GOOGLE_SERVICES_PLIST --type file \
  --value ./GoogleService-Info.plist \
  --environment development --environment preview --environment production \
  --visibility secret
```

`app.config.ts` reads these at build time:

```ts
android: { googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json' }
ios:     { googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist' }
```

- EAS plain/sensitive env vars for `EXPO_PUBLIC_*` as needed.
- `app.config.ts` **plugins** must include `react-native-iap` (adds `missingDimensionStrategy "store", "play"` for Gradle).

## Common build failures
| Error | Fix |
|-------|-----|
| `google-services.json` missing | Upload `GOOGLE_SERVICES_JSON` file env var (see above) |
| Gradle variant ambiguity `amazon` vs `play` for `:react-native-iap` | Add `'react-native-iap'` to `plugins` in `app.config.ts` |

## Commands
```bash
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile production --platform all
eas submit --platform ios
```

## Pre-build checklist
```bash
npx expo doctor
npm run validate
```

## Bundle IDs
- iOS: `com.lifequest.app`
- Android: `com.lifequest.app`
