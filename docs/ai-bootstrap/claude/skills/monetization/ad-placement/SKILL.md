---
name: ad-placement
description: Integrates AdMob ads in LifeQuesT with frequency rules and no-ads bypass. Use when adding interstitial, rewarded ads, or changing ad timing.
disable-model-invocation: true
---

# Ad Placement

## Files
- `src/config/ads.ts` — unit IDs, `INTERSTITIAL_EVERY_N_AGEUPS`
- `src/services/ads.ts` — init, `maybeShowInterstitial`, rewarded helpers
- Call sites: e.g. `LifeScreen` after age-up

## Rules
- **No banner ads.**
- Interstitial: every N age-ups (`INTERSTITIAL_EVERY_N_AGEUPS`, default 3).
- Rewarded: user-initiated only (luck boost).
- Skip all ads if `character.hasNoAds === true`.
- `__DEV__`: test IDs from `ads.ts` — never production IDs locally.

## Adding a new surface
1. Check `hasNoAds` / premium before show.
2. Use `maybeShowInterstitial()` — don't block game loop on ad failure.
3. Log analytics event for impression (optional).

## Future
- Season pass may add exclusive ad-free perks — still check `hasNoAds`.
