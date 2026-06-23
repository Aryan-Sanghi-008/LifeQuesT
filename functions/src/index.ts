import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

const COIN_GRANTS: Record<string, number> = {
  coins_small: 10000,
  coins_medium: 50000,
  coins_large: 150000,
};

/**
 * Callable: verify an App Store / Play Store purchase and grant entitlements.
 * Production: validate receipts with Apple/Google APIs before writing Firestore.
 */
export const verifyPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { productId, transactionId, platform, purchaseToken } = data as {
    productId: string;
    transactionId?: string;
    platform?: string;
    purchaseToken?: string;
  };

  if (!productId || !transactionId) {
    throw new functions.https.HttpsError('invalid-argument', 'productId and transactionId required.');
  }

  const uid = context.auth.uid;
  const userRef = db.doc(`users/${uid}`);
  const purchaseRef = db.doc(`users/${uid}/purchases/${transactionId}`);

  const existing = await purchaseRef.get();
  if (existing.exists) {
    return { ok: true, duplicate: true };
  }

  // TODO: validate purchaseToken with Google Play / App Store Server API
  void platform;
  void purchaseToken;

  const batch = db.batch();
  batch.set(purchaseRef, {
    productId,
    transactionId,
    platform: platform ?? 'unknown',
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const userPatch: Record<string, unknown> = {};

  if (productId === 'premium_monthly' || productId === 'premium_yearly') {
    userPatch.isPremium = true;
    userPatch.hasNoAds = true;
  }
  if (productId === 'remove_ads') {
    userPatch.hasNoAds = true;
  }
  if (COIN_GRANTS[productId]) {
    userPatch.coinsGrant = COIN_GRANTS[productId];
  }

  if (Object.keys(userPatch).length > 0) {
    batch.set(userRef, userPatch, { merge: true });
  }

  await batch.commit();
  return { ok: true, grants: userPatch };
});
