/**
 * iOS App Store Server API validation — scaffold for a future iOS release phase.
 */
export async function verifyAppStorePurchase(
  _productId: string,
  _transactionId: string,
  _receipt?: string,
): Promise<void> {
  throw new Error('App Store purchase verification is not implemented yet.');
}
