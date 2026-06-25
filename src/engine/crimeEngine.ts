import { Character, CriminalRecord, LifeEvent } from '../types';

const KARMA_PENALTIES: Record<string, number> = {
  shoplifting: -15,
  dui: -25,
  arrest: -40,
  fraud: -50,
  assault: -35,
  default: -20,
};

export function getCriminalRecord(character: Character): CriminalRecord {
  return character.criminalRecord ?? { crimes: [], jailYearsRemaining: 0, onProbation: false };
}

export function isInJail(character: Character): boolean {
  return getCriminalRecord(character).jailYearsRemaining > 0;
}

export function recordCrime(character: Character, crimeId: string): Character {
  const record = getCriminalRecord(character);
  const karmaPenalty = KARMA_PENALTIES[crimeId] ?? KARMA_PENALTIES.default;
  const jailYears = crimeId === 'arrest' || crimeId === 'assault' ? 2 : crimeId === 'fraud' ? 3 : 0;

  return {
    ...character,
    karma: Math.max(-100, character.karma + karmaPenalty),
    criminalRecord: {
      crimes: [...record.crimes, crimeId],
      jailYearsRemaining: Math.max(record.jailYearsRemaining, jailYears),
      onProbation: jailYears === 0,
    },
  };
}

export function tickJail(character: Character): Character {
  const record = getCriminalRecord(character);
  if (record.jailYearsRemaining <= 0) return character;

  const remaining = record.jailYearsRemaining - 1;
  return {
    ...character,
    criminalRecord: {
      ...record,
      jailYearsRemaining: remaining,
      onProbation: remaining === 0 && record.crimes.length > 0,
    },
  };
}

export function isEventBlockedByCrime(character: Character, event: LifeEvent): boolean {
  if (isInJail(character) && (event.category === 'career' || event.requiresJob)) {
    return true;
  }
  if (event.requiresKarmaMin !== undefined && character.karma < event.requiresKarmaMin) {
    return true;
  }
  return false;
}
