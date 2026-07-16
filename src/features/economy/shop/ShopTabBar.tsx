import { useTheme } from '@theme';
import { HorizontalChipTabBar } from '@components/HorizontalChipTabBar';

export type ShopTab = 'bundles' | 'premium' | 'cosmetics' | 'scenarios';

const SHOP_TABS: Array<{ id: ShopTab; label: string }> = [
  { id: 'bundles', label: 'Bundles' },
  { id: 'premium', label: 'Premium' },
  { id: 'cosmetics', label: 'Cosmetics' },
  { id: 'scenarios', label: 'Scenarios' },
];

export function ShopTabBar({ active, onSelect }: { active: ShopTab; onSelect: (t: ShopTab) => void }) {
  const { colors } = useTheme();
  return (
    <HorizontalChipTabBar
      tabs={SHOP_TABS}
      activeId={active}
      onSelect={onSelect}
      activeColors={{
        border: colors.sapphire,
        background: colors.sapphire,
        text: colors.textOnInverse,
      }}
      inactiveColors={{
        border: colors.border,
        background: colors.bg2,
        text: colors.t1,
      }}
    />
  );
}
