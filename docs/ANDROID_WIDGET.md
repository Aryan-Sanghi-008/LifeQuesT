# Android Widget (Snapshot Bridge)

LifeQuesT writes a **character snapshot** to MMKV on every `_persist` so a future home-screen widget can read live data without loading the full game store.

## Snapshot format

Key: `widget_character_snapshot` (via [`src/services/persistence.ts`](../src/services/persistence.ts))

```json
{
  "name": "Alex",
  "age": 28,
  "job": "Engineer",
  "health": 72,
  "coins": 150,
  "mentalHealth": 65,
  "updatedAt": 1700000000000
}
```

Written by [`src/services/widgetSnapshot.ts`](../src/services/widgetSnapshot.ts) from `gameStore._persist`.

## When `expo-widgets` Android is stable

1. Install `expo-widgets` and enable Android in `app.config.ts`:

```ts
plugins: [
  [
    'expo-widgets',
    {
      enableAndroid: true,
      widgets: [/* ... */],
    },
  ],
],
```

2. Read snapshot in the widget bundle from the shared MMKV / App Group path documented in [Expo Widgets](https://docs.expo.dev/versions/v56.0.0/sdk/widgets/).

3. Rebuild preview APK and verify the widget shows name, age, and health.

## Validation checklist

- [ ] Age up → snapshot `updatedAt` changes
- [ ] Widget displays correct character after persist
- [ ] No crash when snapshot missing (empty slot)
