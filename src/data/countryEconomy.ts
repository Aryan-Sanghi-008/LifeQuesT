// ─── LifeQuest Country Economy System ────────────────────────────────────────
// Single source of truth for all country-specific economic data.
// Every financial value in the game MUST derive from this config.

import { COUNTRY_PROFILES } from './countryEconomy/profiles';
import { buildCountryConfig } from './countryEconomy/buildCountryConfig';
import type { FamilyBackground } from '../types';

export type { CountryEconomyConfig, PlayabilityBoost } from './countryEconomy/types';
import type { CountryEconomyConfig } from './countryEconomy/types';

/** USD anchors used for playability metrics and birthplace preview. */
export const ENGINEER_SALARY_USD_ANCHOR = 95_000;
export const STOCK_MIN_USD_ANCHOR = 10_000;
export const HATCHBACK_USD_ANCHOR = 18_000;

/** Hand-tuned overrides for countries where builder rounding needs refinement. */
const HAND_TUNED: Partial<Record<string, Partial<CountryEconomyConfig>>> = {
  IN: {
    startingBalance: { poor: 5_000, middle: 50_000, wealthy: 5_00_000, royalty: 50_00_000 },
    costs: {
      rent: 1_80_000, groceries: 60_000, healthcare: 30_000,
      educationPrimary: 0, educationUniversity: 2_00_000,
      carBase: 6_00_000, houseBase: 40_00_000,
    },
    salaries: {
      minimumWage: 1_20_000, teacher: 3_60_000, engineer: 7_00_000,
      doctor: 12_00_000, lawyer: 8_00_000, pilot: 25_00_000,
      nurse: 3_00_000, chef: 2_40_000, police: 2_40_000, banker: 6_00_000,
      entrepreneur: 8_00_000,
    },
    stockMarketVolatility: 1.4, inflationRate: 0.06, propertyAppreciation: 0.08,
    // Soften USD-anchor event/activity costs (starting balances are already INR).
    playabilityBoost: { costDiscount: 0.35, salaryBonus: 0.05 },
  },
  US: {
    startingBalance: { poor: 2_000, middle: 25_000, wealthy: 2_50_000, royalty: 2_500_000 },
    costs: {
      rent: 18_000, groceries: 6_000, healthcare: 8_000,
      educationPrimary: 0, educationUniversity: 35_000,
      carBase: 28_000, houseBase: 380_000,
    },
    salaries: {
      minimumWage: 15_000, teacher: 55_000, engineer: 95_000,
      doctor: 200_000, lawyer: 120_000, pilot: 130_000,
      nurse: 75_000, chef: 45_000, police: 58_000, banker: 90_000,
      entrepreneur: 110_000,
    },
  },
  JP: {
    startingBalance: { poor: 200_000, middle: 2_000_000, wealthy: 20_000_000, royalty: 200_000_000 },
    costs: {
      rent: 1_500_000, groceries: 600_000, healthcare: 200_000,
      educationPrimary: 0, educationUniversity: 800_000,
      carBase: 2_500_000, houseBase: 30_000_000,
    },
    salaries: {
      minimumWage: 1_600_000, teacher: 4_500_000, engineer: 6_000_000,
      doctor: 14_000_000, lawyer: 10_000_000, pilot: 12_000_000,
      nurse: 4_200_000, chef: 3_500_000, police: 4_800_000, banker: 8_000_000,
      entrepreneur: 7_000_000,
    },
    stockMarketVolatility: 1.1, inflationRate: 0.02, propertyAppreciation: 0.02,
  },
  NG: {
    startingBalance: { poor: 50_000, middle: 500_000, wealthy: 5_000_000, royalty: 50_000_000 },
    costs: {
      rent: 600_000, groceries: 300_000, healthcare: 150_000,
      educationPrimary: 0, educationUniversity: 800_000,
      carBase: 8_000_000, houseBase: 40_000_000,
    },
    salaries: {
      minimumWage: 540_000, teacher: 1_500_000, engineer: 4_000_000,
      doctor: 8_000_000, lawyer: 6_000_000, pilot: 15_000_000,
      nurse: 2_000_000, chef: 1_200_000, police: 1_500_000, banker: 5_000_000,
      entrepreneur: 5_000_000,
    },
    stockMarketVolatility: 2.0, inflationRate: 0.18, propertyAppreciation: 0.10,
  },
  AE: {
    startingBalance: { poor: 10_000, middle: 100_000, wealthy: 1_000_000, royalty: 10_000_000 },
    costs: {
      rent: 60_000, groceries: 18_000, healthcare: 10_000,
      educationPrimary: 0, educationUniversity: 50_000,
      carBase: 80_000, houseBase: 1_200_000,
    },
    salaries: {
      minimumWage: 0, teacher: 90_000, engineer: 160_000,
      doctor: 350_000, lawyer: 200_000, pilot: 300_000,
      nurse: 100_000, chef: 80_000, police: 90_000, banker: 180_000,
      entrepreneur: 200_000,
    },
    stockMarketVolatility: 1.2, inflationRate: 0.025, propertyAppreciation: 0.08,
  },
};

