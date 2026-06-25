// ─── LifeQuest Career Engine ──────────────────────────────────────────────────
// Realistic career eligibility checking, hiring probability, and progression.

import { Career, EducationLevel, Character } from '../types';
import { JOBS } from '../data/gameData';
import { CAREER_PATHS, CareerPath, getCareerById, careerPathToLegacy } from '../data/careerPaths';
import { getDegreeById } from '../data/educationDegrees';
import { getCountryEconomy } from '../data/countryEconomy';

// ─── Eligibility System ───────────────────────────────────────────────────────

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;                // Human-readable reason if not eligible
  warnings?: string[];            // Non-blocking warnings
  hireProbability: number;        // 0–100
}

const EDUCATION_STAGE_RANK: Record<string, number> = {
  'none': 0, 'preschool': 1, 'primary': 2, 'middle_school': 3,
  'high_school': 4, 'diploma': 5, 'undergraduate': 6, 'masters': 7, 'phd': 8,
  // Legacy level mapping
  'elementary': 2, 'secondary': 4, 'university': 6, 'graduate': 7,
};

function getEducationRank(level: string): number {
  return EDUCATION_STAGE_RANK[level] ?? 0;
}

/**
 * Checks if a character meets all requirements for a career.
 * Returns detailed eligibility result with reason and hire probability.
 */
