import { CollectionItem, EventRarity } from '@/types';
import { COLLECTION_SETS } from './sets';

type Rarity = EventRarity;

function moment(
  setId: string,
  index: number,
  name: string,
  description: string,
  unlockKey: string,
  rarity: Rarity = 'common',
): CollectionItem {
  const set = COLLECTION_SETS.find((s) => s.id === setId);
  return {
    id: `moment_${setId}_${index}`,
    category: 'life_moment',
    setId,
    name,
    description,
    unlockKey,
    iconKey: 'moment',
    accentColor: set?.accentColor,
    rarity,
  };
}

function rangeMoments(
  setId: string,
  prefix: string,
  unlockPrefix: string,
  count: number,
  names: string[],
  descTemplate: (n: number) => string,
  rarityFn?: (i: number) => Rarity,
  startIndex = 1,
): CollectionItem[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i;
    return moment(
      setId,
      idx,
      names[i] ?? `${prefix} ${idx}`,
      descTemplate(i + 1),
      `${unlockPrefix}:${i + 1}`,
      rarityFn?.(i + 1) ?? (idx >= 8 ? 'epic' : idx >= 5 ? 'rare' : idx >= 3 ? 'uncommon' : 'common'),
    );
  });
}

const WANDERER_NAMES = [
  'First Departure', 'Border Crossing', 'Foreign Streets', 'Solo Backpack', 'Mountain Trail',
  'Ocean Horizon', 'Night Train', 'Lost & Found', 'World Wonder', 'Citizen of Nowhere',
];

const TYCOON_NAMES = [
  'First Paycheck', 'Side Hustle', 'First Business', 'Second Venture', 'Portfolio',
  'Six Figures', 'Real Estate', 'Market Winner', 'Empire Builder', 'Mogul Status',
];

const SCHOLAR_NAMES = [
  'First Diploma', 'Honor Roll', 'Second Degree', 'Certified Pro', 'Research Breakthrough',
  'Triple Major', 'Dean\'s List', 'PhD Dreams', 'Lifelong Learner', 'Master of All',
];

const LOVER_NAMES = [
  'First Crush', 'First Date', 'Moving In', 'Wedding Bells', 'New Parent',
  'Family Dinner', 'Anniversary', 'Grandparent', 'Empty Nest', 'Legacy of Love',
];

const OUTLAW_NAMES = [
  'Petty Trouble', 'Run-In', 'Heat Rising', 'Under Surveillance', 'The Job',
  'Fence Deal', 'Gang Ties', 'Most Wanted', 'Prison Visit', 'Kingpin',
];

const CAREGIVER_NAMES = [
  'Sibling Bond', 'Parent\'s Pride', 'Family Reunion', 'Caretaker', 'Heir Apparent',
  'Bloodline', 'Family Crest', 'Dynasty Seed', 'Generational Wealth', 'Patriarch',
];

const ATHLETE_NAMES = [
  'Morning Run', 'Gym Regular', 'Marathon', 'Peak Health', 'Iron Will',
  'Recovery', 'Team Captain', 'Championship', 'Olympic Dream', 'Unbreakable',
];

const SOCIALITE_NAMES = [
  'First Post', 'Viral Moment', '1K Followers', '10K Club', 'Brand Deal',
  'Scandal', 'Comeback', 'Blue Check', '100K Fame', 'Icon',
];

const SURVIVOR_NAMES = [
  'Thirties', 'Forties', 'Fifties', 'Sixties', 'Seventies',
  'Eighties', 'Nineties', 'Centenarian', 'Near Miss', 'Second Wind',
];

const LEGACY_NAMES = [
  'Generation II', 'Generation III', 'Family Tree', 'Dynasty Score', 'Heir Chosen',
  'Blood Memory', 'Ancestral Gift', 'Lineage Crest', 'Eternal Name', 'Immortal Line',
];

const CAREERIST_NAMES = [
  'Intern', 'Promotion', 'Five Years', 'Ten Years', 'Department Head',
  'Corner Office', 'Industry Award', 'Mentor', 'Retirement Gold', 'Hall of Fame',
];

const VIRTUE_NAMES = [
  'Good Deed', 'Charity', 'Volunteer', 'Peacemaker', 'Honest Living',
  'Karma Rising', 'Community Hero', 'Selfless Act', 'Beacon', 'Enlightened',
];

const ROGUE_NAMES = [
  'White Lie', 'Gray Area', 'Risk Taker', 'Rule Bender', 'Chaos Agent',
  'Dark Humor', 'Moral Flex', 'Wild Card', 'Antihero', 'Agent of Chaos',
];

