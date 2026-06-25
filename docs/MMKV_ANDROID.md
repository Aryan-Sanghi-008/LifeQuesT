# MMKV on Android Release Builds

## Default behavior

By default, **MMKV is disabled on Android release builds** and the app uses AsyncStorage instead. This avoids native crashes on some RN 0.85 release builds (see `src/utils/nativeAvailability.ts`).

## Enable MMKV after validation

1. Set in EAS env or local `.env`:
   ```
   EXPO_PUBLIC_USE_MMKV=true
   ```
2. Build a preview APK:
   ```bash
   eas build --profile preview --platform android
   ```
3. On a physical device, verify:
   - App launches without crash
   - Create character → age up → force close → reopen (save persists)
   - Save slot screen loads instantly (no long hydration delay)

## Rollback

Remove `EXPO_PUBLIC_USE_MMKV` or set it to `false`, then rebuild.

## When to enable

Enable MMKV when you need faster synchronous saves on mid-range+ Android devices and have confirmed stability on your target hardware.
