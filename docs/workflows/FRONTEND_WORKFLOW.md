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
- [ ] No inline style objects for layout/color (use NativeWind)
- [ ] FlatList for lists > 10 items
- [ ] Haptic feedback on state-changing buttons

## Design System
- Colors: Use Tailwind palette — `violet-600` primary, `neutral-950` bg, `neutral-900` card
- Typography: Font family set via NativeWind, sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Spacing: 4-unit grid (`p-4` = 16px)
- Border radius: `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for sheets
- Shadows: Use `StyleSheet.create()` (Android elevation + iOS shadow)

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
