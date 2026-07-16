# Accessibility (Phase 13 — Full Scope)

LifeQuest Phase 13 covers visual, motor, and screen reader accessibility for launch-critical paths.

## Included

| Feature | Behavior |
|---|---|
| Dynamic text scaling | OS font scale via `PixelRatio.getFontScale()`, clamped 0.85–1.5; `useTheme().scaledFonts` |
| Reduced motion | **System OR manual** — merged in `useReducedMotion()` |
| High contrast | System `AccessibilityInfo.isHighTextContrastEnabled()` → `applyHighContrast()` |
| Color-blind modes | Settings: None / Protanopia / Deuteranopia → `applyColorBlindMode()` on stat tokens |
| 44pt tap targets | `MIN_TAP_TARGET = 44` on shared pressables, tabs, shop chips |
| Tablet layout | `useBreakpoints()` — 768dp / 1024dp; 2-column Home and Profile |
| Screen reader labels | Critical-path `accessibilityLabel` / `accessibilityRole` / `accessibilityState` |
| Focus management | `useScreenA11yFocus()` — heading focus on screen/tab transition |

## Critical paths (TalkBack QA)

- Main tabs + Quick Actions
- Home: daily reward, mystery box, quests
- Life: Age Up, decision sheet choices
- Shop: filters and purchase actions
- Death: heir selection, continue / reincarnate
- Character Create: wizard steps
- Settings: toggles, theme, color blind mode

See [QA_CHECKLIST.md](./QA_CHECKLIST.md) for the manual walkthrough checklist.

## Deferred / post-launch

- Full label audit on every secondary screen
- Tritanopia color-blind simulation
- WorldScreen tablet 2-column grid (optional stretch)

## Hooks and theme

### `useFontScale`

Reads OS font scale; refreshes on dimension or app foreground changes.

### `useAccessibilityPreferences`

System reduce motion and high text contrast; re-checks on foreground.

### `useScreenA11yFocus`

On navigation focus, calls `AccessibilityInfo.setAccessibilityFocus()` on the screen heading ref.

### `useTheme()` pipeline

```
baseColors → themeVariant → highContrast → colorBlindMode
```

Returns `fontScale`, `scaledFonts`, `colorBlindMode`, `reducedMotion`, `systemReduceMotion`, `highContrast`.

### Label conventions

- Buttons: verb-first (`Claim daily login reward`, not `Claim`)
- Tabs: `"Home tab"` + `accessibilityState={{ selected }}`
- Decision choices: label + hint (`Hold to reveal consequences before choosing`)
- Decorative emoji in stat rows: avoid duplicating in labels where possible

## Reduced motion wiring

`ConfettiOverlay`, `FadeInView`, `ScaleInView`, `EventCard`, `LifeScreen` (Age Up, epic/legendary), `MainTabNavigator`, `GradientButton`, `MysteryBoxScreen`, `AuthScreen`.

Settings copy notes when system reduced motion is active.

## Tests

- `src/shared/hooks/__tests__/useReducedMotion.test.ts`
- `src/shared/hooks/__tests__/useBreakpoints.test.ts`
- `src/shared/theme/__tests__/colorBlind.test.ts`
- Screen integration: `HomeScreen.test.tsx`, `DeathScreen.test.tsx`, `CharacterCreateScreen.test.tsx`

Run: `npm run validate`
