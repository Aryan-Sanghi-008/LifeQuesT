import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';

export const TUTORIAL_STEPS = [
  { id: 'home', title: 'Welcome to LifeQuest', body: 'This is your Home hub — check daily rewards, mystery box, and meta progress here.' },
  { id: 'age_up', title: 'Age Up', body: 'Tap Age Up on the Life tab to advance one year. Events, economy, and relationships update each year.' },
  { id: 'money', title: 'Two Currencies', body: 'Cash (bank balance) pays for life costs. Activity Coins pay for mind/body activities. Gems are rare upgrades.' },
  { id: 'relationships', title: 'Relationships', body: 'Interact with people — paid actions show exact costs in your local currency before you confirm.' },
  { id: 'assets', title: 'Build Wealth', body: 'Buy property, stocks, and vehicles. They affect net worth and unlock career paths — not just cosmetics.' },
] as const;

interface Props {
  visible: boolean;
  stepIndex: number;
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ visible, stepIndex, onNext, onSkip }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return null;

  const isLast = stepIndex >= TUTORIAL_STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.gold }]}>
          <Text style={{ color: colors.gold, fontFamily: fonts.monoSemiBold, fontSize: 11 }}>
            GUIDE {stepIndex + 1}/{TUTORIAL_STEPS.length}
          </Text>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{step.title}</Text>
          <Text style={{ color: colors.t2, fontFamily: fonts.body, lineHeight: 22 }}>{step.body}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onSkip} style={[styles.btn, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}>
              <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold }}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={onNext}
              style={[styles.btn, { backgroundColor: colors.gold, borderRadius: radii.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, flex: 1 }]}
            >
              <Text style={{ color: colors.bgCard, fontFamily: fonts.bodyBold, textAlign: 'center' }}>
                {isLast ? 'Start Living' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useTutorialState() {
  const tutorialStep = useGameStore((s) => s.tutorialStep ?? 0);
  const tutorialComplete = useGameStore((s) => s.tutorialComplete ?? false);
  const setTutorialStep = useGameStore((s) => s.setTutorialStep);
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  return { tutorialStep, tutorialComplete, setTutorialStep, completeTutorial };
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  card: { padding: 20, borderWidth: 1, gap: 10, marginBottom: 24 },
  title: { fontSize: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  btn: { minHeight: 44, justifyContent: 'center' },
});
