import { scaleEducationCost } from '../engine/countryScaleEngine';

export interface CertificationDefinition {
  id: string;
  label: string;
  minAge: number;
  minIntelligence: number;
  baseCostUSD: number;
  passThreshold: number;
  /** Degree IDs that make this exam contextually relevant for random events */
  relatedDegreeIds?: string[];
}

export const CERTIFICATIONS: CertificationDefinition[] = [
  {
    id: 'bar_exam',
    label: 'Bar Exam',
    minAge: 22,
    minIntelligence: 75,
    baseCostUSD: 1500,
    passThreshold: 70,
    relatedDegreeIds: ['llb', 'llm', 'phd_law'],
  },
  {
    id: 'pilot_license',
    label: 'Pilot License',
    minAge: 21,
    minIntelligence: 70,
    baseCostUSD: 8000,
    passThreshold: 65,
  },
  {
    id: 'atp_certificate',
    label: 'ATP Certificate',
    minAge: 23,
    minIntelligence: 75,
    baseCostUSD: 12000,
    passThreshold: 70,
    relatedDegreeIds: ['bsc_aviation'],
  },
  {
    id: 'cpa',
    label: 'CPA Exam',
    minAge: 22,
    minIntelligence: 72,
    baseCostUSD: 2000,
    passThreshold: 68,
    relatedDegreeIds: ['bcom', 'bba', 'mba'],
  },
];

export function getCertificationById(id: string): CertificationDefinition | undefined {
  return CERTIFICATIONS.find(c => c.id === id);
}

export function getScaledCertificationCost(baseCostUSD: number, countryCode: string): number {
  return scaleEducationCost(baseCostUSD, countryCode);
}

export function getCertificationLabel(id: string): string {
  return getCertificationById(id)?.label ?? id.replace(/_/g, ' ');
}
