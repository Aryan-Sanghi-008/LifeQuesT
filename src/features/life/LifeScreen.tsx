import { useRef, useEffect, useCallback, useState, useMemo, memo } from "react";
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
import { ScreenShell, GlassCard, ConfettiOverlay, StatDeltaChip, ModalPrimaryButton } from "@components/index";
import { ContextualTutorial } from "@shared/components/ContextualTutorial";
import { CharacterNameText } from "@shared/components/CharacterNameText";
import { LifeStageBannerIcon } from "@components/LifeStageBannerIcon";
import { isFocusConfirmedForAge } from "@engine/focusEngine";
import { LifeEventRecord, CharacterStats } from "@/types";
import { logEvent } from "@services/analytics";
import { formatCurrency } from "@utils/currency";
import { getFinanceSummary } from "@utils/financeSummary";
import { getEducationLabel } from "@engine/educationEngine";
import { hapticAgeUp } from "@services/haptics";
import { playSound } from "@services/audio";
import { isInJail } from "@engine/crimeEngine";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { useScreenA11yFocus } from "@hooks/useScreenA11yFocus";

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
  const { colors, fonts, spacing } = useTheme();
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
          alignItems: "center",
        }}
      >
        {MINI_STATS.map((s, i) => {
          const val = stats[s.key] as number;
          const col = colorMap[s.colorKey];
          return (
            <View
              key={s.key}
              style={[
                mini.vital,
                i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
              ]}
            >
              <Text style={[mini.statNum, { color: col, fontFamily: fonts.monoSemiBold }]}>
                {Math.round(val)}
              </Text>
              <Text style={[mini.statLabel, { color: colors.t4, fontFamily: fonts.body }]}>
                {s.label}
              </Text>
            </View>
          );
        })}
        <View style={[mini.more, { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border }]}>
          <Text style={[mini.moreText, { color: colors.t3, fontFamily: fonts.bodySemiBold }]}>
            More ›
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const mini = StyleSheet.create({
  vital: { flex: 1, alignItems: "center", paddingVertical: 4, gap: 2 },
  statNum: { fontSize: 16 },
  statLabel: { fontSize: 10, letterSpacing: 0.3 },
  more: { paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
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
  const { colors, fonts, radii, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();
  const shimmer = useRef(new Animated.Value(-1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0)).current;

  // Hourglass flip animation values
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
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
  }, [shimmer, pulseScale, pulseOp, reducedMotion]);

  useEffect(() => {
    if (loading && !reducedMotion) {
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
  }, [loading, flipAnim, reducedMotion]);

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
          onPressIn={() => {
            if (reducedMotion) return;
            Animated.spring(scale, {
              toValue: 0.94,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start();
          }}
          onPressOut={() => {
            if (reducedMotion) return;
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              damping: 15,
              stiffness: 200,
            }).start();
          }}
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
                  { color: "#FFFFFF", fontFamily: fonts.bodyBold, fontSize: scaledFonts.lg },
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

// isStageTransition: true when this age is the first in a new life stage
function AgeSectionHeader({
  age,
  isStageTransition,
}: {
  age: number;
  isStageTransition: boolean;
  character?: import('@/types').Character;
}) {
  const { colors, fonts, radii, spacing } = useTheme();
  const config = getLifeStageConfig(age);

  if (isStageTransition) {
    return (
      <LinearGradient
        colors={[`${config.gradient[0]}28`, `${config.gradient[1]}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[ash.banner, { borderRadius: radii.sm, marginHorizontal: spacing.lg }]}
      >
        <LifeStageBannerIcon age={age} color={config.gradient[0]} size={40} />
        <View>
          <Text style={[ash.stageLabel, { color: config.gradient[0], fontFamily: fonts.bodyBold }]}>
            {config.label.toUpperCase()}
          </Text>
          <Text style={[ash.ageText, { color: config.gradient[0], fontFamily: fonts.displayBlack }]}>
            AGE {age}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Subtle year separator — just a line + small label
  return (
    <View style={[ash.yearRow, { marginHorizontal: spacing.lg }]}>
      <View style={[ash.yearLine, { backgroundColor: colors.border }]} />
      <Text style={[ash.yearLabel, { color: colors.t4, fontFamily: fonts.monoSemiBold }]}>
        AGE {age}
      </Text>
      <View style={[ash.yearLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

const ash = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 8,
  },
  stageLabel: { fontSize: 9, letterSpacing: 1, opacity: 0.75 },
  ageText: { fontSize: 15, letterSpacing: 0.5 },
  stageText: { fontSize: 11, letterSpacing: 0.3, marginTop: 1 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  yearLine: { flex: 1, height: StyleSheet.hairlineWidth },
  yearLabel: { fontSize: 10, letterSpacing: 0.8 },
});

// ─── Helper: Build flat FlashList items from event history ───────────────────

type FeedItem =
  | { kind: 'header'; age: number; isStageTransition: boolean; key: string }
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
  let prevStageLabel: string | null = null;
  sortedAges.forEach((age) => {
    const ageEvents = (map.get(age) || []).slice().sort((a, b) => b.timestamp - a.timestamp);
    const stageLabel = getLifeStageConfig(age).label;
    const isStageTransition = stageLabel !== prevStageLabel;
    prevStageLabel = stageLabel;
    items.push({ kind: 'header', age, isStageTransition, key: `header_${age}` });
    ageEvents.forEach((evt, idx) => {
      items.push({ kind: 'event', event: evt, staggerIndex: idx, key: `evt_${age}_${idx}_${evt.id}` });
    });
  });
  return items;
}

type FeedListItemProps = {
  item: FeedItem;
  characterAge: number;
  isProcessing: boolean;
  horizontalPadding: number;
};

const FeedListItem = memo(function FeedListItem({
  item,
  characterAge,
  isProcessing,
  horizontalPadding,
}: FeedListItemProps) {
  if (item.kind === "header") {
    return (
      <AgeSectionHeader
        age={item.age}
        isStageTransition={item.isStageTransition}
      />
    );
  }
  const isNewestAge = item.event.age === characterAge;
  return (
    <View style={{ paddingHorizontal: horizontalPadding }}>
      <EventCard
        event={item.event}
        isNew={isNewestAge && !isProcessing}
        staggerIndex={item.staggerIndex}
      />
    </View>
  );
});

// ─── Epic Event Dramatic Reveal (auto-dismiss, smaller than legendary) ────────

function EpicRevealOverlay({ event, onDismiss }: { event: LifeEventRecord; onDismiss: () => void }) {
  const { colors, fonts, radii, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();
  const slideY = useRef(new Animated.Value(reducedMotion ? 0 : 60)).current;
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(onDismiss, 2500);
      return () => clearTimeout(timer);
    }
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(onDismiss);
    }, 2500);
    return () => clearTimeout(timer);
  }, [reducedMotion, onDismiss, slideY, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        epicRevealStyles.container,
        { transform: [{ translateY: slideY }], opacity },
      ]}
    >
      <View style={[epicRevealStyles.card, { backgroundColor: `${event.color ?? colors.orchid}EE`, borderRadius: radii.lg }]}>
        <Text style={[epicRevealStyles.label, { color: '#FFFFFF', fontFamily: fonts.bodyBold, fontSize: scaledFonts.sm }]}>
          ✨ EPIC MOMENT
        </Text>
        <Text style={[epicRevealStyles.title, { color: '#FFFFFF', fontFamily: fonts.displayBlack, fontSize: scaledFonts.lg }]} numberOfLines={2}>
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
  const { colors, fonts, spacing, radii, scaledFonts } = useTheme();
  const reducedMotion = useReducedMotion();

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
  const prevAchievementsRef = useRef<string[]>(character?.achievements ?? []);

  // Animated values for legendary modal entrance
  const legendaryScale = useRef(new Animated.Value(0.85)).current;
  const legendaryOpacity = useRef(new Animated.Value(0)).current;
  const headingRef = useRef<View>(null);
  useScreenA11yFocus(headingRef);

  useEffect(() => {
    if (pendingAspirationPicker) {
      navigation.navigate("AspirationPicker");
    }
  }, [pendingAspirationPicker, navigation]);

  const pendingCollegeMajorPicker = useGameStore((s) => s.pendingCollegeMajorPicker);
  useEffect(() => {
    if (pendingCollegeMajorPicker) {
      navigation.navigate("CollegeMajorPicker");
    }
  }, [pendingCollegeMajorPicker, navigation]);

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

    // Achievement unlocks are handled globally via store queue (_checkAchievements).
    prevAchievementsRef.current = character.achievements ?? [];
  }, [character?.age, character?.achievements]);

  const showYearReview = lifePhase === "review" && !!character?.lastYearReview;

  useEffect(() => {
    if (showYearReview) setYearReviewOpen(true);
  }, [showYearReview, character?.lastYearReview?.age]);

  const handleAgeUp = useCallback(() => {
    const wasAlive = useGameStore.getState().character?.isAlive;
    void hapticAgeUp();
    setIsAgeUpCeremony(true);
    InteractionManager.runAfterInteractions(() => {
      void ageUp();
      const after = useGameStore.getState().character;
      void logEvent("age_up", { age: after?.age ?? 0 });
      if (!after?.isAlive && wasAlive)
        void logEvent("death", { age: after?.deathAge ?? 0 });
    });
  }, [ageUp]);

  useEffect(() => {
    if (isAgeUpCeremony && !isProcessing) {
      setIsAgeUpCeremony(false);
    }
  }, [isAgeUpCeremony, isProcessing]);

  const feedItems = useMemo(
    () => buildFeedItems(character?.eventHistory ?? []),
    [character?.eventHistory],
  );

  const countryCode = character?.countryCode ?? "IN";
  const financeSummary = useMemo(
    () => (character ? getFinanceSummary(character) : null),
    [character],
  );
  const bankStr = useMemo(
    () => (character ? formatCurrency(character.bankBalance, countryCode) : ""),
    [character?.bankBalance, countryCode],
  );
  const debtStr = useMemo(() => {
    if (!financeSummary || financeSummary.totalDebt <= 0) return null;
    return formatCurrency(financeSummary.totalDebt, countryCode);
  }, [financeSummary, countryCode]);
  const netWorthStr = useMemo(
    () =>
      financeSummary
        ? formatCurrency(financeSummary.netWorth, countryCode)
        : "",
    [financeSummary, countryCode],
  );
  const educationLabel = useMemo(
    () =>
      character
        ? getEducationLabel(
            character.educationStage,
            character.educationLevel,
            character.enrolledDegreeId,
          )
        : "",
    [
      character?.educationStage,
      character?.educationLevel,
      character?.enrolledDegreeId,
    ],
  );
  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedListItem
        item={item}
        characterAge={character?.age ?? 0}
        isProcessing={isProcessing}
        horizontalPadding={spacing.lg}
      />
    ),
    [character?.age, isProcessing, spacing.lg],
  );

  if (!character) return null;
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
            accessibilityRole="button"
            accessibilityLabel="Open profile"
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
          <View style={styles.headerMeta} ref={headingRef} accessible accessibilityRole="header">
            <CharacterNameText
              name={character.name}
              style={[
                styles.name,
                { color: colors.t1, fontFamily: fonts.bodyBold },
              ]}
            />
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
          drawDistance={400}
          extraData={`${character.age}-${isProcessing}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          renderItem={renderFeedItem}
        />
      </ScreenShell>

      <ContextualTutorial screenId="life" />

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
        animationType="none"
        onRequestClose={() => setLegendaryEventToShow(null)}
        onShow={() => {
          if (reducedMotion) {
            legendaryScale.setValue(1);
            legendaryOpacity.setValue(1);
          } else {
            legendaryScale.setValue(0.85);
            legendaryOpacity.setValue(0);
            Animated.parallel([
              Animated.spring(legendaryScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
              Animated.timing(legendaryOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
            ]).start();
          }
          void playSound('achievement_unlock');
        }}
      >
        <View style={[styles.legendaryOverlay, { backgroundColor: colors.overlayScrim }]}>
          <Animated.View style={{ transform: [{ scale: legendaryScale }], opacity: legendaryOpacity }}>
          <GlassCard style={[styles.legendaryCard, { backgroundColor: colors.bgCard, borderColor: colors.gold, borderWidth: 1.5 }]}>
            <View style={[styles.legendaryBadge, { backgroundColor: `${colors.gold}18` }]}>
              <Text style={[styles.legendaryBadgeText, { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: scaledFonts.sm }]}>
                ⭐ LEGENDARY MOMENT ⭐
              </Text>
            </View>

            <Text style={[styles.legendaryTitle, { color: colors.t1, fontFamily: fonts.displayBlack, fontSize: scaledFonts.xxl }]}>
              {legendaryEventToShow?.title}
            </Text>

            <Text style={[styles.legendaryDesc, { color: colors.t2, fontFamily: fonts.displayItal, fontSize: scaledFonts.base }]}>
              "{legendaryEventToShow?.description}"
            </Text>

            <ModalPrimaryButton
              label="Embrace Destiny"
              onPress={() => setLegendaryEventToShow(null)}
              fullWidth
              accessibilityLabel="Embrace Destiny"
            />
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
});
