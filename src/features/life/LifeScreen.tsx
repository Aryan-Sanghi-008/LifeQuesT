import { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList, MainTabParamList } from "@/types";
import { useGameStore } from "@store/gameStore";
import { AvatarByCharacter } from "@components/Avatars";
import EventCard from "@components/EventCard";
import DecisionSheet from "@components/DecisionSheet";
import { FocusPhaseSheet } from "@components/FocusPhaseSheet";
import { YearReviewCard } from "@components/YearReviewCard";
import { YearReviewBanner } from "@components/YearReviewBanner";
import { ScreenShell, GlassCard, ConfettiOverlay, StatDeltaChip } from "@components/index";
import { ACHIEVEMENTS } from "@data/gameData";
import { isFocusConfirmedForAge } from "@engine/focusEngine";
import { LifeEventRecord, CharacterStats } from "@/types";
import { maybeShowInterstitial } from "@services/ads";
import { INTERSTITIAL_EVERY_N_AGEUPS } from "@config/ads";
import { logEvent } from "@services/analytics";
import { formatCurrency } from "@utils/currency";
import { getFinanceSummary } from "@utils/financeSummary";
import { getEducationLabel } from "@engine/educationEngine";
import { hapticAgeUp } from "@services/haptics";
import { isInJail } from "@engine/crimeEngine";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";

// ─── Mini vitals strip (tap for full stats modal) ─────────────────────────────

const MINI_STATS: Array<{ key: keyof CharacterStats; label: string; colorKey: string }> = [
  { key: "health", label: "Health", colorKey: "health" },
  { key: "happiness", label: "Happy", colorKey: "happiness" },
  { key: "wealth", label: "Wealth", colorKey: "wealth" },
];

function MiniVitalsStrip({
  stats,
  onPress,
}: {
  stats: CharacterStats;
  onPress: () => void;
}) {
  const { colors, fonts, spacing, radii } = useTheme();
  const colorMap: Record<string, string> = {
    health: colors.health,
    happiness: colors.happiness,
    wealth: colors.wealth,
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open full stats"
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}
    >
      <GlassCard
        style={{
          flexDirection: "row",
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
        }}
      >
        {MINI_STATS.map((s) => (
          <View key={s.key} style={mini.vital}>
            <Text style={[mini.label, { color: colors.t4, fontFamily: fonts.body }]}>
              {s.label}
            </Text>
            <Text
              style={[
                mini.value,
                { color: colorMap[s.colorKey], fontFamily: fonts.monoSemiBold },
              ]}
            >
              {stats[s.key]}
            </Text>
          </View>
        ))}
        <View style={[mini.more, { borderColor: colors.border, borderRadius: radii.sm }]}>
          <Text style={[mini.moreText, { color: colors.t3, fontFamily: fonts.bodySemiBold }]}>
            All Stats ›
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const mini = StyleSheet.create({
  vital: { flex: 1, alignItems: "center", gap: 2 },
  label: { fontSize: 9, letterSpacing: 0.6, textTransform: "uppercase" },
  value: { fontSize: 16 },
  more: {
    justifyContent: "center",
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    marginLeft: 4,
  },
  moreText: { fontSize: 10 },
});

// ─── Explore shortcuts (non-tab destinations only) ───────────────────────────

function ExploreShortcuts({
  onActivities,
  onSocial,
}: {
  onActivities: () => void;
  onSocial: () => void;
}) {
  const { colors, fonts, spacing, radii } = useTheme();

  const chips = [
    { label: "Activities", onPress: onActivities, color: colors.emerald },
    { label: "Social", onPress: onSocial, color: colors.orchid },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.sm,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.label}
          onPress={chip.onPress}
          style={[
            explore.chip,
            {
              borderColor: `${chip.color}40`,
              backgroundColor: `${chip.color}10`,
              borderRadius: radii.full,
            },
          ]}
        >
          <Text style={[explore.text, { color: chip.color, fontFamily: fonts.bodySemiBold }]}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const explore = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  text: { fontSize: 12 },
});

