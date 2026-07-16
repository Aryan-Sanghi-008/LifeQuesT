import type { Asset } from '../types';
import { scaleCountryAmount } from './countryScaleEngine';
import { getVehicleById, type VehicleDef } from '../data/vehicles';
import { getInvestmentById, type InvestmentDef } from '../data/investments';
import { getCollectibleById } from '../data/collectibles';
import { getInstrumentById } from '../data/marketInstruments';
import { MAX_LTV } from './financingEngine';

export function scaleVehiclePrice(def: VehicleDef, countryCode: string): number {
  return scaleCountryAmount(def.baseValueUsd, countryCode, 'cost');
}

export function scaleInvestmentSuggestedBuy(def: InvestmentDef, countryCode: string): number {
  return scaleCountryAmount(def.suggestedBuyUsd, countryCode, 'cost');
}

/** @deprecated Use scaleInvestmentSuggestedBuy */
export const scaleInvestmentMinBuy = scaleInvestmentSuggestedBuy;

export function createVehicleAsset(
  vehicleId: string,
  _age: number,
  countryCode: string,
): Omit<Asset, 'id' | 'purchasedAge'> | null {
  const def = getVehicleById(vehicleId);
  if (!def) return null;
  const value = scaleVehiclePrice(def, countryCode);
  const loanPct = Math.min(def.loanPct, MAX_LTV);
  const debt = Math.round(value * loanPct);
  return {
    type: 'vehicle',
    name: def.name,
    value,
    debt: debt > 0 ? debt : undefined,
    catalogId: vehicleId,
  };
}

export function createCollectibleAsset(
  collectibleId: string,
  countryCode: string,
): Omit<Asset, 'id' | 'purchasedAge'> | null {
  const def = getCollectibleById(collectibleId);
  if (!def) return null;
  const value = scaleCountryAmount(def.baseValueUsd, countryCode, 'cost');
  return {
    type: 'collectible',
    name: def.name,
    value,
    catalogId: collectibleId,
    costBasis: value,
    priceHistory: [],
  };
}

export function createMutualFundAsset(
  investmentId: string,
  _age: number,
  countryCode: string,
  amount?: number,
): Omit<Asset, 'id' | 'purchasedAge'> | null {
  const instrument = getInstrumentById(investmentId);
  const def = getInvestmentById(investmentId);
  if (!instrument && (!def || def.kind !== 'mutual_fund')) return null;
  const value =
    amount ??
    scaleCountryAmount(
      instrument?.suggestedBuyUsd ?? def!.suggestedBuyUsd,
      countryCode,
      'cost',
    );
  if (value <= 0) return null;
  return {
    type: 'investment',
    name: instrument?.name ?? def!.name,
    value,
    catalogId: investmentId,
    costBasis: value,
    instrumentKind: instrument?.kind ?? 'mutual_fund',
    priceHistory: [],
  };
}

export function tickVehicleYear(asset: Asset): Asset {
  const def = asset.catalogId ? getVehicleById(asset.catalogId) : undefined;
  const depreciation = def?.depreciationPct ?? 0.1;
  const nextValue = Math.max(0, Math.round(asset.value * (1 - depreciation)));
  let debt = asset.debt ?? 0;
  if (debt > 0) {
    const principalPay = Math.round(debt * 0.08);
    debt = Math.max(0, debt - principalPay);
  }
  return {
    ...asset,
    value: nextValue,
    debt: debt > 0 ? debt : undefined,
  };
}

export function tickCollectibleYear(asset: Asset, age: number): Asset {
  const def = asset.catalogId ? getCollectibleById(asset.catalogId) : undefined;
  const appr = def?.appreciationPct ?? 0.02;
  const vol = def?.volatility ?? 0.1;
  const shock = appr + (Math.random() - 0.5) * vol;
  const value = Math.max(0, Math.round(asset.value * (1 + shock)));
  return {
    ...asset,
    value,
    priceHistory: [...(asset.priceHistory ?? []), { age, value }].slice(-20),
  };
}

export function tickCatalogInvestment(
  asset: Asset,
  returnBonus = 0,
): Asset {
  const instrument = asset.catalogId ? getInstrumentById(asset.catalogId) : undefined;
  const def = asset.catalogId ? getInvestmentById(asset.catalogId) : undefined;
  const baseReturn = instrument?.annualReturnBase ?? def?.annualReturnBase ?? 0.07;
  const volatility = instrument?.volatility ?? def?.volatility ?? 0.12;
  const marketReturn = baseReturn + returnBonus + (Math.random() - 0.5) * volatility;
  const value = Math.max(0, Math.round(asset.value * (1 + marketReturn)));
  return {
    ...asset,
    value,
    priceHistory: [...(asset.priceHistory ?? []), { age: 0, value }].slice(-20),
  };
}

export function getVehicleHappinessBonus(assets: Asset[]): number {
  return assets
    .filter((a) => a.type === 'vehicle' && a.catalogId)
    .reduce((sum, a) => {
      const def = getVehicleById(a.catalogId!);
      return sum + (def?.happinessBonus ?? 0);
    }, 0);
}
