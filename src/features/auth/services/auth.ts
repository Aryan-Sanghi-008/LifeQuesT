import {
  initializeAuth,
  // @ts-expect-error — RN persistence exists in Metro bundle but is omitted from web typings
  getReactNativePersistence,
  getAuth,
  signInAnonymously,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  Auth,
  User,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_WEB_CLIENT_ID, isFirebaseConfigured } from '../../../config/firebase';
import { getFirebaseApp } from '@services/firebaseClient';
import { isGoogleSignInAvailable } from '@utils/nativeAvailability';
import { AppUser } from '../../../types';

let auth: Auth | null = null;

function getGoogleSignin() {
  if (!isGoogleSignInAvailable()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-google-signin/google-signin')
    .GoogleSignin as typeof import('@react-native-google-signin/google-signin').GoogleSignin;
}

function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  const app = getFirebaseApp();
  if (!app) return null;
  if (!auth) {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  }
  return auth;
}

export { isGoogleSignInAvailable };

export function initAuth(): void {
  if (!isFirebaseConfigured()) {
    console.warn('[auth] Firebase not configured — using offline guest mode.');
    return;
  }

  const GoogleSignin = getGoogleSignin();
  if (!GoogleSignin) {
    console.warn(
      '[auth] Google Sign-In unavailable in this build — use guest sign-in or install a dev build.',
    );
    return;
  }

  if (GOOGLE_WEB_CLIENT_ID) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  }
}

function toAppUser(user: User, isGuest: boolean): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isGuest,
  };
}

export async function signInWithGoogle(): Promise<AppUser> {
  const GoogleSignin = getGoogleSignin();
  if (!GoogleSignin) {
    throw new Error(
      'Google Sign-In requires a development build. Use guest sign-in in Expo Go.',
    );
  }

  const fbAuth = getFirebaseAuth();
  if (!fbAuth) throw new Error('Firebase not configured');

  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  const idToken = 'idToken' in result ? result.idToken : (result as { data?: { idToken?: string } }).data?.idToken;
  if (!idToken) throw new Error('No Google ID token');

  const credential = GoogleAuthProvider.credential(idToken);
  const userCred = await signInWithCredential(fbAuth, credential);
  return toAppUser(userCred.user, false);
}

export async function signInAsGuest(): Promise<AppUser> {
  const fbAuth = getFirebaseAuth();
  if (!fbAuth) {
    return {
      uid: `local_guest_${Date.now()}`,
      email: null,
      displayName: 'Guest',
      photoURL: null,
      isGuest: true,
    };
  }
  const userCred = await signInAnonymously(fbAuth);
  return toAppUser(userCred.user, true);
}

export async function signOut(): Promise<void> {
  const fbAuth = getFirebaseAuth();
  if (fbAuth) await firebaseSignOut(fbAuth);
  try {
    await getGoogleSignin()?.signOut();
  } catch {
    /* noop */
  }
}

export function subscribeAuth(callback: (user: AppUser | null) => void): () => void {
  const fbAuth = getFirebaseAuth();
  if (!fbAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(fbAuth, (user) => {
    if (!user) { callback(null); return; }
    callback(toAppUser(user, user.isAnonymous));
  });
}
