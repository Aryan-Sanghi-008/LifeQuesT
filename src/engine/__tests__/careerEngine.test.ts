import {
  jobToCareer, workHarder, askForRaise, applyForPromotion, incrementCareerYear,
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
