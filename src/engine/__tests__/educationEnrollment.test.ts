import { tickDegreeEnrollment } from '../educationEngine';
import { DEGREES } from '../../data/educationDegrees';

describe('tickDegreeEnrollment', () => {
  const undergrad = DEGREES.find((d) => d.id === 'bsc_cs')!;

  it('decrements years remaining each tick', () => {
    const base = {
      enrolledDegreeId: undergrad.id,
      enrolledDegreeYearsRemaining: 2,
      degreeIds: [] as string[],
      countryCode: 'US',
      bankBalance: 50_000,
      debt: 0,
      age: 19,
      educationStage: 'high_school' as const,
      educationLevel: 'secondary' as const,
      educationBranch: 'none' as const,
      stats: { intelligence: 60 } as any,
    };
    const tick = tickDegreeEnrollment(base);
    expect(tick.graduated).toBe(false);
    expect(tick.yearsRemaining).toBe(1);
    expect(tick.tuitionPaid).toBeGreaterThan(0);
  });

  it('graduates when years reach zero', () => {
    const base = {
      enrolledDegreeId: undergrad.id,
      enrolledDegreeYearsRemaining: 1,
      degreeIds: [] as string[],
      countryCode: 'US',
      bankBalance: 50_000,
      debt: 0,
      age: 22,
      educationStage: 'high_school' as const,
      educationLevel: 'secondary' as const,
      educationBranch: 'none' as const,
      stats: { intelligence: 60 } as any,
    };
    const tick = tickDegreeEnrollment(base);
    expect(tick.graduated).toBe(true);
    expect(tick.graduation?.ok).toBe(true);
    expect(tick.degreeId).toBe(undergrad.id);
  });
});
