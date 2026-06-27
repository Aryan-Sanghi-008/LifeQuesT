import type { AspirationId, Character, CharacterAspirations, LifeEvent } from '../types';
import { ASPIRATION_MAP } from '../data/aspirations';

export function needsAspirationPick(
  character: Pick<Character, 'age' | 'aspirations'>,
): boolean {
  return character.age >= 16 && !character.aspirations;
}

export function validateAspirations(
  primary: AspirationId,
  secondary: AspirationId,
): { valid: boolean; message?: string } {
  if (primary === secondary) {
    return { valid: false, message: 'Primary and secondary aspirations must differ.' };
  }
  if (!ASPIRATION_MAP[primary] || !ASPIRATION_MAP[secondary]) {
    return { valid: false, message: 'Invalid aspiration selection.' };
  }
  return { valid: true };
}

export function getAspirationWeightBoost(
  event: LifeEvent,
  aspirations?: CharacterAspirations,
): number {
  if (!aspirations) return 1;
  let boost = 1;
  const primary = ASPIRATION_MAP[aspirations.primary];
  const secondary = ASPIRATION_MAP[aspirations.secondary];
  if (primary.categories.includes(event.category)) boost *= 1.3;
  if (secondary.categories.includes(event.category)) boost *= 1.15;
  return boost;
}
