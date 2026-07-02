import { LifeEventRecord } from '@/types';
import { hapticButtonPress, hapticMilestone, hapticNegativeEvent } from '@services/haptics';
import { playSound } from '@services/audio';
/** Standard UI tap — light haptic + button tap SFX. */
export function triggerTapFeedback(): void {
  hapticButtonPress();
  void playSound('button_tap');
}

/** Haptic + SFX for notable events surfaced after an age-up. */
export function feedbackForAgeUpRecords(records: LifeEventRecord[]): void {
  if (records.length === 0) return;

  const hasMajor =
    records.some((r) => r.rarity === 'legendary' || r.rarity === 'epic') ||
    records.some((r) => r.category === 'milestone');

  const hasNegative = records.some((r) => {
    const s = r.statEffect;
    return (
      (s.happiness ?? 0) < -5 ||
      (s.mentalHealth ?? 0) < -5 ||
      (s.health ?? 0) < -5 ||
      (s.wealth ?? 0) < -5
    );
  });

  const hasPositive = records.some((r) => (r.statEffect.happiness ?? 0) > 5);

  if (hasMajor) {
    hapticMilestone();
    void playSound('life_milestone');
    return;
  }
  if (hasNegative) {
    hapticNegativeEvent();
    void playSound('negative_event');
    return;
  }
  if (hasPositive) {
    void playSound('positive_event');
  }
}
