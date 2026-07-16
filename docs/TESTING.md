# LifeQuest — Testing Guide (Phase 14)

Automated confidence layer for launch. Run `npm run validate` before every PR; run `npm run qa:prep` before device QA.

## Quick commands

| Command | Purpose |
|---|---|
| `npm run validate` | Type-check + lint + full Jest suite |
| `npm run qa:prep` | Validate + age-up perf regression gate |
| `npm test -- path/to/test` | Single suite |
| `npm test -- ageUp.perf.test.ts` | Engine perf baseline (p95 < 50ms in CI) |
| `npm run test:rules` | Firestore rules unit tests (emulator; requires **JDK 21+**, e.g. `JAVA_HOME` → Homebrew `openjdk`) |

## RNTL v14 (React Native Testing Library)

- Use **async** render: `const { getByText } = await renderWithProviders(<Screen />);`
- Use **async** press: `await fireEvent.press(getByLabelText('…'));`
- Renderer peer for RNTL v14: `test-renderer@^1.x` (Callstack’s React 19 test renderer). Keep `react-test-renderer@19.2.x` if other tooling still references it.

## Test harness

| Utility | Path | Use |
|---|---|---|
| `renderWithProviders` | [`src/test/renderWithProviders.tsx`](../src/test/renderWithProviders.tsx) | Wraps `NavigationContainer` only |
| `seedGameStore` | [`src/test/seedGameStore.ts`](../src/test/seedGameStore.ts) | Seed Zustand with prestige defaults |
| `createSafeAreaContextMock` | [`src/test/safeAreaMock.ts`](../src/test/safeAreaMock.ts) | Per-screen safe-area mock |
| `mockSliceServices` | [`src/test/mockSliceServices.ts`](../src/test/mockSliceServices.ts) | Persistence/cloud/entitlements mocks |
| `createTestCharacter` | [`src/test/fixtures/character.ts`](../src/test/fixtures/character.ts) | Valid character fixture |

### Safe area rule

**Never** wrap `renderWithProviders` in real `SafeAreaProvider` — RNTL v14 renders an empty tree. Mock safe-area in screen tests instead:

```typescript
jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);
```

## Screen integration tests (launch-critical)

| Screen | File | Flow |
|---|---|---|
| Home | `src/features/life/__tests__/HomeScreen.test.tsx` | Daily reward claim |
| Life | `src/features/life/__tests__/LifeScreen.test.tsx` | Age Up tap |
| Death | `src/features/character/death/__tests__/DeathScreen.test.tsx` | Heir select + continue |
| Character Create | `src/features/character/create/__tests__/CharacterCreateScreen.test.tsx` | Wizard steps |
| Shop | `src/features/economy/shop/__tests__/ShopScreen.test.tsx` | IAP product tap |

### Adding a new screen test

1. Mock `react-native-safe-area-context` if the screen uses `SafeAreaView` / insets.
2. Mock heavy imports: `@components/index` barrel, DiceBear/Avatars, Firebase services, IAP.
3. Mock hooks (`useCharacter`, `useHomeHub`) when testing UI interaction, not full store.
4. Prefer `accessibilityLabel` queries over text for buttons.
5. Keep tests integration-level — real component, mocked services.

## Store slice tests

All slices under `src/store/slices/__tests__/`. Use `mockSliceServices` in `jest.mock` factories to avoid duplicating persistence mocks.

Priority behaviors (Phase 14): save load/delete, social interact/hobby, career apply/promote, activity perform/focus/heir.

## Performance

- [`ageUp.perf.test.ts`](../src/engine/__tests__/ageUp.perf.test.ts): CI gate **p95 < 50ms** for `runAgeUp()`.
- Device metrics (TTI, scroll, APK size): manual — see [PERFORMANCE_BASELINE.md](./PERFORMANCE_BASELINE.md).

## Manual QA

Device checklist: [QA_CHECKLIST.md](./QA_CHECKLIST.md)
