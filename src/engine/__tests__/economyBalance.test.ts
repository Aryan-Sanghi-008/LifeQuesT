import { QUEST_TEMPLATES } from '../questEngine';
import { SEASON_PASS_TIERS } from '@data/gameData';

describe('economy balance constants', () => {
  it('quest rewards average in expected band after rebalance', () => {
    const total = QUEST_TEMPLATES.reduce((sum, q) => sum + q.rewardCoins, 0);
    const avg = total / QUEST_TEMPLATES.length;
    expect(avg).toBeGreaterThanOrEqual(40);
    expect(avg).toBeLessThanOrEqual(60);
  });

  it('season pass total coin payout is near 1580 after rebalance', () => {
    const total = SEASON_PASS_TIERS.reduce((sum, t) => sum + t.rewardCoins, 0);
    expect(total).toBeGreaterThanOrEqual(1550);
    expect(total).toBeLessThanOrEqual(1600);
  });

  it('season pass grants tickets on tiers 5 and 10 only', () => {
    const ticketTiers = SEASON_PASS_TIERS.filter((t) => t.rewardTickets);
    expect(ticketTiers.map((t) => t.tier)).toEqual([5, 10]);
  });
});
