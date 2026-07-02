# Game Engine Department Workflow

## Overview
Engine team owns: `src/engine/`, `src/data/gameData.ts`, `src/store/gameStore.ts`

## Core Simulation Loop
```
Player presses Age Up
  → ageUp() guard checks: no pendingDecision, isProcessing=false, isAlive
  → Age + 1 computed
  → Aging stat decay applied (health -1 after 40, fitness -1 after 30)
  → Annual economy ticked (salary, asset appreciation, bank interest)
  → Death check: stats.health <= 0 OR random death chance
  → Event engine: getEligibleEvents() → pickEvents(1-3 events)
  → Auto events applied sequentially (stats stacked)
  → Decision event (with choices) → pendingDecision set → UI pauses
  → Player resolves decision → applyEffect → _checkAchievements → _persist
```

## Adding Content Efficiently
- Use skill files to generate correct templates instantly
- Batch new events: add 10-20 at once in a session
- Test with character at relevant age to verify eligibility

## Balance Tuning Process
1. Play through 3+ lives focused on the new content
2. Track stat trends: is the player dying too fast? Too slow?
3. Verify economy: does a typical player accumulate meaningful wealth?
4. Check event frequency: each category should appear ~every 5-10 years

## Game Difficulty Curve
| Age | Expected State |
|-----|---------------|
| 0-12 | Childhood: education events, family events |
| 13-18 | Teen: school, relationships, crime risk |
| 19-24 | Young adult: university, first job, romance |
| 25-40 | Prime: career growth, marriage, children, asset building |
| 40-60 | Mid-life: health risks, career peak, family events |
| 60+ | Senior: health decline, retirement, legacy events |
| 80+ | Late life: death probability increases sharply |

## Future Engine Features
- Business ownership: create/run a company (revenue, employees)
- Mental health stat: separate from happiness, affects decisions
- Addiction system: risky activities create dependency
- Inheritance system: children inherit stats on reincarnation
- Country-specific event libraries (localized life paths)
- Random disaster events (natural, economic, personal)
