import { Career, EducationLevel } from '../types';
import { JOBS } from '../data/gameData';

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
