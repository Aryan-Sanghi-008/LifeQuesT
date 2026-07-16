import { TRAITS } from './gameData';

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  brilliant: '+20 Intelligence · +8 career aptitude',
  charming: '+20 Social · +8% relationship success',
  athletic: '+20 Fitness · +5 longevity score',
  creative: '+15 Mind, +10 Joy · +10% unique events',
  lucky: 'PLUS: +20% roll success · +15 career aptitude',
  ambitious: '+20 Ambition · +10% career events',
  resilient: '+15 Health, +10 MH · −15% health event damage',
  witty: '+15 Social, +10 Mind · +6% roll success',
  disciplined: '+15 Fitness, +10 Ambition · +5% focus gains',
  empathetic: '+15 Social · +5% relationships',
  reckless: '+15 Ambition, −10 Health · more crime events',
  stoic: 'PLUS: −50% MH loss · crime stress immunity',
  magnetic: 'PLUS: +20 Looks, +10 Social · +15% relations · +20% social income',
  studious: '+20 Intelligence · education & career boost',
  generous: '+15 Happiness, +10 Social · +2 karma from giving',
};

export const TRAITS_WITH_DESCRIPTIONS = TRAITS.map((t) => ({
  ...t,
  description: TRAIT_DESCRIPTIONS[t.id] ?? t.description,
}));

export type TraitWithDescription = (typeof TRAITS_WITH_DESCRIPTIONS)[number];
