import { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@theme';
import { useGameStore } from '@store/gameStore';
import { calculateDynastyScore } from '@engine/legacyEngine';
import { DYNASTY_MILESTONES } from '@data/dynastyMilestones';
import { dismissLegacyNudge, isLegacyNudgeDismissed } from '@navigation/sessionState';
import type { RootStackParamList } from '@/types';

type NudgeType = 'will' | 'heirs' | 'dynasty' | 'score_milestone';

interface Nudge {
  type: NudgeType;
  message: string;
  sub: string;
}

function pickNudge(character: {
  age: number;
  will?: unknown;
  generation?: number;
  people: Array<{ relationType: string; isAlive: boolean }>;
  dynastyScore?: number;
  claimedDynastyMilestoneIds?: string[];
}): Nudge | null {
  const living = character.people ?? [];
  const livingHeirs = living.filter(
    (p) => (p.relationType === 'child' || p.relationType === 'sibling') && p.isAlive,
  );
  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character as never);
  const claimed = new Set(character.claimedDynastyMilestoneIds ?? []);
  const generation = character.generation ?? 1;

  // Priority order
  if (character.age >= 70 && !character.will && !isLegacyNudgeDismissed('will')) {
    return {
      type: 'will',
      message: 'Write your will — protect your legacy',
      sub: `Age ${character.age} · Your family deserves clarity.`,
    };
  }
  if (character.age >= 55 && livingHeirs.length > 0 && !isLegacyNudgeDismissed('heirs')) {
    return {
      type: 'heirs',
      message: 'Plan who continues your bloodline',
      sub: `${livingHeirs.length} heir${livingHeirs.length > 1 ? 's' : ''} ready to carry on your legacy.`,
    };
  }
  if (generation === 1 && livingHeirs.length > 0 && character.age >= 40 && !isLegacyNudgeDismissed('dynasty')) {
    return {
      type: 'dynasty',
      message: 'Build a multi-generation dynasty',
      sub: 'When you die, continue as an heir to advance your bloodline.',
    };
  }
  // Score milestone proximity
  const nextMilestone = DYNASTY_MILESTONES
    .filter((m) => m.type === 'score' && !claimed.has(m.id) && dynastyScore < m.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0];
  if (nextMilestone) {
    const pct = dynastyScore / nextMilestone.threshold;
    if (pct >= 0.8 && !isLegacyNudgeDismissed('score_milestone')) {
      const remaining = (nextMilestone.threshold - dynastyScore).toLocaleString();
      return {
        type: 'score_milestone',
        message: `${remaining} pts from "${nextMilestone.label}"`,
        sub: `Reach ${nextMilestone.threshold.toLocaleString()} dynasty score for ${nextMilestone.icon} ${nextMilestone.titleReward}.`,
      };
    }
  }

  return null;
}

export function LegacyNudgeCard() {
  const { colors, fonts, radii, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);
  const [dismissed, setDismissed] = useState(false);

  const nudge = useMemo(() => {
    if (!character || dismissed) return null;
    return pickNudge(character);
  }, [character, dismissed]);

  if (!nudge) return null;

  const handleDismiss = () => {
    dismissLegacyNudge(nudge.type);
    setDismissed(true);
  };

  const handlePress = () => {
    navigation.navigate('FamilyTree' as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, {
        backgroundColor: colors.bgCard,
        borderColor: `${colors.teal}25`,
        borderRadius: radii.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
      }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.teal}15` }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={colors.teal}
              strokeWidth={2}
              strokeLinecap="round"
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            />
          </Svg>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: colors.teal, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>
            {nudge.message}
          </Text>
          <Text style={{ color: colors.t4, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 }}>
            {nudge.sub}
          </Text>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={8}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path stroke={colors.t4} strokeWidth={2} strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
