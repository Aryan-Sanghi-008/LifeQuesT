import { ScrollView, Text, Pressable } from 'react-native';
import { useTheme } from '@theme';

export type ShopTab = 'bundles' | 'premium' | 'cosmetics' | 'scenarios';

const SHOP_TABS: Array<{ id: ShopTab; label: string }> = [
  { id: 'bundles', label: 'Bundles' },
  { id: 'premium', label: 'Premium' },
  { id: 'cosmetics', label: 'Cosmetics' },
  { id: 'scenarios', label: 'Scenarios' },
];

export function ShopTabBar({ active, onSelect }: { active: ShopTab; onSelect: (t: ShopTab) => void }) {
  const { colors, fonts, radii, spacing } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm }}>
      {SHOP_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: 8,
              borderRadius: radii.full,
              backgroundColor: isActive ? colors.sapphire : colors.bg2,
              borderWidth: 1,
              borderColor: isActive ? colors.sapphire : colors.border,
            }}
          >
            <Text style={{ color: isActive ? '#FFF' : colors.t3, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
