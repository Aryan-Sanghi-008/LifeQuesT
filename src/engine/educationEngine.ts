import { EducationLevel } from '../types';
import { clamp } from './economyEngine';

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
  return age >= 13 && age <= 24 && educationLevel !== 'graduate';
}
