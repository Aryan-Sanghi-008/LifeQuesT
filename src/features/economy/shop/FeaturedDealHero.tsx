import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';

export function FeaturedDealHero({ onPress, priceLabel }: { onPress: () => void; priceLabel?: string }) {
  const { colors, fonts, radii, spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md }}>
      <LinearGradient
        colors={[colors.gold, `${colors.gold3 ?? colors.gold}DD`]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: spacing.xl, gap: spacing.sm }}
      >
        <Text style={{ color: '#000', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2 }}>TODAY'S DEAL</Text>
        <Text style={{ color: '#000', fontFamily: fonts.displayBlack, fontSize: 26 }}>Season Pass</Text>
        <Text style={{ color: '#0008', fontFamily: fonts.body, fontSize: 13, lineHeight: 20 }}>
          Unlock exclusive XP rewards, cosmetic items, and bonus events every season.
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: '#000', fontFamily: fonts.displayBold, fontSize: 22 }}>{priceLabel ?? '$4.99'}</Text>
          <View style={{ backgroundColor: '#000', borderRadius: radii.sm, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold, fontSize: 14 }}>Get It Now</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
