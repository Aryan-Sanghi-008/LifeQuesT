// ─── LifeQuest Education System ──────────────────────────────────────────────
// Full education progression: Preschool → PhD, with branches and GPA tracking.

export type EducationStage =
  | "none"
  | "preschool"
  | "primary"
  | "middle_school"
  | "high_school"
  | "diploma"
  | "undergraduate"
  | "masters"
  | "phd";

export type EducationBranch =
  | "none"
  | "engineering"
  | "medical"
  | "commerce"
  | "arts"
  | "law"
  | "science"
  | "business"
  | "education"
  | "social_sciences"
  | "sports"
  | "vocational";

export interface Degree {
  id: string;
  label: string; // e.g. "Bachelor of Engineering"
  shortLabel: string; // e.g. "B.E."
  branch: EducationBranch;
  stage: "diploma" | "undergraduate" | "masters" | "phd";
  durationYears: number;
  minGPA?: number; // Minimum GPA to apply
  requiredPrior?: string; // Required degree id to enter (e.g. MBBS before MD)
  baseAnnualCost: number; // In USD — scaled by country multiplier
  intelligenceBonus: number; // Stat bonus on completion
  wealthEffect: number; // Career salary multiplier (1.0 = no change)
  unlocksCareerIds: string[]; // Career IDs this degree unlocks
  description: string;
}

export interface EducationRecord {
  stage: EducationStage;
  branch: EducationBranch;
  degreeId?: string; // Only set for diploma/undergrad/masters/phd
  institution: string;
  gpa: number; // 0.0–4.0 scale
  startAge: number;
  completedAge?: number;
  isCompleted: boolean;
  isDroppedOut: boolean;
  scholarshipAmount?: number; // Annual scholarship (reduces cost)
}

// ─── Degree Definitions ───────────────────────────────────────────────────────

