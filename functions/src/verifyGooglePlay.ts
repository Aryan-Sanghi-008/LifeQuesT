export const SUBSCRIPTION_PRODUCT_IDS = ['premium_monthly', 'premium_yearly'] as const;

export function isSubscriptionProduct(productId: string): boolean {
  return (SUBSCRIPTION_PRODUCT_IDS as readonly string[]).includes(productId);
}

export interface GooglePlayConfig {
  packageName: string;
  serviceAccountJson: string;
}

export function getGooglePlayConfig(): GooglePlayConfig | null {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT?.trim();
  if (!packageName || !serviceAccountJson) return null;
  return { packageName, serviceAccountJson };
}

/** Dev emulator only — never enable on deployed Cloud Functions. */
export function isAllowUnverifiedIap(): boolean {
  return (
    process.env.IAP_ALLOW_UNVERIFIED === 'true' &&
    Boolean(process.env.FUNCTIONS_EMULATOR)
  );
}

export function assertPurchaseState(purchaseState: number | null | undefined): void {
  if (purchaseState !== 0) {
    throw new Error(`Google Play purchase not completed (state=${String(purchaseState)})`);
  }
}

export function assertSubscriptionPayment(paymentState: number | null | undefined): void {
  // 1 = payment received, 2 = free trial, 3 = pending deferred
  if (paymentState !== 1 && paymentState !== 2) {
    throw new Error(`Google Play subscription not active (paymentState=${String(paymentState)})`);
  }
}

export async function verifyGooglePlayPurchase(
  productId: string,
  purchaseToken: string,
): Promise<void> {
  const config = getGooglePlayConfig();
  if (!config) {
    if (isAllowUnverifiedIap()) return;
    throw new Error(
      'Google Play verification is not configured. Set GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_PLAY_SERVICE_ACCOUNT.',
    );
  }

  const { google } = await import('googleapis');
  const credentials = JSON.parse(config.serviceAccountJson) as {
    client_email?: string;
    private_key?: string;
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const androidPublisher = google.androidpublisher({ version: 'v3', auth });

  if (isSubscriptionProduct(productId)) {
    const res = await androidPublisher.purchases.subscriptions.get({
      packageName: config.packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });
    assertSubscriptionPayment(res.data.paymentState ?? undefined);
    return;
  }

  const res = await androidPublisher.purchases.products.get({
    packageName: config.packageName,
    productId,
    token: purchaseToken,
  });
  assertPurchaseState(res.data.purchaseState ?? undefined);

  if (res.data.consumptionState === 1) {
    throw new Error('Google Play purchase already consumed');
  }
}
