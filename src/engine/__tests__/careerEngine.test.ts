import {
  jobToCareer, workHarder, askForRaise, applyForPromotion, incrementCareerYear,
  checkCareerEligibility, syncJobLabel,
} from '@engine/careerEngine';

describe('jobToCareer', () => {
  it('maps job title to career', () => {
    const career = jobToCareer('Doctor');
    expect(career?.title).toBe('Doctor');
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
      title: 'Junior Dev', company: 'Tech Corp', salary: 35000, yearsEmployed: 2, performance: 70,
    };
    const result = applyForPromotion(career, true);
    expect(result.newTitle).toBeDefined();
    expect(result.career.salary).toBeGreaterThanOrEqual(career.salary);
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
