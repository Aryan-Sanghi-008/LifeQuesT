import {
  CERTIFICATIONS,
  getCertificationById,
  getCertificationLabel,
  getScaledCertificationCost,
} from '../data/certifications';
import type { Character } from '../types';

export interface CertificationEligibility {
  eligible: boolean;
  reason?: string;
  cost: number;
}

export interface CertificationExamResult {
  passed: boolean;
  passProbability: number;
  message: string;
}

export { getCertificationLabel };

export function checkCertificationEligibility(
  character: Pick<Character, 'age' | 'stats' | 'certificationIds' | 'countryCode'>,
  certId: string,
): CertificationEligibility {
  const cert = getCertificationById(certId);
  if (!cert) {
    return { eligible: false, reason: 'Unknown certification.', cost: 0 };
  }

  const owned = new Set(character.certificationIds ?? []);
  if (owned.has(certId)) {
    return { eligible: false, reason: 'Already certified.', cost: 0 };
  }

  if (character.age < cert.minAge) {
    return { eligible: false, reason: `Must be at least ${cert.minAge} years old.`, cost: 0 };
  }

  if (character.stats.intelligence < cert.minIntelligence) {
    return {
      eligible: false,
      reason: `Intelligence too low. Need ${cert.minIntelligence}, have ${character.stats.intelligence}.`,
      cost: 0,
    };
  }

  const cost = getScaledCertificationCost(cert.baseCostUSD, character.countryCode ?? 'US');
  return { eligible: true, cost };
}

export function computeCertificationPassProbability(
  character: Pick<Character, 'stats'>,
  certId: string,
): number {
  const cert = getCertificationById(certId);
  if (!cert) return 0;

  const intBonus = Math.min(25, (character.stats.intelligence - cert.minIntelligence) * 1.5);
  const ambitionBonus = Math.min(10, character.stats.ambition * 0.1);
  return Math.round(Math.max(5, Math.min(95, cert.passThreshold - 20 + intBonus + ambitionBonus)));
}

export function rollCertificationExam(
  character: Pick<Character, 'stats'>,
  certId: string,
  rng = Math.random,
): CertificationExamResult {
  const cert = getCertificationById(certId);
  if (!cert) {
    return { passed: false, passProbability: 0, message: 'Unknown certification.' };
  }

  const passProbability = computeCertificationPassProbability(character, certId);
  const passed = rng() * 100 < passProbability;

  return {
    passed,
    passProbability,
    message: passed
      ? `You passed the ${cert.label}!`
      : `You failed the ${cert.label}. Study harder and try again.`,
  };
}

/** Cert to grant from ce_certification_achieved when character has relevant degrees */
export function inferContextualCertification(
  degreeIds: string[],
  certificationIds: string[],
): string | null {
  const owned = new Set(certificationIds);
  const degrees = new Set(degreeIds);

  for (const cert of CERTIFICATIONS) {
    if (owned.has(cert.id)) continue;
    if (cert.relatedDegreeIds?.some(d => degrees.has(d))) {
      return cert.id;
    }
  }
  return null;
}

export function listPursuableCertifications(
  character: Pick<Character, 'age' | 'stats' | 'certificationIds' | 'countryCode'>,
): Array<{ cert: typeof CERTIFICATIONS[number]; eligibility: CertificationEligibility }> {
  return CERTIFICATIONS
    .map(cert => ({
      cert,
      eligibility: checkCertificationEligibility(character, cert.id),
    }))
    .filter(({ eligibility }) => eligibility.eligible);
}
