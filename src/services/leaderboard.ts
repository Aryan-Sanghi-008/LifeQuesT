import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '@services/firebaseClient';
import { getLeaderboardCache, setLeaderboardCache } from '@services/persistence';
import { LeaderboardEntry } from '../types';

export { computeLeaderboardScore } from '../utils/leaderboardScore';

export interface LeaderboardFetchResult {
  entries: LeaderboardEntry[];
  fromCache: boolean;
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

function parseCachedEntries(): LeaderboardEntry[] {
  const raw = getLeaderboardCache();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardFetchResult> {
  const fn = getFunctionsInstance();
  if (!fn) {
    return { entries: parseCachedEntries(), fromCache: true };
  }
  try {
    const callable = httpsCallable<{ limit?: number }, { entries: LeaderboardEntry[] }>(fn, 'getLeaderboard');
    const result = await callable({ limit });
    const entries = result.data.entries ?? [];
    if (entries.length > 0) {
      setLeaderboardCache(JSON.stringify(entries));
    }
    return { entries, fromCache: false };
  } catch {
    const cached = parseCachedEntries();
    return { entries: cached, fromCache: cached.length > 0 };
  }
}
