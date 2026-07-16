# Country Economy Data

All 42 selectable birthplaces in `COUNTRIES` (`src/data/gameData.ts`) have a matching entry in `COUNTRY_ECONOMY` (`src/data/countryEconomy.ts`).

## Sources (hand-balanced for gameplay)

Profiles in `src/data/countryEconomy/profiles.ts` use research anchors from:

- World Bank — GDP per capita, life expectancy
- IMF — inflation ranges
- OECD / national statistics — salary benchmarks (teacher, engineer, doctor)
- Numbeo-style COL indices (approximate multipliers)

Values are **static JSON** in the repo — not live API calls.

## Fields per country

| Field | Game use |
|---|---|
| `salaries.*` | Jobs, careers, annual economy tick |
| `costs.*` | Property, vehicles, tuition, living expenses |
| `lifeExpectancy` | Mortality curve in `mortalityEngine.ts` |
| `crimeSeverityMod` | Fine scaling in `countryScaleEngine.ts` |
| `startingBalance` | Character creation by family background |
| `getMaxPersonalDebt(country, familyBackground)` | Debt crisis + spend warnings; `wage × 3 × COL × 100 × family multiplier` |
| `FAMILY_DEBT_MULTIPLIERS` | Poor 0.5× · Middle 1× · Wealthy 2× · Royalty 4× |
| `playabilityBoost` | Optional salary bonus / cost discount for gameplay balance |

## Scaling

USD-anchored amounts in event/activity/career data pass through `scaleCountryAmount()` in `src/engine/countryScaleEngine.ts`.

**Career salaries** must use `getCountrySalary()` in `careerEngine.ts`, which routes through `scaleCountryAmount(..., 'salary')` — never `salaryMultiplier` alone.

Formula:
- **Salary**: `baseUsd × currencyScale × salaryMultiplier × (1 + salaryBonus)`
- **Costs** (assets, activities, gifts): `baseUsd × currencyScale × costOfLivingIndex × (1 - costDiscount)`

`playabilityBoost` is auto-derived in `buildCountryConfig()` for lower-income countries when not explicitly set on the profile.

## Playability targets

`getPlayabilityMetrics(countryCode)` returns engineer salary, suggested stock buy, minimum investment floor, hatchback price, and `monthsToStock`.

**Target:** every birthplace allows buying a suggested stock portfolio within **36 months** of gross engineer salary (gameplay-first). Players may invest any amount at or above the **minimum investment** (~$1 USD scaled).

Tests in `src/data/__tests__/countryEconomy.test.ts` assert this for all 42 countries.

## Birthplace preview (character create)

`StepBirthplace.tsx` on the **Origins** wizard step shows a compact **Country snapshot** when a country is selected:

- Life expectancy
- Starting balance (updates with family background)
- Max personal debt (updates with family background)

Tap **View economy details** for the full sheet (engineer salary, min investment, suggested stock buy, hatchback price). Inline values use `formatCurrency`; the details sheet uses `formatCurrencyFull`.

Country selection uses **region tabs** (Asia, Middle East, Europe, Americas, Africa, Oceania) with search scoped to the active tab — see `WorldMapPicker.tsx` and `COUNTRY_REGIONS` in `gameData.ts`.

## Validation

`src/data/__tests__/countryEconomy.test.ts` asserts every birthplace code has config + life expectancy + playability metrics.
