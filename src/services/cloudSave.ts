import { getFirestore, doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';
import { Character, SaveSlot, MAX_SAVE_SLOTS } from '../types';

function getDb() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export async function syncSaveToCloud(uid: string, slotId: string, character: Character): Promise<void> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return;

  const ref = doc(db, 'users', uid, 'saves', slotId);
  await setDoc(ref, {
    character,
    updatedAt: serverTimestamp(),
    name: character.name,
    age: character.age,
    isAlive: character.isAlive,
  }, { merge: true });

  await setDoc(doc(db, 'users', uid), {
    activeSlotId: slotId,
    displayName: character.name,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function loadSaveFromCloud(uid: string, slotId: string): Promise<Character | null> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return null;

  const snap = await getDoc(doc(db, 'users', uid, 'saves', slotId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return (data.character as Character) ?? null;
}

export async function listCloudSlots(uid: string): Promise<SaveSlot[]> {
  const db = getDb();
  if (!db || uid.startsWith('local_guest_')) return [];

  const col = collection(db, 'users', uid, 'saves');
  const snaps = await getDocs(col);
  const slots: SaveSlot[] = [];

  snaps.forEach(d => {
    const data = d.data();
    slots.push({
      slotId: d.id,
      name: (data.name as string) ?? 'Unknown',
      age: (data.age as number) ?? 0,
      isAlive: (data.isAlive as boolean) ?? false,
      updatedAt: Date.now(),
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
  const cloud = await loadSaveFromCloud(uid, slotId);
  if (!cloud) return null;
  if (cloud.createdAt > localUpdatedAt) return cloud;
  return null;
}
