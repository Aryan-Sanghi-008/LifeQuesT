import { useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useGameStore } from '../store/gameStore';
import { GradientButton, Card } from '../components/index';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function StudyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore(s => s.character);
  const startStudySession = useGameStore(s => s.startStudySession);
  const completeStudySession = useGameStore(s => s.completeStudySession);

  const [questions] = useState(() => startStudySession());
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  if (!character || questions.length === 0) {
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
  scroll: { gap: SPACING.md },
  title: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1 },
  sub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t3, marginBottom: SPACING.sm },
  question: { fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.t1, marginBottom: SPACING.md },
  option: {
    padding: SPACING.md,
    borderRadius: 10,
    backgroundColor: COLORS.bg2,
    marginBottom: SPACING.sm,
  },
  optionText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.t1 },
});
