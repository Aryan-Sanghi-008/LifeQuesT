import {
  jobToCareer, workHarder, askForRaise, applyForPromotion, incrementCareerYear,
  checkCareerEligibility, syncJobLabel, applyJobTitleUpdate, getCountrySalary,
  getEligibleCareers, getPromotionTarget,
} from '@engine/careerEngine';
import { getCareerById } from '@data/careerPaths';

describe('jobToCareer', () => {
  it('maps job title to career', () => {
    const career = jobToCareer('Junior Developer');
    expect(career?.title).toBe('Junior Developer');
    expect(career?.salary).toBeGreaterThan(0);
  });

  it('returns null for student', () => {
    expect(jobToCareer('Student')).toBeNull();
  });
});

describe('workHarder', () => {
  it('increases performance up to 100', () => {
    const career = {
      title: 'Doctor', company: 'Hospital', salary: 100000, yearsEmployed: 1, performance: 95,
    };
    expect(workHarder(career).performance).toBe(100);
  });
});

describe('askForRaise', () => {
  it('increases salary on success', () => {
    const career = {
      title: 'Doctor', company: 'Hospital', salary: 100000, yearsEmployed: 1, performance: 50,
    };
    const raised = askForRaise(career, true);
    expect(raised.salary).toBeGreaterThan(career.salary);
  });

  it('leaves salary unchanged on failure', () => {
    const career = {
      title: 'Doctor', company: 'Hospital', salary: 100000, yearsEmployed: 1, performance: 50,
    };
    expect(askForRaise(career, false).salary).toBe(100000);
  });
});

describe('applyForPromotion', () => {
  it('promotes when successful with good performance', () => {
    const career = {
      title: 'Junior Developer', company: 'Tech Corp', salary: 35000, yearsEmployed: 3, performance: 70,
    };
    const result = applyForPromotion(career, true, {
      age: 25,
      educationLevel: 'university',
      educationStage: 'undergraduate',
      degreeIds: ['bsc_cs'],
      certificationIds: [],
      totalCareerYears: 3,
      stats: {
        health: 70, happiness: 70, intelligence: 80, wealth: 50,
        fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
      },
      traits: [],
      countryCode: 'US',
      criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
      assets: [],
      career,
    });
    expect(result.newTitle).toBeDefined();
    expect(result.career.salary).toBeGreaterThanOrEqual(career.salary);
  });

  it('blocks promotion when target role requirements are not met', () => {
    const career = {
      title: 'Paralegal', company: 'Law Firm', salary: 35000, yearsEmployed: 3, performance: 70,
    };
    const result = applyForPromotion(career, true, {
      age: 24,
      educationLevel: 'secondary',
      educationStage: 'high_school',
      degreeIds: [],
      certificationIds: [],
      totalCareerYears: 3,
      stats: {
        health: 70, happiness: 70, intelligence: 55, wealth: 50,
        fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
      },
      traits: [],
      countryCode: 'US',
      criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
      assets: [],
      career,
    });
    expect(result.newTitle).toBeUndefined();
    expect(result.career.title).toBe('Paralegal');
    expect(result.career.performance).toBeGreaterThan(career.performance);
  });
});

describe('applyJobTitleUpdate', () => {
  it('sets country-localized salary for non-US country', () => {
    const path = getCareerById('senior_dev')!;
    const usSalary = getCountrySalary(path.baseSalary, 'US');
    const inSalary = getCountrySalary(path.baseSalary, 'IN');
    const { career } = applyJobTitleUpdate('Senior Developer', 'IN', null);
    expect(career?.salary).toBe(inSalary);
    expect(career?.salary).not.toBe(usSalary);
    // India must apply currencyScale, not salaryMultiplier alone
    expect(inSalary).toBeGreaterThan(path.baseSalary * 10);
  });
});

describe('incrementCareerYear', () => {
  it('increments years employed', () => {
    const career = {
      title: 'Doctor', company: 'Hospital', salary: 100000, yearsEmployed: 3, performance: 50,
    };
    expect(incrementCareerYear(career).yearsEmployed).toBe(4);
  });
});

