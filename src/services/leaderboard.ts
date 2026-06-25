import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';
import { LeaderboardEntry } from '../types';

export { computeLeaderboardScore } from '../utils/leaderboardScore';

function getFunctionsInstance() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFunctions(app);
}

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
