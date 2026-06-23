---
name: new-screen
description: Scaffolds a new React Native screen for LifeQuesT with SafeAreaView, NativeWind, nav types, and Zustand selectors. Use when adding a screen, tab, or stack route.
disable-model-invocation: true
---

# New Screen

## Checklist
1. Read `.claude/rules/FRONTEND.md` or `frontend.mdc` rule.
2. Add route to `RootStackParamList` or `MainTabParamList` in `src/types/index.ts`.
3. Register in `RootNavigator.tsx` or `MainTabNavigator.tsx`.
4. Create `src/screens/XxxScreen.tsx`.

## Template
```tsx
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@store/gameStore';

export function XxxScreen() {
  const someField = useGameStore(s => s.character?.someField);
  const action = useGameStore(s => s.someAction);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-t-1 text-xl font-body-bold">Title</Text>
      </View>
    </SafeAreaView>
  );
}
```

## Rules
- NativeWind `className` for all layout/color.
- Granular selectors only.
- Store actions for game changes — no engine imports.
- `accessibilityLabel` on pressables.

## Verify
- iOS simulator + Android emulator safe area.
- Type-check: `npm run type-check`.
