---
name: migrate-nativewind
description: Migrates LifeQuesT StyleSheet UI to NativeWind className tokens. Use when editing screens or components that still use StyleSheet, COLORS, or SPACING imports.
disable-model-invocation: true
---

# Migrate to NativeWind

## Token mapping
| StyleSheet / COLORS | className |
|---------------------|-----------|
| `COLORS.bg` | `bg-bg` |
| `COLORS.bg2` | `bg-bg-2` |
| `COLORS.t1` | `text-t-1` |
| `COLORS.t2` | `text-t-2` |
| `COLORS.gold` | `text-gold` |
| `SPACING.md` (16) | `p-4` or `m-4` |
| `RADII.md` | `rounded-md` |
| `flex: 1` | `flex-1` |
| `flexDirection: 'row'` | `flex-row` |

## Shadows (keep StyleSheet)
```tsx
const styles = StyleSheet.create({ card: SHADOWS.card });
<View className="bg-bg-card rounded-md p-4" style={styles.card} />
```

## Steps
1. Remove `StyleSheet` layout/color rules; keep shadow-only styles.
2. Replace `COLORS`/`SPACING` with `className`.
3. Remove unused theme imports.
4. Run `npm run lint` on the file.

## Migration order (project-wide)
`components/` → `MainTabNavigator` → `LifeScreen` → `AuthScreen` → remaining screens.
