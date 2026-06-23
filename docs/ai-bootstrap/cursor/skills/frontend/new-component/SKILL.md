---
name: new-component
description: Creates a reusable LifeQuesT UI component with props-only API, NativeWind styling, and barrel export. Use for shared UI primitives in src/components/.
disable-model-invocation: true
---

# New Component

## Checklist
1. Create `src/components/XxxName.tsx`.
2. Export from `src/components/index.tsx`.
3. Props interface — no store access.

## Template
```tsx
import { View, Text, Pressable } from 'react-native';

interface XxxNameProps {
  label: string;
  onPress?: () => void;
}

export function XxxName({ label, onPress }: XxxNameProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className="bg-bg-card rounded-md px-4 py-3 active:opacity-75"
    >
      <Text className="text-t-1 font-body-medium">{label}</Text>
    </Pressable>
  );
}
```

## Rules
- NativeWind `className` for layout/color.
- `StyleSheet` only for `SHADOWS` if needed.
- Accept data via props from parent screen.
