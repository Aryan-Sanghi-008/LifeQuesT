import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useGameStore } from "@store/gameStore";
import { calculateDynastyScore } from "@engine/legacyEngine";
import type { RootStackParamList } from "@/types";

const DYNASTY_MILESTONES = [1000, 5000, 10000, 25000, 50000];

export function DynastyProgressCard() {
  const { colors, fonts, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const character = useGameStore((s) => s.character);

  if (!character) return null;

  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character);
  const generation = character.generation ?? 1;
  const livingHeirs = character.people.filter(
    (p) =>
      (p.relationType === "child" || p.relationType === "sibling") &&
      p.isAlive,
  ).length;

  // Progress toward next dynasty milestone
  const nextMilestone = DYNASTY_MILESTONES.find((m) => m > dynastyScore) ?? null;
  const prevMilestone = [...DYNASTY_MILESTONES].reverse().find((m) => m <= dynastyScore) ?? 0;
  const pct = nextMilestone
    ? Math.min(100, ((dynastyScore - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  const teal = colors.teal;

  return (
    <Pressable
      onPress={() => navigation.navigate("FamilyTree" as never)}
      accessibilityRole="button"
      accessibilityLabel="View Family Tree"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: `${teal}30`,
          borderRadius: radii.md,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              stroke={teal}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.t4, fontFamily: fonts.bodySemiBold }]}>
            DYNASTY LEGACY
          </Text>
          <Text style={[styles.genText, { color: teal, fontFamily: fonts.bodyBold }]}>
            Generation {generation} · {livingHeirs} living heir{livingHeirs !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={[styles.scoreNum, { color: teal, fontFamily: fonts.monoSemiBold }]}>
            {dynastyScore.toLocaleString()}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.t4, fontFamily: fonts.body }]}>pts</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ gap: 4 }}>
        <View style={[styles.track, { backgroundColor: colors.bg2 }]}>
          <View
            style={[
              styles.fill,
              { width: `${pct}%` as any, backgroundColor: teal },
            ]}
          />
        </View>
        {nextMilestone ? (
          <Text style={[styles.progressHint, { color: colors.t4, fontFamily: fonts.body }]}>
            {(nextMilestone - dynastyScore).toLocaleString()} pts to next milestone
          </Text>
        ) : (
          <Text style={[styles.progressHint, { color: teal, fontFamily: fonts.body }]}>
            All dynasty milestones reached!
          </Text>
        )}
      </View>

      {/* CTA hint */}
      <Text style={[styles.cta, { color: colors.t3, fontFamily: fonts.body }]}>
        View Family Tree →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  genText: { fontSize: 13, marginTop: 1 },
  scoreWrap: { alignItems: "flex-end" },
  scoreNum: { fontSize: 16 },
  scoreLabel: { fontSize: 10 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  progressHint: { fontSize: 10 },
  cta: { fontSize: 12, textAlign: "right" },
});
