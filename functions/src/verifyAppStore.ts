import { isAllowUnverifiedIap } from './verifyGooglePlay';

export interface AppleConfig {
  issuerId: string;
  keyId: string;
  bundleId: string;
  privateKey: string;
}

export function getAppleConfig(): AppleConfig | null {
  const issuerId = process.env.APPLE_ISSUER_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const bundleId = process.env.APPLE_BUNDLE_ID?.trim();
  const privateKey = process.env.APPLE_PRIVATE_KEY?.trim();
  if (!issuerId || !keyId || !bundleId || !privateKey) return null;
  return { issuerId, keyId, bundleId, privateKey };
}

/**
 * iOS App Store Server API validation — scaffold for a future iOS release phase.
 * When APPLE_* secrets are set, full JWT + transaction lookup is still deferred.
 */
export async function verifyAppStorePurchase(
  _productId: string,
  _transactionId: string,
  _receipt?: string,
): Promise<void> {
  const config = getAppleConfig();
  if (!config) {
    if (isAllowUnverifiedIap()) return;
    throw new Error(
      'App Store verification is not configured. Set APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_BUNDLE_ID, and APPLE_PRIVATE_KEY.',
    );
  }
  throw new Error('App Store Server API validation is not implemented yet.');
}
