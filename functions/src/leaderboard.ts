import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

export const DEFAULT_SEASON_ID = 'season_1_inflation';
export const STALE_SAVE_DAYS = 90;
export const CLEANUP_BATCH_LIMIT = 500;

export const MAX_SCORE = 1_000_000_000;
export const MAX_LIFE_AGE = 200;
export const MAX_NET_WORTH = 1e15;
export const MAX_STRING_LEN = 64;
export const MAX_CAUSE_LEN = 128;

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

export interface LeaderboardPayload {
  score: number;
  lifeAge: number;
  country?: string;
  displayName?: string;
  characterName?: string;
  avatarSeed?: string;
  seasonId?: string;
  netWorth?: number;
  causeOfDeath?: string;
  peakNetWorth?: number;
  careerTitle?: string;
  karma?: number;
  prestigeLevel?: number;
  lifeSnapshot?: LeaderboardLifeSnapshot;
}

export class LeaderboardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeaderboardValidationError';
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeString(value: unknown, maxLen: number, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, maxLen);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Validate and sanitize client leaderboard payload. Throws LeaderboardValidationError. */
export function sanitizeLeaderboardPayload(data: LeaderboardPayload): LeaderboardPayload {
  if (!isFiniteNumber(data.score) || !isFiniteNumber(data.lifeAge)) {
    throw new LeaderboardValidationError('score and lifeAge must be finite numbers.');
  }
  if (data.score < 0 || data.score > MAX_SCORE) {
    throw new LeaderboardValidationError(`score must be between 0 and ${MAX_SCORE}.`);
  }
  if (data.lifeAge < 0 || data.lifeAge > MAX_LIFE_AGE) {
    throw new LeaderboardValidationError(`lifeAge must be between 0 and ${MAX_LIFE_AGE}.`);
  }

  const netWorth = isFiniteNumber(data.netWorth)
    ? clampNumber(data.netWorth, -MAX_NET_WORTH, MAX_NET_WORTH)
    : undefined;
  const peakNetWorth = isFiniteNumber(data.peakNetWorth)
    ? clampNumber(data.peakNetWorth, -MAX_NET_WORTH, MAX_NET_WORTH)
    : undefined;
  const karma = isFiniteNumber(data.karma) ? clampNumber(data.karma, -1000, 1000) : undefined;
  const prestigeLevel = isFiniteNumber(data.prestigeLevel)
    ? clampNumber(Math.floor(data.prestigeLevel), 0, 100)
    : undefined;

  const seasonId = sanitizeString(data.seasonId, MAX_STRING_LEN, DEFAULT_SEASON_ID);
  if (!/^[a-zA-Z0-9_-]+$/.test(seasonId)) {
    throw new LeaderboardValidationError('seasonId contains invalid characters.');
  }

  return {
    score: data.score,
    lifeAge: data.lifeAge,
    country: sanitizeString(data.country, MAX_STRING_LEN, 'Unknown'),
    displayName: sanitizeString(data.displayName, MAX_STRING_LEN, 'Anonymous'),
    characterName: sanitizeString(data.characterName, MAX_STRING_LEN, 'Anonymous'),
    avatarSeed: sanitizeString(data.avatarSeed, MAX_STRING_LEN, ''),
    seasonId,
    netWorth,
    causeOfDeath: data.causeOfDeath != null
      ? sanitizeString(data.causeOfDeath, MAX_CAUSE_LEN, '')
      : undefined,
    peakNetWorth,
    careerTitle: data.careerTitle != null
      ? sanitizeString(data.careerTitle, MAX_STRING_LEN, '')
      : undefined,
    karma,
    prestigeLevel,
  };
}

export function buildLeaderboardEntry(uid: string, data: LeaderboardPayload) {
  const {
    score,
    lifeAge,
    country,
    displayName,
    characterName,
    avatarSeed,
    netWorth,
    causeOfDeath,
    peakNetWorth,
    careerTitle,
    karma,
    prestigeLevel,
    lifeSnapshot,
  } = data;

  const snapshot: LeaderboardLifeSnapshot = lifeSnapshot ?? {
    characterName: characterName ?? displayName ?? 'Anonymous',
    displayName: displayName ?? 'Anonymous',
    country: country ?? 'Unknown',
    lifeAge,
    causeOfDeath: causeOfDeath || undefined,
    peakNetWorth: peakNetWorth ?? (typeof netWorth === 'number' ? netWorth : 0),
    careerTitle: careerTitle || undefined,
    karma: karma ?? 0,
    prestigeLevel,
    avatarSeed: avatarSeed || uid,
    netWorth: typeof netWorth === 'number' ? netWorth : 0,
    score,
  };

  return {
    uid,
    score,
    lifeAge,
    age: lifeAge,
    country: country ?? 'Unknown',
    displayName: displayName ?? 'Anonymous',
    characterName: characterName ?? displayName ?? 'Anonymous',
    avatarSeed: avatarSeed || uid,
    netWorth: typeof netWorth === 'number' ? netWorth : 0,
    causeOfDeath: causeOfDeath || null,
    peakNetWorth: snapshot.peakNetWorth,
    careerTitle: careerTitle || null,
    karma: karma ?? 0,
    prestigeLevel: prestigeLevel ?? 0,
    lifeSnapshot: snapshot,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/** Best finished life per uid per season — replace only if score is higher. */
export async function updateLeaderboardEntry(
  db: Firestore,
  uid: string,
  data: LeaderboardPayload,
): Promise<{ ok: true; seasonId: string; updated: boolean }> {
  const sanitized = sanitizeLeaderboardPayload(data);
  const seasonId = sanitized.seasonId ?? DEFAULT_SEASON_ID;
  const entryRef = db.collection('leaderboard').doc(seasonId).collection('entries').doc(uid);
  const legacyRef = db.collection('leaderboard').doc(uid);

  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(entryRef);
    if (existing.exists) {
      const prev = existing.data()?.score;
      if (typeof prev === 'number' && sanitized.score < prev) {
        return { updated: false as const };
      }
    }

    const entry = buildLeaderboardEntry(uid, sanitized);
    tx.set(entryRef, entry, { merge: true });
    // Legacy flat doc for older clients — kept in same transaction for atomicity
    tx.set(legacyRef, entry, { merge: true });
    return { updated: true as const };
  });

  return { ok: true, seasonId, updated: result.updated };
}

export async function fetchLeaderboardEntries(
  db: Firestore,
  limit: number,
  seasonId: string,
): Promise<{ entries: FirebaseFirestore.DocumentData[]; seasonId: string }> {
  const cappedLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const safeSeason = sanitizeString(seasonId, MAX_STRING_LEN, DEFAULT_SEASON_ID);

  const seasonSnap = await db
    .collection('leaderboard')
    .doc(safeSeason)
    .collection('entries')
    .orderBy('score', 'desc')
    .limit(cappedLimit)
    .get();

  if (!seasonSnap.empty) {
    return { entries: seasonSnap.docs.map((d) => d.data()), seasonId: safeSeason };
  }

  const snap = await db
    .collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(cappedLimit)
    .get();

  return { entries: snap.docs.map((d) => d.data()), seasonId: safeSeason };
}

export async function cleanupStaleSaves(
  db: Firestore,
  now = Date.now(),
): Promise<number> {
  const cutoff = now - STALE_SAVE_DAYS * 24 * 60 * 60 * 1000;
  const snap = await db
    .collectionGroup('slots')
    .where('updatedAt', '<', cutoff)
    .limit(CLEANUP_BATCH_LIMIT)
    .get();

  if (snap.empty) return 0;

  const batch = db.batch();
  snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();
  return snap.docs.length;
}
