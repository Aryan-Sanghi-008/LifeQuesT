import {
  getFirestore, doc, getDoc, setDoc, deleteField,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';
import type { UserEntitlements } from '../utils/entitlementGrants';

export type { UserEntitlements } from '../utils/entitlementGrants';
export { applyEntitlementsToCharacter, hasPendingGrants } from '../utils/entitlementGrants';

function getDb() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function fetchUserEntitlements(uid: string): Promise<UserEntitlements | null> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return null;

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  const entitlements: UserEntitlements = {};

  if (data.isPremium === true) entitlements.isPremium = true;
  if (data.hasNoAds === true) entitlements.hasNoAds = true;
  if (typeof data.coinsGrant === 'number' && data.coinsGrant > 0) {
    entitlements.coinsGrant = data.coinsGrant;
  }
  if (typeof data.gemsGrant === 'number' && data.gemsGrant > 0) {
    entitlements.gemsGrant = data.gemsGrant;
  }
  if (typeof data.luckBoostGrant === 'number' && data.luckBoostGrant > 0) {
    entitlements.luckBoostGrant = data.luckBoostGrant;
  }
  if (data.reincarnationScroll === true) entitlements.reincarnationScroll = true;

  return entitlements;
}

export async function clearConsumedGrants(uid: string): Promise<void> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return;

  await setDoc(doc(db, 'users', uid), {
    coinsGrant: deleteField(),
    gemsGrant: deleteField(),
    luckBoostGrant: deleteField(),
    reincarnationScroll: deleteField(),
  }, { merge: true });
}
