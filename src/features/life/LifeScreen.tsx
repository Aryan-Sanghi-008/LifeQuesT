import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  InteractionManager,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList, MainTabParamList } from "@/types";
import { useCharacter } from "@features/character/hooks/useCharacter";
import { useGameStore } from "@store/gameStore";
import { AvatarByCharacter } from "@components/Avatars";
import EventCard from "@components/EventCard";
import DecisionSheet from "@components/DecisionSheet";
import { FocusPhaseSheet } from "@components/FocusPhaseSheet";
import { YearReviewCard } from "@components/YearReviewCard";
import { YearReviewBanner } from "@components/YearReviewBanner";
import { ScreenShell, GlassCard, ConfettiOverlay, StatDeltaChip, ScenarioBanner, StatArc } from "@components/index";
import { LifeStageBannerIcon } from "@components/LifeStageBannerIcon";
import { ACHIEVEMENTS, ACHIEVEMENT_COIN_REWARDS } from "@data/gameData";
import { SCENARIOS } from "@data/scenarios";
import { isFocusConfirmedForAge } from "@engine/focusEngine";
import { LifeEventRecord, CharacterStats } from "@/types";
import { maybeShowInterstitial } from "@services/ads";
import { INTERSTITIAL_EVERY_N_AGEUPS } from "@config/ads";
import { logEvent } from "@services/analytics";
import { formatCurrency } from "@utils/currency";
import { getFinanceSummary } from "@utils/financeSummary";
import { getEducationLabel } from "@engine/educationEngine";
import { hapticAgeUp } from "@services/haptics";
import { playSound } from "@services/audio";
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
          alignItems: 'center',
        }}
      >
        {MINI_STATS.map((s) => (
          <View key={s.key} style={mini.vital}>
            <StatArc
              value={stats[s.key] as number}
              color={colorMap[s.colorKey]}
              label={s.label}
              size={60}
              strokeWidth={5}
            />
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
  vital: { flex: 1, alignItems: "center" },
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

const LIFE_STAGE_CONFIG: Array<{
  maxAge: number;
  label: string;
  emoji: string;
  gradient: readonly [string, string];
}> = [
  { maxAge: 12,  label: 'Childhood',   emoji: '🧒', gradient: ['#10B981', '#34D399'] },
  { maxAge: 17,  label: 'Teenager',    emoji: '🎒', gradient: ['#3B82F6', '#60A5FA'] },
  { maxAge: 29,  label: 'Young Adult', emoji: '🚀', gradient: ['#F59E0B', '#FBBF24'] },
  { maxAge: 59,  label: 'Adult',       emoji: '💼', gradient: ['#8B5CF6', '#A78BFA'] },
  { maxAge: 999, label: 'Golden Years',emoji: '🌟', gradient: ['#EC4899', '#F472B6'] },
];

function getLifeStageConfig(age: number) {
  return LIFE_STAGE_CONFIG.find((s) => age <= s.maxAge) ?? LIFE_STAGE_CONFIG[LIFE_STAGE_CONFIG.length - 1];
}

function AgeSectionHeader({ age, character: _char }: { age: number; character?: import('@/types').Character }) {
  const { fonts, radii, spacing } = useTheme();
  const config = getLifeStageConfig(age);

  return (
    <LinearGradient
      colors={[`${config.gradient[0]}28`, `${config.gradient[1]}10`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[ash.banner, { borderRadius: radii.sm, marginHorizontal: spacing.lg }]}
    >
      <LifeStageBannerIcon age={age} color={config.gradient[0]} size={44} />
      <View>
        <Text style={[ash.ageText, { color: config.gradient[0], fontFamily: fonts.displayBlack }]}>
          AGE {age}
        </Text>
        <Text style={[ash.stageText, { color: config.gradient[0], fontFamily: fonts.body, opacity: 0.7 }]}>
          {config.label}
        </Text>
      </View>
    </LinearGradient>
  );
}

const ash = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  emoji: { fontSize: 20 },
  ageText: { fontSize: 14, letterSpacing: 0.5 },
  stageText: { fontSize: 11, letterSpacing: 0.3, marginTop: 1 },
});

// ─── Helper: Build flat FlashList items from event history ───────────────────

type FeedItem =
  | { kind: 'header'; age: number; key: string }
  | { kind: 'event'; event: LifeEventRecord; staggerIndex: number; key: string };

function buildFeedItems(events: LifeEventRecord[]): FeedItem[] {
  const map = new Map<number, LifeEventRecord[]>();
  events.forEach((e) => {
    const list = map.get(e.age) || [];
    list.push(e);
    map.set(e.age, list);
  });
  const sortedAges = Array.from(map.keys()).sort((a, b) => b - a);
  const items: FeedItem[] = [];
  sortedAges.forEach((age) => {
    const ageEvents = (map.get(age) || []).slice().sort((a, b) => b.timestamp - a.timestamp);
    items.push({ kind: 'header', age, key: `header_${age}` });
    ageEvents.forEach((evt, idx) => {
      items.push({ kind: 'event', event: evt, staggerIndex: idx, key: `evt_${evt.id}_${evt.timestamp}` });
    });
  });
  return items;
}

// ─── Epic Event Dramatic Reveal (auto-dismiss, smaller than legendary) ────────

function EpicRevealOverlay({ event, onDismiss }: { event: LifeEventRecord; onDismiss: () => void }) {
  const { colors, fonts, radii } = useTheme();
  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(onDismiss);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        epicRevealStyles.container,
        { transform: [{ translateY: slideY }], opacity },
      ]}
    >
      <View style={[epicRevealStyles.card, { backgroundColor: `${event.color ?? colors.orchid}EE`, borderRadius: radii.lg }]}>
        <Text style={[epicRevealStyles.label, { color: '#FFFFFF', fontFamily: fonts.bodyBold }]}>
          ✨ EPIC MOMENT
        </Text>
        <Text style={[epicRevealStyles.title, { color: '#FFFFFF', fontFamily: fonts.displayBlack }]} numberOfLines={2}>
          {event.title}
        </Text>
      </View>
    </Animated.View>
  );
}

const epicRevealStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    zIndex: 900,
    alignItems: 'center',
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  label: { fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 18, textAlign: 'center' },
});

// ─── Main Screen Component ────────────────────────────────────────────────────

export function LifeScreen() {
  const { colors, fonts, spacing, radii } = useTheme();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const insets = useSafeAreaInsets();
  const {
    character,
    pendingDecision,
    isProcessing,
    lastAgeUpNotice,
    clearAgeUpNotice,
    ageUp,
    resolveDecision,
    dismissDecision,
    showConfetti,
    setShowConfetti,
    pendingAspirationPicker,
  } = useCharacter();
  const dismissYearReview = useGameStore((s) => s.dismissYearReview);
  const lifePhase = character?.lifePhase ?? "planning";
  const [isAgeUpCeremony, setIsAgeUpCeremony] = useState(false);
  const [yearReviewOpen, setYearReviewOpen] = useState(false);

  // Phase 5 States
  const [activeDeltas, setActiveDeltas] = useState<Array<{ id: string; name: string; value: number }>>([]);
  const [legendaryEventToShow, setLegendaryEventToShow] = useState<LifeEventRecord | null>(null);
  const [epicRevealEvent, setEpicRevealEvent] = useState<LifeEventRecord | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const prevAchievementsRef = useRef<string[]>(character?.achievements ?? []);

  // Animated values for legendary modal entrance
  const legendaryScale = useRef(new Animated.Value(0.85)).current;
  const legendaryOpacity = useRef(new Animated.Value(0)).current;

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

    // 2. Scan for Legendary / Epic Events in the newest age
    const newEvents = character.eventHistory.filter((e) => e.age === character.age);
    const legendary = newEvents.find((e) => e.rarity === "legendary");
    if (legendary) {
      setLegendaryEventToShow(legendary);
      // Confetti for legendary moments
      setShowConfetti(true);
    } else {
      const epic = newEvents.find((e) => e.rarity === "epic");
      if (epic) setEpicRevealEvent(epic);
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

  const handleAgeUp = useCallback(() => {
    const wasAlive = useGameStore.getState().character?.isAlive;
    void hapticAgeUp();
    setIsAgeUpCeremony(true);
    InteractionManager.runAfterInteractions(async () => {
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
    });
  }, [ageUp]);

  if (!character) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const feedItems = useMemo(
    () => buildFeedItems(character.eventHistory),
    [character.eventHistory],
  );
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
        <View style={styles.ageHero}>
          <Text style={[styles.ageHeroNumber, { color: colors.t1, fontFamily: fonts.displayBlack }]}>
            {character.age}
          </Text>
          <Text style={[styles.ageHeroLabel, { color: colors.t3, fontFamily: fonts.body }]}>
            {lifeStage}
          </Text>
        </View>
      </View>

      {(() => {
        const scenarioData = SCENARIOS.find(s => s.id === (character.scenarioId ?? 'classic')) ?? SCENARIOS[0];
        return (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <ScenarioBanner
              type={scenarioData.bannerType}
              scenarioName={scenarioData.name}
              description={scenarioData.tagline}
            />
          </View>
        );
      })()}

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

      {feedItems.length > 0 ? (
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
        <FlashList
          data={feedItems}
          keyExtractor={(item) => item.key}
          ListHeaderComponent={lifeDashboard}
          ListEmptyComponent={<EmptyLifeLog />}
          getItemType={(item) => item.kind}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          renderItem={({ item }) => {
            if (item.kind === 'header') {
              return <AgeSectionHeader age={item.age} character={character} />;
            }
            const isNewestAge = item.event.age === character.age;
            return (
              <View style={{ paddingHorizontal: spacing.lg }}>
                <EventCard
                  event={item.event}
                  isNew={isNewestAge && !isProcessing}
                  staggerIndex={item.staggerIndex}
                  activeScenarioId={character.scenarioId}
                />
              </View>
            );
          }}
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

      {/* Floating Scenario Badge (hidden for classic) */}
      {character.scenarioId && character.scenarioId !== 'classic' && (() => {
        const s = SCENARIOS.find(sc => sc.id === character.scenarioId);
        if (!s) return null;
        return (
          <View
            pointerEvents="none"
            style={[styles.scenarioBadge, { backgroundColor: `${s.accentColor}EE`, borderRadius: 20 }]}
          >
            <Text style={[styles.scenarioBadgeText, { color: '#FFFFFF', fontFamily: fonts.bodyBold }]}>
              {s.name}
            </Text>
          </View>
        );
      })()}

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
        animationType="none"
        onRequestClose={() => setLegendaryEventToShow(null)}
        onShow={() => {
          legendaryScale.setValue(0.85);
          legendaryOpacity.setValue(0);
          Animated.parallel([
            Animated.spring(legendaryScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
            Animated.timing(legendaryOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
          ]).start();
          void playSound('achievement_unlock');
        }}
      >
        <View style={[styles.legendaryOverlay, { backgroundColor: "rgba(13, 17, 23, 0.96)" }]}>
          <Animated.View style={{ transform: [{ scale: legendaryScale }], opacity: legendaryOpacity }}>
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
          </Animated.View>
        </View>
      </Modal>

      {/* Epic Event Dramatic Inline Reveal (auto-dismiss 2.5s) */}
      {epicRevealEvent && (
        <EpicRevealOverlay
          event={epicRevealEvent}
          onDismiss={() => setEpicRevealEvent(null)}
        />
      )}

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
              const coins = ACHIEVEMENT_COIN_REWARDS[ach.id] ?? 50;
              return (
                <>
                  <Text style={[styles.achievementLabel, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
                    {ach.label}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                    {ach.description}
                  </Text>
                  <Text style={[styles.achievementRewardText, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
                    Reward: 🪙 +{coins} Coins & 💎 +2 Gems
                  </Text>
                </>
              );
            })()}

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
  ageHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  ageHeroNumber: { fontSize: 38, lineHeight: 40 },
  ageHeroLabel: { fontSize: 10, letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' },
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
  scenarioBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    zIndex: 500,
  },
  scenarioBadgeText: { fontSize: 11, letterSpacing: 0.5 },
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
