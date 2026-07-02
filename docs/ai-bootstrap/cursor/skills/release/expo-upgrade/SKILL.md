---
name: expo-upgrade
description: Upgrades LifeQuesT Expo SDK and aligns React Native dependencies. Use when bumping Expo version or fixing SDK compatibility issues.
disable-model-invocation: true
---

# Expo Upgrade

## Current target
Expo SDK **56** — https://docs.expo.dev/versions/v56.0.0/

## Process
1. Read Expo upgrade guide for target SDK.
2. `npx expo install --fix` to align peer deps.
3. Update `babel-preset-expo`, `jest-expo`, `expo-*` packages together.
4. Check breaking changes: Reanimated, RN New Architecture, NativeWind.
5. `npx expo prebuild --clean` if native dirs regenerated.
6. `npm run validate` + manual smoke on iOS/Android.

## Project-specific
- `react-native-google-mobile-ads` plugin in `app.json`
- `@react-native-google-signin/google-signin` plugin
- `expo-dev-client` required for native modules

## Do not
- Upgrade one package in isolation without checking Expo compatibility table.
- Commit `/ios` or `/android` — they are gitignored; regenerate locally.

Update `AGENTS.md` doc URL when SDK changes.
