import type {
  Asset,
  Character,
  CharacterStats,
} from '../types';
import {
  type AssetPerk,
  applyStatPatch,
  sumAnnualStatEffects,
  buildVehiclePerks,
  buildCollectiblePerks,
  buildPropertyPerks,
  buildInsurancePerks,
  buildBusinessPerks,
  buildInstrumentPerks,
} from '@data/assetPerks';
import { getVehicleById } from '@data/vehicles';
import { getCollectibleById } from '@data/collectibles';
import { getPropertyCatalogEntry, getPropertyPerks } from '@data/properties';
import { getFranchiseById } from '@data/franchises';
import { getInstrumentById } from '@data/marketInstruments';
import { getInsuranceProduct } from '@data/insurancePolicies';
import { PROPERTY_MAP } from '@data/properties';

/** Max equipped luxury-style assets (vehicle/collectible/property) contributing perks. */
export const MAX_EQUIPPED_LUXURY = 5;

export interface EquippedPerkSlot {
  sourceId: string;
  sourceLabel: string;
  kind: 'vehicle' | 'collectible' | 'property' | 'business' | 'insurance' | 'investment';
  equippedOrder: number;
  weight: number;
  perks: AssetPerk[];
  /** Perks after stacking weight applied */
  weightedPerks: AssetPerk[];
}

export interface ResolvedPerkEffects {
  statPatch: Partial<CharacterStats>;
  fameDelta: number;
  careerPerfBonus: number;
  /** Additive income multiplier (0.05 = +5%) */
  incomeBonusPct: number;
  /** Additive expense reduction (0.03 = -3% costs) */
  expenseReducePct: number;
  unlockTags: string[];
  slots: EquippedPerkSlot[];
}

/** weight(slotIndex1Based) = max(0.1, 1 - (n-1)*0.1) */
export function stackWeight(slotIndex1Based: number): number {
  return Math.max(0.1, 1 - (slotIndex1Based - 1) * 0.1);
}

function scalePerk(perk: AssetPerk, weight: number): AssetPerk {
  const scaleNum = (n: number | undefined) =>
    n == null ? undefined : Math.round(n * weight * 100) / 100;
  const scaleStat = (stats: Partial<CharacterStats> | undefined) => {
    if (!stats) return undefined;
    const out: Partial<CharacterStats> = {};
    for (const [k, v] of Object.entries(stats)) {
      if (typeof v !== 'number') continue;
      out[k as keyof CharacterStats] = Math.round(v * weight);
    }
    return out;
  };
  return {
    ...perk,
    annualStatEffect: scaleStat(perk.annualStatEffect),
    incomeBonusPct: perk.incomeBonusPct != null ? perk.incomeBonusPct * weight : undefined,
    expenseReducePct: perk.expenseReducePct != null ? perk.expenseReducePct * weight : undefined,
    fameBonus: scaleNum(perk.fameBonus),
    careerPerformanceBonus:
      perk.careerPerformanceBonus != null ? perk.careerPerformanceBonus * weight : undefined,
    crimeRiskDelta: perk.crimeRiskDelta != null ? perk.crimeRiskDelta * weight : undefined,
    // Unlock tags only apply at full weight (first slot) or any weight > 0.5
    unlockTag: weight >= 0.5 ? perk.unlockTag : undefined,
  };
}

export function getPerksForAsset(asset: Asset): AssetPerk[] {
  if (asset.type === 'vehicle' && asset.catalogId) {
    const def = getVehicleById(asset.catalogId);
    if (def?.perks?.length) return def.perks;
    return buildVehiclePerks(def?.baseValueUsd ?? asset.value, def?.happinessBonus ?? 3);
  }
  if (asset.type === 'collectible' && asset.catalogId) {
    const def = getCollectibleById(asset.catalogId);
    if (def?.perks?.length) return def.perks;
    return buildCollectiblePerks(
      def?.baseValueUsd ?? asset.value,
      def?.happinessBonus ?? 3,
      def?.category ?? 'art',
    );
  }
  if (asset.type === 'property') {
    const defId = asset.propertyDefId;
    if (defId) {
      const authored = getPropertyPerks(defId);
      if (authored.length) return authored;
      const prop = PROPERTY_MAP[defId];
      return buildPropertyPerks(prop?.value ?? asset.value, prop?.tier ?? 'basic');
    }
  }
  if (asset.type === 'investment' && asset.catalogId) {
    const inst = getInstrumentById(asset.catalogId);
    if (inst?.holdingPerks?.length) return inst.holdingPerks;
    if (inst) {
      return buildInstrumentPerks(inst.kind, inst.volatility, inst.annualReturnBase);
    }
  }
  return [];
}