// ─── Empty Life Log ───────────────────────────────────────────────────────────

function EmptyLifeLog() {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.empty}>
      <Text
        style={[styles.emptyText, { color: colors.t3, fontFamily: fonts.body }]}
      >
        No events recorded yet. Tap Age Up to begin!
      </Text>
    </View>
  );
}

// ─── Age Up Button ────────────────────────────────────────────────────────────

function AgeUpButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  const { colors, fonts, radii } = useTheme();
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0)).current;

  // Hourglass flip animation values
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer sweep
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
          delay: 1000,
        }),
        Animated.timing(shimmer, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.18,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOp, {
            toValue: 0.5,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOp, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [shimmer, pulseScale, pulseOp]);

  useEffect(() => {
    if (loading) {
      const runFlip = () => {
        flipAnim.setValue(0);
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            if (loading) {
              runFlip();
            }
          }, 300);
        });
      };
      runFlip();
    } else {
      flipAnim.setValue(0);
    }
  }, [loading, flipAnim]);

  const shimX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-220, 220],
  });

  const rotateInterpolation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={ageBtn.wrap}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          ageBtn.ring,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOp,
            borderColor: colors.emerald,
            shadowColor: colors.emerald,
            borderRadius: radii.xl || 24,
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
        <Pressable
          onPress={onPress}
          disabled={loading || disabled}
          accessibilityRole="button"
          accessibilityLabel={
            loading
              ? "Age up, loading"
              : disabled
              ? "Confirm focus first"
              : "Age up one year"
          }
          onPressIn={() =>
            Animated.spring(scale, {
              toValue: 0.94,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start()
          }
          android_ripple={{ color: "rgba(255,255,255,0.30)" }}
          style={{ borderRadius: radii.lg || 14, overflow: "hidden" }}
        >
          <LinearGradient
            colors={[colors.emerald, colors.emerald2 || "#16A34A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={ageBtn.btn}
          >
            {/* Shimmer */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: shimX }] },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.28)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={ageBtn.inner}>
              {loading ? (
                <Animated.View
                  style={{ transform: [{ rotate: rotateInterpolation }] }}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      fill="#FFFFFF"
                      d="M6 2h12v6l-4 4 4 4v6H6v-6l4-4-4-4V2zm10 2H8v3.5l4 4 4-4V4zm-4 7.5l-4-4V18h8v-6.5l-4-4z"
                    />
                  </Svg>
                </Animated.View>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path fill="#FFFFFF" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </Svg>
              )}
              <Text
                style={[
                  ageBtn.label,
                  { color: "#FFFFFF", fontFamily: fonts.bodyBold },
                ]}
              >
                {loading ? "LIVING..." : "AGE UP"}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ageBtn = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center", paddingVertical: 8 },
  ring: {
    position: "absolute",
    left: -10,
    right: -10,
    top: 0,
    bottom: 0,
    borderWidth: 2.5,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 0,
  },
  btn: {
    paddingVertical: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 18, letterSpacing: 2 },
});

// ─── Age Section Header ───────────────────────────────────────────────────────

