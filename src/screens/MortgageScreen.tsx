import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { useGameStore } from '@store/gameStore';
import { PROPERTY_MAP } from '@data/properties';
import { calculateMortgagePayment } from '@engine/housingEngine';
import { formatCurrency } from '@utils/currency';
import type { RootStackParamList } from '@/types';

export function MortgageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Mortgage'>>();
  const character = useGameStore(s => s.character);
  const purchaseProperty = useGameStore(s => s.purchaseProperty);

  const def = PROPERTY_MAP[route.params.propertyDefId];

  if (!character || !def) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Property Not Found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cc = character.countryCode ?? 'IN';
  const fmt = (n: number) => formatCurrency(n, cc);
  const downPayment = Math.round(def.value * def.downPaymentPct);
  const mortgage = def.value - downPayment;
  const monthly = calculateMortgagePayment(mortgage, def.mortgageRate, def.termYears);
  const canAfford = character.bankBalance >= downPayment && character.age >= def.minAge;

  const handlePurchase = () => {
    const result = purchaseProperty(def.id);
    Alert.alert(result.ok ? 'Purchased' : 'Cannot Purchase', result.message, [
      { text: 'OK', onPress: () => result.ok && navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{def.name}</Text>
        <Text style={styles.tier}>{def.tier.toUpperCase()} · Min age {def.minAge}</Text>

        <View style={styles.row}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>List Price</Text>
            <Text style={styles.metricValue}>{fmt(def.value)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Down Payment</Text>
            <Text style={styles.metricValue}>{fmt(downPayment)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Mortgage</Text>
            <Text style={styles.metricValue}>{fmt(mortgage)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Monthly Payment</Text>
            <Text style={styles.metricValue}>{fmt(monthly)}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailLine}>Rate: {(def.mortgageRate * 100).toFixed(1)}% · Term: {def.termYears} yr</Text>
          <Text style={styles.detailLine}>Maintenance: {(def.maintenancePct * 100).toFixed(1)}%/yr</Text>
          <Text style={styles.detailLine}>Happiness bonus: +{def.happinessBonus}</Text>
          <Text style={styles.detailLine}>Credit score: {character.creditScore ?? 650}</Text>
        </View>

        <Pressable
          onPress={handlePurchase}
          disabled={!canAfford}
          style={[styles.btn, !canAfford && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>
            {canAfford ? 'Purchase Property' : character.age < def.minAge ? 'Too Young' : 'Insufficient Funds'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.xl, gap: SPACING.md },
  title: { fontFamily: FONTS.displayBold, fontSize: 22, color: COLORS.t1 },
  tier: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, letterSpacing: 1, marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  metric: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
  metricValue: { fontFamily: FONTS.monoSemiBold, fontSize: 14, color: COLORS.teal, marginTop: 4 },
  details: { gap: 6, marginTop: SPACING.sm },
  detailLine: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3 },
  btn: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.bg },
  backBtn: { alignItems: 'center', padding: SPACING.md },
  backText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3 },
});
