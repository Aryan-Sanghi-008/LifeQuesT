import type { Asset, Character, PropertyDef } from '../types';
import { PROPERTY_MAP } from '../data/properties';
import { clamp } from './economyEngine';

export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const months = termYears * 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
    / (Math.pow(1 + monthlyRate, months) - 1);
}

export function createPropertyAsset(
  def: PropertyDef,
  age: number,
  downPaymentPctOverride?: number,
): { asset: Asset; downPayment: number } {
  const downPct = downPaymentPctOverride ?? def.downPaymentPct;
  const downPayment = Math.round(def.value * downPct);
  const mortgage = def.value - downPayment;

  return {
    downPayment,
    asset: {
      id: `asset_${def.id}_${Date.now()}`,
      type: 'property',
      name: def.name,
      value: def.value,
      debt: mortgage,
      purchasedAge: age,
      propertyDefId: def.id,
      mortgageRate: def.mortgageRate,
      mortgageTermYears: def.termYears,
    },
  };
}

export function tickPropertyYear(asset: Asset): Asset {
  const def = asset.propertyDefId ? PROPERTY_MAP[asset.propertyDefId] : undefined;
  const appreciation = def?.appreciationPct ?? 0.02;
  const maintenance = def?.maintenancePct ?? 0.01;

  let value = Math.round(asset.value * (1 + appreciation));
  let debt = asset.debt ?? 0;

  if (debt > 0 && asset.mortgageRate && asset.mortgageTermYears) {
    const annualPayment = calculateMortgagePayment(debt, asset.mortgageRate, asset.mortgageTermYears) * 12;
    const interest = debt * asset.mortgageRate;
    const principalPaid = Math.max(0, annualPayment - interest);
    debt = Math.max(0, Math.round(debt - principalPaid));
  }

  value = Math.max(0, Math.round(value * (1 - maintenance * 0.5)));

  return { ...asset, value, debt: debt > 0 ? debt : undefined };
}

export function tickAllProperties(assets: Asset[]): Asset[] {
  return assets.map(a => (a.type === 'property' ? tickPropertyYear(a) : a));
}

export function getAnnualMortgagePayments(assets: Asset[]): number {
  return assets
    .filter(a => a.type === 'property' && (a.debt ?? 0) > 0)
    .reduce((sum, a) => {
      const rate = a.mortgageRate ?? 0.06;
      const term = a.mortgageTermYears ?? 25;
      return sum + calculateMortgagePayment(a.debt ?? 0, rate, term) * 12;
    }, 0);
}

export function getPropertyMaintenanceCost(assets: Asset[]): number {
  return assets
    .filter(a => a.type === 'property')
    .reduce((sum, a) => {
      const def = a.propertyDefId ? PROPERTY_MAP[a.propertyDefId] : undefined;
      const pct = def?.maintenancePct ?? 0.01;
      return sum + Math.round(a.value * pct);
    }, 0);
}

export function applyPropertyHappinessBonus(character: Character): number {
  const bonus = character.assets
    .filter(a => a.type === 'property' && a.propertyDefId)
    .reduce((sum, a) => {
      const def = PROPERTY_MAP[a.propertyDefId!];
      return sum + (def?.happinessBonus ?? 0);
    }, 0);
  return clamp(character.stats.happiness + bonus);
}

export function rollPropertyDisaster(asset: Asset): Asset | null {
  if (asset.type !== 'property') return null;
  if (Math.random() > 0.03) return null;
  const loss = Math.round(asset.value * (0.05 + Math.random() * 0.15));
  return { ...asset, value: Math.max(0, asset.value - loss) };
}
