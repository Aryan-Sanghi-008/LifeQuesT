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
import { PROPERTY_MAP, getPropertyCatalogEntry, getPropertyPerks } from './properties';
import { getInstrumentById } from './marketInstruments';
import { getCollectibleById } from './collectibles';
import { getVehicleById } from './vehicles';
import { getInsuranceProduct } from './insurancePolicies';
import { getFranchiseById } from './franchises';

/** Mirror of equippedPerksEngine.stackWeight — keep data layer free of engine imports. */
function stackWeight(slotIndex1Based: number): number {
  return Math.max(0.1, 1 - (slotIndex1Based - 1) * 0.1);
}

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
  roleTag?: string;
  perks: AssetPerk[];
  ownedAssetId?: string;
  ownedPolicyId?: string;
  ownedBusinessId?: string;
  equipped?: boolean;
  equippedOrder?: number;
  canEquip: boolean;
  canSell: boolean;
  canBuy: boolean;
  extraLines: string[];
  /** e.g. "If equipped as 2nd item, perks at 90%" */
  stackingHint?: string;
}

function roleSubtitle(base: string, roleTag?: string): string {
  if (!roleTag) return base;
  return `${base} · ${roleTag}`;
}

export function detailFromVehicleCatalog(vehicleId: string, priceLocal: number): AssetDetailModel | null {
  const v = getVehicleById(vehicleId);
  if (!v) return null;
  const perks = v.perks?.length ? v.perks : buildVehiclePerks(v.baseValueUsd, v.happinessBonus);
  const tier = tierFromUsdPrice(v.baseValueUsd);
  return {
    kind: 'vehicle',
    id: v.id,
    title: v.name,
    subtitle: roleSubtitle('Vehicle', v.roleTag),
    description: v.description,
    priceLabel: 'Purchase price',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    roleTag: v.roleTag,
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Depreciation: ${(v.depreciationPct * 100).toFixed(0)}%/yr`,
      `Role: ${v.roleTag}`,
    ],
    stackingHint: `If equipped 1st → 100% perks; 2nd → 90%; 3rd → 80%…`,
  };
}

export function detailFromCollectibleCatalog(id: string, priceLocal: number): AssetDetailModel | null {
  const c = getCollectibleById(id);
  if (!c) return null;
  const perks = c.perks?.length
    ? c.perks
    : buildCollectiblePerks(c.baseValueUsd, c.happinessBonus, c.category);
  const tier = tierFromUsdPrice(c.baseValueUsd);
  return {
    kind: 'collectible',
    id: c.id,
    title: c.name,
    subtitle: roleSubtitle(`Collectible · ${c.category}`, c.roleTag),
    description: c.description,
    priceLabel: 'Purchase price',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    roleTag: c.roleTag,
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Appreciation ~${(c.appreciationPct * 100).toFixed(1)}%/yr`,
      `Volatility ${(c.volatility * 100).toFixed(0)}%`,
      `Role: ${c.roleTag}`,
    ],
    stackingHint: `If equipped 1st → 100% perks; 2nd → 90%; 3rd → 80%…`,
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
    extraLines: [`Coverage ~${Math.round(p.coveragePct * 100)}% of matching losses`],
  };
}

