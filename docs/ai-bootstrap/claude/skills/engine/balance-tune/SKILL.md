---
name: balance-tune
description: Tunes LifeQuesT game balance for stats, economy, and event frequency. Use when gameplay feels too easy, too hard, or economy is broken.
disable-model-invocation: true
---

# Balance Tune

## Process
1. Play 3+ full lives focusing on the reported issue.
2. Identify layer: engine math (`economyEngine`), event weights (`eventEngine`), or content (`gameData`).
3. Change one variable at a time.

## Age difficulty reference
| Age | Expected |
|-----|----------|
| 0–12 | Education, family events |
| 13–18 | School, romance, crime risk |
| 19–24 | University, first job |
| 25–40 | Career peak, assets |
| 40–60 | Health risks |
| 60+ | Retirement, death risk rises |
| 80+ | Sharp death probability increase |

## Economy checks
- Typical player should accumulate wealth by 30s with employed career.
- `tickAnnualEconomy` salary vs expenses ratio ~1.2–1.5 for middle class.
- Net worth via `computeNetWorth()` — verify asset appreciation rates.

## Event frequency
- `pickEvents` count: 1–3 per age-up.
- No category should dominate >40% of events in a 20-year window.

Document changes in commit message with rationale.
