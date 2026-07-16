import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import type { SocialLedgerEntry } from '@/types';
import { formatCurrencyFull } from '@utils/currency';

interface LedgerRowProps {
  entry: SocialLedgerEntry;
  countryCode: string;
}

export function LedgerRow({ entry, countryCode }: LedgerRowProps) {
  const { colors, fonts, spacing, radii } = useTheme();
  const isIncome = entry.amount > 0;
  const isNeutral = entry.amount === 0;
  const amountColor = isNeutral ? colors.t3 : isIncome ? colors.emerald : colors.crimson;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      accessibilityLabel={`${entry.label} ${entry.amount}`}
    >
      <View style={styles.top}>
        <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 13, flex: 1 }}>
          {entry.label}
        </Text>
        <Text style={{ color: amountColor, fontFamily: fonts.bodyBold, fontSize: 13 }}>
          {isNeutral
            ? '—'
            : `${isIncome ? '+' : ''}${formatCurrencyFull(entry.amount, countryCode)}`}
        </Text>
      </View>
      <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
        Age {entry.age} · {entry.kind.replace(/_/g, ' ')}
      </Text>
      {entry.breakdown ? (
        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11, marginTop: 4 }}>
          {[
            entry.breakdown.production != null
              ? `Production ${formatCurrencyFull(entry.breakdown.production, countryCode)}`
              : null,
            entry.breakdown.marketing != null
              ? `Marketing ${formatCurrencyFull(entry.breakdown.marketing, countryCode)}`
              : null,
            entry.breakdown.payroll != null
              ? `Payroll ${formatCurrencyFull(entry.breakdown.payroll, countryCode)}`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderWidth: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
