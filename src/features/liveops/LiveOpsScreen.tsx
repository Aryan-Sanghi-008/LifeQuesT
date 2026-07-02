import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "../../store/gameStore";
import { useThemedStyles, useTheme } from '@theme';
import { LinearGradient } from "expo-linear-gradient";
import { getCurrentSeason, formatModifierPercent } from "../../engine/liveOpsEngine";
import { computeNetWorth } from "../../engine/economyEngine";
import { ScreenHeader } from "@components/ScreenHeader";
import Svg, { Path } from "react-native-svg";

export default function LiveOpsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const character = useGameStore((s) => s.character);
  const season = getCurrentSeason();

  const netWorth = character ? computeNetWorth(character) : 0;
  const age = character ? character.age : 0;

  const challenge = season.challenge;
  const challengeComplete = character ? challenge.check(character) : false;
  const ageComplete = character ? character.age >= 90 : false;
  const netWorthComplete = netWorth >= 2000000;
  const expenseLabel = formatModifierPercent(season.activeModifiers.expenseMultiplier);
  const maintenanceLabel = formatModifierPercent(season.activeModifiers.maintenanceMultiplier);
  const stockLabel = formatModifierPercent(1 + season.activeModifiers.stockReturnBonus);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, "#0B0F19", colors.bg]}
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
                    Living Expenses: {expenseLabel}
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
                    Maintenance Costs: {maintenanceLabel}
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
                    Stock Market Returns: {stockLabel}
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
              {challengeComplete ? (
                <Text style={[styles.challengeDesc, { color: '#34D399', marginTop: 4 }]}>
                  Challenge completed — claim your reward in-game!
                </Text>
              ) : null}

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

const createStyles = ({ fonts, spacing, radii, shadows }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  seasonBanner: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#C084FC",
    ...shadows.card,
  },
  seasonBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  seasonBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 1.0,
  },
  seasonTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  seasonDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#E9D5FF",
    lineHeight: 18,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  modifierCard: {
    backgroundColor: "#1E293B",
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#334155",
    gap: spacing.md,
  },
  modifierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: "#F1F5F9",
  },
  modifierSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  challengeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#334155",
    ...shadows.card,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  challengeTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: "#F1F5F9",
  },
  rewardBadge: {
    backgroundColor: "#FEF08A",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  rewardText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: "#713F12",
  },
  challengeDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  trackerContainer: {
    borderTopWidth: 1,
    borderColor: "#334155",
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  trackerHeading: {
    fontFamily: fonts.bodyBold,
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
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: "#E2E8F0",
  },
  criteriaStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  criteriaValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
  },
});
