import { View, Text, StyleSheet } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { getCurrentSeason } from '@engine/liveOpsEngine';
import { CHALLENGES } from '@engine/challengeEngine';
import { getSeasonPassLevel } from '@utils/seasonPassHelper';
import type { ChallengeId } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function MetaProgressHelpSheet({ visible, onClose }: Props) {
  const { colors, fonts, spacing } = useTheme();
  const character = useGameStore((s) => s.character);
  const season = getCurrentSeason();
  const challengeId = character?.activeChallengeId as ChallengeId | undefined;
  const challenge = challengeId ? CHALLENGES[challengeId] : undefined;
  const { level: passLevel } = getSeasonPassLevel(character?.seasonXp ?? 0);

  if (!visible) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Meta Progress">
      <View style={{ gap: spacing.md }}>
        <Text style={[styles.body, { color: colors.t2, fontFamily: fonts.body }]}>
          Meta systems stack across lives — dynasty, season pass, challenges, and daily quests all feed long-term power.
        </Text>
        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
          <Text style={[styles.label, { color: colors.gold, fontFamily: fonts.bodyBold }]}>Dynasty</Text>
          <Text style={[styles.body, { color: colors.t3, fontFamily: fonts.body }]}>
            Heirs inherit stat bonuses and unlocked traits. Higher dynasty tiers amplify starting stats for the next generation.
          </Text>
        </View>
        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
          <Text style={[styles.label, { color: colors.teal, fontFamily: fonts.bodyBold }]}>Season Pass · Lv {passLevel}</Text>
          <Text style={[styles.body, { color: colors.t3, fontFamily: fonts.body }]}>
            Earn season XP from quests and milestones. Premium pass unlocks tier rewards in the Shop.
          </Text>
        </View>
        {challenge && (
          <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={[styles.label, { color: colors.orchid, fontFamily: fonts.bodyBold }]}>Active Challenge</Text>
            <Text style={[styles.body, { color: colors.t3, fontFamily: fonts.body }]}>
              {challenge.title}: {challenge.description}
            </Text>
          </View>
        )}
        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
          <Text style={[styles.label, { color: colors.sapphire, fontFamily: fonts.bodyBold }]}>Live Ops · {season.title}</Text>
          <Text style={[styles.body, { color: colors.t3, fontFamily: fonts.body }]}>
            {season.description}
          </Text>
        </View>
        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
          <Text style={[styles.label, { color: colors.emerald, fontFamily: fonts.bodyBold }]}>Daily Quests</Text>
          <Text style={[styles.body, { color: colors.t3, fontFamily: fonts.body }]}>
            Coins and gems from daily quests buy activities and cosmetics. Claim on Home each day.
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  block: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  label: { fontSize: 13 },
  body: { fontSize: 13, lineHeight: 20 },
});
