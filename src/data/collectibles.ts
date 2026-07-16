import type { AssetPerk } from './assetPerks';
import type { AssetRoleTag } from '../types';

export interface CollectibleDef {
  id: string;
  name: string;
  category: 'art' | 'watch' | 'luxury' | 'memorabilia' | 'wine';
  baseValueUsd: number;
  appreciationPct: number;
  volatility: number;
  happinessBonus: number;
  description: string;
  roleTag: AssetRoleTag;
  perks: AssetPerk[];
}

function p(
  id: string,
  label: string,
  description: string,
  extras: Partial<AssetPerk> = {},
): AssetPerk {
  return { id, label, description, ...extras };
}

export const COLLECTIBLES: CollectibleDef[] = [
  {
    id: 'art_abstract',
    name: 'Abstract Canvas',
    category: 'art',
    baseValueUsd: 8000,
    appreciationPct: 0.04,
    volatility: 0.15,
    happinessBonus: 4,
    roleTag: 'collector',
    description: 'Statement art — culture and mild happiness.',
    perks: [
      p('col_abs_culture', 'Wall Statement', 'Intelligence and happiness from display', {
        annualStatEffect: { intelligence: 2, happiness: 3, social: 1 },
      }),
    ],
  },
  {
    id: 'art_sculpture',
    name: 'Bronze Sculpture',
    category: 'art',
    baseValueUsd: 22000,
    appreciationPct: 0.05,
    volatility: 0.16,
    happinessBonus: 6,
    roleTag: 'collector',
    description: 'Serious collector piece — culture capital.',
    perks: [
      p('col_sculp_culture', 'Sculpted Taste', 'Intelligence and social', {
        annualStatEffect: { intelligence: 3, social: 2, happiness: 4 },
      }),
      p('col_sculp_fame', 'Gallery Talk', 'Mild fame among collectors', {
        fameBonus: 3,
      }),
    ],
  },
  {
    id: 'art_landscape',
    name: 'Landscape Oil',
    category: 'art',
    baseValueUsd: 12000,
    appreciationPct: 0.05,
    volatility: 0.12,
    happinessBonus: 5,
    roleTag: 'lifestyle',
    description: 'Calming landscape — mental health focus.',
    perks: [
      p('col_land_calm', 'Quiet View', 'Mental health and happiness', {
        annualStatEffect: { mentalHealth: 3, happiness: 4 },
      }),
    ],
  },
  {
    id: 'watch_steel',
    name: 'Steel Chronograph',
    category: 'watch',
    baseValueUsd: 6000,
    appreciationPct: 0.02,
    volatility: 0.1,
    happinessBonus: 4,
    roleTag: 'status',
    description: 'Everyday status — looks without excess.',
    perks: [
      p('col_steel_looks', 'Wrist Presence', 'Looks and ambition', {
        annualStatEffect: { looks: 2, ambition: 1, happiness: 3 },
      }),
    ],
  },
  {
    id: 'watch_gold',
    name: 'Gold Dress Watch',
    category: 'watch',
    baseValueUsd: 18000,
    appreciationPct: 0.03,
    volatility: 0.12,
    happinessBonus: 6,
    roleTag: 'status',
    description: 'Formal status — career and looks.',
    perks: [
      p('col_gold_status', 'Boardroom Wrist', 'Looks, ambition, career edge', {
        annualStatEffect: { looks: 3, ambition: 2, happiness: 4 },
        careerPerformanceBonus: 0.02,
      }),
    ],
  },
  {
    id: 'watch_skeleton',
    name: 'Skeleton Watch',
    category: 'watch',
    baseValueUsd: 14000,
    appreciationPct: 0.03,
    volatility: 0.14,
    happinessBonus: 6,
    roleTag: 'collector',
    description: 'Horology flex — social and collector prestige.',
    perks: [
      p('col_skel_flex', 'Conversation Piece', 'Social and looks', {
        annualStatEffect: { social: 3, looks: 2, happiness: 4 },
        fameBonus: 2,
      }),
    ],
  },
  {
    id: 'lux_jewelry',
    name: 'Diamond Pendant',
    category: 'luxury',
    baseValueUsd: 25000,
    appreciationPct: 0.03,
    volatility: 0.1,
    happinessBonus: 7,
    roleTag: 'status',
    description: 'Quiet luxury — looks and fame.',
    perks: [
      p('col_diam_looks', 'Sparkle Factor', 'Looks and happiness', {
        annualStatEffect: { looks: 4, happiness: 5, social: 2 },
        fameBonus: 4,
      }),
    ],
  },
  {
    id: 'lux_bag',
    name: 'Designer Handbag',
    category: 'luxury',
    baseValueUsd: 3500,
    appreciationPct: 0.01,
    volatility: 0.14,
    happinessBonus: 4,
    roleTag: 'status',
    description: 'Entry luxury — looks and social.',
    perks: [
      p('col_bag_status', 'Logo Soft Power', 'Looks and social', {
        annualStatEffect: { looks: 2, social: 2, happiness: 3 },
      }),
    ],
  },
  {
    id: 'lux_camera',
    name: 'Vintage Camera',
    category: 'luxury',
    baseValueUsd: 3800,
    appreciationPct: 0.02,
    volatility: 0.12,
    happinessBonus: 3,
    roleTag: 'lifestyle',
    description: 'Creative tool — intelligence and social content.',
    perks: [
      p('col_cam_create', 'Frame the World', 'Intelligence and social', {
        annualStatEffect: { intelligence: 2, social: 2, happiness: 2 },
        unlockTag: 'creator_camera',
      }),
    ],
  },
  {
    id: 'mem_jersey',
    name: 'Signed Jersey',
    category: 'memorabilia',
    baseValueUsd: 4500,
    appreciationPct: 0.04,
    volatility: 0.2,
    happinessBonus: 4,
    roleTag: 'lifestyle',
    description: 'Fan pride — happiness and social.',
    perks: [
      p('col_jersey_fan', 'Team Pride', 'Happiness and social', {
        annualStatEffect: { happiness: 4, social: 2 },
      }),
    ],
  },
  {
    id: 'mem_guitar',
    name: 'Signed Guitar',
    category: 'memorabilia',
    baseValueUsd: 9000,
    appreciationPct: 0.04,
    volatility: 0.16,
    happinessBonus: 5,
    roleTag: 'lifestyle',
    description: 'Music cred — social and mild fame.',
    perks: [
      p('col_guitar_scene', 'Stage Cred', 'Social, happiness, fame', {
        annualStatEffect: { social: 3, happiness: 4 },
        fameBonus: 3,
        unlockTag: 'music_scene',
      }),
    ],
  },
  {
    id: 'mem_comic',
    name: 'First Edition Comic',
    category: 'memorabilia',
    baseValueUsd: 7000,
    appreciationPct: 0.06,
    volatility: 0.2,
    happinessBonus: 4,
    roleTag: 'collector',
    description: 'Appreciating collectible — wealth focus.',
    perks: [
      p('col_comic_invest', 'Nerd Asset', 'Intelligence and wealth signal', {
        annualStatEffect: { intelligence: 2, happiness: 3, wealth: 1 },
        incomeBonusPct: 0.01,
      }),
    ],
  },
  {
    id: 'wine_bordeaux',
    name: 'Bordeaux Case',
    category: 'wine',
    baseValueUsd: 5000,
    appreciationPct: 0.04,
    volatility: 0.12,
    happinessBonus: 3,
    roleTag: 'collector',
    description: 'Cellar prestige — social hosting and intelligence.',
    perks: [
      p('col_wine_host', 'Cellar Host', 'Social and intelligence', {
        annualStatEffect: { social: 2, intelligence: 2, happiness: 3 },
      }),
    ],
  },
  {
    id: 'wine_champagne',
    name: 'Vintage Champagne',
    category: 'wine',
    baseValueUsd: 3500,
    appreciationPct: 0.03,
    volatility: 0.1,
    happinessBonus: 3,
    roleTag: 'lifestyle',
    description: 'Celebration stock — happiness and social.',
    perks: [
      p('col_champ_party', 'Toast Ready', 'Happiness and social', {
        annualStatEffect: { happiness: 3, social: 2 },
      }),
    ],
  },
  {
    id: 'wine_napa',
    name: 'Napa Reserve',
    category: 'wine',
    baseValueUsd: 4200,
    appreciationPct: 0.035,
    volatility: 0.11,
    happinessBonus: 3,
    roleTag: 'income',
    description: 'Appreciating cellar — mild investment identity.',
    perks: [
      p('col_napa_invest', 'Aging Asset', 'Wealth and mild income', {
        annualStatEffect: { wealth: 1, happiness: 2 },
        incomeBonusPct: 0.015,
      }),
    ],
  },
  {
    id: 'lux_pen',
    name: 'Fountain Pen Set',
    category: 'luxury',
    baseValueUsd: 2000,
    appreciationPct: 0.02,
    volatility: 0.08,
    happinessBonus: 2,
    roleTag: 'business',
    description: 'Executive writing set — career polish.',
    perks: [
      p('col_pen_exec', 'Signature Deal', 'Ambition and career', {
        annualStatEffect: { ambition: 2, intelligence: 1, happiness: 1 },
        careerPerformanceBonus: 0.015,
      }),
    ],
  },
  {
    id: 'mem_sneaker',
    name: 'Limited Sneakers',
    category: 'memorabilia',
    baseValueUsd: 2500,
    appreciationPct: 0.02,
    volatility: 0.25,
    happinessBonus: 3,
    roleTag: 'status',
    description: 'Hype drops — looks and youth social.',
    perks: [
      p('col_sneak_hype', 'Drop Flex', 'Looks and social', {
        annualStatEffect: { looks: 2, social: 2, happiness: 2 },
        fameBonus: 1,
      }),
    ],
  },
];

export const COLLECTIBLE_MAP = Object.fromEntries(COLLECTIBLES.map((c) => [c.id, c]));

export function getCollectibleById(id: string): CollectibleDef | undefined {
  return COLLECTIBLE_MAP[id];
}
