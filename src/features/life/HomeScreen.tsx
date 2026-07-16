import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useToastStore } from "@store/toastStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@theme";
import { useBreakpoints } from "@hooks/useBreakpoints";
import { GlassCard, ScreenShell, Card, StreakBadge, FeedbackPressable } from "@components/index";
import { ScenarioStorefrontCard } from "@components/scenario";
import { StreakDetailModal } from "@components/StreakDetailModal";
import { triggerTapFeedback } from "@services/gameFeedback";
import { XPBar } from "@components/XPBar";
import { AvatarByCharacter } from "@components/Avatars";
import { CharacterNameText } from "@shared/components/CharacterNameText";
import { getSeasonPassLevel } from "@utils/seasonPassHelper";
import { WORLD_EVENTS_POOL } from "@engine/worldEngine";
import { CHALLENGES, getChallengeProgress } from "@engine/challengeEngine";
import { MYSTERY_SEGMENTS } from "@store/slices/progressionSlice";
import { formatCurrency } from "@utils/currency";
import { ContextualTutorial } from "@shared/components/ContextualTutorial";
import { SEASON_PASS_TIERS } from "@data/gameData";
import { SCENARIOS } from "@data/scenarios";
import { DynastyProgressCard } from "@features/retention/DynastyProgressCard";
import { LegacyNudgeCard } from "@features/retention/LegacyNudgeCard";
import {
  DAILY_GAMEPLAY_COIN_CAP,
  getGameplayCoinsEarnedToday,
} from "@engine/economyCapEngine";
import { useHomeHub } from "@features/life/hooks/useHomeHub";
import { MetaProgressHelpSheet } from "@shared/components/MetaProgressHelpSheet";
import { getCurrentSeason } from "@engine/liveOpsEngine";
import { useScreenA11yFocus } from "@hooks/useScreenA11yFocus";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getMidnightCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HomeScreen() {
  const { colors, fonts, spacing, radii, scaledFonts } = useTheme();
  const { isTablet, contentMaxWidth } = useBreakpoints();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const {
    character,
    dailyQuests,
    loadDailyQuests,
    claimQuestReward,
    getLoginRewardState,
    claimLoginReward,
    canSpinMysteryBox,
    canSpinMysteryBoxWithTicket,
    purchaseStreakShield,
  } = useHomeHub();

  const showToast = useToastStore((s) => s.showToast);
  const headingRef = useRef<View>(null);
  useScreenA11yFocus(headingRef);

  const mysteryTickets = character?.mysteryTickets ?? 0;
  const coinsEarnedToday = character
    ? getGameplayCoinsEarnedToday(character)
    : 0;
  const atDailyCoinCap = coinsEarnedToday >= DAILY_GAMEPLAY_COIN_CAP;

  const [countdown, setCountdown] = useState(getMidnightCountdown);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [metaHelpOpen, setMetaHelpOpen] = useState(false);
  const liveSeason = getCurrentSeason();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadDailyQuests();
  }, [loadDailyQuests]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(getMidnightCountdown());
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!character) {
    return (
      <ScreenShell>
        <View style={[styles.empty, { backgroundColor: colors.bg }]}>
          <Text style={[styles.emptyText, { color: colors.t3, fontFamily: fonts.body }]}>
            No active character. Create one to begin your quest!
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const { level, currentXp, maxXp } = getSeasonPassLevel(character.seasonXp ?? 0);

  const { day: rewardDay, claimed: rewardClaimed } = getLoginRewardState();
  const mysterySpinAvailable = canSpinMysteryBox();
  const mysteryTicketSpinAvailable = canSpinMysteryBoxWithTicket();

  const doneQuests = dailyQuests.filter((q) => q.progress >= q.target).length;

  const activeEventIds = character.activeWorldEvents ?? [];
  const activeEvent = activeEventIds.length > 0
    ? WORLD_EVENTS_POOL.find((e) => e.id === activeEventIds[0])
    : undefined;

  const activeChallengeId = character.activeChallengeId as string | undefined;
  const activeChallenge = activeChallengeId ? CHALLENGES[activeChallengeId as keyof typeof CHALLENGES] : undefined;
  const activeChallengeTitle = activeChallenge
    ? activeChallenge.title
    : "No active challenge — browse catalog";
  const challengeProgress = character ? getChallengeProgress(character) : null;
  const nextSeasonTier = character
    ? SEASON_PASS_TIERS.find((t) => (character.seasonXp ?? 0) < t.xpRequired)
    : undefined;

  const handleClaimLoginReward = () => {
    if (rewardClaimed) {
      navigation.navigate("DailyRewards" as never);
      return;
    }
    const result = claimLoginReward();
    showToast(result.message, result.ok ? "success" : "error");
  };

  const handleBuyStreakShield = () => {
    const result = purchaseStreakShield();
    showToast(result.message, result.ok ? "success" : "error");
  };

  const handleClaimQuest = (questId: string) => {
    const res = claimQuestReward(questId);
    showToast(res.message, res.ok ? "success" : "error");
  };

  const scenarioData =
    SCENARIOS.find((s) => s.id === (character.scenarioId ?? 'classic')) ?? SCENARIOS[0];

  const headerStrip = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.avatarRing, { borderColor: colors.gold, backgroundColor: colors.bgCard }]}>
          <AvatarByCharacter character={character} size={50} clipCircular />
        </View>
        <View style={styles.profileText} ref={headingRef} accessible accessibilityRole="header">
          <Text style={[styles.welcome, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.md }]}>
            {getTimeGreeting()},
          </Text>
          <CharacterNameText
            name={character.name}
            style={[styles.name, { fontSize: scaledFonts.lg }]}
          />
          <Text style={[styles.subText, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.md }]} numberOfLines={1} ellipsizeMode="tail">
            Age {character.age} · {character.countryFlag} {character.country}
          </Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <StreakBadge
          count={character.dailyStreak ?? 0}
          shieldCount={character.streakShieldCount ?? 0}
          showMilestoneProgress
          onPress={() => {
            triggerTapFeedback();
            setStreakModalOpen(true);
          }}
        />
      </View>
    </View>
  );

  const scenarioBanner = (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <ScenarioStorefrontCard
        scenarioId={scenarioData.id}
        name={scenarioData.name}
        tagline={scenarioData.tagline}
        description={scenarioData.description}
        owned
        isPremium={scenarioData.isPremium}
        variant="editorial"
        artSize="compact"
        onPress={() =>
          navigation.navigate("ScenarioDetail", { scenarioId: scenarioData.id })
        }
      />
    </View>
  );

  const currencyStrip = (
    <GlassCard style={styles.currencyCard}>
      <View style={styles.currencyCol}>
        <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.xs }]}>COINS</Text>
        <Text style={[styles.currencyVal, { color: colors.emerald2, fontFamily: fonts.monoSemiBold, fontSize: scaledFonts.lg }]}>
          🪙 {character.coins.toLocaleString()}
        </Text>
      </View>
      <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />
      <View style={styles.currencyCol}>
        <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.xs }]}>GEMS</Text>
        <Text style={[styles.currencyVal, { color: colors.gold, fontFamily: fonts.monoSemiBold, fontSize: scaledFonts.lg }]}>
          💎 {character.gems.toLocaleString()}
        </Text>
      </View>
    </GlassCard>
  );

  const worldEventBanner = activeEventIds.length > 0 && activeEvent ? (
    <FeedbackPressable
      onPress={() => navigation.navigate("WorldEvents")}
      style={[styles.worldEventCard, { backgroundColor: `${colors.health}12`, borderColor: colors.health, borderRadius: radii.md }]}
    >
      <View style={styles.worldEventHeader}>
        <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.bodyBold, fontSize: scaledFonts.base }]}>
          {activeEvent.title}
        </Text>
        <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.body, fontSize: scaledFonts.sm }]}>
          {activeEventIds.length} active · Tap to view
        </Text>
      </View>
      <Text style={[styles.worldEventDesc, { color: colors.t2, fontFamily: fonts.body, fontSize: scaledFonts.md }]} numberOfLines={2}>
        {activeEvent.description}
      </Text>
    </FeedbackPressable>
  ) : null;

  const seasonPassCard = (
    <Card style={styles.sectionCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.lg }]}>
          Season Pass Progression
        </Text>
        <View style={[styles.tag, { backgroundColor: `${colors.teal}15` }]}>
          <Text style={[styles.tagText, { color: colors.teal, fontFamily: fonts.bodyBold, fontSize: scaledFonts.xs }]}>
            {character.hasSeasonPass ? "PLUS ACTIVE" : "FREE TIER"}
          </Text>
        </View>
      </View>
      <XPBar level={level} currentXp={currentXp} maxXp={maxXp} />
      {nextSeasonTier ? (
        <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm, marginBottom: spacing.sm }}>
          Next tier: +{nextSeasonTier.rewardCoins ?? 0} coins{nextSeasonTier.rewardGems ? `, ${nextSeasonTier.rewardGems} gems` : ""} · Luck boosts improve event outcomes
        </Text>
      ) : null}
      <FeedbackPressable
        onPress={() => navigation.navigate("Shop")}
        style={[styles.buyPassBtn, {
          backgroundColor: character.hasSeasonPass ? `${colors.teal}18` : colors.gold,
          borderRadius: radii.sm,
          borderWidth: character.hasSeasonPass ? 1 : 0,
          borderColor: `${colors.teal}40`,
        }]}
      >
        <Text style={[styles.buyPassText, {
          color: character.hasSeasonPass ? colors.teal : colors.bgCard,
          fontFamily: fonts.bodyBold,
          fontSize: scaledFonts.md,
        }]}>
          {character.hasSeasonPass ? "Visit Life Store" : "Unlock Premium Pass"}
        </Text>
      </FeedbackPressable>
    </Card>
  );

  const dynastyCards = (
    <View style={{ paddingHorizontal: 0 }}>
      <DynastyProgressCard />
      <LegacyNudgeCard />
    </View>
  );

  const metaHubCards = (
    <>
      <FeedbackPressable onPress={() => setMetaHelpOpen(true)}>
        <Card style={styles.sectionCard}>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.base }}>How Meta Progress Works</Text>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm, marginTop: 4 }}>
            Dynasty heirs, season pass XP, daily quests, and live ops seasons
          </Text>
        </Card>
      </FeedbackPressable>
      <FeedbackPressable onPress={() => navigation.navigate("LiveOps")}>
        <Card style={styles.sectionCard}>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.base }}>Live Season · {liveSeason.title}</Text>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm, marginTop: 4 }}>
            {liveSeason.description}
          </Text>
        </Card>
      </FeedbackPressable>
      <FeedbackPressable onPress={() => navigation.navigate("Leaderboard")}>
        <Card style={styles.sectionCard}>
          <Text style={{ color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.base }}>Global Leaderboard</Text>
          <Text style={{ color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm, marginTop: 4 }}>
            Compare your best life scores · filter by country
          </Text>
        </Card>
      </FeedbackPressable>
    </>
  );

  const dailyRewardsCard = (
    <FeedbackPressable
      onPress={handleClaimLoginReward}
      accessibilityLabel={rewardClaimed ? "View daily rewards, already claimed" : `Claim day ${rewardDay} daily login reward`}
    >
      <Card style={styles.sectionCard}>
        <View style={styles.dailyBonusContent}>
          <View style={[styles.giftBox, { backgroundColor: rewardClaimed ? colors.bg2 : `${colors.gold}15` }]}>
            <Text style={{ fontSize: 28 }}>🎁</Text>
          </View>
          <View style={styles.dailyBonusTextCol}>
            <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: scaledFonts.base }]}>
              {rewardClaimed ? "Day Claimed!" : `Day ${rewardDay} reward ready`}
            </Text>
            <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm }]}>
              {rewardClaimed
                ? `Resets in ${countdown}`
                : "Tap to claim your 30-day login reward."}
            </Text>
          </View>
          <View style={[styles.claimBonusBtn, {
            backgroundColor: rewardClaimed ? colors.bg2 : colors.gold,
            borderRadius: radii.sm,
          }]}>
            <Text style={[styles.claimBonusText, {
              color: rewardClaimed ? colors.t4 : "#FFFFFF",
              fontFamily: fonts.bodyBold,
              fontSize: scaledFonts.md,
            }]}>
              {rewardClaimed ? "Claimed" : "Claim"}
            </Text>
          </View>
        </View>
      </Card>
    </FeedbackPressable>
  );

  const mysteryBoxCard = (
    <FeedbackPressable
      onPress={() => navigation.navigate("MysteryBox" as never)}
      accessibilityLabel="Open weekly mystery box"
    >
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.lg }]}>
            Weekly Mystery Box
          </Text>
          {mysteryTickets > 0 ? (
            <View style={[styles.tag, { backgroundColor: `${colors.orchid}15` }]}>
              <Text style={[styles.tagText, { color: colors.orchid, fontFamily: fonts.bodyBold, fontSize: scaledFonts.xs }]}>
                {mysteryTickets} ticket{mysteryTickets === 1 ? "" : "s"}
              </Text>
            </View>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
          {MYSTERY_SEGMENTS.slice(0, 6).map((seg, idx) => (
            <View key={idx} style={[styles.giftBox, { backgroundColor: `${colors.orchid}12`, width: 56, height: 56, alignItems: "center", justifyContent: "center" }]}>
              <Text style={{ fontSize: 22 }}>{seg.type === "gems" ? "💎" : seg.type === "coins" ? "🪙" : seg.type === "luck" ? "🍀" : "🎁"}</Text>
              <Text style={{ color: colors.t4, fontFamily: fonts.mono, fontSize: 7, marginTop: 2, textAlign: 'center' }} numberOfLines={2}>{seg.label.length > 12 ? seg.label.slice(0, 11) + '…' : seg.label}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm, marginTop: spacing.xs }]}>
          {mysterySpinAvailable
            ? "Free weekly spin ready — tap to open the wheel!"
            : mysteryTicketSpinAvailable
              ? "Use a ticket to spin again."
              : "Preview rewards above · full spin on Mystery Box screen."}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: spacing.sm }}>
          <View style={[styles.claimBonusBtn, {
            backgroundColor: mysterySpinAvailable || mysteryTicketSpinAvailable ? colors.orchid : `${colors.orchid}12`,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          }]}>
            <Text style={[styles.claimBonusText, {
              color: mysterySpinAvailable || mysteryTicketSpinAvailable ? "#FFFFFF" : colors.orchid,
              fontFamily: fonts.bodyBold,
              fontSize: scaledFonts.md,
            }]}>
              {mysterySpinAvailable ? "Spin" : mysteryTicketSpinAvailable ? "Use Ticket" : "Open"}
            </Text>
          </View>
        </View>
      </Card>
    </FeedbackPressable>
  );

  const challengesCard = (
    <FeedbackPressable onPress={() => navigation.navigate("ChallengeMode" as never)}>
      <Card style={styles.sectionCard}>
        <View style={styles.dailyBonusContent}>
          <View style={[styles.giftBox, { backgroundColor: `${colors.catCareer}12` }]}>
            <Text style={{ fontSize: 28 }}>⚔️</Text>
          </View>
          <View style={styles.dailyBonusTextCol}>
            <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: scaledFonts.base }]}>
              Challenges
            </Text>
            <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm }]}>
              {activeChallengeTitle}
              {challengeProgress ? ` · ${challengeProgress.progressPct}% (${formatCurrency(challengeProgress.current, character.countryCode)} / ${formatCurrency(challengeProgress.target, character.countryCode)})` : ""}
            </Text>
          </View>
          <View style={[styles.claimBonusBtn, { backgroundColor: `${colors.catCareer}12`, borderRadius: radii.sm }]}>
            <Text style={[styles.claimBonusText, { color: colors.catCareer, fontFamily: fonts.bodyBold, fontSize: scaledFonts.md }]}>
              View
            </Text>
          </View>
        </View>
      </Card>
    </FeedbackPressable>
  );

  const dailyQuestsCard = (
    <Card style={styles.sectionCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold, fontSize: scaledFonts.lg }]}>
          Daily Quests
        </Text>
        {dailyQuests.length > 0 && (
          <Text style={[styles.tagText, { color: colors.t3, fontFamily: fonts.mono, fontSize: scaledFonts.xs }]}>
            {doneQuests}/{dailyQuests.length} done
          </Text>
        )}
      </View>
      <Text style={[styles.dailyEarnCap, { color: atDailyCoinCap ? colors.gold : colors.t3, fontFamily: fonts.mono, fontSize: scaledFonts.sm }]}>
        Daily earn: {coinsEarnedToday.toLocaleString()} / {DAILY_GAMEPLAY_COIN_CAP.toLocaleString()}
        {atDailyCoinCap ? ' · Resets tomorrow' : ''}
      </Text>
      <View style={styles.questsList}>
        {dailyQuests.length === 0 ? (
          <Text style={[styles.noQuests, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.md }]}>
            No quests active. Check back later or age up!
          </Text>
        ) : (
          dailyQuests.map((quest) => {
            const isComplete = quest.progress >= quest.target;
            return (
              <View
                key={quest.id}
                style={[
                  styles.questRow,
                  { borderColor: colors.border },
                ]}
              >
                <View style={styles.questInfo}>
                  <Text style={[styles.questTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold, fontSize: scaledFonts.base }]}>
                    {quest.title}
                  </Text>
                  <Text style={[styles.questDesc, { color: colors.t3, fontFamily: fonts.body, fontSize: scaledFonts.sm }]}>
                    {quest.description}
                  </Text>
                  <View style={styles.questProgressContainer}>
                    <View style={[styles.progressTrack, { backgroundColor: colors.bg2, borderRadius: radii.full }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: isComplete ? colors.emerald : colors.sapphire,
                            borderRadius: radii.full,
                            width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.t2, fontFamily: fonts.mono, fontSize: scaledFonts.sm }]}>
                      {quest.progress}/{quest.target}
                    </Text>
                  </View>
                </View>
                <View style={styles.questAction}>
                  <Text style={[styles.questReward, { color: colors.emerald2, fontFamily: fonts.monoSemiBold, fontSize: scaledFonts.sm }]}>
                    🪙 {quest.rewardCoins}
                  </Text>
                      <FeedbackPressable
                        onPress={() => handleClaimQuest(quest.id)}
                        disabled={!isComplete || quest.claimed}
                        accessibilityLabel={
                          quest.claimed
                            ? `Quest ${quest.title}, already claimed`
                            : isComplete
                            ? `Claim reward for quest ${quest.title}`
                            : `Quest ${quest.title}, not complete`
                        }
                        style={[
                      styles.questBtn,
                      {
                        backgroundColor: quest.claimed
                          ? colors.bg2
                          : isComplete
                          ? colors.emerald
                          : colors.bg2,
                        borderRadius: radii.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.questBtnText,
                        {
                          color: quest.claimed
                            ? colors.t4
                            : isComplete
                            ? "#FFFFFF"
                            : colors.t4,
                          fontFamily: fonts.bodyBold,
                          fontSize: scaledFonts.sm,
                        },
                      ]}
                    >
                      {quest.claimed ? "Claimed" : isComplete ? "Claim" : "Locked"}
                    </Text>
                  </FeedbackPressable>
                </View>
              </View>
            );
          })
        )}
      </View>
    </Card>
  );

  const phoneFeed = (
    <>
      {headerStrip}
      {scenarioBanner}
      {currencyStrip}
      {worldEventBanner}
      {seasonPassCard}
      {dynastyCards}
      {metaHubCards}
      {dailyRewardsCard}
      {mysteryBoxCard}
      {challengesCard}
      {dailyQuestsCard}
    </>
  );

  const tabletFeed = (
    <View style={styles.tabletRow}>
      <View style={styles.tabletCol}>
        {headerStrip}
        {scenarioBanner}
        {currencyStrip}
        {seasonPassCard}
        {dynastyCards}
        {metaHubCards}
      </View>
      <View style={styles.tabletCol}>
        {worldEventBanner}
        {dailyRewardsCard}
        {mysteryBoxCard}
        {challengesCard}
        {dailyQuestsCard}
      </View>
    </View>
  );

  return (
    <>
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: spacing.xxl },
          contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } : null,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isTablet ? tabletFeed : phoneFeed}
      </ScrollView>
    </ScreenShell>
    <StreakDetailModal
      visible={streakModalOpen}
      onClose={() => setStreakModalOpen(false)}
      streak={character.dailyStreak ?? 0}
      shieldCount={character.streakShieldCount ?? 0}
      claimedMilestones={character.claimedStreakMilestones ?? []}
      gemBalance={character.gems}
      onBuyShield={handleBuyStreakShield}
    />
    <ContextualTutorial screenId="home" />
    <MetaProgressHelpSheet visible={metaHelpOpen} onClose={() => setMetaHelpOpen(false)} />
  </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    gap: 16,
  },
  tabletRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  tabletCol: {
    flex: 1,
    gap: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    padding: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    gap: 2,
  },
  welcome: {
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    lineHeight: 22,
  },
  subText: {
    fontSize: 11,
  },
  headerRight: {},
  currencyCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  currencyCol: {
    alignItems: "center",
    flex: 1,
  },
  currencyLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  currencyVal: {
    fontSize: 16,
  },
  currencyDivider: {
    width: 1,
    height: 30,
  },
  worldEventCard: {
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  worldEventHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  worldEventTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  worldEventDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  buyPassBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buyPassText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  dailyBonusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  giftBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyBonusTextCol: {
    flex: 1,
    gap: 2,
  },
  bonusTitle: {
    fontSize: 14,
  },
  bonusDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  claimBonusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  claimBonusText: {
    fontSize: 12,
  },
  questsList: {
    gap: 12,
  },
  dailyEarnCap: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  noQuests: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  questRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  questInfo: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  questTitle: {
    fontSize: 13,
  },
  questDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  questProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 10,
    minWidth: 32,
    textAlign: "right",
  },
  questAction: {
    alignItems: "center",
    gap: 6,
  },
  questReward: {
    fontSize: 12,
  },
  questBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
    alignItems: "center",
  },
  questBtnText: {
    fontSize: 11,
  },
});
