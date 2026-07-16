/**
 * Resolve holistic perk lists for catalog / owned items shown in AssetDetailSheet.
 */
import type { Asset, Business, InsurancePolicy } from '../types';
import {
  buildBusinessPerks,
  buildCollectiblePerks,
  buildInstrumentPerks,
  buildInsurancePerks,
  buildPropertyPerks,
  buildVehiclePerks,
  tierFromUsdPrice,
  tierLabel,
  type AssetPerk,
  type AssetPerkTier,
} from './assetPerks';
import { PROPERTY_MAP } from './properties';
import { getInstrumentById } from './marketInstruments';
import { getCollectibleById } from './collectibles';
import { getVehicleById } from './vehicles';
import { getInsuranceProduct } from './insurancePolicies';

export type AssetDetailKind =
  | 'vehicle'
  | 'collectible'
  | 'insurance'
  | 'property'
  | 'instrument'
  | 'business'
  | 'other';

export interface AssetDetailModel {
  kind: AssetDetailKind;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceLabel: string;
  priceValue: number;
  tier: AssetPerkTier;
  tierLabel: string;
  perks: AssetPerk[];
  ownedAssetId?: string;
  ownedPolicyId?: string;
  ownedBusinessId?: string;
  equipped?: boolean;
  canEquip: boolean;
  canSell: boolean;
  canBuy: boolean;
  extraLines: string[];
}

export function detailFromVehicleCatalog(vehicleId: string, priceLocal: number): AssetDetailModel | null {
  const v = getVehicleById(vehicleId);
  if (!v) return null;
  const perks = buildVehiclePerks(v.baseValueUsd, v.happinessBonus);
  const tier = tierFromUsdPrice(v.baseValueUsd);
  return {
    kind: 'vehicle',
    id: v.id,
    title: v.name,
    subtitle: 'Vehicle',
    description: `${v.name} — ${(v.depreciationPct * 100).toFixed(0)}% annual depreciation. Loan up to 50%.`,
    priceLabel: 'Purchase price',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Depreciation: ${(v.depreciationPct * 100).toFixed(0)}%/yr`,
      `Base happiness (catalog): +${v.happinessBonus}`,
    ],
  };
}

export function detailFromCollectibleCatalog(id: string, priceLocal: number): AssetDetailModel | null {
  const c = getCollectibleById(id);
  if (!c) return null;
  const perks = buildCollectiblePerks(c.baseValueUsd, c.happinessBonus, c.category);
  const tier = tierFromUsdPrice(c.baseValueUsd);
  return {
    kind: 'collectible',
    id: c.id,
    title: c.name,
    subtitle: `Collectible · ${c.category}`,
    description: c.description,
    priceLabel: 'Purchase price',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Appreciation ~${(c.appreciationPct * 100).toFixed(1)}%/yr`,
      `Volatility ${(c.volatility * 100).toFixed(0)}%`,
    ],
  };
}

