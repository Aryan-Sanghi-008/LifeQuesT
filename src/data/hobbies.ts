import type { HobbyCategory, HobbyDef } from '../types';

/**
 * Minimal curated hobby set — once/year practice with large XP,
 * finance/career perks, and level unlocks.
 */
export const HOBBY_CATALOG: HobbyDef[] = [
  {
    id: 'sports_running',
    label: 'Running',
    category: 'sports',
    description: 'Build stamina and discipline. Unlocks fitness careers and race prize pools.',
    xpPerSession: 85,
    minAge: 6,
    maxLevel: 100,
    statEffect: { fitness: 3, health: 2, happiness: 2 },
    financePerkUsd: 400,
    careerPerk: 'Athletics & coaching soft unlock',
    unlocks: [
      { level: 5, tag: 'local_races', label: 'Local Races', description: 'Compete for small cash prizes' },
      { level: 15, tag: 'coach_gig', label: 'Coach Gig', description: 'Part-time coaching income' },
      { level: 30, tag: 'pro_circuit', label: 'Pro Circuit', description: 'National competitions' },
    ],
  },
  {
    id: 'sports_basketball',
    label: 'Basketball',
    category: 'sports',
    description: 'Team sport mastery — social + fitness, path to sports jobs.',
    xpPerSession: 90,
    minAge: 8,
    maxLevel: 100,
    statEffect: { fitness: 3, social: 2, happiness: 2 },
    financePerkUsd: 600,
    careerPerk: 'Sports industry network',
    unlocks: [
      { level: 8, tag: 'amateur_league', label: 'Amateur League', description: 'League stipend' },
      { level: 20, tag: 'scout_attention', label: 'Scout Attention', description: 'Career events unlock' },
    ],
  },
  {
    id: 'music_guitar',
    label: 'Guitar',
    category: 'music',
    description: 'Perform, teach, and monetize music. Feeds social media content.',
    xpPerSession: 80,
    minAge: 8,
    maxLevel: 100,
    statEffect: { happiness: 3, social: 2, looks: 1 },
    financePerkUsd: 500,
    careerPerk: 'Music & entertainment',
    unlocks: [
      { level: 6, tag: 'busking', label: 'Busking', description: 'Street performance income' },
      { level: 18, tag: 'studio_session', label: 'Studio Sessions', description: 'Session musician gigs' },
      { level: 35, tag: 'tour_open', label: 'Tour Circuit', description: 'Major performance unlocks' },
    ],
  },
  {
    id: 'music_piano',
    label: 'Piano',
    category: 'music',
    description: 'Classical and contemporary keys — teaching + composition income.',
    xpPerSession: 75,
    minAge: 7,
    maxLevel: 100,
    statEffect: { happiness: 3, intelligence: 2 },
    financePerkUsd: 550,
    careerPerk: 'Music education',
    unlocks: [
      { level: 10, tag: 'teach_lessons', label: 'Teach Lessons', description: 'Weekly student income' },
      { level: 25, tag: 'compose', label: 'Compose', description: 'Royalty-style passive' },
    ],
  },
  {
    id: 'arts_painting',
    label: 'Painting',
    category: 'arts',
    description: 'Create and sell art. Synergizes with collectibles and galleries.',
    xpPerSession: 70,
    minAge: 8,
    maxLevel: 100,
    statEffect: { happiness: 3, looks: 1, intelligence: 1 },
    financePerkUsd: 700,
    careerPerk: 'Art & design careers',
    unlocks: [
      { level: 7, tag: 'gallery_wall', label: 'Gallery Wall', description: 'Sell pieces yearly' },
      { level: 22, tag: 'commission_art', label: 'Commissions', description: 'High-ticket art jobs' },
    ],
  },
  {
    id: 'arts_photography',
    label: 'Photography',
    category: 'arts',
    description: 'Visual storytelling — social media and freelance gigs.',
    xpPerSession: 72,
    minAge: 10,
    maxLevel: 100,
    statEffect: { happiness: 2, social: 2, looks: 1 },
    financePerkUsd: 650,
    careerPerk: 'Media & marketing',
    unlocks: [
      { level: 5, tag: 'photo_freelance', label: 'Freelance Shoots', description: 'Event photography income' },
      { level: 16, tag: 'content_creator', label: 'Content Creator', description: 'Boosts social post quality' },
    ],
  },
  {
    id: 'cooking_baking',
    label: 'Baking',
    category: 'cooking',
    description: 'Kitchen craft — hospitality jobs and small business path.',
    xpPerSession: 68,
    minAge: 8,
    maxLevel: 100,
    statEffect: { happiness: 2, health: 1, social: 1 },
    financePerkUsd: 450,
    careerPerk: 'Food service & F&B',
    unlocks: [
      { level: 8, tag: 'home_bakery', label: 'Home Bakery', description: 'Side income from orders' },
      { level: 20, tag: 'chef_track', label: 'Chef Track', description: 'Culinary career unlocks' },
    ],
  },
  {
    id: 'writing_blogging',
    label: 'Blogging',
    category: 'writing',
    description: 'Build an audience and monetize words. Strong social synergy.',
    xpPerSession: 78,
    minAge: 12,
    maxLevel: 100,
    statEffect: { intelligence: 3, social: 2, ambition: 1 },
    financePerkUsd: 800,
    careerPerk: 'Media, PR, writing jobs',
    unlocks: [
      { level: 5, tag: 'ad_sense', label: 'Blog Ads', description: 'Small ad income' },
      { level: 15, tag: 'newsletter', label: 'Newsletter', description: 'Subscriber revenue' },
      { level: 28, tag: 'book_deal', label: 'Book Deal Path', description: 'Publishing events' },
    ],
  },
  {
    id: 'games_chess',
    label: 'Chess',
    category: 'games',
    description: 'Strategic mind games — intelligence and competition prize money.',
    xpPerSession: 65,
    minAge: 6,
    maxLevel: 100,
    statEffect: { intelligence: 4, ambition: 1 },
    financePerkUsd: 350,
    careerPerk: 'Analytics & strategy roles',
    unlocks: [
      { level: 10, tag: 'club_tournament', label: 'Club Tournaments', description: 'Prize money' },
      { level: 25, tag: 'rated_player', label: 'Rated Player', description: 'Sponsorship offers' },
    ],
  },
  {
    id: 'games_esports',
    label: 'Esports',
    category: 'games',
    description: 'Competitive gaming — streaming and team income.',
    xpPerSession: 88,
    minAge: 12,
    maxLevel: 100,
    statEffect: { intelligence: 2, social: 2, ambition: 2 },
    financePerkUsd: 900,
    careerPerk: 'Gaming & streaming careers',
    unlocks: [
      { level: 6, tag: 'ranked_grind', label: 'Ranked Circuit', description: 'Tournament entries' },
      { level: 18, tag: 'stream_deal', label: 'Stream Deal', description: 'Platform payouts' },
    ],
  },
  {
    id: 'outdoors_hiking',
    label: 'Hiking',
    category: 'outdoors',
    description: 'Wilderness fitness — health and outdoor guide work.',
    xpPerSession: 70,
    minAge: 8,
    maxLevel: 100,
    statEffect: { fitness: 3, health: 2, mentalHealth: 2 },
    financePerkUsd: 300,
    careerPerk: 'Outdoor recreation',
    unlocks: [
      { level: 8, tag: 'trail_guide', label: 'Trail Guide', description: 'Guide fees' },
      { level: 20, tag: 'expedition', label: 'Expeditions', description: 'Sponsored trips' },
    ],
  },
  {
    id: 'collecting_antiques',
    label: 'Antiques',
    category: 'collecting',
    description: 'Find, flip, and appraise — pairs with collectible investing.',
    xpPerSession: 60,
    minAge: 14,
    maxLevel: 100,
    statEffect: { intelligence: 2, wealth: 2, happiness: 1 },
    financePerkUsd: 1000,
    careerPerk: 'Appraisal & trading',
    unlocks: [
      { level: 5, tag: 'flea_flip', label: 'Flea Market Flips', description: 'Trade income' },
      { level: 18, tag: 'appraisal_license', label: 'Appraisal Skill', description: 'Better collectible deals' },
    ],
  },
  {
    id: 'crafts_woodworking',
    label: 'Woodworking',
    category: 'crafts',
    description: 'Build and sell — small manufacturing income.',
    xpPerSession: 66,
    minAge: 12,
    maxLevel: 100,
    statEffect: { fitness: 1, intelligence: 1, happiness: 2 },
    financePerkUsd: 550,
    careerPerk: 'Trades & manufacturing',
    unlocks: [
      { level: 7, tag: 'custom_orders', label: 'Custom Orders', description: 'Commission furniture' },
      { level: 20, tag: 'workshop', label: 'Workshop', description: 'Scale production' },
    ],
  },
  {
    id: 'other_volunteering',
    label: 'Volunteering',
    category: 'other',
    description: 'Karma and networks — nonprofit and civic career paths.',
    xpPerSession: 55,
    minAge: 10,
    maxLevel: 100,
    statEffect: { happiness: 2, social: 2, mentalHealth: 2 },
    financePerkUsd: 0,
    careerPerk: 'Nonprofit & public service',
    unlocks: [
      { level: 5, tag: 'community_lead', label: 'Community Lead', description: 'Karma events' },
      { level: 15, tag: 'ngo_role', label: 'NGO Role', description: 'Career unlocks' },
    ],
  },
  {
    id: 'other_meditation',
    label: 'Meditation',
    category: 'other',
    description: 'Mental resilience — reduces stress and boosts focus careers.',
    xpPerSession: 50,
    minAge: 10,
    maxLevel: 100,
    statEffect: { mentalHealth: 4, happiness: 2, health: 1 },
    financePerkUsd: 200,
    careerPerk: 'Wellness & coaching',
    unlocks: [
      { level: 8, tag: 'mindfulness_coach', label: 'Mindfulness Coach', description: 'Session income' },
      { level: 20, tag: 'retreat_host', label: 'Retreat Host', description: 'Premium wellness events' },
    ],
  },
];