function AgeSectionHeader({ age }: { age: number }) {
  const { colors, fonts } = useTheme();
  const lifeStageColor =
    age < 13
      ? colors.emerald
      : age < 18
      ? colors.sapphire
      : age < 30
      ? colors.catCareer
      : age < 60
      ? colors.gold
      : colors.orchid;

  return (
    <View style={ash.wrap}>
      <View style={[ash.line, { backgroundColor: colors.border }]} />
      <View
        style={[
          ash.badge,
          {
            backgroundColor: `${lifeStageColor}12`,
            borderColor: `${lifeStageColor}30`,
          },
        ]}
      >
        <Text
          style={[
            ash.text,
            { color: lifeStageColor, fontFamily: fonts.bodyBold },
          ]}
        >
          AGE {age}
        </Text>
      </View>
      <View style={[ash.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const ash = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  line: { flex: 1, height: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: { fontSize: 10.5, letterSpacing: 1 },
});

// ─── Helper: Group Event History by Age ──────────────────────────────────────

function groupByAge(events: LifeEventRecord[]) {
  const map = new Map<number, LifeEventRecord[]>();
  events.forEach((e) => {
    const list = map.get(e.age) || [];
    list.push(e);
    map.set(e.age, list);
  });
  // Sort events by timestamp descending, and return ages in descending order
  const sortedAges = Array.from(map.keys()).sort((a, b) => b - a);
  return sortedAges.map((age) => {
    const data = map.get(age) || [];
    data.sort((a, b) => b.timestamp - a.timestamp);
    return { title: String(age), data };
  });
}

// ─── Main Screen Component ────────────────────────────────────────────────────

export function LifeScreen() {
  const { colors, fonts, spacing, radii } = useTheme();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const insets = useSafeAreaInsets();
  const character = useGameStore((s) => s.character);
  const pendingDecision = useGameStore((s) => s.pendingDecision);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const lastAgeUpNotice = useGameStore((s) => s.lastAgeUpNotice);
  const clearAgeUpNotice = useGameStore((s) => s.clearAgeUpNotice);
  const ageUp = useGameStore((s) => s.ageUp);
  const resolveDecision = useGameStore((s) => s.resolveDecision);
  const dismissDecision = useGameStore((s) => s.dismissDecision);
  const dismissYearReview = useGameStore((s) => s.dismissYearReview);
  const pendingAspirationPicker = useGameStore(
    (s) => s.pendingAspirationPicker,
  );
  const lifePhase = character?.lifePhase ?? "planning";

  const [isAgeUpCeremony, setIsAgeUpCeremony] = useState(false);
  const [yearReviewOpen, setYearReviewOpen] = useState(false);
  const showConfetti = useGameStore((s) => s.showConfetti);
  const setShowConfetti = useGameStore((s) => s.setShowConfetti);

  // Phase 5 States
  const [activeDeltas, setActiveDeltas] = useState<Array<{ id: string; name: string; value: number }>>([]);
  const [legendaryEventToShow, setLegendaryEventToShow] = useState<LifeEventRecord | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const prevAchievementsRef = useRef<string[]>(character?.achievements ?? []);

  useEffect(() => {
    if (pendingAspirationPicker) {
      navigation.navigate("AspirationPicker");
    }
  }, [pendingAspirationPicker, navigation]);

  useEffect(() => {
    if (!lastAgeUpNotice) return;
    const timer = setTimeout(() => clearAgeUpNotice(), 5000);
    return () => clearTimeout(timer);
  }, [lastAgeUpNotice, clearAgeUpNotice]);

  useEffect(() => {
    if (!character) return;

    // 1. Detect Stat Deltas on Age Up
    const review = character.lastYearReview;
    if (review && review.age === character.age && review.statDeltas) {
      const deltas = Object.entries(review.statDeltas)
        .filter(([_, val]) => val !== 0)
        .map(([key, val]) => ({
          id: `${key}_${Date.now()}_${Math.random()}`,
          name: key,
          value: val as number,
        }));
      if (deltas.length > 0) {
        setActiveDeltas(deltas);
      }
    }

    // 2. Scan for Legendary Events in the newest age
    const newEvents = character.eventHistory.filter((e) => e.age === character.age);
    const legendary = newEvents.find((e) => e.rarity === "legendary");
    if (legendary) {
      setLegendaryEventToShow(legendary);
    }

    // 3. Detect newly unlocked achievements
    const current = character.achievements ?? [];
    const prev = prevAchievementsRef.current;
    if (current.length > prev.length) {
      const newlyUnlocked = current.filter((id) => !prev.includes(id));
      if (newlyUnlocked.length > 0) {
        setUnlockedAchievement(newlyUnlocked[0]);
      }
    }
    prevAchievementsRef.current = current;
  }, [character?.age, character?.achievements]);

  const showYearReview = lifePhase === "review" && !!character?.lastYearReview;

  useEffect(() => {
    if (showYearReview) setYearReviewOpen(true);
  }, [showYearReview, character?.lastYearReview?.age]);

  const handleAgeUp = useCallback(async () => {
    const wasAlive = useGameStore.getState().character?.isAlive;
    void hapticAgeUp();
    setIsAgeUpCeremony(true);
    setTimeout(async () => {
      ageUp();
      setIsAgeUpCeremony(false);
      const after = useGameStore.getState().character;
      void logEvent("age_up", { age: after?.age ?? 0 });
      if (!after?.isAlive && wasAlive)
        void logEvent("death", { age: after?.deathAge ?? 0 });
      const { ageUpsSinceAd: count, character: c } = useGameStore.getState();
      if (
        c &&
        !c.hasNoAds &&
        !c.isPremium &&
        count > 0 &&
        count % INTERSTITIAL_EVERY_N_AGEUPS === 0
      ) {
        await maybeShowInterstitial();
      }
    }, 1000);
  }, [ageUp]);

  if (!character) return null;

  const sections = groupByAge(character.eventHistory);
  const countryCode = character.countryCode ?? "IN";
  const bankStr = formatCurrency(character.bankBalance, countryCode);
  const finance = getFinanceSummary(character);
  const debtStr =
    finance.totalDebt > 0
      ? formatCurrency(finance.totalDebt, countryCode)
      : null;
  const netWorthStr = formatCurrency(finance.netWorth, countryCode);
  const educationLabel = getEducationLabel(
    character.educationStage,
    character.educationLevel,
  );
  const lifeStage =
    character.age < 13
      ? "Childhood"
      : character.age < 18
      ? "Teenager"
      : character.age < 30
      ? "Young Adult"
      : character.age < 60
      ? "Adult"
      : "Golden Years";
  const jailed = isInJail(character);
  const jailYears = character.criminalRecord?.jailYearsRemaining ?? 0;
  const onProbation =
    !jailed && (character.criminalRecord?.onProbation ?? false);
  const jailBannerText =
    lastAgeUpNotice ??
    (jailed
      ? `Serving time — ${jailYears} year${jailYears === 1 ? "" : "s"} left`
      : null);
  const probationBannerText =
    !lastAgeUpNotice && onProbation
      ? "On probation — career opportunities limited"
      : null;
  const canAgeUp =
    (character.age <= 12 || lifePhase === "acting") &&
    lifePhase !== "review" &&
    !pendingDecision &&
    !isProcessing &&
    !isAgeUpCeremony;
  const showFocusSheet =
    lifePhase === "planning" &&
    character.age >= 13 &&
    !isFocusConfirmedForAge(character);


  const lifeDashboard = (
    <>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.bgCard,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => tabNavigation.navigate("Profile")}
            style={styles.avatarWrap}
          >
            <View style={[styles.avatarRing, { borderColor: colors.gold }]}>
              <AvatarByCharacter character={character} size={48} />
            </View>
            <View
              style={[
                styles.onlineDot,
                {
                  backgroundColor: colors.emerald,
                  borderColor: colors.bgCard,
                },
              ]}
            />
          </Pressable>
          <View style={styles.headerMeta}>
            <Text
              style={[
                styles.name,
                { color: colors.t1, fontFamily: fonts.bodyBold },
              ]}
            >
              {character.name}
            </Text>
            <View style={styles.jobRow}>
              {character.job ? (
                <View
                  style={[
                    styles.jobPill,
                    {
                      borderColor: `${colors.sapphire}30`,
                      backgroundColor: `${colors.sapphire}08`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.jobText,
                      {
                        color: colors.sapphire,
                        fontFamily: fonts.bodySemiBold,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {character.job}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.jobPill,
                    {
                      borderColor: `${colors.t3}30`,
                      backgroundColor: `${colors.t3}08`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.jobText,
                      {
                        color: colors.t3,
                        fontFamily: fonts.bodySemiBold,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {educationLabel}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  styles.flag,
                  { color: colors.t3, fontFamily: fonts.body },
                ]}
              >
                {character.gender === "male" ? "♂" : "♀"} · {countryCode}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.agePill, { borderColor: colors.border }]}>
          <Text
            style={[
              styles.ageValue,
              { color: colors.t1, fontFamily: fonts.monoSemiBold },
            ]}
          >
            Age {character.age}
          </Text>
          <Text
            style={[
              styles.ageLabel,
              { color: colors.t3, fontFamily: fonts.bodyBold },
            ]}
          >
            {lifeStage.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Finances ── */}
      <GlassCard
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginHorizontal: spacing.lg,
          marginTop: spacing.md,
          marginBottom: spacing.sm,
          padding: spacing.md,
        }}
      >
        <View style={styles.finCol}>
          <Text style={[styles.finLabel, { color: colors.t3, fontFamily: fonts.body }]}>
            BANK
          </Text>
          <Text
            style={[
              styles.finVal,
              {
                color: character.bankBalance >= 0 ? colors.emerald : colors.crimson,
                fontFamily: fonts.monoSemiBold,
              },
            ]}
          >
            {bankStr}
          </Text>
        </View>
        <View style={[styles.finDivider, { backgroundColor: colors.border }]} />
        <View style={styles.finCol}>
          <Text style={[styles.finLabel, { color: colors.t3, fontFamily: fonts.body }]}>
            NET WORTH
          </Text>
          <Text style={[styles.finVal, { color: colors.t1, fontFamily: fonts.monoSemiBold }]}>
            {netWorthStr}
          </Text>
        </View>
        {debtStr ? (
          <>
            <View style={[styles.finDivider, { backgroundColor: colors.border }]} />
            <View style={styles.finCol}>
              <Text style={[styles.finLabel, { color: colors.t3, fontFamily: fonts.body }]}>
                DEBT
              </Text>
              <Text style={[styles.finVal, { color: colors.crimson, fontFamily: fonts.monoSemiBold }]}>
                {debtStr}
              </Text>
            </View>
          </>
        ) : null}
      </GlassCard>

      <MiniVitalsStrip
        stats={character.stats}
        onPress={() => navigation.navigate("Stats")}
      />

      <ExploreShortcuts
        onActivities={() => navigation.navigate("Activities")}
        onSocial={() => navigation.navigate("SocialMedia")}
      />

      {showYearReview ? (
        <YearReviewBanner
          review={character.lastYearReview!}
          onPress={() => setYearReviewOpen(true)}
        />
      ) : null}

      {jailBannerText ? (
        <Pressable
          onPress={clearAgeUpNotice}
          style={[
            styles.jailBanner,
            { backgroundColor: colors.crimson, borderRadius: radii.sm },
          ]}
        >
          <Text style={[styles.jailBannerText, { fontFamily: fonts.bodySemiBold }]}>
            {jailBannerText}
          </Text>
        </Pressable>
      ) : probationBannerText ? (
        <View
          style={[
            styles.probationBanner,
            { backgroundColor: colors.gold, borderRadius: radii.sm },
          ]}
        >
          <Text style={[styles.probationBannerText, { fontFamily: fonts.bodySemiBold }]}>
            {probationBannerText}
          </Text>
        </View>
      ) : null}

      {sections.length > 0 ? (
        <Text
          style={[
            styles.logLabel,
            {
              color: colors.t4,
              fontFamily: fonts.bodyBold,
              marginHorizontal: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          LIFE LOG
        </Text>
      ) : null}
    </>
  );

  const stickyFooter = (
    <View
      style={[
        styles.stickyFooter,
        {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <LinearGradient
        colors={[`${colors.bgCard}00`, colors.bgCard]}
        style={styles.footerFade}
        pointerEvents="none"
      />
      <AgeUpButton
        onPress={handleAgeUp}
        loading={isProcessing || isAgeUpCeremony}
        disabled={!canAgeUp}
      />
      <Text style={[styles.footerMeta, { color: colors.t3, fontFamily: fonts.body }]}>
        Born {character.birthYear}
      </Text>
    </View>
  );

  return (
    <>
      <ScreenShell footer={stickyFooter}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.id}_${item.timestamp}`}
          ListHeaderComponent={lifeDashboard}
          ListEmptyComponent={<EmptyLifeLog />}
          renderItem={({ item, section }) => {
            const isNewestAge = item.age === character.age;
            const itemIndexInAge = section.data.indexOf(item);
            return (
              <View style={{ paddingHorizontal: spacing.lg }}>
                <EventCard
                  event={item}
                  isNew={isNewestAge && !isProcessing}
                  staggerIndex={itemIndexInAge}
                />
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <AgeSectionHeader age={Number(section.title)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.md, flexGrow: 1 }}
          stickySectionHeadersEnabled={false}
          style={{ flex: 1 }}
        />
      </ScreenShell>

      <Modal
        visible={yearReviewOpen && !!character.lastYearReview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setYearReviewOpen(false);
          dismissYearReview();
        }}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.bg }]}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            {character.lastYearReview ? (
              <YearReviewCard
                review={character.lastYearReview}
                onDismiss={() => {
                  setYearReviewOpen(false);
                  dismissYearReview();
                }}
              />
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>

      <DecisionSheet
        event={pendingDecision ? pendingDecision.event : null}
        onChoice={resolveDecision}
        onClose={dismissDecision}
      />

      <FocusPhaseSheet
        visible={showFocusSheet}
        age={character.age}
        familyBackground={character.familyBackground}
      />

      <ConfettiOverlay
        active={showConfetti}
        onAnimationEnd={() => setShowConfetti(false)}
      />

      {/* Floating Stat Deltas Container */}
      {activeDeltas.length > 0 && (
        <View style={styles.deltasContainer} pointerEvents="none">
          {activeDeltas.map((delta) => (
            <StatDeltaChip
              key={delta.id}
              statName={delta.name}
              value={delta.value}
              onAnimationComplete={() => {
                setActiveDeltas((prev) => prev.filter((d) => d.id !== delta.id));
              }}
            />
          ))}
        </View>
      )}

      {/* Legendary Event Cinematic Reveal Modal */}
      <Modal
        visible={!!legendaryEventToShow}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLegendaryEventToShow(null)}
      >
        <View style={[styles.legendaryOverlay, { backgroundColor: "rgba(13, 17, 23, 0.96)" }]}>
          <GlassCard style={[styles.legendaryCard, { borderColor: colors.gold, borderWidth: 1.5 }]}>
            <View style={[styles.legendaryBadge, { backgroundColor: `${colors.gold}18` }]}>
              <Text style={[styles.legendaryBadgeText, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
                ⭐ LEGENDARY MOMENT ⭐
              </Text>
            </View>

            <Text style={[styles.legendaryTitle, { color: colors.t1, fontFamily: fonts.displayBlack }]}>
              {legendaryEventToShow?.title}
            </Text>

            <Text style={[styles.legendaryDesc, { color: colors.t2, fontFamily: fonts.displayItal }]}>
              "{legendaryEventToShow?.description}"
            </Text>

            <Pressable
              onPress={() => setLegendaryEventToShow(null)}
              style={[styles.legendaryBtn, { backgroundColor: colors.gold, borderRadius: radii.md }]}
            >
              <Text style={[styles.legendaryBtnText, { color: colors.bg, fontFamily: fonts.bodyBold }]}>
                Embrace Destiny
              </Text>
            </Pressable>
          </GlassCard>
        </View>
      </Modal>

      {/* Achievement Unlocked Interruption Modal */}
      <Modal
        visible={!!unlockedAchievement}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUnlockedAchievement(null)}
      >
        <View style={[styles.achievementOverlay, { backgroundColor: "rgba(0, 0, 0, 0.75)" }]}>
          <View style={[styles.achievementCard, { backgroundColor: colors.bgCard, borderRadius: radii.md, borderColor: colors.border }]}>
            <View style={[styles.achievementIconWrap, { backgroundColor: `${colors.gold}18` }]}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill={colors.gold}>
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
            </View>

            <Text style={[styles.achievementHeader, { color: colors.gold, fontFamily: fonts.bodyBold }]}>
              ACHIEVEMENT UNLOCKED
            </Text>

            {(() => {
              const ach = ACHIEVEMENTS.find(a => a.id === unlockedAchievement);
              if (!ach) return null;
              return (
                <>
                  <Text style={[styles.achievementLabel, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                    {ach.label}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                    {ach.description}
                  </Text>
                </>
              );
            })()}

            <Text style={[styles.achievementRewardText, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
              Reward: 🪙 +50 Coins & 💎 +2 Gems
            </Text>

            <Pressable
              onPress={() => setUnlockedAchievement(null)}
              style={[styles.achievementBtn, { backgroundColor: colors.emerald, borderRadius: radii.md }]}
            >
              <Text style={[styles.achievementBtnText, { color: "#FFFFFF", fontFamily: fonts.bodyBold }]}>
                Awesome!
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrap: { position: "relative" },
  avatarRing: {
    borderRadius: 27,
    borderWidth: 2.5,
    overflow: "hidden",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerMeta: { flex: 1, gap: 5 },
  name: { fontSize: 17 },
  jobRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  jobPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 99,
  },
  jobText: { fontSize: 10 },
  flag: { fontSize: 13 },
  agePill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  ageValue: { fontSize: 15 },
  ageLabel: { fontSize: 8, letterSpacing: 0.5, marginTop: 1 },
  finCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    alignItems: "center",
  },
  finCol: { alignItems: "center", flex: 1 },
  finLabel: { fontSize: 8, letterSpacing: 0.8, marginBottom: 4 },
  finVal: { fontSize: 14 },
  finDivider: {
    width: 1,
    height: 30,
  },
  logLabel: { fontSize: 9, letterSpacing: 1.2 },
  stickyFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    position: "relative",
  },
  footerFade: {
    position: "absolute",
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  modalRoot: { flex: 1 },
  jailBanner: {
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  jailBannerText: { color: "#FFFFFF", fontSize: 13 },
  probationBanner: {
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  probationBannerText: { color: "#FFFFFF", fontSize: 13 },
  empty: { paddingVertical: 32, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  footerMeta: { fontSize: 11, marginTop: 4 },
  deltasContainer: {
    position: "absolute",
    top: 180,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  legendaryOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  legendaryCard: {
    width: "100%",
    padding: 32,
    alignItems: "center",
    gap: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  legendaryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  legendaryBadgeText: {
    fontSize: 12,
    letterSpacing: 2,
  },
  legendaryTitle: {
    fontSize: 26,
    textAlign: "center",
    lineHeight: 34,
  },
  legendaryDesc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  legendaryBtn: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  legendaryBtnText: {
    fontSize: 15,
    letterSpacing: 1.5,
  },
  achievementOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  achievementCard: {
    width: "100%",
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    gap: 14,
  },
  achievementIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementHeader: {
    fontSize: 11,
    letterSpacing: 2,
  },
  achievementLabel: {
    fontSize: 20,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  achievementRewardText: {
    fontSize: 13,
    marginTop: 4,
  },
  achievementBtn: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  achievementBtnText: {
    fontSize: 14,
  },
});
