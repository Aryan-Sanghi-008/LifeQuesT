export interface DynastyPerkDef {
  id: string;
  label: string;
  description: string;
  cost: number;
  maxPurchases?: number;
  crestId?: string;
}

export const DYNASTY_TRAIT_POOL = ['stoic', 'magnetic', 'lucky'] as const;

export const DYNASTY_PERKS: DynastyPerkDef[] = [
  {
    id: 'dynasty_stat_lineage',
    label: 'Lineage Strength',
    description: '+5% starting stats per generation for each tier purchased (max 5 tiers).',
    cost: 1200,
    maxPurchases: 5,
  },
  {
    id: 'dynasty_trait_expansion',
    label: 'Expanded Trait Pool',
    description: 'Unlock Stoic, Magnetic, and Lucky traits during character creation.',
    cost: 800,
    maxPurchases: 1,
  },
  {
    id: 'dynasty_crest_lion',
    label: 'Lion Crest',
    description: 'Exclusive family crest displayed on your dynasty line.',
    cost: 500,
    maxPurchases: 1,
    crestId: 'lion',
  },
  {
    id: 'dynasty_crest_eagle',
    label: 'Eagle Crest',
    description: 'Exclusive family crest displayed on your dynasty line.',
    cost: 500,
    maxPurchases: 1,
    crestId: 'eagle',
  },
  {
    id: 'dynasty_crest_oak',
    label: 'Oak Crest',
    description: 'Exclusive family crest displayed on your dynasty line.',
    cost: 500,
    maxPurchases: 1,
    crestId: 'oak',
  },
  {
    id: 'dynasty_bloodline_bond',
    label: 'Bloodline Bond',
    description: 'Heirs spawn a cross-life ancestor NPC with elevated relationship.',
    cost: 1000,
    maxPurchases: 1,
  },
];

export const DYNASTY_CREST_LABELS: Record<string, string> = {
  lion: 'Lion',
  eagle: 'Eagle',
  oak: 'Oak',
};

export function getDynastyPerkById(id: string): DynastyPerkDef | undefined {
  return DYNASTY_PERKS.find((p) => p.id === id);
}

export function countDynastyPerkPurchases(unlockedIds: string[], perkId: string): number {
  return unlockedIds.filter((id) => id === perkId).length;
}
