import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import type { UserEntitlements } from '@utils/entitlementGrants';
import type { CloudSettings } from '@services/settingsSync';
import { migrateThemeSkinId } from '@theme/themeSkins';

export interface UserBootstrapResult {
  entitlements: UserEntitlements | null;
  settings: Partial<CloudSettings> | null;
  profileCreated: boolean;
}

function parseEntitlements(data: Record<string, unknown>): UserEntitlements {
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
  if (Array.isArray(data.unlockedScenarioIds)) {
    entitlements.unlockedScenarioIds = data.unlockedScenarioIds as UserEntitlements['unlockedScenarioIds'];
  }
  if (Array.isArray(data.unlockedCosmeticIds)) {
    entitlements.unlockedCosmeticIds = data.unlockedCosmeticIds as string[];
  }

  return entitlements;
}

function parseSettings(raw: unknown): Partial<CloudSettings> | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const settings: Partial<CloudSettings> = {};
  if (s.colorScheme === 'light' || s.colorScheme === 'dark' || s.colorScheme === 'system') {
    settings.colorScheme = s.colorScheme;
  }
  if (typeof s.appThemeId === 'string') {
    settings.appThemeId = migrateThemeSkinId(s.appThemeId);
  }
  if (typeof s.notificationsEnabled === 'boolean') settings.notificationsEnabled = s.notificationsEnabled;
  if (typeof s.soundEnabled === 'boolean') settings.soundEnabled = s.soundEnabled;
  if (typeof s.musicEnabled === 'boolean') settings.musicEnabled = s.musicEnabled;
  if (typeof s.hapticsEnabled === 'boolean') settings.hapticsEnabled = s.hapticsEnabled;
  if (typeof s.masterVolume === 'number') settings.masterVolume = s.masterVolume;
  if (typeof s.musicVolume === 'number') settings.musicVolume = s.musicVolume;
  if (typeof s.equippedEventSkinId === 'string' || s.equippedEventSkinId === null) {
    settings.equippedEventSkinId = s.equippedEventSkinId as string | null;
  }
  if (typeof s.equippedNameFontId === 'string' || s.equippedNameFontId === null) {
    settings.equippedNameFontId = s.equippedNameFontId as string | null;
  }
  if (typeof s.equippedSoundPackId === 'string' || s.equippedSoundPackId === null) {
    settings.equippedSoundPackId = s.equippedSoundPackId as string | null;
  }
  if (typeof s.equippedProfileFrameId === 'string' || s.equippedProfileFrameId === null) {
    settings.equippedProfileFrameId = s.equippedProfileFrameId as string | null;
  }
  if (typeof s.equippedTombstoneId === 'string' || s.equippedTombstoneId === null) {
    settings.equippedTombstoneId = s.equippedTombstoneId as string | null;
  }
  return Object.keys(settings).length > 0 ? settings : null;
}

/**
 * Single Firestore read for profile, entitlements, and settings on sign-in.
 * Creates profile if missing (one conditional write).
 */
export async function bootstrapCloudUser(
  uid: string,
  displayName: string,
  avatarUrl?: string | null,
): Promise<UserBootstrapResult> {
  const db = getFirestoreDb();
  if (!db || uid.startsWith('local_guest_')) {
    return { entitlements: null, settings: null, profileCreated: false };
  }

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const data = snap.data() ?? {};
  let profileCreated = false;

  const existingProfile = data.profile as { createdAt?: unknown } | undefined;
  if (!existingProfile?.createdAt) {
    const profile: Record<string, unknown> = {
      displayName: displayName.trim() || 'Player',
      createdAt: serverTimestamp(),
    };
    if (avatarUrl?.trim()) profile.avatarUrl = avatarUrl.trim();
    await setDoc(ref, { profile }, { merge: true });
    profileCreated = true;
  }

  const entitlements = snap.exists() ? parseEntitlements(data as Record<string, unknown>) : null;
  const settings = parseSettings(data.settings);

  return {
    entitlements: entitlements && Object.keys(entitlements).length > 0 ? entitlements : null,
    settings,
    profileCreated,
  };
}