export const HOBBY_MAP = Object.fromEntries(
  HOBBY_CATALOG.map((h) => [h.id, h]),
) as Record<string, HobbyDef>;

export function getHobbiesByCategory(category: HobbyCategory): HobbyDef[] {
  return HOBBY_CATALOG.filter((h) => h.category === category);
}

export interface HobbyCompetitionDef {
  id: string;
  label: string;
  minLevel: number;
  winChanceBase: number;
  cashRewardUsd: number;
  xpReward: number;
  entryCostUsd: number;
  statEffect?: HobbyDef['statEffect'];
}

export const HOBBY_COMPETITIONS: HobbyCompetitionDef[] = [
  {
    id: 'local_showcase',
    label: 'Local Showcase',
    minLevel: 5,
    winChanceBase: 0.45,
    cashRewardUsd: 1200,
    xpReward: 40,
    entryCostUsd: 100,
    statEffect: { happiness: 4 },
  },
  {
    id: 'regional_competition',
    label: 'Regional Competition',
    minLevel: 15,
    winChanceBase: 0.32,
    cashRewardUsd: 6500,
    xpReward: 90,
    entryCostUsd: 400,
    statEffect: { happiness: 6, social: 3 },
  },
  {
    id: 'national_championship',
    label: 'National Championship',
    minLevel: 35,
    winChanceBase: 0.2,
    cashRewardUsd: 28000,
    xpReward: 160,
    entryCostUsd: 1500,
    statEffect: { happiness: 10, ambition: 5 },
  },
];

export const HOBBY_COMPETITION_MAP = Object.fromEntries(
  HOBBY_COMPETITIONS.map((c) => [c.id, c]),
) as Record<string, HobbyCompetitionDef>;

/** Dynamic practice XP: base + level bonus + intelligence/fitness flavor */
export function computePracticeXp(
  def: HobbyDef,
  level: number,
  stats: { intelligence: number; fitness: number },
): number {
  const statBoost = Math.floor((stats.intelligence + stats.fitness) / 40);
  return def.xpPerSession + level * 4 + statBoost * 5;
}
