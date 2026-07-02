import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

interface Props {
  visible: boolean;
  daysAway: number;
  coins: number;
  gems: number;
  characterAge: number;
  projectedAge: number;
  narrativeLines: string[];
  onClaim: () => void;
}

export function ReturnAbsenceModal({
  visible,
  daysAway,
  coins,
  gems,
  characterAge,
  projectedAge,
  narrativeLines,
  onClaim,
}: Props) {
  const { colors, fonts, radii } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border, borderRadius: radii.lg }]}>
          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>
            Welcome Back
          </Text>

          {/* Age catch-up */}
          <View style={[styles.ageRow, { backgroundColor: `${colors.gold}10`, borderColor: `${colors.gold}25`, borderRadius: radii.md }]}>
            <Text style={[styles.ageLabel, { color: colors.t3, fontFamily: fonts.body }]}>
              You were away for {daysAway} day{daysAway === 1 ? '' : 's'}
            </Text>
            {projectedAge > characterAge ? (
              <View style={styles.agePill}>
                <Text style={[styles.ageNum, { color: colors.t2, fontFamily: fonts.monoSemiBold }]}>Age {characterAge}</Text>
                <Text style={[styles.ageArrow, { color: colors.gold }]}>→</Text>
                <Text style={[styles.ageNum, { color: colors.gold, fontFamily: fonts.monoSemiBold }]}>Age {projectedAge}</Text>
              </View>
            ) : null}
            <Text style={[styles.disclaimer, { color: colors.t4, fontFamily: fonts.body }]}>
              Life continued while you were away — {projectedAge > characterAge ? `you're now ${projectedAge}` : 'your world kept moving'}.
            </Text>
          </View>

          {/* Narrative bullets */}
          {narrativeLines.length > 0 && (
            <View style={{ gap: 6 }}>
              {narrativeLines.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={[styles.bullet, { color: colors.gold }]}>•</Text>
                  <Text style={[styles.bulletText, { color: colors.t3, fontFamily: fonts.body }]}>{line}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reward */}
          <View style={[styles.rewardBox, { backgroundColor: `${colors.emerald}10`, borderColor: `${colors.emerald}25`, borderRadius: radii.md }]}>
            <Text style={[styles.rewardLabel, { color: colors.t3, fontFamily: fonts.body }]}>Return bonus</Text>
            <Text style={[styles.rewardValue, { color: colors.emerald, fontFamily: fonts.bodySemiBold }]}>
              🪙 {coins.toLocaleString()} Coins · 💎 {gems} Gems
            </Text>
          </View>

          <Pressable
            onPress={onClaim}
            style={[styles.btn, { backgroundColor: colors.emerald, borderRadius: radii.md }]}
          >
            <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold }}>Claim & Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 14,
  },
  title: { fontSize: 22, textAlign: 'center' },
  ageRow: { padding: 12, gap: 6, alignItems: 'center', borderWidth: 1 },
  ageLabel: { fontSize: 12, textAlign: 'center' },
  agePill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ageNum: { fontSize: 16 },
  ageArrow: { fontSize: 18, fontWeight: '700' },
  disclaimer: { fontSize: 11, textAlign: 'center', lineHeight: 16, opacity: 0.8 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { fontSize: 14, lineHeight: 20 },
  bulletText: { fontSize: 13, lineHeight: 20, flex: 1 },
  rewardBox: { padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  rewardLabel: { fontSize: 11 },
  rewardValue: { fontSize: 15 },
  btn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
});
