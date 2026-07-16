---
name: new-screen
description: Scaffolds a new React Native screen for LifeQuesT with SafeAreaView, themed StyleSheet, nav types, and Zustand selectors. Use when adding a screen, tab, or stack route.
disable-model-invocation: true
---

# New Screen

## Checklist
1. Read `frontend.mdc` / `FRONTEND.md` rule.
2. Add route to `RootStackParamList` or `MainTabParamList` in `src/types`.
3. Register in `RootNavigator.tsx` or `MainTabNavigator.tsx`.
4. Create screen under `src/features/...`.

## Template
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@store/gameStore';
import { useTheme, useThemedStyles } from '@theme';

export function XxxScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const someField = useGameStore(s => s.character?.someField);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.t1 }]}>Title</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    root: { flex: 1 },
    body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    title: { fontSize: 20, fontWeight: '700' },
  });
```

## Rules
- StyleSheet + `@theme` tokens for layout/color.
- Granular selectors only.
- Store actions for game changes — no engine imports in screens when avoidable.
- `accessibilityLabel` on pressables.

## Verify
- Type-check: `npm run type-check`.
