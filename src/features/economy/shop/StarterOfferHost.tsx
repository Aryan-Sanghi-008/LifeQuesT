import { useEffect, useState } from 'react';
import { useGameStore } from '@store/gameStore';
import { useToastStore } from '@store/toastStore';
import {
  getCatalogPriceLabel,
} from '@data/iapCatalog';
import {
  getIAPProducts,
  purchaseProduct,
  applyPurchaseToStore,
} from '@services/iap';
import {
  markStarterOfferShown,
  shouldShowStarterOffer,
} from '@services/persistence';
import { StarterPackModal } from './StarterPackModal';

/** Shows starter pack offer on second session after first death (24h window). */
export function StarterOfferHost() {
  const store = useGameStore();
  const character = useGameStore((s) => s.character);
  const isHydrated = useGameStore((s) => s.isHydrated);
  const showToast = useToastStore((s) => s.showToast);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated || !character) return;
    if (shouldShowStarterOffer()) {
      markStarterOfferShown();
      setVisible(true);
    }
  }, [isHydrated, character?.id]);

  const priceLabel = getCatalogPriceLabel(
    'starter_pack',
    getIAPProducts(),
    '$2.99',
  );

  const handlePurchase = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const catalog = getIAPProducts();
      if (catalog.length === 0) {
        applyPurchaseToStore('starter_pack', store);
        void store._persist();
        showToast('Starter Pack activated!', 'success');
        setVisible(false);
        return;
      }
      await purchaseProduct('starter_pack');
      setVisible(false);
    } catch (e) {
      showToast((e as Error).message ?? 'Purchase failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarterPackModal
      visible={visible}
      priceLabel={priceLabel}
      loading={loading}
      onPurchase={() => void handlePurchase()}
      onDismiss={() => setVisible(false)}
    />
  );
}
