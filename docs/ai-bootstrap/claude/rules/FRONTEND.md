# Frontend

## Styling — NativeWind required
- Use `className` for layout, color, spacing, typography.
- `StyleSheet.create` **only** for shadows/elevation.
- Tokens: `bg-bg`, `text-t-1`, `text-gold`, `p-4`, `rounded-md` — see `tailwind.config.js`.

## Screens
- `SafeAreaView` root with `className="flex-1 bg-bg"`.
- Granular Zustand selectors — never whole `character` object.
- Store actions only — no game logic in screens.
- Nav: `RootStackParamList` / `MainTabParamList`.

## Components
- Props-driven; barrel export via `src/components/index.tsx`.
- `accessibilityLabel` on pressables; haptics on state-changing buttons.
- `FlatList`/`SectionList` for lists > 10 items.

## Skills
- `frontend/new-screen`, `frontend/migrate-nativewind`, `frontend/new-component`