describe('checkCareerEligibility', () => {
  const baseChar = {
    age: 22,
    educationLevel: 'university' as const,
    educationStage: 'undergraduate',
    degreeIds: [] as string[],
    certificationIds: [] as string[],
    career: null,
    totalCareerYears: 0,
    stats: {
      health: 70, happiness: 70, intelligence: 80, wealth: 50,
      fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
    },
    traits: [] as string[],
    countryCode: 'US',
    criminalRecord: { crimes: [] as string[], jailYearsRemaining: 0, onProbation: false },
    assets: [] as [],
  };

  it('rejects careers requiring specific degrees when none earned', () => {
    const result = checkCareerEligibility(baseChar, 'junior_dev');
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('degree');
  });

  it('accepts careers when required degree is earned', () => {
    const result = checkCareerEligibility(
      { ...baseChar, degreeIds: ['bsc_cs'] },
      'junior_dev',
    );
    expect(result.eligible).toBe(true);
  });

  it('rejects junior_lawyer without bar_exam certification', () => {
    const result = checkCareerEligibility(
      { ...baseChar, age: 26, degreeIds: ['llb'], stats: { ...baseChar.stats, intelligence: 80 } },
      'junior_lawyer',
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('certification');
  });

  it('accepts junior_lawyer with degree and bar_exam', () => {
    const result = checkCareerEligibility(
      {
        ...baseChar,
        age: 26,
        degreeIds: ['llb'],
        certificationIds: ['bar_exam'],
        stats: { ...baseChar.stats, intelligence: 80 },
      },
      'junior_lawyer',
    );
    expect(result.eligible).toBe(true);
  });

  it('rejects surgeon without all required degrees', () => {
    const result = checkCareerEligibility(
      {
        ...baseChar,
        age: 35,
        educationStage: 'masters',
        degreeIds: ['mbbs'],
        stats: { ...baseChar.stats, intelligence: 90, fitness: 70 },
      },
      'surgeon',
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('md');
  });

  it('accepts surgeon with mbbs and md', () => {
    const result = checkCareerEligibility(
      {
        ...baseChar,
        age: 35,
        educationStage: 'masters',
        degreeIds: ['mbbs', 'md'],
        stats: { ...baseChar.stats, intelligence: 90, fitness: 70 },
      },
      'surgeon',
    );
    expect(result.eligible).toBe(true);
  });

  it('uses totalCareerYears for experience gate across job changes', () => {
    const result = checkCareerEligibility(
      {
        ...baseChar,
        age: 45,
        educationStage: 'masters',
        degreeIds: ['mbbs', 'md'],
        totalCareerYears: 16,
        career: { title: 'Nurse', company: 'Hospital', salary: 60000, yearsEmployed: 1, performance: 50 },
        stats: { ...baseChar.stats, intelligence: 95, fitness: 70 },
      },
      'chief_surgeon',
    );
    expect(result.eligible).toBe(true);
  });

  it('rejects chief_surgeon when totalCareerYears below minimum', () => {
    const result = checkCareerEligibility(
      {
        ...baseChar,
        age: 45,
        educationStage: 'masters',
        degreeIds: ['mbbs', 'md'],
        totalCareerYears: 5,
        career: { title: 'Surgeon', company: 'Hospital', salary: 300000, yearsEmployed: 5, performance: 90 },
        stats: { ...baseChar.stats, intelligence: 95, fitness: 70 },
      },
      'chief_surgeon',
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('experience');
  });
});

describe('syncJobLabel', () => {
  it('returns Student for minors without career', () => {
    expect(syncJobLabel(10, null, 'Student')).toBe('Student');
  });

  it('returns Unemployed for adults without career', () => {
    expect(syncJobLabel(25, null, 'Student')).toBe('Unemployed');
  });

  it('returns career title when employed', () => {
    const career = {
      title: 'Engineer', company: 'Co', salary: 50000, yearsEmployed: 1, performance: 50,
    };
    expect(syncJobLabel(30, career, 'Student')).toBe('Engineer');
  });

  it('preserves Retired status', () => {
    expect(syncJobLabel(70, null, 'Retired')).toBe('Retired');
  });
});

describe('getEligibleCareers', () => {
  const jobChar = {
    age: 24,
    educationLevel: 'university' as const,
    educationStage: 'undergraduate',
    degreeIds: ['bsc_cs'],
    certificationIds: [] as string[],
    career: null,
    totalCareerYears: 0,
    educationBranch: 'engineering',
    stats: {
      health: 70, happiness: 70, intelligence: 85, wealth: 50,
      fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
    },
    traits: [] as string[],
    countryCode: 'US',
    criminalRecord: { crimes: [] as string[], jailYearsRemaining: 0, onProbation: false },
    assets: [] as [],
  };

  it('excludes entrepreneur from the job board list', () => {
    const jobs = getEligibleCareers(jobChar);
    expect(jobs.some((j) => j.career.id === 'entrepreneur')).toBe(false);
  });

  it('sorts engineering branch preferred (technology) ahead of other eligible jobs', () => {
    const jobs = getEligibleCareers(jobChar);
    expect(jobs.length).toBeGreaterThan(0);
    const firstPreferred = jobs.find((j) => j.preferred);
    expect(firstPreferred).toBeDefined();
    expect(['technology', 'science']).toContain(firstPreferred!.career.category);
    expect(jobs.some((j) => j.career.category === 'service' || !j.preferred)).toBe(true);
  });
});

describe('getPromotionTarget', () => {
  it('returns next role when years and performance thresholds are met', () => {
    const junior = getCareerById('junior_dev');
    expect(junior).toBeDefined();
    const nextId = junior!.progressionPaths[0];
    const target = getPromotionTarget({
      title: junior!.label,
      company: junior!.company,
      salary: junior!.baseSalary,
      yearsEmployed: nextId.minYearsInRole,
      performance: nextId.minPerformance,
    });
    expect(target?.id).toBe(nextId.id);
  });

  it('returns null when thresholds are not met', () => {
    const junior = getCareerById('junior_dev')!;
    expect(getPromotionTarget({
      title: junior.label,
      company: junior.company,
      salary: junior.baseSalary,
      yearsEmployed: 0,
      performance: 10,
    })).toBeNull();
  });
});
