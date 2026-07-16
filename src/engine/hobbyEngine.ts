import type { Character, HobbyProgress } from '../types';
import { HOBBY_MAP, HOBBY_COMPETITIONS, type HobbyCompetitionDef } from '../data/hobbies';
import { clamp } from './economyEngine';
import { scaleEventBankEffect } from './countryScaleEngine';

export const XP_PER_LEVEL = 100;

export function getHobbyLevel(xp: number): number {
  return Math.min(100, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function getHobbyProgress(character: Character, hobbyId: string): HobbyProgress {
  return character.hobbyProgress?.[hobbyId] ?? { xp: 0, level: 1 };
}

export function canPracticeHobby(character: Character, hobbyId: string): boolean {
  const def = HOBBY_MAP[hobbyId];
  if (!def) return false;
  if (character.age < def.minAge) return false;
  const progress = getHobbyProgress(character, hobbyId);
  return progress.lastPracticedAge !== character.age;
}

export interface PracticeHobbyResult {
  progress: HobbyProgress;
  statPatch: Partial<Character['stats']>;
}

export function practiceHobby(character: Character, hobbyId: string): PracticeHobbyResult | null {
  const def = HOBBY_MAP[hobbyId];
  if (!def || !canPracticeHobby(character, hobbyId)) return null;

  const current = getHobbyProgress(character, hobbyId);
  const xp = current.xp + def.xpPerSession;
  const level = getHobbyLevel(xp);

  const statPatch: Partial<Character['stats']> = {};
  for (const [key, val] of Object.entries(def.statEffect)) {
    if (val !== undefined && key in character.stats) {
      const k = key as keyof Character['stats'];
      statPatch[k] = clamp(character.stats[k] + val);
    }
  }

  return {
    progress: { xp, level, lastPracticedAge: character.age },
    statPatch,
  };
}

export function getEligibleCompetitions(_hobbyId: string, level: number): HobbyCompetitionDef[] {
  return HOBBY_COMPETITIONS.filter(c => level >= c.minLevel);
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

export function tickHobbyCompetitions(character: Character): CompetitionTickResult[] {
  const results: CompetitionTickResult[] = [];
  const cc = character.countryCode ?? 'US';

  for (const [hobbyId, progress] of Object.entries(character.hobbyProgress ?? {})) {
    const level = progress.level ?? getHobbyLevel(progress.xp);
    const comps = getEligibleCompetitions(hobbyId, level);
    for (const comp of comps) {
      if (Math.random() > 0.12) continue;
      const won = Math.random() < comp.winChanceBase + level / 250;
      const cashDelta = won
        ? scaleEventBankEffect(comp.cashRewardUsd, cc, 'gift')
        : 0;
      const xp = progress.xp + (won ? comp.xpReward : Math.floor(comp.xpReward * 0.2));
      const nextProgress: HobbyProgress = {
        xp,
        level: getHobbyLevel(xp),
        lastPracticedAge: progress.lastPracticedAge,
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
          ? `You won ${comp.label} in ${HOBBY_MAP[hobbyId]?.label ?? hobbyId}!`
          : `You competed in ${comp.label} — good effort, keep practicing.`,
      });
      break;
    }
  }
  return results;
}

export function tickHobbyDecay(character: Character): Record<string, HobbyProgress> {
  const next = { ...character.hobbyProgress };
  for (const [id, progress] of Object.entries(next)) {
    if (progress.lastPracticedAge !== undefined && character.age - progress.lastPracticedAge > 3) {
      next[id] = { ...progress, xp: Math.max(0, progress.xp - 5) };
    }
  }
  return next;
}

export function getBestHobbyLevelInCategory(
  hobbyProgress: Character['hobbyProgress'] | undefined,
  category: string,
): number {
  let best = 0;
  for (const [id, progress] of Object.entries(hobbyProgress ?? {})) {
    if (HOBBY_MAP[id]?.category !== category) continue;
    best = Math.max(best, progress.level ?? getHobbyLevel(progress.xp));
  }
  return best;
}
