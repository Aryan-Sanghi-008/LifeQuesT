import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@theme';

const GEM_DEALS = [
  { gems: 50, price: '$0.99', perGem: '$0.020' },
  { gems: 120, price: '$1.99', perGem: '$0.017', badge: 'POPULAR' },
  { gems: 300, price: '$4.99', perGem: '$0.017', badge: 'VALUE' },
  { gems: 700, price: '$9.99', perGem: '$0.014', badge: 'BEST DEAL' },
];

export function GemValueCalculator({ onBuy }: { onBuy: (gems: number) => void }) {
  const { colors, fonts, radii, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>GEM BUNDLES</Text>
      {GEM_DEALS.map((deal) => (
        <Pressable
          key={deal.gems}
          onPress={() => onBuy(deal.gems)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: colors.bgCard, borderRadius: radii.md, borderWidth: 1,
            borderColor: colors.border, padding: spacing.md }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: colors.sapphire, fontFamily: fonts.displayBold, fontSize: 18 }}>💎 {deal.gems}</Text>
              {deal.badge && (
                <View style={{ backgroundColor: `${colors.gold}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 10 }}>{deal.badge}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 2 }}>
              {deal.perGem} per gem
            </Text>
          </View>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>{deal.price}</Text>
        </Pressable>
      ))}
    </View>
  );
}
