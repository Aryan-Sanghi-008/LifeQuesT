import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { PROPERTY_MAP } from '@data/properties';
import { calculateMortgagePayment } from '@engine/housingEngine';
import { formatCurrency } from '@utils/currency';
import { ConfirmSpendModal } from '@components/ConfirmSpendModal';
import { createPropertyAsset } from '@engine/housingEngine';
import { getMaxPersonalDebtForCharacter } from '@data/countryEconomy';
import type { RootStackParamList } from '@/types';

export function MortgageScreen() {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Mortgage'>>();
  const character = useGameStore(s => s.character);
  const purchaseProperty = useGameStore(s => s.purchaseProperty);
  const [confirmPurchase, setConfirmPurchase] = useState(false);

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
  const { asset } = createPropertyAsset(def, character.age, cc);
  const downPayment = asset.value - (asset.debt ?? 0);
  const mortgage = asset.debt ?? 0;
  const monthly = calculateMortgagePayment(mortgage, def.mortgageRate, def.termYears);
  const maxDebt = getMaxPersonalDebtForCharacter(character);
  const projectedDebt = (character.debt ?? 0) + Math.max(0, downPayment - character.bankBalance);
  const canAfford = projectedDebt <= maxDebt && character.age >= def.minAge;

  const handlePurchase = () => {
    setConfirmPurchase(true);
  };

  const confirmPurchaseAction = () => {
    setConfirmPurchase(false);
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
            <Text style={styles.metricValue}>{fmt(asset.value)}</Text>
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

      <ConfirmSpendModal
        visible={confirmPurchase}
        title="Confirm Property Purchase"
        message={`Buy ${def.name}? Down payment will be deducted from your balance.`}
        costLabel={fmt(downPayment)}
        warningLevel={projectedDebt > character.bankBalance ? 'debt' : 'info'}
        confirmLabel="Purchase"
        onConfirm={confirmPurchaseAction}
        onCancel={() => setConfirmPurchase(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.t1 },
  tier: { fontFamily: fonts.body, fontSize: 12, color: colors.t4, letterSpacing: 1, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  metric: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.t4 },
  metricValue: { fontFamily: fonts.monoSemiBold, fontSize: 14, color: colors.teal, marginTop: 4 },
  details: { gap: 6, marginTop: spacing.sm },
  detailLine: { fontFamily: fonts.body, fontSize: 13, color: colors.t3 },
  btn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.teal,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.bg },
  backBtn: { alignItems: 'center', padding: spacing.md },
  backText: { fontFamily: fonts.body, fontSize: 14, color: colors.t3 },
});
