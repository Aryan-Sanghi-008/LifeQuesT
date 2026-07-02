---
name: bulk-nativewind-migration
description: Ordered project-wide migration from StyleSheet to NativeWind className for LifeQuesT. Use when migrating all UI, bulk NativeWind pass, or completing styling migration.
disable-model-invocation: true
---

# Bulk NativeWind Migration

## Current state
All `src/screens/` and `src/components/` use legacy `StyleSheet` + `COLORS`/`SPACING`. Target: `className` + `SHADOWS` in StyleSheet only.

## Migration order
1. `src/components/index.tsx` (shared primitives)
2. `src/components/StatPanel.tsx`, `EventCard.tsx`, `BottomSheet.tsx`, `DecisionSheet.tsx`, `Avatars.tsx`, `LifeGlyph.tsx`
3. `src/navigation/MainTabNavigator.tsx`
4. Screens by traffic:
   - `LifeScreen.tsx` → `AuthScreen.tsx` → `ShopScreen.tsx`
   - `CharacterCreateScreen.tsx` → `SaveSlotScreen.tsx`
   - `PeopleScreen.tsx` → `CareerScreen.tsx` → `AssetsScreen.tsx`
   - `ProfileScreen.tsx` → `ActivitiesScreen.tsx` → `StatsScreen.tsx` → `DeathScreen.tsx`

## Per-file checklist
1. Follow `frontend/migrate-nativewind` token mapping.
2. Remove unused `COLORS`/`SPACING`/`FONTS` imports.
3. Keep `StyleSheet` only for `SHADOWS.*` elevation.
4. Run `npm run lint` on the file.
5. Visual check on iOS + Android if layout-heavy.

## Done criteria (project)
- Zero `StyleSheet.create` in screens/components except shadow styles referencing `SHADOWS`.
- All new layout/color via `className`.
- `npm run type-check` passes.

## See also
`docs/workflows/FRONTEND_WORKFLOW.md`
