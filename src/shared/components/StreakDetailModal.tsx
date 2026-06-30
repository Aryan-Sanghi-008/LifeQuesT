import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { STREAK_MILESTONES } from '@store/slices/progressionSlice';

interface Props {
  visible: boolean;
  onClose: () => void;
  streak: number;
  shieldCount: number;
  claimedMilestones: number[];
}

export function StreakDetailModal({
  visible,
  onClose,
  streak,
  shieldCount,
  claimedMilestones,
}: Props) {
  const { colors, fonts, radii, spacing } = useTheme();

  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>
            🔥 {streak}-Day Streak
          </Text>
          {shieldCount > 0 && (
            <Text style={{ color: colors.sapphire, fontFamily: fonts.body, fontSize: 13, marginBottom: spacing.sm }}>
              🛡️ {shieldCount} Streak Shield{shieldCount === 1 ? '' : 's'} available
            </Text>
          )}
          {nextMilestone && (
            <View style={[styles.nextBox, { backgroundColor: `${colors.gold}12`, borderColor: `${colors.gold}30`, borderRadius: radii.md }]}>
              <Text style={{ color: colors.gold3 ?? colors.gold, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
                {nextMilestone.days - streak} day{nextMilestone.days - streak === 1 ? '' : 's'} until {nextMilestone.label}
              </Text>
              <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 12, marginTop: 4 }}>
                Reward: {nextMilestone.rewardLabel}
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: colors.t3, fontFamily: fonts.bodyBold }]}>MILESTONES</Text>
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {STREAK_MILESTONES.map((m) => {
              const claimed = claimedMilestones.includes(m.days);
              const reached = streak >= m.days;
              return (
                <View
                  key={m.days}
                  style={[styles.milestoneRow, {
                    borderColor: claimed ? colors.emerald : colors.border,
                    backgroundColor: reached ? `${colors.gold}08` : colors.bg2,
                    borderRadius: radii.sm,
                  }]}
                >
                  <Text style={{ fontSize: 18 }}>{claimed ? '✅' : reached ? '🔥' : '○'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{m.label}</Text>
                    <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: 11 }}>{m.rewardLabel}</Text>
                  </View>
                  <Text style={{ color: colors.t4, fontFamily: fonts.monoSemiBold, fontSize: 11 }}>{m.days}d</Text>
                </View>
              );
            })}
          </ScrollView>

          <Text style={[styles.hint, { color: colors.t4, fontFamily: fonts.body, fontSize: 11 }]}>
            Age up at least once per day to keep your streak. Miss a day? Use a Streak Shield from the Shop.
          </Text>

          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.bg2, borderRadius: radii.md }]}
          >
            <Text style={{ color: colors.t1, fontFamily: fonts.bodySemiBold }}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { padding: 20, borderWidth: 1, gap: 12, maxHeight: '75%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 22, textAlign: 'center' },
  nextBox: { padding: 12, borderWidth: 1 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, marginBottom: 6 },
  hint: { lineHeight: 16, textAlign: 'center' },
  closeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
});
