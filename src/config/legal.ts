/** Public legal URLs — set via EAS / .env for store compliance. */

const DEFAULT_PRIVACY_PATH = 'privacy-policy.html';

/** Replace YOUR_PROJECT_ID after `firebase deploy --only hosting`. */
export const DEFAULT_HOSTED_PRIVACY_URL =
  'https://YOUR_PROJECT_ID.web.app/privacy-policy.html';

export function getPrivacyPolicyUrl(): string {
  const configured = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
  if (configured) return configured;
  return DEFAULT_HOSTED_PRIVACY_URL;
}

export function getTermsUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_TERMS_URL?.trim();
  return configured || null;
}

export async function openLegalUrl(url: string): Promise<void> {
  const { Linking } = await import('react-native');
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('Unable to open link.');
  }
  await Linking.openURL(url);
}

export { DEFAULT_PRIVACY_PATH };
