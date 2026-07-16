/**
 * Firestore security rules unit tests.
 * Requires the Firestore emulator (started via `npm run test:rules`).
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'lifequest-rules-test';
const RULES = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function authedDb(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function unauthedDb() {
  return testEnv.unauthenticatedContext().firestore();
}

describe('firestore.rules', () => {
  it('denies non-owner read of users/{uid}', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice'), {
        profile: { displayName: 'Alice', createdAt: new Date() },
      });
    });
    await assertFails(getDoc(doc(authedDb('bob'), 'users/alice')));
  });

  it('allows owner to update settings with equipped cosmetics + current theme', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice'), {
        profile: { displayName: 'Alice', createdAt: new Date() },
      });
    });
    await assertSucceeds(
      setDoc(
        doc(authedDb('alice'), 'users/alice'),
        {
          settings: {
            colorScheme: 'system',
            appThemeId: 'obsidian',
            notificationsEnabled: true,
            soundEnabled: true,
            musicEnabled: false,
            hapticsEnabled: true,
            masterVolume: 0.8,
            musicVolume: 0.5,
            equippedSoundPackId: 'sound_pack_jazz',
            equippedNameFontId: 'font_serif',
            equippedEventSkinId: null,
            equippedProfileFrameId: 'plus_cosmetic_frame_gold',
            equippedTombstoneId: 'tombstone_gothic',
          },
        },
        { merge: true },
      ),
    );
  });

  it('rejects stale theme IDs in settings', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice'), {
        profile: { displayName: 'Alice', createdAt: new Date() },
      });
    });
    await assertFails(
      setDoc(
        doc(authedDb('alice'), 'users/alice'),
        {
          settings: {
            colorScheme: 'dark',
            appThemeId: 'dark_slate',
            notificationsEnabled: true,
            soundEnabled: true,
            musicEnabled: false,
            hapticsEnabled: true,
            masterVolume: 1,
            musicVolume: 0,
          },
        },
        { merge: true },
      ),
    );
  });

  it('denies client setting isPremium', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice'), {
        profile: { displayName: 'Alice', createdAt: new Date() },
        isPremium: false,
      });
    });
    await assertFails(
      updateDoc(doc(authedDb('alice'), 'users/alice'), { isPremium: true }),
    );
  });

  it('denies client write to purchases', async () => {
    await assertFails(
      setDoc(doc(authedDb('alice'), 'users/alice/purchases/txn1'), {
        productId: 'coins_small',
      }),
    );
  });

  it('allows owner save slot write with expected shape', async () => {
    await assertSucceeds(
      setDoc(doc(authedDb('alice'), 'saves/alice/slots/0'), {
        character: { id: 'c1', name: 'Pat' },
        updatedAt: Date.now(),
        version: 1,
        checksum: 'abc',
        name: 'Pat',
        age: 20,
        isAlive: true,
      }),
    );
  });

  it('denies unauthenticated leaderboard write and unauthenticated liveops write', async () => {
    await assertFails(
      setDoc(doc(unauthedDb(), 'leaderboard/season_1'), { score: 999 }),
    );
    await assertFails(
      setDoc(doc(authedDb('alice'), 'leaderboard/season_1/entries/alice'), {
        score: 999,
      }),
    );
    await assertFails(
      setDoc(doc(authedDb('alice'), 'liveops/current'), { season: { id: 'x' } }),
    );
  });
});
