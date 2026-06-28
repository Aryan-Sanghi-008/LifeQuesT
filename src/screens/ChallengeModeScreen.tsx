import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADII, SPACING } from "../constants/theme";
import { useGameStore } from "../store/gameStore";
import { ScreenHeader } from "../components/ScreenHeader";
import { Card, SectionLabel, Divider } from "../components/index";
import { CHALLENGES } from "../engine/challengeEngine";
import Svg, { Circle } from "react-native-svg";

export function ChallengeModeScreen() {
  const globalPrestige = useGameStore((s) => s.globalPrestige);
  const character = useGameStore((s) => s.character);

  const completedIds = globalPrestige.completedChallengeIds ?? [];
  const activeChallengeId = character?.activeChallengeId;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          title="Challenges Catalog"
          subtitle="Complete constraints for rare rewards"
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {activeChallengeId && (
            <>
              <SectionLabel label="Active Challenge" />
              {(() => {
                const active =
                  CHALLENGES[activeChallengeId as keyof typeof CHALLENGES];
                if (!active) return null;
                return (
                  <Card style={[styles.challengeCard, styles.activeCard]}>
                    <View style={styles.headerRow}>
                      <Text style={[styles.title, { color: COLORS.teal }]}>
                        {active.title}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: `${COLORS.teal}15` },
                        ]}
                      >
                        <Text
                          style={[styles.badgeText, { color: COLORS.teal }]}
                        >
                          ACTIVE
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.desc}>{active.description}</Text>
                    <Divider />
                    <Text style={styles.rulesTitle}>Constraints:</Text>
                    {active.rules.map((rule, idx) => (
                      <View key={idx} style={styles.ruleRow}>
                        <Svg
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Circle cx="12" cy="12" r="3" fill={COLORS.teal} />
                        </Svg>
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                    ))}
                    <Divider />
                    <View style={styles.footerRow}>
                      <Text style={styles.rewardLabel}>REWARD</Text>
                      <Text style={styles.rewardValue}>
                        +{active.pointsReward} Prestige Pts
                      </Text>
                    </View>
                  </Card>
                );
              })()}
            </>
          )}

          <SectionLabel
            label="All Challenges"
            style={{ marginTop: SPACING.md }}
          />
          {Object.values(CHALLENGES).map((c) => {
            const isCompleted = completedIds.includes(c.id);
            const isActive = activeChallengeId === c.id;

            return (
              <Card
                key={c.id}
                style={[
                  styles.challengeCard,
                  isCompleted && styles.completedCard,
                ]}
              >
                <View style={styles.headerRow}>
                  <Text
                    style={[styles.title, isCompleted && { color: COLORS.t4 }]}
                  >
                    {c.title}
                  </Text>
                  {isCompleted ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: `${COLORS.gold}15` },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: COLORS.gold }]}>
                        COMPLETED
                      </Text>
                    </View>
                  ) : isActive ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: `${COLORS.teal}15` },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: COLORS.teal }]}>
                        ACTIVE
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.desc}>{c.description}</Text>

                <Divider />

                <Text style={styles.rulesTitle}>Constraints:</Text>
                {c.rules.map((rule, idx) => (
                  <View key={idx} style={styles.ruleRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill={isCompleted ? COLORS.t4 : COLORS.t2}
                      />
                    </Svg>
                    <Text
                      style={[
                        styles.ruleText,
                        isCompleted && { color: COLORS.t4 },
                      ]}
                    >
                      {rule}
                    </Text>
                  </View>
                ))}

                <Divider />

                <View style={styles.footerRow}>
                  <Text
                    style={[
                      styles.rewardLabel,
                      isCompleted && { color: COLORS.t4 },
                    ]}
                  >
                    REWARD
                  </Text>
                  <Text
                    style={[
                      styles.rewardValue,
                      isCompleted && { color: COLORS.t4 },
                    ]}
                  >
                    +{c.pointsReward} Prestige Pts
                  </Text>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { padding: SPACING.md, gap: SPACING.md },
  challengeCard: { padding: SPACING.md, borderColor: COLORS.border },
  activeCard: { borderColor: COLORS.teal, backgroundColor: `${COLORS.teal}04` },
  completedCard: { opacity: 0.65, borderColor: COLORS.border },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  title: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.t1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADII.sm },
  badgeText: { fontFamily: FONTS.bodyBold, fontSize: 9, letterSpacing: 1 },
  desc: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.t3,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  rulesTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.t4,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 3,
  },
  ruleText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t2 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.t4,
    letterSpacing: 1.5,
  },
  rewardValue: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 12,
    color: COLORS.gold3,
  },
});
export default ChallengeModeScreen;
