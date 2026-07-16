import { AvatarId, Activity, ActivityCategory } from '../types';
import { ACHIEVEMENTS, ACHIEVEMENT_COIN_REWARDS, ACHIEVEMENT_GEM_REWARDS } from './achievements';

export { CORE_LIFE_EVENTS, LIFE_EVENTS } from './events/lifeEvents';

export { ACHIEVEMENTS, ACHIEVEMENT_COIN_REWARDS, ACHIEVEMENT_GEM_REWARDS };

// ─── Avatars (legacy) ─────────────────────────────────────────────────────────
export const AVATARS: Array<{ id: AvatarId; label: string }> = [
  { id: 'male_1',   label: 'Young Man'   },
  { id: 'female_1', label: 'Young Woman' },
  { id: 'male_2',   label: 'Man'         },
  { id: 'female_2', label: 'Woman'       },
];

// ─── Countries ───────────────────────────────────────────────────────────────
export type CountryRegion =
  | 'asia'
  | 'middle_east'
  | 'europe'
  | 'americas'
  | 'africa'
  | 'oceania';

export interface CountryDef {
  code: string;
  flag: string;
  name: string;
  wealthMod: number;
  region: CountryRegion;
}

export const COUNTRY_REGIONS: { id: CountryRegion; label: string }[] = [
  { id: 'asia', label: 'Asia' },
  { id: 'middle_east', label: 'Middle East' },
  { id: 'europe', label: 'Europe' },
  { id: 'americas', label: 'Americas' },
  { id: 'africa', label: 'Africa' },
  { id: 'oceania', label: 'Oceania' },
];

