export interface CriminalRecord {
  crimes: string[];
  jailYearsRemaining: number;
  onProbation: boolean;
  probationYearsRemaining?: number;
  heatLevel?: number;
  convictions?: Array<{ crimeId: string; age: number; sentenceYears: number }>;
}

export type LegalStage = 'investigation' | 'trial' | 'sentencing' | 'parole';

export interface LegalCase {
  crimeId: string;
  stage: LegalStage;
  evidence: number;
  lawyerQuality?: number;
  startedAtAge: number;
}

export type CrimeTier = 'petty' | 'property' | 'financial' | 'violent' | 'organized' | 'cyber' | 'traffic';

export interface CrimeDef {
  id: string;
  label: string;
  tier: CrimeTier;
  heatGain: number;
  baseSentenceYears: number;
  karmaPenalty: number;
  fineAmount?: number;
}
