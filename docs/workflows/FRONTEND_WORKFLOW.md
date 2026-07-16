# Frontend Department Workflow

## Overview
Frontend owns: `src/features/`, `src/shared/components/`, `src/navigation/`, `src/shared/theme/`, `src/constants/`

## Development Process

### New Feature
1. Check `docs/workflows/PROJECT_VISION.md` for roadmap alignment
2. Check `SKILLS_INDEX.md` for existing patterns before writing from scratch
3. Follow `FRONTEND.md` / `frontend.mdc` rules
4. Test on Android (primary) and iOS when available
5. Verify safe area / notch
6. Update SKILLS_CHANGELOG.md when conventions change

### Code Review Checklist
- [ ] SafeAreaView on screen roots
- [ ] Granular store selectors (no `s => s.character`)
- [ ] No game logic in screens (store action calls only)
- [ ] accessibilityLabel on interactive elements
- [ ] StyleSheet + `@theme` tokens for layout/color
- [ ] FlatList / SectionList / FlashList for lists > 10 items
- [ ] Haptic feedback on state-changing buttons

## Design System
Tokens from `src/shared/theme/themes.ts` via `useTheme()`:
- Backgrounds: `colors.bg`, `colors.bg2`, `colors.bgCard`
- Text: `colors.t1`, `colors.t2`, `colors.t3`
- Brand: `colors.gold`, `colors.teal`, `colors.crimson`, `colors.sapphire`
- Spacing / radius via theme `spacing` / `radii`
- Shadows: theme `shadows` in StyleSheet
- Overlays: `withAlpha(hex, alpha01)`

## Animation Principles
- Enter animations: fade/slide 300–400ms, staggered by 50ms for lists
- State transitions: spring physics via Reanimated when needed
- Button feedback: opacity + haptic on press

## Future Considerations
- Tablet layout support (breakpoints via `useBreakpoints`)
- Localization (i18n strings — keep UI text in constants when possible)
