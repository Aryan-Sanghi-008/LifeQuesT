import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { useGameStore } from '@store/gameStore';
import { getCrimeDef } from '@data/crimes';
import type { RootStackParamList } from '@/types';

const LAWYER_OPTIONS = [
  { quality: 1, label: 'Public Defender', cost: 0, desc: 'Basic representation' },
  { quality: 2, label: 'Experienced Attorney', cost: 5000, desc: 'Solid defense strategy' },
  { quality: 3, label: 'Elite Legal Team', cost: 25000, desc: 'Best chance at acquittal' },
] as const;

export function CourtScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const resolveCourt = useGameStore(s => s.resolveCourt);
  const clearPendingCourt = useGameStore(s => s.clearPendingCourt);

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

  const handleResolve = (quality: number, cost: number) => {
    if (character.bankBalance < cost) {
      Alert.alert('Insufficient Funds', `You need ${cost} for this lawyer.`);
      return;
    }
    const result = resolveCourt(quality, cost);
    Alert.alert('Verdict', result.message, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

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
              Potential sentence: {crime.baseSentenceYears} yr · Fine: {crime.fineAmount ?? 0}
            </Text>
          )}
        </View>

        <Text style={styles.section}>Choose Your Lawyer</Text>
        {LAWYER_OPTIONS.map(opt => (
          <Pressable
            key={opt.quality}
            onPress={() => handleResolve(opt.quality, opt.cost)}
            style={styles.lawyerCard}
          >
            <Text style={styles.lawyerLabel}>{opt.label}</Text>
            <Text style={styles.lawyerDesc}>{opt.desc}</Text>
            <Text style={styles.lawyerCost}>
              {opt.cost === 0 ? 'Free' : `$${opt.cost.toLocaleString()}`}
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
          <Text style={[styles.btnText, { color: COLORS.t3 }]}>Skip (auto-resolve later)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.xl, gap: SPACING.md },
  title: { fontFamily: FONTS.displayBold, fontSize: 24, color: COLORS.t1 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, marginBottom: SPACING.md },
  caseCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.crimson}40`,
    gap: SPACING.xs,
  },
  caseLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 10, color: COLORS.crimson, letterSpacing: 2 },
  caseTitle: { fontFamily: FONTS.bodyBold, fontSize: 18, color: COLORS.t1 },
  caseMeta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
  caseDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: SPACING.xs },
  section: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.t4, letterSpacing: 1.5, marginTop: SPACING.md },
  lawyerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  lawyerLabel: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.t1 },
  lawyerDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t3 },
  lawyerCost: { fontFamily: FONTS.monoSemiBold, fontSize: 13, color: COLORS.gold, marginTop: 4 },
  btn: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: COLORS.sapphire,
    alignItems: 'center',
  },
  skipBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  btnText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.t1 },
});
