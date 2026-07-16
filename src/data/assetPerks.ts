import type { CharacterStats, StatEffect } from '../types';

export type AssetPerkTier = 'budget' | 'mid' | 'premium' | 'elite' | 'legendary';

export interface AssetPerk {
  id: string;
  label: string;
  description: string;
  /** Applied each age-up while equipped */
  annualStatEffect?: Partial<CharacterStats>;
  /** One-shot / passive modifiers */
  incomeBonusPct?: number;
  expenseReducePct?: number;
  fameBonus?: number;
  careerPerformanceBonus?: number;
  crimeRiskDelta?: number;
  unlockTag?: string;
}

export function tierFromUsdPrice(priceUsd: number): AssetPerkTier {
  if (priceUsd >= 1_000_000) return 'legendary';
  if (priceUsd >= 200_000) return 'elite';
  if (priceUsd >= 50_000) return 'premium';
  if (priceUsd >= 15_000) return 'mid';
  return 'budget';
}

export function tierLabel(tier: AssetPerkTier): string {
  switch (tier) {
    case 'budget': return 'Budget';
    case 'mid': return 'Mid';
    case 'premium': return 'Premium';
    case 'elite': return 'Elite';
    case 'legendary': return 'Legendary';
  }
}

/** Scale a base magnitude by tier (higher price → stronger perks). */
export function tierMagnitude(tier: AssetPerkTier): number {
  switch (tier) {
    case 'budget': return 1;
    case 'mid': return 1.6;
    case 'premium': return 2.4;
    case 'elite': return 3.5;
    case 'legendary': return 5;
  }
}

export function buildVehiclePerks(priceUsd: number, happinessBonus: number): AssetPerk[] {
  const tier = tierFromUsdPrice(priceUsd);
  const m = tierMagnitude(tier);
  const perks: AssetPerk[] = [
    {
      id: 'veh_happy',
      label: 'Daily Drive Joy',
      description: `+${Math.round(happinessBonus * m / Math.max(1, happinessBonus) * happinessBonus)} happiness / year while equipped`,
      annualStatEffect: { happiness: Math.max(1, Math.round(happinessBonus * (0.6 + m * 0.15))) },
    },
  ];
  if (tier !== 'budget') {
    perks.push({
      id: 'veh_looks',
      label: 'Street Presence',
      description: 'Looks boost while this is your equipped vehicle',
      annualStatEffect: { looks: Math.round(1 * m) },
    });
  }
  if (tier === 'premium' || tier === 'elite' || tier === 'legendary') {
    perks.push({
      id: 'veh_social',
      label: 'Status Symbol',
      description: 'Social and ambition from high-end rides',
      annualStatEffect: { social: Math.round(1 * m), ambition: Math.round(0.5 * m) },
      fameBonus: Math.round(2 * m),
    });
  }
  if (tier === 'elite' || tier === 'legendary') {
    perks.push({
      id: 'veh_career',
      label: 'Executive Arrival',
      description: 'Slight career performance edge',
      careerPerformanceBonus: 0.02 * m,
    });
  }
  if (tier === 'legendary') {
    perks.push({
      id: 'veh_network',
      label: 'Elite Network Access',
      description: 'Unlocks exclusive social & business opportunities',
      unlockTag: 'luxury_vehicle_network',
      fameBonus: 15,
    });
  }
  return perks;
}

export function buildCollectiblePerks(priceUsd: number, happinessBonus: number, category: string): AssetPerk[] {
  const tier = tierFromUsdPrice(priceUsd);
  const m = tierMagnitude(tier);
  const perks: AssetPerk[] = [
    {
      id: 'col_display',
      label: 'Display Pride',
      description: 'Happiness while on display (equipped)',
      annualStatEffect: { happiness: Math.max(1, Math.round(happinessBonus * (0.7 + m * 0.1))) },
    },
  ];
  if (category === 'art' || category === 'wine') {
    perks.push({
      id: 'col_culture',
      label: 'Cultural Capital',
      description: 'Intelligence & social from curated taste',
      annualStatEffect: { intelligence: Math.round(0.8 * m), social: Math.round(0.6 * m) },
    });
  }
  if (category === 'watch' || category === 'luxury') {
    perks.push({
      id: 'col_status',
      label: 'Quiet Luxury',
      description: 'Looks and ambition from status pieces',
      annualStatEffect: { looks: Math.round(0.8 * m), ambition: Math.round(0.5 * m) },
    });
  }
  if (tier === 'elite' || tier === 'legendary') {
    perks.push({
      id: 'col_appraisal',
      label: 'Collector Prestige',
      description: 'Fame and networking from rare holdings',
      fameBonus: Math.round(3 * m),
      unlockTag: 'collector_circle',
    });
  }
  return perks;
}