export function detailFromOwnedAsset(asset: Asset): AssetDetailModel {
  if (asset.type === 'vehicle') {
    const v = asset.catalogId ? getVehicleById(asset.catalogId) : undefined;
    const perks = v?.perks?.length
      ? v.perks
      : buildVehiclePerks(v?.baseValueUsd ?? asset.value, v?.happinessBonus ?? 3);
    const tier = tierFromUsdPrice(v?.baseValueUsd ?? asset.value);
    const order = asset.equippedOrder;
    return {
      kind: 'vehicle',
      id: asset.id,
      title: asset.name,
      subtitle: roleSubtitle('Owned vehicle', v?.roleTag),
      description: v?.description ?? 'Owned vehicle',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      roleTag: v?.roleTag,
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      equippedOrder: order,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: v ? [`Depreciation ~${(v.depreciationPct * 100).toFixed(0)}%/yr`] : [],
      stackingHint: asset.equipped && order
        ? `Equipped slot #${order} → ${(stackWeight(order) * 100).toFixed(0)}% perk strength`
        : `If equipped 1st → 100%; 2nd → 90%…`,
    };
  }

  if (asset.type === 'collectible') {
    const c = asset.catalogId ? getCollectibleById(asset.catalogId) : undefined;
    const perks = c?.perks?.length
      ? c.perks
      : buildCollectiblePerks(c?.baseValueUsd ?? asset.value, c?.happinessBonus ?? 3, c?.category ?? 'art');
    const tier = tierFromUsdPrice(c?.baseValueUsd ?? asset.value);
    return {
      kind: 'collectible',
      id: asset.id,
      title: asset.name,
      subtitle: roleSubtitle('Owned collectible', c?.roleTag),
      description: c?.description ?? 'Owned collectible',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      roleTag: c?.roleTag,
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      equippedOrder: asset.equippedOrder,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: [],
      stackingHint: `If equipped 1st → 100%; 2nd → 90%…`,
    };
  }

  if (asset.type === 'property') {
    const entry = asset.propertyDefId
      ? getPropertyCatalogEntry(asset.propertyDefId)
      : undefined;
    const prop = asset.propertyDefId ? PROPERTY_MAP[asset.propertyDefId] : undefined;
    const perks = entry?.perks?.length
      ? entry.perks
      : asset.propertyDefId
        ? getPropertyPerks(asset.propertyDefId)
        : buildPropertyPerks(asset.value, prop?.tier ?? 'basic');
    const tier = tierFromUsdPrice(prop?.value ?? asset.value);
    return {
      kind: 'property',
      id: asset.id,
      title: asset.name,
      subtitle: roleSubtitle(`Property · ${prop?.tier ?? 'home'}`, entry?.roleTag),
      description: entry?.description ?? 'Owned property',
      priceLabel: 'Current value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      roleTag: entry?.roleTag,
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      equippedOrder: asset.equippedOrder,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: [
        `Occupancy: ${asset.occupancy ?? 'primary'}`,
        prop?.rentalYieldPct != null
          ? `Rent yield ~${(prop.rentalYieldPct * 100).toFixed(1)}%`
          : '',
      ].filter(Boolean),
      stackingHint: `If equipped 1st → 100%; 2nd → 90%…`,
    };
  }

  if (asset.type === 'investment') {
    const inst = asset.catalogId ? getInstrumentById(asset.catalogId) : undefined;
    const perks = inst?.holdingPerks?.length
      ? inst.holdingPerks
      : inst
        ? buildInstrumentPerks(inst.kind, inst.volatility, inst.annualReturnBase)
        : [];
    const tier = tierFromUsdPrice(inst?.suggestedBuyUsd ?? asset.value);
    return {
      kind: 'instrument',
      id: asset.id,
      title: asset.name,
      subtitle: roleSubtitle(inst?.kind ?? 'Investment', inst?.roleTag),
      description: inst?.description ?? 'Investment holding',
      priceLabel: 'Position value',
      priceValue: asset.value,
      tier,
      tierLabel: tierLabel(tier),
      roleTag: inst?.roleTag,
      perks,
      ownedAssetId: asset.id,
      equipped: !!asset.equipped,
      canEquip: true,
      canSell: true,
      canBuy: false,
      extraLines: inst
        ? [
            `Target ~${(inst.annualReturnBase * 100).toFixed(0)}% · vol ${(inst.volatility * 100).toFixed(0)}%`,
          ]
        : [],
    };
  }

  return {
    kind: 'other',
    id: asset.id,
    title: asset.name,
    subtitle: asset.type,
    description: '',
    priceLabel: 'Value',
    priceValue: asset.value,
    tier: 'budget',
    tierLabel: 'Budget',
    perks: [],
    ownedAssetId: asset.id,
    equipped: !!asset.equipped,
    canEquip: false,
    canSell: true,
    canBuy: false,
    extraLines: [],
  };
}

