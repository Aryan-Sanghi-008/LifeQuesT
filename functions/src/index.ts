import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { grantsForProduct, grantsToUserPatch } from './entitlements';
import { verifyGooglePlayPurchase, isAllowUnverifiedIap } from './verifyGooglePlay';
import { verifyAppStorePurchase } from './verifyAppStore';

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
      const message = e instanceof Error ? e.message : 'App Store verification failed.';
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
  const purchaseRef = db.doc(`users/${uid}/purchases/${transactionId}`);

  const existing = await purchaseRef.get();
  if (existing.exists) {
    return { ok: true, duplicate: true, grants: grantsForProduct(productId) };
  }

  const grants = grantsForProduct(productId);
  const userPatch = grantsToUserPatch(grants);

  const batch = db.batch();
  batch.set(purchaseRef, {
    productId,
    transactionId,
    platform: resolvedPlatform,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (Object.keys(userPatch).length > 0) {
    batch.set(userRef, userPatch, { merge: true });
  }

  await batch.commit();
  return { ok: true, grants };
});

interface LeaderboardPayload {
  score: number;
  lifeAge: number;
  country: string;
  displayName: string;
  avatarSeed: string;
}

export const updateLeaderboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { score, lifeAge, country, displayName, avatarSeed } = data as LeaderboardPayload;
  if (typeof score !== 'number' || typeof lifeAge !== 'number') {
    throw new functions.https.HttpsError('invalid-argument', 'score and lifeAge required.');
  }

  const uid = context.auth.uid;
  await db.collection('leaderboard').doc(uid).set({
    uid,
    score,
    lifeAge,
    country: country ?? 'Unknown',
    displayName: displayName ?? 'Anonymous',
    avatarSeed: avatarSeed ?? uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { ok: true };
});

export const getLeaderboard = functions.https.onCall(async (data) => {
  const limit = Math.min((data as { limit?: number }).limit ?? 50, 100);
  const snap = await db.collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(limit)
    .get();

  const entries = snap.docs.map(d => d.data());
  return { entries };
});
