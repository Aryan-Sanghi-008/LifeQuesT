import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

function getExpoConstants(): { appOwnership?: string } | undefined {
  return NativeModules.NativeUnimoduleProxy?.modulesConstants?.ExponentConstants;
}

export function isExpoGo(): boolean {
  return getExpoConstants()?.appOwnership === 'expo';
}

export function hasNativeModule(name: string): boolean {
  return Boolean(NativeModules[name]);
}

export function isGoogleSignInAvailable(): boolean {
  return hasNativeModule('RNGoogleSignin');
}

/**
 * MMKV uses JSI and can native-crash on some RN 0.85 release builds.
 * Default off on Android release; opt in with EXPO_PUBLIC_USE_MMKV=true.
 */
export function isMmkvAvailable(): boolean {
  if (isExpoGo()) return false;
  if (process.env.EXPO_PUBLIC_USE_MMKV === 'false') return false;
  if (process.env.EXPO_PUBLIC_USE_MMKV !== 'true' && !__DEV__ && Platform.OS === 'android') {
    return false;
  }
  const mmkvModule = NativeModules.MMKV as { install?: () => unknown } | undefined;
  if (mmkvModule == null || typeof mmkvModule.install !== 'function') return false;
  const g = globalThis as typeof globalThis & { nativeCallSyncHook?: unknown };
  return g.nativeCallSyncHook != null;
}

export function isAdsNativeAvailable(): boolean {
  try {
    return TurboModuleRegistry.get('RNGoogleMobileAdsModule') != null;
  } catch {
    return false;
  }
}

export function isIapNativeAvailable(): boolean {
  return hasNativeModule('RNIapModule') || hasNativeModule('RNIapIos');
}
