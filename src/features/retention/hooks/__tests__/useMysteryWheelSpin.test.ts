import { computeWheelTargetDegrees } from '../useMysteryWheelSpin';

describe('computeWheelTargetDegrees', () => {
  it('aligns segment 0 center to the top pointer after full rotations', () => {
    const target = computeWheelTargetDegrees(0, 0, 5);
    expect(target % 360).toBeCloseTo(337.5, 1);
  });

  it('accumulates rotation across consecutive spins', () => {
    const first = computeWheelTargetDegrees(2, 0, 5);
    const second = computeWheelTargetDegrees(4, first, 5);
    expect(second).toBeGreaterThan(first);
    expect(second - first).toBeGreaterThanOrEqual(5 * 360);
  });
});
