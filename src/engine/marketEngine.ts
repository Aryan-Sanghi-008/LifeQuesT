import type { Asset, Character } from '../types';
import { getInstrumentById, type MarketInstrument } from '../data/marketInstruments';

function gaussian(): number {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export type MarketEventModifier = {
  /** Multiplier on all risky assets (crash < 1, boom > 1) */
  equityMult?: number;
  cryptoMult?: number;
  bondMult?: number;
};

export function tickInstrumentValue(
  currentValue: number,
  instrument: MarketInstrument,
  modifiers?: MarketEventModifier,
): { value: number; dividend: number } {
  const shock = gaussian() * instrument.volatility;
  let mult = 1 + instrument.annualReturnBase + shock;
  if (instrument.kind === 'crypto') mult *= modifiers?.cryptoMult ?? 1;
  else if (instrument.kind === 'bond') mult *= modifiers?.bondMult ?? 1;
  else if (
    instrument.kind === 'stock' ||
    instrument.kind === 'mutual_fund' ||
    instrument.kind === 'reit' ||
    instrument.kind === 'venture'
  ) {
    mult *= modifiers?.equityMult ?? 1;
  } else {
    mult *= modifiers?.equityMult ?? 1;
  }
  mult = Math.max(0.25, Math.min(2.5, mult));
  const value = Math.max(0, Math.round(currentValue * mult));
  const dividend = Math.round(currentValue * (instrument.dividendYield ?? 0));
  return { value, dividend };
}

export function tickMarketHoldings(
  assets: Asset[],
  age: number,
  modifiers?: MarketEventModifier,
): { assets: Asset[]; dividends: number } {
  let dividends = 0;
  const next = assets.map((a) => {
    if (a.type !== 'investment' && a.type !== 'angel_stake') return a;
    const instrument = a.catalogId ? getInstrumentById(a.catalogId) : undefined;
    if (!instrument && a.type === 'investment') {
      // Legacy unnamed portfolio: ~7% ± vol
      const shock = 1 + 0.07 + gaussian() * 0.15;
      const value = Math.max(0, Math.round(a.value * Math.max(0.4, Math.min(1.8, shock))));
      const history = [...(a.priceHistory ?? []), { age, value }].slice(-20);
      return { ...a, value, priceHistory: history };
    }
    if (!instrument) return a;
    const { value, dividend } = tickInstrumentValue(a.value, instrument, modifiers);
    dividends += dividend;
    const history = [...(a.priceHistory ?? []), { age, value }].slice(-20);
    return { ...a, value, priceHistory: history };
  });
  return { assets: next, dividends };
}

export function portfolioAllocation(
  assets: Asset[],
): Array<{ kind: string; value: number; pct: number }> {
  const buckets: Record<string, number> = {};
  let total = 0;
  for (const a of assets) {
    if (a.type === 'investment' || a.type === 'angel_stake') {
      const kind = a.instrumentKind ?? getInstrumentById(a.catalogId ?? '')?.kind ?? a.type;
      buckets[kind] = (buckets[kind] ?? 0) + a.value;
      total += a.value;
    } else if (a.type === 'property' || a.type === 'vehicle' || a.type === 'collectible') {
      buckets[a.type] = (buckets[a.type] ?? 0) + a.value;
      total += a.value;
    }
  }
  if (total <= 0) return [];
  return Object.entries(buckets).map(([kind, value]) => ({
    kind,
    value,
    pct: Math.round((value / total) * 100),
  }));
}

export function performanceSeries(
  assets: Asset[],
): Array<{ age: number; value: number }> {
  const byAge: Record<number, number> = {};
  for (const a of assets) {
    for (const p of a.priceHistory ?? []) {
      byAge[p.age] = (byAge[p.age] ?? 0) + p.value;
    }
    if (!a.priceHistory?.length) {
      byAge[a.purchasedAge] = (byAge[a.purchasedAge] ?? 0) + a.value;
    }
  }
  return Object.keys(byAge)
    .map(Number)
    .sort((a, b) => a - b)
    .map((age) => ({ age, value: byAge[age] }));
}

/** Generate a few NPC angel deals for the Market tab. */
export function generateAngelOpportunities(
  character: Pick<Character, 'age' | 'bankBalance' | 'countryCode'>,
  count = 4,
): Character['angelOpportunities'] {
  const sectors = ['Fintech', 'Health', 'Climate', 'Consumer', 'AI', 'Logistics'];
  const names = ['Nova', 'Pulse', 'Orbit', 'Bloom', 'Spark', 'Lattice', 'Harbor', 'Quill'];
  return Array.from({ length: count }, (_, i) => {
    const ask = Math.round(character.bankBalance * (0.05 + Math.random() * 0.15)) || 5000;
    return {
      id: `angel_${character.age}_${i}_${Date.now()}`,
      name: `${names[i % names.length]} ${sectors[i % sectors.length]}`,
      sector: sectors[i % sectors.length],
      askAmount: Math.max(2000, ask),
      equityPct: Math.round(5 + Math.random() * 12),
      risk: 0.3 + Math.random() * 0.5,
      expectedReturn: 0.15 + Math.random() * 0.35,
      generatedAge: character.age,
    };
  });
}

export function tickAngelStake(asset: Asset, age: number): Asset {
  if (asset.type !== 'angel_stake') return asset;
  const risk = 0.35;
  if (Math.random() < risk * 0.15) {
    // Wipeout
    const value = 0;
    return {
      ...asset,
      value,
      priceHistory: [...(asset.priceHistory ?? []), { age, value }].slice(-20),
    };
  }
  const growth = 1 + 0.2 + gaussian() * 0.4;
  const value = Math.max(0, Math.round(asset.value * Math.max(0.2, Math.min(3, growth))));
  return {
    ...asset,
    value,
    priceHistory: [...(asset.priceHistory ?? []), { age, value }].slice(-20),
  };
}