export function detailFromOwnedPolicy(policy: InsurancePolicy): AssetDetailModel {
  const product = policy.productId ? getInsuranceProduct(policy.productId) : undefined;
  const premiumUsd = product?.premiumUsd ?? 2400;
  const perks = buildInsurancePerks(premiumUsd, policy.coveragePct, policy.line);
  const tier = tierFromUsdPrice(premiumUsd * 8);
  return {
    kind: 'insurance',
    id: policy.id,
    title: product?.name ?? `${policy.line} policy`,
    subtitle: `Insurance · ${policy.line}`,
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
      policy.equipped === false
        ? 'Currently unequipped — no premium, no coverage'
        : 'Equipped — premiums charged each Age Up',
    ],
  };
}

export function detailFromBusiness(biz: Business): AssetDetailModel {
  const fran = biz.franchiseId ? getFranchiseById(biz.franchiseId) : undefined;
  const perks = fran?.industryPerks?.length
    ? fran.industryPerks
    : buildBusinessPerks(biz.valuation);
  const tier = tierFromUsdPrice(biz.valuation);
  return {
    kind: 'business',
    id: biz.id,
    title: biz.name,
    subtitle: roleSubtitle(biz.franchiseId ? 'Franchise' : 'Business', fran?.roleTag),
    description: fran?.description ?? 'Your business',
    priceLabel: 'Valuation',
    priceValue: biz.valuation,
    tier,
    tierLabel: tierLabel(tier),
    roleTag: fran?.roleTag,
    perks,
    ownedBusinessId: biz.id,
    equipped: !!biz.equipped,
    canEquip: true,
    canSell: false,
    canBuy: false,
    extraLines: [
      `Revenue ${biz.revenue} · risk ${((fran?.risk ?? biz.risk ?? 0.2) * 100).toFixed(0)}%`,
      fran ? `Industry: ${fran.industry}` : '',
    ].filter(Boolean),
    stackingHint: `Featured business perks stack with equipped assets (100/90/80%…)`,
  };
}

export function detailFromPropertyCatalog(
  propertyDefId: string,
  priceLocal: number,
): AssetDetailModel | null {
  const entry = getPropertyCatalogEntry(propertyDefId);
  const prop = PROPERTY_MAP[propertyDefId];
  if (!prop) return null;
  const perks = entry?.perks?.length
    ? entry.perks
    : buildPropertyPerks(prop.value, prop.tier);
  const tier = tierFromUsdPrice(prop.value);
  return {
    kind: 'property',
    id: prop.id,
    title: prop.name,
    subtitle: roleSubtitle(`Property · ${prop.tier}`, entry?.roleTag),
    description: entry?.description ?? prop.name,
    priceLabel: 'Purchase price',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    roleTag: entry?.roleTag,
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `Rent yield ~${((prop.rentalYieldPct ?? 0.04) * 100).toFixed(1)}%`,
      `Min age ${prop.minAge}`,
    ],
    stackingHint: `If equipped 1st → 100%; 2nd → 90%…`,
  };
}

export function detailFromInstrumentCatalog(
  instrumentId: string,
  priceLocal: number,
): AssetDetailModel | null {
  const inst = getInstrumentById(instrumentId);
  if (!inst) return null;
  const perks = inst.holdingPerks?.length
    ? inst.holdingPerks
    : buildInstrumentPerks(inst.kind, inst.volatility, inst.annualReturnBase);
  const tier = tierFromUsdPrice(inst.suggestedBuyUsd);
  return {
    kind: 'instrument',
    id: inst.id,
    title: inst.name,
    subtitle: roleSubtitle(inst.kind.replace('_', ' '), inst.roleTag),
    description: inst.description,
    priceLabel: 'Suggested buy',
    priceValue: priceLocal,
    tier,
    tierLabel: tierLabel(tier),
    roleTag: inst.roleTag,
    perks,
    canEquip: false,
    canSell: false,
    canBuy: true,
    extraLines: [
      `~${(inst.annualReturnBase * 100).toFixed(0)}% return · ${(inst.volatility * 100).toFixed(0)}% vol`,
      inst.dividendYield > 0 ? `Div ${(inst.dividendYield * 100).toFixed(1)}%` : '',
    ].filter(Boolean),
  };
}
