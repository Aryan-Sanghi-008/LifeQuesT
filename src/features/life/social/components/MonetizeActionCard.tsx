import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import type { SocialMonetizationDef } from '@data/socialPlatforms';
import { formatCurrencyFull } from '@utils/currency';

interface MonetizeActionCardProps {
  action: SocialMonetizationDef;
  estimatedPayout: number;
  countryCode: string;
  lockedReason?: string;
  onCooldown?: boolean;
  accent: string;
  textOnAccent: string;
  onPress: () => void;
}

export function MonetizeActionCard({
  action,
  estimatedPayout,
  countryCode,
  lockedReason,
  onCooldown,
  accent,
  textOnAccent,
  onPress,
}: MonetizeActionCardProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const disabled = Boolean(lockedReason) || onCooldown;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>{action.label}</Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
        {action.description}
      </Text>
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 6 }}>
        Needs {action.minFollowers.toLocaleString()} followers
        {action.minSubscribers != null
          ? ` · ${action.minSubscribers.toLocaleString()} subs`
          : ''}
      </Text>
      {!lockedReason && !onCooldown ? (
        <Text style={{ color: colors.emerald, fontFamily: fonts.bodySemiBold, fontSize: 12, marginTop: 6 }}>
          Est. ~{formatCurrencyFull(estimatedPayout, countryCode)}
        </Text>
      ) : null}
      {lockedReason ? (
        <Text style={{ color: colors.crimson, fontFamily: fonts.body, fontSize: 12, marginTop: 6 }}>
          {lockedReason}
        </Text>
      ) : null}
      {onCooldown ? (
        <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 12, marginTop: 6 }}>
          Used this year — Age Up to reset
        </Text>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={action.label}
        style={[
          styles.btn,
          {
            backgroundColor: disabled ? colors.bg3 : accent,
            borderRadius: radii.sm,
            marginTop: spacing.sm,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text style={{ color: disabled ? colors.t3 : textOnAccent, fontFamily: fonts.bodySemiBold }}>
          Collect
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  btn: { paddingVertical: 10, alignItems: 'center' },
});