export function detailFromInsuranceCatalog(productId: string, premiumLocal: number): AssetDetailModel | null {
  const p = getInsuranceProduct(productId);
  if (!p) return null;
  const perks = buildInsurancePerks(p.premiumUsd, p.coveragePct, p.line);
  const tier = tierFromUsdPrice(p.premiumUsd * 8);
  return {
    kind: 'insurance',
    id: p.id,
    title: p.name,
    subtitle: `Insurance · ${p.line}`,
    description: p.description,
    priceLabel: 'Annual premium',
    priceValue: premiumLocal,
    tier,
    tierLabel: tierLabel(tier),
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Coverage: ${Math.round(p.coveragePct * 100)}% of matching losses`,
      'Unequipped policies pause premiums and coverage',
      'Multiple policies per line allowed — equip the ones you want active',
    ],
  };
}

export function detailFromOwnedAsset(asset: Asset): AssetDetailModel {
  if (asset.type === 'vehicle') {
    const v = asset.catalogId ? getVehicleById(asset.catalogId) : undefined;
    const perks = buildVehiclePerks(v?.baseValueUsd ?? asset.value, v?.happinessBonus ?? 3);
    const tier = tierFromUsdPrice(v?.baseValueUsd ?? asset.value);
    return {
      kind: 'vehicle',
      id: asset.catalogId ?? asset.id,
      title: asset.name,
      subtitle: 'Owned vehicle',
      description: 'Equip as daily driver to receive annual perks.',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: [
        asset.debt ? `Loan remaining: included in equity calc` : 'Owned free and clear',
        `Purchased at age ${asset.purchasedAge}`,
      ],
    };
  }
  if (asset.type === 'collectible') {
    const c = asset.catalogId ? getCollectibleById(asset.catalogId) : undefined;
    const perks = buildCollectiblePerks(
      c?.baseValueUsd ?? asset.value,
      c?.happinessBonus ?? 2,
      c?.category ?? 'art',
    );
    const tier = tierFromUsdPrice(c?.baseValueUsd ?? asset.value);
    return {
      kind: 'collectible',
      id: asset.catalogId ?? asset.id,
      title: asset.name,
      subtitle: 'Owned collectible',
      description: 'Equip to display and receive annual perks.',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: [`Purchased at age ${asset.purchasedAge}`],
    };
  }
  if (asset.type === 'property') {
    const prop = asset.propertyDefId ? PROPERTY_MAP[asset.propertyDefId] : undefined;
    const perks = buildPropertyPerks(prop?.value ?? asset.value, prop?.tier ?? 'basic');
    const tier = tierFromUsdPrice(prop?.value ?? asset.value);
    return {
      kind: 'property',
      id: asset.propertyDefId ?? asset.id,
      title: asset.name,
      subtitle: `Property · ${prop?.tier ?? 'home'}`,
      description: 'Equip as primary residence for lifestyle perks.',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: [
        asset.occupancy ? `Mode: ${asset.occupancy}` : 'Owner-occupied',
        asset.rentalYieldPct ? `Rent yield ~${(asset.rentalYieldPct * 100).toFixed(1)}%` : '',
      ].filter(Boolean),
    };
  }
  if (asset.type === 'investment' || asset.instrumentKind) {
    const inst = asset.catalogId ? getInstrumentById(asset.catalogId) : undefined;
    const perks = buildInstrumentPerks(
      inst?.kind ?? asset.instrumentKind ?? 'stock',
      inst?.volatility ?? 0.15,
      inst?.annualReturnBase ?? 0.08,
    );
    const tier = tierFromUsdPrice(asset.value);
    return {
      kind: 'instrument',
      id: asset.catalogId ?? asset.id,
      title: asset.name,
      subtitle: `Investment · ${inst?.kind ?? asset.instrumentKind ?? 'holding'}`,
      description: inst?.description ?? 'Market holding — sell anytime.',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      perks,
      ownedAssetId: asset.id,
      equipped: false,
      canEquip: false,
      canSell: true,
      canBuy: false,
      extraLines: [
        asset.costBasis != null ? `Cost basis on record` : '',
        `Purchased at age ${asset.purchasedAge}`,
      ].filter(Boolean),
    };
  }
  const tier = tierFromUsdPrice(asset.value);
  return {
    kind: 'other',
    id: asset.id,
    title: asset.name,
    subtitle: asset.type,
    description: 'Owned asset',
    priceLabel: 'Value',
    priceValue: asset.value,
    tier,
    tierLabel: tierLabel(tier),
    perks: [],
    ownedAssetId: asset.id,
    equipped: !!asset.equipped,
    canEquip: true,
    canSell: true,
    canBuy: false,
    extraLines: [],
  };
}

export function detailFromOwnedPolicy(policy: InsurancePolicy): AssetDetailModel {
  const product = policy.productId ? getInsuranceProduct(policy.productId) : undefined;
  const perks = buildInsurancePerks(
    product?.premiumUsd ?? policy.annualPremium,
    policy.coveragePct,
    policy.line,
  );
  const tier = tierFromUsdPrice((product?.premiumUsd ?? policy.annualPremium) * 8);
  return {
    kind: 'insurance',
    id: policy.productId ?? policy.id,
    title: product?.name ?? `${policy.line} policy`,
    subtitle: `Owned · ${policy.line}`,
    description: product?.description ?? 'Insurance policy',
    priceLabel: 'Annual premium (when equipped)',
    priceValue: policy.annualPremium,
    tier,
    tierLabel: tierLabel(tier),
    perks,
    ownedPolicyId: policy.id,
    equipped: policy.equipped !== false,
    canEquip: true,
    canSell: true,
    canBuy: false,
    extraLines: [
      `Coverage ${Math.round(policy.coveragePct * 100)}%`,
      policy.equipped === false ? 'Currently unequipped — no premium, no coverage' : 'Equipped — premiums charged each Age Up',
    ],
  };
}

export function detailFromBusiness(biz: Business): AssetDetailModel {
  const perks = buildBusinessPerks(biz.valuation);
  const tier = tierFromUsdPrice(biz.valuation);
  return {
    kind: 'business',
    id: biz.id,
    title: biz.name,
    subtitle: biz.franchiseId ? 'Franchise' : 'Business',
    description: 'Feature (equip) this business for founder perks and brand fame.',
    priceLabel: 'Valuation',
    priceValue: biz.valuation,
    tier,
    tierLabel: tierLabel(tier),
    perks,
    ownedBusinessId: biz.id,
    equipped: !!biz.equipped,
    canEquip: true,
    canSell: true,
    canBuy: false,
    extraLines: [
      `Revenue ${biz.revenue} / Expenses ${biz.expenses}`,
      `${biz.employees.length} employees · payroll ${biz.payrollMonthly}/mo`,
    ],
  };
}
