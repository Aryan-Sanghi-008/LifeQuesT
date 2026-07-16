---
name: new-component
description: Creates a reusable LifeQuesT UI component with props-only API, themed StyleSheet, and barrel export. Use for shared UI primitives in src/shared/components/.
disable-model-invocation: true
---

# New Component

## Checklist
1. Create `src/shared/components/XxxName.tsx`.
2. Export from `src/shared/components/index.tsx`.
3. Props interface — no store access.

## Template
```tsx
import { Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '@theme';

interface XxxNameProps {
  label: string;
  onPress?: () => void;
}

export function XxxName({ label, onPress }: XxxNameProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.btn, { backgroundColor: colors.bgCard }]}
    >
      <Text style={[styles.label, { color: colors.t1 }]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = () =>
  StyleSheet.create({
    btn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
    label: { fontSize: 14, fontWeight: '500' },
  });
```

## Rules
- StyleSheet + `@theme` tokens.
- Accept data via props from parent screen.
