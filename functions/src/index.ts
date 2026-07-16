import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { grantsForProduct, grantsToUserPatch, avatarStylesForGrants, scenarioIdsForGrants, cosmeticIdsForGrants } from './entitlements';
import { verifyGooglePlayPurchase, isAllowUnverifiedIap } from './verifyGooglePlay';
import { verifyAppStorePurchase } from './verifyAppStore';
import {
  updateLeaderboardEntry,
  fetchLeaderboardEntries,
  cleanupStaleSaves,
  sanitizeLeaderboardPayload,
  LeaderboardValidationError,
  DEFAULT_SEASON_ID,
  type LeaderboardPayload,
} from './leaderboard';

admin.initializeApp();
const db = admin.firestore();

interface VerifyPurchasePayload {
  productId: string;
  transactionId?: string;
  platform?: string;
  purchaseToken?: string;
  transactionReceipt?: string;
}

async function verifyPlatformPurchase(
  platform: string,
  productId: string,
  purchaseToken: string | undefined,
  transactionId: string,
  transactionReceipt: string | undefined,
): Promise<void> {
  if (platform === 'android') {
    if (!purchaseToken) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'purchaseToken is required for Android purchases.',
      );
    }
    try {
      await verifyGooglePlayPurchase(productId, purchaseToken);
    } catch (e) {
      if (isAllowUnverifiedIap()) return;
      const message = e instanceof Error ? e.message : 'Google Play verification failed.';
      if (message.includes('not configured')) {
        throw new functions.https.HttpsError('failed-precondition', message);
      }
      throw new functions.https.HttpsError('permission-denied', message);
    }
    return;
  }

  if (platform === 'ios') {
    try {
      await verifyAppStorePurchase(productId, transactionId, transactionReceipt);
    } catch (e) {
      if (isAllowUnverifiedIap()) return;
      const message = e instanceof Error ? e.message : 'App Store verification failed.';
      if (message.includes('not configured')) {
        throw new functions.https.HttpsError('failed-precondition', message);
      }
      throw new functions.https.HttpsError('unimplemented', message);
    }
    return;
  }

  throw new functions.https.HttpsError(
    'invalid-argument',
    `Unsupported platform: ${platform}`,
  );
}

/**
 * Callable: verify an App Store / Play Store purchase and grant entitlements.
 */
export const verifyPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { productId, transactionId, platform, purchaseToken, transactionReceipt } =
    data as VerifyPurchasePayload;

  if (!productId || !transactionId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'productId and transactionId required.',
    );
  }

  const resolvedPlatform = platform ?? 'unknown';
  if (resolvedPlatform === 'android' || resolvedPlatform === 'ios') {
    await verifyPlatformPurchase(
      resolvedPlatform,
      productId,
      purchaseToken,
      transactionId,
      transactionReceipt,
    );
  } else if (!isAllowUnverifiedIap()) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'platform must be android or ios.',
    );
  }

  const uid = context.auth.uid;
  const userRef = db.doc(`users/${uid}`);
  // Prefer platform-native idempotency keys when present (Play token / txn id).
  const idempotencyKey =
    (resolvedPlatform === 'android' && purchaseToken
      ? `gp_${purchaseToken.slice(0, 120)}`
      : null)
    ?? `txn_${transactionId}`;
  const purchaseRef = db.doc(`users/${uid}/purchases/${idempotencyKey}`);

  const existing = await purchaseRef.get();
  if (existing.exists) {
    return { ok: true, duplicate: true, grants: grantsForProduct(productId) };
  }

  const grants = grantsForProduct(productId);
  const userPatch = grantsToUserPatch(grants);
  const avatarStyles = avatarStylesForGrants(grants);
  const scenarioIds = scenarioIdsForGrants(grants);
  const cosmeticIds = cosmeticIdsForGrants(grants);

  const batch = db.batch();
  batch.set(purchaseRef, {
    productId,
    transactionId,
    platform: resolvedPlatform,
    purchaseToken: purchaseToken ?? null,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (
    Object.keys(userPatch).length > 0
    || avatarStyles.length > 0
    || scenarioIds.length > 0
    || cosmeticIds.length > 0
  ) {
    const patch: Record<string, unknown> = { ...userPatch };
    if (avatarStyles.length > 0) {
      patch.unlockedAvatarStyles = admin.firestore.FieldValue.arrayUnion(...avatarStyles);
    }
    if (scenarioIds.length > 0) {
      patch.unlockedScenarioIds = admin.firestore.FieldValue.arrayUnion(...scenarioIds);
    }
    if (cosmeticIds.length > 0) {
      patch.unlockedCosmeticIds = admin.firestore.FieldValue.arrayUnion(...cosmeticIds);
    }
    batch.set(userRef, patch, { merge: true });
  }

  await batch.commit();
  return { ok: true, grants };
});

export const updateLeaderboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const payload = data as LeaderboardPayload;
  try {
    sanitizeLeaderboardPayload(payload);
  } catch (e) {
    const message = e instanceof LeaderboardValidationError
      ? e.message
      : 'Invalid leaderboard payload.';
    throw new functions.https.HttpsError('invalid-argument', message);
  }

  return updateLeaderboardEntry(db, context.auth.uid, payload);
});

export const getLeaderboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }
  const payload = data as { limit?: number; seasonId?: string };
  const limit = typeof payload.limit === 'number' ? payload.limit : 50;
  const seasonId = typeof payload.seasonId === 'string' ? payload.seasonId : DEFAULT_SEASON_ID;
  return fetchLeaderboardEntries(db, limit, seasonId);
});

export const cleanupOldSaves = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  await cleanupStaleSaves(db);
  return null;
});

export const archiveLiveOpsOnSeasonChange = functions.firestore
  .document('liveops/current')
  .onWrite(async (change) => {
    if (!change.before.exists || !change.after.exists) return null;

    const before = change.before.data() as { season?: { id?: string } } | undefined;
    const after = change.after.data() as { season?: { id?: string } } | undefined;
    const beforeId = before?.season?.id;
    const afterId = after?.season?.id;

    if (!beforeId || !afterId || beforeId === afterId) return null;

    await db.collection('liveops_history').doc(beforeId).set({
      ...before,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });
