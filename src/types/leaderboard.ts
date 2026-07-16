// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardLifeSnapshot {
  characterName: string;
  displayName: string;
  country: string;
  lifeAge: number;
  causeOfDeath?: string;
  peakNetWorth: number;
  careerTitle?: string;
  karma: number;
  prestigeLevel?: number;
  avatarSeed: string;
  netWorth?: number;
  score: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarSeed: string;
  score: number;
  lifeAge: number;
  country: string;
  characterName?: string;
  causeOfDeath?: string;
  peakNetWorth?: number;
  careerTitle?: string;
  karma?: number;
  prestigeLevel?: number;
  lifeSnapshot?: LeaderboardLifeSnapshot;
}
