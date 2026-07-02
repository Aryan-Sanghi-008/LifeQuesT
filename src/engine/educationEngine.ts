import { EducationLevel, Character } from '../types';
import { clamp } from './economyEngine';
import { isFeatureEnabled } from './scenarioEngine';

function clampRange(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
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
): StudySessionResult {
  const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const score = correct;
  const passed = score >= 2;
  const intelligenceGain = passed ? clamp(intelligence + 5) - intelligence : 2;
  const mentalHealthGain = passed ? 3 : -2;

  return {
    score,
    totalQuestions: questions.length,
    passed,
    intelligenceGain,
    mentalHealthGain,
  };
}

export function canStudy(age: number, educationLevel: EducationLevel): boolean {
  return age >= 13 && age <= 30 && educationLevel !== 'graduate';
}

// ─── Education Stage → Legacy EducationLevel mapping ─────────────────────────
import { stageToLegacyEducationLevel } from '../data/educationDegrees';

export function stagesToLegacyEducation(stage: EducationStage): EducationLevel {
  return stageToLegacyEducationLevel(stage);
}

const STAGE_RANK: Record<EducationStage, number> = {
  none: 0, preschool: 1, primary: 2, middle_school: 3, high_school: 4,
  diploma: 5, undergraduate: 6, masters: 7, phd: 8,
};

export interface EducationAdvanceResult {
  educationStage: EducationStage;
  educationLevel: EducationLevel;
  milestone?: { title: string; description: string };
}

const AGE_EDUCATION_GATES: Array<{
  minAge: number;
  stage: EducationStage;
  title: string;
  description: string;
}> = [
  {
    minAge: 5,
    stage: 'primary',
    title: 'Started Primary School',
    description: 'You began primary school — a new chapter of learning and friends.',
  },
  {
    minAge: 12,
    stage: 'middle_school',
    title: 'Started Secondary School',
    description: 'You moved up to secondary school. The coursework got tougher.',
  },
  {
    minAge: 18,
    stage: 'high_school',
    title: 'Graduated High School',
    description: 'You completed high school and earned your diploma.',
  },
];

/**
 * Promote education stage based on age milestones. Never downgrades.
 */
export function advanceEducationByAge(
  age: number,
  currentStage: EducationStage,
  currentLevel: EducationLevel,
): EducationAdvanceResult | null {
  const currentRank = STAGE_RANK[currentStage] ?? 0;
  let best: typeof AGE_EDUCATION_GATES[number] | null = null;

  for (const gate of AGE_EDUCATION_GATES) {
    if (age >= gate.minAge && STAGE_RANK[gate.stage] > currentRank) {
      if (!best || STAGE_RANK[gate.stage] > STAGE_RANK[best.stage]) {
        best = gate;
      }
    }
  }

  if (!best) return null;

  const educationStage = best.stage;
  const educationLevel = stagesToLegacyEducation(educationStage);
  // Never downgrade legacy level
  const levelRank = ['none', 'elementary', 'secondary', 'university', 'graduate'] as const;
  const finalLevel = levelRank.indexOf(educationLevel) >= levelRank.indexOf(currentLevel)
    ? educationLevel
    : currentLevel;

  return {
    educationStage,
    educationLevel: finalLevel,
    milestone: { title: best.title, description: best.description },
  };
}

const EDUCATION_LABELS: Record<string, string> = {
  none: 'No Education',
  preschool: 'Preschool',
  primary: 'Primary',
  middle_school: 'Secondary',
  high_school: 'High School',
  diploma: 'Diploma',
  undergraduate: 'University',
  masters: 'Masters',
  phd: 'PhD',
  elementary: 'Elementary',
  secondary: 'Secondary',
  university: 'University',
  graduate: 'Graduate',
};

export function getEducationLabel(stage?: string, level?: EducationLevel): string {
  if (stage && stage !== 'none' && EDUCATION_LABELS[stage]) {
    return EDUCATION_LABELS[stage];
  }
  return EDUCATION_LABELS[level ?? 'none'] ?? 'No Education';
}

/** Legacy level that best reflects stage vs stored level for UI tracks. */
export function resolveEducationLevelForDisplay(
  stage?: string,
  level?: EducationLevel,
): EducationLevel {
  if (!stage || stage === 'none') return level ?? 'none';
  const fromStage = stagesToLegacyEducation(stage as EducationStage);
  const levelRank = ['none', 'elementary', 'secondary', 'university', 'graduate'] as const;
  const stageIdx = levelRank.indexOf(fromStage);
  const levelIdx = levelRank.indexOf(level ?? 'none');
  return stageIdx >= levelIdx ? fromStage : (level ?? 'none');
}

/**
 * Get degrees available to enroll in for a given character.
 * Filters by current education stage and character's existing degrees.
 */
export function getEnrollableDegrees(
  character: Pick<Character, 'age' | 'educationLevel' | 'educationStage' | 'degreeIds' | 'gpa' | 'scenarioId'>,
): Degree[] {
  if (!isFeatureEnabled(character, 'university')) return [];
  const stage = (character.educationStage as EducationStage | undefined) ?? 'none';
  const owned = new Set(character.degreeIds ?? []);

  return DEGREES.filter(d => {
    if (owned.has(d.id)) return false;
    if (d.requiredPrior && !owned.has(d.requiredPrior)) return false;
    if (!meetsDegreeGPA(character, d)) return false;
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

export function initGPA(age: number): number {
  return age < 13 ? 2.8 : 2.5;
}

export function tickGPA(
  character: Pick<Character, 'age' | 'gpa' | 'stats' | 'people' | 'focusAllocation'>,
): number {
  if (character.age < 5 || character.age > 25) return character.gpa ?? 0;

  let gpa = character.gpa ?? initGPA(character.age);
  const eduFocus = character.focusAllocation?.education ?? 0;
  const intBonus = (character.stats.intelligence - 50) / 500;
  const focusBonus = eduFocus * 0.05;

  const teachers = character.people.filter(p => p.relationType === 'teacher');
  const favorBonus = teachers.length
    ? teachers.reduce((s, t) => s + (t.favorScore ?? 50), 0) / teachers.length / 500
    : 0;

  gpa = clampRange(gpa + intBonus + focusBonus + favorBonus, 0, 4);
  return Math.round(gpa * 100) / 100;
}

export function meetsDegreeGPA(character: Pick<Character, 'gpa'>, degree: Degree): boolean {
  if (!degree.minGPA) return true;
  return (character.gpa ?? 0) >= degree.minGPA;
}
