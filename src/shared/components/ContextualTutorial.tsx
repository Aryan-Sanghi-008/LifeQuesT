import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { useReducedMotion } from '@hooks/useReducedMotion';

export const SCREEN_TUTORIALS: Record<string, readonly { title: string; body: string }[]> = {
  home: [
    { title: 'Home Hub', body: 'Daily rewards, mystery box, season pass, and dynasty progress live here.' },
    { title: 'Currencies', body: 'Bank cash pays life costs. Coins buy activities. Gems unlock premium cosmetics.' },
  ],
  life: [
    { title: 'Life Feed', body: 'Events appear here each year. Tap choices to shape your story — costly picks ask for confirmation.' },
    { title: 'Age Up', body: 'Use the Age Up button when ready. Stats, economy, and relationships tick forward annually.' },
  ],
  activities: [
    { title: 'Activities', body: 'Train stats and hobbies. Costs scale to your birthplace currency.' },
    { title: 'Energy', body: 'Each activity costs coins or cash — check the price chip before confirming.' },
  ],
  people: [
    { title: 'Relationships', body: 'Interact with family, friends, and partners. Paid actions show exact local costs.' },
    { title: 'Bonds', body: 'Higher relationship scores unlock better outcomes in events and inheritance.' },
  ],
  assets: [
    { title: 'Wealth', body: 'Buy property, vehicles, stocks, and mutual funds. All prices are country-scaled.' },
    { title: 'Debt', body: 'Large purchases can push you into debt — watch your balance and credit score.' },
  ],
};

export function ContextualTutorial({ screenId }: { screenId: string }) {
  const { colors, fonts, radii, spacing } = useTheme();
  const character = useGameStore((s) => s.character);
  const markSeen = useGameStore((s) => s.markTutorialScreenSeen);
  const seen = character?.tutorialScreensSeen ?? [];
  const steps = SCREEN_TUTORIALS[screenId];
  const [stepIndex, setStepIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  if (!character || !steps || seen.includes(screenId)) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  const finish = () => {
    markSeen(screenId);
  };

  const next = () => {
    if (isLast) finish();
    else setStepIndex((i) => i + 1);
  };

  return (
    <Modal visible transparent animationType={reducedMotion ? 'none' : 'fade'}>
      <View style={[styles.overlay, { backgroundColor: colors.overlayScrim }]}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderRadius: radii.lg, borderColor: colors.teal }]}>
          <Text style={{ color: colors.teal, fontFamily: fonts.monoSemiBold, fontSize: 11 }}>
            {screenId.toUpperCase()} GUIDE {stepIndex + 1}/{steps.length}
          </Text>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.bodyBold }]}>{step.title}</Text>
          <Text style={{ color: colors.t2, fontFamily: fonts.body, lineHeight: 22 }}>{step.body}</Text>
          <View style={styles.actions}>
            <Pressable onPress={finish} style={[styles.btn, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}>
              <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold }}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={next}
              style={[styles.btn, { backgroundColor: colors.teal, borderRadius: radii.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, flex: 1 }]}
            >
              <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold, textAlign: 'center' }}>
                {isLast ? 'Got it' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  card: { padding: 20, borderWidth: 1, gap: 10, marginBottom: 24 },
  title: { fontSize: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  btn: { minHeight: 44, justifyContent: 'center' },
});
