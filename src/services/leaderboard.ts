import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '@services/firebaseClient';
import { LeaderboardEntry } from '../types';

export { computeLeaderboardScore } from '../utils/leaderboardScore';

export async function submitLeaderboardScore(payload: {
  score: number;
  lifeAge: number;
  country: string;
  displayName: string;
  avatarSeed: string;
}): Promise<void> {
  const fn = getFunctionsInstance();
  if (!fn) return;
  const callable = httpsCallable(fn, 'updateLeaderboard');
  await callable(payload);
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const fn = getFunctionsInstance();
  if (!fn) return [];
  const callable = httpsCallable<{ limit?: number }, { entries: LeaderboardEntry[] }>(fn, 'getLeaderboard');
  const result = await callable({ limit });
  return result.data.entries ?? [];
}
