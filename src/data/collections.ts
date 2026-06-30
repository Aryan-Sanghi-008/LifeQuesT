import { CollectionItem } from "@/types";
import { ACHIEVEMENTS } from "./achievements";
import { SCENARIOS } from "./scenarios";
import { COLORS } from "@theme";
import { LIFE_MOMENT_ITEMS } from "./collections/lifeMoments";

export { COLLECTION_SETS } from "./collections/sets";
export { LIFE_MOMENT_ITEMS, LIFE_MOMENT_COUNT } from "./collections/lifeMoments";

const achievementItems: CollectionItem[] = ACHIEVEMENTS.map((a) => ({
  id: `achievement_${a.id}`,
  category: "achievement",
  name: a.label,
  description: a.description,
  iconKey: "trophy",
  accentColor: a.color,
  rarity: "common" as const,
}));

const cosmeticItems: CollectionItem[] = [
  { id: "cosmetic_adventurer", category: "cosmetic", name: "Adventurer", description: "The default adventurer avatar style.", iconKey: "avatar", accentColor: COLORS.sapphire, rarity: "common" },
  { id: "cosmetic_lorelei", category: "cosmetic", name: "Lorelei", description: "Elegant and expressive character style.", iconKey: "avatar", accentColor: COLORS.orchid, rarity: "uncommon" },
  { id: "cosmetic_bottts", category: "cosmetic", name: "Bottts", description: "Robot-inspired avatar style.", iconKey: "avatar", accentColor: COLORS.teal, rarity: "uncommon" },
  { id: "cosmetic_notionists", category: "cosmetic", name: "Notionists", description: "Clean minimalist character design.", iconKey: "avatar", accentColor: COLORS.emerald, rarity: "rare" },
  { id: "cosmetic_big_smile", category: "cosmetic", name: "Big Smile", description: "Cheerful and expressive style.", iconKey: "avatar", accentColor: COLORS.gold, rarity: "common" },
];

const scenarioItems: CollectionItem[] = SCENARIOS.map((s) => ({
  id: `scenario_${s.id}`,
  category: "scenario",
  name: s.name,
  description: s.tagline,
  iconKey: "scenario",
  accentColor: s.accentColor,
  rarity: s.locked ? ("epic" as const) : ("common" as const),
}));

const badgeItems: CollectionItem[] = [
  { id: "badge_streak_7", category: "badge", name: "Week Warrior", description: "Maintained a 7-day login streak.", iconKey: "streak", accentColor: COLORS.gold, rarity: "common" },
  { id: "badge_streak_30", category: "badge", name: "Monthly Devotee", description: "Maintained a 30-day login streak.", iconKey: "streak", accentColor: COLORS.gold2, rarity: "rare" },
  { id: "badge_streak_100", category: "badge", name: "Century Streak", description: "Maintained a 100-day login streak.", iconKey: "streak", accentColor: COLORS.gold3, rarity: "legendary" },
  { id: "badge_season_pass", category: "badge", name: "Season Pass Holder", description: "Unlocked the premium season pass.", iconKey: "pass", accentColor: COLORS.orchid, rarity: "uncommon" },
  { id: "badge_prestige", category: "badge", name: "Prestige Legend", description: "Completed a prestige run.", iconKey: "prestige", accentColor: COLORS.crimson, rarity: "epic" },
];

export const ALL_COLLECTION_ITEMS: CollectionItem[] = [
  ...LIFE_MOMENT_ITEMS,
  ...achievementItems,
  ...cosmeticItems,
  ...scenarioItems,
  ...badgeItems,
];

/** @deprecated Use evaluateUnlockedCollectionIds from collectionsEngine */
export function hydrateUnlockedCollectionIds(character: {
  achievements: string[];
  unlockedAvatarStyles?: string[];
  hasSeasonPass?: boolean;
  dailyStreak?: number;
  prestigeLevel?: number;
}): string[] {
  const unlocked = new Set<string>();
  for (const achId of character.achievements) unlocked.add(`achievement_${achId}`);
  const styles = character.unlockedAvatarStyles ?? ["adventurer"];
  for (const style of styles) unlocked.add(`cosmetic_${style.replace(/-/g, "_")}`);
  unlocked.add("scenario_classic");
  if (character.hasSeasonPass) unlocked.add("badge_season_pass");
  const streak = character.dailyStreak ?? 0;
  if (streak >= 7) unlocked.add("badge_streak_7");
  if (streak >= 30) unlocked.add("badge_streak_30");
  if (streak >= 100) unlocked.add("badge_streak_100");
  if ((character.prestigeLevel ?? 0) > 0) unlocked.add("badge_prestige");
  return Array.from(unlocked);
}