export const COUNTRIES: CountryDef[] = [
  // Asia
  { code: 'IN', flag: '🇮🇳', name: 'India',         wealthMod: 0,   region: 'asia' },
  { code: 'CN', flag: '🇨🇳', name: 'China',          wealthMod: 8,   region: 'asia' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',          wealthMod: 12,  region: 'asia' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea',    wealthMod: 12,  region: 'asia' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',      wealthMod: 22,  region: 'asia' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia',       wealthMod: 5,   region: 'asia' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand',       wealthMod: 2,   region: 'asia' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam',        wealthMod: -2,  region: 'asia' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines',    wealthMod: -3,  region: 'asia' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia',      wealthMod: 0,   region: 'asia' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan',       wealthMod: -8,  region: 'asia' },
  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh',     wealthMod: -10, region: 'asia' },
  // Middle East
  { code: 'AE', flag: '🇦🇪', name: 'UAE',            wealthMod: 25,  region: 'middle_east' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',   wealthMod: 20,  region: 'middle_east' },
  { code: 'TR', flag: '🇹🇷', name: 'Turkey',         wealthMod: 3,   region: 'middle_east' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel',         wealthMod: 18,  region: 'middle_east' },
  // Europe
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', wealthMod: 15,  region: 'europe' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',        wealthMod: 18,  region: 'europe' },
  { code: 'FR', flag: '🇫🇷', name: 'France',         wealthMod: 16,  region: 'europe' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain',          wealthMod: 12,  region: 'europe' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy',          wealthMod: 12,  region: 'europe' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands',    wealthMod: 18,  region: 'europe' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden',         wealthMod: 20,  region: 'europe' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway',         wealthMod: 22,  region: 'europe' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland',    wealthMod: 25,  region: 'europe' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland',         wealthMod: 8,   region: 'europe' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia',         wealthMod: 5,   region: 'europe' },
  // Americas
  { code: 'US', flag: '🇺🇸', name: 'USA',            wealthMod: 20,  region: 'americas' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',         wealthMod: 18,  region: 'americas' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico',         wealthMod: 0,   region: 'americas' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil',         wealthMod: -5,  region: 'americas' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina',      wealthMod: -2,  region: 'americas' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia',       wealthMod: -5,  region: 'americas' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile',          wealthMod: 2,   region: 'americas' },
  // Africa
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria',        wealthMod: -10, region: 'africa' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa',   wealthMod: -5,  region: 'africa' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt',          wealthMod: -5,  region: 'africa' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya',          wealthMod: -8,  region: 'africa' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana',          wealthMod: -8,  region: 'africa' },
  { code: 'ET', flag: '🇪🇹', name: 'Ethiopia',       wealthMod: -12, region: 'africa' },
  // Oceania
  { code: 'AU', flag: '🇦🇺', name: 'Australia',      wealthMod: 15,  region: 'oceania' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand',    wealthMod: 15,  region: 'oceania' },
];

export function getCountriesByRegion(region: CountryRegion): CountryDef[] {
  return COUNTRIES.filter((c) => c.region === region);
}

export function getCountryRegion(countryCode: string): CountryRegion {
  return COUNTRIES.find((c) => c.code === countryCode)?.region ?? 'asia';
}

// ─── Zodiac Signs ────────────────────────────────────────────────────────────
export const ZODIACS = [
  { id: 'aries',       label: 'Aries',       bonusStat: 'ambition'     },
  { id: 'taurus',      label: 'Taurus',      bonusStat: 'wealth'       },
  { id: 'gemini',      label: 'Gemini',      bonusStat: 'social'       },
  { id: 'cancer',      label: 'Cancer',      bonusStat: 'happiness'    },
  { id: 'leo',         label: 'Leo',         bonusStat: 'looks'        },
  { id: 'virgo',       label: 'Virgo',       bonusStat: 'intelligence' },
  { id: 'libra',       label: 'Libra',       bonusStat: 'social'       },
  { id: 'scorpio',     label: 'Scorpio',     bonusStat: 'ambition'     },
  { id: 'sagittarius', label: 'Sagittarius', bonusStat: 'happiness'    },
  { id: 'capricorn',   label: 'Capricorn',   bonusStat: 'intelligence' },
  { id: 'aquarius',    label: 'Aquarius',    bonusStat: 'intelligence' },
  { id: 'pisces',      label: 'Pisces',      bonusStat: 'happiness'    },
];

// ─── Starting Traits ─────────────────────────────────────────────────────────
export const TRAITS = [
  { id: 'brilliant', label: 'Brilliant',  description: '+20 Intelligence from birth', statEffect: { intelligence: 20 }, premiumOnly: false },
  { id: 'charming',  label: 'Charming',   description: '+20 Social from birth',       statEffect: { social: 20 }, premiumOnly: false },
  { id: 'athletic',  label: 'Athletic',   description: '+20 Fitness from birth',      statEffect: { fitness: 20 }, premiumOnly: false },
  { id: 'creative',  label: 'Creative',   description: '+15 Mind, +10 Joy',           statEffect: { intelligence: 15, happiness: 10 }, premiumOnly: false },
  { id: 'lucky',     label: 'Lucky',      description: '+10% success chance on all rolls', statEffect: {}, premiumOnly: true },
  { id: 'ambitious', label: 'Ambitious',  description: '+20 Ambition from birth',     statEffect: { ambition: 20 }, premiumOnly: false },
  { id: 'resilient', label: 'Resilient',  description: '+15 Health, +10 Mental Health', statEffect: { health: 15, mentalHealth: 10 }, premiumOnly: false },
  { id: 'witty',     label: 'Witty',      description: '+15 Social, +10 Intelligence', statEffect: { social: 15, intelligence: 10 }, premiumOnly: false },
  { id: 'disciplined', label: 'Disciplined', description: '+15 Fitness, +10 Ambition', statEffect: { fitness: 15, ambition: 10 }, premiumOnly: false },
  { id: 'empathetic', label: 'Empathetic', description: '+15 Social, +10 Karma start', statEffect: { social: 15, happiness: 10 }, premiumOnly: false },
  { id: 'reckless',  label: 'Reckless',   description: '+15 Ambition, -10 Health',    statEffect: { ambition: 15, health: -10 }, premiumOnly: false },
  { id: 'stoic',     label: 'Stoic',      description: '+20 Mental Health',           statEffect: { mentalHealth: 20 }, premiumOnly: true },
  { id: 'magnetic',  label: 'Magnetic',   description: '+20 Looks, +10 Social',       statEffect: { looks: 20, social: 10 }, premiumOnly: true },
  { id: 'studious',  label: 'Studious',   description: '+20 Intelligence, +5 Mental Health', statEffect: { intelligence: 20, mentalHealth: 5 }, premiumOnly: false },
  { id: 'generous',  label: 'Generous',   description: '+15 Happiness, +10 Social',   statEffect: { happiness: 15, social: 10 }, premiumOnly: false },
];

// ─── Family Backgrounds ──────────────────────────────────────────────────────
export const FAMILY_BACKGROUNDS = [
  { id: 'poor',    label: 'Humble Roots', description: 'Struggle builds strength',   wealthStart: 5,  icon: 'humble'  },
  { id: 'middle',  label: 'Middle Class', description: 'Grounded, balanced start',   wealthStart: 30, icon: 'middle'  },
  { id: 'wealthy', label: 'Well-Off',     description: 'Born into comfort',          wealthStart: 65, icon: 'wealthy' },
  { id: 'royalty', label: 'Royalty',      description: 'Privilege under pressure',   wealthStart: 90, icon: 'royalty' },
] as const;

// ─── Achievements ────────────────────────────────────────────────────────────
// ─── Achievements (see achievements.ts) ───────────────────────────────────────


// ─── Death Causes ─────────────────────────────────────────────────────────────
export const DEATH_CAUSES = [
  { minAge: 0,  maxAge: 25,  cause: 'a tragic accident' },
  { minAge: 26, maxAge: 50,  cause: 'a sudden illness' },
  { minAge: 51, maxAge: 70,  cause: 'heart failure' },
  { minAge: 71, maxAge: 85,  cause: 'natural causes' },
  { minAge: 86, maxAge: 120, cause: 'peacefully in sleep, surrounded by family' },
] as const;

// ─── IAP Products (legacy display) — canonical catalog: src/data/iapCatalog.ts ───
export const IAP_PRODUCTS = [
  {
    id: 'premium_monthly',
    title: 'LifeQuest Premium',
    description: 'No ads, all life paths, 3x boosts',
    price: '₹299',
    priceSub: '/month',
    badge: 'BEST VALUE',
    perks: [
      'Remove all ads forever',
      'Unlock all 50+ life paths',
      '3x stat boosts per age',
      'Exclusive legendary events',
      'Priority reincarnation scrolls',
    ],
  },
  { id: 'remove_ads',    title: 'Remove Ads',          price: '₹199', description: 'One-time. Clean forever.',          icon: 'no-ads'  },
  { id: 'coins_small',   title: '10,000 Coins',        price: '₹99',  description: 'Boosts, potions & luck',           icon: 'coins'   },
  { id: 'luck_boost',    title: 'Luck Boost ×3',       price: '500c', description: 'Better outcomes for 3 events',    icon: 'luck'    },
  { id: 'reincarnation_scroll', title: 'Reincarnation Scroll', price: '₹49', description: 'Carry 3 stats into your next life',icon: 'scroll'  },
  { id: 'gems_small',    title: '25 Gems',             price: '₹149', description: 'Premium currency for rare items', icon: 'gems'    },
] as const;

// ─── Activities ───────────────────────────────────────────────────────────────
export const ACTIVITIES: Activity[] = [
  {
    id: 'gym',
    label: 'Go to Gym',
    description: 'Push your body and clear your mind.',
    category: 'body' as ActivityCategory,
    minAge: 14, maxAge: 80,
    cost: 1000,
    statEffect: { fitness: 5, health: 3, happiness: 5 },
    failStatEffect: { health: -5, happiness: -5 },
    successChance: 85,
  },
  {
    id: 'library',
    label: 'Visit Library',
    description: 'A few hours deep in a good book.',
    category: 'mind' as ActivityCategory,
    minAge: 8, maxAge: 90,
    statEffect: { intelligence: 5, happiness: 3 },
  },
  {
    id: 'meditate',
    label: 'Meditate',
    description: 'Breathe. Let the noise fade.',
    category: 'mind' as ActivityCategory,
    minAge: 12, maxAge: 90,
    statEffect: { happiness: 8, health: 3 },
  },
  {
    id: 'party',
    label: 'Go to a Party',
    description: 'Loud music, new faces, questionable decisions.',
    category: 'social' as ActivityCategory,
    minAge: 16, maxAge: 55,
    cost: 2000,
    statEffect: { social: 10, happiness: 10, health: -3 },
  },
  {
    id: 'travel',
    label: 'Weekend Getaway',
    description: 'A short trip to recharge.',
    category: 'misc' as ActivityCategory,
    minAge: 18, maxAge: 80,
    bankEffect: -5000,
    statEffect: { happiness: 15, social: 5, health: 5 },
  },
  {
    id: 'doctor',
    label: 'See a Doctor',
    description: 'Better safe than sorry.',
    category: 'health' as ActivityCategory,
    minAge: 0, maxAge: 100,
    bankEffect: -2000,
    statEffect: { health: 10 },
  },
  {
    id: 'online_course',
    label: 'Take Online Course',
    description: 'Learn something new at your own pace.',
    category: 'mind' as ActivityCategory,
    minAge: 14, maxAge: 70,
    bankEffect: -1500,
    statEffect: { intelligence: 8, ambition: 5 },
  },
  {
    id: 'side_hustle',
    label: 'Work on Side Project',
    description: 'A few extra hours building something for yourself.',
    category: 'financial' as ActivityCategory,
    minAge: 18, maxAge: 65,
    statEffect: { ambition: 8, happiness: 5, health: -3 },
    bankEffect: 3000,
    successChance: 70,
  },
  {
    id: 'adopt_pet',
    label: 'Adopt a Pet',
    description: 'A new companion for the journey.',
    category: 'social' as ActivityCategory,
    minAge: 18, maxAge: 70,
    bankEffect: -5000,
    statEffect: { happiness: 20, health: 5 },
    addsPerson: 'pet',
  },
  {
    id: 'volunteer',
    label: 'Volunteer Work',
    description: 'Give back. The world is bigger than your problems.',
    category: 'social' as ActivityCategory,
    minAge: 14, maxAge: 85,
    statEffect: { karma: 15, happiness: 12, social: 8 },
  },
  {
    id: 'crime_petty',
    label: 'Petty Crime',
    description: 'Quick cash, big risk. Is it worth it?',
    category: 'illegal' as ActivityCategory,
    minAge: 16, maxAge: 50,
    statEffect: { karma: -15, health: -5 },
    bankEffect: 5000,
    successChance: 60,
    failStatEffect: { karma: -25, happiness: -20 },
  },
  {
    id: 'spa',
    label: 'Spa Day',
    description: 'Pamper yourself. You deserve it.',
    category: 'body' as ActivityCategory,
    minAge: 18, maxAge: 80,
    bankEffect: -3000,
    statEffect: { happiness: 15, looks: 5, health: 5 },
  },
  {
    id: 'invest_stocks',
    label: 'Invest in Stocks',
    description: 'The market is always a gamble.',
    category: 'financial' as ActivityCategory,
    minAge: 18, maxAge: 75,
    bankEffect: -10000,
    statEffect: { ambition: 8 },
    successChance: 55,
  },
];


export const SEASON_PASS_TIERS = [
  { tier: 1, xpRequired: 0, rewardCoins: 45 },
  { tier: 2, xpRequired: 100, rewardCoins: 65 },
  { tier: 3, xpRequired: 250, rewardCoins: 85, rewardLuckBoosts: 1 },
  { tier: 4, xpRequired: 450, rewardCoins: 105 },
  { tier: 5, xpRequired: 700, rewardCoins: 125, rewardGems: 5, rewardTickets: 1 },
  { tier: 6, xpRequired: 1000, rewardCoins: 150 },
  { tier: 7, xpRequired: 1350, rewardCoins: 170, rewardLuckBoosts: 1 },
  { tier: 8, xpRequired: 1750, rewardCoins: 195 },
  { tier: 9, xpRequired: 2200, rewardCoins: 215, rewardGems: 10 },
  { tier: 10, xpRequired: 2700, rewardCoins: 425, rewardLuckBoosts: 2, rewardTickets: 1 },
];
