import type { InsuranceLine, InsurancePolicy } from '../types';
import { scaleCountryAmount } from '../engine/countryScaleEngine';
import { buildInsurancePerks } from './assetPerks';

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
    description: 'Essential medical coverage for hospital and illness events.',
  },
  {
    id: 'ins_health_plus',
    line: 'health',
    name: 'Health Cover Plus',
    premiumUsd: 4800,
    coveragePct: 0.75,
    description: 'Stronger medical coverage with preventive-care perks while equipped.',
  },
  {
    id: 'ins_health_elite',
    line: 'health',
    name: 'Health Cover Elite',
    premiumUsd: 9600,
    coveragePct: 0.9,
    description: 'Top-tier medical shield for catastrophic health events.',
  },
  {
    id: 'ins_auto',
    line: 'auto',
    name: 'Auto Insurance',
    premiumUsd: 1800,
    coveragePct: 0.6,
    description: 'Covers vehicle crash and travel accident losses while equipped.',
  },
  {
    id: 'ins_auto_plus',
    line: 'auto',
    name: 'Auto Plus',
    premiumUsd: 3600,
    coveragePct: 0.8,
    description: 'Higher auto coverage for serious collisions.',
  },
  {
    id: 'ins_home',
    line: 'home',
    name: 'Home Insurance',
    premiumUsd: 2200,
    coveragePct: 0.7,
    description: 'Reduces property disaster losses while equipped.',
  },
  {
    id: 'ins_home_plus',
    line: 'home',
    name: 'Home Shield Plus',
    premiumUsd: 4500,
    coveragePct: 0.85,
    description: 'Premium home coverage for major disasters.',
  },
  {
    id: 'ins_life',
    line: 'life',
    name: 'Life Cover',
    premiumUsd: 1600,
    coveragePct: 0.4,
    description: 'Estate buffer paid to heirs on death while equipped.',
  },
  {
    id: 'ins_life_plus',
    line: 'life',
    name: 'Life Cover Plus',
    premiumUsd: 4200,
    coveragePct: 0.65,
    description: 'Larger heir settlement on fatal events.',
  },
];

export const INSURANCE_MAP = Object.fromEntries(
  INSURANCE_PRODUCTS.map((p) => [p.id, p]),
);

export function getInsuranceProduct(id: string): InsuranceProductDef | undefined {
  return INSURANCE_MAP[id];
}

export function getInsurancePerks(productId: string) {
  const p = getInsuranceProduct(productId);
  if (!p) return [];
  return buildInsurancePerks(p.premiumUsd, p.coveragePct, p.line);
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
    id: `pol_${product.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    line: product.line,
    annualPremium: scalePremium(product.premiumUsd, countryCode),
    coveragePct: product.coveragePct,
    purchasedAge: age,
    productId: product.id,
    equipped: true,
  };
}

/** Only equipped policies charge premiums. */
export function totalAnnualPremiums(policies: InsurancePolicy[] | undefined): number {
  return (policies ?? [])
    .filter((p) => p.equipped !== false)
    .reduce((s, p) => s + p.annualPremium, 0);
}

/**
 * Stack equipped policies on the same line — use best coveragePct among equipped.
 */
export function applyInsuranceCoverage(
  policies: InsurancePolicy[] | undefined,
  line: InsuranceLine,
  lossAmount: number,
): { coveredLoss: number; payout: number } {
  const active = (policies ?? []).filter((p) => p.line === line && p.equipped !== false);
  if (!active.length || lossAmount <= 0) return { coveredLoss: lossAmount, payout: 0 };
  const coveragePct = Math.min(0.95, Math.max(...active.map((p) => p.coveragePct)));
  const payout = Math.round(lossAmount * coveragePct);
  return { coveredLoss: Math.max(0, lossAmount - payout), payout };
}

/** Life insurance estate bump: sum of coveragePct * a base estate buffer. */
export function lifeInsuranceEstatePayout(
  policies: InsurancePolicy[] | undefined,
  peakNetWorth: number,
): number {
  const active = (policies ?? []).filter((p) => p.line === 'life' && p.equipped !== false);
  if (!active.length) return 0;
  const pct = Math.min(0.9, active.reduce((s, p) => s + p.coveragePct * 0.5, 0));
  return Math.round(Math.max(10_000, peakNetWorth * 0.05) * pct);
}
