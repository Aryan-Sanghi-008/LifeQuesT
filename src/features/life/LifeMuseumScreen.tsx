import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles, useTheme, FONTS, RADII } from '@theme';
import { useGameStore } from "../../store/gameStore";
import { ScreenHeader } from "@components/ScreenHeader";
import { Card, SectionLabel } from "@components/index";
import { ACHIEVEMENTS } from "../../data/gameData";
import { calculateDynastyScore } from "../../engine/legacyEngine";
import Svg, { Path, Circle } from "react-native-svg";

export function LifeMuseumScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore((s) => s.character);
  const [activeTab, setActiveTab] = useState<"relics" | "decisions">("relics");

  if (!character) return null;

  const currentGen = character.generation ?? 1;
  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character);
  const achievements = character.achievements ?? [];
  const completedCount = achievements.length;

  // Filter event history for events where a decision choice was recorded
  const decisionTimeline = (character.eventHistory ?? [])
    .filter((e) => e.choiceMade !== undefined)
    .sort((a, b) => b.age - a.age);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Family Museum" subtitle="Generational collectibles & chronicles" />

        {/* Tab Selector */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setActiveTab("relics")}
            style={[
              styles.tab,
              activeTab === "relics" && [styles.activeTab, { borderBottomColor: colors.gold }],
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "relics" ? colors.gold : colors.t3,
                  fontFamily: activeTab === "relics" ? FONTS.bodyBold : FONTS.body,
                },
              ]}
            >
              Relics & Trophies
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("decisions")}
            style={[
              styles.tab,
              activeTab === "decisions" && [styles.activeTab, { borderBottomColor: colors.gold }],
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === "decisions" ? colors.gold : colors.t3,
                  fontFamily: activeTab === "decisions" ? FONTS.bodyBold : FONTS.body,
                },
              ]}
            >
              Decision History
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === "relics" ? (
            <>
              {/* ── Dynasty Summary ── */}
              <Card style={styles.summaryCard}>
                <Text style={styles.dynastyTitle}>DYNASTY RATING</Text>
                <Text style={styles.dynastyScore}>{dynastyScore.toLocaleString()}</Text>
                <View style={styles.row}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>GENERATIONS</Text>
                    <Text style={styles.metricValue}>{currentGen}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>TROPHIES</Text>
                    <Text style={styles.metricValue}>{completedCount}</Text>
                  </View>
                </View>
              </Card>

              {/* ── Trophies Earned ── */}
              <SectionLabel label="Trophy Room" />
              {completedCount === 0 ? (
                <Card style={styles.emptyCard}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path stroke={colors.t4} strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </Svg>
                  <Text style={styles.emptyText}>Trophy Room is currently empty. Complete in-game achievements to unlock rare relics!</Text>
                </Card>
              ) : (
                <View style={styles.grid}>
                  {achievements.map((id) => {
                    const ach = ACHIEVEMENTS.find((a) => a.id === id);
                    if (!ach) return null;
                    return (
                      <Card key={id} style={[styles.trophyCard, { borderColor: `${ach.color}40` }]}>
                        <View style={[styles.trophyIconWrap, { backgroundColor: `${ach.color}15` }]}>
                          <Svg width={24} height={24} viewBox="0 0 24 24" fill={ach.color}>
                            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </Svg>
                        </View>
                        <Text style={styles.trophyLabel}>{ach.label}</Text>
                        <Text style={styles.trophyDesc}>{ach.description}</Text>
                      </Card>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <>
              {/* ── Decisions History Timeline ── */}
              <SectionLabel label="Chronicles of Choice" />
              {decisionTimeline.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={colors.t4} strokeWidth={2} />
                    <Path d="M12 6v6l4 2" stroke={colors.t4} strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.emptyText}>No major decisions made yet. As you make choices on random life events, your history will fill this museum corridor!</Text>
                </Card>
              ) : (
                <View style={styles.timeline}>
                  {decisionTimeline.map((item, idx) => {
                    const sign = item.color ?? colors.gold;
                    return (
                      <View key={idx} style={styles.timelineItem}>
                        <View style={styles.timelineLine} />
                        <View style={[styles.timelineDot, { backgroundColor: sign }]} />
                        <Card style={styles.decisionCard}>
                          <View style={styles.decisionHeader}>
                            <Text style={[styles.decisionTitle, { fontFamily: FONTS.bodyBold, color: colors.t1 }]}>
                              {item.title}
                            </Text>
                            <View style={[styles.ageBadge, { backgroundColor: `${sign}15` }]}>
                              <Text style={[styles.ageBadgeText, { color: sign, fontFamily: FONTS.monoSemiBold }]}>
                                AGE {item.age}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.decisionDesc, { fontFamily: FONTS.body, color: colors.t2 }]}>
                            {item.description}
                          </Text>
                          <View style={[styles.choiceContainer, { backgroundColor: colors.bg2, borderRadius: RADII.sm }]}>
                            <Text style={[styles.choiceLabelText, { fontFamily: FONTS.bodyBold, color: colors.gold }]}>
                              YOUR PATH:
                            </Text>
                            <Text style={[styles.choiceValueText, { fontFamily: FONTS.bodySemiBold, color: colors.t1 }]}>
                              "{item.choiceMade}"
                            </Text>
                          </View>
                        </Card>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  tabBar: { flexDirection: "row", borderWidth: 0, borderBottomWidth: 1.5, paddingHorizontal: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeTab: { borderBottomWidth: 3 },
  tabText: { fontSize: 13, letterSpacing: 0.5 },
  scroll: { padding: spacing.md, gap: spacing.md },
  summaryCard: { padding: spacing.xl, alignItems: "center", backgroundColor: `${colors.gold}08`, borderColor: `${colors.gold}25` },
  dynastyTitle: { fontFamily: fonts.body, fontSize: 11, color: colors.gold, letterSpacing: 2 },
  dynastyScore: { fontFamily: fonts.displayBlack, fontSize: 44, color: colors.gold, marginVertical: spacing.xs },
  row: { flexDirection: "row", width: "100%", justifyContent: "center", gap: spacing.xl, marginTop: spacing.sm },
  metric: { alignItems: "center" },
  metricLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.t4, letterSpacing: 1 },
  metricValue: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.t1, marginTop: 2 },
  metricDivider: { width: 1, height: 28, backgroundColor: colors.border, alignSelf: "center" },
  emptyCard: { padding: spacing.xl, alignItems: "center", gap: spacing.md, borderStyle: "dashed", borderWidth: 1.5, borderColor: colors.border },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.t3, textAlign: "center", lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  trophyCard: { width: "47%", padding: spacing.md, alignItems: "center", gap: spacing.xs },
  trophyIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  trophyLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.t1, textAlign: "center" },
  trophyDesc: { fontFamily: fonts.body, fontSize: 11, color: colors.t4, textAlign: "center", lineHeight: 15 },
  timeline: { paddingLeft: spacing.sm, gap: 12 },
  timelineItem: { flexDirection: "row", position: "relative", paddingLeft: 24 },
  timelineLine: { position: "absolute", left: 6, top: 12, bottom: -24, width: 2, backgroundColor: colors.border },
  timelineDot: { position: "absolute", left: 2, top: 14, width: 10, height: 10, borderRadius: 5, zIndex: 2 },
  decisionCard: { flex: 1, padding: spacing.md, gap: 6 },
  decisionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  decisionTitle: { fontSize: 13, flex: 1 },
  decisionDesc: { fontSize: 12, lineHeight: 17 },
  ageBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.xs },
  ageBadgeText: { fontSize: 9 },
  choiceContainer: { padding: spacing.xs, paddingHorizontal: spacing.sm, flexDirection: "row", gap: 6, alignItems: "center" },
  choiceLabelText: { fontSize: 9, letterSpacing: 0.5 },
  choiceValueText: { fontSize: 11, flex: 1 },
});

export default LifeMuseumScreen;
