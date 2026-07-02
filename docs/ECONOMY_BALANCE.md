# Economy Balance Reference

Phase 9 economy targets from the rollout plan:

| Player profile | Daily time | Monthly coin target (total) |
|----------------|------------|----------------------------|
| Casual free     | ~5 min/day | ~15,000 |
| Engaged free    | ~20 min/day | ~40,000 |

## Currency architecture

| Currency | Earn via | Anti-inflation |
|----------|----------|----------------|
| Coins | Gameplay, daily quests, season pass, milestones | Daily gameplay cap: **5,000** |
| Gems | Achievements, purchase, rare events | No cap |
| Tickets | Season pass, login (exempt), IAP spins (capped) | Weekly gameplay cap: **5** (login + gem purchases exempt) |
| Legacy Points | Death / prestige | No cap |
| Karma | Choices, events | Drifts ±2 toward 50 per age-up |

## Source inventory

| Source | Cap status | Notes |
|--------|------------|-------|
| Daily quest claims | Capped | 3 quests/day, ~30–96 coins each |
| Mystery box (coin segment) | Capped | 100 or 300 coins per spin |
| Season pass tier coins | Capped | ~1,580 total per season |
| Season pass tier tickets | Capped | Tiers 5 and 10 grant 1 ticket each |
| Dynasty milestones | Capped | One-time lifetime grants |
| Absence return bonus | Capped | `150 + daysAway × 75`, max ~375 |
| Login rewards | **Exempt** | Retention ladder; reduced ~35% mid/late cycle |
| IAP coin packs | **Exempt** | Premium signal |
| Achievement coins | **Exempt** | Collection/progression reward |
| Collection set coins | **Exempt** | Long-term completion reward |
| Gem-purchased mystery spins | **Exempt** | Premium spend |

## Post-tuning monthly projections

Assumptions: 30-day month, daily login claimed, 3 quests completed when playing.

### Casual (~5 min/day)

| Source | Est. monthly |
|--------|--------------|
| Login (full 30-day cycle, rebalanced) | ~9,500 |
| Daily quests (~3 × ~42 avg × 20 active days) | ~2,500 |
| Mystery box (4 weekly spins × ~175 avg coins) | ~700 |
| **Total** | **~12,700–15,500** |

### Engaged (~20 min/day)

| Source | Est. monthly |
|--------|--------------|
| Login (full cycle) | ~9,500 |
| Daily quests (3 × ~42 × 28 days) | ~3,500 |
| Mystery box + ticket spins | ~1,200 |
| Season pass (if owned, spread over season) | ~580/mo |
| Absence bonus (occasional) | ~200 |
| **Total** | **~38,000–42,000** |

Dynasty milestones and collection sets are excluded from monthly projections (one-time spikes).

## Rebalance changelog (Phase 9)

- **loginRewards.ts**: Reduced days 8–27 coin escalations ~35%
- **questEngine.ts**: Quest rewards +20%
- **gameData.ts SEASON_PASS_TIERS**: Coins −15%; tickets on tiers 5 & 10
- **dynastyMilestones.ts**: Coin rewards −25%
- **progressionSlice.ts**: Absence formula `150 + daysAway × 75`

## Implementation

Cap logic lives in `src/engine/economyCapEngine.ts`. All capped grants route through `grantCappedGameplayCoins` / `grantCappedGameplayTickets` in `src/store/slices/progressionSlice.ts`.
