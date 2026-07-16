import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles, useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { getCrimeDef } from '@data/crimes';
import { ConfirmSpendModal } from '@components/ConfirmSpendModal';
import { scaleFineAmount, scaleLawyerCost } from '@engine/countryScaleEngine';
import { formatCurrency } from '@utils/currency';
import { getMaxPersonalDebtForCharacter } from '@data/countryEconomy';
import type { RootStackParamList } from '@/types';

const LAWYER_OPTIONS_BASE = [
  { quality: 1, label: 'Public Defender', costUsd: 0, desc: 'Basic representation' },
  { quality: 2, label: 'Experienced Attorney', costUsd: 5000, desc: 'Solid defense strategy' },
  { quality: 3, label: 'Elite Legal Team', costUsd: 25000, desc: 'Best chance at acquittal' },
] as const;

export function CourtScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const resolveCourt = useGameStore(s => s.resolveCourt);
  const clearPendingCourt = useGameStore(s => s.clearPendingCourt);

  const [pendingLawyer, setPendingLawyer] = useState<{ quality: number; cost: number; label: string } | null>(null);

  const cc = character?.countryCode ?? 'US';
  const lawyerOptions = useMemo(
    () => LAWYER_OPTIONS_BASE.map(opt => ({
      ...opt,
      cost: scaleLawyerCost(opt.costUsd, cc),
    })),
    [cc],
  );

  if (!character?.legalCase) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Court</Text>
        <Text style={styles.sub}>No active legal case.</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const crime = getCrimeDef(character.legalCase.crimeId);
  const heat = character.heatLevel ?? character.criminalRecord?.heatLevel ?? 0;
  const scaledFine = crime?.fineAmount
    ? scaleFineAmount(crime.fineAmount, cc)
    : 0;
  const debt = character.debt ?? 0;
  const maxDebt = getMaxPersonalDebtForCharacter(character);

  const requestResolve = (quality: number, cost: number, label: string) => {
    const projectedDebt = debt + Math.max(0, cost - character.bankBalance);
    if (cost > 0 && projectedDebt > maxDebt && character.bankBalance < cost) {
      Alert.alert('Insufficient Funds', `You need ${formatCurrency(cost, cc)} for this lawyer.`);
      return;
    }
    setPendingLawyer({ quality, cost, label });
  };

  const confirmResolve = () => {
    if (!pendingLawyer) return;
    const result = resolveCourt(pendingLawyer.quality, pendingLawyer.cost);
    setPendingLawyer(null);
    Alert.alert('Verdict', result.message, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const pendingWarning = pendingLawyer && pendingLawyer.cost > 0 && (
    character.bankBalance < pendingLawyer.cost || debt > maxDebt * 0.5
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Court Hearing</Text>
        <Text style={styles.sub}>Age {character.age} · Heat Level {heat}</Text>

        <View style={styles.caseCard}>
          <Text style={styles.caseLabel}>CHARGE</Text>
          <Text style={styles.caseTitle}>{crime?.label ?? character.legalCase.crimeId}</Text>
          <Text style={styles.caseMeta}>
            Stage: {character.legalCase.stage} · Evidence: {character.legalCase.evidence}
          </Text>
          {crime && (
            <Text style={styles.caseDesc}>
              Potential sentence: {crime.baseSentenceYears} yr · Fine: {formatCurrency(scaledFine, cc)}
            </Text>
          )}
        </View>

        <Text style={styles.section}>Choose Your Lawyer</Text>
        {lawyerOptions.map(opt => (
          <Pressable
            key={opt.quality}
            onPress={() => requestResolve(opt.quality, opt.cost, opt.label)}
            style={styles.lawyerCard}
          >
            <Text style={styles.lawyerLabel}>{opt.label}</Text>
            <Text style={styles.lawyerDesc}>{opt.desc}</Text>
            <Text style={styles.lawyerCost}>
              {opt.cost === 0 ? 'Free' : formatCurrency(opt.cost, cc)}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            clearPendingCourt();
            navigation.goBack();
          }}
          style={[styles.btn, styles.skipBtn]}
        >
          <Text style={[styles.btnText, { color: colors.t3 }]}>Skip (auto-resolve later)</Text>
        </Pressable>
      </ScrollView>

      <ConfirmSpendModal
        visible={pendingLawyer !== null}
        title="Confirm Legal Defense"
        message={`Hire ${pendingLawyer?.label ?? 'lawyer'}? You may also owe a court fine if found guilty.`}
        costLabel={pendingLawyer && pendingLawyer.cost > 0
          ? formatCurrency(pendingLawyer.cost, cc)
          : undefined}
        warningLevel={pendingWarning ? 'debt' : 'info'}
        confirmLabel="Proceed to Trial"
        onConfirm={confirmResolve}
        onCancel={() => setPendingLawyer(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.t1 },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, marginBottom: spacing.md },
  caseCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.crimson}40`,
    gap: spacing.xs,
  },
  caseLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.crimson, letterSpacing: 2 },
  caseTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.t1 },
  caseMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.t3 },
  caseDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.t4, marginTop: spacing.xs },
  section: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.t4, letterSpacing: 1.5, marginTop: spacing.md },
  lawyerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  lawyerLabel: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.t1 },
  lawyerDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.t3 },
  lawyerCost: { fontFamily: fonts.monoSemiBold, fontSize: 13, color: colors.gold, marginTop: 4 },
  btn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.sapphire,
    alignItems: 'center',
  },
  skipBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.t1 },
});
