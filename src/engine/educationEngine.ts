import { EducationLevel, Character } from '../types';
import { clamp, clampRange } from './economyEngine';
import { scaleEducationCost } from './countryScaleEngine';
import { isFeatureEnabled } from './scenarioEngine';
import {
  DEGREES,
  Degree,
  EducationStage,
  EducationBranch,
  getDegreeById,
  getDegreesForCountry,
} from '../data/educationDegrees';

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
  durationYears?: number;
  /** Stage to apply immediately on enroll (before graduation). */
  newStage?: EducationStage;
  /** Level to apply immediately on enroll (never below current graduate). */
  newEducationLevel?: EducationLevel;
}

/** Display ids for Career Education Path UI (postgrad is display-only). */
export type EducationTrackId =
  | 'none'
  | 'elementary'
  | 'secondary'
  | 'university'
  | 'postgrad'
  | 'graduate';

const LEVEL_RANK: EducationLevel[] = [
  'none',
  'elementary',
  'secondary',
  'university',
  'graduate',
];

function maxEducationLevel(a: EducationLevel, b: EducationLevel): EducationLevel {
  return LEVEL_RANK.indexOf(a) >= LEVEL_RANK.indexOf(b) ? a : b;
}

/** Stage + level to set the moment a program enrollment succeeds. */
export function educationStateOnEnroll(
  degree: Degree,
  currentLevel: EducationLevel,
): { educationStage: EducationStage; educationLevel: EducationLevel } {
  const educationStage = degree.stage as EducationStage;
  const enrolledLevel: EducationLevel =
    degree.stage === 'masters' || degree.stage === 'phd' ? 'graduate' : 'university';
  return {
    educationStage,
    educationLevel: maxEducationLevel(currentLevel, enrolledLevel),
  };
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

/** Study quizzes stay available through masters; PhD holders (or age out) stop. */
export function canStudy(
  age: number,
  _educationLevel: EducationLevel,
  educationStage?: string,
): boolean {
  if (age < 13 || age > 30) return false;
  return educationStage !== 'phd';
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

export function getEducationLabel(
  stage?: string,
  level?: EducationLevel,
  enrolledDegreeId?: string,
): string {
  if (enrolledDegreeId) {
    const enrolled = getDegreeById(enrolledDegreeId);
    if (enrolled) {
      return EDUCATION_LABELS[enrolled.stage] ?? enrolled.shortLabel;
    }
  }
  // Bachelor/diploma holders sit on Graduate until they enroll postgraduate study.
  if (
    level === 'graduate' &&
    (stage === 'undergraduate' || stage === 'diploma')
  ) {
    return EDUCATION_LABELS.graduate;
  }
  if (stage && stage !== 'none' && EDUCATION_LABELS[stage]) {
    return EDUCATION_LABELS[stage];
  }
  return EDUCATION_LABELS[level ?? 'none'] ?? 'No Education';
}

/** Legacy level that best reflects stage vs stored level for soft filters. */
export function resolveEducationLevelForDisplay(
  stage?: string,
  level?: EducationLevel,
): EducationLevel {
  if (!stage || stage === 'none') return level ?? 'none';
  const fromStage = stagesToLegacyEducation(stage as EducationStage);
  const stageIdx = LEVEL_RANK.indexOf(fromStage);
  const levelIdx = LEVEL_RANK.indexOf(level ?? 'none');
  return stageIdx >= levelIdx ? fromStage : (level ?? 'none');
}

/**
 * Education Path highlighter id.
 * Enrollment wins; undergrad/diploma complete (idle) → graduate; masters/phd enrolled → postgrad.
 */
export function resolveEducationTrackForDisplay(
  stage?: string,
  level?: EducationLevel,
  enrolledDegreeId?: string,
): EducationTrackId {
  if (enrolledDegreeId) {
    const enrolled = getDegreeById(enrolledDegreeId);
    if (enrolled) {
      if (enrolled.stage === 'masters' || enrolled.stage === 'phd') return 'postgrad';
      if (enrolled.stage === 'undergraduate' || enrolled.stage === 'diploma') {
        return 'university';
      }
    }
  }

  const s = (stage ?? 'none') as EducationStage;
  if (s === 'undergraduate' || s === 'diploma' || s === 'masters' || s === 'phd') {
    return 'graduate';
  }
  if (level === 'graduate') return 'graduate';
  if (level === 'university') return 'university';

  if (s === 'preschool' || s === 'primary') return 'elementary';
  if (s === 'middle_school' || s === 'high_school') return 'secondary';
  if (s === 'none') return level ?? 'none';

  const legacy = resolveEducationLevelForDisplay(stage, level);
  if (legacy === 'elementary' || legacy === 'secondary' || legacy === 'university' || legacy === 'graduate' || legacy === 'none') {
    return legacy;
  }
  return 'none';
}

/**
 * Get degrees available to enroll in for a given character.
 * Filters by current education stage and character's existing degrees.
 * Sorted with country-preferred programs first.
 */
export function getEnrollableDegrees(
  character: Pick<
    Character,
    'age' | 'educationLevel' | 'educationStage' | 'degreeIds' | 'gpa' | 'scenarioId' | 'countryCode'
  >,
): Degree[] {
  if (!isFeatureEnabled(character, 'university')) return [];
  const stage = (character.educationStage as EducationStage | undefined) ?? 'none';
  const owned = new Set(character.degreeIds ?? []);
  const catalog = getDegreesForCountry(character.countryCode);

  return catalog.filter((d) => {
    if (owned.has(d.id)) return false;
    if (d.requiredPrior && !owned.has(d.requiredPrior)) return false;
    if (!meetsDegreeGPA(character, d)) return false;
    const minAge: Record<string, number> = {
      diploma: 17, undergraduate: 18, masters: 21, phd: 23,
    };
    if (character.age < (minAge[d.stage] ?? 18)) return false;
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

/** True when age-up just reached high school and player must choose major or skip. */
export function shouldPromptCollegeMajor(character: Pick<
  Character,
  'age' | 'educationStage' | 'enrolledDegreeId' | 'degreeIds' | 'educationMajorSkipped'
>): boolean {
  if (character.age < 18) return false;
  if (character.educationMajorSkipped) return false;
  if (character.enrolledDegreeId) return false;
  const stage = (character.educationStage as EducationStage | undefined) ?? 'none';
  if (stage !== 'high_school') return false;
  const owned = character.degreeIds ?? [];
  const hasPostSecondary = owned.some((id) => {
    const d = getDegreeById(id);
    return d && (d.stage === 'diploma' || d.stage === 'undergraduate' || d.stage === 'masters' || d.stage === 'phd');
  });
  return !hasPostSecondary;
}

/** First eligible next graduate program in the same branch after undergrad/masters. */
export function findNextGraduateProgram(
  character: Pick<
    Character,
    'age' | 'educationLevel' | 'educationStage' | 'degreeIds' | 'gpa' | 'scenarioId' | 'countryCode' | 'educationBranch'
  >,
  completedStage: 'undergraduate' | 'masters',
  branch: EducationBranch | string | undefined,
): Degree | null {
  if (!branch || branch === 'none') return null;
  const targetStage = completedStage === 'undergraduate' ? 'masters' : 'phd';
  const enrollable = getEnrollableDegrees({
    ...character,
    educationStage: completedStage,
  });
  return (
    enrollable.find((d) => d.stage === targetStage && d.branch === branch) ??
    null
  );
}

export function applyScholarshipToTuition(
  tuition: number,
  scholarshipDiscount?: number,
): { tuition: number; discountApplied: number } {
  const discount = Math.max(0, Math.min(0.75, scholarshipDiscount ?? 0));
  if (discount <= 0 || tuition <= 0) return { tuition, discountApplied: 0 };
  const discounted = Math.round(tuition * (1 - discount));
  return { tuition: discounted, discountApplied: tuition - discounted };
}

/** GPA bump + scholarship fraction from a passed study quiz (does not grant degrees). */
export function studyQuizRewards(passed: boolean): {
  gpaBump: number;
  scholarshipDiscount: number;
} {
  if (!passed) return { gpaBump: 0.02, scholarshipDiscount: 0 };
  return { gpaBump: 0.15, scholarshipDiscount: 0.25 };
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

  const state = educationStateOnEnroll(degree, character.educationLevel);
  return {
    ok: true,
    message: `You enrolled in ${degree.label}.`,
    degreeId: degree.id,
    annualCost: degree.baseAnnualCost,
    durationYears: degree.durationYears,
    newStage: state.educationStage,
    newEducationLevel: state.educationLevel,
  };
}

export interface DegreeEnrollmentTickResult {
  tuitionPaid: number;
  yearsRemaining?: number;
  graduated: boolean;
  graduation?: AdvanceEducationResult;
  newStage?: EducationStage;
  newEducationLevel?: EducationLevel;
  degreeId?: string;
  intelligenceGain?: number;
  educationBranch?: Character['educationBranch'];
}

/** Process one year of enrolled degree: pay tuition, decrement years, graduate if done. */
export function tickDegreeEnrollment(
  character: Pick<
    Character,
    | 'enrolledDegreeId'
    | 'enrolledDegreeYearsRemaining'
    | 'degreeIds'
    | 'countryCode'
    | 'bankBalance'
    | 'debt'
    | 'educationStage'
    | 'educationLevel'
    | 'educationBranch'
    | 'stats'
    | 'age'
    | 'scholarshipDiscount'
  >,
): DegreeEnrollmentTickResult {
  const degreeId = character.enrolledDegreeId;
  if (!degreeId) {
    return { tuitionPaid: 0, graduated: false };
  }

  const degree = DEGREES.find((d) => d.id === degreeId);
  if (!degree) {
    return { tuitionPaid: 0, graduated: false, yearsRemaining: 0 };
  }

  const rawTuition = scaleEducationCost(degree.baseAnnualCost, character.countryCode ?? 'US');
  const { tuition } = applyScholarshipToTuition(rawTuition, character.scholarshipDiscount);
  let yearsRemaining = character.enrolledDegreeYearsRemaining ?? degree.durationYears;
  yearsRemaining = Math.max(0, yearsRemaining - 1);

  if (yearsRemaining > 0) {
    return { tuitionPaid: tuition, yearsRemaining, graduated: false };
  }

  const adv = advanceEducation(character, degreeId);
  return {
    tuitionPaid: tuition,
    yearsRemaining: 0,
    graduated: adv.ok,
    graduation: adv,
    newStage: adv.newStage,
    newEducationLevel: adv.newEducationLevel,
    degreeId,
    intelligenceGain: adv.intelligenceGain,
    educationBranch: degree.branch,
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
  // Bachelor/diploma completion → graduate level for UI/jobs; stage stays undergrad/diploma for masters gates.
  // Masters/PhD completion → graduate level with masters/phd stage.
  const newEducationLevel: EducationLevel =
    degree.stage === 'undergraduate' ||
    degree.stage === 'diploma' ||
    degree.stage === 'masters' ||
    degree.stage === 'phd'
      ? 'graduate'
      : stagesToLegacyEducation(newStage);

  return {
    ok: true,
    message: `Congratulations! You earned your ${degree.shortLabel}.`,
    degreeEarned: degree,
    intelligenceGain: degree.intelligenceBonus,
    newStage,
    newEducationLevel: maxEducationLevel(character.educationLevel, newEducationLevel),
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
