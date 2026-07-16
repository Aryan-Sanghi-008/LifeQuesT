import type { HobbyCategory, HobbyDef } from '../types';

const CATEGORY_HOBBIES: Record<HobbyCategory, readonly string[]> = {
  sports: ['Basketball', 'Soccer', 'Tennis', 'Swimming', 'Running', 'Boxing', 'Golf', 'Cycling'],
  arts: ['Painting', 'Sculpture', 'Photography', 'Film Making', 'Theater', 'Dance'],
  games: ['Chess', 'Video Games', 'Board Games', 'Esports', 'Poker'],
  outdoors: ['Hiking', 'Camping', 'Fishing', 'Rock Climbing', 'Surfing', 'Skiing'],
  collecting: ['Stamps', 'Coins', 'Vintage Cards', 'Antiques', 'Sneakers'],
  cooking: ['Baking', 'Grilling', 'Fine Dining', 'Street Food', 'Pastry'],
  writing: ['Poetry', 'Novel Writing', 'Blogging', 'Journalism', 'Screenwriting'],
  crafts: ['Woodworking', 'Knitting', 'Pottery', 'Jewelry Making', 'Leatherwork'],
  music: ['Guitar', 'Piano', 'Singing', 'DJing', 'Drums'],
  other: ['Gardening', 'Astronomy', 'Magic Tricks', 'Volunteering', 'Meditation'],
};

const CATEGORY_XP: Record<HobbyCategory, number> = {
  sports: 15,
  arts: 12,
  games: 10,
  outdoors: 14,
  collecting: 8,
  cooking: 11,
  writing: 10,
  crafts: 9,
  music: 13,
  other: 10,
};

function buildHobby(category: HobbyCategory, label: string): HobbyDef {
  const id = `${category}_${label.toLowerCase().replace(/\s+/g, '_')}`;
  return {
    id,
    label,
    category,
    description: `Practice ${label.toLowerCase()} to build mastery and unlock competitions.`,
    xpPerSession: CATEGORY_XP[category],
    minAge: category === 'sports' ? 6 : 8,
    maxLevel: 100,
    statEffect: category === 'sports' || category === 'outdoors'
      ? { fitness: 2, happiness: 1 }
      : category === 'arts' || category === 'music'
        ? { happiness: 3, social: 1 }
        : { happiness: 2, intelligence: 1 },
  };
}

export const HOBBY_CATALOG: HobbyDef[] = (
  Object.entries(CATEGORY_HOBBIES) as [HobbyCategory, readonly string[]][]
).flatMap(([category, labels]) =>
  labels.map((label) => buildHobby(category, label)),
);

export const HOBBY_MAP = Object.fromEntries(
  HOBBY_CATALOG.map(h => [h.id, h]),
) as Record<string, HobbyDef>;

export function getHobbiesByCategory(category: HobbyCategory): HobbyDef[] {
  return HOBBY_CATALOG.filter(h => h.category === category);
}

export interface HobbyCompetitionDef {
  id: string;
  label: string;
  minLevel: number;
  winChanceBase: number;
  cashRewardUsd: number;
  xpReward: number;
  statEffect?: HobbyDef['statEffect'];
}

export const HOBBY_COMPETITIONS: HobbyCompetitionDef[] = [
  { id: 'local_showcase', label: 'Local Showcase', minLevel: 10, winChanceBase: 0.35, cashRewardUsd: 500, xpReward: 20, statEffect: { happiness: 3 } },
  { id: 'regional_competition', label: 'Regional Competition', minLevel: 25, winChanceBase: 0.25, cashRewardUsd: 2500, xpReward: 40, statEffect: { happiness: 5, social: 2 } },
  { id: 'national_championship', label: 'National Championship', minLevel: 50, winChanceBase: 0.15, cashRewardUsd: 15000, xpReward: 80, statEffect: { happiness: 10, ambition: 5 } },
];

export const HOBBY_COMPETITION_MAP = Object.fromEntries(
  HOBBY_COMPETITIONS.map(c => [c.id, c]),
) as Record<string, HobbyCompetitionDef>;