export function checkCareerEligibility(
  character: Pick<Character, 'age' | 'educationLevel' | 'stats' | 'traits' | 'countryCode' | 'criminalRecord' | 'assets'>,
  careerId: string,
): EligibilityResult {
  const career = getCareerById(careerId);

  if (!career) {
    return { eligible: false, reason: 'Career not found.', hireProbability: 0 };
  }

  const req = career.requirements;
  const warnings: string[] = [];

  // Age check
  if (character.age < req.minAge) {
    return {
      eligible: false,
      reason: `You must be at least ${req.minAge} years old. (You are ${character.age})`,
      hireProbability: 0,
    };
  }
  if (req.maxAge && character.age > req.maxAge) {
    return {
      eligible: false,
      reason: `Maximum age for this career is ${req.maxAge}. (You are ${character.age})`,
      hireProbability: 0,
    };
  }

  // Education stage check
  const charEduRank  = getEducationRank(character.educationLevel);
  const reqEduRank   = getEducationRank(req.minEducationStage);
  if (charEduRank < reqEduRank) {
    return {
      eligible: false,
      reason: `Required education: ${req.minEducationStage.replace('_', ' ')}. Yours: ${character.educationLevel}.`,
      hireProbability: 0,
    };
  }

  // Criminal record check
  if (req.forbiddenCriminalRecord && character.criminalRecord?.crimes && character.criminalRecord.crimes.length > 0) {
    return {
      eligible: false,
      reason: 'A criminal record disqualifies you from this career.',
      hireProbability: 0,
    };
  }

  // Intelligence check
  if (character.stats.intelligence < req.minIntelligence) {
    const gap = req.minIntelligence - character.stats.intelligence;
    if (gap > 10) {
      return {
        eligible: false,
        reason: `Intelligence too low. Need ${req.minIntelligence}, have ${character.stats.intelligence}.`,
        hireProbability: 0,
      };
    }
    warnings.push(`Intelligence slightly below ideal (${character.stats.intelligence}/${req.minIntelligence}).`);
  }

  // Fitness check
  if (req.minFitness && character.stats.fitness < req.minFitness) {
    const gap = req.minFitness - character.stats.fitness;
    if (gap > 10) {
      return {
        eligible: false,
        reason: `Physical fitness too low. Need ${req.minFitness}, have ${character.stats.fitness}.`,
        hireProbability: 0,
      };
    }
    warnings.push(`Fitness slightly below ideal.`);
  }

  // Social check
  if (req.minSocial && character.stats.social < req.minSocial) {
    const gap = req.minSocial - character.stats.social;
    if (gap > 15) {
      return {
        eligible: false,
        reason: `Social skills too low for this role. Need ${req.minSocial}, have ${character.stats.social}.`,
        hireProbability: 0,
      };
    }
    warnings.push(`Social skills are below ideal.`);
  }

  // Degree requirements — any ONE of requiredDegreeIds
  // Note: Character currently stores educationLevel (legacy). In future, will store degreeIds[].
  // For now we use the education level rank as a proxy.

  // Compute hire probability based on character stats vs requirements
  const hireProbability = computeHireProbability(character, career);

  return {
    eligible: true,
    hireProbability,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Compute realistic hire probability (0–100) for a character applying to a career.
 * Takes into account intelligence gap, education level, traits, and luck.
 */
export function computeHireProbability(
  character: Pick<Character, 'stats' | 'educationLevel' | 'traits'>,
  career: CareerPath,
): number {
  const req = career.requirements;

  // Base score from intelligence
  const intScore = Math.min(100, (character.stats.intelligence / req.minIntelligence) * 60);

  // Education bonus
  const charEduRank = getEducationRank(character.educationLevel);
  const reqEduRank  = getEducationRank(req.minEducationStage);
  const eduBonus    = Math.min(20, Math.max(0, (charEduRank - reqEduRank) * 5));

  // Social bonus
  const socialBonus = Math.min(10, (character.stats.social / 100) * 10);

  // Ambition bonus
  const ambitionBonus = Math.min(5, (character.stats.ambition / 100) * 5);

  // Lucky trait bonus
  const luckyBonus = character.traits.includes('lucky') ? 8 : 0;

  // Seniority penalty — harder to get senior roles
  const seniorityPenalty = (career.seniorityLevel - 1) * 5;

  const raw = intScore + eduBonus + socialBonus + ambitionBonus + luckyBonus - seniorityPenalty;
  return Math.round(Math.max(5, Math.min(95, raw)));
}

/**
 * Roll for job success using computed hire probability.
 * Returns true if hired.
 */
export function rollForHire(hireProbability: number): boolean {
  return Math.random() * 100 < hireProbability;
}

// ─── Legacy-compat functions ──────────────────────────────────────────────────

const JOB_TITLE_MAP: Record<string, string> = {
  'Junior Developer': 'junior_dev',
  'Senior Developer': 'senior_dev',
  'Entrepreneur': 'entrepreneur',
  'Student': 'student',
  'Unemployed': 'student',
  'Retired': 'student',
};

export function findJobByTitle(title: string) {
  const key = JOB_TITLE_MAP[title] ?? title.toLowerCase().replace(/\s+/g, '_');
  return JOBS.find(j => j.id === key || j.label === title);
}

export function jobToCareer(jobTitle: string): Career | null {
  // Try new career system first
  const newCareer = CAREER_PATHS.find(c => c.label === jobTitle || c.id === jobTitle.toLowerCase().replace(/\s+/g, '_'));
  if (newCareer) {
    return careerPathToLegacy(newCareer);
  }
  // Fall back to legacy
  const job = findJobByTitle(jobTitle);
  if (!job || job.id === 'student') return null;
  return {
    title: job.label,
    company: job.company,
    salary: job.salary,
    yearsEmployed: 0,
    performance: 50,
  };
}

/**
 * Legacy job roll — now uses the new eligibility system.
 */
export function applyForJobRoll(
  intelligence: number,
  educationLevel: EducationLevel,
  minIntelligence: number,
): boolean {
  const eduBonus = { none: 0, elementary: 5, secondary: 10, university: 20, graduate: 30 }[educationLevel];
  const score = intelligence + eduBonus;
  const threshold = minIntelligence + 10;
  return Math.random() * 100 < Math.min(95, Math.max(15, score - threshold + 50));
}

export function workHarder(career: Career): Career {
  return {
    ...career,
    performance: Math.min(100, career.performance + 8),
  };
}

export function askForRaise(career: Career, success: boolean): Career {
  if (!success) return career;
  return {
    ...career,
    salary: Math.round(career.salary * 1.12),
    performance: Math.min(100, career.performance + 3),
  };
}

export function applyForPromotion(career: Career, success: boolean): { career: Career; newTitle?: string } {
  if (!success || career.performance < 60) return { career };

  // Try to find a progression in the new system
  const currentCareer = CAREER_PATHS.find(c => c.label === career.title);
  if (currentCareer && currentCareer.progressionPaths.length > 0) {
    const nextProg = currentCareer.progressionPaths[0];
    const nextCareer = getCareerById(nextProg.id);
    if (nextCareer && career.yearsEmployed >= nextProg.minYearsInRole && career.performance >= nextProg.minPerformance) {
      return {
        career: {
          ...career,
          title: nextCareer.label,
          company: nextCareer.company,
          salary: Math.round(nextCareer.baseSalary * (1 + career.performance / 200)),
          performance: 55,
        },
        newTitle: nextCareer.label,
      };
    }
  }

  // Legacy fallback
  const promoted = JOBS.find(j => j.salary > career.salary && j.minIntelligence <= 80);
  if (!promoted) return { career: { ...career, performance: Math.min(100, career.performance + 5) } };
  return {
    career: {
      ...career,
      title: promoted.label,
      company: promoted.company,
      salary: promoted.salary,
      performance: 55,
    },
    newTitle: promoted.label,
  };
}

export function incrementCareerYear(career: Career): Career {
  return { ...career, yearsEmployed: career.yearsEmployed + 1 };
}

/**
 * Scale career salary by country economy
 */
export function getCountrySalary(baseSalaryUSD: number, countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  return Math.round(baseSalaryUSD * eco.salaryMultiplier);
}

/**
 * Get careers eligible for a character based on full eligibility check.
 */
export function getEligibleCareers(character: Parameters<typeof checkCareerEligibility>[0]): Array<{
  career: CareerPath;
  eligibility: EligibilityResult;
}> {
  return CAREER_PATHS
    .map(career => ({
      career,
      eligibility: checkCareerEligibility(character, career.id),
    }))
    .filter(({ eligibility }) => eligibility.eligible)
    .sort((a, b) => b.eligibility.hireProbability - a.eligibility.hireProbability);
}