function collectRawSlots(character: Character): Omit<EquippedPerkSlot, 'weight' | 'weightedPerks'>[] {
  const slots: Omit<EquippedPerkSlot, 'weight' | 'weightedPerks'>[] = [];

  for (const asset of character.assets) {
    if (!asset.equipped) continue;
    if (
      asset.type !== 'vehicle' &&
      asset.type !== 'collectible' &&
      asset.type !== 'property' &&
      asset.type !== 'investment'
    ) {
      continue;
    }
    const perks = getPerksForAsset(asset);
    if (perks.length === 0) continue;
    slots.push({
      sourceId: asset.id,
      sourceLabel: asset.name,
      kind: asset.type as EquippedPerkSlot['kind'],
      equippedOrder: asset.equippedOrder ?? Number.MAX_SAFE_INTEGER,
      perks,
    });
  }

  for (const biz of character.businesses ?? []) {
    if (!biz.equipped) continue;
    let perks: AssetPerk[] = [];
    if (biz.franchiseId) {
      const fran = getFranchiseById(biz.franchiseId);
      if (fran?.industryPerks?.length) perks = fran.industryPerks;
    }
    if (perks.length === 0) {
      perks = buildBusinessPerks(biz.valuation);
    }
    slots.push({
      sourceId: biz.id,
      sourceLabel: biz.name,
      kind: 'business',
      equippedOrder: biz.equippedOrder ?? Number.MAX_SAFE_INTEGER - 1,
      perks,
    });
  }

  for (const pol of character.insurancePolicies ?? []) {
    if (pol.equipped === false) continue;
    const product = pol.productId ? getInsuranceProduct(pol.productId) : undefined;
    const premiumUsd = product?.premiumUsd ?? Math.round(pol.annualPremium / 10);
    const perks = buildInsurancePerks(premiumUsd, pol.coveragePct, pol.line);
    slots.push({
      sourceId: pol.id,
      sourceLabel: `${pol.line} insurance`,
      kind: 'insurance',
      equippedOrder: Number.MAX_SAFE_INTEGER - 2,
      perks,
    });
  }

  return slots;
}

/**
 * Collect equipped perks, apply stacking by equippedOrder (then name),
 * and resolve aggregate effects.
 */
export function resolveEquippedPerks(character: Character): ResolvedPerkEffects {
  const raw = collectRawSlots(character);
  raw.sort((a, b) => {
    if (a.equippedOrder !== b.equippedOrder) return a.equippedOrder - b.equippedOrder;
    return a.sourceLabel.localeCompare(b.sourceLabel);
  });

  // Cap luxury vehicles/collectibles/properties; businesses/insurance/investments always included
  const luxuryKinds = new Set(['vehicle', 'collectible', 'property']);
  let luxuryCount = 0;
  const filtered = raw.filter((s) => {
    if (!luxuryKinds.has(s.kind)) return true;
    luxuryCount += 1;
    return luxuryCount <= MAX_EQUIPPED_LUXURY;
  });

  const slots: EquippedPerkSlot[] = filtered.map((s, idx) => {
    const weight = stackWeight(idx + 1);
    return {
      ...s,
      weight,
      weightedPerks: s.perks.map((perk) => scalePerk(perk, weight)),
    };
  });

  const allWeighted = slots.flatMap((s) => s.weightedPerks);
  const statPatch = sumAnnualStatEffects(allWeighted);
  let fameDelta = 0;
  let careerPerfBonus = 0;
  let incomeBonusPct = 0;
  let expenseReducePct = 0;
  const unlockTags: string[] = [];

  for (const perk of allWeighted) {
    fameDelta += perk.fameBonus ?? 0;
    careerPerfBonus += perk.careerPerformanceBonus ?? 0;
    incomeBonusPct += perk.incomeBonusPct ?? 0;
    expenseReducePct += perk.expenseReducePct ?? 0;
    if (perk.unlockTag) unlockTags.push(perk.unlockTag);
  }

  return {
    statPatch,
    fameDelta: Math.round(fameDelta),
    careerPerfBonus,
    incomeBonusPct,
    expenseReducePct: Math.min(0.35, expenseReducePct),
    unlockTags: [...new Set(unlockTags)],
    slots,
  };
}

