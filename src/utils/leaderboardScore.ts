export function computeLeaderboardScore(character: {
  netWorthPeak: number;
  age: number;
  karma: number;
}): number {
  return Math.round(character.netWorthPeak + character.age * 1000 + character.karma);
}
