import { NativeModules, TurboModuleRegistry } from 'react-native';

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

export function isMmkvAvailable(): boolean {
  return hasNativeModule('MMKV') && !isExpoGo();
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
