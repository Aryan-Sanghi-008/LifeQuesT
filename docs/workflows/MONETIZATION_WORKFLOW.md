# Monetization Department Workflow

## Overview
Monetization team owns: `src/services/iap.ts`, `src/services/ads.ts`, `src/screens/ShopScreen.tsx`

## Economy Model
```
Free Player Experience:
  ✅ Full life simulation (birth → death)
  ✅ All activities (some cost coins)
  ✅ Career, assets, relationships
  ✅ 3 save slots
  ✅ Ads between age-up batches (every 5 ages)

Premium Player ($X/month):
  ✅ Everything free has
  ✅ No ads
  ✅ Unlimited luck boosts
  ✅ Priority cloud save
  ✅ Exclusive traits (future)
  ✅ Season pass access (future)
```

## Coin Economy Flow
```
EARNING:
  Achievements: 50-500 coins
  Daily bonus (future): 25 coins

SPENDING:
  Activities: 10-100 coins
  Premium one-time items: gems

RULE: Coins should be earnable purely through gameplay.
      Never make core gameplay require purchased coins.
```

## Ad Frequency Target
- Interstitial: every 5 age-ups for free users
- Banner: NEVER (too disruptive for immersive gameplay)
- Rewarded: for luck boosts (optional, user-initiated)
- All ads: bypassed when `character.hasNoAds === true`

## IAP Products Health Metrics
Track weekly:
- Conversion rate by product
- Average revenue per user (ARPU)
- Purchase funnel drop-off in ShopScreen
- Refund rate

## Store Submission Checklist
- [ ] All products configured in Google Play Console
- [ ] All products configured in App Store Connect
- [ ] Test purchases completed with sandbox accounts
- [ ] Privacy policy URL set in both stores
- [ ] IAP restore purchases button visible and working
- [ ] No purchases required to progress in core gameplay (store review compliance)

## Future Monetization Features
- Season Pass: monthly rotating content + rewards
- Cosmetic Avatar Packs: premium DiceBear style sets
- Country DLC: extra life events for specific countries
- Family Tree Mode: premium reincarnation with family tree visualization
- LifeQuesT+ Subscription: annual plan with best value
