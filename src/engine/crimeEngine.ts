import { Character, CriminalRecord, LifeEvent } from '../types';
import { getCrimeDef } from '../data/crimes';
import { addHeat, shouldStartInvestigation, startLegalCase } from './legalEngine';

export function getCriminalRecord(character: Character): CriminalRecord {
  return character.criminalRecord ?? { crimes: [], jailYearsRemaining: 0, onProbation: false };
}

export function isInJail(character: Character): boolean {
  return getCriminalRecord(character).jailYearsRemaining > 0;
}

export function recordCrime(character: Character, crimeId: string): Character {
  const record = getCriminalRecord(character);
  const crime = getCrimeDef(crimeId);
  const karmaPenalty = crime?.karmaPenalty ?? -20;
  const jailYears = crime?.baseSentenceYears ?? 0;
  const heat = addHeat(character, crime?.heatGain ?? 10);

  let legalCase = character.legalCase;
  if (shouldStartInvestigation(heat) && !legalCase) {
    legalCase = startLegalCase(character, crimeId);
  }

  return {
    ...character,
    karma: Math.max(-100, character.karma + karmaPenalty),
    heatLevel: heat,
    legalCase,
    criminalRecord: {
      ...record,
      crimes: [...record.crimes, crimeId],
      jailYearsRemaining: Math.max(record.jailYearsRemaining, jailYears),
      onProbation: jailYears === 0,
      probationYearsRemaining: jailYears === 0 ? 3 : record.probationYearsRemaining,
      heatLevel: heat,
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
      probationYearsRemaining: remaining === 0 && record.crimes.length > 0 ? 3 : record.probationYearsRemaining,
    },
  };
}

export function tickProbation(character: Character): Partial<Character> {
  const record = getCriminalRecord(character);
  if (!record.onProbation || isInJail(character)) return {};

  const yearsLeft = (record.probationYearsRemaining ?? 3) - 1;
  if (yearsLeft <= 0) {
    return {
      criminalRecord: {
        ...record,
        onProbation: false,
        probationYearsRemaining: 0,
      },
    };
  }
  return {
    criminalRecord: {
      ...record,
      probationYearsRemaining: yearsLeft,
    },
  };
}

export function decayHeat(character: Character): number {
  const heat = character.heatLevel ?? character.criminalRecord?.heatLevel ?? 0;
  return Math.max(0, heat - 5);
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
