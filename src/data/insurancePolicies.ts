import type { InsuranceLine, InsurancePolicy } from '../types';
import { scaleCountryAmount } from '../engine/countryScaleEngine';

export interface InsuranceProductDef {
  id: string;
  line: InsuranceLine;
  name: string;
  /** USD annual premium anchor */
  premiumUsd: number;
  coveragePct: number;
  description: string;
}

export const INSURANCE_PRODUCTS: InsuranceProductDef[] = [
  {
    id: 'ins_health_basic',
    line: 'health',
    name: 'Health Cover Basic',
    premiumUsd: 2400,
    coveragePct: 0.5,
    description: 'Cuts medical event costs in half.',
  },
  {
    id: 'ins_health_plus',
    line: 'health',
    name: 'Health Cover Plus',
    premiumUsd: 4800,
    coveragePct: 0.75,
    description: 'Stronger medical coverage.',
  },
  {
    id: 'ins_auto',
    line: 'auto',
    name: 'Auto Insurance',
    premiumUsd: 1800,
    coveragePct: 0.6,
    description: 'Covers vehicle damage events.',
  },
  {
    id: 'ins_home',
    line: 'home',
    name: 'Home Insurance',
    premiumUsd: 2200,
    coveragePct: 0.7,
    description: 'Reduces property disaster losses.',
  },
  {
    id: 'ins_life',
    line: 'life',
    name: 'Life Cover',
    premiumUsd: 1600,
    coveragePct: 0.4,
    description: 'Family payout buffer on fatal events.',
  },
];

export const INSURANCE_MAP = Object.fromEntries(
  INSURANCE_PRODUCTS.map((p) => [p.id, p]),
);

export function getInsuranceProduct(id: string): InsuranceProductDef | undefined {
  return INSURANCE_MAP[id];
}

export function scalePremium(premiumUsd: number, countryCode: string): number {
  return scaleCountryAmount(premiumUsd, countryCode, 'cost');
}

export function createPolicy(
  product: InsuranceProductDef,
  age: number,
  countryCode: string,
): InsurancePolicy {
  return {
    id: `pol_${product.id}_${Date.now()}`,
    line: product.line,
    annualPremium: scalePremium(product.premiumUsd, countryCode),
    coveragePct: product.coveragePct,
    purchasedAge: age,
  };
}

export function totalAnnualPremiums(policies: InsurancePolicy[] | undefined): number {
  return (policies ?? []).reduce((s, p) => s + p.annualPremium, 0);
}

/** Reduce a loss amount if a matching policy exists. */
export function applyInsuranceCoverage(
  policies: InsurancePolicy[] | undefined,
  line: InsuranceLine,
  lossAmount: number,
): { coveredLoss: number; payout: number } {
  const policy = (policies ?? []).find((p) => p.line === line);
  if (!policy || lossAmount <= 0) return { coveredLoss: lossAmount, payout: 0 };
  const payout = Math.round(lossAmount * policy.coveragePct);
  return { coveredLoss: Math.max(0, lossAmount - payout), payout };
}
