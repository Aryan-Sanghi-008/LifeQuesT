import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '@services/firebaseClient';
import { getLeaderboardCache, setLeaderboardCache } from '@services/persistence';
import { getCurrentSeason } from '@engine/liveOpsEngine';
import { LeaderboardEntry } from '../types';

export { computeLeaderboardScore } from '@utils/leaderboardScore';

export interface LeaderboardFetchResult {
  entries: LeaderboardEntry[];
  fromCache: boolean;
  seasonId?: string;
}

export async function submitLeaderboardScore(payload: {
  score: number;
  lifeAge: number;
  country: string;
  displayName: string;
  characterName?: string;
  avatarSeed: string;
  seasonId?: string;
  netWorth?: number;
  causeOfDeath?: string;
  peakNetWorth?: number;
  careerTitle?: string;
  karma?: number;
  prestigeLevel?: number;
}): Promise<void> {
  const fn = getFunctionsInstance();
  if (!fn) return;
  const callable = httpsCallable(fn, 'updateLeaderboard');
  const seasonId = payload.seasonId ?? getCurrentSeason().id;
  await callable({
    ...payload,
    seasonId,
    lifeSnapshot: {
      characterName: payload.characterName ?? payload.displayName,
      displayName: payload.displayName,
      country: payload.country,
      lifeAge: payload.lifeAge,
      causeOfDeath: payload.causeOfDeath,
      peakNetWorth: payload.peakNetWorth ?? payload.netWorth ?? 0,
      careerTitle: payload.careerTitle,
      karma: payload.karma ?? 0,
      prestigeLevel: payload.prestigeLevel,
      avatarSeed: payload.avatarSeed,
      netWorth: payload.netWorth ?? 0,
      score: payload.score,
    },
  });
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

export async function findPlayerRank(
  uid: string,
  seasonId?: string,
): Promise<number | null> {
  const { entries } = await fetchLeaderboard(100, seasonId);
  const idx = entries.findIndex((e) => e.uid === uid);
  return idx >= 0 ? idx + 1 : null;
}

export async function fetchLeaderboard(limit = 50, seasonId?: string): Promise<LeaderboardFetchResult> {
  const fn = getFunctionsInstance();
  const resolvedSeasonId = seasonId ?? getCurrentSeason().id;
  if (!fn) {
    return { entries: parseCachedEntries(), fromCache: true, seasonId: resolvedSeasonId };
  }
  try {
    const callable = httpsCallable<{ limit?: number; seasonId?: string }, { entries: LeaderboardEntry[]; seasonId?: string }>(fn, 'getLeaderboard');
    const result = await callable({ limit, seasonId: resolvedSeasonId });
    const entries = result.data.entries ?? [];
    if (entries.length > 0) {
      setLeaderboardCache(JSON.stringify(entries));
    }
    return { entries, fromCache: false, seasonId: result.data.seasonId ?? resolvedSeasonId };
  } catch {
    const cached = parseCachedEntries();
    return { entries: cached, fromCache: cached.length > 0, seasonId: resolvedSeasonId };
  }
}
