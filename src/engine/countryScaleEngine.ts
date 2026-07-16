import { getCountryEconomy, getAnnualCostOfLiving } from '../data/countryEconomy';
import { COUNTRY_PROFILES } from '../data/countryEconomy/profiles';

export type CountryScaleCategory =
  | 'salary'
  | 'cost'
  | 'fine'
  | 'gift'
  | 'property'
  | 'education'
  | 'activity';

const CATEGORY_KEY: Record<CountryScaleCategory, keyof ReturnType<typeof getCountryEconomy> | 'crimeSeverityMod'> = {
  salary: 'salaryMultiplier',
  cost: 'costOfLivingIndex',
  fine: 'crimeSeverityMod',
  gift: 'costOfLivingIndex',
  property: 'costOfLivingIndex',
  education: 'costOfLivingIndex',
  activity: 'costOfLivingIndex',
};

function getCurrencyScale(countryCode: string): number {
  return COUNTRY_PROFILES.find((p) => p.code === countryCode)?.currencyScale ?? 1;
}

/**
 * Scale a USD-anchored game amount to local currency for a birthplace.
 */
export function scaleCountryAmount(
  baseUsdAnchor: number,
  countryCode: string,
  category: CountryScaleCategory = 'cost',
): number {
  if (baseUsdAnchor === 0) return 0;
  const eco = getCountryEconomy(countryCode);
  const cs = getCurrencyScale(countryCode);
  const sign = baseUsdAnchor < 0 ? -1 : 1;
  const abs = Math.abs(baseUsdAnchor);

  if (category === 'salary') {
    const boost = eco.playabilityBoost?.salaryBonus ?? 0;
    return sign * Math.round(abs * cs * eco.salaryMultiplier * (1 + boost));
  }
  if (category === 'fine') {
    const boost = eco.playabilityBoost?.costDiscount ?? 0;
    return sign * Math.round(abs * cs * eco.costOfLivingIndex * eco.crimeSeverityMod * (1 - boost));
  }
  const modKey = CATEGORY_KEY[category];
  const mod = modKey === 'crimeSeverityMod'
    ? eco.crimeSeverityMod
    : (eco[modKey as keyof typeof eco] as number);
  const costDiscount = eco.playabilityBoost?.costDiscount ?? 0;
  return sign * Math.round(abs * cs * Math.max(0.15, mod) * (1 - costDiscount));
}

export function scaleInteractionCost(usdAmount: number, countryCode: string): number {
  return scaleCountryAmount(usdAmount, countryCode, 'gift');
}

export function scaleFineAmount(usdAmount: number, countryCode: string): number {
  return scaleCountryAmount(usdAmount, countryCode, 'fine');
}

export function scalePropertyValue(baseValue: number, countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  const usHouse = 380_000;
  return Math.round(baseValue * (eco.costs.houseBase / usHouse));
}

export function scaleEducationCost(baseUsd: number, countryCode: string): number {
  return scaleCountryAmount(baseUsd, countryCode, 'education');
}

export function scaleActivityCost(baseUsd: number, countryCode: string, age?: number): number {
  const cs = getCurrencyScale(countryCode);
  if (cs > 5) {
    return scaleEventBankEffect(baseUsd, countryCode, 'cost', undefined, age);
  }
  return Math.round(scaleCountryAmount(baseUsd, countryCode, 'activity') * getEventBankAgeFactor(age));
}

export type EventBankEffectHint = 'fine' | 'gift' | 'salary' | 'cost';

/** Soften random life-event money hits for minors (parents usually cover costs). */
export function getEventBankAgeFactor(age?: number): number {
  if (age === undefined) return 1;
  if (age < 13) return 0.05;
  if (age < 16) return 0.12;
  if (age < 18) return 0.25;
  return 1;
}

/**
 * For high FX countries (e.g. IN ₹83), raw USD×currencyScale turns modest events
 * into million-scale debts while starting balances are already hand-tuned in local currency.
 * Scale those event hits by local/US annual cost-of-living instead of raw FX.
 */
function scaleEventAmountByEconomy(
  amountUsd: number,
  countryCode: string,
  category: CountryScaleCategory,
): number {
  const cs = getCurrencyScale(countryCode);
  if (cs <= 5) {
    return scaleCountryAmount(amountUsd, countryCode, category);
  }

  const eco = getCountryEconomy(countryCode);
  const localCol = Math.max(1, getAnnualCostOfLiving(countryCode));
  const usCol = Math.max(1, getAnnualCostOfLiving('US'));
  const colRatio = localCol / usCol;
  const costDiscount = eco.playabilityBoost?.costDiscount ?? 0;
  const sign = amountUsd < 0 ? -1 : 1;
  const abs = Math.abs(amountUsd);
  let scaled = abs * colRatio * (1 - costDiscount);
  if (category === 'fine') {
    scaled *= eco.crimeSeverityMod;
  } else if (category === 'salary') {
    scaled = abs * cs * eco.salaryMultiplier * (1 + (eco.playabilityBoost?.salaryBonus ?? 0));
  }
  return sign * Math.round(scaled);
}

/**
 * Scale event bankEffect amounts (USD anchors in gameData / events/*.ts).
 * Pass age to soften teen costs.
 */
export function scaleEventBankEffect(
  amount: number,
  countryCode: string,
  hint: EventBankEffectHint = 'cost',
  eventCategory?: string,
  age?: number,
): number {
  if (amount === 0) return 0;
  const category: CountryScaleCategory = hint !== 'cost'
    ? hint
    : eventCategory === 'crime'
      ? 'fine'
      : amount > 0
        ? 'gift'
        : 'cost';

  let scaled = scaleEventAmountByEconomy(amount, countryCode, category);
  const ageFactor = getEventBankAgeFactor(age);
  scaled = Math.round(scaled * ageFactor);

  // Hard-cap how much personal debt a single life event can force under 18.
  if (amount < 0 && age !== undefined && age < 18) {
    const middleStart = getCountryEconomy(countryCode).startingBalance.middle;
    const cap = Math.max(Math.round(middleStart * 0.2), 1_000);
    scaled = -Math.min(Math.abs(scaled), cap);
  }

  return scaled;
}

/** USD-anchored lawyer tier costs for court. */
export function scaleLawyerCost(baseUsd: number, countryCode: string): number {
  return scaleCountryAmount(baseUsd, countryCode, 'cost');
}

export interface PlayabilityMetrics {
  engineerSalary: number;
  stockMin: number;
  minInvestment: number;
  hatchbackPrice: number;
  monthsToStock: number;
}

const ENGINEER_SALARY_USD = 95_000;
const STOCK_SUGGESTED_USD = 10_000;
const MIN_INVESTMENT_USD = 1;
const HATCHBACK_USD = 18_000;

/** Gameplay affordability snapshot for a birthplace (engineer vs suggested stock buy). */
export function getPlayabilityMetrics(countryCode: string): PlayabilityMetrics {
  const engineerSalary = scaleCountryAmount(ENGINEER_SALARY_USD, countryCode, 'salary');
  const stockMin = scaleCountryAmount(STOCK_SUGGESTED_USD, countryCode, 'cost');
  const minInvestment = Math.max(1, scaleCountryAmount(MIN_INVESTMENT_USD, countryCode, 'cost'));
  const hatchbackPrice = scaleCountryAmount(HATCHBACK_USD, countryCode, 'cost');
  const monthsToStock = engineerSalary > 0
    ? stockMin / (engineerSalary / 12)
    : 999;
  return { engineerSalary, stockMin, minInvestment, hatchbackPrice, monthsToStock };
}
