# Frontend

## Styling — NativeWind target
- **New files:** `className` for layout/color/spacing.
- **Legacy:** StyleSheet + `COLORS`/`SPACING` — migrate when touching via `migrate-nativewind`.
- **Bulk pass:** `frontend/bulk-nativewind-migration`.
- `StyleSheet` only for `SHADOWS` elevation.
- Tokens: `bg-bg`, `text-t-1`, `text-gold` — `tailwind.config.js`.

## Screens / components
- SafeAreaView root; granular selectors; store actions only.
- Skills: `new-screen`, `migrate-nativewind`, `bulk-nativewind-migration`, `add-navigation-route`
