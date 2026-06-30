import type { Character, LegalCase, LegalStage } from '../types';
import { getCrimeDef } from '../data/crimes';

function clampRange(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const HEAT_INVESTIGATION_THRESHOLD = 70;
export const MAX_HEAT = 100;

export function addHeat(character: Character, amount: number): number {
  const current = character.heatLevel ?? character.criminalRecord?.heatLevel ?? 0;
  return clampRange(current + amount, 0, MAX_HEAT);
}

export function shouldStartInvestigation(heat: number): boolean {
  return heat >= HEAT_INVESTIGATION_THRESHOLD;
}

export function startLegalCase(character: Character, crimeId: string): LegalCase {
  return {
    crimeId,
    stage: 'investigation',
    evidence: 20 + Math.floor(Math.random() * 30),
    startedAtAge: character.age,
  };
}

export function advanceToTrial(legalCase: LegalCase): LegalCase {
  return { ...legalCase, stage: 'trial' as LegalStage };
}

export function hireLawyer(legalCase: LegalCase, quality: number): LegalCase {
  return { ...legalCase, lawyerQuality: clampRange(quality, 1, 3), stage: 'trial' };
}

export interface TrialVerdict {
  guilty: boolean;
  sentenceYears: number;
  fine: number;
  message: string;
}

export function resolveTrial(character: Character, legalCase: LegalCase): TrialVerdict {
  const crime = getCrimeDef(legalCase.crimeId);
  const lawyerBonus = (legalCase.lawyerQuality ?? 0) * 15;
  const karmaBonus = character.karma > 50 ? 10 : character.karma < 0 ? -15 : 0;
  const evidenceAgainst = legalCase.evidence;
  const defenseScore = 30 + lawyerBonus + karmaBonus + Math.floor(Math.random() * 20);
  const guilty = evidenceAgainst > defenseScore;

  if (!guilty || !crime) {
    return {
      guilty: false,
      sentenceYears: 0,
      fine: 0,
      message: 'Not guilty. You walk free.',
    };
  }

  const repeatOffender = (character.criminalRecord?.crimes.length ?? 0) > 2;
  const sentenceYears = crime.baseSentenceYears + (repeatOffender ? 1 : 0);
  const fine = crime.fineAmount ?? 0;

  return {
    guilty: true,
    sentenceYears,
    fine,
    message: sentenceYears > 0
      ? `Guilty. Sentenced to ${sentenceYears} year${sentenceYears === 1 ? '' : 's'}.`
      : `Guilty. Fined and placed on probation.`,
  };
}

export function applyVerdictToRecord(
  character: Character,
  crimeId: string,
  verdict: TrialVerdict,
): Character['criminalRecord'] {
  const record = character.criminalRecord ?? { crimes: [], jailYearsRemaining: 0, onProbation: false };
  const heat = Math.max(0, (character.heatLevel ?? record.heatLevel ?? 0) - 30);

  return {
    ...record,
    crimes: [...record.crimes, crimeId],
    jailYearsRemaining: Math.max(record.jailYearsRemaining, verdict.sentenceYears),
    onProbation: verdict.sentenceYears === 0 || verdict.guilty,
    probationYearsRemaining: verdict.sentenceYears === 0 ? 3 : record.probationYearsRemaining,
    heatLevel: heat,
    convictions: [
      ...(record.convictions ?? []),
      { crimeId, age: character.age, sentenceYears: verdict.sentenceYears },
    ],
  };
}
