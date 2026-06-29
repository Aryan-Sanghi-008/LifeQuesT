import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../store/gameStore";
import { COLORS, FONTS, SPACING, RADII, SHADOWS } from '@theme';
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentSeason } from "../engine/liveOpsEngine";
import { computeNetWorth } from "../engine/economyEngine";
import { ScreenHeader } from "../components/ScreenHeader";
import Svg, { Path } from "react-native-svg";

export default function LiveOpsScreen() {
  const character = useGameStore((s) => s.character);
  const season = getCurrentSeason();

  const netWorth = character ? computeNetWorth(character) : 0;
  const age = character ? character.age : 0;

  const challenge = season.challenge;
  const ageComplete = age >= 90;
  const netWorthComplete = netWorth >= 2000000;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.bg, "#0B0F19", COLORS.bg]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="LIVE OPS HUB" />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Season Banner */}
          <LinearGradient
            colors={["#8B5CF6", "#4C1D95"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.seasonBanner}
          >
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonBadgeText}>ACTIVE SEASON</Text>
            </View>
            <Text style={styles.seasonTitle}>{season.title}</Text>
            <Text style={styles.seasonDesc}>{season.description}</Text>
          </LinearGradient>

          {/* Active Modifiers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GLOBAL MODIFIERS</Text>
            <View style={styles.modifierCard}>
              <View style={styles.modifierRow}>
                <View
                  style={[styles.indicator, { backgroundColor: "#F87171" }]}
                />
                <View style={styles.modifierTextWrap}>
                  <Text style={styles.modifierLabel}>
                    Living Expenses: +10%
                  </Text>
                  <Text style={styles.modifierSub}>
                    Annual cost of living is increased due to inflation
                  </Text>
                </View>
              </View>

              <View style={styles.modifierRow}>
                <View
                  style={[styles.indicator, { backgroundColor: "#F87171" }]}
                />
                <View style={styles.modifierTextWrap}>
                  <Text style={styles.modifierLabel}>
                    Maintenance Costs: +15%
                  </Text>
                  <Text style={styles.modifierSub}>
                    Property maintenance fees are elevated
                  </Text>
                </View>
              </View>

              <View style={styles.modifierRow}>
                <View
                  style={[styles.indicator, { backgroundColor: "#34D399" }]}
                />
                <View style={styles.modifierTextWrap}>
                  <Text style={styles.modifierLabel}>
                    Stock Market Returns: +5%
                  </Text>
                  <Text style={styles.modifierSub}>
                    Equity portfolios yield higher returns during market rallies
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Seasonal Challenge */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEASONAL CHALLENGE</Text>
            <LinearGradient
              colors={["#1E293B", "#0F172A"]}
              style={styles.challengeCard}
            >
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>
                    +{challenge.rewardXp} XP
                  </Text>
                </View>
              </View>
              <Text style={styles.challengeDesc}>{challenge.description}</Text>

              {/* Progress Tracker */}
              <View style={styles.trackerContainer}>
                <Text style={styles.trackerHeading}>YOUR PROGRESS</Text>

                {/* Age Criteria */}
                <View style={styles.criteriaRow}>
                  <Text style={styles.criteriaLabel}>
                    Deceased Age {">="} 90
                  </Text>
                  <View style={styles.criteriaStatus}>
                    <Text
                      style={[
                        styles.criteriaValue,
                        ageComplete
                          ? { color: "#34D399" }
                          : { color: "#94A3B8" },
                      ]}
                    >
                      {age} / 90
                    </Text>
                    {ageComplete ? (
                      <Svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          stroke="#34D399"
                          strokeWidth={3}
                          strokeLinecap="round"
                          d="M20 6L9 17l-5-5"
                        />
                      </Svg>
                    ) : (
                      <View style={styles.dot} />
                    )}
                  </View>
                </View>

                {/* Net Worth Criteria */}
                <View style={styles.criteriaRow}>
                  <Text style={styles.criteriaLabel}>
                    Peak Net Worth {">="} $2M
                  </Text>
                  <View style={styles.criteriaStatus}>
                    <Text
                      style={[
                        styles.criteriaValue,
                        netWorthComplete
                          ? { color: "#34D399" }
                          : { color: "#94A3B8" },
                      ]}
                    >
                      ${(netWorth / 1000000).toFixed(2)}M / $2.00M
                    </Text>
                    {netWorthComplete ? (
                      <Svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          stroke="#34D399"
                          strokeWidth={3}
                          strokeLinecap="round"
                          d="M20 6L9 17l-5-5"
                        />
                      </Svg>
                    ) : (
                      <View style={styles.dot} />
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  seasonBanner: {
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "#C084FC",
    ...SHADOWS.card,
  },
  seasonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    marginBottom: SPACING.sm,
  },
  seasonBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 1.0,
  },
  seasonTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
  },
  seasonDesc: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "#E9D5FF",
    lineHeight: 18,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  modifierCard: {
    backgroundColor: "#1E293B",
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "#334155",
    gap: SPACING.md,
  },
  modifierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modifierTextWrap: {
    flex: 1,
  },
  modifierLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: "#F1F5F9",
  },
  modifierSub: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  challengeCard: {
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "#334155",
    ...SHADOWS.card,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: "#F1F5F9",
  },
  rewardBadge: {
    backgroundColor: "#FEF08A",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  rewardText: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 11,
    color: "#713F12",
  },
  challengeDesc: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  trackerContainer: {
    borderTopWidth: 1,
    borderColor: "#334155",
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  trackerHeading: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: "#64748B",
    letterSpacing: 1.0,
    marginBottom: 2,
  },
  criteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  criteriaLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: "#E2E8F0",
  },
  criteriaStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  criteriaValue: {
    fontFamily: FONTS.monoSemiBold,
    fontSize: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
  },
});