export const DEGREES: Degree[] = [
  // ─── Diplomas / Certificates ────────────────────────────────────────────────

  {
    id: "diploma_cs",
    label: "Diploma in Computer Science",
    shortLabel: "Diploma CS",
    branch: "engineering",
    stage: "diploma",
    durationYears: 2,
    baseAnnualCost: 3000,
    intelligenceBonus: 8,
    wealthEffect: 1.2,
    unlocksCareerIds: ["junior_dev", "qa_intern", "data_analyst_junior"],
    description: "Foundational CS diploma for entry-level tech roles.",
  },

  {
    id: "diploma_business",
    label: "Business Administration Diploma",
    shortLabel: "Diploma BA",
    branch: "business",
    stage: "diploma",
    durationYears: 2,
    baseAnnualCost: 2500,
    intelligenceBonus: 6,
    wealthEffect: 1.1,
    unlocksCareerIds: ["sales_executive", "hr_assistant", "admin_officer"],
    description: "Practical business and management fundamentals.",
  },

  {
    id: "diploma_nursing",
    label: "Nursing Diploma",
    shortLabel: "Diploma Nursing",
    branch: "medical",
    stage: "diploma",
    durationYears: 3,
    baseAnnualCost: 4000,
    intelligenceBonus: 10,
    wealthEffect: 1.3,
    unlocksCareerIds: ["nurse_assistant", "healthcare_aide"],
    description: "Clinical nursing fundamentals and patient care.",
  },

  {
    id: "diploma_arts",
    label: "Fine Arts Diploma",
    shortLabel: "Diploma Arts",
    branch: "arts",
    stage: "diploma",
    durationYears: 2,
    baseAnnualCost: 2000,
    intelligenceBonus: 5,
    wealthEffect: 1.0,
    unlocksCareerIds: ["graphic_designer", "artist"],
    description: "Creative arts skills across painting, design, and media.",
  },

  {
    id: "diploma_culinary",
    label: "Culinary Arts Certificate",
    shortLabel: "Culinary Cert",
    branch: "vocational",
    stage: "diploma",
    durationYears: 2,
    baseAnnualCost: 5000,
    intelligenceBonus: 4,
    wealthEffect: 1.1,
    unlocksCareerIds: ["chef", "sous_chef", "pastry_chef"],
    description: "Professional kitchen skills and food science.",
  },

  // ─── Undergraduate Degrees ───────────────────────────────────────────────────

  {
    id: "bsc_cs",
    label: "Bachelor of Science (Computer Science)",
    shortLabel: "B.Sc. CS",
    branch: "engineering",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 12000,
    intelligenceBonus: 15,
    wealthEffect: 1.5,
    unlocksCareerIds: [
      "junior_dev",
      "senior_dev",
      "software_architect",
      "qa_engineer",
      "data_analyst",
    ],
    description: "Core computer science: algorithms, data structures, systems.",
  },

  {
    id: "be_civil",
    label: "Bachelor of Engineering (Civil)",
    shortLabel: "B.E. Civil",
    branch: "engineering",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 12000,
    intelligenceBonus: 14,
    wealthEffect: 1.4,
    unlocksCareerIds: ["civil_engineer", "structural_engineer", "site_manager"],
    description: "Infrastructure design, construction, and project management.",
  },

  {
    id: "be_mechanical",
    label: "Bachelor of Engineering (Mechanical)",
    shortLabel: "B.E. Mech",
    branch: "engineering",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 12000,
    intelligenceBonus: 14,
    wealthEffect: 1.4,
    unlocksCareerIds: [
      "mechanical_engineer",
      "automotive_engineer",
      "manufacturing_engineer",
    ],
    description: "Machines, thermodynamics, and manufacturing systems.",
  },

  {
    id: "mbbs",
    label: "Bachelor of Medicine & Surgery",
    shortLabel: "MBBS",
    branch: "medical",
    stage: "undergraduate",
    durationYears: 5,
    baseAnnualCost: 25000,
    minGPA: 3.2,
    intelligenceBonus: 25,
    wealthEffect: 2.5,
    unlocksCareerIds: ["general_practitioner", "intern_doctor"],
    description:
      "The foundational medical degree. Required for all clinical medicine careers.",
  },

  {
    id: "bsc_nursing",
    label: "Bachelor of Science (Nursing)",
    shortLabel: "B.Sc. Nursing",
    branch: "medical",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 10000,
    intelligenceBonus: 12,
    wealthEffect: 1.5,
    unlocksCareerIds: ["registered_nurse", "nurse"],
    description: "Advanced nursing with clinical specializations.",
  },

  {
    id: "bba",
    label: "Bachelor of Business Administration",
    shortLabel: "BBA",
    branch: "business",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 8000,
    intelligenceBonus: 10,
    wealthEffect: 1.3,
    unlocksCareerIds: [
      "business_analyst",
      "marketing_manager",
      "sales_manager",
      "hr_manager",
    ],
    description:
      "Core business management, marketing, and organizational theory.",
  },

  {
    id: "bcom",
    label: "Bachelor of Commerce",
    shortLabel: "B.Com",
    branch: "commerce",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 6000,
    intelligenceBonus: 10,
    wealthEffect: 1.3,
    unlocksCareerIds: ["accountant", "financial_analyst", "banker"],
    description: "Finance, accounting, taxation, and commerce law.",
  },

  {
    id: "llb",
    label: "Bachelor of Laws",
    shortLabel: "LL.B",
    branch: "law",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 15000,
    intelligenceBonus: 18,
    wealthEffect: 1.8,
    unlocksCareerIds: ["junior_lawyer", "paralegal", "legal_assistant"],
    description:
      "Legal principles, constitutional law, criminal law, and civil procedure.",
  },

  {
    id: "ba_economics",
    label: "Bachelor of Arts (Economics)",
    shortLabel: "B.A. Economics",
    branch: "social_sciences",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 8000,
    intelligenceBonus: 12,
    wealthEffect: 1.3,
    unlocksCareerIds: ["economist", "policy_analyst", "financial_analyst"],
    description: "Macro/microeconomics, statistics, and economic policy.",
  },

  {
    id: "bfa",
    label: "Bachelor of Fine Arts",
    shortLabel: "BFA",
    branch: "arts",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 10000,
    intelligenceBonus: 8,
    wealthEffect: 1.1,
    unlocksCareerIds: [
      "artist",
      "graphic_designer",
      "creative_director",
      "film_director",
    ],
    description: "Advanced creative arts, studio practice, and art theory.",
  },

  {
    id: "bsc_pharma",
    label: "Bachelor of Pharmacy",
    shortLabel: "B.Pharm",
    branch: "medical",
    stage: "undergraduate",
    durationYears: 4,
    baseAnnualCost: 14000,
    intelligenceBonus: 13,
    wealthEffect: 1.4,
    unlocksCareerIds: ["pharmacist", "drug_rep"],
    description: "Drug formulation, pharmacology, and clinical pharmacy.",
  },

  {
    id: "bsc_psychology",
    label: "Bachelor of Psychology",
    shortLabel: "B.Sc. Psych",
    branch: "social_sciences",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 9000,
    intelligenceBonus: 11,
    wealthEffect: 1.2,
    unlocksCareerIds: ["counselor", "social_worker", "hr_specialist"],
    description:
      "Behavioral science, clinical psychology, and cognitive studies.",
  },

  {
    id: "bpe",
    label: "Bachelor of Physical Education",
    shortLabel: "B.P.E.",
    branch: "sports",
    stage: "undergraduate",
    durationYears: 3,
    baseAnnualCost: 6000,
    intelligenceBonus: 6,
    wealthEffect: 1.1,
    unlocksCareerIds: [
      "sports_coach",
      "pe_teacher",
      "fitness_trainer",
      "athlete",
    ],
    description: "Sports science, exercise physiology, and coaching methods.",
  },

  // ─── Masters Degrees ─────────────────────────────────────────────────────────

  {
    id: "msc_cs",
    label: "Master of Science (Computer Science)",
    shortLabel: "M.Sc. CS",
    branch: "engineering",
    stage: "masters",
    durationYears: 2,
    baseAnnualCost: 20000,
    minGPA: 3.0,
    requiredPrior: "bsc_cs",
    intelligenceBonus: 12,
    wealthEffect: 1.8,
    unlocksCareerIds: [
      "senior_dev",
      "software_architect",
      "ai_engineer",
      "tech_lead",
      "cto",
    ],
    description:
      "Advanced algorithms, AI, machine learning, and systems research.",
  },

  {
    id: "mba",
    label: "Master of Business Administration",
    shortLabel: "MBA",
    branch: "business",
    stage: "masters",
    durationYears: 2,
    baseAnnualCost: 40000,
    minGPA: 2.8,
    intelligenceBonus: 15,
    wealthEffect: 2.0,
    unlocksCareerIds: [
      "ceo",
      "cfo",
      "director",
      "management_consultant",
      "venture_capitalist",
    ],
    description:
      "Elite business leadership, strategy, finance, and operations.",
  },

  {
    id: "md",
    label: "Doctor of Medicine (Specialization)",
    shortLabel: "MD",
    branch: "medical",
    stage: "masters",
    durationYears: 3,
    baseAnnualCost: 35000,
    minGPA: 3.5,
    requiredPrior: "mbbs",
    intelligenceBonus: 20,
    wealthEffect: 3.0,
    unlocksCareerIds: [
      "surgeon",
      "cardiologist",
      "neurologist",
      "psychiatrist",
      "specialist_doctor",
    ],
    description:
      "Medical specialization. Required for all surgical and specialist careers.",
  },

  {
    id: "llm",
    label: "Master of Laws",
    shortLabel: "LL.M",
    branch: "law",
    stage: "masters",
    durationYears: 1,
    baseAnnualCost: 22000,
    minGPA: 3.0,
    requiredPrior: "llb",
    intelligenceBonus: 12,
    wealthEffect: 2.0,
    unlocksCareerIds: ["lawyer", "corporate_lawyer", "judge"],
    description:
      "Advanced legal specialization: corporate, criminal, international law.",
  },

  {
    id: "msc_finance",
    label: "Master of Science (Finance)",
    shortLabel: "M.Sc. Finance",
    branch: "commerce",
    stage: "masters",
    durationYears: 2,
    baseAnnualCost: 25000,
    minGPA: 3.0,
    intelligenceBonus: 13,
    wealthEffect: 2.0,
    unlocksCareerIds: [
      "investment_banker",
      "hedge_fund_manager",
      "financial_director",
    ],
    description: "Quantitative finance, derivatives, and asset management.",
  },

  {
    id: "mfa",
    label: "Master of Fine Arts",
    shortLabel: "MFA",
    branch: "arts",
    stage: "masters",
    durationYears: 2,
    baseAnnualCost: 18000,
    intelligenceBonus: 8,
    wealthEffect: 1.3,
    unlocksCareerIds: ["creative_director", "film_director", "gallery_curator"],
    description: "Terminal degree for creative practice and artistic research.",
  },

  // ─── PhD / Doctoral ──────────────────────────────────────────────────────────

  {
    id: "phd_cs",
    label: "PhD in Computer Science",
    shortLabel: "PhD CS",
    branch: "engineering",
    stage: "phd",
    durationYears: 4,
    baseAnnualCost: 15000,
    minGPA: 3.5,
    requiredPrior: "msc_cs",
    intelligenceBonus: 20,
    wealthEffect: 2.5,
    unlocksCareerIds: [
      "researcher",
      "professor_cs",
      "ai_scientist",
      "tech_lead",
      "cto",
    ],
    description: "Original research in CS, AI, systems, or theory.",
  },

  {
    id: "phd_medicine",
    label: "PhD in Medical Research",
    shortLabel: "PhD Medicine",
    branch: "medical",
    stage: "phd",
    durationYears: 4,
    baseAnnualCost: 15000,
    minGPA: 3.7,
    requiredPrior: "md",
    intelligenceBonus: 22,
    wealthEffect: 2.8,
    unlocksCareerIds: [
      "medical_researcher",
      "chief_surgeon",
      "professor_medicine",
    ],
    description:
      "Advanced medical research contributing to clinical knowledge.",
  },

  {
    id: "phd_economics",
    label: "PhD in Economics",
    shortLabel: "PhD Economics",
    branch: "social_sciences",
    stage: "phd",
    durationYears: 5,
    baseAnnualCost: 12000,
    minGPA: 3.5,
    intelligenceBonus: 18,
    wealthEffect: 2.2,
    unlocksCareerIds: ["economist", "professor_economics", "policy_director"],
    description: "Economic theory, econometrics, and policy research.",
  },

  {
    id: "phd_law",
    label: "Doctor of Juridical Science",
    shortLabel: "S.J.D.",
    branch: "law",
    stage: "phd",
    durationYears: 3,
    baseAnnualCost: 20000,
    minGPA: 3.6,
    requiredPrior: "llm",
    intelligenceBonus: 18,
    wealthEffect: 2.5,
    unlocksCareerIds: ["judge", "professor_law", "attorney_general"],
    description:
      "Highest law degree. For academic law and high-level judicial positions.",
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getDegreeById(id: string): Degree | undefined {
  return DEGREES.find((d) => d.id === id);
}

export function getDegreesByBranch(branch: EducationBranch): Degree[] {
  return DEGREES.filter((d) => d.branch === branch);
}

export function getDegreesByStage(stage: Degree["stage"]): Degree[] {
  return DEGREES.filter((d) => d.stage === stage);
}

export function getDegreesUnlockingCareer(careerId: string): Degree[] {
  return DEGREES.filter((d) => d.unlocksCareerIds.includes(careerId));
}

/** Map legacy EducationLevel to new EducationStage for backward compat */
export function legacyLevelToStage(level: string): EducationStage {
  const map: Record<string, EducationStage> = {
    none: "none",
    elementary: "primary",
    secondary: "high_school",
    university: "undergraduate",
    graduate: "masters",
  };
  return map[level] ?? "none";
}

/** Map new EducationStage back to legacy EducationLevel */
export function stageToLegacyLevel(stage: EducationStage): string {
  const map: Record<EducationStage, string> = {
    none: "none",
    preschool: "none",
    primary: "elementary",
    middle_school: "elementary",
    high_school: "secondary",
    diploma: "secondary",
    undergraduate: "university",
    masters: "graduate",
    phd: "graduate",
  };
  return map[stage] ?? "none";
}

export const EDUCATION_STAGE_ORDER: EducationStage[] = [
  "none",
  "preschool",
  "primary",
  "middle_school",
  "high_school",
  "diploma",
  "undergraduate",
  "masters",
  "phd",
];

export function getEducationStageIndex(stage: EducationStage): number {
  return EDUCATION_STAGE_ORDER.indexOf(stage);
}

export const EDUCATION_BRANCH_LABELS: Record<EducationBranch, string> = {
  none: "Undecided",
  engineering: "Engineering & Technology",
  medical: "Medical & Health Sciences",
  commerce: "Commerce & Finance",
  arts: "Arts & Humanities",
  law: "Law & Political Science",
  science: "Pure Sciences",
  business: "Business Management",
  education: "Education & Teaching",
  social_sciences: "Social Sciences",
  sports: "Sports & Physical Education",
  vocational: "Vocational & Trades",
};
