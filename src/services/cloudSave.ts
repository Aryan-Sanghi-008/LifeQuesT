import {
  doc, setDoc, getDoc, collection, getDocs, serverTimestamp, Timestamp, deleteDoc,
} from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import { Character, SaveSlot, MAX_SAVE_SLOTS } from '../types';
import { SAVE_SCHEMA_VERSION } from '@constants/saveSchema';
import { simpleHash } from '@utils/checksum';

export { resolveSaveConflict, mergeSlotLists } from '@utils/saveSync';

export interface CloudSavePayload {
  character: Character;
  updatedAt: number;
  version?: number;
  checksum?: string;
}

function getDb() {
  return getFirestoreDb();
}

function slotRef(db: NonNullable<ReturnType<typeof getDb>>, uid: string, slotId: string) {
  return doc(db, 'saves', uid, 'slots', slotId);
}

export function parseFirestoreUpdatedAt(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as Timestamp).toMillis();
  }
  return 0;
}

export async function syncSaveToCloud(uid: string, slotId: string, character: Character): Promise<void> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return;

  const ref = slotRef(db, uid, slotId);
  const checksum = simpleHash(character);
  await setDoc(ref, {
    character,
    updatedAt: character.updatedAt,
    updatedAtServer: serverTimestamp(),
    lastSaved: serverTimestamp(),
    version: SAVE_SCHEMA_VERSION,
    checksum,
    name: character.name,
    age: character.age,
    isAlive: character.isAlive,
  }, { merge: true });

  await setDoc(doc(db, 'users', uid), {
    activeSlotId: slotId,
    displayName: character.name,
    updatedAt: character.updatedAt,
  }, { merge: true });
}

export async function loadSaveFromCloud(uid: string, slotId: string): Promise<CloudSavePayload | null> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return null;

  const snap = await getDoc(slotRef(db, uid, slotId));
  if (!snap.exists()) return null;
  const data = snap.data();
  const character = data.character as Character | undefined;
  if (!character) return null;

  const docUpdatedAt = parseFirestoreUpdatedAt(data.updatedAt);
  const charUpdatedAt = character.updatedAt ?? character.createdAt ?? 0;
  const updatedAt = Math.max(docUpdatedAt, charUpdatedAt);

  return {
    character: { ...character, updatedAt },
    updatedAt,
    version: typeof data.version === 'number' ? data.version : undefined,
    checksum: typeof data.checksum === 'string' ? data.checksum : undefined,
  };
}

export async function listCloudSlots(uid: string): Promise<SaveSlot[]> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return [];

  const col = collection(db, 'saves', uid, 'slots');
  const snaps = await getDocs(col);
  const slots: SaveSlot[] = [];

  snaps.forEach(d => {
    const data = d.data();
    const updatedAt = parseFirestoreUpdatedAt(data.updatedAt)
      || ((data.character as Character | undefined)?.updatedAt ?? 0);
    slots.push({
      slotId: d.id,
      name: (data.name as string) ?? 'Unknown',
      age: (data.age as number) ?? 0,
      isAlive: (data.isAlive as boolean) ?? false,
      updatedAt,
    });
  });

  while (slots.length < MAX_SAVE_SLOTS) {
    const id = String(slots.length);
    if (!slots.find(s => s.slotId === id)) {
      slots.push({ slotId: id, name: 'Empty Slot', age: 0, isAlive: false, updatedAt: 0 });
    }
  }

  return slots.slice(0, MAX_SAVE_SLOTS);
}

export async function pullCloudSaveIfNewer(
  uid: string,
  slotId: string,
  localUpdatedAt: number,
): Promise<Character | null> {
  const payload = await loadSaveFromCloud(uid, slotId);
  if (!payload) return null;
  if (payload.updatedAt > localUpdatedAt) return payload.character;
  return null;
}

export async function deleteCloudSave(uid: string, slotId: string): Promise<void> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return;
  await deleteDoc(slotRef(db, uid, slotId));
}

/** Create users/{uid}.profile on first cloud sign-in (idempotent). */
export async function ensureUserProfile(
  uid: string,
  displayName: string,
  avatarUrl?: string | null,
): Promise<void> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return;

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const existingProfile = snap.data()?.profile as { createdAt?: unknown } | undefined;
  if (existingProfile?.createdAt) return;

  const profile: Record<string, unknown> = {
    displayName: displayName.trim() || 'Player',
    createdAt: serverTimestamp(),
  };
  if (avatarUrl?.trim()) {
    profile.avatarUrl = avatarUrl.trim();
  }

  await setDoc(ref, { profile }, { merge: true });
}
