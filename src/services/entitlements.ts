import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import type { UserEntitlements } from '../utils/entitlementGrants';

export type { UserEntitlements } from '../utils/entitlementGrants';
export { applyEntitlementsToCharacter, hasPendingGrants } from '../utils/entitlementGrants';

function getDb() {
  return getFirestoreDb();
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
  if (data.hasSeasonPass === true) entitlements.hasSeasonPass = true;
  if (Array.isArray(data.unlockedAvatarStyles)) {
    entitlements.unlockedAvatarStyles = data.unlockedAvatarStyles as UserEntitlements['unlockedAvatarStyles'];
  }
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