export function buildInsurancePerks(premiumUsd: number, coveragePct: number, line: string): AssetPerk[] {
  const tier = tierFromUsdPrice(premiumUsd * 8);
  const m = tierMagnitude(tier);
  const pct = Math.round(coveragePct * 100);
  const perks: AssetPerk[] = [
    {
      id: `ins_cover_${line}`,
      label: `${line[0].toUpperCase()}${line.slice(1)} Coverage`,
      description: `Pays ~${pct}% of matching ${line} losses while equipped`,
    },
    {
      id: 'ins_peace',
      label: 'Peace of Mind',
      description: 'Mental health while policy is active',
      annualStatEffect: { mentalHealth: Math.max(1, Math.round(0.8 * m)), happiness: Math.max(1, Math.round(0.5 * m)) },
    },
  ];
  if (line === 'health' && (tier === 'premium' || tier === 'elite' || tier === 'legendary')) {
    perks.push({
      id: 'ins_health_plus',
      label: 'Preventive Care',
      description: 'Slight annual health recovery',
      annualStatEffect: { health: Math.round(1 * m) },
    });
  }
  if (line === 'life') {
    perks.push({
      id: 'ins_life_estate',
      label: 'Estate Buffer',
      description: 'Larger heir payout on death while equipped',
      incomeBonusPct: 0.05 * m,
    });
  }
  return perks;
}

export function buildPropertyPerks(priceUsd: number, tierName: string): AssetPerk[] {
  const tier = tierFromUsdPrice(priceUsd);
  const m = tierMagnitude(tier);
  const perks: AssetPerk[] = [
    {
      id: 'prop_home',
      label: 'Home Comfort',
      description: 'Happiness from living well',
      annualStatEffect: { happiness: Math.round(2 * m), mentalHealth: Math.round(1 * m) },
    },
  ];
  if (tierName === 'luxury' || tier === 'elite' || tier === 'legendary') {
    perks.push(
      {
        id: 'prop_status',
        label: 'Address Prestige',
        description: 'Looks, social, and fame from luxury address',
        annualStatEffect: { looks: Math.round(2 * m), social: Math.round(2 * m) },
        fameBonus: Math.round(5 * m),
      },
      {
        id: 'prop_network',
        label: 'Neighborhood Network',
        description: 'Career & business soft unlocks',
        careerPerformanceBonus: 0.015 * m,
        unlockTag: 'luxury_address',
      },
    );
  }
  if (tier === 'legendary') {
    perks.push({
      id: 'prop_yield',
      label: 'Trophy Asset',
      description: 'Stronger rental yield when rented out',
      incomeBonusPct: 0.04,
    });
  }
  return perks;
}

export function buildInstrumentPerks(_kind: string, volatility: number, annualReturn: number): AssetPerk[] {
  const riskTier = volatility > 0.35 ? 'elite' : volatility > 0.2 ? 'premium' : volatility > 0.1 ? 'mid' : 'budget';
  const m = tierMagnitude(riskTier as AssetPerkTier);
  return [
    {
      id: 'inv_yield',
      label: 'Target Yield',
      description: `~${(annualReturn * 100).toFixed(0)}% expected annual return`,
      incomeBonusPct: annualReturn,
    },
    {
      id: 'inv_risk',
      label: riskTier === 'budget' || riskTier === 'mid' ? 'Steady Growth' : 'High Octane',
      description: `Volatility ${(volatility * 100).toFixed(0)}% — ${riskTier === 'elite' ? 'high risk / reward' : 'moderate risk'}`,
      annualStatEffect: riskTier === 'elite'
        ? { ambition: Math.round(1 * m), mentalHealth: -Math.round(0.5 * m) }
        : { ambition: Math.round(0.5 * m) },
    },
  ];
}

export function buildBusinessPerks(valuationUsd: number): AssetPerk[] {
  const tier = tierFromUsdPrice(valuationUsd);
  const m = tierMagnitude(tier);
  return [
    {
      id: 'biz_income',
      label: 'Operating Income',
      description: 'Business generates annual cash when featured',
      incomeBonusPct: 0.02 * m,
    },
    {
      id: 'biz_ambition',
      label: 'Founder Drive',
      description: 'Ambition and wealth stats while featured',
      annualStatEffect: { ambition: Math.round(2 * m), wealth: Math.round(1 * m) },
    },
    {
      id: 'biz_fame',
      label: 'Brand Presence',
      description: 'Fame from a featured company',
      fameBonus: Math.round(3 * m),
      unlockTag: tier === 'legendary' ? 'tycoon_network' : undefined,
    },
  ];
}

export function sumAnnualStatEffects(perks: AssetPerk[]): Partial<CharacterStats> {
  const out: Partial<CharacterStats> = {};
  for (const p of perks) {
    if (!p.annualStatEffect) continue;
    for (const [k, v] of Object.entries(p.annualStatEffect)) {
      if (typeof v !== 'number') continue;
      const key = k as keyof CharacterStats;
      out[key] = (out[key] ?? 0) + v;
    }
  }
  return out;
}

export function applyStatPatch(
  stats: CharacterStats,
  patch: Partial<CharacterStats>,
  clampFn: (n: number) => number,
): CharacterStats {
  const next = { ...stats };
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v !== 'number') continue;
    const key = k as keyof CharacterStats;
    next[key] = clampFn(stats[key] + v);
  }
  return next;
}

export function formatPerkLines(perks: AssetPerk[]): string[] {
  return perks.map((p) => `${p.label}: ${p.description}`);
}

export type { StatEffect };
