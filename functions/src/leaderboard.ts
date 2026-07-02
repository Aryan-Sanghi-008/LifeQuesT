import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

export const DEFAULT_SEASON_ID = 'season_1_inflation';
export const STALE_SAVE_DAYS = 90;
export const CLEANUP_BATCH_LIMIT = 500;

export interface LeaderboardPayload {
  score: number;
  lifeAge: number;
  country?: string;
  displayName?: string;
  avatarSeed?: string;
  seasonId?: string;
  netWorth?: number;
}

export function buildLeaderboardEntry(uid: string, data: LeaderboardPayload) {
  const { score, lifeAge, country, displayName, avatarSeed, netWorth } = data;
  return {
    uid,
    score,
    lifeAge,
    age: lifeAge,
    country: country ?? 'Unknown',
    displayName: displayName ?? 'Anonymous',
    characterName: displayName ?? 'Anonymous',
    avatarSeed: avatarSeed ?? uid,
    netWorth: typeof netWorth === 'number' ? netWorth : 0,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

export async function updateLeaderboardEntry(
  db: Firestore,
  uid: string,
  data: LeaderboardPayload,
): Promise<{ ok: true; seasonId: string }> {
  const seasonId = data.seasonId ?? DEFAULT_SEASON_ID;
  const entry = buildLeaderboardEntry(uid, data);

  await db.collection('leaderboard').doc(uid).set(entry, { merge: true });
  await db.collection('leaderboard').doc(seasonId).collection('entries').doc(uid).set(entry, {
    merge: true,
  });

  return { ok: true, seasonId };
}

export async function fetchLeaderboardEntries(
  db: Firestore,
  limit: number,
  seasonId: string,
): Promise<{ entries: FirebaseFirestore.DocumentData[]; seasonId: string }> {
  const cappedLimit = Math.min(limit, 100);

  const seasonSnap = await db.collection('leaderboard').doc(seasonId).collection('entries')
    .orderBy('score', 'desc')
    .limit(cappedLimit)
    .get();

  if (!seasonSnap.empty) {
    return { entries: seasonSnap.docs.map((d) => d.data()), seasonId };
  }

  const snap = await db.collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(cappedLimit)
    .get();

  return { entries: snap.docs.map((d) => d.data()), seasonId };
}

export async function cleanupStaleSaves(
  db: Firestore,
  now = Date.now(),
): Promise<number> {
  const cutoff = now - STALE_SAVE_DAYS * 24 * 60 * 60 * 1000;
  const snap = await db.collectionGroup('slots')
    .where('updatedAt', '<', cutoff)
    .limit(CLEANUP_BATCH_LIMIT)
    .get();

  if (snap.empty) return 0;

  const batch = db.batch();
  snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();
  return snap.docs.length;
}
