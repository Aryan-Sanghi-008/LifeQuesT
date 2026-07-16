import type { CountryEconomyConfig, PlayabilityBoost } from './types';
import { US_ECONOMY_ANCHOR, type CountryProfile } from './profiles';

function round(n: number): number {
  return Math.round(n);
}

/** Auto-tune lower-income countries so investing stays viable. */
export function derivePlayabilityBoost(profile: CountryProfile): PlayabilityBoost | undefined {
  if (profile.playabilityBoost) return profile.playabilityBoost;
  if (profile.salaryMultiplier >= 0.5 && profile.costOfLivingIndex >= 0.5) return undefined;
  const salaryBonus =
    profile.salaryMultiplier < 0.12 ? 0.22
      : profile.salaryMultiplier < 0.20 ? 0.18
        : profile.salaryMultiplier < 0.35 ? 0.12
          : 0.08;
  const costDiscount =
    profile.costOfLivingIndex < 0.30 ? 0.18
      : profile.costOfLivingIndex < 0.45 ? 0.12
        : 0.08;
  return { salaryBonus, costDiscount };
}

/** Build a full economy config from a compact profile + US anchors. */
export function buildCountryConfig(profile: CountryProfile): CountryEconomyConfig {  const { currencyScale: cs, salaryMultiplier: sm, costOfLivingIndex: col } = profile;
  const anchor = US_ECONOMY_ANCHOR;
  const colFactor = Math.max(0.2, col);

  const scaleCost = (usd: number) => round(usd * cs * colFactor);
  const scaleSalary = (usd: number) => round(usd * cs * sm);
  const scaleBalance = (usd: number) => round(usd * cs * colFactor * 0.85);

  return {
    code: profile.code,
    name: profile.name,
    flag: profile.flag,
    currencyCode: profile.currencyCode,
    currencySymbol: profile.currencySymbol,
    currencyLocale: profile.currencyLocale,
    salaryMultiplier: profile.salaryMultiplier,
    costOfLivingIndex: profile.costOfLivingIndex,
    taxRate: profile.taxRate,
    wealthMod: profile.wealthMod,
    lifeExpectancy: profile.lifeExpectancy,
    crimeSeverityMod: profile.crimeSeverityMod,
    startingBalance: {
      poor: scaleBalance(anchor.startingBalance.poor),
      middle: scaleBalance(anchor.startingBalance.middle),
      wealthy: scaleBalance(anchor.startingBalance.wealthy),
      royalty: scaleBalance(anchor.startingBalance.royalty),
    },
    costs: {
      rent: scaleCost(anchor.costs.rent),
      groceries: scaleCost(anchor.costs.groceries),
      healthcare: scaleCost(anchor.costs.healthcare),
      educationPrimary: 0,
      educationUniversity: scaleCost(anchor.costs.educationUniversity),
      carBase: scaleCost(anchor.costs.carBase),
      houseBase: scaleCost(anchor.costs.houseBase),
    },
    salaries: {
      minimumWage: scaleSalary(anchor.salaries.minimumWage),
      teacher: scaleSalary(anchor.salaries.teacher),
      engineer: scaleSalary(anchor.salaries.engineer),
      doctor: scaleSalary(anchor.salaries.doctor),
      lawyer: scaleSalary(anchor.salaries.lawyer),
      pilot: scaleSalary(anchor.salaries.pilot),
      nurse: scaleSalary(anchor.salaries.nurse),
      chef: scaleSalary(anchor.salaries.chef),
      police: scaleSalary(anchor.salaries.police),
      banker: scaleSalary(anchor.salaries.banker),
      entrepreneur: scaleSalary(anchor.salaries.entrepreneur),
    },
    stockMarketVolatility: profile.stockMarketVolatility ?? anchor.stockMarketVolatility,
    inflationRate: profile.inflationRate ?? anchor.inflationRate,
    propertyAppreciation: profile.propertyAppreciation ?? anchor.propertyAppreciation,
    playabilityBoost: derivePlayabilityBoost(profile),
  };
}