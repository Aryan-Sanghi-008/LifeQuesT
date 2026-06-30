import type { ScenarioId } from '../types';
export type { ScenarioId };
export type ScenarioBannerType = 'classic' | 'royal' | 'cyber' | 'crime' | 'fantasy';

export interface StatModifier {
  label: string;
  value: string;
  positive: boolean;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  bannerType: ScenarioBannerType;
  locked: boolean;
  accentColor: string;
  statModifiers: StatModifier[];
  ctaLabel: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'classic',
    name: 'Classic Life',
    tagline: 'The original LifeQuesT experience',
    description:
      'Live a modern life from birth to death. Go to school, find love, build a career, raise a family, and leave a legacy. Every decision shapes who you become.',
    bannerType: 'classic',
    locked: false,
    accentColor: '#3B82F6',
    statModifiers: [
      { label: 'Starting Balance', value: 'Standard', positive: true },
      { label: 'Event Frequency', value: 'Normal', positive: true },
      { label: 'Difficulty', value: 'Balanced', positive: true },
    ],
    ctaLabel: 'Play Classic',
  },
  {
    id: 'royal',
    name: 'Royal Dynasty',
    tagline: 'Born into power. Rule wisely.',
    description:
      'Start as a noble heir to a royal family. Navigate palace politics, arrange marriages, wage diplomatic wars, and build an empire that spans generations.',
    bannerType: 'royal',
    locked: true,
    accentColor: '#F59E0B',
    statModifiers: [
      { label: 'Starting Balance', value: '×10 Wealth', positive: true },
      { label: 'Prestige', value: 'Maximum', positive: true },
      { label: 'Political Events', value: 'Frequent', positive: false },
    ],
    ctaLabel: 'Unlock Soon',
  },
  {
    id: 'cyber',
    name: 'Cyber Future',
    tagline: 'In 2087, humanity uploaded everything.',
    description:
      'Live in a hyper-connected megacity where AI governs policy, augmentations replace medicine, and reputation is currency. Hack, trade, and survive the digital age.',
    bannerType: 'cyber',
    locked: true,
    accentColor: '#06B6D4',
    statModifiers: [
      { label: 'Tech Salary Multiplier', value: '×2.5', positive: true },
      { label: 'Healthcare Cost', value: '−60%', positive: true },
      { label: 'Surveillance Events', value: 'High', positive: false },
    ],
    ctaLabel: 'Unlock Soon',
  },
  {
    id: 'crime',
    name: 'Criminal Empire',
    tagline: 'Power. Money. Consequences.',
    description:
      'Build a criminal organization from the ground up. Run operations, evade law enforcement, and bribe officials — but one wrong move can bring it all crashing down.',
    bannerType: 'crime',
    locked: true,
    accentColor: '#EF4444',
    statModifiers: [
      { label: 'Crime Income Multiplier', value: '×3', positive: true },
      { label: 'Heat Level', value: 'Always Rising', positive: false },
      { label: 'Karma Penalty', value: 'Severe', positive: false },
    ],
    ctaLabel: 'Unlock Soon',
  },
  {
    id: 'fantasy',
    name: 'Fantasy Realm',
    tagline: 'Magic is real. The stakes are higher.',
    description:
      'Reborn into a medieval world of sorcery and swords. Level up spell abilities, forge alliances with guilds, and face mythical threats that no stat can fully prepare you for.',
    bannerType: 'fantasy',
    locked: true,
    accentColor: '#8B5CF6',
    statModifiers: [
      { label: 'Magic Stat', value: 'New Attribute', positive: true },
      { label: 'Combat Events', value: 'Frequent', positive: false },
      { label: 'Healthcare', value: 'Potions Only', positive: false },
    ],
    ctaLabel: 'Unlock Soon',
  },
];
