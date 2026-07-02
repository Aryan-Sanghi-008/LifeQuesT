import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';

export function FeaturedDealHero({
  onPress,
  priceLabel,
  owned = false,
}: {
  onPress: () => void;
  priceLabel?: string;
  owned?: boolean;
}) {
  const { colors, fonts, radii, spacing } = useTheme();
  return (
    <Pressable
      onPress={owned ? undefined : onPress}
      disabled={owned}
      style={{ borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md, opacity: owned ? 0.92 : 1 }}
    >
      <LinearGradient
        colors={owned
          ? [`${colors.emerald}30`, `${colors.emerald}18`]
          : [colors.gold, `${colors.gold3 ?? colors.gold}DD`]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: spacing.xl, gap: spacing.sm }}
      >
        <Text style={{ color: owned ? colors.emerald : '#000', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>
          {owned ? 'ACTIVE SUBSCRIPTION' : "TODAY'S DEAL"}
        </Text>
        <Text style={{ color: owned ? colors.t1 : '#000', fontFamily: fonts.displayBlack, fontSize: 26 }}>Season Pass</Text>
        <Text style={{ color: owned ? colors.t3 : '#0008', fontFamily: fonts.body, fontSize: 13, lineHeight: 20 }}>
          Unlock exclusive XP rewards, cosmetic items, and bonus events every season.
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {owned ? (
            <View style={{ backgroundColor: `${colors.emerald}20`, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: `${colors.emerald}50` }}>
              <Text style={{ color: colors.emerald, fontFamily: fonts.bodyBold, fontSize: 14 }}>ACTIVE</Text>
            </View>
          ) : (
            <>
              <Text style={{ color: '#000', fontFamily: fonts.displayBold, fontSize: 22 }}>{priceLabel ?? '$4.99'}</Text>
              <View style={{ backgroundColor: '#000', borderRadius: radii.sm, paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold, fontSize: 14 }}>Get It Now</Text>
              </View>
            </>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
