import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@theme';

/** Shows real gem IAP SKUs with per-gem value transparency. */
export function GemValueCalculator({
  onBuy,
  priceLabel,
}: {
  onBuy: () => void;
  priceLabel: string;
}) {
  const { colors, fonts, radii, spacing } = useTheme();

  const deals = [
    { gems: 25, price: priceLabel, perGem: '$0.060', badge: 'IN STORE' },
    { gems: 40, price: '≈ 40 💎', perGem: 'Themes & fonts', note: 'Cosmetic gem alt' },
    { gems: 35, price: '≈ 35 💎', perGem: 'Event card skins', note: 'Cosmetic gem alt' },
  ];

  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      <Text style={{ color: colors.t3, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
        GEM VALUE
      </Text>
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 }}>
        Gems unlock cosmetics in the Life Store. IAP bundles below are the best direct value.
      </Text>
      {deals.map((deal, index) => (
        <Pressable
          key={`${deal.gems}-${index}`}
          onPress={index === 0 ? onBuy : undefined}
          disabled={index !== 0}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.bgCard,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            opacity: index === 0 ? 1 : 0.92,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: colors.sapphire, fontFamily: fonts.displayBold, fontSize: 18 }}>
                💎 {deal.gems}
              </Text>
              {deal.badge ? (
                <View style={{ backgroundColor: `${colors.gold}22`, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 10 }}>{deal.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 2 }}>
              {deal.perGem}
              {deal.note ? ` · ${deal.note}` : ''}
            </Text>
          </View>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 15 }}>{deal.price}</Text>
        </Pressable>
      ))}
    </View>
  );
}
