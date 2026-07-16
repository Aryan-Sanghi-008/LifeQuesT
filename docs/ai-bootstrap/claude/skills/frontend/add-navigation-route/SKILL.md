---
name: add-navigation-route
description: Registers a new screen or tab route in LifeQuesT React Navigation with types, navigators, and screen scaffold. Use when adding navigation routes, stack screens, or bottom tabs.
disable-model-invocation: true
---

# Add Navigation Route

## Stack screen
1. Add to `RootStackParamList` in `src/types/index.ts`:
   ```ts
   MyScreen: { itemId?: string } | undefined;
   ```
2. Create `src/screens/MyScreen.tsx` (use `frontend/new-screen` skill).
3. Register in `src/navigation/RootNavigator.tsx`:
   ```tsx
   <Stack.Screen name="MyScreen" component={MyScreen} options={{ headerShown: false }} />
   ```
4. Navigate: `navigation.navigate('MyScreen', { itemId: 'x' })`.

## Bottom tab
1. Add to `MainTabParamList` in `src/types/index.ts`.
2. Register in `src/navigation/MainTabNavigator.tsx` (tab icon + screen).
3. Tabs are only for primary game areas — modals use stack.

## Rules
- Typed navigation only — no stringly-typed routes.
- Stack overlays (Shop, Stats, Activities) stay on `RootStack`, not tabs.
- Update both param list and navigator in same change.

## See also
`frontend/new-screen`, `docs/workflows/FRONTEND_WORKFLOW.md`
