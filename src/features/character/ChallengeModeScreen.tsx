import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles, useTheme, SPACING } from '@theme';
import { useGameStore } from "../../store/gameStore";
import { ScreenHeader } from "@components/ScreenHeader";
import { Card, SectionLabel, Divider } from "@components/index";
import { CHALLENGES } from "../../engine/challengeEngine";
import Svg, { Path, Circle } from "react-native-svg";

// ─── Icons ────────────────────────────────────────────────────────────────────
function TrophyIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        d="M8 21h8M12 21v-4M17 3H7l1 8a4 4 0 008 0l1-8z"
      />
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M6 3H3v4a3 3 0 006 0M18 3h3v4a3 3 0 01-6 0" />
    </Svg>
  );
}
function CheckIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </Svg>
  );
}
function LockIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        d="M18 11H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────
function ChallengeCard({
  challenge,
  isActive,
  isCompleted,
  accentColor,
}: {
  challenge: { id: string; title: string; description: string; rules: string[]; pointsReward: number };
  isActive: boolean;
  isCompleted: boolean;
  accentColor: string;
}) {
  const { colors, fonts, spacing, radii } = useTheme();

  const borderColor = isActive
    ? accentColor
    : isCompleted
    ? `${colors.gold}60`
    : colors.border;

  return (
    <Card
      style={{
        borderColor,
        borderWidth: isActive ? 1.5 : 1,
        opacity: isCompleted ? 0.75 : 1,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Colored header strip */}
      <View
        style={{
          backgroundColor: isActive
            ? `${accentColor}18`
            : isCompleted
            ? `${colors.gold}0C`
            : `${accentColor}08`,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: borderColor,
        }}
      >
        <TrophyIcon color={isCompleted ? colors.gold : accentColor} size={20} />
        <Text
          style={{
            flex: 1,
            fontFamily: fonts.bodySemiBold,
            fontSize: 15,
            color: isCompleted ? colors.t3 : colors.t1,
          }}
          numberOfLines={1}
        >
          {challenge.title}
        </Text>

        {/* Status badge */}
        {isCompleted ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: `${colors.gold}20`, borderRadius: radii.sm,
            paddingHorizontal: 8, paddingVertical: 3 }}>
            <CheckIcon color={colors.gold} size={10} />
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 9, color: colors.gold, letterSpacing: 0.8 }}>
              DONE
            </Text>
          </View>
        ) : isActive ? (
          <View style={{ backgroundColor: `${accentColor}20`, borderRadius: radii.sm,
            paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 9, color: accentColor, letterSpacing: 0.8 }}>
              ACTIVE
            </Text>
          </View>
        ) : (
          <LockIcon color={colors.t4} size={13} />
        )}
      </View>

      {/* Body */}
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.t3, lineHeight: 18 }}>
          {challenge.description}
        </Text>

        <Divider />

        {/* Constraints */}
        <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.t3,
          textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
          Constraints
        </Text>
        {challenge.rules.map((rule, idx) => (
          <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
            <View style={{ marginTop: 4 }}>
              <Circle cx="4" cy="4" r="3" fill={isCompleted ? colors.t4 : accentColor} />
              <Svg width={8} height={8} viewBox="0 0 8 8">
                <Circle cx="4" cy="4" r="3" fill={isCompleted ? colors.t4 : accentColor} />
              </Svg>
            </View>
            <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 12,
              color: isCompleted ? colors.t4 : colors.t2, lineHeight: 18 }}>
              {rule}
            </Text>
          </View>
        ))}

        <Divider />

        {/* Reward footer */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.t4, letterSpacing: 1 }}>
            PRESTIGE REWARD
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: isCompleted ? `${colors.t4}15` : `${colors.gold}15`,
            borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 12,
              color: isCompleted ? colors.t4 : colors.gold }}>
              +{challenge.pointsReward} pts
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

// ─── Accent colors cycling through challenges ─────────────────────────────────
const ACCENT_PALETTE = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B",
  "#EC4899", "#06B6D4", "#EF4444", "#A855F7",
];

export function ChallengeModeScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors, fonts, spacing } = useTheme();
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const character = useGameStore((s) => s.character);

  const completedIds = globalPrestige.completedChallengeIds ?? [];
  const activeChallengeId = character?.activeChallengeId;
  const allChallenges = Object.values(CHALLENGES);
  const completedCount = completedIds.length;
  const totalCount = allChallenges.length;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          title="Challenges"
          subtitle="Complete constraints for rare prestige rewards"
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Progress header */}
          <View style={[styles.progressCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={styles.progressRow}>
              <View>
                <Text style={[styles.progressNum, { color: colors.gold, fontFamily: fonts.displayBold }]}>
                  {completedCount}/{totalCount}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.t3, fontFamily: fonts.body }]}>
                  Challenges completed
                </Text>
              </View>
              <TrophyIcon color={completedCount > 0 ? colors.gold : colors.t4} size={36} />
            </View>
            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.bg2 }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.gold,
                    width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
                  },
                ]}
              />
            </View>
          </View>

          {activeChallengeId && (() => {
            const active = CHALLENGES[activeChallengeId as keyof typeof CHALLENGES];
            if (!active) return null;
            const idx = allChallenges.findIndex((c) => c.id === activeChallengeId);
            return (
              <>
                <SectionLabel label="Active Challenge" />
                <ChallengeCard
                  challenge={active}
                  isActive
                  isCompleted={false}
                  accentColor={ACCENT_PALETTE[idx % ACCENT_PALETTE.length]}
                />
              </>
            );
          })()}

          <SectionLabel label="All Challenges" style={{ marginTop: SPACING.md }} />

          {allChallenges.map((c, idx) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              isActive={activeChallengeId === c.id}
              isCompleted={completedIds.includes(c.id)}
              accentColor={ACCENT_PALETTE[idx % ACCENT_PALETTE.length]}
            />
          ))}

          <View style={{ height: spacing.xxxl ?? 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, spacing, radii }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    safe: { flex: 1 },
    scroll: { padding: spacing.md, gap: spacing.md },
    progressCard: {
      borderRadius: radii.lg,
      borderWidth: 1,
      padding: spacing.md,
      gap: spacing.sm,
    },
    progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    progressNum: { fontSize: 28, lineHeight: 32 },
    progressLabel: { fontSize: 12, marginTop: 2 },
    progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
    progressFill: { height: 6, borderRadius: 3 },
  });

export default ChallengeModeScreen;
