// ─── LifeQuest Career Paths System ───────────────────────────────────────────
// 50+ career paths with full eligibility requirements and progression trees.

import type { CareerSkillNode } from '../types';

export type CareerCategory =
  | 'technology'
  | 'medicine'
  | 'law'
  | 'finance'
  | 'education'
  | 'arts'
  | 'sports'
  | 'military'
  | 'service'
  | 'business'
  | 'trades'
  | 'government'
  | 'science'
  | 'media';

export interface CareerRequirements {
  minAge: number;
  maxAge?: number;
  minEducationStage: string;        // EducationStage
  requiredDegreeIds?: string[];     // Any ONE of these degrees suffices
  requiredDegreeAll?: string[];     // ALL of these required
  minIntelligence: number;
  minFitness?: number;
  minSocial?: number;
  minAmbition?: number;
  requiredTraits?: string[];        // Any one of these traits helps
  requiredCountries?: string[];     // Restricted to certain countries
  forbiddenCriminalRecord?: boolean;
  minYearsExperience?: number;      // In any career
  certifications?: string[];        // e.g. ['bar_exam', 'cpa', 'pilot_license']
}

export interface CareerProgression {
  id: string;                       // Next career ID to progress to
  minYearsInRole: number;
  minPerformance: number;           // 0–100
  requiresPromotion: boolean;
}

export interface CareerPath {
  id: string;
  label: string;
  category: CareerCategory;
  description: string;
  company: string;                  // Default company name
  // Salary in USD — scaled by country multiplier
  baseSalary: number;
  maxSalary: number;
  requirements: CareerRequirements;
  progressionPaths: CareerProgression[];
  skillTree?: CareerSkillNode[];
  isEntryLevel: boolean;
  seniorityLevel: 1 | 2 | 3 | 4 | 5; // 1=entry, 5=top
  perks?: string[];
  stressLevel: number;              // 1–10
  workLifeBalance: number;          // 1–10 (10=best)
}

// ─── Career Path Definitions ─────────────────────────────────────────────────

