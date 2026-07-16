import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { STAFF_DEFS } from '@engine/socialMediaEngine';
import type { SocialStaffRole } from '@/types';
import { formatCurrencyFull } from '@utils/currency';

interface StaffRoleCardProps {
  role: SocialStaffRole;
  monthlyCost: number;
  countryCode: string;
  hired?: boolean;
  accent: string;
  textOnAccent: string;
  onHire: () => void;
}

export function StaffRoleCard({
  role,
  monthlyCost,
  countryCode,
  hired,
  accent,
  textOnAccent,
  onHire,
}: StaffRoleCardProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const def = STAFF_DEFS[role];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: hired ? accent : colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: 15 }}>{def.label}</Text>
      <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
        {def.description}
      </Text>
      <Text style={{ color: accent, fontFamily: fonts.bodySemiBold, fontSize: 12, marginTop: 8 }}>
        {formatCurrencyFull(monthlyCost, countryCode)}/mo · next Age Up
      </Text>
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
        Reach +{(def.reachBonus * 100).toFixed(0)}% · Success +{(def.successBonus * 100).toFixed(0)}%
        {def.energyBonus ? ` · +${def.energyBonus} energy` : ''}
      </Text>
      <Pressable
        onPress={onHire}
        disabled={hired}
        accessibilityLabel={hired ? `${def.label} already hired` : `Hire ${def.label}`}
        style={[
          styles.btn,
          {
            backgroundColor: hired ? colors.bg3 : accent,
            borderRadius: radii.sm,
            marginTop: spacing.sm,
            opacity: hired ? 0.6 : 1,
          },
        ]}
      >
        <Text style={{ color: hired ? colors.t3 : textOnAccent, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
          {hired ? 'Hired' : `Hire ${def.label}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  btn: { paddingVertical: 10, alignItems: 'center' },
});
