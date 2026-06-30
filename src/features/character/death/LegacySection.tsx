import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@theme';
import { formatCurrency } from '@utils/currency';

interface Props {
  dynastyScore: number;
  prestigeLevel: number;
  lifetimeEarnings: number;
  country: string;
}

export function LegacySection({ dynastyScore, prestigeLevel, lifetimeEarnings, country }: Props) {
  const { colors, fonts, radii } = useTheme();
  return (
    <LinearGradient
      colors={[`${colors.gold}18`, `${colors.gold}06`]}
      style={[styles.container, { borderColor: `${colors.gold}30`, borderRadius: radii.lg }]}
    >
      <Text style={[styles.title, { color: colors.gold, fontFamily: fonts.bodyBold }]}>DYNASTY & LEGACY</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[styles.val, { color: colors.t1, fontFamily: fonts.displayBlack }]}>{dynastyScore.toFixed(0)}</Text>
          <Text style={[styles.label, { color: colors.t3, fontFamily: fonts.body }]}>Dynasty Score</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[styles.val, { color: colors.orchid, fontFamily: fonts.displayBlack }]}>{prestigeLevel}</Text>
          <Text style={[styles.label, { color: colors.t3, fontFamily: fonts.body }]}>Prestige Level</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[styles.val, { color: colors.emerald, fontFamily: fonts.displayBlack }]}>
            {formatCurrency(lifetimeEarnings, country)}
          </Text>
          <Text style={[styles.label, { color: colors.t3, fontFamily: fonts.body }]}>Lifetime Earnings</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, borderWidth: 1, gap: 16 },
  title: { fontSize: 10, letterSpacing: 2, textAlign: 'center' },
  val: { fontSize: 22 },
  label: { fontSize: 10, letterSpacing: 1 },
  divider: { width: 1, height: 40 },
});
