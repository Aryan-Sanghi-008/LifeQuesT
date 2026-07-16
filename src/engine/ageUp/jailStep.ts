import { tickJail, isInJail } from '@engine/crimeEngine';
import type { Character } from '@/types';
import type { AgeUpOutcome } from './types';

export function runJailStep(character: Character): AgeUpOutcome | null {
  if (!isInJail(character)) return null;

  const jailed = tickJail(character);
  const yearsRemaining = jailed.criminalRecord?.jailYearsRemaining ?? 0;
  const message =
    yearsRemaining > 0
      ? `Serving time — ${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'} left`
      : 'Your sentence is complete. You are free.';
  return {
    type: 'jail_tick',
    criminalRecord: jailed.criminalRecord!,
    yearsRemaining,
    message,
  };
}
