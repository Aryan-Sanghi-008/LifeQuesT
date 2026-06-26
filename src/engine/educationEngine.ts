import { EducationLevel, Character } from '../types';
import { clamp } from './economyEngine';
import { DEGREES, Degree, EducationStage } from '../data/educationDegrees';

export interface StudyQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface StudySessionResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  intelligenceGain: number;
  mentalHealthGain: number;
  educationUnlock?: EducationLevel;
}

export interface EnrollResult {
  ok: boolean;
  message: string;
  degreeId?: string;
  annualCost?: number;
}

export interface AdvanceEducationResult {
  ok: boolean;
  message: string;
  degreeEarned?: Degree;
  intelligenceGain?: number;
  newStage?: EducationStage;
  newEducationLevel?: EducationLevel;
}

const STUDY_QUESTIONS: StudyQuestion[] = [
  { id: 'q1', prompt: 'What is 15% of 200?', options: ['20', '30', '25', '35'], correctIndex: 1 },
  { id: 'q2', prompt: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], correctIndex: 1 },
  { id: 'q3', prompt: 'H2O is the chemical formula for?', options: ['Salt', 'Water', 'Oxygen', 'Hydrogen'], correctIndex: 1 },
  { id: 'q4', prompt: 'Who wrote Romeo and Juliet?', options: ['Dickens', 'Shakespeare', 'Austen', 'Hemingway'], correctIndex: 1 },
  { id: 'q5', prompt: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctIndex: 2 },
  { id: 'q6', prompt: 'Speed = distance / ?', options: ['Mass', 'Time', 'Weight', 'Force'], correctIndex: 1 },
];

export function pickStudyQuestions(count = 3): StudyQuestion[] {
  const shuffled = [...STUDY_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function gradeStudySession(
  answers: number[],
  questions: StudyQuestion[],
  intelligence: number,
  currentEducation: EducationLevel,
): StudySessionResult {
  const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const score = correct;
  const passed = score >= 2;
  const intelligenceGain = passed ? clamp(intelligence + 5) - intelligence : 2;
  const mentalHealthGain = passed ? 3 : -2;

  let educationUnlock: EducationLevel | undefined;
  if (passed && currentEducation === 'secondary' && intelligence + intelligenceGain >= 60) {
    educationUnlock = 'university';
  } else if (passed && currentEducation === 'university' && intelligence + intelligenceGain >= 75) {
    educationUnlock = 'graduate';
  }

  return {
    score,
    totalQuestions: questions.length,
    passed,
    intelligenceGain,
    mentalHealthGain,
    educationUnlock,
  };
}

export function canStudy(age: number, educationLevel: EducationLevel): boolean {
  return age >= 13 && age <= 30 && educationLevel !== 'graduate';
}

// ─── Education Stage → Legacy EducationLevel mapping ─────────────────────────
const STAGE_TO_LEGACY: Record<EducationStage, EducationLevel> = {
  none:          'none',
  preschool:     'elementary',
  primary:       'elementary',
  middle_school: 'secondary',
  high_school:   'secondary',
  diploma:       'university',
  undergraduate: 'university',
  masters:       'graduate',
  phd:           'graduate',
};

export function stagesToLegacyEducation(stage: EducationStage): EducationLevel {
  return STAGE_TO_LEGACY[stage] ?? 'none';
}

/**
 * Get degrees available to enroll in for a given character.
 * Filters by current education stage and character's existing degrees.
 */
export function getEnrollableDegrees(
  character: Pick<Character, 'age' | 'educationLevel' | 'educationStage' | 'degreeIds'>,
): Degree[] {
  const stage = (character.educationStage as EducationStage | undefined) ?? 'none';
  const owned = new Set(character.degreeIds ?? []);

  return DEGREES.filter(d => {
    if (owned.has(d.id)) return false;
    // Require prior degree if specified
    if (d.requiredPrior && !owned.has(d.requiredPrior)) return false;
    // Age gates
    const minAge: Record<string, number> = {
      diploma: 17, undergraduate: 18, masters: 21, phd: 23,
    };
    if (character.age < (minAge[d.stage] ?? 18)) return false;
    // Education stage gates
    const stageGate: Record<string, EducationStage[]> = {
      diploma:       ['high_school', 'diploma', 'undergraduate', 'masters', 'phd'],
      undergraduate: ['high_school', 'diploma', 'undergraduate', 'masters', 'phd'],
      masters:       ['undergraduate', 'masters', 'phd'],
      phd:           ['masters', 'phd'],
    };
    const allowed = stageGate[d.stage] ?? [];
    return allowed.includes(stage);
  });
}

/**
 * Enroll a character in a degree program.
 * Returns the annual cost so the caller can deduct from bankBalance.
 */
export function enrollInProgram(
  character: Pick<Character, 'age' | 'educationLevel' | 'educationStage' | 'degreeIds' | 'countryCode'>,
  degreeId: string,
): EnrollResult {
  const degree = DEGREES.find(d => d.id === degreeId);
  if (!degree) {
    return { ok: false, message: 'Degree program not found.' };
  }
  if ((character.degreeIds ?? []).includes(degreeId)) {
    return { ok: false, message: 'You already have this degree.' };
  }
  const enrollable = getEnrollableDegrees(character);
  if (!enrollable.find(d => d.id === degreeId)) {
    return { ok: false, message: `You don't meet the requirements for ${degree.label}.` };
  }

  return {
    ok: true,
    message: `You enrolled in ${degree.label}.`,
    degreeId: degree.id,
    annualCost: degree.baseAnnualCost,
  };
}

/**
 * Advance education after completing a degree.
 * Awards the degree, upgrades educationStage, and returns intelligence gain.
 */
export function advanceEducation(
  character: Pick<Character, 'age' | 'educationLevel' | 'educationStage' | 'educationBranch' | 'degreeIds' | 'stats'>,
  degreeId: string,
): AdvanceEducationResult {
  const degree = DEGREES.find(d => d.id === degreeId);
  if (!degree) return { ok: false, message: 'Degree not found.' };

  const stageProgression: Record<string, EducationStage> = {
    diploma:       'diploma',
    undergraduate: 'undergraduate',
    masters:       'masters',
    phd:           'phd',
  };

  const newStage = stageProgression[degree.stage] ?? (character.educationStage as EducationStage | undefined) ?? 'none';
  const newEducationLevel = stagesToLegacyEducation(newStage);

  return {
    ok: true,
    message: `Congratulations! You earned your ${degree.shortLabel}.`,
    degreeEarned: degree,
    intelligenceGain: degree.intelligenceBonus,
    newStage,
    newEducationLevel,
  };
}

/**
 * Get degrees a character has already earned.
 */
export function getEarnedDegrees(degreeIds: string[]): Degree[] {
  return degreeIds.map(id => DEGREES.find(d => d.id === id)).filter((d): d is Degree => !!d);
}
