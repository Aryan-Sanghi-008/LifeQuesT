import { Platform } from 'react-native';
import { IAPProductId, AvatarStyleId } from '../types';
import { isIapNativeAvailable } from '@utils/nativeAvailability';
import { IAP_CLIENT_GRANTS } from '../data/iapCatalog';
import { setStarterOfferPurchased } from './persistence';

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
  'season_pass',
  'avatar_pack_adventurer',
  'avatar_pack_lorelei',
  'avatar_pack_bottts',
  'avatar_pack_notionists',
  'avatar_pack_big_smile',
  'avatar_pack_wanderer',
  'avatar_bundle_all',
  'cosmetic_theme_dark_slate',
  'cosmetic_theme_midnight',
  'cosmetic_theme_sunrise',
  'cosmetic_tombstone_gothic',
  'cosmetic_tombstone_modern',
  'cosmetic_tombstone_angelic',
  'cosmetic_event_vintage',
  'cosmetic_event_neon',
  'cosmetic_event_watercolor',
  'cosmetic_font_serif',
  'cosmetic_font_script',
  'cosmetic_font_mono',
  'cosmetic_sound_minimal',
  'cosmetic_sound_jazz',
  'cosmetic_sound_cinematic',
  'cosmetic_sound_lofi',
  'mystery_spins_3',
  'scenario_royal',
  'scenario_crime',
  'scenario_cyber',
  'scenario_medieval',
  'scenario_zombie',
  'scenario_mars',
  'scenario_celebrity',
  'scenario_fantasy',
  'scenario_political',
  'scenario_pack_all',
  'starter_pack',
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
  return ['coins_small', 'coins_medium', 'coins_large', 'gems_small', 'luck_boost', 'reincarnation_scroll', 'mystery_spins_3'].includes(productId);
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
    setSeasonPass?: (v: boolean) => void;
    unlockAvatarStyle?: (style: AvatarStyleId) => void;
    unlockAvatarStyles?: (styles: AvatarStyleId[]) => void;
    unlockAllAvatarStyles?: () => void;
    grantCosmeticUnlock?: (cosmeticId: string) => void;
    applyCosmetic?: (cosmeticId: string) => { ok: boolean; message: string };
    addMysterySpins?: (n: number) => void;
    unlockScenario?: (scenarioId: import('../types').ScenarioId) => void;
    unlockAllPremiumScenarios?: () => void;
  },
): void {
  const grants = IAP_CLIENT_GRANTS[productId as IAPProductId];
  if (!grants) return;

  if (grants.premium) store.setPremium(true);
  if (grants.noAds) store.setNoAds(true);
  if (grants.coins) store.addCoins(grants.coins);
  if (grants.gems) store.addGems(grants.gems);
  if (grants.luckBoost) store.addLuckBoost(grants.luckBoost);
  if (grants.reincarnationScroll) store.useReincarnationScroll();
  if (grants.seasonPass) store.setSeasonPass?.(true);
  if (grants.avatarStyle) store.unlockAvatarStyle?.(grants.avatarStyle);
  if (grants.avatarStyles?.length) store.unlockAvatarStyles?.(grants.avatarStyles);
  if (grants.unlockAllAvatarStyles) store.unlockAllAvatarStyles?.();
  if (grants.unlockCosmeticId) {
    store.grantCosmeticUnlock?.(grants.unlockCosmeticId);
    store.applyCosmetic?.(grants.unlockCosmeticId);
  }
  if (grants.mysterySpins) store.addMysterySpins?.(grants.mysterySpins);
  if (grants.unlockScenario) store.unlockScenario?.(grants.unlockScenario);
  if (grants.unlockAllScenarios) store.unlockAllPremiumScenarios?.();
  if (productId === 'starter_pack') setStarterOfferPurchased(true);
}

export async function verifyPurchaseOnServer(
  uid: string,
  purchase: Purchase,
): Promise<boolean> {
  if (uid.startsWith('local_guest_')) return true;
  try {
    const { httpsCallable } = await import('firebase/functions');
    const { getFunctionsInstance } = await import('@services/firebaseClient');
    const fn = getFunctionsInstance();
    if (!fn) return false;
    const callable = httpsCallable(fn, 'verifyPurchase');
    await callable({
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      platform: Platform.OS,
      purchaseToken: purchase.purchaseToken,
      transactionReceipt: purchase.transactionReceipt,
    });
    return true;
  } catch {
    return false;
  }
}

/** Verify with server when signed in; guests only in dev builds. */
export async function shouldGrantPurchaseLocally(uid: string | undefined): Promise<boolean> {
  if (!uid || uid.startsWith('local_guest_')) return __DEV__;
  return false;
}

export async function processVerifiedPurchase(
  purchase: Purchase,
  store: Parameters<typeof applyPurchaseToStore>[1] & { user: { uid: string } | null; _persist: () => Promise<void> },
): Promise<boolean> {
  const uid = store.user?.uid ?? 'local_guest';
  const verified = await verifyPurchaseOnServer(uid, purchase);
  if (!verified) {
    if (await shouldGrantPurchaseLocally(uid)) {
      applyPurchaseToStore(purchase.productId, store);
      void store._persist();
      return true;
    }
    return false;
  }
  applyPurchaseToStore(purchase.productId, store);
  void store._persist();
  return true;
}
