import type { Character, HobbyProgress } from '../types';
import { HOBBY_MAP } from '../data/hobbies';
import { clamp } from './economyEngine';

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

export function getEligibleCompetitions(_hobbyId: string, level: number): string[] {
  if (level >= 50) return ['national_championship'];
  if (level >= 25) return ['regional_competition'];
  if (level >= 10) return ['local_showcase'];
  return [];
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
