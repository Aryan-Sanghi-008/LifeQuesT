import { computeLeaderboardScore } from '@utils/leaderboardScore';

describe('leaderboard score', () => {
  it('combines net worth peak, age, and karma', () => {
    const score = computeLeaderboardScore({ netWorthPeak: 100000, age: 50, karma: 100 });
    expect(score).toBe(150100);
  });
});
