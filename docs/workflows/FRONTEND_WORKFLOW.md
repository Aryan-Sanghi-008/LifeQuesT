# Frontend Department Workflow

## Overview
Frontend team owns: `src/screens/`, `src/components/`, `src/navigation/`, `src/theme/`, `src/constants/`

## Development Process

### New Feature
1. Check `docs/workflows/PROJECT_VISION.md` for roadmap alignment
2. Check `SKILLS_INDEX.md` for existing patterns before writing from scratch
3. Follow `FRONTEND.md` rules
4. Test on both iOS (simulator) and Android (emulator)
5. Verify no layout issues with safe area / notch
6. Update SKILLS_CHANGELOG.md

### Code Review Checklist
- [ ] SafeAreaView on screen roots
- [ ] Granular store selectors (no `s => s.character`)
- [ ] No game logic in screens (store action calls only)
- [ ] accessibilityLabel on interactive elements
- [ ] NativeWind `className` for layout/color (migrate legacy StyleSheet when touching file)
- [ ] FlatList for lists > 10 items
- [ ] Haptic feedback on state-changing buttons

## Design System
Tokens from `tailwind.config.js` / `src/theme/themes.ts`:
- Backgrounds: `bg-bg`, `bg-bg-2`, `bg-bg-card`
- Text: `text-t-1`, `text-t-2`, `text-t-3`
- Brand: `text-gold`, `text-teal`, `text-crimson`, `text-sapphire`
- Spacing: 4-unit grid (`p-4` = 16px)
- Radius: `rounded-sm`, `rounded-md`, `rounded-lg`
- Shadows: `StyleSheet.create()` with `SHADOWS` only (Android elevation + iOS shadow)

## Legacy migration
Most UI still uses StyleSheet. Use `frontend/migrate-nativewind` per file or `frontend/bulk-nativewind-migration` for ordered project pass.

## Animation Principles
- Enter animations: `fadeInUp` 300-400ms, staggered by 50ms for lists
- State transitions: spring physics via Reanimated
- Button feedback: `active:opacity-75` + haptic on press
- Loading states: pulsing skeleton (future: add SkeletonLoader component)

## Future Considerations
- Dark/light theme toggle (theme tokens in `src/theme/`)
- Tablet layout support (responsive breakpoints via NativeWind)
- Accessibility audit (screen readers, color contrast)
- Localization (i18n strings — keep UI text in constants when possible)
