import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { DynastyMilestone } from '@data/dynastyMilestones';
import type { RootStackParamList } from '@/types';

interface Props {
  milestone: DynastyMilestone | null;
  onDismiss: () => void;
}

export function DynastyMilestoneModal({ milestone, onDismiss }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!milestone) return null;

  const handleViewTree = () => {
    onDismiss();
    navigation.navigate('FamilyTree' as never);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: `${colors.teal}30`, borderRadius: radii.lg }]}>

          <Text style={[styles.icon]}>{milestone.icon}</Text>

          <Text style={[styles.title, { color: colors.t1, fontFamily: fonts.displayBold }]}>
            {milestone.label}
          </Text>
          <Text style={[styles.description, { color: colors.t3, fontFamily: fonts.body }]}>
            {milestone.description}
          </Text>

          {/* Rewards */}
          <View style={[styles.rewardBox, { backgroundColor: `${colors.teal}12`, borderColor: `${colors.teal}30`, borderRadius: radii.md }]}>
            <Text style={[styles.rewardTitle, { color: colors.teal, fontFamily: fonts.bodySemiBold }]}>
              Dynasty Reward
            </Text>
            <View style={styles.rewardRow}>
              <Text style={[styles.rewardChip, { color: colors.t2, fontFamily: fonts.monoSemiBold }]}>
                🪙 {milestone.coinReward.toLocaleString()}
              </Text>
              <Text style={[styles.rewardChip, { color: colors.t2, fontFamily: fonts.monoSemiBold }]}>
                💎 {milestone.gemReward}
              </Text>
            </View>
            <View style={[styles.titleBadge, { backgroundColor: `${colors.teal}20`, borderRadius: radii.xs }]}>
              <Text style={{ color: colors.teal, fontFamily: fonts.monoSemiBold, fontSize: 10, letterSpacing: 0.6 }}>
                TITLE: {milestone.titleReward.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Pressable
              onPress={handleViewTree}
              style={[styles.primaryBtn, { backgroundColor: colors.teal, borderRadius: radii.md }]}
            >
              <Text style={{ color: '#FFF', fontFamily: fonts.bodyBold }}>View Family Tree</Text>
            </Pressable>
            <Pressable
              onPress={onDismiss}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radii.md }]}
            >
              <Text style={{ color: colors.t3, fontFamily: fonts.bodySemiBold }}>Continue</Text>
            </Pressable>
          </View>
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
    gap: 12,
    alignItems: 'center',
  },
  icon: { fontSize: 48 },
  title: { fontSize: 22, textAlign: 'center' },
  description: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  rewardBox: { padding: 14, borderWidth: 1, alignItems: 'center', gap: 8, width: '100%' },
  rewardTitle: { fontSize: 11, letterSpacing: 0.6 },
  rewardRow: { flexDirection: 'row', gap: 16 },
  rewardChip: { fontSize: 16 },
  titleBadge: { paddingHorizontal: 10, paddingVertical: 4 },
  primaryBtn: { paddingVertical: 14, alignItems: 'center', width: '100%' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center', borderWidth: 1, width: '100%' },
});