export function applyEquippedStatPerks(
  stats: CharacterStats,
  character: Character,
  clampFn: (n: number) => number,
): CharacterStats {
  const { statPatch } = resolveEquippedPerks(character);
  return applyStatPatch(stats, statPatch, clampFn);
}

export function getEquippedPerkSummary(character: Character): string[] {
  const effects = resolveEquippedPerks(character);
  const lines: string[] = [];
  const s = effects.statPatch;
  const bits: string[] = [];
  if (s.happiness) bits.push(`${s.happiness > 0 ? '+' : ''}${s.happiness} happy`);
  if (s.looks) bits.push(`${s.looks > 0 ? '+' : ''}${s.looks} looks`);
  if (s.social) bits.push(`${s.social > 0 ? '+' : ''}${s.social} social`);
  if (s.ambition) bits.push(`${s.ambition > 0 ? '+' : ''}${s.ambition} ambition`);
  if (s.intelligence) bits.push(`${s.intelligence > 0 ? '+' : ''}${s.intelligence} intel`);
  if (s.fitness) bits.push(`${s.fitness > 0 ? '+' : ''}${s.fitness} fitness`);
  if (s.health) bits.push(`${s.health > 0 ? '+' : ''}${s.health} health`);
  if (s.mentalHealth) bits.push(`${s.mentalHealth > 0 ? '+' : ''}${s.mentalHealth} mental`);
  if (bits.length) lines.push(bits.join(' · '));
  if (effects.fameDelta) lines.push(`Fame +${effects.fameDelta}`);
  if (effects.careerPerfBonus)
    lines.push(`Career +${(effects.careerPerfBonus * 100).toFixed(0)}%`);
  if (effects.incomeBonusPct)
    lines.push(`Income +${(effects.incomeBonusPct * 100).toFixed(0)}%`);
  if (effects.expenseReducePct)
    lines.push(`Expenses −${(effects.expenseReducePct * 100).toFixed(0)}%`);
  if (effects.unlockTags.length) lines.push(`Unlocks: ${effects.unlockTags.join(', ')}`);
  return lines;
}

export function previewStackWeightIfEquipped(
  character: Character,
  asNewEquip: boolean,
): number {
  const current = character.assets.filter((a) => a.equipped).length
    + (character.businesses ?? []).filter((b) => b.equipped).length;
  const nextIndex = asNewEquip ? current + 1 : current;
  return stackWeight(Math.max(1, nextIndex));
}

export function getCatalogEntryMeta(asset: Asset): {
  roleTag?: string;
  description?: string;
} {
  if (asset.type === 'vehicle' && asset.catalogId) {
    const v = getVehicleById(asset.catalogId);
    return { roleTag: v?.roleTag, description: v?.description };
  }
  if (asset.type === 'collectible' && asset.catalogId) {
    const c = getCollectibleById(asset.catalogId);
    return { roleTag: c?.roleTag, description: c?.description };
  }
  if (asset.type === 'property' && asset.propertyDefId) {
    const p = getPropertyCatalogEntry(asset.propertyDefId);
    return { roleTag: p?.roleTag, description: p?.description };
  }
  return {};
}
