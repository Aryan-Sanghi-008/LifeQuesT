import { ScrollView, Text, Pressable } from 'react-native';
import { useTheme, MIN_TAP_TARGET } from '@theme';

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}
    >
      {SHOP_TABS.map((tab, idx) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={{
              flexShrink: 0,
              minHeight: MIN_TAP_TARGET,
              justifyContent: 'center',
              paddingHorizontal: 16,
              borderRadius: radii.full,
              backgroundColor: isActive ? colors.sapphire : colors.bg2,
              borderWidth: 1.5,
              borderColor: isActive ? colors.sapphire : colors.border,
              marginRight: idx < SHOP_TABS.length - 1 ? spacing.sm : 0,
            }}
          >
            <Text
              style={{
                color: isActive ? '#FFFFFF' : colors.t1,
                fontFamily: isActive ? fonts.bodySemiBold : fonts.body,
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