const MILESTONE_NAMES = [
  'Teen Years', 'Legal Adult', 'Quarter Century', 'Dirty Thirty', 'Midlife',
  'Forty Club', 'Half Century', 'Golden Fifty', 'Sixty Strong', 'Seventy Wise',
];

const DEVOTION_NAMES = [
  'Day One', 'Week One', 'Two Weeks', 'Month One', 'Streak Builder',
  'Season Pass', 'Daily Grind', 'Never Miss', 'Hundred Days', 'Eternal Flame',
];

export const LIFE_MOMENT_ITEMS: CollectionItem[] = [
  ...rangeMoments('wanderer', 'Journey', 'countries_lived', 10, WANDERER_NAMES, (n) => `Live in ${n} different ${n === 1 ? 'country' : 'countries'}.`),
  ...rangeMoments('tycoon', 'Wealth', 'business_count', 5, TYCOON_NAMES.slice(0, 5), (n) => `Own ${n} business${n === 1 ? '' : 'es'}.`),
  ...rangeMoments('tycoon', 'Wealth', 'wealth_stat', 5, TYCOON_NAMES.slice(5), (n) => `Reach wealth stat tier ${n * 15}.`, (n) => n >= 4 ? 'epic' : 'rare', 6),
  ...rangeMoments('scholar', 'Study', 'degree_count', 5, SCHOLAR_NAMES.slice(0, 5), (n) => `Earn ${n} degree${n === 1 ? '' : 's'}.`),
  ...rangeMoments('scholar', 'Study', 'cert_count', 5, SCHOLAR_NAMES.slice(5), (n) => `Earn ${n} certification${n === 1 ? '' : 's'}.`, undefined, 6),
  ...rangeMoments('lover', 'Love', 'children_count', 5, LOVER_NAMES.slice(0, 5), (n) => `Have ${n} child${n === 1 ? '' : 'ren'}.`),
  ...rangeMoments('lover', 'Love', 'relationships_stat', 5, LOVER_NAMES.slice(5), (n) => `Reach relationships stat ${n * 15}.`, undefined, 6),
  ...rangeMoments('outlaw', 'Crime', 'heat_level', 10, OUTLAW_NAMES, (n) => `Reach heat level ${n * 10}.`, (n) => n >= 7 ? 'legendary' : n >= 4 ? 'epic' : 'uncommon'),
  ...rangeMoments('caregiver', 'Family', 'family_rep', 10, CAREGIVER_NAMES, (n) => `Family reputation ${n * 10}+.`),
  ...rangeMoments('athlete', 'Fitness', 'health_stat', 10, ATHLETE_NAMES, (n) => `Health stat ${n * 10}+.`),
  ...rangeMoments('socialite', 'Fame', 'followers', 10, SOCIALITE_NAMES, (n) => `${n * 1000}+ followers.`, (n) => n >= 8 ? 'legendary' : n >= 5 ? 'epic' : 'rare'),
  ...rangeMoments('survivor', 'Age', 'age_min', 8, SURVIVOR_NAMES.slice(0, 8), (n) => `Reach age ${20 + n * 10}.`, (n) => n >= 6 ? 'legendary' : 'rare'),
  moment('survivor', 9, SURVIVOR_NAMES[8], 'Survive a near-death event.', 'near_death:1', 'epic'),
  moment('survivor', 10, SURVIVOR_NAMES[9], 'Recover from critical health.', 'health_recover:1', 'rare'),
  ...rangeMoments('legacy', 'Dynasty', 'generation', 10, LEGACY_NAMES, (n) => `Generation ${n} of your dynasty.`),
  ...rangeMoments('careerist', 'Career', 'career_years', 10, CAREERIST_NAMES, (n) => `${n * 3}+ career years.`),
  ...rangeMoments('virtue', 'Karma', 'karma_min', 10, VIRTUE_NAMES, (n) => `Karma ${40 + n * 5}+.`),
  ...rangeMoments('rogue', 'Karma', 'karma_max', 10, ROGUE_NAMES, (n) => `Karma below ${60 - n * 5}.`, () => 'uncommon'),
  ...rangeMoments('milestones', 'Age', 'age_exact', 10, MILESTONE_NAMES, (n) => `Reach age ${n * 10}.`),
  ...rangeMoments('devotion', 'Streak', 'daily_streak', 8, DEVOTION_NAMES.slice(0, 8), (n) => `${n * 7}-day login streak.`),
  moment('devotion', 9, DEVOTION_NAMES[8], 'Own the season pass.', 'season_pass:1', 'rare'),
  moment('devotion', 10, DEVOTION_NAMES[9], 'Maintain a 100-day streak.', 'daily_streak:100', 'legendary'),
];

export const LIFE_MOMENT_COUNT = LIFE_MOMENT_ITEMS.length;
