import {
  getMonthKey,
  getMonthlyCosmeticId,
  getMonthlyScenarioPool,
  PLUS_SCENARIO_CREDITS_PER_MONTH,
} from '../plusRotation';
import { PREMIUM_SCENARIO_IDS } from '../scenarioCatalog';

describe('plusRotation', () => {
  it('returns stable scenario pool for a given month', () => {
    const poolA = getMonthlyScenarioPool('2026-07');
    const poolB = getMonthlyScenarioPool('2026-07');
    expect(poolA).toEqual(poolB);
    expect(poolA).toHaveLength(4);
    poolA.forEach((id) => expect(PREMIUM_SCENARIO_IDS).toContain(id));
  });

  it('rotates pool across months', () => {
    const july = getMonthlyScenarioPool('2026-07').join(',');
    const august = getMonthlyScenarioPool('2026-08').join(',');
    expect(july).not.toBe(august);
  });

  it('rotates monthly cosmetic ids', () => {
    expect(getMonthlyCosmeticId('2026-01')).toBe('plus_cosmetic_frame_gold');
    expect(getMonthlyCosmeticId('2026-02')).toBe('plus_cosmetic_frame_teal');
    expect(getMonthlyCosmeticId('2026-03')).toBe('plus_cosmetic_frame_orchid');
  });

  it('exposes two scenario credits per month', () => {
    expect(PLUS_SCENARIO_CREDITS_PER_MONTH).toBe(2);
  });

  it('getMonthKey returns YYYY-MM', () => {
    expect(getMonthKey(new Date('2026-07-15T12:00:00Z'))).toBe('2026-07');
  });
});
