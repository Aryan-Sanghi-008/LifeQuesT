# LifeQuest — Performance Baseline (Phase 12)

> Device: OnePlus 13R · Build: Expo dev client  
> Plan reference: [LIFEQUEST_ROLLOUT_PLAN.md](./LIFEQUEST_ROLLOUT_PLAN.md) Phase 12

## Measurement protocol

1. **Cold start TTI** — app icon tap → Home tab interactive (ms). Dev logs: `[perf] cold_start:*` in Metro console.
2. **LifeScreen scroll** — character with 40+ years of events; fling scroll. Rating 1–5 (5 = butter smooth).
3. **Age-up ceremony** — 10 consecutive age-ups; note frame drops during stagger / legendary overlay.
4. **Tab switch** — Home → Life → Career → Profile first-mount lag (subjective 1–5).
5. **Memory** — Android Developer Options → Running services after 20 age-ups.
6. **Engine** — `npm test -- ageUp.perf.test.ts` → p50 / p95 `runAgeUp()` ms. **CI gate (Phase 14): p95 must be < 50ms.**

## Before (pre–Phase 12 optimizations)

| Metric | Value | Notes |
|---|---|---|
| Cold start TTI | _Capture on device_ | Use `[perf] cold_start:*` Metro logs |
| LifeScreen scroll (1–5) | _Capture on device_ | 40+ year save recommended |
| Age-up ceremony jank | _Capture on device_ | Pass / Fail + notes |
| Tab switch (1–5) | _Capture on device_ | |
| Memory after 20 age-ups | _Capture on device_ | MB if available |
| ageUp p50 / p95 (engine) | 3.0ms / 5.0ms (n=100) | Jest baseline; CI fails if p95 ≥ 50ms |
| APK download size | _Run `npm run analyze:bundle`_ | Script added in Phase 12 |

### Known limitations

- Benchmarked on flagship OnePlus 13R only; mid-range (Redmi Note 11 class) not covered pre-launch.
- Full-online features (cloud sync, leaderboard, LiveOps) depend on Firebase deploy (separate track).
- FlashList v2 auto-measures item sizes; `estimatedItemSize` is not used (removed in v2 API).

## After (post–Phase 12 optimizations)

| Metric | Before | After | Delta |
|---|---|---|---|
| Cold start TTI | _TBD device_ | _TBD device_ | Parallel hydrate + asset preload |
| LifeScreen scroll (1–5) | _TBD device_ | _TBD device_ | Memoized feed rows + EventCard |
| Age-up ceremony jank | _TBD device_ | _TBD device_ | Ceremony syncs with `isProcessing` |
| Tab switch (1–5) | _TBD device_ | _TBD device_ | Fewer store subscriptions |
| Memory after 20 age-ups | _TBD device_ | _TBD device_ | |
| ageUp p50 / p95 (engine) | 3.0 / 5.0 ms | 3.0 / 5.0 ms | No engine regression (Jest) |
| APK download size | _TBD_ | _TBD_ | Run `npm run analyze:bundle` |

## Automated engine benchmark

```bash
npm test -- ageUp.perf.test.ts --watchman=false
```

Results are logged to stdout (p50, p95, min, max). Not gated in CI.

## Bundle analysis

```bash
npm run analyze:bundle
```

Document top modules and total JS bundle size below after running export.

### Top modules (after audit)

Run locally:

```bash
npm run analyze:bundle
```

Opens `dist/bundle-audit/report.html` with module breakdown. Requires network for first `source-map-explorer` fetch.

## Regression smoke checklist

Run on OnePlus 13R dev client after pulling Phase 12:

- [ ] Age-up with 10+ years event history
- [ ] Legendary / epic card reveal + confetti
- [ ] Death → interstitial → reincarnate
- [ ] Shop open + tab switch while Life tab mounted
- [ ] Mystery box spin
- [ ] `[perf] cold_start:hydrate=` and `post_hydrate=` logs appear in Metro

## Phase 12 changes summary

- LifeScreen: FlashList `estimatedItemSize`, memoized `FeedListItem`, ceremony sync with `isProcessing`, memoized finance derivations
- EventCard: `React.memo`
- Zustand: `useHomeHub`, `useRetentionModals`, `useShopActions`, `useScenarioPurchase`; no bare `useGameStore()` in features
- CareerScreen: single shallow hook, props to sub-panels
- App startup: parallel hydrate / RC / LiveOps; DiceBear asset preload; dev perf timing logs
