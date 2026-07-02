/** Public legal URLs — set via EAS / .env for store compliance. */

import { Asset } from 'expo-asset';
import * as WebBrowser from 'expo-web-browser';

const DEFAULT_PRIVACY_PATH = 'privacy-policy.html';
const DEFAULT_TERMS_PATH = 'terms-of-service.html';

export const DEFAULT_HOSTED_PRIVACY_URL =
  'https://YOUR_PROJECT_ID.web.app/privacy-policy.html';

export const DEFAULT_HOSTED_TERMS_URL =
  'https://YOUR_PROJECT_ID.web.app/terms-of-service.html';

function getFirebaseProjectId(): string | null {
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId || projectId === 'YOUR_PROJECT_ID') return null;
  return projectId;
}

function buildHostedUrl(path: string): string | null {
  const projectId = getFirebaseProjectId();
  if (!projectId) return null;
  return `https://${projectId}.web.app/${path}`;
}

function hasExplicitEnvUrl(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim()
    || process.env.EXPO_PUBLIC_TERMS_URL?.trim(),
  );
}

async function getBundledLegalUrl(assetModule: number): Promise<string> {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}

export function getPrivacyPolicyUrl(): string {
  const configured = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
  if (configured) return configured;
  return buildHostedUrl(DEFAULT_PRIVACY_PATH) ?? DEFAULT_HOSTED_PRIVACY_URL;
}

export function getTermsUrl(): string {
  const configured = process.env.EXPO_PUBLIC_TERMS_URL?.trim();
  if (configured) return configured;
  return buildHostedUrl(DEFAULT_TERMS_PATH) ?? DEFAULT_HOSTED_TERMS_URL;
}

export async function resolvePrivacyPolicyUrl(): Promise<string> {
  if (hasExplicitEnvUrl()) return getPrivacyPolicyUrl();
  const hosted = buildHostedUrl(DEFAULT_PRIVACY_PATH);
  if (hosted) return hosted;
  return getBundledLegalUrl(require('../../assets/legal/privacy-policy.html'));
}

export async function resolveTermsUrl(): Promise<string> {
  if (hasExplicitEnvUrl()) return getTermsUrl();
  const hosted = buildHostedUrl(DEFAULT_TERMS_PATH);
  if (hosted) return hosted;
  return getBundledLegalUrl(require('../../assets/legal/terms-of-service.html'));
}

export function isPlaceholderUrl(url: string): boolean {
  return url.includes('YOUR_PROJECT_ID');
}

export async function openLegalUrl(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url);
}

export async function openLegalUrlSafe(url: string, title: string): Promise<void> {
  let resolved = url;
  if (isPlaceholderUrl(url) || !hasExplicitEnvUrl()) {
    resolved = title === 'Privacy Policy'
      ? await resolvePrivacyPolicyUrl()
      : await resolveTermsUrl();
  }
  return openLegalUrl(resolved);
}

export function getSupportUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_SUPPORT_URL?.trim();
  return configured || null;
}

export async function openSupportUrlSafe(): Promise<boolean> {
  const url = getSupportUrl();
  if (!url) return false;
  await openLegalUrl(url);
  return true;
}

export { DEFAULT_PRIVACY_PATH, DEFAULT_TERMS_PATH };

/** COPPA minimum age for account creation */
export const MIN_ACCOUNT_AGE = 13;

export function getAgeFromBirthYear(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function isOldEnoughForAccount(birthYear: number, now = new Date()): boolean {
  return getAgeFromBirthYear(birthYear, now) >= MIN_ACCOUNT_AGE;
}
