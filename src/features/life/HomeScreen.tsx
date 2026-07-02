import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useToastStore } from "@store/toastStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGameStore } from "@store/gameStore";
import { useTheme } from "@theme";
import { GlassCard, ScreenShell, Card, StreakBadge, ScenarioBanner, FeedbackPressable } from "@components/index";
import { StreakDetailModal } from "@components/StreakDetailModal";
import { triggerTapFeedback } from "@services/gameFeedback";
import { XPBar } from "@components/XPBar";
import { AvatarByCharacter } from "@components/Avatars";
import { CharacterNameText } from "@shared/components/CharacterNameText";
import { getSeasonPassLevel } from "@utils/seasonPassHelper";
import { WORLD_EVENTS_POOL } from "@engine/worldEngine";
import { CHALLENGES } from "@engine/challengeEngine";
import { SCENARIOS } from "@data/scenarios";
import { DynastyProgressCard } from "@features/retention/DynastyProgressCard";
import { LegacyNudgeCard } from "@features/retention/LegacyNudgeCard";
import {
  DAILY_GAMEPLAY_COIN_CAP,
  getGameplayCoinsEarnedToday,
} from "@engine/economyCapEngine";

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
  const { colors, fonts, spacing, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const character = useGameStore((s) => s.character);
  const dailyQuests = useGameStore((s) => s.dailyQuests);
  const loadDailyQuests = useGameStore((s) => s.loadDailyQuests);
  const claimQuestReward = useGameStore((s) => s.claimQuestReward);
  const getLoginRewardState = useGameStore((s) => s.getLoginRewardState);
  const claimLoginReward = useGameStore((s) => s.claimLoginReward);
  const canSpinMysteryBox = useGameStore((s) => s.canSpinMysteryBox);
  const canSpinMysteryBoxWithTicket = useGameStore((s) => s.canSpinMysteryBoxWithTicket);
  const mysteryTickets = useGameStore((s) => s.character?.mysteryTickets ?? 0);
  const coinsEarnedToday = character
    ? getGameplayCoinsEarnedToday(character)
    : 0;
  const atDailyCoinCap = coinsEarnedToday >= DAILY_GAMEPLAY_COIN_CAP;
  const purchaseStreakShield = useGameStore((s) => s.purchaseStreakShield);

  const showToast = useToastStore((s) => s.showToast);

  const [countdown, setCountdown] = useState(getMidnightCountdown);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
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

  return (
    <>
    <ScreenShell>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Strip */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarRing, { borderColor: colors.gold, backgroundColor: colors.bgCard }]}>
              <AvatarByCharacter character={character} size={50} clipCircular />
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.welcome, { color: colors.t3, fontFamily: fonts.body }]}>
                {getTimeGreeting()},
              </Text>
              <CharacterNameText
                name={character.name}
                style={[styles.name, { fontFamily: fonts.bodyBold }]}
              />
              <Text style={[styles.subText, { color: colors.t3, fontFamily: fonts.body }]} numberOfLines={1} ellipsizeMode="tail">
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

        {(() => {
          const scenarioData =
            SCENARIOS.find((s) => s.id === (character.scenarioId ?? 'classic')) ?? SCENARIOS[0];
          return (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <ScenarioBanner
                type={scenarioData.id}
                scenarioName={scenarioData.name}
                description={scenarioData.tagline}
              />
            </View>
          );
        })()}

        {/* Currency summary strip */}
        <GlassCard style={styles.currencyCard}>
          <View style={styles.currencyCol}>
            <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body }]}>COINS</Text>
            <Text style={[styles.currencyVal, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
              🪙 {character.coins.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.currencyDivider, { backgroundColor: colors.border }]} />
          <View style={styles.currencyCol}>
            <Text style={[styles.currencyLabel, { color: colors.t3, fontFamily: fonts.body }]}>GEMS</Text>
            <Text style={[styles.currencyVal, { color: colors.gold, fontFamily: fonts.monoSemiBold }]}>
              💎 {character.gems.toLocaleString()}
            </Text>
          </View>
        </GlassCard>

        {/* Active World Event Banner */}
        {activeEventIds.length > 0 && activeEvent && (
          <FeedbackPressable
            onPress={() => navigation.navigate("WorldEvents")}
            style={[styles.worldEventCard, { backgroundColor: `${colors.health}12`, borderColor: colors.health, borderRadius: radii.md }]}
          >
            <View style={styles.worldEventHeader}>
              <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.bodyBold }]}>
                {activeEvent.title}
              </Text>
              <Text style={[styles.worldEventTitle, { color: colors.health, fontFamily: fonts.body, fontSize: 11 }]}>
                {activeEventIds.length} active · Tap to view
              </Text>
            </View>
            <Text style={[styles.worldEventDesc, { color: colors.t2, fontFamily: fonts.body }]} numberOfLines={2}>
              {activeEvent.description}
            </Text>
          </FeedbackPressable>
        )}

        {/* Season Pass Progress Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Season Pass Progression
            </Text>
            <View style={[styles.tag, { backgroundColor: `${colors.teal}15` }]}>
              <Text style={[styles.tagText, { color: colors.teal, fontFamily: fonts.bodyBold }]}>
                {character.hasSeasonPass ? "PLUS ACTIVE" : "FREE TIER"}
              </Text>
            </View>
          </View>
          <XPBar level={level} currentXp={currentXp} maxXp={maxXp} />
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
            }]}>
              {character.hasSeasonPass ? "Visit Life Store" : "Unlock Premium Pass"}
            </Text>
          </FeedbackPressable>
        </Card>

        {/* Dynasty Legacy Progress Card */}
        <View style={{ paddingHorizontal: 0 }}>
          <DynastyProgressCard />
          <LegacyNudgeCard />
        </View>

        {/* Daily Rewards Summary Card */}
        <FeedbackPressable onPress={handleClaimLoginReward}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: rewardClaimed ? colors.bg2 : `${colors.gold}15` }]}>
                <Text style={{ fontSize: 28 }}>🎁</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  {rewardClaimed ? "Day Claimed!" : `Day ${rewardDay} reward ready`}
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
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
                }]}>
                  {rewardClaimed ? "Claimed" : "Claim"}
                </Text>
              </View>
            </View>
          </Card>
        </FeedbackPressable>

        {/* Mystery Box summary card */}
        <FeedbackPressable onPress={() => navigation.navigate("MysteryBox" as never)}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: `${colors.orchid}12` }]}>
                <Text style={{ fontSize: 28 }}>🎲</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  Weekly Mystery Box
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {mysterySpinAvailable
                    ? "Free weekly spin available!"
                    : mysteryTicketSpinAvailable
                      ? `${mysteryTickets} ticket${mysteryTickets === 1 ? "" : "s"} ready to spin.`
                      : mysteryTickets > 0
                        ? `Free spin used · ${mysteryTickets} ticket${mysteryTickets === 1 ? "" : "s"} left`
                        : "Free spin used this week — check back soon."}
                </Text>
              </View>
              <View style={[styles.claimBonusBtn, {
                backgroundColor: mysterySpinAvailable || mysteryTicketSpinAvailable ? colors.orchid : `${colors.orchid}12`,
                borderRadius: radii.sm,
              }]}>
                <Text style={[styles.claimBonusText, {
                  color: mysterySpinAvailable || mysteryTicketSpinAvailable ? "#FFFFFF" : colors.orchid,
                  fontFamily: fonts.bodyBold,
                }]}>
                  {mysterySpinAvailable ? "Spin" : mysteryTicketSpinAvailable ? "Use Ticket" : "View"}
                </Text>
              </View>
            </View>
          </Card>
        </FeedbackPressable>

        {/* Challenges Card */}
        <FeedbackPressable onPress={() => navigation.navigate("ChallengeMode" as never)}>
          <Card style={styles.sectionCard}>
            <View style={styles.dailyBonusContent}>
              <View style={[styles.giftBox, { backgroundColor: `${colors.catCareer}12` }]}>
                <Text style={{ fontSize: 28 }}>⚔️</Text>
              </View>
              <View style={styles.dailyBonusTextCol}>
                <Text style={[styles.bonusTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                  Challenges
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.t3, fontFamily: fonts.body }]}>
                  {activeChallengeTitle}
                </Text>
              </View>
              <View style={[styles.claimBonusBtn, { backgroundColor: `${colors.catCareer}12`, borderRadius: radii.sm }]}>
                <Text style={[styles.claimBonusText, { color: colors.catCareer, fontFamily: fonts.bodyBold }]}>
                  View
                </Text>
              </View>
            </View>
          </Card>
        </FeedbackPressable>

        {/* Daily Quests Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.t1, fontFamily: fonts.bodyBold }]}>
              Daily Quests
            </Text>
            {dailyQuests.length > 0 && (
              <Text style={[styles.tagText, { color: colors.t3, fontFamily: fonts.mono }]}>
                {doneQuests}/{dailyQuests.length} done
              </Text>
            )}
          </View>
          <Text style={[styles.dailyEarnCap, { color: atDailyCoinCap ? colors.gold : colors.t3, fontFamily: fonts.mono }]}>
            Daily earn: {coinsEarnedToday.toLocaleString()} / {DAILY_GAMEPLAY_COIN_CAP.toLocaleString()}
            {atDailyCoinCap ? ' · Resets tomorrow' : ''}
          </Text>
          <View style={styles.questsList}>
            {dailyQuests.length === 0 ? (
              <Text style={[styles.noQuests, { color: colors.t3, fontFamily: fonts.body }]}>
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
                      <Text style={[styles.questTitle, { color: colors.t1, fontFamily: fonts.bodySemiBold }]}>
                        {quest.title}
                      </Text>
                      <Text style={[styles.questDesc, { color: colors.t3, fontFamily: fonts.body }]}>
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
                        <Text style={[styles.progressText, { color: colors.t2, fontFamily: fonts.mono }]}>
                          {quest.progress}/{quest.target}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.questAction}>
                      <Text style={[styles.questReward, { color: colors.emerald2, fontFamily: fonts.monoSemiBold }]}>
                        🪙 {quest.rewardCoins}
                      </Text>
                      <FeedbackPressable
                        onPress={() => handleClaimQuest(quest.id)}
                        disabled={!isComplete || quest.claimed}
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
  </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
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