export const CAREER_PATHS: CareerPath[] = [

  // ═══ TECHNOLOGY ═══════════════════════════════════════════════════════════

  { id: 'qa_intern',
    label: 'QA Intern', category: 'technology', isEntryLevel: true, seniorityLevel: 1,
    description: 'Test software applications and report bugs.',
    company: 'Tech Startup', baseSalary: 18000, maxSalary: 28000, stressLevel: 3, workLifeBalance: 8,
    requirements: { minAge: 18, minEducationStage: 'high_school', minIntelligence: 35, minAmbition: 30 },
    progressionPaths: [{ id: 'qa_engineer', minYearsInRole: 1, minPerformance: 55, requiresPromotion: false }] },

  { id: 'junior_dev',
    label: 'Junior Developer', category: 'technology', isEntryLevel: true, seniorityLevel: 1,
    description: 'Write code, fix bugs, and learn from senior engineers.',
    company: 'Tech Corp', baseSalary: 35000, maxSalary: 55000, stressLevel: 4, workLifeBalance: 7,
    requirements: { minAge: 18, minEducationStage: 'diploma', requiredDegreeIds: ['diploma_cs', 'bsc_cs', 'be_civil'], minIntelligence: 55 },
    progressionPaths: [{ id: 'senior_dev', minYearsInRole: 3, minPerformance: 65, requiresPromotion: true }] },

  { id: 'qa_engineer',
    label: 'QA Engineer', category: 'technology', isEntryLevel: false, seniorityLevel: 2,
    description: 'Design test plans and ensure software quality standards.',
    company: 'Tech Corp', baseSalary: 55000, maxSalary: 80000, stressLevel: 4, workLifeBalance: 7,
    requirements: { minAge: 20, minEducationStage: 'undergraduate', minIntelligence: 55, minYearsExperience: 1 },
    progressionPaths: [{ id: 'senior_dev', minYearsInRole: 3, minPerformance: 70, requiresPromotion: true }] },

  { id: 'data_analyst',
    label: 'Data Analyst', category: 'technology', isEntryLevel: true, seniorityLevel: 2,
    description: 'Analyze data sets to drive business decisions.',
    company: 'Analytics Co.', baseSalary: 50000, maxSalary: 75000, stressLevel: 4, workLifeBalance: 7,
    requirements: { minAge: 21, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_cs', 'ba_economics', 'bcom'], minIntelligence: 60 },
    progressionPaths: [{ id: 'data_scientist', minYearsInRole: 3, minPerformance: 70, requiresPromotion: true }] },

  { id: 'senior_dev',
    label: 'Senior Developer', category: 'technology', isEntryLevel: false, seniorityLevel: 3,
    description: 'Lead development projects and mentor junior developers.',
    company: 'Tech Corp', baseSalary: 85000, maxSalary: 130000, stressLevel: 5, workLifeBalance: 6,
    requirements: { minAge: 24, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_cs', 'msc_cs'], minIntelligence: 70, minYearsExperience: 3 },
    progressionPaths: [{ id: 'software_architect', minYearsInRole: 4, minPerformance: 75, requiresPromotion: true }, { id: 'tech_lead', minYearsInRole: 3, minPerformance: 80, requiresPromotion: true }] },

  { id: 'software_architect',
    label: 'Software Architect', category: 'technology', isEntryLevel: false, seniorityLevel: 4,
    description: 'Design system architecture and technical strategy.',
    company: 'Big Tech', baseSalary: 130000, maxSalary: 200000, stressLevel: 6, workLifeBalance: 5,
    requirements: { minAge: 28, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_cs', 'msc_cs', 'phd_cs'], minIntelligence: 80, minYearsExperience: 7 },
    progressionPaths: [{ id: 'cto', minYearsInRole: 5, minPerformance: 85, requiresPromotion: true }] },

  { id: 'ai_engineer',
    label: 'AI/ML Engineer', category: 'technology', isEntryLevel: false, seniorityLevel: 3,
    description: 'Build machine learning models and AI systems.',
    company: 'AI Labs', baseSalary: 120000, maxSalary: 200000, stressLevel: 6, workLifeBalance: 6,
    requirements: { minAge: 24, minEducationStage: 'masters', requiredDegreeIds: ['msc_cs', 'phd_cs'], minIntelligence: 85 },
    progressionPaths: [{ id: 'ai_researcher', minYearsInRole: 3, minPerformance: 80, requiresPromotion: true }] },

  { id: 'tech_lead',
    label: 'Tech Lead', category: 'technology', isEntryLevel: false, seniorityLevel: 4,
    description: 'Lead engineering teams and technical direction.',
    company: 'Big Tech', baseSalary: 150000, maxSalary: 220000, stressLevel: 7, workLifeBalance: 5,
    requirements: { minAge: 28, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_cs', 'msc_cs'], minIntelligence: 80, minSocial: 55, minYearsExperience: 6 },
    progressionPaths: [{ id: 'cto', minYearsInRole: 4, minPerformance: 85, requiresPromotion: true }] },

  { id: 'cto',
    label: 'Chief Technology Officer', category: 'technology', isEntryLevel: false, seniorityLevel: 5,
    description: 'Lead company technology vision and engineering organization.',
    company: 'Big Tech', baseSalary: 250000, maxSalary: 600000, stressLevel: 9, workLifeBalance: 3,
    requirements: { minAge: 35, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_cs', 'msc_cs', 'phd_cs'], minIntelligence: 88, minAmbition: 80, minYearsExperience: 12 },
    progressionPaths: [] },

  // ═══ MEDICINE ══════════════════════════════════════════════════════════════

  { id: 'intern_doctor',
    label: 'Medical Intern', category: 'medicine', isEntryLevel: true, seniorityLevel: 1,
    description: 'First year of clinical practice under supervision.',
    company: 'City Hospital', baseSalary: 45000, maxSalary: 55000, stressLevel: 8, workLifeBalance: 2,
    requirements: { minAge: 23, minEducationStage: 'undergraduate', requiredDegreeAll: ['mbbs'], minIntelligence: 75, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'general_practitioner', minYearsInRole: 1, minPerformance: 60, requiresPromotion: false }] },

  { id: 'general_practitioner',
    label: 'General Practitioner', category: 'medicine', isEntryLevel: false, seniorityLevel: 2,
    description: 'Primary care physician treating a wide range of conditions.',
    company: 'City Hospital', baseSalary: 120000, maxSalary: 160000, stressLevel: 7, workLifeBalance: 4,
    requirements: { minAge: 25, minEducationStage: 'undergraduate', requiredDegreeAll: ['mbbs'], minIntelligence: 78, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'specialist_doctor', minYearsInRole: 3, minPerformance: 70, requiresPromotion: true }, { id: 'surgeon', minYearsInRole: 4, minPerformance: 80, requiresPromotion: true }] },

  { id: 'specialist_doctor',
    label: 'Specialist Doctor', category: 'medicine', isEntryLevel: false, seniorityLevel: 3,
    description: 'Focus on a medical specialty with deeper expertise.',
    company: 'Medical Centre', baseSalary: 180000, maxSalary: 280000, stressLevel: 7, workLifeBalance: 4,
    requirements: { minAge: 30, minEducationStage: 'masters', requiredDegreeAll: ['mbbs', 'md'], minIntelligence: 82, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'chief_surgeon', minYearsInRole: 8, minPerformance: 85, requiresPromotion: true }] },

  { id: 'surgeon',
    label: 'Surgeon', category: 'medicine', isEntryLevel: false, seniorityLevel: 4,
    description: 'Perform complex surgical procedures.',
    company: 'City Hospital', baseSalary: 300000, maxSalary: 500000, stressLevel: 9, workLifeBalance: 2,
    requirements: { minAge: 32, minEducationStage: 'masters', requiredDegreeAll: ['mbbs', 'md'], minIntelligence: 88, minFitness: 60, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'chief_surgeon', minYearsInRole: 8, minPerformance: 88, requiresPromotion: true }] },

  { id: 'chief_surgeon',
    label: 'Chief Surgeon', category: 'medicine', isEntryLevel: false, seniorityLevel: 5,
    description: 'Lead surgical department and train future surgeons.',
    company: 'National Medical Center', baseSalary: 500000, maxSalary: 1000000, stressLevel: 10, workLifeBalance: 2,
    requirements: { minAge: 42, minEducationStage: 'masters', requiredDegreeAll: ['mbbs', 'md'], minIntelligence: 92, forbiddenCriminalRecord: true, minYearsExperience: 15 },
    progressionPaths: [] },

  { id: 'nurse',
    label: 'Registered Nurse', category: 'medicine', isEntryLevel: true, seniorityLevel: 2,
    description: 'Provide patient care and coordinate medical treatments.',
    company: 'City Hospital', baseSalary: 60000, maxSalary: 85000, stressLevel: 7, workLifeBalance: 4,
    requirements: { minAge: 21, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_nursing', 'diploma_nursing'], minIntelligence: 55, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'head_nurse', minYearsInRole: 5, minPerformance: 70, requiresPromotion: true }] },

  { id: 'pharmacist',
    label: 'Pharmacist', category: 'medicine', isEntryLevel: true, seniorityLevel: 2,
    description: 'Dispense medications and advise on drug interactions.',
    company: 'PharmaCo', baseSalary: 80000, maxSalary: 120000, stressLevel: 4, workLifeBalance: 6,
    requirements: { minAge: 22, minEducationStage: 'undergraduate', requiredDegreeIds: ['bsc_pharma'], minIntelligence: 65, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'chief_pharmacist', minYearsInRole: 6, minPerformance: 70, requiresPromotion: true }] },

  // ═══ LAW ══════════════════════════════════════════════════════════════════

  { id: 'paralegal',
    label: 'Paralegal', category: 'law', isEntryLevel: true, seniorityLevel: 1,
    description: 'Assist lawyers with legal research and document preparation.',
    company: 'Law Firm', baseSalary: 35000, maxSalary: 55000, stressLevel: 5, workLifeBalance: 6,
    requirements: { minAge: 18, minEducationStage: 'high_school', minIntelligence: 50 },
    progressionPaths: [{ id: 'junior_lawyer', minYearsInRole: 3, minPerformance: 65, requiresPromotion: false }] },

  { id: 'junior_lawyer',
    label: 'Junior Lawyer', category: 'law', isEntryLevel: true, seniorityLevel: 2,
    description: 'Practice law under senior partner supervision.',
    company: 'Law Firm', baseSalary: 65000, maxSalary: 90000, stressLevel: 6, workLifeBalance: 4,
    requirements: { minAge: 24, minEducationStage: 'undergraduate', requiredDegreeIds: ['llb'], minIntelligence: 72, certifications: ['bar_exam'] },
    progressionPaths: [{ id: 'lawyer', minYearsInRole: 3, minPerformance: 70, requiresPromotion: true }] },

  { id: 'lawyer',
    label: 'Lawyer', category: 'law', isEntryLevel: false, seniorityLevel: 3,
    description: 'Represent clients in court and advise on legal matters.',
    company: 'Law Firm', baseSalary: 110000, maxSalary: 180000, stressLevel: 7, workLifeBalance: 3,
    requirements: { minAge: 27, minEducationStage: 'undergraduate', requiredDegreeIds: ['llb', 'llm'], minIntelligence: 75, certifications: ['bar_exam'] },
    progressionPaths: [{ id: 'corporate_lawyer', minYearsInRole: 5, minPerformance: 75, requiresPromotion: true }, { id: 'judge', minYearsInRole: 12, minPerformance: 88, requiresPromotion: true }] },

  { id: 'corporate_lawyer',
    label: 'Corporate Lawyer', category: 'law', isEntryLevel: false, seniorityLevel: 4,
    description: 'Handle mergers, acquisitions, and corporate legal strategy.',
    company: 'Elite Law Firm', baseSalary: 200000, maxSalary: 400000, stressLevel: 8, workLifeBalance: 2,
    requirements: { minAge: 30, minEducationStage: 'masters', requiredDegreeIds: ['llm'], minIntelligence: 82, certifications: ['bar_exam'] },
    progressionPaths: [{ id: 'judge', minYearsInRole: 10, minPerformance: 90, requiresPromotion: true }] },

  { id: 'judge',
    label: 'Judge', category: 'law', isEntryLevel: false, seniorityLevel: 5,
    description: 'Preside over court cases and interpret the law.',
    company: 'District Court', baseSalary: 180000, maxSalary: 300000, stressLevel: 6, workLifeBalance: 5,
    requirements: { minAge: 42, minEducationStage: 'masters', requiredDegreeIds: ['llm', 'phd_law'], minIntelligence: 88, certifications: ['bar_exam'], forbiddenCriminalRecord: true, minYearsExperience: 15 },
    progressionPaths: [] },

  // ═══ FINANCE ══════════════════════════════════════════════════════════════

  { id: 'accountant',
    label: 'Accountant', category: 'finance', isEntryLevel: true, seniorityLevel: 2,
    description: 'Manage financial records and prepare tax returns.',
    company: 'Accounting Firm', baseSalary: 55000, maxSalary: 80000, stressLevel: 4, workLifeBalance: 6,
    requirements: { minAge: 21, minEducationStage: 'undergraduate', requiredDegreeIds: ['bcom', 'bba'], minIntelligence: 60 },
    progressionPaths: [{ id: 'senior_accountant', minYearsInRole: 4, minPerformance: 65, requiresPromotion: true }] },

  { id: 'financial_analyst',
    label: 'Financial Analyst', category: 'finance', isEntryLevel: true, seniorityLevel: 2,
    description: 'Analyze financial data and advise on investments.',
    company: 'Bank of Commerce', baseSalary: 70000, maxSalary: 110000, stressLevel: 5, workLifeBalance: 5,
    requirements: { minAge: 21, minEducationStage: 'undergraduate', requiredDegreeIds: ['bcom', 'bba', 'ba_economics'], minIntelligence: 65 },
    progressionPaths: [{ id: 'investment_banker', minYearsInRole: 4, minPerformance: 75, requiresPromotion: true }] },

  { id: 'banker',
    label: 'Banker', category: 'finance', isEntryLevel: true, seniorityLevel: 2,
    description: 'Manage client accounts and provide financial services.',
    company: 'National Bank', baseSalary: 60000, maxSalary: 90000, stressLevel: 5, workLifeBalance: 6,
    requirements: { minAge: 21, minEducationStage: 'undergraduate', requiredDegreeIds: ['bcom', 'bba', 'ba_economics'], minIntelligence: 62 },
    progressionPaths: [{ id: 'investment_banker', minYearsInRole: 5, minPerformance: 70, requiresPromotion: true }] },

  { id: 'investment_banker',
    label: 'Investment Banker', category: 'finance', isEntryLevel: false, seniorityLevel: 4,
    description: 'Execute large financial transactions and advisory deals.',
    company: 'Goldman Capital', baseSalary: 180000, maxSalary: 400000, stressLevel: 9, workLifeBalance: 2,
    requirements: { minAge: 26, minEducationStage: 'masters', requiredDegreeIds: ['mba', 'msc_finance'], minIntelligence: 82, minAmbition: 75 },
    progressionPaths: [{ id: 'hedge_fund_manager', minYearsInRole: 6, minPerformance: 85, requiresPromotion: true }] },

  { id: 'hedge_fund_manager',
    label: 'Hedge Fund Manager', category: 'finance', isEntryLevel: false, seniorityLevel: 5,
    description: 'Manage billions in alternative investments for elite clients.',
    company: 'Alpha Capital', baseSalary: 500000, maxSalary: 5000000, stressLevel: 10, workLifeBalance: 2,
    requirements: { minAge: 35, minEducationStage: 'masters', requiredDegreeIds: ['mba', 'msc_finance'], minIntelligence: 90, minAmbition: 88, minYearsExperience: 10 },
    progressionPaths: [] },

  // ═══ EDUCATION ════════════════════════════════════════════════════════════

  { id: 'teaching_assistant',
    label: 'Teaching Assistant', category: 'education', isEntryLevel: true, seniorityLevel: 1,
    description: 'Support classroom learning and assist lead teachers.',
    company: 'Public School', baseSalary: 22000, maxSalary: 32000, stressLevel: 3, workLifeBalance: 8,
    requirements: { minAge: 18, minEducationStage: 'high_school', minIntelligence: 45, minSocial: 45 },
    progressionPaths: [{ id: 'teacher', minYearsInRole: 2, minPerformance: 60, requiresPromotion: false }] },

  { id: 'teacher',
    label: 'Teacher', category: 'education', isEntryLevel: true, seniorityLevel: 2,
    description: 'Educate students and develop curriculum.',
    company: 'Public School', baseSalary: 45000, maxSalary: 70000, stressLevel: 5, workLifeBalance: 7,
    requirements: { minAge: 22, minEducationStage: 'undergraduate', minIntelligence: 55, minSocial: 55 },
    progressionPaths: [{ id: 'school_principal', minYearsInRole: 8, minPerformance: 75, requiresPromotion: true }] },

  { id: 'professor_cs',
    label: 'Computer Science Professor', category: 'education', isEntryLevel: false, seniorityLevel: 4,
    description: 'Teach advanced CS at university level and conduct research.',
    company: 'State University', baseSalary: 85000, maxSalary: 160000, stressLevel: 5, workLifeBalance: 6,
    requirements: { minAge: 28, minEducationStage: 'phd', requiredDegreeIds: ['phd_cs'], minIntelligence: 85 },
    progressionPaths: [{ id: 'department_chair', minYearsInRole: 8, minPerformance: 80, requiresPromotion: true }] },

  // ═══ SPORTS ═══════════════════════════════════════════════════════════════

  { id: 'athlete',
    label: 'Professional Athlete', category: 'sports', isEntryLevel: true, seniorityLevel: 2,
    description: 'Compete professionally in your chosen sport.',
    company: 'Sports Club', baseSalary: 40000, maxSalary: 2000000, stressLevel: 7, workLifeBalance: 5,
    requirements: { minAge: 16, maxAge: 35, minEducationStage: 'none', minIntelligence: 20, minFitness: 80 },
    progressionPaths: [{ id: 'sports_captain', minYearsInRole: 5, minPerformance: 85, requiresPromotion: true }] },

  { id: 'sports_coach',
    label: 'Sports Coach', category: 'sports', isEntryLevel: true, seniorityLevel: 2,
    description: 'Train athletes and develop sports programs.',
    company: 'Sports Academy', baseSalary: 35000, maxSalary: 80000, stressLevel: 4, workLifeBalance: 7,
    requirements: { minAge: 22, minEducationStage: 'undergraduate', requiredDegreeIds: ['bpe'], minIntelligence: 45, minFitness: 65 },
    progressionPaths: [{ id: 'head_coach', minYearsInRole: 5, minPerformance: 70, requiresPromotion: true }] },

  { id: 'fitness_trainer',
    label: 'Personal Trainer', category: 'sports', isEntryLevel: true, seniorityLevel: 1,
    description: 'Design workout programs and train individual clients.',
    company: 'Gym & Wellness', baseSalary: 30000, maxSalary: 60000, stressLevel: 3, workLifeBalance: 7,
    requirements: { minAge: 18, minEducationStage: 'high_school', minIntelligence: 35, minFitness: 70 },
    progressionPaths: [{ id: 'sports_coach', minYearsInRole: 4, minPerformance: 65, requiresPromotion: false }] },

  // ═══ ARTS & MEDIA ═════════════════════════════════════════════════════════

  { id: 'artist',
    label: 'Artist', category: 'arts', isEntryLevel: true, seniorityLevel: 2,
    description: 'Create original artworks and sell to collectors and galleries.',
    company: 'Freelance', baseSalary: 20000, maxSalary: 500000, stressLevel: 4, workLifeBalance: 8,
    requirements: { minAge: 18, minEducationStage: 'none', minIntelligence: 35 },
    progressionPaths: [{ id: 'creative_director', minYearsInRole: 8, minPerformance: 80, requiresPromotion: true }] },

  { id: 'graphic_designer',
    label: 'Graphic Designer', category: 'arts', isEntryLevel: true, seniorityLevel: 2,
    description: 'Create visual content for brands, apps, and media.',
    company: 'Design Studio', baseSalary: 42000, maxSalary: 85000, stressLevel: 4, workLifeBalance: 7,
    requirements: { minAge: 18, minEducationStage: 'diploma', requiredDegreeIds: ['diploma_arts', 'bfa'], minIntelligence: 45 },
    progressionPaths: [{ id: 'creative_director', minYearsInRole: 6, minPerformance: 75, requiresPromotion: true }] },

  { id: 'creative_director',
    label: 'Creative Director', category: 'arts', isEntryLevel: false, seniorityLevel: 4,
    description: 'Lead creative teams and shape visual brand identity.',
    company: 'Creative Agency', baseSalary: 110000, maxSalary: 200000, stressLevel: 6, workLifeBalance: 5,
    requirements: { minAge: 30, minEducationStage: 'undergraduate', requiredDegreeIds: ['bfa', 'mfa'], minIntelligence: 65, minSocial: 60 },
    progressionPaths: [] },

  { id: 'journalist',
    label: 'Journalist', category: 'media', isEntryLevel: true, seniorityLevel: 2,
    description: 'Investigate and report news stories.',
    company: 'Daily Tribune', baseSalary: 38000, maxSalary: 80000, stressLevel: 6, workLifeBalance: 4,
    requirements: { minAge: 20, minEducationStage: 'undergraduate', minIntelligence: 60, minSocial: 55 },
    progressionPaths: [{ id: 'editor_in_chief', minYearsInRole: 8, minPerformance: 80, requiresPromotion: true }] },

  // ═══ BUSINESS ═════════════════════════════════════════════════════════════

  { id: 'sales_executive',
    label: 'Sales Executive', category: 'business', isEntryLevel: true, seniorityLevel: 1,
    description: 'Drive revenue through client acquisition and relationship building.',
    company: 'Business Corp', baseSalary: 35000, maxSalary: 90000, stressLevel: 6, workLifeBalance: 5,
    requirements: { minAge: 18, minEducationStage: 'high_school', minIntelligence: 40, minSocial: 60 },
    progressionPaths: [{ id: 'sales_manager', minYearsInRole: 3, minPerformance: 70, requiresPromotion: true }] },

  { id: 'entrepreneur',
    label: 'Entrepreneur', category: 'business', isEntryLevel: true, seniorityLevel: 3,
    description: 'Build and run your own business venture.',
    company: 'Self-Employed', baseSalary: 0, maxSalary: 10000000, stressLevel: 9, workLifeBalance: 3,
    requirements: { minAge: 18, minEducationStage: 'none', minIntelligence: 50, minAmbition: 80 },
    progressionPaths: [{ id: 'ceo', minYearsInRole: 5, minPerformance: 80, requiresPromotion: false }] },

  { id: 'ceo',
    label: 'Chief Executive Officer', category: 'business', isEntryLevel: false, seniorityLevel: 5,
    description: 'Lead an organization, set strategy, and drive results.',
    company: 'Corporation', baseSalary: 300000, maxSalary: 5000000, stressLevel: 9, workLifeBalance: 2,
    requirements: { minAge: 35, minEducationStage: 'masters', requiredDegreeIds: ['mba'], minIntelligence: 85, minAmbition: 85, minSocial: 70, minYearsExperience: 12 },
    progressionPaths: [] },

  // ═══ GOVERNMENT / MILITARY ════════════════════════════════════════════════

  { id: 'police_officer',
    label: 'Police Officer', category: 'government', isEntryLevel: true, seniorityLevel: 2,
    description: 'Serve and protect the community.',
    company: 'City Police Dept', baseSalary: 45000, maxSalary: 70000, stressLevel: 8, workLifeBalance: 4,
    requirements: { minAge: 18, maxAge: 35, minEducationStage: 'high_school', minIntelligence: 45, minFitness: 65, forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'detective', minYearsInRole: 5, minPerformance: 70, requiresPromotion: true }] },

  { id: 'detective',
    label: 'Detective', category: 'government', isEntryLevel: false, seniorityLevel: 3,
    description: 'Investigate criminal cases and gather evidence.',
    company: 'City Police Dept', baseSalary: 70000, maxSalary: 100000, stressLevel: 7, workLifeBalance: 4,
    requirements: { minAge: 25, minEducationStage: 'undergraduate', minIntelligence: 65, forbiddenCriminalRecord: true, minYearsExperience: 5 },
    progressionPaths: [{ id: 'chief_of_police', minYearsInRole: 8, minPerformance: 80, requiresPromotion: true }] },

  { id: 'pilot',
    label: 'Commercial Pilot', category: 'government', isEntryLevel: false, seniorityLevel: 3,
    description: 'Fly commercial aircraft and transport passengers.',
    company: 'AirLine Co.', baseSalary: 100000, maxSalary: 220000, stressLevel: 6, workLifeBalance: 5,
    requirements: { minAge: 23, maxAge: 65, minEducationStage: 'undergraduate', minIntelligence: 72, minFitness: 75, certifications: ['pilot_license', 'atp_certificate'], forbiddenCriminalRecord: true },
    progressionPaths: [{ id: 'airline_captain', minYearsInRole: 8, minPerformance: 80, requiresPromotion: true }] },

  // ═══ FOOD & SERVICE ═══════════════════════════════════════════════════════

  { id: 'retail_associate',
    label: 'Retail Associate', category: 'service', isEntryLevel: true, seniorityLevel: 1,
    description: 'Work part-time at a retail store while finishing school.',
    company: 'Local Retail', baseSalary: 12000, maxSalary: 22000, stressLevel: 3, workLifeBalance: 7,
    requirements: { minAge: 16, minEducationStage: 'high_school', minIntelligence: 30 },
    progressionPaths: [{ id: 'sales_executive', minYearsInRole: 2, minPerformance: 55, requiresPromotion: false }] },

  { id: 'food_service_worker',
    label: 'Food Service Worker', category: 'service', isEntryLevel: true, seniorityLevel: 1,
    description: 'Serve customers and earn your first paycheck in hospitality.',
    company: 'Quick Bites', baseSalary: 14000, maxSalary: 24000, stressLevel: 4, workLifeBalance: 6,
    requirements: { minAge: 16, minEducationStage: 'high_school', minIntelligence: 28 },
    progressionPaths: [{ id: 'chef', minYearsInRole: 3, minPerformance: 60, requiresPromotion: false }] },

  { id: 'chef',
    label: 'Chef', category: 'service', isEntryLevel: true, seniorityLevel: 2,
    description: 'Create culinary dishes in professional kitchen environments.',
    company: 'Restaurant', baseSalary: 35000, maxSalary: 70000, stressLevel: 7, workLifeBalance: 3,
    requirements: { minAge: 18, minEducationStage: 'diploma', requiredDegreeIds: ['diploma_culinary'], minIntelligence: 35 },
    progressionPaths: [{ id: 'head_chef', minYearsInRole: 5, minPerformance: 75, requiresPromotion: true }] },

  { id: 'head_chef',
    label: 'Head Chef / Executive Chef', category: 'service', isEntryLevel: false, seniorityLevel: 4,
    description: 'Lead the kitchen, create menus, and manage culinary staff.',
    company: 'Fine Dining Restaurant', baseSalary: 80000, maxSalary: 150000, stressLevel: 8, workLifeBalance: 3,
    requirements: { minAge: 28, minEducationStage: 'diploma', requiredDegreeIds: ['diploma_culinary'], minIntelligence: 50, minYearsExperience: 8 },
    progressionPaths: [{ id: 'celebrity_chef', minYearsInRole: 6, minPerformance: 90, requiresPromotion: true }] },

  // ═══ SCIENCE ══════════════════════════════════════════════════════════════

  { id: 'researcher',
    label: 'Research Scientist', category: 'science', isEntryLevel: false, seniorityLevel: 3,
    description: 'Conduct scientific research and publish findings.',
    company: 'Research Institute', baseSalary: 70000, maxSalary: 120000, stressLevel: 5, workLifeBalance: 7,
    requirements: { minAge: 26, minEducationStage: 'masters', minIntelligence: 80 },
    progressionPaths: [{ id: 'principal_researcher', minYearsInRole: 6, minPerformance: 78, requiresPromotion: true }] },

  { id: 'ai_researcher',
    label: 'AI Research Scientist', category: 'science', isEntryLevel: false, seniorityLevel: 4,
    description: 'Push the frontiers of artificial intelligence and machine learning.',
    company: 'AI Research Lab', baseSalary: 150000, maxSalary: 300000, stressLevel: 6, workLifeBalance: 6,
    requirements: { minAge: 28, minEducationStage: 'phd', requiredDegreeIds: ['phd_cs'], minIntelligence: 90 },
    progressionPaths: [] },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

let _phaseBCareers: CareerPath[] | undefined;

function getPhaseBCareers(): CareerPath[] {
  if (!_phaseBCareers) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _phaseBCareers = require('./careerPathsPhaseB').PHASE_B_CAREER_PATHS as CareerPath[];
  }
  return _phaseBCareers;
}

function allCareerPaths(): CareerPath[] {
  return [...CAREER_PATHS, ...getPhaseBCareers()];
}

export function getCareerById(id: string): CareerPath | undefined {
  return allCareerPaths().find(c => c.id === id);
}

export function getCareersByCategory(category: CareerCategory): CareerPath[] {
  return allCareerPaths().filter(c => c.category === category);
}

export function getEntryLevelCareers(): CareerPath[] {
  return allCareerPaths().filter(c => c.isEntryLevel);
}

export function getAllCareerPaths(): CareerPath[] {
  return allCareerPaths();
}

/** Get progression options for the current career */
export function getProgressionOptions(careerId: string): CareerPath[] {
  const current = getCareerById(careerId);
  if (!current) return [];
  return current.progressionPaths
    .map(p => getCareerById(p.id))
    .filter(Boolean) as CareerPath[];
}

/** Convert CareerPath to legacy Career format */
export function careerPathToLegacy(cp: CareerPath, yearsEmployed = 0, performance = 50) {
  return {
    title: cp.label,
    company: cp.company,
    salary: cp.baseSalary,
    yearsEmployed,
    performance,
  };
}
