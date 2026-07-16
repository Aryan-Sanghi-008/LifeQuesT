import type { Character, HobbyProgress } from '../types';
import {
  HOBBY_MAP,
  HOBBY_COMPETITIONS,
  computePracticeXp,
  type HobbyCompetitionDef,
} from '../data/hobbies';
import { clamp } from './economyEngine';
import { scaleEventBankEffect, scaleCountryAmount } from './countryScaleEngine';

export const XP_PER_LEVEL = 100;

export function getHobbyLevel(xp: number): number {
  return Math.min(100, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function getBestHobbyLevelInCategory(
  progress: Record<string, HobbyProgress> | undefined,
  category: string,
): number {
  let best = 0;
  for (const [id, p] of Object.entries(progress ?? {})) {
    const def = HOBBY_MAP[id];
    if (!def || def.category !== category) continue;
    best = Math.max(best, p.level ?? getHobbyLevel(p.xp));
  }
  return best;
}

export function getHobbyProgress(character: Character, hobbyId: string): HobbyProgress {
  return character.hobbyProgress?.[hobbyId] ?? { xp: 0, level: 1, unlockedTags: [] };
}

export function canPracticeHobby(character: Character, hobbyId: string): boolean {
  const def = HOBBY_MAP[hobbyId];
  if (!def) return false;
  if (character.age < def.minAge) return false;
  const progress = getHobbyProgress(character, hobbyId);
  return progress.lastPracticedAge !== character.age;
}

export function canCompeteHobby(character: Character, hobbyId: string): boolean {
  const def = HOBBY_MAP[hobbyId];
  if (!def) return false;
  if (character.age < def.minAge) return false;
  const progress = getHobbyProgress(character, hobbyId);
  if (progress.level < 5) return false;
  return progress.lastCompetedAge !== character.age;
}

export interface PracticeHobbyResult {
  progress: HobbyProgress;
  statPatch: Partial<Character['stats']>;
  xpGained: number;
  newUnlocks: string[];
}

function mergeUnlocks(progress: HobbyProgress, hobbyId: string): { progress: HobbyProgress; newUnlocks: string[] } {
  const def = HOBBY_MAP[hobbyId];
  const tags = new Set(progress.unlockedTags ?? []);
  const newUnlocks: string[] = [];
  for (const u of def?.unlocks ?? []) {
    if (progress.level >= u.level && !tags.has(u.tag)) {
      tags.add(u.tag);
      newUnlocks.push(u.label);
    }
  }
  return {
    progress: { ...progress, unlockedTags: [...tags] },
    newUnlocks,
  };
}

export function practiceHobby(character: Character, hobbyId: string): PracticeHobbyResult | null {
  const def = HOBBY_MAP[hobbyId];
  if (!def || !canPracticeHobby(character, hobbyId)) return null;

  const current = getHobbyProgress(character, hobbyId);
  const xpGained = computePracticeXp(def, current.level, character.stats);
  const xp = current.xp + xpGained;
  const level = getHobbyLevel(xp);

  const statPatch: Partial<Character['stats']> = {};
  for (const [key, val] of Object.entries(def.statEffect)) {
    if (val !== undefined && key in character.stats) {
      const k = key as keyof Character['stats'];
      statPatch[k] = clamp(character.stats[k] + val);
    }
  }

  const merged = mergeUnlocks(
    { xp, level, lastPracticedAge: character.age, unlockedTags: current.unlockedTags },
    hobbyId,
  );

  return {
    progress: merged.progress,
    statPatch,
    xpGained,
    newUnlocks: merged.newUnlocks,
  };
}

export function getEligibleCompetitions(_hobbyId: string, level: number): HobbyCompetitionDef[] {
  return HOBBY_COMPETITIONS.filter((c) => level >= c.minLevel);
}

export interface CompeteHobbyResult {
  ok: boolean;
  message: string;
  progress?: HobbyProgress;
  cashDelta?: number;
  won?: boolean;
  bankBalance?: number;
  debt?: number;
  statPatch?: Partial<Character['stats']>;
}

/** Player-started compete / perform action (once per hobby per year). */
export function competeHobby(
  character: Character,
  hobbyId: string,
  competitionId: string,
): CompeteHobbyResult {
  const def = HOBBY_MAP[hobbyId];
  if (!def) return { ok: false, message: 'Unknown hobby.' };
  if (!canCompeteHobby(character, hobbyId)) {
    return { ok: false, message: 'Already competed this year, or level too low (need 5+).' };
  }
  const progress = getHobbyProgress(character, hobbyId);
  const comp = HOBBY_COMPETITIONS.find((c) => c.id === competitionId);
  if (!comp || progress.level < comp.minLevel) {
    return { ok: false, message: 'Competition not unlocked yet.' };
  }
  const cc = character.countryCode ?? 'US';
  const entryCost = scaleCountryAmount(comp.entryCostUsd, cc, 'cost');
  if (character.bankBalance + (character.debt ?? 0) < 0 && character.bankBalance < entryCost) {
    return { ok: false, message: 'Cannot afford entry fee.' };
  }
  if (character.bankBalance < entryCost) {
    return { ok: false, message: `Need ${entryCost} for entry.` };
  }

  const won = Math.random() < comp.winChanceBase + progress.level / 220;
  const prize = won ? scaleEventBankEffect(comp.cashRewardUsd, cc, 'gift') : 0;
  const xp = progress.xp + (won ? comp.xpReward : Math.floor(comp.xpReward * 0.35));
  const level = getHobbyLevel(xp);
  let next: HobbyProgress = {
    ...progress,
    xp,
    level,
    lastCompetedAge: character.age,
  };
  const merged = mergeUnlocks(next, hobbyId);
  next = merged.progress;

  const statPatch: Partial<Character['stats']> = {};
  if (won && comp.statEffect) {
    for (const [key, val] of Object.entries(comp.statEffect)) {
      if (val !== undefined && key in character.stats) {
        const k = key as keyof Character['stats'];
        statPatch[k] = clamp(character.stats[k] + val);
      }
    }
  }

  const cashDelta = prize - entryCost;
  return {
    ok: true,
    message: won
      ? `Won ${comp.label}! Prize net ${cashDelta >= 0 ? '+' : ''}${cashDelta}.`
      : `Entered ${comp.label} — didn't place. Entry fee paid.`,
    progress: next,
    cashDelta,
    won,
    bankBalance: character.bankBalance + cashDelta,
    debt: character.debt,
    statPatch,
  };
}

export interface CompetitionTickResult {
  hobbyId: string;
  competition: HobbyCompetitionDef;
  won: boolean;
  cashDelta: number;
  progress: HobbyProgress;
  statPatch: Partial<Character['stats']>;
  message: string;
}

/** Passive rare invite (lower chance) — player-started compete is primary. */
export function tickHobbyCompetitions(character: Character): CompetitionTickResult[] {
  const results: CompetitionTickResult[] = [];
  const cc = character.countryCode ?? 'US';

  for (const [hobbyId, progress] of Object.entries(character.hobbyProgress ?? {})) {
    const level = progress.level ?? getHobbyLevel(progress.xp);
    const comps = getEligibleCompetitions(hobbyId, level);
    for (const comp of comps) {
      if (Math.random() > 0.04) continue;
      const won = Math.random() < comp.winChanceBase + level / 250;
      const cashDelta = won ? scaleEventBankEffect(comp.cashRewardUsd, cc, 'gift') : 0;
      const xp = progress.xp + (won ? comp.xpReward : Math.floor(comp.xpReward * 0.2));
      const nextProgress: HobbyProgress = {
        xp,
        level: getHobbyLevel(xp),
        lastPracticedAge: progress.lastPracticedAge,
        lastCompetedAge: progress.lastCompetedAge,
        unlockedTags: progress.unlockedTags,
      };
      const statPatch: Partial<Character['stats']> = {};
      if (won && comp.statEffect) {
        for (const [key, val] of Object.entries(comp.statEffect)) {
          if (val !== undefined && key in character.stats) {
            const k = key as keyof Character['stats'];
            statPatch[k] = clamp(character.stats[k] + val);
          }
        }
      }
      results.push({
        hobbyId,
        competition: comp,
        won,
        cashDelta,
        progress: nextProgress,
        statPatch,
        message: won
          ? `Invited to ${comp.label} and won!`
          : `Invited to ${comp.label} — experience gained.`,
      });
    }
  }
  return results;
}

export function tickHobbyDecay(character: Character): Record<string, HobbyProgress> {
  const next: Record<string, HobbyProgress> = { ...(character.hobbyProgress ?? {}) };
  for (const [id, progress] of Object.entries(next)) {
    const last = progress.lastPracticedAge ?? 0;
    if (character.age - last > 3) {
      const xp = Math.max(0, progress.xp - 5);
      next[id] = { ...progress, xp, level: getHobbyLevel(xp) };
    }
  }
  return next;
}

/** Annual finance perk cash from leveled hobbies */
export function hobbyAnnualFinanceBonus(character: Character): number {
  const cc = character.countryCode ?? 'US';
  let total = 0;
  for (const [id, progress] of Object.entries(character.hobbyProgress ?? {})) {
    const def = HOBBY_MAP[id];
    if (!def?.financePerkUsd || progress.level < 5) continue;
    const scale = 0.5 + progress.level / 50;
    total += scaleCountryAmount(Math.round(def.financePerkUsd * scale), cc, 'salary');
  }
  return total;
}