function mergeConfig(base: CountryEconomyConfig, override?: Partial<CountryEconomyConfig>): CountryEconomyConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    startingBalance: { ...base.startingBalance, ...override.startingBalance },
    costs: { ...base.costs, ...override.costs },
    salaries: { ...base.salaries, ...override.salaries },
    playabilityBoost: override.playabilityBoost ?? base.playabilityBoost,
  };
}

export const COUNTRY_ECONOMY: Record<string, CountryEconomyConfig> = Object.fromEntries(
  COUNTRY_PROFILES.map((profile) => {
    const built = buildCountryConfig(profile);
    const merged = mergeConfig(built, HAND_TUNED[profile.code]);
    return [profile.code, merged];
  }),
);

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getCountryEconomy(countryCode: string): CountryEconomyConfig {
  return COUNTRY_ECONOMY[countryCode] ?? COUNTRY_ECONOMY.IN;
}

export function getSalaryForCountry(
  roleKey: keyof CountryEconomyConfig['salaries'],
  countryCode: string,
): number {
  const eco = getCountryEconomy(countryCode);
  return eco.salaries[roleKey] ?? eco.salaries.minimumWage;
}


export const FAMILY_DEBT_MULTIPLIERS: Record<FamilyBackground, number> = {
  poor: 0.5,
  middle: 1,
  wealthy: 2,
  royalty: 4,
};

/** Applied to the legacy wage × 3 × COL debt anchor (100× for gameplay headroom). */
const DEBT_SCALE_FACTOR = 100;

export function getStartingBalance(
  background: FamilyBackground,
  countryCode: string,
): number {
  return getCountryEconomy(countryCode).startingBalance[background];
}

export function getMaxPersonalDebt(
  countryCode: string,
  familyBackground: FamilyBackground = 'middle',
): number {
  const eco = getCountryEconomy(countryCode);
  const wageBase = eco.salaries.minimumWage > 0
    ? eco.salaries.minimumWage
    : eco.salaries.teacher;
  const base = wageBase * 3 * Math.max(0.5, eco.costOfLivingIndex) * DEBT_SCALE_FACTOR;
  const multiplier = FAMILY_DEBT_MULTIPLIERS[familyBackground] ?? 1;
  return Math.round(base * multiplier);
}

export function getMaxPersonalDebtForCharacter(
  character: { countryCode?: string; familyBackground?: FamilyBackground },
): number {
  return getMaxPersonalDebt(
    character.countryCode ?? 'IN',
    character.familyBackground ?? 'middle',
  );
}

export function getLifeExpectancy(countryCode: string): number {
  return getCountryEconomy(countryCode).lifeExpectancy;
}

export function applyTax(grossSalary: number, countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  return Math.round(grossSalary * (1 - eco.taxRate));
}

export function getAnnualCostOfLiving(countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  return eco.costs.rent + eco.costs.groceries + eco.costs.healthcare;
}

/** Wealth target for millionaire-style challenges in local currency. */
export function getChallengeWealthTarget(countryCode: string, usdTarget = 1_000_000): number {
  const eco = getCountryEconomy(countryCode);
  const profile = COUNTRY_PROFILES.find((p) => p.code === countryCode);
  const cs = profile?.currencyScale ?? 1;
  return Math.round(usdTarget * cs * eco.salaryMultiplier * 2.5);
}
