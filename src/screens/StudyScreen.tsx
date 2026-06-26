import { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { GradientButton, Card, SectionLabel } from '../components/index';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';
import { getEnrollableDegrees, getEarnedDegrees } from '../engine/educationEngine';
import { formatCurrency } from '../utils/currency';

// ─── Degree Selection Step ─────────────────────────────────────────────────────
function DegreeSelector({
  character,
  onSelect,
  onSkip,
}: {
  character: NonNullable<ReturnType<typeof useGameStore.getState>['character']>;
  onSelect: (degreeId: string) => void;
  onSkip: () => void;
}) {
  const enrollable = getEnrollableDegrees(character);
  const earned = getEarnedDegrees(character.degreeIds ?? []);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Education</Text>

      {earned.length > 0 && (
        <>
          <SectionLabel label={`DEGREES EARNED (${earned.length})`} style={{ marginBottom: SPACING.md }} />
          {earned.map(d => (
            <View key={d.id} style={[styles.degreeCard, { borderColor: `${COLORS.emerald}30` }]}>
              <Text style={[styles.degreeLabel, { color: COLORS.emerald }]}>{d.shortLabel}</Text>
              <Text style={styles.degreeFull}>{d.label}</Text>
              <Text style={styles.degreeSub}>{d.branch} · {d.durationYears}yr</Text>
            </View>
          ))}
        </>
      )}

      {enrollable.length > 0 ? (
        <>
          <SectionLabel label="AVAILABLE PROGRAMS" style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }} />
          {enrollable.map(d => (
            <Pressable
              key={d.id}
              style={[styles.degreeCard, { borderColor: `${COLORS.sapphire}25` }]}
              onPress={() => onSelect(d.id)}
              accessibilityLabel={`Enroll in ${d.label}`}
            >
              <Text style={styles.degreeLabel}>{d.shortLabel}</Text>
              <Text style={styles.degreeFull}>{d.label}</Text>
              <Text style={styles.degreeSub}>{d.branch} · {d.durationYears}yr · {formatCurrency(d.baseAnnualCost, character.countryCode)}/yr</Text>
              <Text style={styles.degreeBonus}>+{d.intelligenceBonus} IQ on graduation</Text>
            </Pressable>
          ))}
        </>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No new programs available yet.</Text>
          <Text style={styles.emptySub}>Advance your education stage or age up to unlock more.</Text>
        </View>
      )}

      <Pressable style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipText}>Skip to Quiz →</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Main StudyScreen ─────────────────────────────────────────────────────────
export default function StudyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const startStudySession = useGameStore(s => s.startStudySession);
  const completeStudySession = useGameStore(s => s.completeStudySession);
  const grantDegree = useGameStore(s => s.grantDegree);

  const [step, setStep] = useState<'degrees' | 'quiz'>('degrees');
  const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null);
  const [questions] = useState(() => startStudySession());
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  if (!character) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Study Session</Text>
        <Text style={styles.sub}>No character found.</Text>
        <GradientButton label="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  if (step === 'degrees') {
    return (
      <SafeAreaView style={styles.safe}>
        <DegreeSelector
          character={character}
          onSelect={(degreeId) => {
            setSelectedDegreeId(degreeId);
            setStep('quiz');
          }}
          onSkip={() => setStep('quiz')}
        />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Study Session</Text>
        <Text style={styles.sub}>Not available for your age or education level.</Text>
        <GradientButton label="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const q = questions[current];

  const pickAnswer = (index: number) => {
    const nextAnswers = [...answers, index];
    if (current + 1 < questions.length) {
      setAnswers(nextAnswers);
      setCurrent(current + 1);
      return;
    }
    const result = completeStudySession(nextAnswers);

    // If a degree was selected, grant it on pass
    if (result.passed && selectedDegreeId) {
      const grantResult = grantDegree(selectedDegreeId);
      if (grantResult.ok) {
        Alert.alert(
          'Degree Earned!',
          `${grantResult.message}\nScore: ${result.score}/${result.totalQuestions}. Intelligence +${result.intelligenceGain}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
        return;
      }
    }

    Alert.alert(
      result.passed ? 'Passed!' : 'Keep Studying',
      `Score: ${result.score}/${result.totalQuestions}. Intelligence +${result.intelligenceGain}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Study Session</Text>
        {selectedDegreeId && (
          <Text style={styles.sub}>Studying for: {selectedDegreeId.replace(/_/g, ' ')}</Text>
        )}
        <Text style={styles.sub}>Question {current + 1} of {questions.length}</Text>
        <Card>
          <Text style={styles.question}>{q.prompt}</Text>
          {q.options.map((opt, i) => (
            <Pressable
              key={opt}
              style={styles.option}
              onPress={() => pickAnswer(i)}
              accessibilityLabel={`Answer ${opt}`}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  scroll: { gap: SPACING.md, paddingBottom: SPACING.xxxl },
  title: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1 },
  sub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3, marginBottom: SPACING.sm },
  question: { fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.t1, marginBottom: SPACING.md },
  option: {
    padding: SPACING.md,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.bg2,
    marginBottom: SPACING.sm,
  },
  optionText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.t1 },
  degreeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: 3,
    marginBottom: SPACING.sm,
  },
  degreeLabel: { fontFamily: FONTS.monoSemiBold, fontSize: 12, color: COLORS.sapphire, letterSpacing: 1 },
  degreeFull: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.t1 },
  degreeSub: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.t3 },
  degreeBonus: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.emerald, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: { fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.t3 },
  emptySub: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, textAlign: 'center' },
  skipBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.sapphire,
    alignItems: 'center',
  },
  skipText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.sapphire },
});
