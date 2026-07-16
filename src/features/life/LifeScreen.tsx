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
import { useShallow } from "zustand/react/shallow";
import { RootStackParamList, MainTabParamList } from "@/types";
import { useCharacter } from "@features/character/hooks/useCharacter";
import { useGameStore } from "@store/gameStore";
import {
  selectCharacterAge,
  selectCharacterEventHistory,
  selectCharacterLifeHeader,
  selectCharacterLifeStatus,
  selectCharacterLastYearReview,
  selectCharacterFinanceSummaryInput,
} from "@store/selectors";
import type { FeedItem } from "@features/life/lifeFeed";
import { AvatarByCharacter } from "@components/Avatars";
import DecisionSheet from "@components/DecisionSheet";
import { FocusPhaseSheet } from "@components/FocusPhaseSheet";
import { YearReviewCard } from "@components/YearReviewCard";
import { YearReviewBanner } from "@components/YearReviewBanner";
import { ScreenShell, GlassCard, ConfettiOverlay, StatDeltaChip, ModalPrimaryButton } from "@components/index";
import { ContextualTutorial } from "@shared/components/ContextualTutorial";
import { CharacterNameText } from "@shared/components/CharacterNameText";
import { MiniVitalsStrip } from "@features/life/components/MiniVitalsStrip";
import { ExploreShortcuts } from "@features/life/components/ExploreShortcuts";
import { EmptyLifeLog } from "@features/life/components/EmptyLifeLog";
import { AgeUpButton } from "@features/life/components/AgeUpButton";
import { EpicRevealOverlay } from "@features/life/components/EpicRevealOverlay";
import { LifeFeedListItem } from "@features/life/components/LifeFeedListItem";
import { buildFeedItems, getLifeStageLabel } from "@features/life/lifeFeed";
import { isFocusConfirmedForAge } from "@engine/focusEngine";
import { LifeEventRecord } from "@/types";
import { logEvent } from "@services/analytics";
import { formatCurrency } from "@utils/currency";
import { getFinanceSummary } from "@utils/financeSummary";
import { getEducationLabel } from "@engine/educationEngine";
import { hapticAgeUp } from "@services/haptics";
import { playSound } from "@services/audio";
import { useTheme } from "@theme";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { useScreenA11yFocus } from "@hooks/useScreenA11yFocus";

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
  const characterHeader = useGameStore(useShallow(selectCharacterLifeHeader));
  const characterStatus = useGameStore(useShallow(selectCharacterLifeStatus));
  const eventHistory = useGameStore(selectCharacterEventHistory);
  const characterAge = useGameStore(selectCharacterAge);
  const lastYearReview = useGameStore(selectCharacterLastYearReview);
  const financeInput = useGameStore(useShallow(selectCharacterFinanceSummaryInput));
  const dismissYearReview = useGameStore((s) => s.dismissYearReview);
  const lifePhase = characterStatus?.lifePhase ?? "planning";
  const [isAgeUpCeremony, setIsAgeUpCeremony] = useState(false);
  const [yearReviewOpen, setYearReviewOpen] = useState(false);

  // Phase 5 States
  const [activeDeltas, setActiveDeltas] = useState<Array<{ id: string; name: string; value: number }>>([]);
  const [legendaryEventToShow, setLegendaryEventToShow] = useState<LifeEventRecord | null>(null);
  const [epicRevealEvent, setEpicRevealEvent] = useState<LifeEventRecord | null>(null);
  const prevAchievementsRef = useRef<string[]>(characterStatus?.achievements ?? []);

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
    if (!characterStatus || !characterHeader) return;

    const review = characterStatus.lastYearReview;
    if (review && review.age === characterHeader.age && review.statDeltas) {
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

    const newEvents = eventHistory.filter((e) => e.age === characterHeader.age);
    const legendary = newEvents.find((e) => e.rarity === "legendary");
    if (legendary) {
      setLegendaryEventToShow(legendary);
      setShowConfetti(true);
    } else {
      const epic = newEvents.find((e) => e.rarity === "epic");
      if (epic) setEpicRevealEvent(epic);
    }

    prevAchievementsRef.current = characterStatus.achievements ?? [];
  }, [characterHeader?.age, characterStatus?.achievements, eventHistory, setShowConfetti]);

  const showYearReview = lifePhase === "review" && !!lastYearReview;

  useEffect(() => {
    if (showYearReview) setYearReviewOpen(true);
  }, [showYearReview, lastYearReview?.age]);

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

  const feedItems = useMemo(() => buildFeedItems(eventHistory), [eventHistory]);

  const countryCode = characterHeader?.countryCode ?? "IN";
  const financeSummary = useMemo(
    () => (financeInput ? getFinanceSummary(financeInput) : null),
    [financeInput],
  );
  const bankStr = useMemo(
    () =>
      characterHeader
        ? formatCurrency(characterHeader.bankBalance, countryCode)
        : "",
    [characterHeader?.bankBalance, countryCode],
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
      characterHeader
        ? getEducationLabel(
            characterHeader.educationStage,
            characterHeader.educationLevel,
            characterHeader.enrolledDegreeId,
          )
        : "",
    [
      characterHeader?.educationStage,
      characterHeader?.educationLevel,
      characterHeader?.enrolledDegreeId,
    ],
  );
  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <LifeFeedListItem
        item={item}
        characterAge={characterAge}
        isProcessing={isProcessing}
        horizontalPadding={spacing.lg}
      />
    ),
    [characterAge, isProcessing, spacing.lg],
  );

  if (!characterHeader || !characterStatus) return null;
  const lifeStage = getLifeStageLabel(characterHeader.age);
  const jailed = (characterStatus.criminalRecord?.jailYearsRemaining ?? 0) > 0;
  const jailYears = characterStatus.criminalRecord?.jailYearsRemaining ?? 0;
  const onProbation =
    !jailed && (characterStatus.criminalRecord?.onProbation ?? false);
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
    (characterHeader.age <= 12 || lifePhase === "acting") &&
    lifePhase !== "review" &&
    !pendingDecision &&
    !isProcessing &&
    !isAgeUpCeremony;
  const showFocusSheet =
    lifePhase === "planning" &&
    characterHeader.age >= 13 &&
    !isFocusConfirmedForAge({
      focusConfirmedForAge: characterStatus.focusConfirmedForAge,
      age: characterHeader.age,
    } as Parameters<typeof isFocusConfirmedForAge>[0]);


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
              <AvatarByCharacter character={characterHeader as never} size={48} />
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
              name={characterHeader.name}
              style={[styles.name, { color: colors.t1 }]}
            />
            <View style={styles.jobRow}>
              {characterHeader.job ? (
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
                    {characterHeader.job}
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
                {characterHeader.gender === "male" ? "♂" : "♀"} · {countryCode}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.ageHero}>
          <Text style={[styles.ageHeroNumber, { color: colors.t1, fontFamily: fonts.displayBlack }]}>
            {characterHeader.age}
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
                color: characterHeader.bankBalance >= 0 ? colors.emerald : colors.crimson,
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
        stats={characterHeader.stats}
        onPress={() => navigation.navigate("Stats")}
      />

      <ExploreShortcuts
        onActivities={() => navigation.navigate("Activities")}
        onSocial={() => navigation.navigate("SocialMedia")}
      />

      {showYearReview ? (
        <YearReviewBanner
          review={lastYearReview!}
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
          <Text style={[styles.jailBannerText, { color: colors.textOnInverse, fontFamily: fonts.bodySemiBold }]}>
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
          <Text style={[styles.probationBannerText, { color: colors.textOnInverse, fontFamily: fonts.bodySemiBold }]}>
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
        Born {characterHeader.birthYear}
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
          extraData={`${characterAge}-${isProcessing}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          renderItem={renderFeedItem}
        />
      </ScreenShell>

      <ContextualTutorial screenId="life" />

      <Modal
        visible={yearReviewOpen && !!lastYearReview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setYearReviewOpen(false);
          dismissYearReview();
        }}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.bg }]}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            {lastYearReview ? (
              <YearReviewCard
                review={lastYearReview}
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
        age={characterHeader.age}
        familyBackground={characterStatus.familyBackground}
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
  jailBannerText: { fontSize: 13 },
  probationBanner: {
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  probationBannerText: { fontSize: 13 },
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
