import { Platform } from 'react-native';
import { IAPProductId } from '../types';
import { isIapNativeAvailable } from '../utils/nativeAvailability';

const PRODUCT_IDS: IAPProductId[] = [
  'premium_monthly',
  'premium_yearly',
  'remove_ads',
  'coins_small',
  'coins_medium',
  'coins_large',
  'gems_small',
  'luck_boost',
  'reincarnation_scroll',
];

type Product = import('@iaptic/react-native-iap').Product;
type Purchase = import('@iaptic/react-native-iap').Purchase;

let products: Product[] = [];
let purchaseCallback: ((purchase: Purchase) => void) | null = null;

function getIapModule() {
  if (!isIapNativeAvailable()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@iaptic/react-native-iap') as typeof import('@iaptic/react-native-iap');
}

export async function initIAP(
  onPurchase: (purchase: Purchase) => void,
): Promise<void> {
  purchaseCallback = onPurchase;

  const iap = getIapModule();
  if (!iap) {
    console.warn('[iap] Store unavailable in this build — purchases disabled.');
    return;
  }

  try {
    await iap.initConnection();
    products = await iap.getProducts({ skus: PRODUCT_IDS });
  } catch (e) {
    console.warn('[iap] init failed', e);
  }
}

export function getIAPProducts(): Product[] {
  return products;
}

export async function purchaseProduct(productId: string): Promise<void> {
  const iap = getIapModule();
  if (!iap) throw new Error('In-app purchases require a development build.');
  await iap.requestPurchase({ sku: productId });
}

export async function restorePurchases(): Promise<Purchase[]> {
  const iap = getIapModule();
  if (!iap) return [];
  return iap.getAvailablePurchases();
}

export function setupPurchaseListeners(
  onSuccess: (purchase: Purchase) => void,
  onError: (error: Error) => void,
): () => void {
  const iap = getIapModule();
  if (!iap) return () => {};

  const updateSub = iap.purchaseUpdatedListener(async (purchase) => {
    try {
      await iap.finishTransaction({ purchase, isConsumable: isConsumable(purchase.productId) });
      onSuccess(purchase);
      purchaseCallback?.(purchase);
    } catch (e) {
      onError(e as Error);
    }
  });

  const errorSub = iap.purchaseErrorListener((error) => {
    onError(new Error(error.message));
  });

  return () => {
    updateSub.remove();
    errorSub.remove();
    void iap.endConnection();
  };
}

function isConsumable(productId: string): boolean {
  return ['coins_small', 'coins_medium', 'coins_large', 'gems_small', 'luck_boost', 'reincarnation_scroll'].includes(productId);
}

export function applyPurchaseToStore(
  productId: string,
  store: {
    addCoins: (n: number) => void;
    addGems: (n: number) => void;
    setPremium: (v: boolean) => void;
    setNoAds: (v: boolean) => void;
    addLuckBoost: (n: number) => void;
    useReincarnationScroll: () => void;
  },
): void {
  switch (productId as IAPProductId) {
    case 'premium_monthly':
    case 'premium_yearly':
      store.setPremium(true);
      break;
    case 'remove_ads':
      store.setNoAds(true);
      break;
    case 'coins_small':
      store.addCoins(10000);
      break;
    case 'coins_medium':
      store.addCoins(50000);
      break;
    case 'coins_large':
      store.addCoins(150000);
      break;
    case 'gems_small':
      store.addGems(25);
      break;
    case 'luck_boost':
      store.addLuckBoost(3);
      break;
    case 'reincarnation_scroll':
      store.useReincarnationScroll();
      break;
  }
}

export async function verifyPurchaseOnServer(
  uid: string,
  purchase: Purchase,
): Promise<boolean> {
  if (uid.startsWith('local_guest_')) return true;
  try {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { initializeApp, getApps } = await import('firebase/app');
    const { firebaseConfig } = await import('../config/firebase');
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const fn = httpsCallable(getFunctions(app), 'verifyPurchase');
    await fn({
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      platform: Platform.OS,
      purchaseToken: purchase.purchaseToken,
    });
    return true;
  } catch {
    return false;
  }
}
