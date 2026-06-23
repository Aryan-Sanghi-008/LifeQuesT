---
name: eas-build
description: Runs EAS builds and submits LifeQuesT to app stores. Use for release builds, TestFlight, internal distribution, or production submit.
disable-model-invocation: true
---

# EAS Build

## Profiles (`eas.json`)
| Profile | Use |
|---------|-----|
| `development` | Dev client, internal |
| `preview` | Internal QA |
| `production` | Store release, autoIncrement |

## Prerequisites
- `eas.json` + `app.json` EAS projectId configured.
- Local: `google-services.json`, `GoogleService-Info.plist` (not in git).
- EAS secrets for `EXPO_PUBLIC_*` env vars in cloud builds.

## Commands
```bash
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile production --platform all
eas submit --platform ios
```

## Pre-build checklist
```bash
npm run validate
```

## Bundle IDs
- iOS: `com.lifequest.app`
- Android: `com.lifequest.app`
