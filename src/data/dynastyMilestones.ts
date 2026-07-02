export interface DynastyMilestone {
  id: string;
  label: string;
  description: string;
  /** 'score' = dynasty score threshold; 'generation' = generation number reached */
  type: 'score' | 'generation';
  threshold: number;
  coinReward: number;
  gemReward: number;
  titleReward: string;
  icon: string; // emoji
}

export const DYNASTY_MILESTONES: DynastyMilestone[] = [
  // ── Generation milestones ────────────────────────────────────────────────────
  {
    id: 'gen_2',
    label: 'Dynasty Begins',
    description: 'Your bloodline reaches Generation 2.',
    type: 'generation',
    threshold: 2,
    coinReward: 375,
    gemReward: 5,
    titleReward: 'Patriarch / Matriarch',
    icon: '🌱',
  },
  {
    id: 'gen_3',
    label: 'The Lineage Grows',
    description: 'Three generations of your bloodline have lived.',
    type: 'generation',
    threshold: 3,
    coinReward: 1125,
    gemReward: 10,
    titleReward: 'Dynasty Builder',
    icon: '🌿',
  },
  {
    id: 'gen_5',
    label: 'A Living Legacy',
    description: 'Five generations — your family endures.',
    type: 'generation',
    threshold: 5,
    coinReward: 3750,
    gemReward: 25,
    titleReward: 'Legendary Ancestor',
    icon: '🌳',
  },
  // ── Dynasty score milestones ─────────────────────────────────────────────────
  {
    id: 'score_1k',
    label: 'First Steps',
    description: 'Your dynasty score crosses 1,000.',
    type: 'score',
    threshold: 1000,
    coinReward: 150,
    gemReward: 2,
    titleReward: 'Rising House',
    icon: '⭐',
  },
  {
    id: 'score_5k',
    label: 'Growing Influence',
    description: 'Your dynasty score reaches 5,000.',
    type: 'score',
    threshold: 5000,
    coinReward: 560,
    gemReward: 5,
    titleReward: 'Established House',
    icon: '🌟',
  },
  {
    id: 'score_10k',
    label: 'House of Power',
    description: 'Your dynasty score reaches 10,000.',
    type: 'score',
    threshold: 10000,
    coinReward: 1500,
    gemReward: 10,
    titleReward: 'House of Power',
    icon: '💫',
  },
  {
    id: 'score_25k',
    label: 'Immortal Legacy',
    description: 'Your dynasty score reaches 25,000.',
    type: 'score',
    threshold: 25000,
    coinReward: 4500,
    gemReward: 25,
    titleReward: 'Immortal Legacy',
    icon: '👑',
  },
];
