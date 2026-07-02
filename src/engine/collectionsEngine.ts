import { Character, CollectionSet } from '@/types';
import { COLLECTION_SETS } from '@data/collections/sets';
import { ALL_COLLECTION_ITEMS } from '@data/collections';
import { LIFE_MOMENT_ITEMS } from '@data/collections/lifeMoments';

function countCountriesLived(character: Character): number {
  const list = character.countriesLived ?? [];
  if (list.length > 0) return list.length;
  return character.countryCode ? 1 : 0;
}

function countTravelEvents(character: Character): number {
  return character.eventHistory.filter((e) => e.id.startsWith('trv_')).length;
}

function evalUnlockKey(character: Character, key: string): boolean {
  const [type, raw] = key.split(':');
  const n = Number(raw);

  switch (type) {
    case 'travel_count':
      return countTravelEvents(character) >= n;
    case 'countries_lived':
      return countCountriesLived(character) >= n;
    case 'business_count':
      return character.businesses.length >= n;
    case 'wealth_stat':
      return character.stats.wealth >= n * 15;
    case 'degree_count':
      return character.degreeIds.length >= n;
    case 'cert_count':
      return character.certificationIds.length >= n;
    case 'children_count':
      return character.children >= n;
    case 'relationships_stat':
      return character.stats.social >= n * 15;
    case 'heat_level':
      return (character.heatLevel ?? 0) >= n * 10;
    case 'family_rep':
      return character.familyReputation >= n * 10;
    case 'health_stat':
      return character.stats.health >= n * 10;
    case 'followers':
      return character.socialFollowers >= n * 1000;
    case 'age_min':
      return character.age >= 20 + n * 10;
    case 'age_exact':
      return character.age >= n * 10;
    case 'generation':
      return (character.generation ?? 1) >= n;
    case 'career_years':
      return character.totalCareerYears >= n * 3;
    case 'karma_min':
      return character.karma >= 40 + n * 5;
    case 'karma_max':
      return character.karma <= 60 - n * 5;
    case 'daily_streak':
      return (character.dailyStreak ?? 0) >= n;
    case 'season_pass':
      return character.hasSeasonPass === true;
    case 'near_death':
      return character.eventHistory.some((e) =>
        e.title.toLowerCase().includes('near death') ||
        e.title.toLowerCase().includes('hospital') ||
        e.id.includes('death'),
      );
    case 'health_recover':
      return character.stats.health >= 70 && character.age > 40;
    case 'achievement':
      return character.achievements.includes(raw);
    default:
      return false;
  }
}

/** Evaluate all collection unlocks for a character (legacy + life moments). */
export function evaluateUnlockedCollectionIds(
  character: Character,
  prestigeLevel = 0,
): string[] {
  const unlocked = new Set<string>();

  for (const achId of character.achievements) {
    unlocked.add(`achievement_${achId}`);
  }

  const styles = character.unlockedAvatarStyles ?? ['adventurer'];
  for (const style of styles) {
    unlocked.add(`cosmetic_${style.replace(/-/g, '_')}`);
  }

  unlocked.add('scenario_classic');
  if (character.hasSeasonPass) unlocked.add('badge_season_pass');

  const streak = character.dailyStreak ?? 0;
  if (streak >= 7) unlocked.add('badge_streak_7');
  if (streak >= 30) unlocked.add('badge_streak_30');
  if (streak >= 100) unlocked.add('badge_streak_100');
  if (prestigeLevel > 0) unlocked.add('badge_prestige');

  for (const item of LIFE_MOMENT_ITEMS) {
    if (item.unlockKey && evalUnlockKey(character, item.unlockKey)) {
      unlocked.add(item.id);
    }
  }

  return Array.from(unlocked);
}

export function getSetProgress(
  setId: string,
  unlockedIds: string[],
): { unlocked: number; total: number } {
  const items = ALL_COLLECTION_ITEMS.filter((i) => i.setId === setId);
  const unlocked = items.filter((i) => unlockedIds.includes(i.id)).length;
  return { unlocked, total: items.length };
}

export function getCompletedSets(
  unlockedIds: string[],
  alreadyClaimed: string[],
): CollectionSet[] {
  return COLLECTION_SETS.filter((set) => {
    if (alreadyClaimed.includes(set.id)) return false;
    const { unlocked, total } = getSetProgress(set.id, unlockedIds);
    return total > 0 && unlocked >= total;
  });
}

export function applyCollectionSetReward(set: CollectionSet): {
  coins: number;
  gems: number;
  title: string;
} {
  return {
    coins: set.coinReward,
    gems: set.gemReward ?? 0,
    title: set.titleReward,
  };
}
